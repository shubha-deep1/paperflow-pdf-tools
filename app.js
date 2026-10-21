const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
$('#year').textContent = new Date().getFullYear();

const tabs = $$('.tab');
const cards = $$('.tool-card');
let activeFilter = 'all';
function filterTools() {
  const q = $('#search').value.trim().toLowerCase();
  let shown = 0;
  cards.forEach(card => {
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !q || (card.dataset.name + ' ' + card.innerText).toLowerCase().includes(q);
    card.hidden = !(matchesCategory && matchesSearch);
    if (!card.hidden) shown++;
  });
  $('#emptyState').hidden = shown !== 0;
}
tabs.forEach(tab => tab.addEventListener('click', () => {
  activeFilter = tab.dataset.filter;
  tabs.forEach(t => { const active = t === tab; t.classList.toggle('active', active); t.setAttribute('aria-selected', String(active)); });
  filterTools();
}));
$('#search').addEventListener('input', filterTools);
$('#menuBtn').addEventListener('click', () => {
  const nav = $('.desktop-nav'); const open = nav.classList.toggle('open');
  $('#menuBtn').setAttribute('aria-expanded', String(open));
});

const modal = $('#modal');
const converterPanel = $('#converterPanel');
const plannedPanel = $('#plannedPanel');
const input = $('#imageInput');
let selectedImages = [];
function openTool(tool) {
  modal.hidden = false;
  $('#status').textContent = '';
  $('#status').className = 'status';
  if (tool === 'images-pdf') {
    $('#modalTitle').textContent = 'Images to PDF';
    $('#modalDesc').textContent = 'Select images and convert them into one PDF file.';
    converterPanel.hidden = false; plannedPanel.hidden = true;
  } else {
    const names = {'pdf-images':'PDF to images','merge':'Merge PDF','split':'Split PDF','compress':'Compress PDF','rotate':'Rotate PDF','protect':'Protect PDF','word-pdf':'Word to PDF'};
    $('#modalTitle').textContent = names[tool] || 'PDF tool';
    $('#modalDesc').textContent = 'This feature is listed in the toolbox but is not active in this starter version.';
    converterPanel.hidden = true; plannedPanel.hidden = false;
  }
}
$$('[data-tool]').forEach(btn => btn.addEventListener('click', () => openTool(btn.dataset.tool)));
$('#closeModal').addEventListener('click', () => { modal.hidden = true; });
modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.hidden = true; });

function updateSelected() {
  selectedImages = [...input.files];
  $('#selectedFiles').textContent = selectedImages.length
    ? `${selectedImages.length} image${selectedImages.length === 1 ? '' : 's'} selected: ${selectedImages.map(f => f.name).join(', ')}`
    : 'No images selected yet.';
  $('#convertBtn').disabled = selectedImages.length === 0;
  $('#status').textContent = '';
  $('#status').className = 'status';
}
input.addEventListener('change', updateSelected);
const drop = $('#dropZone');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.background = '#f0edff'; });
drop.addEventListener('dragleave', () => { drop.style.background = ''; });
drop.addEventListener('drop', e => {
  e.preventDefault(); drop.style.background = '';
  const files = [...e.dataTransfer.files].filter(f => ['image/jpeg','image/png','image/webp'].includes(f.type));
  if (!files.length) { $('#status').textContent = 'Choose JPG, PNG or WebP images.'; $('#status').className='status error'; return; }
  const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); input.files = dt.files; updateSelected();
});

function loadPdfLibrary() {
  return new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('PDF library did not load.'));
    script.onerror = () => reject(new Error('Could not load the PDF library. Check your internet connection and try again.'));
    document.head.appendChild(script);
  });
}
function imageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const result = {img, url, width: img.naturalWidth, height: img.naturalHeight}; resolve(result); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not read ${file.name}`)); };
    img.src = url;
  });
}
$('#convertBtn').addEventListener('click', async () => {
  const btn = $('#convertBtn'), status = $('#status');
  btn.disabled = true; btn.textContent = 'Preparing PDF…'; status.className = 'status'; status.textContent = 'Processing images locally in your browser.';
  const urls = [];
  try {
    const jsPDF = await loadPdfLibrary();
    const size = $('#pageSize').value;
    const pdf = new jsPDF({orientation:'portrait', unit:'pt', format:size === 'fit' ? 'a4' : size, compress:true});
    for (let i=0; i<selectedImages.length; i++) {
      const item = await imageDimensions(selectedImages[i]); urls.push(item.url);
      let pageW, pageH;
      if (size === 'fit') {
        const scale = Math.min(595.28/item.width, 841.89/item.height, 1);
        pageW = Math.max(1, item.width*scale); pageH = Math.max(1, item.height*scale);
        if (i === 0) pdf.deletePage(1);
        pdf.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
      } else {
        const dims = pdf.internal.pageSize; pageW = dims.getWidth(); pageH = dims.getHeight();
        if (i > 0) pdf.addPage(size);
      }
      const margin = size === 'fit' ? 0 : 24;
      const boxW = pageW - margin*2, boxH = pageH - margin*2;
      const ratio = $('#imageFit').value === 'cover' ? Math.max(boxW/item.width, boxH/item.height) : Math.min(boxW/item.width, boxH/item.height);
      const w = item.width*ratio, h = item.height*ratio;
      const x = (pageW-w)/2, y = (pageH-h)/2;
      const canvas = document.createElement('canvas');
      canvas.width = item.width; canvas.height = item.height;
      const ctx = canvas.getContext('2d', {alpha:false});
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(item.img,0,0);
      pdf.addImage(canvas.toDataURL('JPEG',0.92),'JPEG',x,y,w,h,undefined,'FAST');
    }
    const filename = `paperflow-${new Date().toISOString().slice(0,10)}.pdf`;
    pdf.save(filename);
    status.textContent = `Done. Your PDF download should begin now (${selectedImages.length} page${selectedImages.length===1?'':'s'}).`;
  } catch (err) {
    status.textContent = err.message || 'Something went wrong while creating the PDF.';
    status.className = 'status error';
  } finally {
    urls.forEach(URL.revokeObjectURL);
    btn.innerHTML = 'Convert and download PDF <span>↗</span>';
    btn.disabled = selectedImages.length === 0;
  }
});
