# Bhavya Sharma · Business Website Portfolio

One-page portfolio for a web designer who builds websites for businesses.
Plain HTML, CSS and JavaScript. No build step. GSAP is included in /vendor (no outside requests).

## Look
Graphite & Acid Lime. Space Grotesk headings, Manrope body text (fonts included in /fonts).
Colours are the variables at the top of style.css.

## Files
index.html     page markup
style.css      all styles, including the 3D stage and the project reveal animation
app.js         scroll-driven 3D mockup engine (hero)
work.js        smooth scrolling (Lenis, desktop) + builds each My work card (layout, chips, badges) and makes it sticky
stack.js       My work card motion: the swing-in, push-back, 3D screenshot tilt, chip depth and progress line. All tuning values are in the T object at the top
work3.css/work3.js My work extras: sticky progress rail, word-by-word title reveal, heading fade, card dwell/shadow/3D styles. The three project rows below the cards only use the simple wipe reveal (style.css), no scroll tilt
nav.css/nav.js bottom navigation that expands into a full menu (hides the old top header)
max.css/max.js maximalist layer: tickers, giant words, badges, hard shadows
max2.css/max2.js  maximalist layer 2: stats, "Why me" bento, tickers, floating CTA, cursor, grain
vendor/        gsap, ScrollTrigger and Lenis (smooth scrolling)
mittra.webp    screenshot, Mittra Clinic (light WebP; the original PNGs are in source-images/)
delhi.webp     screenshot, Delhi Clinic
randhawa-clinic.webp  screenshot, Randhawa Clinic
fonts/         Space Grotesk and Manrope (woff2)

## Run locally
Open index.html in a browser.

## Editing
- Contact details: search 9350002593 and bhavya.webdesign@gmail.com in index.html
- Add or change a project: edit the project rows in index.html and the PROJ list at the top of app.js
- Replace a screenshot: save your image over the file with the same name

## Contact
WhatsApp / call: +91 93500 02593 · bhavya.webdesign@gmail.com

## Tuning the My work cards
- Rest time before the next card comes in: `--dwell` in work3.css (34svh desktop, 22svh phone). Set it to 0 for no rest.
- How hard the cards tilt, how far they get pushed back, how dark they dim, 3D depth of the chips: the `T` object at the top of stack.js (separate `desk` and `phone` values).
- Shadow under a card that lands on another one: `.stack .scard.over` in work3.css.
- Screenshot size: the column split `grid-template-columns` and `.scard-img` max-height in work3.css. Screenshot motion (grow-in, rest zoom `zoom`/`drift`, in-frame slide `slide`/`imgScale`): the `T` object in stack.js.
- Phone hero mockup: in app.js (search "problems\" section slides over it") the mockup is clipped at the top edge of the problems section on phones/tablets, so it tucks behind that section instead of floating over its text. Desktop is not clipped.
