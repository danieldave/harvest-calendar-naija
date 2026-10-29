/* ==========================================================================
   HARVEST CALENDAR NAIJA – script.js
   All the interactivity for the site, in plain JavaScript (no libraries).
   This ONE script is shared by every page (index, calendar, seasons, crops,
   map, entries, tips). Each feature only runs if its HTML exists on the
   current page, so nothing breaks on pages that don't have it.
   Sections:
     1.  Month names & season helpers
     2.  Geopolitical zones (regions) & their colours
     3.  The 36 states + FCT (with map grid position & climate)
     4.  Crop groups (categories)
     5.  CROP DATABASE (84 Nigerian crops)
     6.  App state (what the user has selected)
     7.  Small helper functions
     8.  "My entries" (saved in localStorage)
     9.  Month view (being planted / in harvest)
     10. Month picker
     11. Year chart table
     12. Season view
     13. Crop library (facts cards)
     14. Crop detail modal
     15. Global search with suggestions
     16. Interactive tile map
     17. Night mode (day / night switch)
     18. Header, navigation, back-to-top, reveal animation
     19. Page links (open a crop or state from another page)
     20. Start the app
   Data note: months are numbers 1–12 (1 = January). Planting/harvest months
   are GENERAL Nigerian windows from research/extension sources (IITA, NAERLS,
   NRCRI, NCRI, NIHORT, CRIN, NIFOR, IAR, FAO). Users are told to verify locally.
   ========================================================================== */
"use strict";

/* ===== 1. MONTH NAMES & SEASON HELPERS ===== */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON = MONTHS.map(function (m) { return m.slice(0, 3); }); // "Jan", "Feb", ...

// The four broad farming seasons used across Nigeria
const SEASONS = [
  { key: "dry",   icon: "☀️", name: "Dry season (Harmattan)", months: [11, 12, 1, 2],
    desc: "Little or no rain. Northern farmers grow irrigated (fadama) crops like wheat, tomato, onion, garlic and watermelon. Tree crops such as cocoa, cashew and kola are harvested." },
  { key: "early", icon: "🌦️", name: "Early rains", months: [3, 4, 5],
    desc: "Rains begin in the South around March–April and move north. Southern farmers plant yam, cassava, maize, cocoyam and vegetables." },
  { key: "peak",  icon: "🌧️", name: "Peak rains", months: [6, 7, 8],
    desc: "Main planting time in the North (sorghum, millet, groundnut, soybean, cotton, sesame). First-season maize is harvested in the South. Brief 'August break' in parts of the South." },
  { key: "late",  icon: "🍂", name: "Late rains", months: [9, 10],
    desc: "Second-season maize and cowpea in the South. Northern grains and legumes are harvested, and dry-season vegetable nurseries are started." }
];

// Returns the season object for a month number
function seasonOf(month) {
  return SEASONS.find(function (s) { return s.months.indexOf(month) !== -1; });
}

/* ===== 2. GEOPOLITICAL ZONES (REGIONS) ===== */
const ZONES = {
  NW: { name: "North-West",    color: "#c99400" },
  NE: { name: "North-East",    color: "#d36b2a" },
  NC: { name: "North-Central", color: "#6aa33a" },
  SW: { name: "South-West",    color: "#2e9e5b" },
  SE: { name: "South-East",    color: "#22867a" },
  SS: { name: "South-South",   color: "#2d6f9e" }
};
const ALL = ["NW", "NE", "NC", "SW", "SE", "SS"]; // shortcut: grown everywhere
const N = ["NW", "NE", "NC"];                    // shortcut: northern zones
const S = ["SW", "SE", "SS"];                    // shortcut: southern zones

/* ===== 3. STATES (36 + FCT) =====
   c = map column (0–7), r = map row (0–6), w/h = tile width/height in cells.
   eco = agro-ecological zone, rain = usual rainy months (general guide). */
const SAHEL = { eco: "Sudan–Sahel savanna (hot, short rains)", rain: "June – September" };
const NGS   = { eco: "Northern Guinea savanna", rain: "May – October" };
const SGS   = { eco: "Southern Guinea savanna", rain: "April – October" };
const DSAV  = { eco: "Derived savanna / forest edge", rain: "March – November (two peaks)" };
const RF    = { eco: "Humid rainforest", rain: "March – November (two peaks)" };
const SWAMP = { eco: "Mangrove & freshwater swamp forest", rain: "February/March – November (very wet)" };
const PLAT  = { eco: "Jos Plateau highland (cool, 1,200 m+)", rain: "April – October" };

const STATES = [
  // Row 0 – far north
  { n: "Sokoto",      ab: "SO", z: "NW", c: 1, r: 0, ...SAHEL },
  { n: "Zamfara",     ab: "ZA", z: "NW", c: 2, r: 0, ...SAHEL },
  { n: "Katsina",     ab: "KT", z: "NW", c: 3, r: 0, ...SAHEL },
  { n: "Kano",        ab: "KN", z: "NW", c: 4, r: 0, ...SAHEL },
  { n: "Jigawa",      ab: "JG", z: "NW", c: 5, r: 0, ...SAHEL },
  { n: "Yobe",        ab: "YB", z: "NE", c: 6, r: 0, ...SAHEL },
  { n: "Borno",       ab: "BO", z: "NE", c: 7, r: 0, ...SAHEL },
  // Row 1
  { n: "Kebbi",       ab: "KB", z: "NW", c: 1, r: 1, ...SAHEL },
  { n: "Niger",       ab: "NI", z: "NC", c: 2, r: 1, h: 2, ...SGS },
  { n: "Kaduna",      ab: "KD", z: "NW", c: 3, r: 1, ...NGS },
  { n: "Bauchi",      ab: "BA", z: "NE", c: 4, r: 1, w: 2, ...NGS },
  { n: "Gombe",       ab: "GM", z: "NE", c: 6, r: 1, ...NGS },
  { n: "Adamawa",     ab: "AD", z: "NE", c: 7, r: 1, ...NGS },
  // Row 2
  { n: "Kwara",       ab: "KW", z: "NC", c: 1, r: 2, ...SGS },
  { n: "FCT",         ab: "FC", z: "NC", c: 3, r: 2, ...SGS },
  { n: "Nasarawa",    ab: "NA", z: "NC", c: 4, r: 2, ...SGS },
  { n: "Plateau",     ab: "PL", z: "NC", c: 5, r: 2, ...PLAT },
  { n: "Taraba",      ab: "TA", z: "NE", c: 6, r: 2, w: 2, eco: "Southern Guinea savanna + Mambilla highland", rain: "April – October" },
  // Row 3
  { n: "Oyo",         ab: "OY", z: "SW", c: 0, r: 3, ...DSAV },
  { n: "Osun",        ab: "OS", z: "SW", c: 1, r: 3, ...DSAV },
  { n: "Ekiti",       ab: "EK", z: "SW", c: 2, r: 3, ...DSAV },
  { n: "Kogi",        ab: "KG", z: "NC", c: 3, r: 3, ...SGS },
  { n: "Benue",       ab: "BE", z: "NC", c: 4, r: 3, w: 2, ...SGS },
  // Row 4
  { n: "Ogun",        ab: "OG", z: "SW", c: 0, r: 4, ...RF },
  { n: "Ondo",        ab: "ON", z: "SW", c: 1, r: 4, ...RF },
  { n: "Edo",         ab: "ED", z: "SS", c: 2, r: 4, ...RF },
  { n: "Anambra",     ab: "AN", z: "SE", c: 3, r: 4, ...RF },
  { n: "Enugu",       ab: "EN", z: "SE", c: 4, r: 4, ...DSAV },
  { n: "Ebonyi",      ab: "EB", z: "SE", c: 5, r: 4, ...RF },
  { n: "Cross River", ab: "CR", z: "SS", c: 6, r: 4, ...RF },
  // Row 5
  { n: "Lagos",       ab: "LA", z: "SW", c: 0, r: 5, ...RF },
  { n: "Delta",       ab: "DE", z: "SS", c: 2, r: 5, ...RF },
  { n: "Imo",         ab: "IM", z: "SE", c: 3, r: 5, ...RF },
  { n: "Abia",        ab: "AB", z: "SE", c: 4, r: 5, ...RF },
  { n: "Akwa Ibom",   ab: "AK", z: "SS", c: 5, r: 5, ...RF },
  // Row 6 – coast
  { n: "Bayelsa",     ab: "BY", z: "SS", c: 2, r: 6, ...SWAMP },
  { n: "Rivers",      ab: "RI", z: "SS", c: 3, r: 6, ...SWAMP }
];

/* ===== 4. CROP GROUPS ===== */
const CATEGORIES = {
  cereal: "Grains & cereals",
  legume: "Legumes & oilseeds",
  root:   "Roots & tubers",
  veg:    "Fruit vegetables",
  leafy:  "Leafy vegetables",
  fruit:  "Fruits",
  tree:   "Tree & cash crops",
  spice:  "Spices & herbs",
  my:     "My entries"
};

/* ===== 5. CROP DATABASE =====
   Keys: n = name, l = local names, e = icon, c = group,
         p = planting months, h = harvest months,
         z = zones where it grows, st = best-known producing states,
         s = short season note, f = fact, t = quick tip,
         d = diseases/pests: [name, prevention/control] */
const CROPS = [
  /* ---------- GRAINS & CEREALS ---------- */
  { n: "Maize", l: "Agbado (Yoruba), Masara (Hausa), Ọka (Igbo)", e: "🌽", c: "cereal",
    p: [3, 4, 5, 6, 8], h: [6, 7, 8, 9, 10, 11], z: ALL,
    st: ["Kaduna", "Niger", "Plateau", "Katsina", "Kano", "Bauchi", "Taraba", "Oyo", "Benue"],
    s: "South: 1st season March–April, 2nd season August. North: May–June with the rains.",
    f: "Maize feeds both people and Nigeria's poultry and livestock feed industry. Green maize is eaten roasted or boiled; dry grain becomes pap (ogi), tuwo and feed.",
    t: "Planted early in the rainy season. Verify local dates. Dry cobs well before storing to prevent aflatoxin mould.",
    d: [["Maize streak virus (spread by leafhoppers)", "Plant resistant varieties, plant early and keep the farm weed-free."],
        ["Fall armyworm (pest)", "Scout fields weekly, crush egg masses and use recommended insecticides early, when larvae are small."]] },

  { n: "Rice", l: "Ìrẹsì (Yoruba), Shinkafa (Hausa), Osikapa (Igbo)", e: "🌾", c: "cereal",
    p: [1, 2, 5, 6, 7], h: [4, 5, 9, 10, 11, 12], z: ALL,
    st: ["Kebbi", "Kano", "Niger", "Ebonyi", "Benue", "Jigawa", "Kwara", "Nasarawa", "Taraba", "Kaduna"],
    s: "Rain-fed: nursery May–June, transplant June–July, harvest September–December. Irrigated dry season: December–February, harvest April–May.",
    f: "Kebbi State is famous for large irrigated rice farms, and Ebonyi is known for Abakaliki rice. Lowland rice needs a flooded or swampy field.",
    t: "Harvest when about 80–85% of grains turn straw-yellow. Dry paddy well before milling to avoid broken grains.",
    d: [["Rice blast (fungus)", "Use resistant varieties (e.g. FARO lines), avoid too much nitrogen fertiliser and use recommended fungicides."],
        ["Rice yellow mottle virus", "Use resistant varieties, remove volunteer and ratoon rice, and control insect vectors."]] },

  { n: "Sorghum (Guinea corn)", l: "Dawa (Hausa), Ọkà bàbà (Yoruba)", e: "🌾", c: "cereal",
    p: [5, 6, 7], h: [10, 11, 12], z: N,
    st: ["Kano", "Katsina", "Kaduna", "Bauchi", "Borno", "Gombe", "Niger", "Jigawa", "Zamfara", "Adamawa"],
    s: "Planted with the northern rains (May–July) and harvested as the dry season begins (October–December).",
    f: "Nigeria is one of Africa's largest sorghum producers. It is used for tuwo, kunu, ogi and the malt drinks industry.",
    t: "Thresh and dry grain thoroughly. Store in airtight bags off the floor.",
    d: [["Striga (witchweed, parasitic plant)", "Use Striga-tolerant varieties and rotate with legumes like cowpea or soybean."],
        ["Grain mould", "Choose varieties that mature after the rains stop and harvest on time."]] },

  { n: "Pearl millet", l: "Gero (Hausa), Jéró (Yoruba)", e: "🌾", c: "cereal",
    p: [5, 6, 7], h: [8, 9, 10], z: ["NW", "NE"],
    st: ["Sokoto", "Kebbi", "Katsina", "Kano", "Jigawa", "Yobe", "Borno", "Zamfara"],
    s: "Sown with the first good northern rains (May–July). Early millet is harvested from August.",
    f: "Pearl millet is one of the most drought-tolerant cereals and thrives in the sandy soils of the far north. It is used for fura and tuwo.",
    t: "Grows well with little rain. Harvest heads when grains are hard and dry.",
    d: [["Downy mildew (green ear disease)", "Treat seed with a recommended fungicide seed dressing and pull out infected plants."],
        ["Striga", "Rotate with legumes, use tolerant varieties and improve soil fertility."]] },

  { n: "Wheat", l: "Alkama (Hausa)", e: "🌾", c: "cereal",
    p: [11, 12], h: [2, 3, 4], z: ["NW", "NE"],
    st: ["Kano", "Jigawa", "Kebbi", "Sokoto", "Katsina", "Bauchi", "Borno", "Zamfara", "Gombe"],
    s: "Irrigated dry-season crop. Sow mid-November to mid-December; harvest February–April.",
    f: "Wheat needs the cool Harmattan nights of the far north, so in Nigeria it is grown in the dry season under irrigation.",
    t: "Sowing late exposes the crop to March heat and lowers yield. Sow on time.",
    d: [["Rust diseases (stem/leaf rust)", "Use resistant, recommended varieties and sow at the right time."],
        ["Termites and aphids", "Keep fields clean and use recommended controls when pest numbers rise."]] },

  { n: "Acha (Fonio)", l: "Acha (Hausa), Fonio", e: "🌾", c: "cereal",
    p: [5, 6, 7], h: [8, 9, 10, 11], z: ["NC", "NW", "NE"],
    st: ["Plateau", "Bauchi", "Kaduna", "Nasarawa", "Kebbi"],
    s: "Sown at the start of the rains; early types are ready in about 2–3 months.",
    f: "Acha is one of Africa's oldest cereals. Its tiny grains are gluten-free and it grows on poor, sandy soils.",
    t: "Weed early. The grains are tiny, so harvest before they shatter.",
    d: [["Weeds and lodging (falling over)", "Weed early and do not over-fertilise."],
        ["Bird damage", "Harvest on time and scare birds as the grain fills."]] },

  /* ---------- LEGUMES & OILSEEDS ---------- */
  { n: "Cowpea (Beans)", l: "Ẹ̀wà (Yoruba), Wake (Hausa), Agwa (Igbo)", e: "🫘", c: "legume",
    p: [7, 8, 9], h: [9, 10, 11], z: ALL,
    st: ["Kano", "Borno", "Katsina", "Kaduna", "Zamfara", "Sokoto", "Bauchi", "Gombe", "Yobe", "Niger"],
    s: "North: sown July–August so pods dry after the rains. South: sown August–September as a late-season crop.",
    f: "Nigeria is the world's largest producer and consumer of cowpea. In 2019 Nigeria approved a pod-borer-resistant (PBR) cowpea variety.",
    t: "Store dry beans in hermetic triple-layer (PICS) bags to stop weevils without chemicals.",
    d: [["Maruca pod borer & flower thrips (pests)", "Spray recommended insecticide at flowering and podding, or grow PBR cowpea."],
        ["Cowpea aphid-borne mosaic virus", "Use resistant varieties and clean seed; control aphids early."]] },

  { n: "Groundnut", l: "Ẹ̀pà (Yoruba), Gyaɗa (Hausa), Ahụekere (Igbo)", e: "🥜", c: "legume",
    p: [5, 6, 7], h: [8, 9, 10], z: ["NW", "NE", "NC"],
    st: ["Kano", "Jigawa", "Katsina", "Niger", "Bauchi", "Taraba", "Adamawa", "Kaduna", "Zamfara"],
    s: "Sown with the rains (May–July) and harvested 3–4 months later.",
    f: "In the 1960s, Kano's famous 'groundnut pyramids' made Nigeria a world leader in groundnut exports.",
    t: "Dry pods quickly after lifting. Damp groundnuts grow aflatoxin moulds.",
    d: [["Groundnut rosette virus (spread by aphids)", "Plant early, at the right close spacing, and use resistant (e.g. SAMNUT) varieties."],
        ["Leaf spots", "Rotate crops, remove old crop residues and use recommended fungicides."]] },

  { n: "Soybean", l: "Waken suya (Hausa)", e: "🫛", c: "legume",
    p: [6, 7], h: [10, 11], z: ["NC", "NW", "NE"],
    st: ["Benue", "Kaduna", "Nasarawa", "Niger", "Plateau", "Kwara", "Taraba", "Kogi"],
    s: "Sown June–July; harvested October–November when leaves drop and pods rattle.",
    f: "Benue State is Nigeria's leading soybean producer. The seed is about 40% protein and is used for soy milk, oil and animal feed.",
    t: "Harvest promptly. Over-dry pods split open and drop seeds.",
    d: [["Soybean rust", "Grow rust-resistant (TGX) varieties and plant early."],
        ["Frog-eye leaf spot", "Use clean seed and rotate with cereals."]] },

  { n: "Bambara groundnut", l: "Okpa (Igbo), Gurjiya (Hausa)", e: "🥜", c: "legume",
    p: [5, 6, 7], h: [9, 10, 11], z: ["NE", "NC", "NW", "SE"],
    st: ["Bauchi", "Gombe", "Plateau", "Adamawa", "Borno", "Benue", "Enugu"],
    s: "Sown with the rains and harvested about 4 months later.",
    f: "Bambara nut grows on poor soils where groundnut struggles. In the South-East it is ground and steamed to make okpa.",
    t: "Store dry seeds in airtight containers to stop weevils.",
    d: [["Cercospora leaf spot", "Rotate crops and plant clean seed."],
        ["Storage weevils", "Dry well and store in hermetic bags."]] },

  { n: "Pigeon pea", l: "Fio-fio (Igbo)", e: "🫛", c: "legume",
    p: [5, 6, 7], h: [11, 12, 1], z: ["NC", "SE", "SW", "NW"],
    st: ["Benue", "Enugu", "Kogi", "Ebonyi", "Kaduna", "Plateau", "Niger"],
    s: "Sown in the rains; long-duration types are harvested in the dry season (November–January).",
    f: "Pigeon pea is a hardy shrub with deep roots. It tolerates drought and adds nitrogen to the soil.",
    t: "Good for intercropping with maize or sorghum.",
    d: [["Fusarium wilt", "Grow resistant varieties and rotate the field."],
        ["Pod borers", "Monitor at flowering and control early."]] },

  { n: "African yam bean", l: "Azama / Ijiriji (Igbo), Sese (Yoruba)", e: "🫘", c: "legume",
    p: [4, 5, 6], h: [10, 11, 12], z: ["SE", "SS", "NC"],
    st: ["Enugu", "Anambra", "Ebonyi", "Imo", "Abia", "Cross River", "Benue"],
    s: "Sown early in the rains and staked like yam; harvested at the end of the year.",
    f: "This climbing legume produces edible seeds and, in some types, edible tubers.",
    t: "Provide stakes, as the vines climb several metres.",
    d: [["Pod-sucking bugs & pod borers", "Monitor pods and harvest promptly."],
        ["Leaf spot", "Remove infected leaves and rotate crops."]] },

  { n: "Sesame (Beniseed)", l: "Ridi (Hausa), Ìtànná (Yoruba)", e: "🌼", c: "legume",
    p: [6, 7], h: [9, 10, 11], z: ["NC", "NW", "NE"],
    st: ["Nasarawa", "Benue", "Jigawa", "Kano", "Katsina", "Gombe", "Yobe", "Taraba", "Kogi", "Plateau"],
    s: "Sown June–July; harvested September–November.",
    f: "Nigeria is one of the world's leading sesame exporters. The seeds are rich in oil.",
    t: "Cut when the lower capsules turn yellow, before they split, then dry upright in bundles.",
    d: [["Cercospora leaf spot", "Use clean seed and rotate crops."],
        ["Phyllody (spread by leafhoppers)", "Remove infected plants and plant on time."]] },

  { n: "Sunflower", l: "", e: "🌻", c: "legume",
    p: [7, 8], h: [10, 11], z: ["NW", "NE", "NC"],
    st: ["Kano", "Kaduna", "Bauchi", "Plateau", "Katsina", "Jigawa"],
    s: "Sown in the later rains so seeds mature in the dry weather.",
    f: "Sunflower seed is pressed for cooking oil and the cake is used in animal feed.",
    t: "Protect ripening heads from birds.",
    d: [["Downy mildew", "Use treated seed and rotate crops."],
        ["Bird damage", "Harvest on time and scare birds."]] },

  /* ---------- ROOTS & TUBERS ---------- */
  { n: "Cassava", l: "Ẹ̀gẹ́ / Gbaguda (Yoruba), Rogo (Hausa), Akpụ (Igbo)", e: "🍠", c: "root",
    p: [3, 4, 5, 6, 9, 10], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Benue", "Kogi", "Ogun", "Oyo", "Enugu", "Imo", "Cross River", "Akwa Ibom", "Delta", "Ondo", "Taraba", "Nasarawa"],
    s: "Stems are planted at the start of the rains (March–June) or late rains (September–October). Roots are ready 9–18 months later.",
    f: "Nigeria is the world's largest cassava producer. It becomes garri, fufu (akpu), lafun and starch.",
    t: "Roots spoil 2–3 days after harvest. Process into garri or flour quickly.",
    d: [["Cassava mosaic disease", "Plant clean stems of resistant varieties (e.g. TME 419) and uproot infected plants."],
        ["Cassava bacterial blight", "Use disease-free cuttings and rotate fields."]] },

  { n: "White yam", l: "Iṣu (Yoruba), Doya (Hausa), Ji (Igbo)", e: "🍠", c: "root",
    p: [2, 3, 4], h: [8, 9, 10, 11, 12], z: ["NC", "SE", "SW", "SS", "NE"],
    st: ["Benue", "Niger", "Taraba", "Nasarawa", "Kogi", "Oyo", "Enugu", "Ebonyi", "Kwara", "Plateau", "Cross River"],
    s: "Seed yams are planted February–April on mounds or ridges. New yam arrives from August; the main harvest is October–December.",
    f: "Nigeria grows about two-thirds of the world's yam. New Yam festivals across the South-East celebrate the harvest.",
    t: "Store tubers in a shaded, airy yam barn. Do not bruise tubers.",
    d: [["Yam anthracnose (leaf scorch)", "Plant tolerant varieties and clean seed yam; don't plant near old infected fields."],
        ["Nematodes (dry rot) & yam mosaic virus", "Use clean or hot-water-treated seed yam and rotate crops."]] },

  { n: "Water yam", l: "Ewura (Yoruba), Ji abana / Mbala (Igbo)", e: "🍠", c: "root",
    p: [3, 4, 5], h: [10, 11, 12, 1], z: ["SE", "SW", "SS", "NC"],
    st: ["Enugu", "Imo", "Anambra", "Ebonyi", "Abia", "Ogun", "Cross River", "Delta"],
    s: "Planted with the early rains and harvested from October.",
    f: "Water yam is used for ikokore (Yoruba) and ojojo, and stores well after harvest.",
    t: "Stake vines so leaves get full sunlight.",
    d: [["Yam anthracnose", "This yam is very susceptible. Use tolerant varieties and rotate fields."],
        ["Tuber rots", "Handle tubers gently and store in a cool, dry, airy place."]] },

  { n: "Cocoyam (Taro)", l: "Kókò (Yoruba), Gwaza (Hausa), Ede (Igbo)", e: "🥔", c: "root",
    p: [3, 4, 5], h: [9, 10, 11, 12], z: ["SE", "SS", "SW", "NC", "NW"],
    st: ["Enugu", "Imo", "Anambra", "Abia", "Ebonyi", "Kaduna", "Plateau", "Benue", "Cross River", "Akwa Ibom"],
    s: "Corms are planted early in the rains and harvested 6–9 months later.",
    f: "Nigeria is the world's largest producer of taro (cocoyam). It thickens soups like ofe onugbu and the leaves are eaten too.",
    t: "Grows best in moist, shaded spots.",
    d: [["Taro leaf blight", "Plant clean corms, space plants widely and use recommended copper fungicides."],
        ["Dasheen mosaic virus", "Use healthy planting material and remove infected plants."]] },

  { n: "Sweet potato", l: "Ọdunkun (Yoruba), Dankali (Hausa)", e: "🍠", c: "root",
    p: [4, 5, 6, 7], h: [8, 9, 10, 11], z: ALL,
    st: ["Kano", "Kaduna", "Kwara", "Niger", "Benue", "Plateau", "Nasarawa", "Oyo", "Ogun", "Kogi"],
    s: "Vine cuttings are planted in the rains and roots are ready in 3–5 months. It is also grown on irrigated fadama land.",
    f: "Orange-fleshed sweet potato varieties are rich in vitamin A.",
    t: "Harvest on time. Roots left too long get weevil damage.",
    d: [["Sweet potato weevil", "Hill soil over cracks, rotate fields and harvest promptly."],
        ["Sweet potato virus disease", "Plant clean vines from healthy fields."]] },

  { n: "Irish potato", l: "Dankalin Turawa (Hausa)", e: "🥔", c: "root",
    p: [4, 5, 10, 11], h: [1, 2, 7, 8], z: ["NC", "NW", "NE"],
    st: ["Plateau", "Kaduna", "Bauchi", "Kano", "Taraba"],
    s: "Jos Plateau: rain-fed April–May (harvest July–August) and irrigated dry season October–November (harvest January–February).",
    f: "Irish potato needs cool temperatures, which is why the Jos Plateau is Nigeria's main potato area.",
    t: "Store in a cool, dark, airy place so tubers don't turn green.",
    d: [["Late blight", "Use recommended fungicides in wet weather and plant tolerant varieties."],
        ["Bacterial wilt", "Plant certified seed tubers and rotate with cereals."]] },

  { n: "Tiger nut", l: "Aya (Hausa), Imumu (Yoruba)", e: "🌰", c: "root",
    p: [5, 6, 7], h: [9, 10, 11], z: ["NW", "NC"],
    st: ["Kano", "Katsina", "Kaduna", "Niger", "Kwara", "Jigawa", "Plateau"],
    s: "Planted with the rains and dug up about 3–4 months later.",
    f: "Tiger nut is not a true nut. It is a small tuber of a sedge plant, used for kunun aya.",
    t: "Grow in well-drained sandy soil, which makes harvesting easy.",
    d: [["Tuber rot in waterlogged soil", "Plant on well-drained land or ridges."],
        ["Weed competition", "Weed early; the crop is short and easily shaded."]] },

  /* ---------- FRUIT VEGETABLES ---------- */
  { n: "Tomato", l: "Tòmátì (Yoruba), Tumatur (Hausa)", e: "🍅", c: "veg",
    p: [3, 4, 9, 10, 11], h: [1, 2, 3, 4, 6, 7], z: ALL,
    st: ["Kano", "Kaduna", "Katsina", "Plateau", "Bauchi", "Gombe", "Jigawa", "Sokoto", "Benue", "Oyo", "Ogun"],
    s: "Main crop: nursery September–October, transplant October–November, harvest January–April in the North. Rain-fed crop: March–April.",
    f: "In 2016 the pest Tuta absoluta, nicknamed 'tomato ebola', destroyed many tomato farms in Kaduna and Kano.",
    t: "Pack fruits in plastic crates, not raffia baskets, to reduce crushing on the road.",
    d: [["Tuta absoluta (tomato leaf miner)", "Use pheromone traps, rotate crops, remove infested plants and use recommended insecticides."],
        ["Early & late blight", "Stake plants, space them well and use recommended fungicides such as mancozeb."],
        ["Bacterial wilt", "Rotate with cereals and avoid waterlogged soil."]] },

  { n: "Hot pepper", l: "Ata rodo / Shombo (Yoruba), Barkono (Hausa)", e: "🌶️", c: "veg",
    p: [3, 4, 9, 10], h: [6, 7, 8, 12, 1, 2, 3], z: ALL,
    st: ["Kano", "Kaduna", "Katsina", "Plateau", "Jigawa", "Oyo", "Ogun", "Benue"],
    s: "Rain-fed crop from March–April; irrigated dry-season crop from September–October.",
    f: "Ata rodo (scotch bonnet) gives Nigerian stew and pepper soup their heat.",
    t: "Pick fruits regularly to keep the plant producing.",
    d: [["Anthracnose (fruit rot)", "Use clean seed, remove rotten fruits and use recommended fungicides."],
        ["Pepper viruses (spread by aphids/whiteflies)", "Control insects early and uproot infected plants."]] },

  { n: "Sweet pepper (Tatashe)", l: "Tàtàṣé (Yoruba), Tattasai (Hausa)", e: "🫑", c: "veg",
    p: [9, 10, 11], h: [12, 1, 2, 3], z: ["NW", "NC", "NE"],
    st: ["Kano", "Kaduna", "Plateau", "Katsina", "Jigawa"],
    s: "Mostly a dry-season irrigated crop in the North.",
    f: "Tatashe is the large red pepper that gives stew its rich red colour.",
    t: "Water steadily. Uneven watering causes blossom-end rot.",
    d: [["Blossom-end rot (calcium problem)", "Water regularly and mulch to keep soil moisture even."],
        ["Anthracnose", "Remove rotten fruits and rotate crops."]] },

  { n: "Onion", l: "Àlùbọ́sà (Yoruba), Albasa (Hausa)", e: "🧅", c: "veg",
    p: [9, 10, 11, 12], h: [2, 3, 4], z: ["NW", "NE", "NC"],
    st: ["Sokoto", "Kano", "Kebbi", "Katsina", "Jigawa", "Zamfara", "Bauchi", "Kaduna", "Plateau"],
    s: "Nursery September–October, transplant November–December, harvest February–April.",
    f: "Most of Nigeria's onions come from the North-West, especially Sokoto and Kano.",
    t: "Cure bulbs in the shade for 2–3 weeks, then store in airy stores.",
    d: [["Purple blotch", "Rotate crops and use recommended fungicides."],
        ["Onion thrips", "Monitor leaves and control early."]] },

  { n: "Garlic", l: "Tafarnuwa (Hausa), Ayu (Yoruba)", e: "🧄", c: "veg",
    p: [10, 11], h: [2, 3], z: ["NW", "NC"],
    st: ["Kano", "Katsina", "Plateau", "Kaduna", "Jigawa", "Sokoto"],
    s: "Cloves are planted October–November in the cool dry season; harvested February–March.",
    f: "Garlic needs cool Harmattan nights to form good bulbs.",
    t: "Plant individual cloves, pointed end up.",
    d: [["White rot", "Rotate fields; don't replant garlic or onion on the same land soon."],
        ["Purple blotch", "Use recommended fungicides and good spacing."]] },

  { n: "Okra", l: "Ila (Yoruba), Kubewa (Hausa), Okwuru (Igbo)", e: "🫛", c: "veg",
    p: [3, 4, 5, 6, 7, 8], h: [5, 6, 7, 8, 9, 10], z: ALL,
    st: ["Benue", "Kogi", "Oyo", "Ogun", "Enugu", "Kano", "Kaduna", "Anambra"],
    s: "Sown through the rains (and in the dry season with irrigation). First pods in about 6–8 weeks.",
    f: "Nigeria is one of the world's leading okra producers. Dried okra (kubewa) thickens northern soups.",
    t: "Harvest young, tender pods every 2–3 days.",
    d: [["Okra mosaic / leaf curl virus (whitefly)", "Use tolerant varieties and control whiteflies early."],
        ["Cercospora leaf spot", "Space plants well and remove infected leaves."]] },

  { n: "Garden egg", l: "Igba (Yoruba), Añara (Igbo), Gauta (Hausa)", e: "🍆", c: "veg",
    p: [3, 4, 5, 9], h: [6, 7, 8, 9, 12, 1], z: ALL,
    st: ["Enugu", "Anambra", "Imo", "Oyo", "Ogun", "Benue", "Kogi", "Kaduna"],
    s: "Raised in a nursery and transplanted in the rains; fruits in about 2–3 months.",
    f: "Garden egg is offered to guests at many Igbo ceremonies and is eaten raw or in sauces.",
    t: "Pick fruits while firm and shiny.",
    d: [["Bacterial wilt", "Rotate with cereals and avoid waterlogged land."],
        ["Fruit and shoot borer", "Remove damaged shoots and fruits and destroy them."]] },

  { n: "Cucumber", l: "Kokwamba (Hausa)", e: "🥒", c: "veg",
    p: [3, 4, 9, 10, 11], h: [5, 6, 11, 12, 1], z: ALL,
    st: ["Kano", "Kaduna", "Plateau", "Oyo", "Ogun", "Lagos", "Benue"],
    s: "Grows fast: fruits from about 45–60 days after sowing.",
    f: "Cucumber is a quick-cash crop for young farmers because it matures in under two months.",
    t: "Train vines on stakes or trellis for straighter, cleaner fruits.",
    d: [["Downy & powdery mildew", "Space for airflow and use recommended fungicides."],
        ["Fruit flies", "Use traps and remove stung fruits."]] },

  { n: "Egusi melon", l: "Egusi (Yoruba/Igbo), Agushi (Hausa)", e: "🍈", c: "veg",
    p: [4, 5, 6], h: [7, 8, 9], z: ["NC", "SW", "SE"],
    st: ["Benue", "Kogi", "Oyo", "Ogun", "Enugu", "Ondo", "Kwara", "Nasarawa", "Ekiti"],
    s: "Sown early in the rains, often intercropped with maize or yam.",
    f: "Egusi is grown for its seeds, which are ground to make the much-loved egusi soup.",
    t: "Let fruits rot or ferment briefly, then wash and sun-dry the seeds.",
    d: [["Anthracnose", "Use clean seed and rotate crops."],
        ["Powdery mildew", "Remove infected leaves and avoid crowding."]] },

  { n: "Green beans", l: "", e: "🫛", c: "veg",
    p: [9, 10, 11], h: [11, 12, 1, 2], z: ["NC", "NW"],
    st: ["Plateau", "Kaduna", "Kano"],
    s: "A cool-season crop grown mostly on the Jos Plateau and in irrigated northern gardens.",
    f: "Green beans are picked as young pods, about 50–60 days after sowing.",
    t: "Pick pods before seeds bulge.",
    d: [["Bean rust", "Use resistant varieties and avoid wetting leaves."],
        ["Anthracnose", "Plant clean seed and rotate crops."]] },

  { n: "Cabbage", l: "Kabeji (Hausa)", e: "🥬", c: "veg",
    p: [9, 10, 11], h: [12, 1, 2, 3], z: ["NC", "NW", "NE"],
    st: ["Plateau", "Kano", "Kaduna", "Bauchi", "Taraba"],
    s: "Year-round on the cool Jos Plateau; dry-season crop elsewhere in the North.",
    f: "Cabbage forms firm heads best in cool weather, which is why Plateau supplies much of Nigeria.",
    t: "Harvest heads when firm. Leaving them too long makes them split.",
    d: [["Diamondback moth (pest)", "Use Bt-based or recommended insecticides and rotate products."],
        ["Black rot", "Use clean seed and rotate with non-cabbage crops."]] },

  { n: "Carrot", l: "Karas (Hausa)", e: "🥕", c: "veg",
    p: [9, 10, 11], h: [12, 1, 2, 3], z: ["NC", "NW"],
    st: ["Plateau", "Kano", "Kaduna"],
    s: "Cool-season crop sown directly; ready in about 3 months.",
    f: "Carrots are sown directly in the bed. Transplanting damages the root.",
    t: "Use loose, stone-free soil for straight roots.",
    d: [["Root-knot nematodes", "Rotate with cereals and avoid infested beds."],
        ["Alternaria leaf blight", "Use recommended fungicides and clean seed."]] },

  { n: "Pumpkin", l: "Elegede (Yoruba), Kabewa (Hausa)", e: "🎃", c: "veg",
    p: [4, 5, 6], h: [8, 9, 10], z: ALL,
    st: ["Kano", "Kaduna", "Benue", "Plateau", "Oyo", "Bauchi"],
    s: "Sown at the start of the rains; fruits mature in 3–4 months.",
    f: "Both the fruit and the young leaves of pumpkin are eaten in Nigeria.",
    t: "Harvest when the skin hardens and the stem dries.",
    d: [["Powdery mildew", "Space plants and remove badly infected leaves."],
        ["Fruit flies", "Bag young fruits or use traps."]] },

  /* ---------- LEAFY VEGETABLES ---------- */
  { n: "Amaranth (Efo tete)", l: "Ẹ̀fọ́ tẹ̀tẹ̀ (Yoruba), Alayyahu (Hausa)", e: "🥬", c: "leafy",
    p: [3, 4, 5, 6, 7, 8, 9, 10], h: [4, 5, 6, 7, 8, 9, 10, 11], z: ALL,
    st: ["Oyo", "Lagos", "Ogun", "Kano", "Kaduna", "Enugu", "Plateau"],
    s: "Sown all through the rains (year-round with watering). Ready in 3–5 weeks.",
    f: "Amaranth is one of the fastest cash crops for small gardens and is used for efo riro.",
    t: "Sow in batches every 2–3 weeks for a steady supply.",
    d: [["Damping-off & wet rot", "Don't overwater seedlings and give good drainage."],
        ["Leaf caterpillars", "Hand-pick or use recommended controls."]] },

  { n: "Celosia (Soko)", l: "Ṣọ̀kọ̀ (Yoruba), Lagos spinach", e: "🌿", c: "leafy",
    p: [3, 4, 5, 6, 7, 8, 9], h: [4, 5, 6, 7, 8, 9, 10], z: S,
    st: ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
    s: "Sown through the rains; first cutting after about 4–6 weeks.",
    f: "Ṣọ̀kọ̀ is a favourite leafy vegetable in South-West Nigeria for efo riro.",
    t: "Cut stems above a leaf node to let new shoots regrow.",
    d: [["Leaf spot", "Remove infected leaves and avoid overhead watering in the evening."],
        ["Root-knot nematodes", "Rotate beds."]] },

  { n: "Fluted pumpkin (Ugu)", l: "Ugu (Igbo), Ìkọn (Efik/Ibibio)", e: "🍃", c: "leafy",
    p: [3, 4, 5], h: [5, 6, 7, 8, 9, 10, 11, 12], z: ["SE", "SS", "SW"],
    st: ["Imo", "Anambra", "Abia", "Enugu", "Akwa Ibom", "Cross River", "Rivers", "Delta", "Lagos"],
    s: "Seeds are planted early in the rains; leaves are cut repeatedly for months.",
    f: "Ugu is native to southern Nigeria. It has separate male and female plants.",
    t: "Plant the whole seed on its side and provide a support for vines.",
    d: [["Leaf spot", "Remove spotted leaves and avoid crowding."],
        ["Mosaic virus", "Uproot infected plants and control insect vectors."]] },

  { n: "Jute mallow (Ewedu)", l: "Ewédú (Yoruba), Ayoyo / Lalo (Hausa)", e: "🌿", c: "leafy",
    p: [4, 5, 6, 7], h: [5, 6, 7, 8, 9], z: ["SW", "NW", "NC"],
    st: ["Oyo", "Ogun", "Osun", "Kano", "Kaduna", "Kwara"],
    s: "Sown in the rains; leaves are picked from about 5–6 weeks.",
    f: "Ewedu seeds have a hard coat. Soaking them in hot water before sowing helps them sprout.",
    t: "Soak seeds in hot water before sowing for better germination.",
    d: [["Damping-off", "Use well-drained beds."],
        ["Flea beetles", "Use recommended controls when holes appear."]] },

  { n: "Waterleaf", l: "Gbure (Yoruba)", e: "🌿", c: "leafy",
    p: [3, 4, 5, 6], h: [4, 5, 6, 7, 8, 9, 10, 11], z: ["SS", "SE", "SW"],
    st: ["Cross River", "Akwa Ibom", "Rivers", "Delta", "Lagos", "Ogun"],
    s: "Grows readily from stem cuttings in moist soil through the rains.",
    f: "Waterleaf is a key ingredient of edikang ikong soup from Akwa Ibom and Cross River.",
    t: "Plant cuttings in moist, partly shaded beds.",
    d: [["Leaf spot", "Remove spotted leaves."],
        ["Root-knot nematodes", "Rotate beds."]] },

  { n: "Bitter leaf", l: "Onugbu (Igbo), Ewúro (Yoruba), Shiwaka (Hausa)", e: "🌿", c: "leafy",
    p: [3, 4, 5], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Anambra", "Enugu", "Imo", "Oyo", "Ogun", "Benue"],
    s: "Stem cuttings are planted early in the rains; leaves are harvested all year.",
    f: "Bitter leaf is a perennial shrub used to make ofe onugbu (bitter leaf soup).",
    t: "Prune regularly to keep a bushy plant with lots of young leaves.",
    d: [["Aphids & leaf beetles", "Spray with clean water or use recommended controls."],
        ["Few serious diseases", "Keep beds weed-free."]] },

  { n: "Scent leaf", l: "Nchanwu (Igbo), Efinrin (Yoruba), Daidoya (Hausa)", e: "🌿", c: "spice",
    p: [3, 4, 5], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Enugu", "Imo", "Oyo", "Delta", "Edo"],
    s: "Grown from seed or cuttings early in the rains; harvested all year.",
    f: "Scent leaf (African basil) flavours pepper soup and many sauces.",
    t: "Pinch off flower heads to keep leaves tender.",
    d: [["Aphids", "Spray with water or neem extract."],
        ["Root rot", "Avoid waterlogged soil."]] },

  { n: "Lettuce", l: "", e: "🥗", c: "leafy",
    p: [9, 10, 11], h: [11, 12, 1, 2], z: ["NC", "NW", "SW"],
    st: ["Plateau", "Kano", "Kaduna", "Lagos"],
    s: "Best in the cool dry season; ready about 6–8 weeks after transplanting.",
    f: "Lettuce 'bolts' (runs to seed and turns bitter) in very hot weather.",
    t: "Water in the morning and give light shade when it is hot.",
    d: [["Downy mildew", "Avoid wetting leaves late in the day."],
        ["Bolting in heat", "Plant in the cool season or on the Plateau."]] },

  { n: "Moringa", l: "Zogale (Hausa)", e: "🌿", c: "leafy",
    p: [4, 5, 6, 7], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Kano", "Kaduna", "Katsina", "Sokoto", "Oyo", "Kwara", "Niger"],
    s: "Planted from seed or cuttings in the rains; leaves can be cut all year.",
    f: "Moringa leaves are very nutritious and are eaten as zogale salad in the North.",
    t: "Cut back to about 1 metre to keep leaves within reach.",
    d: [["Leaf caterpillars", "Hand-pick or use recommended controls."],
        ["Root rot in wet soil", "Plant on well-drained land."]] },

  { n: "Roselle (Zobo)", l: "Yakuwa (Hausa), Zobo", e: "🌺", c: "leafy",
    p: [6, 7], h: [10, 11, 12], z: ["NW", "NE", "NC"],
    st: ["Kano", "Katsina", "Jigawa", "Kaduna", "Bauchi", "Gombe", "Sokoto", "Borno"],
    s: "Sown in the rains; flowers as days shorten and red calyces are picked October–December.",
    f: "The dried red calyces are used to make zobo drink. The leaves (yakuwa) are also eaten.",
    t: "Pick calyces when plump and dry them in the shade to keep the colour.",
    d: [["Leaf spot", "Rotate crops and remove infected leaves."],
        ["Root and stem rot", "Avoid waterlogged fields."]] },

  /* ---------- FRUITS ---------- */
  { n: "Watermelon", l: "Kankana (Hausa)", e: "🍉", c: "fruit",
    p: [10, 11, 12, 1], h: [1, 2, 3, 4], z: ["NW", "NE", "NC"],
    st: ["Kano", "Katsina", "Jigawa", "Sokoto", "Kebbi", "Bauchi", "Kaduna", "Zamfara"],
    s: "Grown in the dry season on sandy, irrigated land; harvested about 3 months after sowing.",
    f: "Watermelon loves sun and sandy soil, so the North supplies much of Nigeria's dry-season melons.",
    t: "Ripe melons sound hollow when tapped and have a yellow ground spot.",
    d: [["Fusarium wilt", "Rotate fields and use resistant varieties."],
        ["Anthracnose", "Use clean seed and recommended fungicides."]] },

  { n: "Pineapple", l: "Ọ̀pẹ òyìnbó (Yoruba), Abarba (Hausa)", e: "🍍", c: "fruit",
    p: [3, 4, 5], h: [11, 12, 1, 2, 3, 4], z: ["SW", "SS", "SE", "NC"],
    st: ["Edo", "Ogun", "Osun", "Oyo", "Delta", "Cross River", "Lagos", "Kwara"],
    s: "Suckers are planted early in the rains; first fruits come 18–24 months later. Most fruit is sold in the dry season.",
    f: "Edo and Ogun states are known for large pineapple farms.",
    t: "Plant healthy suckers in well-drained soil.",
    d: [["Mealybug wilt", "Plant clean suckers and control the ants that carry mealybugs."],
        ["Heart rot", "Plant on well-drained land and avoid injuring plants."]] },

  { n: "Plantain", l: "Ọ̀gẹ̀dẹ̀ àgbagbà (Yoruba), Ogede (Igbo)", e: "🍌", c: "fruit",
    p: [3, 4, 5], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["SW", "SS", "SE"],
    st: ["Ondo", "Edo", "Delta", "Rivers", "Ogun", "Osun", "Cross River", "Imo", "Akwa Ibom", "Anambra"],
    s: "Suckers are planted early in the rains; bunches are ready about 10–14 months later, so harvest goes on all year.",
    f: "Nigeria is one of the biggest plantain producers in West and Central Africa. Dodo and boli are favourite snacks.",
    t: "Prop heavy bunches with a pole to stop plants falling.",
    d: [["Black Sigatoka (leaf spot)", "Cut off and destroy infected leaves and plant resistant hybrids (e.g. PITA)."],
        ["Banana weevil", "Plant clean, pared suckers and keep the field clean."]] },

  { n: "Banana", l: "Ọ̀gẹ̀dẹ̀ wẹ́wẹ́ (Yoruba), Ayaba (Hausa)", e: "🍌", c: "fruit",
    p: [3, 4, 5], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["SW", "SS", "SE", "NC", "NW"],
    st: ["Ogun", "Oyo", "Osun", "Ondo", "Delta", "Edo", "Cross River", "Kaduna"],
    s: "Planted early in the rains; harvested all year after the first 9–12 months.",
    f: "Banana bunchy top disease was confirmed in Nigeria in 2012 and threatens banana and plantain.",
    t: "Remove extra suckers, keeping one strong follower per plant.",
    d: [["Banana bunchy top virus", "Uproot and destroy infected plants; plant only clean suckers."],
        ["Black Sigatoka", "Remove infected leaves and use resistant varieties."]] },

  { n: "Pawpaw (Papaya)", l: "Ìbẹ́pẹ (Yoruba), Gwanda (Hausa)", e: "🍈", c: "fruit",
    p: [4, 5, 6], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Oyo", "Ogun", "Lagos", "Edo", "Delta", "Benue", "Kaduna", "Kano"],
    s: "Seedlings are planted in the rains; fruiting starts after about 8–10 months and continues all year.",
    f: "Pawpaw is one of the fastest fruit trees to bear and is rich in vitamin C.",
    t: "Plant on well-drained soil. Standing water kills pawpaw.",
    d: [["Papaya ringspot virus", "Uproot infected trees and control aphids."],
        ["Anthracnose (fruit spots)", "Harvest on time and remove rotten fruits."]] },

  { n: "Mango", l: "Mangoro", e: "🥭", c: "fruit",
    p: [6, 7], h: [2, 3, 4, 5, 6], z: ["NC", "NW", "NE", "SW"],
    st: ["Benue", "Kaduna", "Niger", "Kogi", "Plateau", "Nasarawa", "Oyo", "Kano"],
    s: "Seedlings are planted in the rains; fruits ripen mainly February–June.",
    f: "Benue State is famous for mangoes. Grafted trees can fruit in 3–4 years.",
    t: "Plant grafted seedlings for faster and better fruit.",
    d: [["Anthracnose", "Prune for airflow and use recommended copper fungicides at flowering."],
        ["Fruit flies", "Use traps and collect and bury fallen fruits."]] },

  { n: "Sweet orange", l: "Ọsàn (Yoruba), Lemu (Hausa)", e: "🍊", c: "fruit",
    p: [6, 7], h: [9, 10, 11, 12, 1, 2], z: ["NC", "SW", "SE", "SS", "NW"],
    st: ["Benue", "Nasarawa", "Kogi", "Oyo", "Ogun", "Osun", "Ekiti", "Kaduna", "Plateau"],
    s: "Budded seedlings are planted in the rains; the main harvest is late in the year.",
    f: "Benue is one of Nigeria's major orange-producing states. Budded trees fruit after about 3–5 years.",
    t: "Plant budded (grafted) seedlings from a trusted nursery.",
    d: [["Gummosis / foot rot", "Plant on well-drained land and keep soil away from the trunk."],
        ["Citrus aphids & fruit flies", "Monitor and control early; collect fallen fruits."]] },

  { n: "Lime & Lemon", l: "Ọsàn wẹ́wẹ́ (Yoruba)", e: "🍋", c: "fruit",
    p: [6, 7], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["NC", "SW", "SE", "SS", "NW"],
    st: ["Benue", "Ogun", "Oyo", "Kaduna", "Plateau", "Kogi"],
    s: "Planted in the rains; mature trees bear small crops through much of the year.",
    f: "Limes often fruit several times a year in Nigeria's warm climate.",
    t: "Water young trees in the first dry season.",
    d: [["Citrus canker / scab", "Prune infected twigs and use recommended copper sprays."],
        ["Foot rot", "Ensure good drainage."]] },

  { n: "Guava", l: "Gilofa (Yoruba), Gwaiba (Hausa)", e: "🍐", c: "fruit",
    p: [6, 7], h: [7, 8, 9, 12, 1], z: ALL,
    st: ["Oyo", "Ogun", "Kaduna", "Benue", "Plateau", "Kano"],
    s: "Planted in the rains; many trees fruit in two flushes a year.",
    f: "Guava is very rich in vitamin C.",
    t: "Pick fruits just as they soften and turn yellow-green.",
    d: [["Fruit flies", "Bag fruits or use traps; destroy fallen fruits."],
        ["Anthracnose", "Prune and remove infected fruits."]] },

  { n: "Cashew", l: "Kaju (Yoruba), Kanju (Hausa)", e: "🌰", c: "tree",
    p: [6, 7], h: [2, 3, 4, 5], z: ["NC", "SW", "SE", "NW"],
    st: ["Kogi", "Oyo", "Enugu", "Kwara", "Niger", "Nasarawa", "Benue", "Ogun", "Osun", "Ekiti", "Kaduna"],
    s: "Planted in the rains; nuts are gathered in the dry season (February–May).",
    f: "Kogi is a leading cashew state, and Nigeria exports a lot of raw cashew nuts.",
    t: "Pick up fallen nuts often and sun-dry them before storing.",
    d: [["Powdery mildew of flowers", "Use recommended fungicides at flowering."],
        ["Stem borer", "Inspect trunks and remove borer larvae."]] },

  { n: "African pear (Ube)", l: "Ube (Igbo)", e: "🫐", c: "fruit",
    p: [6, 7], h: [5, 6, 7, 8, 9], z: ["SE", "SS"],
    st: ["Imo", "Anambra", "Enugu", "Abia", "Ebonyi", "Cross River", "Akwa Ibom", "Delta", "Edo"],
    s: "Planted in the rains; fruits ripen in the rainy season.",
    f: "Ube is softened in warm water or roasted and eaten with roasted maize.",
    t: "Pick ripe purple fruits carefully; they bruise easily.",
    d: [["Fruit rot & drop", "Harvest on time and keep the base clean."],
        ["Stem borers", "Inspect trees and remove borers."]] },

  { n: "Avocado", l: "", e: "🥑", c: "fruit",
    p: [6, 7], h: [5, 6, 7, 8, 9], z: ["NC", "SW", "SS", "NE", "NW"],
    st: ["Plateau", "Kaduna", "Cross River", "Ogun", "Oyo", "Taraba", "Benue"],
    s: "Planted in the rains; the main fruit season is in the middle of the year.",
    f: "Grafted avocado trees fruit in about 3–4 years; seedlings take longer.",
    t: "Avocado ripens after picking. Leave it to soften at room temperature.",
    d: [["Phytophthora root rot", "Plant on well-drained soil."],
        ["Anthracnose", "Harvest carefully and avoid bruising."]] },

  { n: "Coconut", l: "Àgbọn (Yoruba), Kwakwa (Hausa)", e: "🥥", c: "tree",
    p: [4, 5, 6, 7], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["SW", "SS"],
    st: ["Lagos", "Ogun", "Rivers", "Akwa Ibom", "Cross River", "Bayelsa", "Delta", "Ondo"],
    s: "Seedlings are planted in the rains; mature palms give nuts all year.",
    f: "Coconut thrives in sandy coastal soils, like the Badagry coast in Lagos.",
    t: "Plant at least 8–9 m apart for good sunlight.",
    d: [["Lethal yellowing-type disease (Awka wilt)", "Cut and burn infected palms quickly; plant tolerant varieties."],
        ["Rhinoceros beetle", "Remove rotting logs where larvae breed."]] },

  { n: "Date palm", l: "Dabino (Hausa)", e: "🌴", c: "tree",
    p: [6, 7, 8], h: [4, 5, 6, 7], z: ["NW", "NE"],
    st: ["Borno", "Yobe", "Jigawa", "Kano", "Katsina", "Sokoto", "Kebbi", "Bauchi"],
    s: "Offshoots are planted in the rains; fruits ripen in the hot dry months before the rains.",
    f: "NIFOR runs a date palm research substation in Dutse, Jigawa State.",
    t: "Plant offshoots from proven female palms.",
    d: [["Graphiola leaf spot (false smut)", "Prune infected leaves."],
        ["Scale insects", "Prune and use recommended controls."]] },

  { n: "African star apple", l: "Agbalumo (Yoruba), Udara (Igbo)", e: "🍑", c: "fruit",
    p: [6, 7], h: [12, 1, 2, 3], z: ["SW", "SE", "SS"],
    st: ["Oyo", "Ogun", "Osun", "Ondo", "Ekiti", "Edo", "Enugu", "Anambra", "Imo"],
    s: "Planted in the rains; fruits fall in the dry season (December–March).",
    f: "Agbalumo season is a much-loved dry-season treat across southern Nigeria.",
    t: "Collect fallen fruits daily.",
    d: [["Fruit rot", "Pick up fallen fruits quickly."],
        ["Few serious diseases", "Keep the area under the tree clean."]] },

  /* ---------- TREE & CASH CROPS ---------- */
  { n: "Cocoa", l: "Koko", e: "🍫", c: "tree",
    p: [4, 5, 6], h: [10, 11, 12, 1, 2, 5, 6, 7], z: ["SW", "SS", "SE", "NC", "NE"],
    st: ["Ondo", "Cross River", "Osun", "Ogun", "Oyo", "Ekiti", "Edo", "Abia", "Akwa Ibom", "Kogi", "Kwara", "Taraba"],
    s: "Seedlings are transplanted early in the rains. Main crop: October–February; light crop: May–July.",
    f: "Nigeria is one of the world's top cocoa producers, and Ondo is the leading cocoa state.",
    t: "Ferment beans 5–6 days, then sun-dry well to get good quality.",
    d: [["Black pod disease", "Remove infected pods and use recommended copper fungicides in the rainy season."],
        ["Capsids/mirids (pests)", "Use recommended insecticides and manage shade."]] },

  { n: "Oil palm", l: "Ọ̀pẹ (Yoruba), Nkwụ (Igbo), Kwakwar manja (Hausa)", e: "🌴", c: "tree",
    p: [4, 5, 6, 7], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["SS", "SE", "SW"],
    st: ["Akwa Ibom", "Cross River", "Rivers", "Imo", "Abia", "Delta", "Edo", "Ondo", "Anambra", "Ogun"],
    s: "Seedlings are planted in the rains; bunches are cut all year, with a peak in the early part of the year.",
    f: "NIFOR in Benin City develops improved high-yield tenera oil palm seedlings.",
    t: "Process fresh fruit bunches within 1–2 days for good-quality oil.",
    d: [["Fusarium vascular wilt", "Plant tolerant seedlings from NIFOR or approved nurseries."],
        ["Ganoderma basal stem rot", "Remove old stumps when replanting."]] },

  { n: "Rubber", l: "Roba", e: "🌳", c: "tree",
    p: [6, 7], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["SS", "SW", "SE"],
    st: ["Edo", "Delta", "Ondo", "Ogun", "Cross River", "Akwa Ibom", "Imo", "Abia", "Bayelsa"],
    s: "Budded stumps are planted in the rains; tapping starts after 6–7 years.",
    f: "Nigeria's Rubber Research Institute (RRIN) is at Iyanomo, Edo State.",
    t: "Tap in the early morning when latex flows best.",
    d: [["Leaf fall diseases", "Plant tolerant clones."],
        ["White root disease", "Remove infected roots and old stumps."]] },

  { n: "Cotton", l: "Òwú (Yoruba), Auduga (Hausa)", e: "☁️", c: "tree",
    p: [6, 7], h: [10, 11, 12], z: ["NW", "NE", "NC"],
    st: ["Katsina", "Zamfara", "Kano", "Kaduna", "Gombe", "Bauchi", "Adamawa", "Borno", "Kebbi", "Sokoto"],
    s: "Sown June–July; bolls are picked October–December.",
    f: "Nigeria approved insect-resistant Bt cotton for commercial planting in 2018.",
    t: "Pick only fully open, dry bolls, and keep lint clean.",
    d: [["Bollworms", "Grow Bt cotton or use recommended insecticides."],
        ["Bacterial blight", "Use acid-delinted or treated seed and rotate crops."]] },

  { n: "Sugarcane", l: "Ìrèké (Yoruba), Rake (Hausa)", e: "🎋", c: "tree",
    p: [3, 4, 5, 11, 12], h: [11, 12, 1, 2, 3, 4], z: ["NC", "NW", "NE", "SW"],
    st: ["Kwara", "Niger", "Kano", "Kaduna", "Jigawa", "Adamawa", "Taraba", "Kebbi"],
    s: "Setts are planted with the rains or under irrigation; cane is harvested in the dry season.",
    f: "Large sugar estates include Bacita (Kwara) and Savannah Sugar at Numan (Adamawa).",
    t: "Plant healthy setts with 2–3 buds each.",
    d: [["Sugarcane smut", "Plant resistant varieties and healthy setts."],
        ["Red rot", "Avoid infected setts and waterlogged fields."]] },

  { n: "Kola nut", l: "Obì (Yoruba/Igbo), Goro (Hausa)", e: "🌰", c: "tree",
    p: [6, 7], h: [10, 11, 12, 1, 2], z: ["SW", "NC", "SS"],
    st: ["Ogun", "Osun", "Oyo", "Ondo", "Ekiti", "Kwara", "Kogi", "Edo"],
    s: "Seedlings are planted in the rains; the main harvest is October–February.",
    f: "Nigeria is one of the world's leading kola nut producers. Kola is shared to welcome guests in many cultures.",
    t: "Cure nuts in baskets lined with fresh leaves to keep them moist.",
    d: [["Kola weevil", "Harvest on time and store nuts carefully."],
        ["Pod rot", "Remove rotten pods."]] },

  { n: "Shea tree", l: "Kaɗanya (Hausa), Emi (Yoruba)", e: "🌳", c: "tree",
    p: [6, 7], h: [4, 5, 6, 7, 8], z: ["NC", "NW", "NE", "SW"],
    st: ["Niger", "Kwara", "Oyo", "Kebbi", "Kaduna", "Kogi", "Nasarawa", "FCT", "Benue", "Bauchi"],
    s: "Fruits are gathered from about April to August, mostly from wild trees.",
    f: "Nigeria is the world's largest shea nut producer. Niger, Kwara and Oyo have the biggest shea areas.",
    t: "Boil and dry nuts soon after collection to avoid mould.",
    d: [["Mistletoe (parasitic plant)", "Cut mistletoe off the branches."],
        ["Bush burning", "Protect young trees from fire."]] },

  { n: "Locust bean (Iru)", l: "Ìrú (Yoruba), Dawadawa (Hausa)", e: "🌳", c: "tree",
    p: [6, 7], h: [2, 3, 4, 5], z: ["NC", "NW", "SW", "NE"],
    st: ["Kwara", "Niger", "Oyo", "Kaduna", "Kogi", "Benue", "Kebbi", "Nasarawa", "Bauchi"],
    s: "Pods ripen in the dry season, mostly from wild savanna trees.",
    f: "The seeds are fermented to make iru / dawadawa, a strong-smelling soup seasoning.",
    t: "Collect ripe pods before they split.",
    d: [["Pod borers", "Collect pods on time."],
        ["Bush burning", "Protect trees from fire."]] },

  { n: "Coffee (Robusta)", l: "Kofi", e: "☕", c: "tree",
    p: [6, 7], h: [11, 12, 1, 2], z: ["SW", "NC", "SS", "NE"],
    st: ["Kogi", "Kwara", "Ondo", "Oyo", "Ekiti", "Cross River", "Edo", "Taraba"],
    s: "Planted in the rains; red cherries are picked in the dry season.",
    f: "Robusta coffee grows in the lowlands; Arabica coffee suits the cool Mambilla Plateau in Taraba.",
    t: "Pick only red, ripe cherries.",
    d: [["Coffee berry borer", "Pick all ripe and fallen berries."],
        ["Leaf rust", "Plant tolerant varieties and prune."]] },

  { n: "Tea", l: "Shayi (Hausa)", e: "🍵", c: "tree",
    p: [4, 5, 6], h: [4, 5, 6, 7, 8, 9, 10], z: ["NE"],
    st: ["Taraba"],
    s: "Planted in the rains; leaves are plucked every 1–2 weeks while it rains.",
    f: "Nigeria's main tea estate is on the cool, high Mambilla Plateau in Taraba State.",
    t: "Pluck 'two leaves and a bud' for the best tea.",
    d: [["Root diseases", "Remove infected bushes and old stumps."],
        ["Pests like mites", "Prune and monitor regularly."]] },

  { n: "Gum arabic (Acacia)", l: "Ɗakwara (Hausa)", e: "🌳", c: "tree",
    p: [7, 8], h: [11, 12, 1, 2, 3], z: ["NE", "NW"],
    st: ["Borno", "Yobe", "Jigawa", "Bauchi", "Gombe", "Adamawa", "Kano", "Katsina", "Sokoto", "Zamfara"],
    s: "Trees are tapped after the rains and the gum is collected in the dry season.",
    f: "Acacia trees produce gum arabic and also help stop desert spread in the far north.",
    t: "Collect clean, light-coloured gum lumps for the best price.",
    d: [["Termites on seedlings", "Protect young seedlings and water them during dry spells."],
        ["Over-tapping", "Tap correctly so trees recover."]] },

  /* ---------- SPICES ---------- */
  { n: "Ginger", l: "Citta (Hausa), Atalẹ̀ (Yoruba)", e: "🫚", c: "spice",
    p: [4, 5], h: [12, 1, 2], z: ["NW", "NC"],
    st: ["Kaduna", "Nasarawa", "Plateau", "FCT", "Niger", "Benue"],
    s: "Rhizomes are planted April–May; dry ginger is harvested December–February.",
    f: "Southern Kaduna grows most of Nigeria's ginger. In 2023 a blight outbreak destroyed thousands of hectares of ginger there.",
    t: "Use clean seed rhizomes and plant on well-drained ridges.",
    d: [["Ginger blight / rhizome rot", "Plant disease-free rhizomes, use recommended fungicide treatment, rotate fields and drain well."],
        ["Bacterial wilt", "Avoid infected fields and plant on raised beds."]] },

  { n: "Turmeric", l: "Gangamau (Hausa), Atalẹ̀ pupa (Yoruba)", e: "🫚", c: "spice",
    p: [4, 5], h: [12, 1, 2], z: ["NW", "NC", "SW"],
    st: ["Kaduna", "Plateau", "Nasarawa", "Niger", "Benue", "Ogun", "Oyo"],
    s: "Planted with the early rains and harvested when leaves dry, 8–9 months later.",
    f: "Turmeric is grown like ginger and gives a bright yellow colour to food.",
    t: "Boil and sun-dry rhizomes before storage.",
    d: [["Rhizome rot", "Plant healthy rhizomes on well-drained land."],
        ["Leaf spot", "Remove infected leaves and rotate."]] },

  /* ---------- EXTRA VEGETABLES & CROPS TO COMPLETE THE LIBRARY ---------- */
  { n: "Spring onion", l: "Àlùbọ́sà eléwé (Yoruba)", e: "🧅", c: "leafy",
    p: [3, 4, 5, 6, 7, 8, 9, 10], h: [5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Kano", "Plateau", "Lagos", "Oyo"],
    s: "Sown in beds year-round with water; leaves are cut in about 6–8 weeks.",
    f: "Spring onions are harvested for their green leaves before a big bulb forms.",
    t: "Cut leaves above the base so they regrow.",
    d: [["Purple blotch", "Space plants and avoid wet leaves at night."],
        ["Thrips", "Monitor and control early."]] },


  { n: "Tannia (New cocoyam)", l: "Ede oyibo (Igbo)", e: "🥔", c: "root",
    p: [3, 4, 5], h: [11, 12, 1], z: ["SE", "SS", "SW"],
    st: ["Imo", "Abia", "Anambra", "Enugu", "Cross River", "Ogun"],
    s: "Planted early in the rains; harvested about 9–12 months later.",
    f: "Tannia (Xanthosoma) is the 'new' cocoyam brought to West Africa from the Americas.",
    t: "Store cormels in a cool, airy place.",
    d: [["Root rot", "Plant on well-drained land."],
        ["Dasheen mosaic virus", "Use clean planting material."]] },

  { n: "Three-leaved yam (Bitter yam)", l: "Ẹ̀súrú (Yoruba), Ona (Igbo)", e: "🍠", c: "root",
    p: [3, 4], h: [10, 11, 12], z: ["SW", "SE"],
    st: ["Ogun", "Oyo", "Osun", "Enugu", "Anambra", "Imo"],
    s: "Planted early in the rains and harvested late in the year.",
    f: "Ẹ̀súrú yam (Dioscorea dumetorum) hardens soon after harvest, so it must be cooked quickly.",
    t: "Cook within a day or two of harvest; tubers harden in storage.",
    d: [["Yam anthracnose", "Use clean seed and rotate fields."],
        ["Yam beetles", "Plant on time and keep the field clean."]] },

  { n: "Castor", l: "Lára (Yoruba), Zurman (Hausa)", e: "🌱", c: "legume",
    p: [6, 7], h: [11, 12, 1], z: ["NW", "NC", "NE"],
    st: ["Kano", "Kaduna", "Jigawa", "Bauchi", "Niger"],
    s: "Sown in the rains; spikes are harvested in the dry season.",
    f: "Castor seed oil is an industrial oil. The raw seeds are poisonous and must never be eaten.",
    t: "Keep seeds away from children and animals; they are poisonous.",
    d: [["Capsule borer", "Harvest on time."],
        ["Leaf spot", "Rotate crops."]] },

  { n: "Kenaf", l: "Rama (Hausa)", e: "🌿", c: "tree",
    p: [6, 7], h: [9, 10, 11], z: ["NW", "NC", "SW"],
    st: ["Kano", "Kaduna", "Oyo", "Kwara", "Niger"],
    s: "Sown with the rains and cut for fibre when it begins to flower.",
    f: "Kenaf is grown for strong stem fibre used for sacks and ropes; its leaves are also eaten in the North.",
    t: "Cut stems at early flowering for the best fibre.",
    d: [["Root-knot nematodes", "Rotate fields."],
        ["Leaf spot", "Use clean seed."]] },

  { n: "Uziza", l: "Uziza (Igbo)", e: "🌿", c: "spice",
    p: [3, 4, 5], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ["SE", "SS"],
    st: ["Imo", "Abia", "Anambra", "Enugu", "Cross River", "Akwa Ibom"],
    s: "A climbing vine planted from cuttings in the rains; leaves and seeds are harvested over many months.",
    f: "Uziza (West African black pepper) leaves and seeds add a peppery taste to Igbo soups.",
    t: "Give the vine a tree or stake to climb in partial shade.",
    d: [["Root rot", "Plant in well-drained soil."],
        ["Leaf spot", "Remove infected leaves."]] },


  { n: "Cauliflower", l: "", e: "🥦", c: "veg",
    p: [9, 10], h: [12, 1, 2], z: ["NC"],
    st: ["Plateau"],
    s: "A cool-season crop that does best on the Jos Plateau.",
    f: "Cauliflower curds only form well in cool weather.",
    t: "Tie outer leaves over the curd to keep it white.",
    d: [["Diamondback moth", "Use recommended Bt-based controls."],
        ["Black rot", "Use clean seed and rotate."]] },


  { n: "Bitter kola", l: "Orógbó (Yoruba), Akilu (Igbo)", e: "🌰", c: "tree",
    p: [6, 7], h: [7, 8, 9, 10], z: ["SW", "SE", "SS"],
    st: ["Ogun", "Ondo", "Osun", "Edo", "Delta", "Imo", "Anambra", "Cross River"],
    s: "A rainforest tree; nuts are gathered from the middle of the rainy season.",
    f: "Bitter kola (Garcinia kola) is chewed for its bitter taste and is important in many ceremonies.",
    t: "Store nuts in a cool, airy place.",
    d: [["Seed weevils", "Store dry and in clean containers."],
        ["Few serious diseases", "Keep the base of the tree clean."]] },


  { n: "Velvet tamarind (Awin)", l: "Awin (Yoruba), Icheku (Igbo)", e: "🟤", c: "fruit",
    p: [6, 7], h: [12, 1, 2, 3], z: ["SW", "SE", "NC"],
    st: ["Oyo", "Ogun", "Osun", "Kwara", "Enugu", "Anambra"],
    s: "A wild savanna/forest tree whose velvety black pods ripen in the dry season.",
    f: "Awin (Dialium guineense) has a sweet-sour orange pulp and is a popular children's snack.",
    t: "Collect pods when they turn black and dry.",
    d: [["Few serious diseases", "Protect trees from bush fires."],
        ["Pod insects", "Store pods dry."]] },

  { n: "Tamarind", l: "Tsamiya (Hausa)", e: "🟤", c: "fruit",
    p: [6, 7], h: [1, 2, 3, 4], z: ["NW", "NE", "NC"],
    st: ["Sokoto", "Kano", "Katsina", "Borno", "Bauchi", "Kaduna"],
    s: "A savanna tree whose brown pods ripen in the dry season.",
    f: "Tsamiya pulp is used to make sour drinks and in cooking in the North.",
    t: "Harvest pods when the shell becomes brittle.",
    d: [["Pod borers", "Harvest on time."],
        ["Few serious diseases", "Protect from bush fires."]] },

  { n: "Baobab", l: "Kuka (Hausa), Ọ̀ṣẹ̀ (Yoruba)", e: "🌳", c: "tree",
    p: [6, 7], h: [11, 12, 1, 2, 3], z: ["NW", "NE", "NC"],
    st: ["Kano", "Katsina", "Sokoto", "Borno", "Bauchi", "Jigawa", "Yobe"],
    s: "Young leaves are picked in the rains; fruit pods are collected in the dry season.",
    f: "Dried baobab leaves (kuka) are used for miyan kuka soup in northern Nigeria.",
    t: "Dry leaves in the shade to keep them green.",
    d: [["Few serious diseases", "Protect young trees from goats and fire."],
        ["Over-harvesting leaves", "Leave enough leaves for the tree to recover."]] },

  { n: "Lemongrass", l: "Ewé tii (Yoruba), Achara ehi (Igbo)", e: "🌾", c: "spice",
    p: [3, 4, 5], h: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z: ALL,
    st: ["Oyo", "Ogun", "Enugu", "Kaduna", "Lagos"],
    s: "Clumps are divided and planted early in the rains; leaves are cut all year.",
    f: "Lemongrass is grown for tea, flavouring and for its fragrant oil.",
    t: "Cut leaves about 10 cm above the ground so they regrow.",
    d: [["Leaf blight", "Remove old, infected leaves."],
        ["Few serious pests", "Divide old clumps every few years."]] }
];

// Give every crop a stable, readable id from its name, e.g. "White yam" -> "white-yam".
// The id is used for the pop-up, the map and links between pages (map.html?crop=white-yam).
CROPS.forEach(function (crop) {
  crop.id = crop.n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
});

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
    '<a class="btn btn-ghost" href="crops.html?q=' + encodeURIComponent(c.n) + '">🌽 All crop facts</a><button class="btn btn-ghost" data-close="true">Close</button></div>';

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
        window.location.href = "crops.html?q=" + encodeURIComponent(input.value.trim());
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
  else window.location.href = "map.html?state=" + encodeURIComponent(name);
}

// Show a crop on the map: highlight it here, or go to map.html?crop=...
function goToMapCrop(id) {
  if ($("#tileMap")) { closeModal(); $("#mapCrop").value = id; highlightCrop(id); $("#tileMap").scrollIntoView(); }
  else window.location.href = "map.html?crop=" + encodeURIComponent(id);
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
