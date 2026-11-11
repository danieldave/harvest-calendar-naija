#!/usr/bin/env node
/* ==========================================================================
   tools/test.js  -  checks the planting rules, the API and the SEO pages
   Run:  npm test   (or: node tools/test.js). No API key needed: we pretend
   to be OpenAI and Open-Meteo with a fake "fetch", so no money is spent.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ROOT = path.join(__dirname, '..');
let passed = 0;
const ok = (name, fn) => Promise.resolve().then(fn).then(() => { passed++; console.log('  ✓', name); });

const { CROPS, STATES } = require('../js/data.js');
const P = require('../js/planting.js');
CROPS.forEach(c => { if (!c.id) c.id = c.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); });
const crop = id => CROPS.find(c => c.id === id), state = id => STATES.find(s => s.id === id);

// Make 30 days of weather: rainPast = 14 numbers, rainNext = 16 numbers
function days(rainPast, rainNext, extra) {
  const all = rainPast.concat(rainNext);
  return all.map((r, i) => Object.assign({ date: '2026-04-' + String(i + 1).padStart(2, '0'), rain: r, prob: 80, tmax: 32, tmin: 22, soil: 0.25 }, extra && extra(i)));
}
const zeros = n => Array(n).fill(0);

function call(handler, { method = 'POST', body = {}, query = {}, origin = 'https://harvest-calendar-naija.vercel.app', ip = '1.1.1.1' } = {}) {
  return new Promise(resolve => {
    const res = { headers: {}, code: 200, setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.code = c; return this; }, json(d) { resolve({ code: this.code, data: d, headers: this.headers }); }, end() { resolve({ code: this.code }); } };
    handler({ method, body, query, headers: { origin, host: 'harvest-calendar-naija.vercel.app', 'x-forwarded-for': ip } }, res);
  });
}

(async () => {
  console.log('Planting rules (js/planting.js)');
  const april = 4;
  await ok('rains started (25 mm in 3 days) + no dry spell -> GO', () => {
    const w = P.readWeather(days(zeros(8).concat([10, 9, 8, 0, 3, 2]), [5, 0, 4, 0, 6, 0, 3, 0, 5, 0, 4, 0, 2, 0, 3, 0]), 14);
    assert.strictEqual(P.decide(crop('maize'), state('ogun'), w, april).verdict, 'go');
  });
  await ok('a 12-day dry spell ahead -> WAIT (dry spell)', () => {
    const w = P.readWeather(days(zeros(8).concat([10, 9, 8, 0, 3, 2]), [2, 0].concat(zeros(12), [4, 4])), 14);
    assert.strictEqual(P.decide(crop('maize'), state('ogun'), w, april).verdict, 'waitDry');
  });
  await ok('little rain so far, big rain coming -> GET READY', () => {
    const w = P.readWeather(days(zeros(14), [0, 0, 12, 10, 6, 2, 3, 1, 4, 2, 3, 1, 2, 3, 1, 2], () => ({ soil: 0.1 })), 14);
    assert.strictEqual(P.decide(crop('maize'), state('ogun'), w, april).verdict, 'soon');
  });
  await ok('maize in November -> not the planting season', () => {
    const w = P.readWeather(days(zeros(14), zeros(16)), 14);
    assert.strictEqual(P.decide(crop('maize'), state('ogun'), w, 11).verdict, 'offSeason');
  });
  await ok('wheat in Kano in December -> plant with irrigation', () => {
    const w = P.readWeather(days(zeros(14), zeros(16)), 14);
    assert.strictEqual(P.decide(crop('wheat'), state('kano'), w, 12).verdict, 'irrigate');
  });
  await ok('flood (60 mm in a day) is warned about', () => {
    const w = P.readWeather(days(zeros(8).concat([10, 9, 8, 0, 3, 2]), [60, 5, 4, 3, 6, 2, 3, 1, 5, 2, 4, 1, 2, 3, 3, 1]), 14);
    assert.ok(P.decide(crop('maize'), state('ogun'), w, april).reasons.some(r => r.key === 'reason.flood'));
  });
  await ok('every state has map coordinates and every crop has diseases', () => {
    STATES.forEach(s => assert.ok(typeof s.lat === 'number' && typeof s.lon === 'number', s.n));
    CROPS.forEach(c => assert.ok(c.d && c.d.length, c.n));
  });

  console.log('API (fake OpenAI and Open-Meteo)');
  let aiCalls = 0, meteoCalls = 0;
  global.fetch = async (url, opts) => {
    if (String(url).includes('open-meteo')) {
      meteoCalls++;
      const t = Array.from({ length: 30 }, (_, i) => '2026-04-' + String(i + 1).padStart(2, '0'));
      return { ok: true, json: async () => ({ daily: { time: t, precipitation_sum: t.map(() => 4), precipitation_probability_max: t.map(() => 70), temperature_2m_max: t.map(() => 31), temperature_2m_min: t.map(() => 22) }, hourly: { time: [], soil_moisture_3_to_9cm: [] } }) };
    }
    if (String(url).includes('openai.com')) {
      aiCalls++;
      const body = JSON.parse(opts.body);
      const isTranslate = /translat/i.test(body.messages[0].content);
      const reply = isTranslate
        ? { strings: Object.fromEntries(Object.keys(JSON.parse(body.messages[1].content.replace(/^[^{]*/, '').replace(/[^}]*$/, ''))).map(k => [k, 'T:' + k])) }
        : { summary: 'Looks like mosaic.', matches: [{ name: 'Cassava mosaic disease', source: 'our_list', likelihood: 'high', why: 'Yellow twisted leaves.' }, { name: 'x', source: 'weird', likelihood: 'sure', why: 'y' }], do_now: ['Pull out sick plants'], prevent: ['Use clean stems'], urgent: false, see_expert: 'If many plants are sick.' };
      return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(reply) } }] }) };
    }
    throw new Error('unexpected fetch ' + url);
  };
  delete process.env.OPENAI_API_KEY;
  const weather = require('../api/weather');
  const doctor = require('../api/doctor');
  const translate = require('../api/translate');

  await ok('weather: unknown state is refused (400)', async () => assert.strictEqual((await call(weather, { method: 'GET', query: { state: 'atlantis' } })).code, 400));
  await ok('weather: 30 days for Ogun, cached by Vercel for 3 hours', async () => {
    const r = await call(weather, { method: 'GET', query: { state: 'ogun' } });
    assert.strictEqual(r.code, 200); assert.strictEqual(r.data.days.length, 30); assert.strictEqual(r.data.today, 14);
    assert.ok(/s-maxage=10800/.test(r.headers['Cache-Control']));
  });
  await ok('doctor: without a key the AI is switched off (503)', async () => {
    assert.strictEqual((await call(doctor, { body: { crop: 'cassava', symptoms: 'yellow twisted leaves' } })).code, 503);
  });
  process.env.OPENAI_API_KEY = 'test-key';
  await ok('doctor: a strange website is blocked (403)', async () => assert.strictEqual((await call(doctor, { origin: 'https://evil.example', body: { crop: 'cassava', symptoms: 'yellow twisted leaves' } })).code, 403));
  await ok('doctor: too-short description is refused (400)', async () => assert.strictEqual((await call(doctor, { body: { crop: 'cassava', symptoms: 'sick' } })).code, 400));
  await ok('doctor: answers and cleans the AI reply', async () => {
    const r = await call(doctor, { body: { crop: 'cassava', symptoms: 'The leaves are yellow and twisted', lang: 'ha' } });
    assert.strictEqual(r.code, 200); assert.strictEqual(r.data.lang, 'ha');
    assert.strictEqual(r.data.matches[1].source, 'general', 'unknown source becomes general');
    assert.strictEqual(r.data.matches[1].likelihood, 'medium', 'unknown likelihood becomes medium');
  });
  await ok('doctor: the prompt starts from OUR disease list and bans chemical doses', () => {
    const p = doctor.systemPrompt(crop('cassava'), state('ogun'), 'Hausa');
    assert.ok(p.includes('Cassava mosaic disease')); assert.ok(/Never give pesticide doses/.test(p)); assert.ok(p.includes('Hausa'));
  });
  await ok('doctor: same question again comes from the cache', async () => {
    const before = aiCalls;
    const r = await call(doctor, { body: { crop: 'cassava', symptoms: 'The leaves are yellow and twisted', lang: 'ha' } });
    assert.ok(r.data.cached); assert.strictEqual(aiCalls, before);
  });
  await ok('doctor: photos are LOCKED until DOCTOR_PHOTOS=on (403)', async () => {
    const r = await call(doctor, { body: { crop: 'cassava', symptoms: 'The leaves are yellow and twisted', image: 'data:image/jpeg;base64,AAAA' } });
    assert.strictEqual(r.code, 403); assert.ok(r.data.photosOff);
  });
  await ok('doctor: photo check works once switched on', async () => {
    process.env.DOCTOR_PHOTOS = 'on';
    const r = await call(doctor, { ip: '2.2.2.2', body: { crop: 'cassava', symptoms: 'The leaves are yellow and twisted', image: 'data:image/jpeg;base64,AAAA' } });
    delete process.env.DOCTOR_PHOTOS;
    assert.strictEqual(r.code, 200);
  });
  await ok('translate: hand-written languages are not sent to the AI (400)', async () => {
    assert.strictEqual((await call(translate, { body: { lang: 'yo', strings: { 'nav.home': 'Home' } } })).code, 400);
  });
  await ok('translate: Tiv gets every key back', async () => {
    const r = await call(translate, { body: { lang: 'tiv', strings: { 'nav.home': 'Home', 'nav.crops': 'Crops' } } });
    assert.strictEqual(r.code, 200); assert.deepStrictEqual(Object.keys(r.data.strings).sort(), ['nav.crops', 'nav.home']);
  });

  console.log('Languages (js/i18n.js)');
  require('../js/i18n.js');
  const I = globalThis.I18N;
  await ok('17 languages: 5 hand-written, 12 AI (beta)', () => {
    assert.strictEqual(I.LANGS.length, 17);
    assert.strictEqual(I.LANGS.filter(l => l.how === 'hand').length, 5);
  });
  await ok('Hausa, Yoruba, Igbo and Pidgin have every visible word', () => {
    const keys = Object.keys(I.STRINGS.en).filter(k => k !== 'ui.aiBeta');   // the AI notice only shows for AI languages
    ['ha', 'yo', 'ig', 'pcm'].forEach(l => keys.forEach(k => assert.ok(k in I.STRINGS[l], l + ' is missing ' + k)));
  });
  await ok('every verdict and reason from the planting rules has words', () => {
    ['go', 'soon', 'wait', 'waitDry', 'irrigate', 'offSeason', 'notSuited'].forEach(v => assert.ok(I.STRINGS.en['verdict.' + v], v));
    const src = fs.readFileSync(path.join(ROOT, 'js/planting.js'), 'utf8');
    [...src.matchAll(/say\("(reason\.\w+)"/g)].forEach(m => assert.ok(I.STRINGS.en[m[1]], m[1]));
  });

  console.log('SEO / AEO / GEO pages');
  const htmls = ['index.html', 'planting.html', 'doctor.html', 'crops/index.html', 'states/index.html']
    .concat(CROPS.map(c => `crops/${c.id}/index.html`), STATES.map(s => `states/${s.id}/index.html`));
  await ok(`${htmls.length} pages: title, description, canonical, one h1, valid JSON-LD`, () => {
    htmls.forEach(f => {
      const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
      assert.ok(title.length >= 10 && title.length <= 90, f + ' title length ' + title.length);
      const desc = ((h.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '').replace(/&#39;|&amp;|&quot;/g, 'x');
      assert.ok(desc.length >= 50 && desc.length <= 165, f + ' description length ' + desc.length);
      assert.ok(/<link rel="canonical" href="https:\/\/[^"]+">/.test(h) && !h.includes('.example/'), f + ' canonical');
      assert.strictEqual((h.match(/<h1[\s>]/g) || []).length, 1, f + ' one h1');
      [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach(m => JSON.parse(m[1]));
    });
  });
  await ok('every crop and state page has a Quick answer and FAQ labels (AEO)', () => {
    htmls.filter(f => /^(crops|states)\/[^/]+\//.test(f)).forEach(f => {
      const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
      assert.ok(h.includes('class="answer-box"'), f); assert.ok(h.includes('"FAQPage"'), f);
    });
  });
  await ok('sitemap lists 132 pages; robots.txt and llms.txt agree (GEO)', () => {
    const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    assert.strictEqual((sm.match(/<url>/g) || []).length, 9 + 2 + CROPS.length + STATES.length);
    assert.ok(fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8').includes('GPTBot'));
    assert.ok(fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8').startsWith('# Harvest Calendar Naija'));
  });
  await ok('no API key is written in any website file', () => {
    ['js/app.js', 'js/features.js', 'js/config.js', 'js/i18n.js', 'index.html'].forEach(f =>
      assert.ok(!/sk-[A-Za-z0-9_-]{20,}/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), f));
  });

  console.log(`\nAll ${passed} checks passed.`);
})().catch(e => { console.error('\n  ✗ FAILED:', e.message); process.exit(1); });
