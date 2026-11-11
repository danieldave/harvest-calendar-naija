/* ==========================================================================
   HARVEST CALENDAR NAIJA – js/planting.js
   "IS IT TIME TO PLANT?"  The thinking behind the Planting Window.
   --------------------------------------------------------------------------
   We get 30 days of weather for a state capital: the last 14 days (what
   already fell) and the next 16 days (the forecast). Then we ask the same
   questions an extension officer asks:

   1. Does this crop grow in this part of Nigeria?            (zone check)
   2. Is this its planting season?                            (calendar check)
   3. Is it a dry-season crop that needs irrigation?          (fadama check)
   4. HAVE THE RAINS REALLY STARTED?  The "onset" rule used by agro-weather
      scientists in West Africa: at least 20 mm of rain within 3 days in a row.
   5. Is a long DRY SPELL coming? 10+ days with almost no rain after
      planting can kill young seedlings, so we warn about it.
   6. Is the soil moist? Is very heavy rain (flood risk) or extreme heat coming?

   This file has NO page code, so the same thinking runs in the browser and
   in tools/test.js. It returns "keys" (like "reason.onsetPast") that
   js/i18n.js turns into English, Hausa, Yoruba, Igbo, Pidgin and more.
   ========================================================================== */
(function (root) {
  "use strict";

  const ONSET_MM = 20;        // rain needed within 3 days for a real start
  const DRY_DAY_MM = 1;       // a day under 1 mm counts as dry
  const DRY_SPELL_DAYS = 10;  // this many dry days in a row is dangerous for seedlings
  const FLOOD_MM = 50;        // one day with 50 mm+ can wash seeds away
  const HOT_C = 38;           // above this, young plants suffer

  const sum = a => a.reduce((n, x) => n + (x || 0), 0);

  // Longest run of dry days in a list of daily rain amounts; returns { length, start }
  function longestDrySpell(rain) {
    let best = { length: 0, start: -1 }, run = 0;
    rain.forEach((mm, i) => {
      run = (mm || 0) < DRY_DAY_MM ? run + 1 : 0;
      if (run > best.length) best = { length: run, start: i - run + 1 };
    });
    return best;
  }

  // First index where 3 days in a row add up to 20 mm or more (or -1)
  function firstOnset(rain) {
    for (let i = 0; i + 2 < rain.length; i++) {
      if ((rain[i] || 0) + (rain[i + 1] || 0) + (rain[i + 2] || 0) >= ONSET_MM) return i;
    }
    return -1;
  }

  /* Read the weather.
     days = [{ date, rain, prob, tmax, tmin, soil }, ...], oldest first.
     today = the index of today in that list (14 when we ask for 14 past days). */
  function readWeather(days, today) {
    const past = days.slice(0, today), future = days.slice(today);
    const rainPast = past.map(d => d.rain), rainNext = future.map(d => d.rain);
    const onsetPastAt = firstOnset(rainPast.slice(-14));
    const onsetNextAt = firstOnset(rainNext.slice(0, 10));
    const dryAhead = longestDrySpell(rainNext.slice(0, 14));
    const soilToday = (days[today] && days[today].soil != null) ? days[today].soil : null;
    const flood = future.slice(0, 10).find(d => (d.rain || 0) >= FLOOD_MM) || null;
    const hot = future.slice(0, 7).find(d => (d.tmax || 0) >= HOT_C) || null;
    const onsetNextDay = onsetNextAt >= 0 ? future[onsetNextAt] : null;
    return {
      rainLast7: Math.round(sum(rainPast.slice(-7))),
      rainLast14: Math.round(sum(rainPast.slice(-14))),
      rainNext7: Math.round(sum(rainNext.slice(0, 7))),
      rainNext14: Math.round(sum(rainNext.slice(0, 14))),
      onsetPast: onsetPastAt >= 0,
      onsetNext: onsetNextAt >= 0 ? { date: onsetNextDay.date, prob: onsetNextDay.prob == null ? null : onsetNextDay.prob } : null,
      dryAhead: { days: dryAhead.length, from: dryAhead.start >= 0 && future[dryAhead.start] ? future[dryAhead.start].date : null },
      soil: soilToday,
      soilLevel: soilToday == null ? "unknown" : soilToday < 0.15 ? "dry" : soilToday < 0.3 ? "moist" : "wet",
      flood: flood ? { date: flood.date, mm: Math.round(flood.rain) } : null,
      hot: hot ? { date: hot.date, c: Math.round(hot.tmax) } : null
    };
  }

  const DRY_MONTHS = [11, 12, 1, 2];

  /* Decide for one crop in one state.
     Returns { verdict, score, reasons: [{ key, vars }], weather }
     verdict is one of: go, soon, wait, waitDry, irrigate, offSeason, notSuited */
  function decide(crop, state, w, month) {
    const reasons = [];
    const say = (key, vars) => reasons.push({ key, vars: vars || {} });
    const suited = crop.z.indexOf(state.z) !== -1;
    const inSeason = crop.p.indexOf(month) !== -1;
    const best = crop.st.indexOf(state.n) !== -1;

    if (!suited) say("reason.notSuited", { crop: crop.n, state: state.n });
    else if (best) say("reason.bestState", { crop: crop.n, state: state.n });

    if (!inSeason) {
      say("reason.offSeason", { crop: crop.n, months: crop.p });
      return { verdict: suited ? "offSeason" : "notSuited", score: suited ? 15 : 5, reasons, weather: w };
    }

    // Dry-season crops (wheat, irrigated tomato, onion...) do not wait for rain
    const dryCrop = DRY_MONTHS.indexOf(month) !== -1 && crop.p.every(m => DRY_MONTHS.indexOf(m) !== -1 || m === 3 || m === 10);
    if (dryCrop || (DRY_MONTHS.indexOf(month) !== -1 && w.rainNext14 < 10)) {
      say("reason.irrigate", { crop: crop.n });
      if (w.hot) say("reason.hot", w.hot);
      return { verdict: suited ? "irrigate" : "notSuited", score: suited ? 70 : 20, reasons, weather: w };
    }

    // Rain-fed planting
    let verdict, score;
    const establishedRain = w.onsetPast || (w.soilLevel === "moist" || w.soilLevel === "wet") && w.rainLast14 >= ONSET_MM;
    if (w.dryAhead.days >= DRY_SPELL_DAYS) {
      verdict = "waitDry"; score = 30;
      say("reason.dryAhead", { days: w.dryAhead.days, from: w.dryAhead.from });
    } else if (establishedRain) {
      verdict = "go"; score = 90;
      say("reason.onsetPast", { mm: w.rainLast14 });
      say("reason.noDrySpell", { mm: w.rainNext14 });
    } else if (w.onsetNext && (w.onsetNext.prob == null || w.onsetNext.prob >= 60)) {
      verdict = "soon"; score = 65;
      say("reason.onsetSoon", { date: w.onsetNext.date, prob: w.onsetNext.prob });
    } else {
      verdict = "wait"; score = 35;
      say("reason.notYet", { mm: w.rainLast14, need: ONSET_MM });
    }
    if (w.soilLevel === "dry") say("reason.soilDry");
    if (w.soilLevel === "wet") say("reason.soilWet");
    if (w.flood) { say("reason.flood", w.flood); score -= 10; }
    if (w.hot) { say("reason.hot", w.hot); score -= 5; }
    if (!suited) { verdict = "notSuited"; score = Math.min(score, 25); }
    return { verdict, score: Math.max(0, Math.min(100, score)), reasons, weather: w };
  }

  // Shape Open-Meteo's answer into our simple list of days
  function fromOpenMeteo(data) {
    const d = data.daily, soilByDay = {};
    if (data.hourly && data.hourly.soil_moisture_3_to_9cm) {
      data.hourly.time.forEach((t, i) => {
        const v = data.hourly.soil_moisture_3_to_9cm[i];
        if (v == null) return;
        const k = t.slice(0, 10);
        (soilByDay[k] = soilByDay[k] || []).push(v);
      });
    }
    return d.time.map((date, i) => ({
      date,
      rain: d.precipitation_sum[i] == null ? 0 : Math.round(d.precipitation_sum[i] * 10) / 10,
      prob: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null,
      tmax: d.temperature_2m_max ? d.temperature_2m_max[i] : null,
      tmin: d.temperature_2m_min ? d.temperature_2m_min[i] : null,
      soil: soilByDay[date] ? Math.round(soilByDay[date].reduce((a, b) => a + b, 0) / soilByDay[date].length * 1000) / 1000 : null
    }));
  }

  const PAST_DAYS = 14, FORECAST_DAYS = 16;
  function openMeteoURL(lat, lon) {
    return "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
      "&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min" +
      "&hourly=soil_moisture_3_to_9cm&past_days=" + PAST_DAYS + "&forecast_days=" + FORECAST_DAYS + "&timezone=Africa%2FLagos";
  }

  const api = { readWeather, decide, fromOpenMeteo, openMeteoURL, longestDrySpell, firstOnset, PAST_DAYS, FORECAST_DAYS, ONSET_MM, DRY_SPELL_DAYS };
  root.Planting = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
