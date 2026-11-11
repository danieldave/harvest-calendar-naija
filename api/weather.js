/* =====================================================================
   GET /api/weather?state=ogun   - 30 days of weather for one state
   ---------------------------------------------------------------------
   14 days of rain that already fell + 16 days of forecast, for the state
   capital, from Open-Meteo (free, no key needed, weather data CC BY 4.0).

   WHY GO THROUGH OUR OWN API?  Scaling.
   Vercel's network keeps each answer for 3 hours ("s-maxage"). So if
   10,000 farmers in Kano check today, Open-Meteo is asked only about
   8 times for Kano. Fast for farmers, polite to Open-Meteo, free for us.
   ===================================================================== */
'use strict';
const { STATES } = require('../js/data.js');
const Planting = require('../js/planting.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Send a GET request.' });
  const id = String((req.query && req.query.state) || '').toLowerCase();
  const state = STATES.find(s => s.id === id);
  if (!state) return res.status(400).json({ error: 'Unknown state. Use an id like "ogun" or "cross-river".' });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(Planting.openMeteoURL(state.lat, state.lon), { signal: ctrl.signal });
    if (!r.ok) throw new Error('Open-Meteo said ' + r.status);
    const days = Planting.fromOpenMeteo(await r.json());
    res.setHeader('Cache-Control', 'public, s-maxage=10800, stale-while-revalidate=86400');
    return res.status(200).json({ state: state.n, place: state.cap, today: Planting.PAST_DAYS, days, source: 'Open-Meteo.com', updated: new Date().toISOString() });
  } catch (e) {
    console.error('weather failed:', e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Weather is not available right now. Please try again soon.' });
  } finally {
    clearTimeout(timer);
  }
};
