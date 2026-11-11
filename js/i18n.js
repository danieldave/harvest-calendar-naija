/* ==========================================================================
   HARVEST CALENDAR NAIJA – js/i18n.js  (17 Nigerian languages)
   --------------------------------------------------------------------------
   HAND-WRITTEN: English, Hausa, Yoruba, Igbo, Nigerian Pidgin.
   AI-TRANSLATED (beta): Fulfulde, Kanuri, Tiv, Ibibio, Efik, Izon (Ijaw),
     Edo, Nupe, Urhobo, Igala, Idoma, Ebira. The first time someone picks one
     of these, /api/translate translates the English words once and the phone
     remembers them. The page shows "AI translation (beta)" so native speakers
     can tell us what to fix.

   HOW A PAGE USES IT
     <span data-i18n="nav.home">Home</span>                  -> text
     <input data-i18n-placeholder="ui.search">               -> placeholder
     <h1 data-i18n-html="hero.title">...</h1>                -> our own markup:
         <g>green words</g> and <o>gold words</o>
     In JavaScript:  I18N.t("verdict.go", { crop: "Maize" })

   NATIVE SPEAKERS: to improve a language, edit its block below. Any key a
   language does not have falls back to English automatically.
   ========================================================================== */
(function (root) {
  "use strict";

  const LANGS = [
    { code: "en", name: "English", native: "English", how: "hand" },
    { code: "ha", name: "Hausa", native: "Hausa", how: "hand" },
    { code: "yo", name: "Yoruba", native: "Yorùbá", how: "hand" },
    { code: "ig", name: "Igbo", native: "Igbo", how: "hand" },
    { code: "pcm", name: "Nigerian Pidgin", native: "Naijá (Pidgin)", how: "hand" },
    { code: "ff", name: "Fulfulde", native: "Fulfulde", how: "ai" },
    { code: "kr", name: "Kanuri", native: "Kanuri", how: "ai" },
    { code: "tiv", name: "Tiv", native: "Tiv", how: "ai" },
    { code: "ibb", name: "Ibibio", native: "Ibibio", how: "ai" },
    { code: "efi", name: "Efik", native: "Efik", how: "ai" },
    { code: "ijc", name: "Izon (Ijaw)", native: "Izon", how: "ai" },
    { code: "bin", name: "Edo (Bini)", native: "Ẹ̀dó", how: "ai" },
    { code: "nup", name: "Nupe", native: "Nupe", how: "ai" },
    { code: "urh", name: "Urhobo", native: "Urhobo", how: "ai" },
    { code: "igl", name: "Igala", native: "Igala", how: "ai" },
    { code: "idu", name: "Idoma", native: "Idoma", how: "ai" },
    { code: "igb", name: "Ebira", native: "Ebira", how: "ai" }
  ];

  const MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ha: ["Janairu", "Fabrairu", "Maris", "Afrilu", "Mayu", "Yuni", "Yuli", "Agusta", "Satumba", "Oktoba", "Nuwamba", "Disamba"],
    yo: ["Ṣẹ́rẹ́", "Èrèlè", "Ẹrẹ̀nà", "Ìgbé", "Ẹ̀bìbì", "Òkúdu", "Agẹmọ", "Ògún", "Ọwẹ́wẹ̀", "Ọ̀wàrà", "Bélú", "Ọ̀pẹ̀"],
    ig: ["Jenụwarị", "Febụwarị", "Maachị", "Eprel", "Mee", "Juun", "Julaị", "Ọgọọst", "Septemba", "Ọktoba", "Novemba", "Disemba"],
    pcm: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };

  const STRINGS = {
    en: {
      "nav.home": "Home", "nav.month": "This Month", "nav.year": "Year Chart", "nav.seasons": "Seasons", "nav.crops": "Crops",
      "nav.map": "Farm Map", "nav.plant": "Plant Now", "nav.doctor": "Farm Doctor", "nav.entries": "My Entries", "nav.tips": "Tips",
      "ui.language": "Language", "ui.night": "Night", "ui.day": "Day", "ui.search": "Search crop or state… e.g. yam, tomato, Kano",
      "ui.aiBeta": "AI translation (beta). If a word is wrong, tell your ByteBusters trainer so we can fix it.",
      "ui.translating": "Translating…", "ui.loading": "Loading…",
      "hero.kicker": "A digital guide to seasonal crops",
      "hero.title": "Know <g>when to plant</g> and <o>when to harvest</o> in Nigeria.",
      "hero.lead": "84 Nigerian crops month by month, live rain checks for your state, and a Farm Doctor that explains crop diseases in your language.",
      "hero.ctaPlant": "Is it time to plant?", "hero.ctaDoctor": "Ask the Farm Doctor",
      "plant.title": "Is it time to plant?",
      "plant.lead": "Pick your state and crop. We check the rain of the last 14 days and the forecast for the next 16 days, the way extension officers do.",
      "plant.state": "Your state", "plant.crop": "Your crop", "plant.check": "Check now",
      "plant.place": "Weather checked at {place}, {state}.",
      "plant.chart": "Rain, day by day (mm)", "plant.past": "Last 14 days", "plant.today": "Today", "plant.forecast": "Next 16 days",
      "plant.note": "This is a guide, not a promise. Weather is checked at your state capital. Always confirm with your ADP extension officer.",
      "plant.credit": "Weather data: Open-Meteo.com", "plant.error": "Weather is not available right now. Please try again soon.",
      "verdict.go": "Yes: a good time to plant {crop}", "verdict.soon": "Get ready: steady rain is coming",
      "verdict.wait": "Not yet: wait for steady rain", "verdict.waitDry": "Wait: a dry spell is coming",
      "verdict.irrigate": "Dry-season crop: plant with irrigation", "verdict.offSeason": "Not the planting season for {crop}",
      "verdict.notSuited": "{crop} does not usually do well in {state}",
      "reason.bestState": "{state} is one of the best-known states for {crop}.",
      "reason.notSuited": "{crop} is not usually grown in your region. Ask your extension officer before you try.",
      "reason.offSeason": "{crop} is usually planted in {months}.",
      "reason.irrigate": "{crop} is a dry-season crop. Plant on fadama land or with irrigation. Do not wait for rain.",
      "reason.onsetPast": "The rains have started: {mm} mm fell in the last 14 days.",
      "reason.noDrySpell": "About {mm} mm more rain is expected in the next 14 days, with no long dry spell.",
      "reason.onsetSoon": "Steady rain is expected from {date}. Prepare your land now and plant after that rain.",
      "reason.notYet": "Only {mm} mm of rain fell in the last 14 days. The rains have truly started when {need} mm falls within 3 days.",
      "reason.dryAhead": "Warning: {days} dry days in a row are expected from {from}. Young seedlings may die.",
      "reason.soilDry": "The topsoil is dry today.", "reason.soilWet": "The soil is very wet. Avoid low, waterlogged land.",
      "reason.flood": "Very heavy rain ({mm} mm) is expected on {date}. Do not plant just before it: seeds can wash away.",
      "reason.hot": "A very hot day ({c}°C) is expected on {date}. Water young plants and give them shade if you can.",
      "stat.last14": "Rain, last 14 days", "stat.next7": "Rain, next 7 days", "stat.next14": "Rain, next 14 days", "stat.soil": "Topsoil today",
      "soil.dry": "Dry", "soil.moist": "Moist", "soil.wet": "Wet", "soil.unknown": "No data",
      "doctor.title": "Farm Doctor",
      "doctor.lead": "Tell us what you see on your plant. The Farm Doctor checks our disease list for that crop first, then explains in your language.",
      "doctor.crop": "Which crop?", "doctor.state": "Your state (optional)", "doctor.symptoms": "What do you see on the plant?",
      "doctor.placeholder": "e.g. The leaves are turning yellow and curling, and some plants are very short.",
      "doctor.photo": "Add a photo of the plant", "doctor.photoSoon": "Coming soon", "doctor.ask": "Ask the Farm Doctor",
      "doctor.thinking": "The Farm Doctor is thinking…", "doctor.likely": "What it may be", "doctor.ourList": "From our checked list",
      "doctor.general": "General cause", "doctor.doNow": "What to do now", "doctor.prevent": "Prevent it next time",
      "doctor.urgent": "Act quickly: this problem can spread fast.", "doctor.expert": "When to call the expert",
      "doctor.disclaimer": "The Farm Doctor can be wrong. Never use a chemical without reading its label. Your ADP extension officer can visit your farm.",
      "doctor.offline": "The Farm Doctor needs internet. Meanwhile, here is our checked disease list for this crop:",
      "doctor.short": "Please describe what you see in a few more words.",
      "like.high": "Likely", "like.medium": "Possible", "like.low": "Less likely",
      "common.plant": "Plant", "common.harvest": "Harvest",
      "footer.made": "Built with love by the ByteBusters Coding Club, Yewa College, Ilaro."
    },

    ha: {
      "nav.home": "Gida", "nav.month": "Wannan Wata", "nav.year": "Jadawalin Shekara", "nav.seasons": "Lokuta", "nav.crops": "Amfanin Gona",
      "nav.map": "Taswirar Gona", "nav.plant": "Shuka Yanzu", "nav.doctor": "Likitan Gona", "nav.entries": "Rubutuna", "nav.tips": "Shawarwari",
      "ui.language": "Harshe", "ui.night": "Dare", "ui.day": "Rana", "ui.search": "Nemi amfani ko jiha… misali doya, tumatir, Kano",
      "ui.translating": "Ana fassara…", "ui.loading": "Ana lodawa…",
      "hero.kicker": "Jagorar zamani ta lokutan shuka",
      "hero.title": "San <g>lokacin shuka</g> da <o>lokacin girbi</o> a Najeriya.",
      "hero.lead": "Amfanin gona 84 na Najeriya wata-wata, duba ruwan sama na jiharka kai tsaye, da Likitan Gona mai bayani a harshenka.",
      "hero.ctaPlant": "Lokacin shuka ya yi?", "hero.ctaDoctor": "Tambayi Likitan Gona",
      "plant.title": "Lokacin shuka ya yi?",
      "plant.lead": "Zaɓi jiharka da amfanin gonarka. Muna duba ruwan sama na kwanaki 14 da suka wuce da hasashen kwanaki 16 masu zuwa, kamar yadda jami'an gona suke yi.",
      "plant.state": "Jiharka", "plant.crop": "Amfanin gonarka", "plant.check": "Duba yanzu",
      "plant.place": "An duba yanayi a {place}, {state}.",
      "plant.chart": "Ruwan sama, kowace rana (mm)", "plant.past": "Kwanaki 14 da suka wuce", "plant.today": "Yau", "plant.forecast": "Kwanaki 16 masu zuwa",
      "plant.note": "Wannan jagora ne, ba alkawari ba. Ana duba yanayi a babban birnin jiharka. Ka tabbatar da jami'in gona na ADP.",
      "plant.credit": "Bayanan yanayi: Open-Meteo.com", "plant.error": "Babu bayanin yanayi yanzu. Ka sake gwadawa nan gaba.",
      "verdict.go": "Eh: lokaci ne mai kyau don shuka {crop}", "verdict.soon": "Ka shirya: ruwan sama mai ɗorewa yana zuwa",
      "verdict.wait": "Ba tukuna ba: jira ruwan sama ya kafu", "verdict.waitDry": "Jira: fari na zuwa",
      "verdict.irrigate": "Amfanin rani: shuka da ban ruwa", "verdict.offSeason": "Ba lokacin shuka {crop} ba ne",
      "verdict.notSuited": "{crop} ba ya yin kyau sosai a {state}",
      "reason.bestState": "{state} na cikin jihohin da suka fi shahara wajen {crop}.",
      "reason.notSuited": "Ba a cika shuka {crop} a yankinku ba. Ka tambayi jami'in gona kafin ka gwada.",
      "reason.offSeason": "Ana yawan shuka {crop} a {months}.",
      "reason.irrigate": "{crop} amfanin rani ne. Shuka a fadama ko da ban ruwa. Kada ka jira ruwan sama.",
      "reason.onsetPast": "Damina ta fara: ruwa {mm} mm ya sauka a kwanaki 14 da suka wuce.",
      "reason.noDrySpell": "Ana sa ran ƙarin ruwa kusan {mm} mm a kwanaki 14 masu zuwa, ba tare da dogon fari ba.",
      "reason.onsetSoon": "Ana sa ran ruwa mai ɗorewa daga {date}. Shirya gonarka yanzu, ka shuka bayan wannan ruwan.",
      "reason.notYet": "Ruwa {mm} mm kawai ya sauka a kwanaki 14. Damina ta kafu idan ruwa {need} mm ya sauka cikin kwanaki 3.",
      "reason.dryAhead": "Gargaɗi: ana sa ran kwanaki {days} a jere ba ruwa daga {from}. Ƙananan tsire-tsire na iya mutuwa.",
      "reason.soilDry": "Ƙasa ta sama a bushe take yau.", "reason.soilWet": "Ƙasa ta jiƙe sosai. Ka guji ƙasa mai kwari mai tara ruwa.",
      "reason.flood": "Ana sa ran ruwa mai yawa sosai ({mm} mm) ranar {date}. Kada ka shuka kafin shi: ruwa na iya kwashe iri.",
      "reason.hot": "Ana sa ran zafi mai tsanani ({c}°C) ranar {date}. Ka ba ƙananan tsire-tsire ruwa da inuwa.",
      "stat.last14": "Ruwa, kwanaki 14 da suka wuce", "stat.next7": "Ruwa, kwanaki 7 masu zuwa", "stat.next14": "Ruwa, kwanaki 14 masu zuwa", "stat.soil": "Ƙasa ta sama yau",
      "soil.dry": "Bushe", "soil.moist": "Ɗan danshi", "soil.wet": "Jiƙe", "soil.unknown": "Babu bayani",
      "doctor.title": "Likitan Gona",
      "doctor.lead": "Faɗa mana abin da kake gani a jikin shukarka. Likitan Gona zai fara duba jerin cututtukanmu na wannan amfani, sannan ya yi bayani a harshenka.",
      "doctor.crop": "Wane amfanin gona?", "doctor.state": "Jiharka (ba dole ba)", "doctor.symptoms": "Me kake gani a jikin shukar?",
      "doctor.placeholder": "misali: Ganyen suna rawaya suna naɗewa, wasu tsire-tsire gajeru ne sosai.",
      "doctor.photo": "Saka hoton shukar", "doctor.photoSoon": "Yana zuwa nan ba da daɗewa ba", "doctor.ask": "Tambayi Likitan Gona",
      "doctor.thinking": "Likitan Gona yana tunani…", "doctor.likely": "Abin da zai iya zama", "doctor.ourList": "Daga jerinmu da aka tantance",
      "doctor.general": "Dalili na gaba ɗaya", "doctor.doNow": "Abin da za ka yi yanzu", "doctor.prevent": "Hana shi a gaba",
      "doctor.urgent": "Ka yi sauri: wannan matsala na iya yaɗuwa da sauri.", "doctor.expert": "Lokacin kiran ƙwararre",
      "doctor.disclaimer": "Likitan Gona na iya kuskure. Kada ka yi amfani da magani ba tare da karanta takardarsa ba. Jami'in gona na ADP zai iya ziyartar gonarka.",
      "doctor.offline": "Likitan Gona yana buƙatar intanet. Kafin nan, ga jerin cututtukan wannan amfani:",
      "doctor.short": "Don Allah ka ƙara bayani kaɗan.",
      "like.high": "Mai yiwuwa sosai", "like.medium": "Mai yiwuwa", "like.low": "Ba sosai ba",
      "common.plant": "Shuka", "common.harvest": "Girbi",
      "footer.made": "Ƙungiyar ByteBusters ta Kwalejin Yewa, Ilaro ce ta gina shi da ƙauna."
    },

    yo: {
      "nav.home": "Ilé", "nav.month": "Oṣù Yìí", "nav.year": "Àtẹ Ọdún", "nav.seasons": "Àsìkò", "nav.crops": "Irúgbìn",
      "nav.map": "Máàpù Oko", "nav.plant": "Gbìn Báyìí", "nav.doctor": "Dókítà Oko", "nav.entries": "Àkọsílẹ̀ Mi", "nav.tips": "Ìmọ̀ràn",
      "ui.language": "Èdè", "ui.night": "Alẹ́", "ui.day": "Ọ̀sán", "ui.search": "Wá irúgbìn tàbí ìpínlẹ̀… bí iṣu, tòmátò, Kano",
      "ui.translating": "À ń túmọ̀…", "ui.loading": "Ó ń bọ̀…",
      "hero.kicker": "Ìtọ́sọ́nà ìgbàlódé fún àsìkò irúgbìn",
      "hero.title": "Mọ <g>ìgbà tí a ó gbìn</g> àti <o>ìgbà ìkórè</o> ní Nàìjíríà.",
      "hero.lead": "Irúgbìn 84 ti Nàìjíríà lóṣooṣù, àyẹ̀wò òjò fún ìpínlẹ̀ rẹ lójú ẹsẹ̀, àti Dókítà Oko tí ó ń ṣàlàyé àìsàn irúgbìn ní èdè rẹ.",
      "hero.ctaPlant": "Ṣé àsìkò gbìngbìn ti tó?", "hero.ctaDoctor": "Bi Dókítà Oko léèrè",
      "plant.title": "Ṣé àsìkò gbìngbìn ti tó?",
      "plant.lead": "Yan ìpínlẹ̀ rẹ àti irúgbìn rẹ. A ń wo òjò ọjọ́ 14 tó kọjá àti àsọtẹ́lẹ̀ ọjọ́ 16 tó ń bọ̀, bí àwọn òṣìṣẹ́ àgbẹ̀ ṣe ń ṣe.",
      "plant.state": "Ìpínlẹ̀ rẹ", "plant.crop": "Irúgbìn rẹ", "plant.check": "Wò ó báyìí",
      "plant.place": "A wo ojú ọjọ́ ní {place}, {state}.",
      "plant.chart": "Òjò, lójoojúmọ́ (mm)", "plant.past": "Ọjọ́ 14 tó kọjá", "plant.today": "Òní", "plant.forecast": "Ọjọ́ 16 tó ń bọ̀",
      "plant.note": "Ìtọ́sọ́nà ni èyí, kì í ṣe ìlérí. A ń wo ojú ọjọ́ ní olú-ìlú ìpínlẹ̀ rẹ. Jọ̀wọ́ fìdí rẹ̀ múlẹ̀ lọ́dọ̀ òṣìṣẹ́ ADP.",
      "plant.credit": "Ìròyìn ojú ọjọ́: Open-Meteo.com", "plant.error": "Ìròyìn ojú ọjọ́ kò sí báyìí. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí i.",
      "verdict.go": "Bẹ́ẹ̀ni: àsìkò dára láti gbin {crop}", "verdict.soon": "Múra sílẹ̀: òjò tó dúró ń bọ̀",
      "verdict.wait": "Kò tíì tó: dúró de òjò tó dúró", "verdict.waitDry": "Dúró: ọ̀dá ń bọ̀",
      "verdict.irrigate": "Irúgbìn ẹ̀ẹ̀rùn: gbìn pẹ̀lú omi ìrigeṣọ̀n", "verdict.offSeason": "Kì í ṣe àsìkò gbígbin {crop}",
      "verdict.notSuited": "{crop} kì í sábà ṣe dáadáa ní {state}",
      "reason.bestState": "{state} wà lára àwọn ìpínlẹ̀ tí a mọ̀ jùlọ fún {crop}.",
      "reason.notSuited": "A kì í sábà gbin {crop} ní agbègbè rẹ. Bi òṣìṣẹ́ àgbẹ̀ léèrè kí o tó gbìyànjú.",
      "reason.offSeason": "A máa ń gbin {crop} ní {months}.",
      "reason.irrigate": "{crop} jẹ́ irúgbìn ẹ̀ẹ̀rùn. Gbìn sí ilẹ̀ fadama tàbí pẹ̀lú omi. Má ṣe dúró de òjò.",
      "reason.onsetPast": "Òjò ti bẹ̀rẹ̀: {mm} mm ló rọ̀ ní ọjọ́ 14 tó kọjá.",
      "reason.noDrySpell": "A retí òjò tó tó {mm} mm sí i ní ọjọ́ 14 tó ń bọ̀, láìsí ọ̀dá gígùn.",
      "reason.onsetSoon": "A retí òjò tó dúró láti {date}. Tún ilẹ̀ rẹ ṣe báyìí, kí o sì gbìn lẹ́yìn òjò náà.",
      "reason.notYet": "{mm} mm òjò péré ló rọ̀ ní ọjọ́ 14. Òjò ti bẹ̀rẹ̀ dájú nígbà tí {need} mm bá rọ̀ láàrin ọjọ́ 3.",
      "reason.dryAhead": "Ìkìlọ̀: a retí ọjọ́ {days} léraléra láìsí òjò láti {from}. Àwọn irúgbìn kékeré lè kú.",
      "reason.soilDry": "Ilẹ̀ òkè gbẹ lónìí.", "reason.soilWet": "Ilẹ̀ tutù jù. Yẹra fún ilẹ̀ ìsàlẹ̀ tí omi máa ń dúró sí.",
      "reason.flood": "A retí òjò ńlá gan-an ({mm} mm) ní {date}. Má ṣe gbìn ṣáájú rẹ̀: omi lè gbé irúgbìn lọ.",
      "reason.hot": "A retí ooru gíga ({c}°C) ní {date}. Bomi rin àwọn irúgbìn kékeré kí o sì fún wọn ní ibòji.",
      "stat.last14": "Òjò, ọjọ́ 14 tó kọjá", "stat.next7": "Òjò, ọjọ́ 7 tó ń bọ̀", "stat.next14": "Òjò, ọjọ́ 14 tó ń bọ̀", "stat.soil": "Ilẹ̀ òkè lónìí",
      "soil.dry": "Ó gbẹ", "soil.moist": "Ó tutù díẹ̀", "soil.wet": "Ó rin", "soil.unknown": "Kò sí ìròyìn",
      "doctor.title": "Dókítà Oko",
      "doctor.lead": "Sọ ohun tí o rí lára irúgbìn rẹ fún wa. Dókítà Oko yóò kọ́kọ́ wo àkójọ àìsàn wa fún irúgbìn náà, lẹ́yìn náà yóò ṣàlàyé ní èdè rẹ.",
      "doctor.crop": "Irúgbìn wo?", "doctor.state": "Ìpínlẹ̀ rẹ (kò pọn dandan)", "doctor.symptoms": "Kí ni o rí lára irúgbìn náà?",
      "doctor.placeholder": "bí àpẹẹrẹ: Àwọn ewé ń di pupa-òfeefee wọ́n sì ń ká, àwọn igi kan kúrú gan-an.",
      "doctor.photo": "Fi àwòrán irúgbìn kún un", "doctor.photoSoon": "Ó ń bọ̀ láìpẹ́", "doctor.ask": "Bi Dókítà Oko léèrè",
      "doctor.thinking": "Dókítà Oko ń ronú…", "doctor.likely": "Ohun tí ó lè jẹ́", "doctor.ourList": "Láti inú àkójọ wa tí a ti yẹ̀wò",
      "doctor.general": "Ìdí gbogbogbò", "doctor.doNow": "Ohun tí o máa ṣe báyìí", "doctor.prevent": "Dènà rẹ̀ nígbà míràn",
      "doctor.urgent": "Yára ṣe nǹkan: ìṣòro yìí lè tàn kálẹ̀ kíákíá.", "doctor.expert": "Ìgbà tí o máa pe ògbóǹtarìgì",
      "doctor.disclaimer": "Dókítà Oko lè ṣe àṣìṣe. Má ṣe lo oògùn kankan láìka ìwé rẹ̀. Òṣìṣẹ́ ADP lè wá sí oko rẹ.",
      "doctor.offline": "Dókítà Oko nílò íńtánẹ́ẹ̀tì. Ní báyìí ná, àkójọ àìsàn irúgbìn yìí nìyí:",
      "doctor.short": "Jọ̀wọ́ ṣàlàyé díẹ̀ sí i.",
      "like.high": "Ó ṣeé ṣe gan-an", "like.medium": "Ó ṣeé ṣe", "like.low": "Kò fi bẹ́ẹ̀ ṣeé ṣe",
      "common.plant": "Gbìn", "common.harvest": "Ìkórè",
      "footer.made": "Ẹgbẹ́ ByteBusters ti Yewa College, Ilaro ló kọ́ ọ pẹ̀lú ìfẹ́."
    },

    ig: {
      "nav.home": "Ụlọ", "nav.month": "Ọnwa A", "nav.year": "Eserese Afọ", "nav.seasons": "Oge", "nav.crops": "Ihe Ọkụkụ",
      "nav.map": "Map Ugbo", "nav.plant": "Kụọ Ugbu a", "nav.doctor": "Dọkịta Ugbo", "nav.entries": "Ndetu M", "nav.tips": "Ndụmọdụ",
      "ui.language": "Asụsụ", "ui.night": "Abalị", "ui.day": "Ehihie", "ui.search": "Chọọ ihe ọkụkụ ma ọ bụ steeti… dịka ji, tomato, Kano",
      "ui.translating": "Ana-asụgharị…", "ui.loading": "Ọ na-abịa…",
      "hero.kicker": "Ntụziaka dijitalụ maka oge ihe ọkụkụ",
      "hero.title": "Mara <g>mgbe a ga-akụ</g> na <o>mgbe a ga-ewe ihe ubi</o> na Naịjirịa.",
      "hero.lead": "Ihe ọkụkụ 84 nke Naịjirịa n'ọnwa n'ọnwa, nlele mmiri ozuzo maka steeti gị ozugbo, na Dọkịta Ugbo na-akọwa ọrịa ihe ọkụkụ n'asụsụ gị.",
      "hero.ctaPlant": "Oge ịkụ ọ eruola?", "hero.ctaDoctor": "Jụọ Dọkịta Ugbo",
      "plant.title": "Oge ịkụ ọ eruola?",
      "plant.lead": "Họrọ steeti gị na ihe ọkụkụ gị. Anyị na-ele mmiri ozuzo ụbọchị 14 gara aga na amụma ụbọchị 16 na-abịa, dịka ndị ọrụ ugbo na-eme.",
      "plant.state": "Steeti gị", "plant.crop": "Ihe ọkụkụ gị", "plant.check": "Lelee ugbu a",
      "plant.place": "Anyị lere ihu igwe na {place}, {state}.",
      "plant.chart": "Mmiri ozuzo, kwa ụbọchị (mm)", "plant.past": "Ụbọchị 14 gara aga", "plant.today": "Taa", "plant.forecast": "Ụbọchị 16 na-abịa",
      "plant.note": "Nke a bụ ntụziaka, ọ bụghị nkwa. Anyị na-ele ihu igwe n'isi obodo steeti gị. Biko jụọ onye ọrụ ugbo ADP.",
      "plant.credit": "Data ihu igwe: Open-Meteo.com", "plant.error": "Ozi ihu igwe adịghị ugbu a. Biko nwaa ọzọ n'oge na-adịghị anya.",
      "verdict.go": "Ee: oge dị mma ịkụ {crop}", "verdict.soon": "Kwadebe: mmiri ozuzo kwụsiri ike na-abịa",
      "verdict.wait": "Ọ bụghị ugbu a: chere ka mmiri ozuzo guzosie ike", "verdict.waitDry": "Chere: ụkọ mmiri na-abịa",
      "verdict.irrigate": "Ihe ọkụkụ ọkọchị: kụọ ya na mmiri ịgba", "verdict.offSeason": "Ọ bụghị oge ịkụ {crop}",
      "verdict.notSuited": "{crop} anaghị eme nke ọma na {state}",
      "reason.bestState": "{state} so na steeti a ma ama maka {crop}.",
      "reason.notSuited": "A naghị akụkarị {crop} na mpaghara gị. Jụọ onye ọrụ ugbo tupu ị nwaa.",
      "reason.offSeason": "A na-akụkarị {crop} na {months}.",
      "reason.irrigate": "{crop} bụ ihe ọkụkụ ọkọchị. Kụọ ya n'ala fadama ma ọ bụ jiri mmiri ịgba. Echerela mmiri ozuzo.",
      "reason.onsetPast": "Mmiri ozuzo amalitela: {mm} mm zoro n'ụbọchị 14 gara aga.",
      "reason.noDrySpell": "A na-atụ anya ihe dịka {mm} mm mmiri ozuzo ọzọ n'ụbọchị 14 na-abịa, na-enweghị ogologo ụkọ mmiri.",
      "reason.onsetSoon": "A na-atụ anya mmiri ozuzo kwụsiri ike site na {date}. Kwadebe ala gị ugbu a, kụọ mgbe mmiri ahụ zosịrị.",
      "reason.notYet": "Naanị {mm} mm mmiri zoro n'ụbọchị 14. Mmiri ozuzo amalitela n'ezie mgbe {need} mm zoro n'ime ụbọchị 3.",
      "reason.dryAhead": "Ịdọ aka na ntị: a na-atụ anya ụbọchị {days} n'usoro na-enweghị mmiri site na {from}. Obere ihe ọkụkụ nwere ike ịnwụ.",
      "reason.soilDry": "Ala dị n'elu kpọrọ nkụ taa.", "reason.soilWet": "Ala dị mmiri nke ukwuu. Zere ala dị ala ebe mmiri na-eguzo.",
      "reason.flood": "A na-atụ anya oke mmiri ozuzo ({mm} mm) na {date}. Akụla tupu ya: mmiri nwere ike iburu mkpụrụ.",
      "reason.hot": "A na-atụ anya oke okpomọkụ ({c}°C) na {date}. Gbaa obere ihe ọkụkụ mmiri ma nye ha ndò.",
      "stat.last14": "Mmiri ozuzo, ụbọchị 14 gara aga", "stat.next7": "Mmiri ozuzo, ụbọchị 7 na-abịa", "stat.next14": "Mmiri ozuzo, ụbọchị 14 na-abịa", "stat.soil": "Ala elu taa",
      "soil.dry": "Kpọrọ nkụ", "soil.moist": "Dị mmiri ntakịrị", "soil.wet": "Dị mmiri", "soil.unknown": "Enweghị ozi",
      "doctor.title": "Dọkịta Ugbo",
      "doctor.lead": "Gwa anyị ihe ị na-ahụ n'ahụ ihe ọkụkụ gị. Dọkịta Ugbo ga-ebu ụzọ lelee ndepụta ọrịa anyị maka ihe ọkụkụ ahụ, wee kọwaa n'asụsụ gị.",
      "doctor.crop": "Kedu ihe ọkụkụ?", "doctor.state": "Steeti gị (ọ bụghị iwu)", "doctor.symptoms": "Gịnị ka ị na-ahụ n'ahụ ihe ọkụkụ ahụ?",
      "doctor.placeholder": "dịka: Akwụkwọ na-acha odo odo ma na-agbagọ, ụfọdụ osisi dị mkpụmkpụ nke ukwuu.",
      "doctor.photo": "Tinye foto ihe ọkụkụ", "doctor.photoSoon": "Ọ na-abịa n'oge na-adịghị anya", "doctor.ask": "Jụọ Dọkịta Ugbo",
      "doctor.thinking": "Dọkịta Ugbo na-eche echiche…", "doctor.likely": "Ihe ọ nwere ike ịbụ", "doctor.ourList": "Site na ndepụta anyị a nyochara",
      "doctor.general": "Ihe kpatara ya n'ozuzu", "doctor.doNow": "Ihe ị ga-eme ugbu a", "doctor.prevent": "Gbochie ya n'ọdịnihu",
      "doctor.urgent": "Mee ngwa ngwa: nsogbu a nwere ike ịgbasa ọsọ ọsọ.", "doctor.expert": "Mgbe ị ga-akpọ ọkachamara",
      "doctor.disclaimer": "Dọkịta Ugbo nwere ike ihie ụzọ. Ejila ọgwụ ọ bụla ma ị gụghị akwụkwọ ya. Onye ọrụ ugbo ADP nwere ike ịbịa n'ugbo gị.",
      "doctor.offline": "Dọkịta Ugbo chọrọ ịntanetị. Ka ọ dị ugbu a, nke a bụ ndepụta ọrịa ihe ọkụkụ a:",
      "doctor.short": "Biko kọwaa ntakịrị ọzọ.",
      "like.high": "O yikarịrị", "like.medium": "O nwere ike", "like.low": "O yighị nke ukwuu",
      "common.plant": "Kụọ", "common.harvest": "Owuwe ihe ubi",
      "footer.made": "Otu ByteBusters nke Yewa College, Ilaro wuru ya n'ịhụnanya."
    },

    pcm: {
      "nav.home": "Home", "nav.month": "Dis Month", "nav.year": "Year Chart", "nav.seasons": "Seasons", "nav.crops": "Crops",
      "nav.map": "Farm Map", "nav.plant": "Plant Now", "nav.doctor": "Farm Doctor", "nav.entries": "My Entries", "nav.tips": "Tips",
      "ui.language": "Language", "ui.night": "Night", "ui.day": "Day", "ui.search": "Find crop or state… like yam, tomato, Kano",
      "ui.translating": "We dey translate…", "ui.loading": "E dey load…",
      "hero.kicker": "Digital guide for farm season",
      "hero.title": "Know <g>when to plant</g> and <o>when to harvest</o> for Naija.",
      "hero.lead": "84 Naija crops month by month, live rain check for your state, and Farm Doctor wey dey explain crop sickness for your language.",
      "hero.ctaPlant": "Planting time don reach?", "hero.ctaDoctor": "Ask Farm Doctor",
      "plant.title": "Planting time don reach?",
      "plant.lead": "Pick your state and your crop. We go check the rain wey fall for the last 14 days and the forecast for the next 16 days, like extension officers dey do.",
      "plant.state": "Your state", "plant.crop": "Your crop", "plant.check": "Check am now",
      "plant.place": "We check weather for {place}, {state}.",
      "plant.chart": "Rain, day by day (mm)", "plant.past": "Last 14 days", "plant.today": "Today", "plant.forecast": "Next 16 days",
      "plant.note": "Na guide be dis, no be promise. We dey check weather for your state capital. Make you confirm with your ADP extension officer.",
      "plant.credit": "Weather data: Open-Meteo.com", "plant.error": "Weather no dey available now. Abeg try again small time.",
      "verdict.go": "Yes: e good to plant {crop} now", "verdict.soon": "Prepare: steady rain dey come",
      "verdict.wait": "No be now: wait make rain settle", "verdict.waitDry": "Wait: dry days dey come",
      "verdict.irrigate": "Dry-season crop: plant am with irrigation", "verdict.offSeason": "No be planting season for {crop}",
      "verdict.notSuited": "{crop} no dey too do well for {state}",
      "reason.bestState": "{state} dey among the states wey dem sabi well for {crop}.",
      "reason.notSuited": "People no dey plant {crop} well for your area. Ask your extension officer before you try am.",
      "reason.offSeason": "People dey plant {crop} for {months}.",
      "reason.irrigate": "{crop} na dry-season crop. Plant am for fadama land or use irrigation. No wait for rain.",
      "reason.onsetPast": "Rain don start: {mm} mm fall for the last 14 days.",
      "reason.noDrySpell": "About {mm} mm more rain go fall for the next 14 days, and no long dry days.",
      "reason.onsetSoon": "Steady rain go start from {date}. Prepare your land now, plant after that rain.",
      "reason.notYet": "Na only {mm} mm rain fall for 14 days. Rain don really start when {need} mm fall inside 3 days.",
      "reason.dryAhead": "Warning: {days} dry days back to back dey come from {from}. Small seedlings fit die.",
      "reason.soilDry": "The top soil dry today.", "reason.soilWet": "The soil wet well well. No plant for low land wey water dey stay.",
      "reason.flood": "Heavy heavy rain ({mm} mm) go fall for {date}. No plant just before am: water fit carry the seed go.",
      "reason.hot": "Serious heat ({c}°C) dey come for {date}. Water your small plants and give dem shade if you fit.",
      "stat.last14": "Rain, last 14 days", "stat.next7": "Rain, next 7 days", "stat.next14": "Rain, next 14 days", "stat.soil": "Top soil today",
      "soil.dry": "Dry", "soil.moist": "Get small water", "soil.wet": "Wet", "soil.unknown": "No data",
      "doctor.title": "Farm Doctor",
      "doctor.lead": "Tell us wetin you dey see for your plant. Farm Doctor go first check our sickness list for that crop, then explain am for your language.",
      "doctor.crop": "Which crop?", "doctor.state": "Your state (if you like)", "doctor.symptoms": "Wetin you dey see for the plant?",
      "doctor.placeholder": "like: The leaf dey turn yellow and dey fold, some plants short well well.",
      "doctor.photo": "Add picture of the plant", "doctor.photoSoon": "E dey come soon", "doctor.ask": "Ask Farm Doctor",
      "doctor.thinking": "Farm Doctor dey think…", "doctor.likely": "Wetin e fit be", "doctor.ourList": "From our checked list",
      "doctor.general": "General cause", "doctor.doNow": "Wetin to do now", "doctor.prevent": "Stop am next time",
      "doctor.urgent": "Move quick: dis wahala fit spread fast.", "doctor.expert": "When to call expert",
      "doctor.disclaimer": "Farm Doctor fit make mistake. No use any chemical if you never read the label. Your ADP extension officer fit come your farm.",
      "doctor.offline": "Farm Doctor need internet. For now, see our checked sickness list for dis crop:",
      "doctor.short": "Abeg explain am small more.",
      "like.high": "E fit be am well", "like.medium": "E fit be", "like.low": "E no too fit be",
      "common.plant": "Plant", "common.harvest": "Harvest",
      "footer.made": "ByteBusters Coding Club, Yewa College, Ilaro build am with love."
    }
  };

  /* ---------- the engine ---------- */
  const LANG_KEY = "hcn-lang";
  const VERSION = "2";                        // bump when English strings change, so AI translations refresh
  let current = "en";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  function info(code) { return LANGS.find(l => l.code === code) || LANGS[0]; }

  function t(key, vars) {
    const table = STRINGS[current] || {};
    let s = table[key] != null ? table[key] : (STRINGS.en[key] != null ? STRINGS.en[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
    return s;
  }

  function month(i) {                          // i = 1..12
    return (MONTHS[current] || MONTHS.en)[i - 1];
  }

  // Our own trusted markup only: <g>..</g> = green words, <o>..</o> = gold words
  function safeHTML(s) {
    const e = String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    return e.replace(/&lt;g&gt;/g, '<span class="hl-green">').replace(/&lt;\/g&gt;/g, "</span>")
            .replace(/&lt;o&gt;/g, '<span class="hl-gold">').replace(/&lt;\/o&gt;/g, "</span>");
  }

  function apply(rootEl) {
    const scope = rootEl || document;
    scope.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
    scope.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = safeHTML(t(el.getAttribute("data-i18n-html"))); });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"))); });
    document.documentElement.setAttribute("lang", current === "en" ? "en-NG" : current);
    const beta = document.getElementById("aiBeta");
    if (beta) { beta.hidden = info(current).how !== "ai"; beta.textContent = t("ui.aiBeta"); }
  }

  // Ask /api/translate for an AI language, in chunks, then remember it on this phone
  async function loadAI(code) {
    const cacheKey = "hcn-tr-" + code + "-" + VERSION;
    const saved = store.get(cacheKey);
    if (saved) { try { STRINGS[code] = JSON.parse(saved); return true; } catch (e) { /* re-fetch */ } }
    const entries = Object.entries(STRINGS.en), chunks = [];
    let chunk = {}, size = 0;
    entries.forEach(([k, v]) => {
      if (size + v.length > 3500) { chunks.push(chunk); chunk = {}; size = 0; }
      chunk[k] = v; size += v.length;
    });
    chunks.push(chunk);
    const out = {};
    for (const part of chunks) {
      const r = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: code, strings: part }) });
      if (!r.ok) throw new Error("translate " + r.status);
      Object.assign(out, (await r.json()).strings);
    }
    STRINGS[code] = out;
    store.set(cacheKey, JSON.stringify(out));
    return true;
  }

  const listeners = [];
  async function setLang(code, opts) {
    const l = info(code);
    const status = document.getElementById("langStatus");
    if (l.how === "ai" && !STRINGS[l.code]) {
      if (status) status.textContent = t("ui.translating");
      try { await loadAI(l.code); } catch (e) {
        if (status) status.textContent = "";
        current = "en"; apply(); return false;           // stay in English if translation fails
      }
    }
    current = l.code;
    if (!opts || opts.save !== false) store.set(LANG_KEY, current);
    if (status) status.textContent = "";
    apply();
    listeners.forEach(fn => { try { fn(current); } catch (e) { /* keep going */ } });
    return true;
  }

  // Build the language picker in the header
  function setupPicker() {
    const sel = document.getElementById("langSelect");
    if (!sel) return;
    sel.innerHTML = LANGS.map(l => '<option value="' + l.code + '">' + l.native + (l.native !== l.name ? " · " + l.name : "") + (l.how === "ai" ? " (AI)" : "") + "</option>").join("");
    sel.value = current;
    sel.addEventListener("change", () => setLang(sel.value).then(ok => { if (!ok) sel.value = "en"; }));
    onChange(code => { sel.value = code; });
  }

  // Crop name in the reader's language, using the local names already in our data
  const LOCAL_TAG = { yo: "Yoruba", ha: "Hausa", ig: "Igbo" };
  function cropName(crop) {
    const tag = LOCAL_TAG[current];
    if (!tag || !crop.l) return crop.n;
    const m = crop.l.split(",").map(s => s.trim()).find(s => s.indexOf("(" + tag + ")") !== -1);
    return m ? m.replace(/\s*\(.*\)\s*$/, "") + " (" + crop.n + ")" : crop.n;
  }

  function onChange(fn) { listeners.push(fn); }
  function start() {
    const saved = store.get(LANG_KEY);
    setupPicker();
    if (saved && saved !== "en") setLang(saved, { save: false }); else apply();
  }

  root.I18N = { LANGS, STRINGS, MONTHS, t, month, apply, setLang, onChange, start, cropName, get lang() { return current; }, safeHTML };
  if (typeof module !== "undefined") module.exports = root.I18N;
})(typeof window !== "undefined" ? window : globalThis);
