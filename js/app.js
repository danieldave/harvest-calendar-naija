/* ==========================================================================
   HARVEST CALENDAR NAIJA – js/app.js
   All the page features in plain JavaScript (no libraries). Shared by every
   page; each feature only runs if its HTML exists on the current page.
   Needs js/data.js (the facts) and js/i18n.js (languages) loaded first.
   ========================================================================== */
"use strict";
/* ===== 6. APP STATE: what the user has selected ===== */
const TODAY = new Date();
const CURRENT_MONTH = TODAY.getMonth() + 1; // 1–12
const app = {
  month: CURRENT_MONTH,   // month shown in the month view
  region: "ALL",          // month view region filter
  monthType: "both",      // plant / harvest / both
  chartCat: "all",        // year chart crop group
  chartRegion: "ALL",     // year chart region
  chartType: "both",      // year chart plant / harvest / both
  libCat: "all",          // library crop group chip
  libText: "",            // library filter text
  mapCropId: "",          // crop highlighted on the map
  mapState: ""            // state selected on the map
};

/* ===== 7. SMALL HELPER FUNCTIONS ===== */
// Short way to select an element by CSS selector
function $(sel) { return document.querySelector(sel); }

// Escape text so user-typed entries can never inject HTML
function esc(text) {
  return String(text).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

// Turn [11,12,1,2] into "Nov–Feb", handling year wrap-around
function monthRange(months) {
  const set = new Set(months);
  if (set.size === 0) return "—";
  if (set.size === 12) return "All year";
  const next = function (m) { return m === 12 ? 1 : m + 1; };
  const prev = function (m) { return m === 1 ? 12 : m - 1; };
  const parts = [];
  for (let m = 1; m <= 12; m++) {
    if (set.has(m) && !set.has(prev(m))) {          // start of a run
      let end = m;
      while (set.has(next(end))) end = next(end);  // extend the run
      parts.push(end === m ? MON[m - 1] : MON[m - 1] + "–" + MON[end - 1]);
    }
  }
  return parts.join(", ");
}

// Does a crop belong to a region filter?
function inRegion(crop, region) {
  return region === "ALL" || crop.z.indexOf(region) !== -1;
}

// Find a state's data by name
function getState(name) {
  return STATES.find(function (s) { return s.n === name; });
}

// Coloured zone tags (North-West, South-East, …)
function zoneTagsHTML(zones) {
  return zones.map(function (z) {
    return '<span class="zone-tag" style="background:' + ZONES[z].color + '">' + ZONES[z].name + "</span>";
  }).join("");
}

// All crops = built-in database + the user's saved entries
function allCrops() {
  return CROPS.concat(myEntriesAsCrops());
}

// Find a crop (built-in or user entry) by id
function getCrop(id) {
  return allCrops().find(function (c) { return c.id === id; });
}

/* ===== 8. "MY ENTRIES" (saved in localStorage) ===== */
const STORE_KEY = "hcn-my-entries";

// Read entries safely (localStorage can be blocked in private mode)
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return memoryEntries; // fallback when storage is blocked
  }
}
let memoryEntries = [];

// Save entries safely
function saveEntries(list) {
  memoryEntries = list;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (err) { /* storage blocked: keep in memory only */ }
}

// Convert saved entries into the same shape as crops so every view can show them
function myEntriesAsCrops() {
  return loadEntries().map(function (e, i) {
    const state = getState(e.state);
    return {
      id: "my-" + i, my: true, n: e.name, l: "", e: "📝", c: "my",
      p: [Number(e.plant)], h: [Number(e.harvest)],
      z: state ? [state.z] : [], st: state ? [state.n] : [],
      s: "Your entry: plant in " + MONTHS[e.plant - 1] + ", harvest in " + MONTHS[e.harvest - 1] + ".",
      f: "This is your own crop entry, saved on this device.",
      t: e.note || "No note added.", d: []
    };
  });
}

// Build the entry form selects and handle adding/deleting entries
function setupEntries() {
  if (!$("#entryForm")) return; // only on entries.html
  const plantSel = $("#entryPlant"), harvestSel = $("#entryHarvest"), stateSel = $("#entryState");
  MONTHS.forEach(function (m, i) {
    plantSel.add(new Option(m, i + 1));
    harvestSel.add(new Option(m, i + 1));
  });
  plantSel.value = CURRENT_MONTH;
  harvestSel.value = ((CURRENT_MONTH + 2) % 12) + 1; // default: about 3 months later
  STATES.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).forEach(function (s) {
    stateSel.add(new Option(s.n === "FCT" ? "FCT (Abuja)" : s.n, s.n));
  });
  stateSel.value = "Ogun";

  // Add entry on form submit
  $("#entryForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const name = $("#entryName").value.trim();
    if (!name) { $("#entryMsg").textContent = "Please type a crop name."; return; }
    const list = loadEntries();
    list.push({ name: name, plant: Number(plantSel.value), harvest: Number(harvestSel.value), state: stateSel.value, note: $("#entryNote").value.trim() });
    saveEntries(list);
    ev.target.reset();
    plantSel.value = CURRENT_MONTH;
    stateSel.value = "Ogun";
    $("#entryMsg").textContent = "✅ Added! Check the month view and year chart.";
    refreshAll();
  });

  // Delete entry (event delegation on the list)
  $("#entriesList").addEventListener("click", function (ev) {
    const btn = ev.target.closest(".del");
    if (!btn) return;
    const list = loadEntries();
    list.splice(Number(btn.dataset.index), 1);
    saveEntries(list);
    refreshAll();
  });
}

// Show the saved entries list
function renderEntries() {
  const ul = $("#entriesList");
  if (!ul) return; // only on entries.html
  const list = loadEntries();
  if (!list.length) { ul.innerHTML = '<li class="empty">No entries yet. Add your first crop on the left.</li>'; return; }
  ul.innerHTML = list.map(function (e, i) {
    return "<li><span>📝 <b>" + esc(e.name) + "</b> · " + esc(e.state) + "<br><small>Plant " + MON[e.plant - 1] + " → Harvest " + MON[e.harvest - 1] +
      (e.note ? " · " + esc(e.note) : "") + '</small></span><button class="del" data-index="' + i + '" aria-label="Delete ' + esc(e.name) + '">Delete</button></li>';
  }).join("");
}

/* ===== 9. MONTH VIEW: being planted / in harvest ===== */
// Small crop card used in the month panels
function miniCardHTML(crop, mode) {
  const states = crop.st.slice(0, 3).join(", ") + (crop.st.length > 3 ? "…" : "");
  const nextInfo = mode === "plant" ? "Harvest: " + monthRange(crop.h) : "Planted: " + monthRange(crop.p);
  return '<button class="mini-card' + (crop.my ? " mine" : "") + '" data-crop="' + crop.id + '">' +
    '<span class="mc-top"><span class="mc-icon" aria-hidden="true">' + crop.e + '</span><span class="mc-name">' + esc(crop.n) + "</span></span>" +
    '<span class="mc-states">📍 ' + esc(states || "All regions") + "</span>" +
    '<span class="mc-next">' + nextInfo + "</span></button>";
}

function renderMonthView() {
  if (!$("#monthName")) return; // only on the home page
  const m = app.month;
  const season = seasonOf(m);
  $("#monthName").textContent = MONTHS[m - 1];
  $("#nowBadge").classList.toggle("hidden", m !== CURRENT_MONTH);
  $("#seasonNote").textContent = season.icon + " " + season.name + ": " + season.desc;

  const list = allCrops().filter(function (c) { return inRegion(c, app.region); });
  const planting = list.filter(function (c) { return c.p.indexOf(m) !== -1; });
  const harvesting = list.filter(function (c) { return c.h.indexOf(m) !== -1; });

  // Show or hide panels from the Plant / Harvest / Both choice
  $("#plantPanel").classList.toggle("hidden", app.monthType === "harvest");
  $("#harvestPanel").classList.toggle("hidden", app.monthType === "plant");

  $("#plantCount").textContent = planting.length;
  $("#harvestCount").textContent = harvesting.length;
  $("#plantGrid").innerHTML = planting.length ? planting.map(function (c) { return miniCardHTML(c, "plant"); }).join("") : '<p class="empty">No crops in our list are usually planted this month in this region.</p>';
  $("#harvestGrid").innerHTML = harvesting.length ? harvesting.map(function (c) { return miniCardHTML(c, "harvest"); }).join("") : '<p class="empty">No crops in our list are usually harvested this month in this region.</p>';
}

/* ===== 10. MONTH PICKER (12 buttons) ===== */
function renderMonthPicker() {
  if (!$("#monthPicker")) return; // only on the home page
  const crops = allCrops();
  $("#monthPicker").innerHTML = MONTHS.map(function (name, i) {
    const m = i + 1;
    const pCount = crops.filter(function (c) { return c.p.indexOf(m) !== -1; }).length;
    const cls = "month-btn" + (m === app.month ? " selected" : "") + (m === CURRENT_MONTH ? " current" : "");
    return '<button class="' + cls + '" data-month="' + m + '" aria-pressed="' + (m === app.month) + '">' + name + "<small>" + pCount + " to plant</small></button>";
  }).join("");
}

/* ===== 11. YEAR CHART TABLE ===== */
function renderYearChart() {
  if (!$("#yearHead")) return; // only on calendar.html
  // Table head: Crop + 12 months, current month highlighted
  $("#yearHead").innerHTML = '<tr><th class="crop-col" scope="col">Crops</th>' + MON.map(function (m, i) {
    return '<th scope="col" class="' + (i + 1 === CURRENT_MONTH ? "now-col" : "") + '">' + m + "</th>";
  }).join("") + "</tr>";

  const rows = allCrops().filter(function (c) {
    return (app.chartCat === "all" || c.c === app.chartCat) && inRegion(c, app.chartRegion);
  });

  if (!rows.length) { $("#yearBody").innerHTML = '<tr><td colspan="13" class="empty">No crops match these filters.</td></tr>'; return; }

  $("#yearBody").innerHTML = rows.map(function (c) {
    const cells = MON.map(function (mName, i) {
      const m = i + 1;
      let isP = c.p.indexOf(m) !== -1, isH = c.h.indexOf(m) !== -1;
      if (app.chartType === "plant") isH = false;   // apply Plant / Harvest / Both filter
      if (app.chartType === "harvest") isP = false;
      const cls = isP && isH ? "b" : isP ? "p" : isH ? "h" : "";
      const label = isP && isH ? "plant and harvest" : isP ? "plant" : isH ? "harvest" : "";
      return '<td class="' + (m === CURRENT_MONTH ? "now-col" : "") + '">' + (cls ? '<span class="cell ' + cls + '" title="' + MONTHS[i] + ": " + label + '"></span>' : "") + "</td>";
    }).join("");
    return '<tr><td class="crop-col"><button data-crop="' + c.id + '">' + c.e + " " + esc(c.n) + "</button></td>" + cells + "</tr>";
  }).join("");
}

/* ===== 12. SEASON VIEW ===== */
function renderSeasons() {
  if (!$("#seasonGrid")) return; // only on seasons.html
  const crops = CROPS; // built-in crops only, to keep season cards tidy
  $("#seasonGrid").innerHTML = SEASONS.map(function (s) {
    const planted = crops.filter(function (c) { return c.p.some(function (m) { return s.months.indexOf(m) !== -1; }); });
    // For harvest, skip all-year crops so the list stays meaningful
    const harvested = crops.filter(function (c) { return c.h.length < 12 && c.h.some(function (m) { return s.months.indexOf(m) !== -1; }); });
    const chips = function (list, gold) {
      return list.map(function (c) { return '<button class="crop-chip' + (gold ? " gold" : "") + '" data-crop="' + c.id + '">' + c.e + " " + esc(c.n) + "</button>"; }).join("");
    };
    return '<article class="season-card ' + s.key + '"><h3>' + s.icon + " " + s.name + '</h3><div class="months">' + s.months.map(function (m) { return MON[m - 1]; }).join(" · ") +
      "</div><p>" + s.desc + "</p><h4>🌱 Planting (" + planted.length + ')</h4><div class="chip-list">' + chips(planted, false) +
      "</div><h4>🧺 Harvesting (" + harvested.length + ')</h4><div class="chip-list">' + chips(harvested, true) + "</div></article>";
  }).join("");
}

/* ===== 13. CROP LIBRARY ("Facts on the crops") ===== */
function setupLibraryChips() {
  if (!$("#categoryChips")) return; // only on crops.html
  const keys = ["all"].concat(Object.keys(CATEGORIES).filter(function (k) { return k !== "my"; }));
  $("#categoryChips").innerHTML = keys.map(function (k) {
    return '<button class="chip' + (k === app.libCat ? " active" : "") + '" data-cat="' + k + '">' + (k === "all" ? "All crops" : CATEGORIES[k]) + "</button>";
  }).join("");
}

// Does a crop match the text the user typed?
function cropMatchesText(c, text) {
  if (!text) return true;
  const hay = (c.n + " " + c.l + " " + CATEGORIES[c.c] + " " + c.st.join(" ") + " " + c.z.map(function (z) { return ZONES[z].name; }).join(" ")).toLowerCase();
  return text.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
}

function renderLibrary() {
  if (!$("#cropGrid")) return; // only on crops.html
  const text = app.libText.toLowerCase().trim();
  const list = CROPS.filter(function (c) { return (app.libCat === "all" || c.c === app.libCat) && cropMatchesText(c, text); });
  $("#libraryCount").textContent = list.length + (list.length === 1 ? " crop" : " crops");
  if (!list.length) { $("#cropGrid").innerHTML = '<p class="empty">No crops match. Try another word.</p>'; return; }
  $("#cropGrid").innerHTML = list.map(function (c) {
    return '<button class="crop-card reveal" data-crop="' + c.id + '">' +
      '<span class="cc-head"><span class="cc-icon" aria-hidden="true">' + c.e + "</span><span><span class=\"cc-cat\">" + CATEGORIES[c.c] + "</span><h3>" + esc(c.n) + "</h3></span></span>" +
      '<span class="cc-row">🌱 <b>Plant:</b> ' + monthRange(c.p) + "</span>" +
      '<span class="cc-row">🧺 <b>Harvest:</b> ' + monthRange(c.h) + "</span>" +
      '<span class="cc-row">📍 <b>Best in:</b> ' + esc(c.st.slice(0, 4).join(", ")) + (c.st.length > 4 ? "…" : "") + "</span>" +
      '<span class="zone-tags">' + zoneTagsHTML(c.z) + "</span>" +
      '<span class="cc-tip">💡 ' + esc(c.t) + "</span></button>";
  }).join("");
  observeReveal();
}

/* ===== 14. CROP DETAIL MODAL ===== */
let lastFocus = null; // remember which element opened the modal

function openCrop(id) {
  const c = getCrop(id);
  if (!c) return;
  lastFocus = document.activeElement;
  const strip = MON.map(function (m, i) {
    const n = i + 1, isP = c.p.indexOf(n) !== -1, isH = c.h.indexOf(n) !== -1;
    const cls = (isP && isH ? "b" : isP ? "p" : isH ? "h" : "") + (n === CURRENT_MONTH ? " now" : "");
    return '<div class="' + cls + '" title="' + MONTHS[i] + '">' + m + "</div>";
  }).join("");
  const diseases = c.d.length ? '<ul class="disease-list">' + c.d.map(function (d) { return "<li><b>⚠️ " + esc(d[0]) + "</b><br>🛡️ " + esc(d[1]) + "</li>"; }).join("") + "</ul>" : "<p>No disease data for this entry.</p>";

  $("#modalBody").innerHTML =
    '<div class="m-head"><span class="m-icon" aria-hidden="true">' + c.e + '</span><div><h2 id="modalTitle">' + esc(c.n) + "</h2>" +
    (c.l ? '<p class="m-local">' + esc(c.l) + "</p>" : "") + '<span class="cc-cat">' + CATEGORIES[c.c] + "</span></div></div>" +
    '<div class="m-strip" aria-label="Planting and harvest months">' + strip + "</div>" +
    '<div class="legend"><span><i class="lg lg-plant"></i> Plant</span><span><i class="lg lg-harvest"></i> Harvest</span><span><i class="lg lg-both"></i> Both</span></div>' +
    '<div class="m-grid">' +
      '<div class="m-box"><h4>🌱 When to plant</h4><p><b>' + monthRange(c.p) + "</b></p></div>" +
      '<div class="m-box"><h4>🧺 When to harvest</h4><p><b>' + monthRange(c.h) + "</b></p></div>" +
    "</div>" +
    '<div class="m-box" style="margin-top:10px"><h4>📅 Season</h4><p>' + esc(c.s) + "</p></div>" +
    '<div class="m-box" style="margin-top:10px"><h4>🗺️ Regions</h4><div class="zone-tags">' + zoneTagsHTML(c.z) + '</div><h4 style="margin-top:8px">📍 Best-known states</h4><div class="state-chips">' +
      c.st.map(function (s) { return '<span class="state-chip">' + esc(s) + "</span>"; }).join("") + "</div></div>" +
    '<div class="m-box" style="margin-top:10px"><h4>🤓 Did you know?</h4><p>' + esc(c.f) + "</p></div>" +
    '<div class="m-box m-tip" style="margin-top:10px"><h4>💡 Quick tip</h4><p>' + esc(c.t) + "</p></div>" +
    '<h4 style="margin:16px 0 8px">🦠 Diseases, pests &amp; prevention</h4>' + diseases +
    '<div class="m-actions">' + (c.my ? "" : '<button class="btn btn-primary" data-map-crop="' + c.id + '">📍 ' + ($("#tileMap") ? "Show on farm map" : "Open on farm map page") + "</button>") +
    '<a class="btn btn-ghost" href="/crops.html?q=' + encodeURIComponent(c.n) + '">🌽 All crop facts</a><button class="btn btn-ghost" data-close="true">Close</button></div>';

  $("#cropModal").hidden = false;
  document.body.style.overflow = "hidden"; // stop background scrolling
  $("#modalClose").focus();
}

function closeModal() {
  $("#cropModal").hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

/* ===== 15. GLOBAL SEARCH WITH SUGGESTIONS ===== */
function setupSearch() {
  const input = $("#globalSearch"), box = $("#searchSuggestions");
  if (!input || !box) return;            // this page has no search bar
  let activeIndex = -1;

  function show(text) {
    const q = text.toLowerCase().trim();
    if (!q) { box.hidden = true; return; }
    // Rank: names starting with the text first, then names containing it, then other matches (states, local names)
    const score = function (c) { const n = c.n.toLowerCase(); return n.indexOf(q) === 0 ? 0 : new RegExp("\\b" + q.replace(/[^a-z0-9 ]/g, "")).test(n) ? 1 : n.indexOf(q) !== -1 ? 2 : 3; };
    const crops = allCrops().filter(function (c) { return cropMatchesText(c, q); })
      .sort(function (a, b) { return score(a) - score(b) || a.n.length - b.n.length; }).slice(0, 7);
    const states = STATES.filter(function (s) { return s.n.toLowerCase().indexOf(q) !== -1; }).slice(0, 3);
    let html = crops.map(function (c) {
      return '<li role="option" data-crop="' + c.id + '"><span>' + c.e + "</span> " + esc(c.n) + '<span class="sug-type">' + CATEGORIES[c.c] + "</span></li>";
    }).join("");
    html += states.map(function (s) {
      return '<li role="option" data-state="' + s.n + '"><span>📍</span> ' + s.n + ' State<span class="sug-type">Open on map</span></li>';
    }).join("");
    box.innerHTML = html || '<li class="sug-empty">No match. Try "maize", "yam" or a state like "Benue".</li>';
    box.hidden = false;
    activeIndex = -1;
  }

  function choose(li) {
    if (!li) return;
    if (li.dataset.crop) openCrop(li.dataset.crop);
    if (li.dataset.state) goToState(li.dataset.state); // map page: select it; other pages: open map.html
    box.hidden = true;
  }

  input.addEventListener("input", function () { show(input.value); });
  input.addEventListener("keydown", function (ev) {
    const items = box.querySelectorAll("li[role=option]");
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!items.length) return;
      activeIndex = (activeIndex + (ev.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach(function (li, i) { li.classList.toggle("active", i === activeIndex); });
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (activeIndex >= 0) { choose(items[activeIndex]); return; }
      // No suggestion picked: show matching crops in the library
      box.hidden = true;
      if (!$("#cropGrid")) { // not on the crops page: open it with the search text
        window.location.href = "/crops.html?q=" + encodeURIComponent(input.value.trim());
        return;
      }
      app.libText = input.value;
      $("#librarySearch").value = input.value;
      app.libCat = "all"; setupLibraryChips(); renderLibrary();
      $("#cropGrid").scrollIntoView();
    } else if (ev.key === "Escape") { box.hidden = true; }
  });
  box.addEventListener("click", function (ev) { choose(ev.target.closest("li[role=option]")); });
  document.addEventListener("click", function (ev) { if (!ev.target.closest(".search-box")) box.hidden = true; });
}

/* ===== 16. INTERACTIVE TILE MAP ===== */
function setupMap() {
  if (!$("#tileMap")) return; // only on map.html
  // Build one tile (button) per state, placed on a CSS grid
  $("#tileMap").innerHTML = STATES.map(function (s) {
    const style = "grid-column:" + (s.c + 1) + " / span " + (s.w || 1) + ";grid-row:" + (s.r + 1) + " / span " + (s.h || 1) + ";background:" + ZONES[s.z].color + ";" + (s.w || s.h ? "aspect-ratio:auto;" : "");
    return '<button class="tile" style="' + style + '" data-state="' + s.n + '" title="' + s.n + '" aria-label="' + s.n + ' State">' + s.ab + '<span class="t-full">' + (s.n === "Cross River" ? "C. River" : s.n === "Akwa Ibom" ? "A. Ibom" : s.n) + "</span></button>";
  }).join("");

  // Legend of zone colours + highlight meaning
  $("#mapLegend").innerHTML = Object.keys(ZONES).map(function (k) { return '<span><i style="background:' + ZONES[k].color + '"></i>' + ZONES[k].name + "</span>"; }).join("") +
    '<span><i class="legend-best"></i>Best states</span>';

  // Crop dropdown (alphabetical)
  const sel = $("#mapCrop");
  CROPS.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).forEach(function (c) { sel.add(new Option(c.e + " " + c.n, c.id)); });

  sel.addEventListener("change", function () { highlightCrop(sel.value); });
  $("#tileMap").addEventListener("click", function (ev) {
    const tile = ev.target.closest(".tile");
    if (tile) selectState(tile.dataset.state);
  });
  $("#mapReset").addEventListener("click", resetMap);

  // Map search: crop name or state name, then Enter
  $("#mapSearch").addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    const q = ev.target.value.toLowerCase().trim();
    if (!q) return;
    const st = STATES.find(function (s) { return s.n.toLowerCase() === q; }) || STATES.find(function (s) { return s.n.toLowerCase().indexOf(q) === 0; });
    if (st) { selectState(st.n); return; }
    const crop = CROPS.find(function (c) { return c.n.toLowerCase().indexOf(q) !== -1 || c.l.toLowerCase().indexOf(q) !== -1; });
    if (crop) { sel.value = crop.id; highlightCrop(crop.id); return; }
    $("#mapInfo").innerHTML = "<h3>Not found</h3><p>We couldn't find \"" + esc(q) + "\". Try a crop like <b>cassava</b> or a state like <b>Kano</b>.</p>";
  });
}

// Light up the best states (dark outline) and suitable zones (lighter) for a crop
function highlightCrop(id) {
  app.mapCropId = id;
  const crop = getCrop(id);
  document.querySelectorAll(".tile").forEach(function (t) {
    t.classList.remove("best", "good", "dim");
    if (!crop) return;
    const name = t.dataset.state, s = getState(name);
    if (crop.st.indexOf(name) !== -1) t.classList.add("best");
    else if (crop.z.indexOf(s.z) !== -1) t.classList.add("good");
    else t.classList.add("dim");
  });
  if (!crop) { resetInfo(); return; }
  const status = crop.p.indexOf(CURRENT_MONTH) !== -1 ? "🌱 It is planting time now (" + MONTHS[CURRENT_MONTH - 1] + ")." :
                 crop.h.indexOf(CURRENT_MONTH) !== -1 ? "🧺 It is harvest time now (" + MONTHS[CURRENT_MONTH - 1] + ")." :
                 "⏳ Next planting window: " + monthRange(crop.p) + ".";
  $("#mapInfo").innerHTML = "<h3>" + crop.e + " " + esc(crop.n) + "</h3>" +
    '<div class="info-meta"><span>🌱 Plant: <b>' + monthRange(crop.p) + "</b></span><span>🧺 Harvest: <b>" + monthRange(crop.h) + "</b></span><span>" + status + "</span></div>" +
    "<h4>Best-known states (" + crop.st.length + ')</h4><div class="state-chips">' + crop.st.map(function (s) { return '<button class="crop-chip" data-state="' + esc(s) + '">' + esc(s) + "</button>"; }).join("") + "</div>" +
    '<h4>Suitable regions</h4><div class="zone-tags">' + zoneTagsHTML(crop.z) + "</div>" +
    "<p style=\"margin-top:10px;font-size:.9rem\">" + esc(crop.s) + "</p>" +
    '<button class="btn btn-ghost" style="margin-top:8px" data-crop="' + crop.id + '">Full crop details</button>';
}

// Show what suits a state: climate, rains, best crops, this month's activity
function selectState(name) {
  const s = getState(name);
  if (!s) return;
  app.mapState = name;
  document.querySelectorAll(".tile").forEach(function (t) { t.classList.toggle("selected", t.dataset.state === name); });
  const best = CROPS.filter(function (c) { return c.st.indexOf(name) !== -1; });
  const also = CROPS.filter(function (c) { return c.st.indexOf(name) === -1 && c.z.indexOf(s.z) !== -1; });
  const plantNow = best.concat(also).filter(function (c) { return c.p.indexOf(CURRENT_MONTH) !== -1; });
  const harvestNow = best.concat(also).filter(function (c) { return c.h.indexOf(CURRENT_MONTH) !== -1 && c.h.length < 12; });
  const chips = function (list) { return list.length ? list.map(function (c) { return '<button class="crop-chip" data-crop="' + c.id + '">' + c.e + " " + esc(c.n) + "</button>"; }).join("") : '<span class="empty">None in our list.</span>'; };
  const osm = "https://www.openstreetmap.org/search?query=" + encodeURIComponent((name === "FCT" ? "Federal Capital Territory" : name + " State") + ", Nigeria");

  $("#mapInfo").innerHTML = "<h3>📍 " + (name === "FCT" ? "FCT (Abuja)" : name + " State") + "</h3>" +
    '<div class="info-meta"><span>🧭 Region: <b>' + ZONES[s.z].name + "</b></span><span>🌍 Climate zone: <b>" + s.eco + "</b></span><span>🌧️ Usual rainy months: <b>" + s.rain + "</b></span></div>" +
    "<h4>🌱 Plant here in " + MONTHS[CURRENT_MONTH - 1] + ' (' + plantNow.length + ')</h4><div class="chip-list">' + chips(plantNow) + "</div>" +
    "<h4>🧺 Harvest here in " + MONTHS[CURRENT_MONTH - 1] + ' (' + harvestNow.length + ')</h4><div class="chip-list">' + chips(harvestNow) + "</div>" +
    "<h4>⭐ Best-known crops (" + best.length + ')</h4><div class="chip-list">' + chips(best) + "</div>" +
    "<h4>✅ Also suitable in this region (" + also.length + ')</h4><div class="chip-list">' + chips(also) + "</div>" +
    '<a class="osm-link" href="' + osm + '" target="_blank" rel="noopener">🗺️ View ' + esc(name) + " on OpenStreetMap ↗</a>";
}

function resetInfo() {
  $("#mapInfo").innerHTML = "<h3>How to use the map</h3><ol><li>Select or type a crop to see its <strong>best states</strong> (outlined) and <strong>suitable region</strong> (light).</li><li>Tap a state to see its climate zone, rainy season and crops that suit it.</li><li>Always confirm with your local ADP extension officer before planting.</li></ol>";
}

function resetMap() {
  app.mapCropId = ""; app.mapState = "";
  $("#mapCrop").value = ""; $("#mapSearch").value = "";
  document.querySelectorAll(".tile").forEach(function (t) { t.classList.remove("best", "good", "dim", "selected"); });
  resetInfo();
}

/* ===== 17. NIGHT MODE (day / night switch) =====
   The tiny script in each page's <head> already set data-theme before the
   page drew (saved choice, or the device's own dark-mode setting).
   Here we wire the 🌙/☀️ button and save the user's choice for every page. */
const THEME_KEY = "hcn-theme";

// Which theme is showing now?
function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

// Did the user pick a theme themselves (rather than following the device)?
function savedTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (err) { return null; }
}

// Switch theme and update the button text/icon
function applyTheme(theme, save) {
  document.documentElement.setAttribute("data-theme", theme);
  if (save) { try { localStorage.setItem(THEME_KEY, theme); } catch (err) { /* storage blocked: works for this page only */ } }
  const btn = $("#themeToggle");
  if (btn) {
    const dark = theme === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", dark ? "Switch to day mode" : "Switch to night mode");
    btn.querySelector(".tt-icon").textContent = dark ? "☀️" : "🌙";
    btn.querySelector(".tt-text").textContent = dark ? "Day" : "Night";
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1610" : "#1f6f3f"); // phone address-bar colour
}

function setupTheme() {
  applyTheme(currentTheme(), false); // show the right button label
  const btn = $("#themeToggle");
  if (btn) btn.addEventListener("click", function () { applyTheme(currentTheme() === "dark" ? "light" : "dark", true); });
  // Follow the device setting when it changes, unless the user chose a theme
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = function (e) { if (!savedTheme()) applyTheme(e.matches ? "dark" : "light", false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  // Keep every open tab in step when the theme changes in another tab
  window.addEventListener("storage", function (e) { if (e.key === THEME_KEY && e.newValue) applyTheme(e.newValue, false); });
}

/* ===== 18. HEADER, NAVIGATION, BACK-TO-TOP, REVEAL ===== */
function setupChrome() {
  // Hamburger menu toggle (phones and tablets)
  const toggle = $("#navToggle"), nav = $("#mainNav");
  toggle.addEventListener("click", function () {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  // Close the menu after a link is tapped (needed for "This Month", which stays on the home page)
  nav.addEventListener("click", function (ev) {
    if (ev.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });

  // Back-to-top button appears after scrolling
  window.addEventListener("scroll", function () { $("#toTop").classList.toggle("show", window.scrollY > 600); }, { passive: true });
  $("#toTop").addEventListener("click", function () { window.scrollTo({ top: 0 }); });

  // Today pill (home page only) + footer year (every page)
  const season = seasonOf(CURRENT_MONTH);
  if ($("#todayPill")) {
    $("#todayPill").textContent = "📅 Today: " + TODAY.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · " + season.icon + " " + season.name;
  }
  $("#year").textContent = TODAY.getFullYear();

  // On the home page, "Home" and "This Month" swap highlight as you scroll to the month view
  const homeLink = document.querySelector('.main-nav a[href="index.html"]');
  const monthLink = document.querySelector('.main-nav a[href="index.html#calendar"]');
  if ($("#calendar") && homeLink && monthLink && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      const inView = entries[0].isIntersecting;
      monthLink.classList.toggle("active", inView);
      homeLink.classList.toggle("active", !inView);
    }, { rootMargin: "-45% 0px -50% 0px" }).observe($("#calendar"));
  }
}

// Fade cards in as they scroll into view
let revealObserver = null;
function observeReveal() {
  const items = document.querySelectorAll(".reveal:not(.visible)");
  if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("visible"); }); return; }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); revealObserver.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -40px 0px" });
  }
  items.forEach(function (el) { revealObserver.observe(el); });
}

/* ===== 19. PAGE LINKS (open a crop or state from another page) ===== */
// Open a state on the map: select it here, or go to map.html?state=...
function goToState(name) {
  if ($("#tileMap")) { selectState(name); $("#tileMap").scrollIntoView(); }
  else window.location.href = "/map.html?state=" + encodeURIComponent(name);
}

// Show a crop on the map: highlight it here, or go to map.html?crop=...
function goToMapCrop(id) {
  if ($("#tileMap")) { closeModal(); $("#mapCrop").value = id; highlightCrop(id); $("#tileMap").scrollIntoView(); }
  else window.location.href = "/map.html?crop=" + encodeURIComponent(id);
}

// Read ?crop=, ?state= and ?q= from the address bar when a page opens
function readPageLinks() {
  const params = new URLSearchParams(window.location.search);
  const cropId = params.get("crop"), stateName = params.get("state"), q = params.get("q");
  if ($("#tileMap")) {
    if (cropId && getCrop(cropId)) { $("#mapCrop").value = cropId; highlightCrop(cropId); }
    if (stateName && getState(stateName)) selectState(stateName);
  }
  if ($("#cropGrid") && q) {
    app.libText = q;
    $("#librarySearch").value = q;
    renderLibrary();
  }
}

/* ===== 20. START THE APP ===== */
// Re-draw everything that depends on user entries (each part skips itself if not on this page)
function refreshAll() {
  renderMonthView();
  renderMonthPicker();
  renderYearChart();
  renderEntries();
}

// Add an event listener only if the element is on this page
function on(sel, type, handler) {
  const el = $(sel);
  if (el) el.addEventListener(type, handler);
}

function wireEvents() {
  // Month view filters (home page)
  on("#regionFilter", "change", function (ev) { app.region = ev.target.value; renderMonthView(); });
  document.querySelectorAll("input[name=monthType]").forEach(function (r) {
    r.addEventListener("change", function () { app.monthType = r.value; renderMonthView(); });
  });

  // Month picker buttons (home page)
  on("#monthPicker", "click", function (ev) {
    const btn = ev.target.closest(".month-btn");
    if (!btn) return;
    app.month = Number(btn.dataset.month);
    renderMonthView(); renderMonthPicker();
    $("#calendar").scrollIntoView();
  });

  // Year chart filters (calendar.html)
  const catSel = $("#chartCategory");
  if (catSel) {
    catSel.add(new Option("All crop groups", "all"));
    Object.keys(CATEGORIES).forEach(function (k) { catSel.add(new Option(CATEGORIES[k], k)); });
    catSel.addEventListener("change", function () { app.chartCat = catSel.value; renderYearChart(); });
  }
  on("#chartRegion", "change", function (ev) { app.chartRegion = ev.target.value; renderYearChart(); });
  document.querySelectorAll("input[name=chartType]").forEach(function (r) {
    r.addEventListener("change", function () { app.chartType = r.value; renderYearChart(); });
  });

  // Library filters (crops.html)
  on("#categoryChips", "click", function (ev) {
    const chip = ev.target.closest(".chip");
    if (!chip) return;
    app.libCat = chip.dataset.cat; setupLibraryChips(); renderLibrary();
  });
  on("#librarySearch", "input", function (ev) { app.libText = ev.target.value; renderLibrary(); });

  // One click handler for every "open crop" / "map" / "state" button on any page
  document.addEventListener("click", function (ev) {
    const mapBtn = ev.target.closest("[data-map-crop]");
    if (mapBtn) { goToMapCrop(mapBtn.dataset.mapCrop); return; }
    if (ev.target.closest("[data-close]")) { closeModal(); return; }
    const cropBtn = ev.target.closest("[data-crop]");
    if (cropBtn && !cropBtn.closest(".suggestions")) { openCrop(cropBtn.dataset.crop); return; }
    const stateBtn = ev.target.closest(".map-info [data-state]");
    if (stateBtn) selectState(stateBtn.dataset.state);
  });

  // Pop-up close button + Escape key (pop-up is on every page)
  on("#modalClose", "click", closeModal);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !$("#cropModal").hidden) closeModal(); });
}

document.addEventListener("DOMContentLoaded", function () {
  setupTheme();        // night mode button (every page)
  setupChrome();       // header menu, back-to-top, footer year (every page)
  setupSearch();       // search bar (every page)
  setupEntries();      // entries.html
  setupLibraryChips(); // crops.html
  setupMap();          // map.html
  wireEvents();        // filters and buttons on this page
  refreshAll();        // month view, month picker, year chart, saved entries
  renderSeasons();     // seasons.html
  renderLibrary();     // crops.html
  readPageLinks();     // ?crop= / ?state= / ?q= from another page
  observeReveal();     // fade-in cards (home explore cards, crop cards)
});
