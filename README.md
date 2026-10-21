# Paperflow — PDF tools starter

A responsive, colorful front-end inspired by the general idea of an all-in-one PDF toolbox, with original branding and layout.

## Run it
1. Extract the ZIP.
2. Open `index.html` in a modern browser, or use VS Code + the Live Server extension.
3. The Images to PDF tool can combine JPG, PNG and WebP images into one downloadable PDF.

## Important limitations
- This starter does **not** yet implement Merge PDF, Split PDF, Compress PDF, Rotate PDF, Protect PDF, PDF-to-images or Word-to-PDF. They are visibly labelled “Coming next” instead of pretending to work.
- The first image-to-PDF conversion loads jsPDF from cdnjs, so an internet connection is required for that library. Image files are processed locally in the browser and are not uploaded by this code.
- Google Fonts are loaded from Google. If you want no third-party requests at all, remove the `@import` line in `style.css` and use system fonts, and bundle a reviewed copy of jsPDF locally.
- This is a static starter, not a security audit. For a public website, review dependencies, add a privacy page, test on mobile browsers, and verify all features before advertising it as a production service.
- Free static hosting can publish the site, but the currently implemented image converter works client-side. More advanced PDF operations may require additional browser libraries or a backend.

## Files
- `index.html` — page structure and tool cards
- `style.css` — responsive visual design
- `app.js` — filtering, tabs, modal, and image-to-PDF conversion
