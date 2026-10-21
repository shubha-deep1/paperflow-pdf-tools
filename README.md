# Paperflow

A static, responsive file-tools website. It runs file operations in the browser and does not send selected files to a Paperflow server.

## Tools included

- Images to PDF (JPG, PNG, WebP)
- PDF pages to PNG images (downloaded as a ZIP)
- Merge PDFs
- Split PDF by page range
- Compress PDF by rasterizing pages to JPEG (text will not remain selectable)
- Rotate PDF pages
- Extract selectable PDF text to TXT
- DOCX to PDF (best-effort browser conversion; complex layouts may differ from Microsoft Word)

## Run locally

Open `index.html` in a modern browser while connected to the internet. The site loads open-source processing libraries from CDNs on demand. This means the UI can open offline after caching, but tools are not guaranteed to work offline on a first visit.

## Publish on GitHub Pages

Upload `index.html`, `style.css`, `app.js`, and `README.md` to the root of the `main` branch. In repository Settings → Pages, choose **Deploy from a branch**, select `main` and `/(root)`, then Save. GitHub Pages needs `index.html` at the root of the selected source.

## Limitations

- Large PDFs can use substantial memory on phones.
- Compression rasterizes the pages, reducing searchability and accessibility.
- DOCX conversion is best-effort and may not preserve all complex formatting.
- Password-protecting/encrypting PDFs is not included because the browser-side PDF library used here does not support writing encrypted PDFs.
