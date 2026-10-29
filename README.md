# Harvest Calendar Naija – A Digital Guide to Seasonal Crops (v2: multi-page + night mode)
Built by the **Yewa Egbado College Ilaro – ByteBusters Coding Club**. HTML, CSS and JavaScript only.

## Pages
| File | Page | What's on it |
|---|---|---|
| `index.html` | Home | Farm animation, today's season, **This Month** (planted / in harvest), Pick a month, Explore cards |
| `calendar.html` | Year Chart | 12-month crop × month table with filters |
| `seasons.html` | Seasons | Crops for dry season, early rains, peak rains, late rains |
| `crops.html` | Crops | Facts on 84 crops: best states, tips, diseases and prevention |
| `map.html` | Farm Map | Interactive Nigeria state map: best states per crop, what suits your state |
| `entries.html` | My Entries | Add your own crops to the calendar (saved on this device) |
| `tips.html` | Tips | How to plant right + disclaimer |

Shared by every page: `style.css` (all styling, including night mode) and `script.js` (all features).
Every page has the same header, search bar, footer, crop pop-up and Previous/Next links.

## Night mode
- Tap **🌙 Night** in the header to switch, and **☀️ Day** to switch back.
- The first time, it follows the phone or computer's own dark-mode setting.
- The choice is remembered on every page.
- In night mode the farm animation shows a moon, twinkling stars and the truck's headlight.

## Links between pages
- `map.html?crop=white-yam` opens the map with White yam highlighted.
- `map.html?state=Ogun` opens the map with Ogun selected.
- `crops.html?q=tomato` opens the crop library filtered to "tomato".

The search bar and crop pop-up use these links automatically.

## Run it
Keep all files in **one folder** and double-click `index.html`. It works offline (fonts fall back to system fonts).

## Put it online and get found on Google
1. Host it free on **GitHub Pages** or **Netlify** (drag-and-drop the folder).
2. Replace `https://harvestcalendarnaija.example/` with your real address in every page's `<link rel="canonical">` and `og:url`, in `robots.txt` and in `sitemap.xml`. A find-and-replace across the folder does it in one go.
3. Add the site to **Google Search Console** and submit `sitemap.xml`. It lists all 7 pages.
4. Share the link (WhatsApp, school site, social media).

Each page has its own title, description and keywords, so Google can show different pages for different searches, e.g. "when to plant maize in Nigeria" can land on the Year Chart. Indexing takes days to weeks and ranking is never guaranteed.

## Edit crops
Each crop is one object in the `CROPS` list in `script.js`. Months are numbers 1–12.
`p` = planting months, `h` = harvest months, `z` = regions, `st` = best states, `d` = diseases.

## Data note
Months and facts are general guides from IITA, NAERLS, NRCRI, NCRI, NIHORT, CRIN, NIFOR, IAR and FAO material. Confirm local dates with your state ADP extension officer.

See `PROMPT.md` for the full 5-part prompt used to build this site.
