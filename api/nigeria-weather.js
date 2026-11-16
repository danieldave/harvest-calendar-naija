/* =====================================================================
   api/nigeria-weather.js  -  WEATHER FOR ALL OF NIGERIA (runs on the server)
   One request asks Open-Meteo.com (free, no key) for the next 7 days at
   the capital of every state, and sends back a small tidy list.
       GET /api/nigeria-weather
   The answer is kept for 3 hours, so many visitors cost one request.
   ===================================================================== */
'use strict';
const { STATES } = require('../js/data.js');

// Open-Meteo weather codes -> a picture and a few words
function sky(code) {
  if (code === 0) return ['☀️', 'Clear sky'];
  if (code <= 2) return ['🌤️', 'Partly cloudy'];
  if (code === 3) return ['☁️', 'Cloudy'];
  if (code <= 48) return ['🌫️', 'Haze or fog'];
  if (code <= 57) return ['🌦️', 'Drizzle'];
  if (code <= 67) return ['🌧️', 'Rain'];
  if (code <= 82) return ['🌧️', 'Rain showers'];
  if (code <= 99) return ['⛈️', 'Thunderstorm'];
  return ['🌡️', 'Weather'];
}
function url() {
  return 'https://api.open-meteo.com/v1/forecast?latitude=' + STATES.map(s => s.lat).join(',') + '&longitude=' + STATES.map(s => s.lon).join(',') +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&forecast_days=7&timezone=Africa%2FLagos';
}
function tidy(raw) {
  const list = Array.isArray(raw) ? raw : [raw];
  return STATES.map((s, i) => {
    const d = (list[i] && list[i].daily) || {};
    const days = (d.time || []).map((date, k) => {
      const [icon, words] = sky(Number(d.weather_code && d.weather_code[k]));
      return { date, icon, words, max: Math.round(d.temperature_2m_max[k]), min: Math.round(d.temperature_2m_min[k]),
        rain: Math.round((d.precipitation_sum[k] || 0) * 10) / 10, chance: d.precipitation_probability_max ? d.precipitation_probability_max[k] : null };
    });
    return { id: s.id, state: s.n, place: s.cap, zone: s.z, days, weekRain: Math.round(days.reduce((t, x) => t + x.rain, 0)) };
  }).filter(s => s.days.length);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Send a GET request.' });
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url(), { signal: ctrl.signal });
    if (!r.ok) throw new Error('Open-Meteo said ' + r.status);
    const states = tidy(await r.json());
    if (!states.length) throw new Error('empty answer');
    res.setHeader('Cache-Control', 'public, s-maxage=10800, stale-while-revalidate=86400');
    return res.status(200).json({ states, source: 'Open-Meteo.com', updated: new Date().toISOString() });
  } catch (e) {
    console.error('nigeria-weather failed:', e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Weather is not available right now. Please try again soon.' });
  } finally { clearTimeout(timer); }
};
module.exports.tidy = tidy; module.exports.sky = sky;
