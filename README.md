# Harvest Calendar Naija v3 · A Digital Guide to Seasonal Crops

Built by the **ByteBusters Coding Club, Yewa College, Ilaro** (Odu'a Investment Foundation).
When to plant and harvest 84 Nigerian crops in all 36 states + FCT, with a live planting check, an AI Farm Doctor and 17 Nigerian languages.

## What's new in v3

| Upgrade | What it does | Where |
|---|---|---|
| **Is it time to plant?** | Picks up the last 14 days of rain + 16-day forecast and soil moisture for your state, then applies the onset rule (20 mm in 3 days), dry-spell, flood and heat checks | `planting.html`, `js/planting.js`, `api/weather.js` |
| **AI Farm Doctor** | Describe a sick plant; the doctor checks **our own disease list first**, answers in your language, never gives chemical doses. Works offline with our list | `doctor.html`, `api/doctor.js` |
| **Photo checks (coming soon)** | Fully built and tested, but locked. Photos are shrunk on the phone before sending | `js/config.js` + `DOCTOR_PHOTOS` |
| **17 languages** | Hand-written: English, Hausa, Yoruba, Igbo, Pidgin. AI (beta): Fulfulde, Kanuri, Tiv, Ibibio, Efik, Izon, Edo, Nupe, Urhobo, Igala, Idoma, Ebira | `js/i18n.js`, `api/translate.js` |
| **SEO: 132 pages** | 84 crop guides ("When to plant maize in Nigeria"), 37 state calendars ("What to plant in Ogun State"), sitemap, social preview | `crops/`, `states/`, `sitemap.xml` |
| **AEO** | Every guide starts with a Quick answer + FAQ, Article and Breadcrumb labels (JSON-LD) | `tools/build.js` |
| **GEO** | `llms.txt` fact sheet for AI assistants; robots.txt welcomes AI search bots | `llms.txt`, `robots.txt` |
| **Premium design** | "Harvest at golden hour": forest green + harvest gold, Fraunces + Inter, night mode kept | `style.css` section 22 |

## Put it live on Vercel (one time)
1. vercel.com → **Add New → Project** → import `danieldave/harvest-calendar-naija`. Framework preset: **Other**. No build command.
2. **Settings → Environment Variables**: add `OPENAI_API_KEY` (needed for the Farm Doctor and AI languages). Leave `DOCTOR_PHOTOS` empty for now.
3. Deploy. If Vercel's address is not `https://harvest-calendar-naija.vercel.app`, put the real one in `tools/site.json`, run `node tools/build.js`, and push.
4. Google Search Console → add the site → submit `/sitemap.xml`.

The planting check needs **no key**: weather comes free from Open-Meteo, and Vercel saves each state's answer for 3 hours, so thousands of farmers cost almost nothing. If our API is unreachable, the phone asks Open-Meteo directly.

## Switching on photo checks later
Both switches are needed, so nobody can turn it on by accident:
1. `js/config.js` → `photos: true`
2. Vercel → `DOCTOR_PHOTOS=on` → redeploy

## Commands
```bash
node tools/build.js        # rebuild the 132 SEO pages, sitemap, robots.txt, llms.txt after changing js/data.js
node tools/test.js         # 26 checks: planting rules, API safety, languages, SEO/AEO/GEO (no key needed)
MOCK=1 node tools/dev.js   # run locally at http://localhost:3000
```

## Native speakers: help us improve a language
Open `js/i18n.js`, find the language block (e.g. `ha:` for Hausa), fix the words, and push. For an AI language, copy the English block, translate it, and change its `how` from `"ai"` to `"hand"` in `LANGS`.

## Project map
```
index.html, planting.html, doctor.html, crops.html, calendar.html, seasons.html, map.html, entries.html, tips.html
js/data.js        ALL the facts: 84 crops, 37 states (with weather coordinates), seasons
js/planting.js    the "is it time to plant?" thinking (same code in the browser and the tests)
js/i18n.js        17 languages
js/features.js    planting page, Farm Doctor, language picker
js/app.js         month view, year chart, library, map, entries, search, night mode
js/config.js      feature switches (photos)
api/weather.js    live weather, cached 3 hours        (Vercel function)
api/doctor.js     AI Farm Doctor                       (Vercel function)
api/translate.js  AI translation for 12 languages      (Vercel function)
tools/build.js    makes crops/, states/, sitemap.xml, robots.txt, llms.txt
```

Educational use only. Always confirm planting dates with your local ADP extension officer. Weather data: Open-Meteo.com (CC BY 4.0).
