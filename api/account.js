/* =====================================================================
   api/account.js  -  MY FARM ACCOUNTS (runs on the server)
   ---------------------------------------------------------------------
   A quick account: a USERNAME and a 4-DIGIT PIN. No email, no phone,
   no real name. The account remembers the crops and states you looked
   up, so your "My Farm" page is the same on any phone.

   SAFETY RULES
   - The PIN is never stored. We store a scrambled version (scrypt) that
     cannot be turned back into the PIN.
   - A forgotten PIN cannot be recovered. (There is no email to send it to.)
   - 5 wrong PINs lock that username for 15 minutes, so nobody can guess
     all 10,000 PINs.
   - Signing in gives the phone a long random token that lasts 30 days.
   - History keeps the newest 50 look-ups. Only crop and state names from
     our own lists are accepted: no free text is stored.
   - Needs the Upstash database. Without it the page says "not switched on".

   POST { action, ... }   actions: register, login, me, save, setState, clear, logout, delete
   ===================================================================== */
'use strict';
const crypto = require('crypto');
const S = require('./_lib/shared');
const { STATES, CROPS } = require('../js/data.js');
CROPS.forEach(c => { if (!c.id) c.id = c.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); });

const DAY = 86400, TOKEN_DAYS = 30, MAX_HISTORY = 50, LOCK_AFTER = 5, LOCK_SECONDS = 900;
const BLOCKED = ['admin', 'support', 'official', 'harvest', 'moderator', 'bytebusters', 'fuck', 'shit', 'sex', 'nigga', 'bitch'];
const DB_URL = () => (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
const DB_TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
async function db(commands) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(DB_URL() + '/pipeline', { method: 'POST', signal: ctrl.signal,
      headers: { Authorization: 'Bearer ' + DB_TOKEN(), 'Content-Type': 'application/json' }, body: JSON.stringify(commands) });
    if (!r.ok) throw new Error('The database said ' + r.status);
    return r.json();
  } finally { clearTimeout(timer); }
}
const toObject = arr => { const o = {}; for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; };
const hits = new Map();
function allowed(key, max) {
  const now = Date.now(), h = (hits.get(key) || []).filter(t => now - t < 3600000);
  if (h.length >= max) { hits.set(key, h); return false; }
  h.push(now); hits.set(key, h); if (hits.size > 5000) hits.clear();
  return true;
}
const who = req => String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
const scramble = (pin, salt) => crypto.scryptSync(String(pin) + (process.env.ACCOUNT_SECRET || ''), salt, 32).toString('hex');
const tokenKey = t => 'hc:tok:' + crypto.createHash('sha256').update(String(t)).digest('hex');
const cleanName = u => String(u || '').trim().toLowerCase();
const nameProblem = u => !/^[a-z0-9_]{3,20}$/.test(u) ? 'A username is 3 to 20 small letters, numbers or _ (no spaces).'
  : BLOCKED.some(b => u.includes(b)) ? 'Please choose a different username.' : '';
const pinOK = p => /^\d{4}$/.test(String(p));

async function userOf(token) {
  if (typeof token !== 'string' || token.length < 40 || token.length > 100) return null;
  const [r] = await db([['GET', tokenKey(token)]]);
  return typeof r.result === 'string' ? r.result : null;
}
async function profile(name) {
  const [u, h] = await db([['HGETALL', 'hc:u:' + name], ['LRANGE', 'hc:h:' + name, 0, MAX_HISTORY - 1]]);
  const user = toObject(u.result);
  const history = (h.result || []).map(x => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
  return { username: name, state: user.state || '', since: (user.created || '').slice(0, 10), history };
}
async function newToken(name) {
  const token = crypto.randomBytes(32).toString('hex');
  await db([['SET', tokenKey(token), name, 'EX', TOKEN_DAYS * DAY]]);
  return token;
}

module.exports = async function handler(req, res) {
  if (!S.allowOrigin(req, res)) return res.status(403).json({ error: 'This website is not allowed to use My Farm accounts.' });
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Send a POST request.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (!(DB_URL() && DB_TOKEN())) return res.status(200).json({ live: false });
  const ip = who(req);
  if (!allowed(ip + ':acct', 600)) return res.status(429).json({ error: 'Too many requests. Please wait a little.' });

  try {
    // ---- make an account ----
    if (body.action === 'register') {
      const name = cleanName(body.username), bad = nameProblem(name);
      if (bad) return res.status(400).json({ error: bad });
      if (!pinOK(body.pin)) return res.status(400).json({ error: 'A PIN is exactly 4 numbers.' });
      if (['0000', '1234', '1111'].includes(String(body.pin))) return res.status(400).json({ error: 'That PIN is too easy to guess. Choose another.' });
      if (!allowed(ip + ':register', 6)) return res.status(429).json({ error: 'Too many new accounts from here. Please try again later.' });
      const salt = crypto.randomBytes(16).toString('hex');
      const [made] = await db([['HSETNX', 'hc:u:' + name, 'salt', salt]]);
      if (!made.result) return res.status(409).json({ error: 'That username is taken. Try another.' });
      await db([['HSET', 'hc:u:' + name, 'hash', scramble(body.pin, salt), 'created', new Date().toISOString()]]);
      return res.status(200).json({ live: true, token: await newToken(name), ...(await profile(name)) });
    }

    // ---- sign in ----
    if (body.action === 'login') {
      const name = cleanName(body.username);
      if (nameProblem(name) || !pinOK(body.pin)) return res.status(400).json({ error: 'Type your username and your 4-number PIN.' });
      const [fails, u] = await db([['GET', 'hc:fail:' + name], ['HGETALL', 'hc:u:' + name]]);
      if (Number(fails.result) >= LOCK_AFTER) return res.status(429).json({ error: 'Too many wrong PINs. This username is locked for 15 minutes.' });
      const user = toObject(u.result);
      const good = user.hash && user.salt && crypto.timingSafeEqual(Buffer.from(scramble(body.pin, user.salt)), Buffer.from(user.hash));
      if (!good) {
        await db([['INCR', 'hc:fail:' + name], ['EXPIRE', 'hc:fail:' + name, LOCK_SECONDS]]);
        return res.status(401).json({ error: 'The username or PIN is not right.' });
      }
      await db([['DEL', 'hc:fail:' + name]]);
      return res.status(200).json({ live: true, token: await newToken(name), ...(await profile(name)) });
    }

    // ---- everything below needs a signed-in phone ----
    const name = await userOf(body.token);
    if (!name) return res.status(401).json({ error: 'Please sign in again.', signedOut: true });

    if (body.action === 'me') return res.status(200).json({ live: true, ...(await profile(name)) });

    if (body.action === 'save') {
      const crop = CROPS.find(c => c.id === body.crop), state = STATES.find(s => s.id === body.state);
      if (!crop && !state) return res.status(400).json({ error: 'Choose a crop or a state from the lists.' });
      const entry = { c: crop ? crop.id : '', s: state ? state.id : '', t: new Date().toISOString().slice(0, 10) };
      const [top] = await db([['LINDEX', 'hc:h:' + name, 0]]);
      let last = null; try { last = JSON.parse(top.result); } catch (e) {}
      if (last && last.c === entry.c && last.s === entry.s) return res.status(200).json({ live: true, saved: false, same: true });   // do not save the same look-up twice in a row
      await db([['LPUSH', 'hc:h:' + name, JSON.stringify(entry)], ['LTRIM', 'hc:h:' + name, 0, MAX_HISTORY - 1]]);
      return res.status(200).json({ live: true, saved: true, entry });
    }
    if (body.action === 'setState') {
      const state = STATES.find(s => s.id === body.state);
      await db([['HSET', 'hc:u:' + name, 'state', state ? state.id : '']]);
      return res.status(200).json({ live: true, state: state ? state.id : '' });
    }
    if (body.action === 'clear') { await db([['DEL', 'hc:h:' + name]]); return res.status(200).json({ live: true, cleared: true }); }
    if (body.action === 'logout') { await db([['DEL', tokenKey(body.token)]]); return res.status(200).json({ live: true, signedOut: true }); }
    if (body.action === 'delete') {
      const [u] = await db([['HGETALL', 'hc:u:' + name]]); const user = toObject(u.result);
      if (!pinOK(body.pin) || !user.hash || scramble(body.pin, user.salt) !== user.hash) return res.status(401).json({ error: 'Type your PIN to delete the account.' });
      await db([['DEL', 'hc:u:' + name, 'hc:h:' + name, tokenKey(body.token)]]);
      return res.status(200).json({ live: true, deleted: true });
    }
    return res.status(400).json({ error: 'Unknown action.' });
  } catch (e) {
    console.error('account:', e.message);
    return res.status(502).json({ error: 'My Farm could not be reached. Please try again.' });
  }
};
