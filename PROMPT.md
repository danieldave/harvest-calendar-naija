# Harvest Calendar Naija – Full Prompt (5-Part Formula)

## 1. ROLES
Act as a team of four experts working together:
- a **professional web developer** who writes clean, error-free, fully commented HTML, CSS and JavaScript;
- a **Nigerian farmer** who knows real planting and harvest practice in the field;
- a **crop scientist** who checks every fact against trusted sources (IITA, NAERLS, NRCRI, NCRI, NIHORT, CRIN, NIFOR, IAR and FAO);
- an **agricultural teacher with 30 years of experience** who explains things simply for beginners.

## 2. TASKS
Build a modern, professional **multi-page** website called **"HARVEST CALENDAR NAIJA – A DIGITAL GUIDE TO SEASONAL CROPS"**. It is an interactive educational calendar showing Nigerian crops and their seasonal information.

**A. Pages.** Every navigation link must open its own page, or jump to a section of the home page:
1. **Home (`index.html`)** has:
   - the animated farm scene: a farmer planting, a farmer harvesting and a truck full of crops;
   - today's date and season;
   - the search bar;
   - the "*[Month]* – What's happening?" month view, with the **current month picked automatically**. It shows a green "Being planted now" panel and a yellow "In harvest now" panel, a region filter and a Plant / Harvest / Both filter;
   - a "Pick a month" grid of 12 buttons;
   - "Explore" cards linking to every other page.

   The "This Month" link jumps to the month view on the home page.
2. **Year Chart (`calendar.html`):** a 12-month table of crops against January–December. Planting months are green, harvest months are gold and the current month column is highlighted. It has crop-group, region and Plant / Harvest / Both filters.
3. **Seasons (`seasons.html`):** crops grouped into dry season (Harmattan), early rains, peak rains and late rains.
4. **Crops (`crops.html`):** a library of **70–90 verified Nigerian crops** with a filter box and crop-group chips. Each crop opens a detail pop-up showing:
   - its local names (Yoruba, Hausa, Igbo);
   - its planting and harvest months;
   - a season note;
   - its regions (North-West, North-East, North-Central, South-West, South-East, South-South) and best-known states (e.g. Kebbi, Benue, Ogun);
   - a "Did you know?" fact;
   - a short practical tip (e.g. "Planted early in the rainy season. Verify local dates. Store on a shaded rack.");
   - its main **diseases and pests, with prevention** or what to use against them.
5. **Farm Map (`map.html`):** an interactive map of Nigeria's 36 states and the FCT. Users choose or type a crop to highlight the best and suitable states. They can also tap or search their state to see its climate zone, rainy months, what to plant and harvest there this month, and its best crops.
6. **My Entries (`entries.html`):** a form where users add their own crops (name, planting month, harvest month, state, note). Entries are saved on the device and appear in the month view and the year chart.
7. **Tips (`tips.html`):** basic "how to plant right" lessons and a disclaimer to confirm local dates with the state ADP extension officer.

**B. On every page:**
- the same header, with the logo and navigation bar. The current page is highlighted, and on phones the nav becomes a hamburger menu;
- a **search bar** with live suggestions for crops and states, which works from any page;
- the crop detail pop-up;
- a back-to-top button;
- "Previous / Next page" links;
- the smart fictional footer crediting **YEWA EGBADO COLLEGE ILARO – BYTEBUSTERS CODING CLUB**.

**C. Night mode.** Add a 🌙/☀️ switch in the header that changes the whole site between day and night colours:
- it follows the phone or computer's own dark-mode setting the first time;
- it remembers the user's choice on every page;
- in night mode the farm animation turns into a night scene with a moon, twinkling stars and darker fields;
- text stays easy to read in both modes.

**D. Animations and icons.** Use crop icons and gentle animations: floating crops, cards that bounce when touched, and cards that fade in as you scroll. Switch animations off for users who prefer reduced motion.

**E. Search-engine visibility.** Give every page its own title, description and keywords: harvest, calendar, naija, how to plant, when to plant, planting season Nigeria, crop calendar, crop diseases. Add structured data, a `robots.txt` and a `sitemap.xml` listing every page.

## 3. AUDIENCE
- Nigerian **farmers**.
- **Students** (secondary school and agricultural/food technology students).
- **Young people** who don't know when to plant or harvest crops.

Write in simple, friendly English, and make sure it works well on cheap Android phones and slow internet.

## 4. FORMAT
- An **interactive educational calendar** website delivered as separate files: `index.html`, `calendar.html`, `seasons.html`, `crops.html`, `map.html`, `entries.html`, `tips.html`, plus one shared `style.css`, one shared `script.js`, `robots.txt`, `sitemap.xml` and a `README.md` explaining how to host it and submit it to Google.
- Follow our hand-drawn layouts: header, search and view tabs, "Month – What's happening?" with plant and harvest cards, "Pick a month" grid, crops × months table, "Facts on the crops", footer.
- Make it **mobile-first and responsive**, with no sideways scrolling on phones.
- **Add a comment to every part of the code.**
- Also rewrite this prompt and send it back to us with the website.

## 5. LIMIT
- Use **only HTML, CSS and JavaScript**: no frameworks or libraries, and no paid map service. It must work offline after loading.
- Use **only genuine, verified information** from recognised Nigerian and international agricultural sources. Planting dates are general guides, and the site must tell users to verify local dates.
- **70–90 crops**, and every crop must have regions, states, a tip, a fact and at least one disease with prevention.
- The site must run **without any errors**. Test every page in day and night mode, on phone and desktop, before delivering.
