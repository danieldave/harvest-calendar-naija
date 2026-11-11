/* ==========================================================================
   HARVEST CALENDAR NAIJA – js/features.js  (v3 features)
   --------------------------------------------------------------------------
   PART 1  Languages: start the language picker, re-draw when it changes
   PART 2  "Is it time to plant?"  (planting.html + the home page quick form)
   PART 3  Farm Doctor             (doctor.html)
   Needs: js/data.js, js/i18n.js, js/planting.js, js/config.js
   Each part only runs if its HTML is on the current page.
   ========================================================================== */
"use strict";
(function () {
  const CFG = window.HCN_CONFIG || {};
  // js/data.js makes STATES and CROPS available to every script on the page
  const ALL_STATES = typeof STATES !== "undefined" ? STATES : window.STATES;
  const ALL_CROPS = typeof CROPS !== "undefined" ? CROPS : window.CROPS;
  const t = (k, v) => window.I18N ? I18N.t(k, v) : k;
  const el = id => document.getElementById(id);
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  };
  ALL_CROPS.forEach(c => { if (!c.id) c.id = c.n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); });
  const cropName = c => window.I18N ? I18N.cropName(c) : c.n;
  const statesSorted = () => ALL_STATES.slice().sort((a, b) => a.n.localeCompare(b.n));
  const cropsSorted = () => ALL_CROPS.slice().sort((a, b) => a.n.localeCompare(b.n));

  // "2026-11-15" -> "Sat 15 Nov" (month name in the reader's language when we have it)
  function niceDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    const m = window.I18N ? I18N.month(d.getMonth() + 1) : d.toLocaleString("en", { month: "short" });
    return d.getDate() + " " + m;
  }
  function monthsText(list) { return list.map(m => window.I18N ? I18N.month(m) : m).join(", "); }

  function fillSelect(sel, items, label, value) {
    if (!sel) return;
    const keep = sel.value;
    const first = sel.querySelector('option[value=""]');
    sel.innerHTML = (first ? first.outerHTML : "") + items.map(x => `<option value="${x.id}">${escH(label(x))}</option>`).join("");
    sel.value = value || keep || (first ? "" : items[0].id);
  }

  /* ================= PART 2: IS IT TIME TO PLANT? ================= */
  const VERDICT_STYLE = {
    go: { icon: "✅", cls: "v-go" }, soon: { icon: "🌦️", cls: "v-soon" }, wait: { icon: "⏳", cls: "v-wait" },
    waitDry: { icon: "⚠️", cls: "v-warn" }, irrigate: { icon: "💧", cls: "v-irrigate" },
    offSeason: { icon: "📅", cls: "v-off" }, notSuited: { icon: "🚫", cls: "v-off" }
  };
  let lastPlant = null;          // remember the last result so we can re-draw it in a new language

  async function getWeather(state) {
    // 1st choice: our own API (cached by Vercel for 3 hours, so it scales)
    try {
      const r = await fetch((CFG.weatherEndpoint || "/api/weather") + "?state=" + encodeURIComponent(state.id));
      if (r.ok) { const j = await r.json(); if (j.days) return j; }
    } catch (e) { /* try the backup */ }
    // Backup: ask Open-Meteo directly from the phone (works on any host, even without our API)
    const r2 = await fetch(Planting.openMeteoURL(state.lat, state.lon));
    if (!r2.ok) throw new Error("weather");
    return { days: Planting.fromOpenMeteo(await r2.json()), today: Planting.PAST_DAYS, place: state.cap, state: state.n };
  }

  function rainChart(days, today) {
    const W = 900, H = 124, top = 10, base = 118, n = days.length, bw = W / n;
    const max = Math.max(25, ...days.map(d => d.rain || 0));
    const bars = days.map((d, i) => {
      const h = Math.round(((d.rain || 0) / max) * (base - top));
      const x = (i * bw + 1.5).toFixed(1), y = base - h;
      const future = i >= today;
      const title = `${niceDate(d.date)}: ${d.rain || 0} mm${d.prob != null && future ? " · " + d.prob + "%" : ""}`;
      return `<rect x="${x}" y="${y}" width="${(bw - 3).toFixed(1)}" height="${Math.max(h, 2)}" rx="3" class="${future ? "bar-f" : "bar-p"}"><title>${escH(title)}</title></rect>`;
    }).join("");
    const tx = (today * bw).toFixed(1);
    const onsetLine = Math.round(base - (20 / 3 / max) * (base - top));      // 20 mm in 3 days ≈ 6.7 mm a day
    return `<figure class="rain-chart"><figcaption>${escH(t("plant.chart"))}</figcaption>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${escH(t("plant.chart"))}">
        <line x1="0" x2="${W}" y1="${onsetLine}" y2="${onsetLine}" class="onset-line"/>
        ${bars}
        <line x1="${tx}" x2="${tx}" y1="6" y2="${base + 4}" class="today-line"/>
      </svg>
      <div class="chart-legend"><span>← ${escH(t("plant.past"))}</span><span class="today">${escH(t("plant.today"))}</span><span>${escH(t("plant.forecast"))} →</span></div></figure>`;
  }

  function renderPlant() {
    const box = el("plantResult");
    if (!box || !lastPlant) return;
    const { crop, state, data, res } = lastPlant;
    const w = res.weather, v = VERDICT_STYLE[res.verdict] || VERDICT_STYLE.wait;
    const vars = r => {
      const out = Object.assign({ crop: cropName(crop), state: state.n }, r.vars);
      if (Array.isArray(out.months)) out.months = monthsText(out.months);
      ["date", "from"].forEach(k => { if (out[k] && /^\d{4}-/.test(out[k])) out[k] = niceDate(out[k]); });
      if (out.prob == null) delete out.prob;
      return out;
    };
    const stat = (label, value, unit) => `<div class="stat"><small>${escH(label)}</small><b>${escH(value)}</b>${unit ? `<span>${unit}</span>` : ""}</div>`;
    box.innerHTML = `
      <article class="verdict ${v.cls}">
        <div class="verdict-head">
          <span class="verdict-icon" aria-hidden="true">${v.icon}</span>
          <div><h2>${escH(t("verdict." + res.verdict, { crop: cropName(crop), state: state.n }))}</h2>
            <p class="place">${escH(t("plant.place", { place: data.place || state.cap, state: state.n }))}</p></div>
          <div class="score" style="--s:${res.score}" aria-label="${res.score} / 100"><span>${res.score}</span></div>
        </div>
        <ul class="reasons">${res.reasons.map(r => `<li>${escH(t(r.key, vars(r)))}</li>`).join("")}</ul>
        <div class="stats">
          ${stat(t("stat.last14"), w.rainLast14, "mm")}${stat(t("stat.next7"), w.rainNext7, "mm")}
          ${stat(t("stat.next14"), w.rainNext14, "mm")}${stat(t("stat.soil"), t("soil." + w.soilLevel))}
        </div>
        ${rainChart(data.days, data.today == null ? Planting.PAST_DAYS : data.today)}
        <div class="crop-months">
          <span><b>${escH(t("common.plant"))}:</b> ${escH(monthsText(crop.p))}</span>
          <span><b>${escH(t("common.harvest"))}:</b> ${escH(monthsText(crop.h))}</span>
          <a href="/crops/${crop.id}/" class="link-more">${escH(crop.e || "")} ${escH(crop.n)} guide →</a>
        </div>
        <p class="credit">${escH(t("plant.credit"))} · ${escH(t("plant.note"))}</p>
      </article>`;
  }

  async function runPlant(stateId, cropId) {
    const box = el("plantResult");
    const state = ALL_STATES.find(s => s.id === stateId), crop = ALL_CROPS.find(c => c.id === cropId);
    if (!box || !state || !crop) return;
    store.set("hcn-plant", stateId + "|" + cropId);
    box.innerHTML = `<div class="loading card"><span class="spin"></span><p>${escH(t("ui.loading"))}</p></div>`;
    try {
      const data = await getWeather(state);
      const today = data.today == null ? Planting.PAST_DAYS : data.today;
      const w = Planting.readWeather(data.days, today);
      const month = new Date(data.days[today].date + "T12:00:00").getMonth() + 1;
      lastPlant = { crop, state, data, res: Planting.decide(crop, state, w, month) };
      renderPlant();
      if (window.innerWidth < 760) box.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      box.innerHTML = `<div class="card error-card"><p>⛅ ${escH(t("plant.error"))}</p></div>`;
    }
  }

  function setupPlant() {
    const saved = (store.get("hcn-plant") || "").split("|");
    const q = new URLSearchParams(location.search);
    const stateId = q.get("state") || saved[0] || "ogun", cropId = q.get("crop") || saved[1] || "maize";
    const fill = () => {
      ["plantState", "qpState"].forEach(id => fillSelect(el(id), statesSorted(), s => s.n, stateId));
      ["plantCrop", "qpCrop"].forEach(id => fillSelect(el(id), cropsSorted(), c => (c.e ? c.e + " " : "") + cropName(c), cropId));
    };
    fill();
    if (window.I18N) I18N.onChange(() => { fill(); renderPlant(); });
    const form = el("plantForm");
    if (!form) return;
    form.addEventListener("submit", ev => { ev.preventDefault(); runPlant(el("plantState").value, el("plantCrop").value); });
    if (q.get("state") || q.get("crop")) runPlant(el("plantState").value, el("plantCrop").value);   // came from the home page form
  }

  /* ================= PART 3: FARM DOCTOR ================= */
  let photoData = null, lastDoc = null;

  // Our OWN checked disease list: shown at once, and used when the AI cannot answer
  function ourListHTML(crop, title) {
    return `<div class="our-list card"><h3>${escH(title || ("📗 " + t("doctor.ourList") + ": " + crop.n))}</h3>
      <ul>${crop.d.map(d => `<li><b>${escH(d[0])}</b><span>${escH(d[1])}</span></li>`).join("")}</ul></div>`;
  }

  function renderDoctor() {
    const box = el("doctorResult");
    if (!box || !lastDoc) return;
    const { crop, a } = lastDoc;
    box.innerHTML = `
      <article class="doc-answer card">
        ${a.urgent ? `<p class="urgent">🚨 ${escH(t("doctor.urgent"))}</p>` : ""}
        <h2>🩺 ${escH(crop.e || "")} ${escH(cropName(crop))}</h2>
        <p class="summary">${escH(a.summary)}</p>
        <h3>${escH(t("doctor.likely"))}</h3>
        <ul class="matches">${a.matches.map(m => `<li class="m-${m.likelihood}">
          <div><b>${escH(m.name)}</b><span class="pill like-${m.likelihood}">${escH(t("like." + m.likelihood))}</span>
          <span class="pill src-${m.source}">${escH(t(m.source === "our_list" ? "doctor.ourList" : "doctor.general"))}</span></div>
          <p>${escH(m.why)}</p></li>`).join("")}</ul>
        ${a.do_now.length ? `<h3>${escH(t("doctor.doNow"))}</h3><ol>${a.do_now.map(s => `<li>${escH(s)}</li>`).join("")}</ol>` : ""}
        ${a.prevent.length ? `<h3>${escH(t("doctor.prevent"))}</h3><ul class="ticks">${a.prevent.map(s => `<li>${escH(s)}</li>`).join("")}</ul>` : ""}
        ${a.see_expert ? `<p class="expert">👩🏾‍🌾 <b>${escH(t("doctor.expert"))}</b> ${escH(a.see_expert)}</p>` : ""}
        <p class="note">${escH(t("doctor.disclaimer"))}</p>
      </article>
      ${ourListHTML(crop)}`;
  }

  function showCropList() {
    const box = el("doctorResult"), crop = ALL_CROPS.find(c => c.id === el("docCrop").value);
    if (box && crop && !lastDoc) box.innerHTML = ourListHTML(crop);
  }

  // Shrink a photo on the phone before sending (photo feature, locked for now)
  function shrinkPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const max = CFG.photoMaxSide || 1024, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject; img.src = url;
    });
  }

  function setupPhoto() {
    const input = el("docPhoto"), label = el("photoLabel"), preview = el("photoPreview");
    if (!input) return;
    if (!CFG.photos) return;                 // LOCKED: button stays greyed out with "Coming soon"
    input.disabled = false; label.classList.remove("is-locked"); label.removeAttribute("aria-disabled"); label.title = "";
    const tag = label.querySelector(".soon-tag"); if (tag) tag.remove();
    input.addEventListener("change", async () => {
      const f = input.files && input.files[0]; if (!f) return;
      try { photoData = await shrinkPhoto(f); preview.src = photoData; preview.hidden = false; } catch (e) { photoData = null; }
    });
  }

  function setupDoctor() {
    const form = el("doctorForm");
    if (!form) return;
    const q = new URLSearchParams(location.search);
    const fill = () => {
      fillSelect(el("docCrop"), cropsSorted(), c => (c.e ? c.e + " " : "") + cropName(c), q.get("crop") || "cassava");
      fillSelect(el("docState"), statesSorted(), s => s.n, q.get("state") || "");
    };
    fill(); showCropList(); setupPhoto();
    el("docCrop").addEventListener("change", () => { lastDoc = null; showCropList(); });
    if (window.I18N) I18N.onChange(() => { fill(); if (lastDoc) renderDoctor(); else showCropList(); });

    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const msg = el("docMsg"), box = el("doctorResult");
      const crop = ALL_CROPS.find(c => c.id === el("docCrop").value);
      const symptoms = el("docSymptoms").value.trim();
      msg.textContent = "";
      if (symptoms.length < 8) { msg.textContent = t("doctor.short"); el("docSymptoms").focus(); return; }
      const btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      box.innerHTML = `<div class="loading card"><span class="spin"></span><p>${escH(t("doctor.thinking"))}</p></div>`;
      try {
        if (!navigator.onLine) throw new Error("offline");
        const r = await fetch(CFG.doctorEndpoint || "/api/doctor", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ crop: crop.id, symptoms, state: el("docState").value, lang: window.I18N ? I18N.lang : "en", image: photoData || undefined })
        });
        const a = await r.json().catch(() => ({}));
        if (!r.ok || !a.matches) throw new Error(a.error || "doctor");
        lastDoc = { crop, a };
        renderDoctor();
      } catch (e) {
        lastDoc = null;
        box.innerHTML = `<div class="card error-card"><p>📵 ${escH(t("doctor.offline"))}</p></div>` + ourListHTML(crop);
      } finally {
        btn.disabled = false;
        if (window.innerWidth < 900) box.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  /* ================= start ================= */
  document.addEventListener("DOMContentLoaded", () => {
    if (window.I18N) I18N.start();
    setupPlant();
    setupDoctor();
  });
})();
