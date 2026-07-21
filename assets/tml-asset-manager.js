import { upload } from 'https://esm.sh/@vercel/blob/client';

const categories = {
  brand: '01_BRAND',
  slot: '02_SLOT_MACHINE',
  symbols: '03_REEL_SYMBOLS',
  currency: '04_CURRENCY',
  effects: '05_WIN_EFFECTS',
  ui: '06_UI',
  bonus: '07_CARDS_AND_BONUS',
  characters: '08_CHARACTERS',
  backgrounds: '09_BACKGROUNDS',
  audio: '10_AUDIO',
  marketing: '11_MARKETING',
  video: '12_VIDEO',
  fonts: '13_FONTS',
  source: '14_SOURCE'
};

const $ = (id) => document.getElementById(id);
const fileInput = $('assetFile');
const preview = $('preview');
const canvas = $('cropCanvas');
const ctx = canvas.getContext('2d');
const form = $('uploadForm');
const progress = $('progress');
const result = $('result');
const manifest = $('manifest');
const imageControls = $('imageControls');
let currentFile;
let image = new Image();
let objectUrl;

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'asset';
}

function selectedAspect() {
  const value = $('aspect').value;
  if (value === '1:1') return 1;
  if (value === '16:9') return 16 / 9;
  if (value === '9:16') return 9 / 16;
  if (value === '1024') return 1;
  return null;
}

function setCanvasSize() {
  const aspect = selectedAspect();
  if ($('aspect').value === '1024') {
    canvas.width = 1024;
    canvas.height = 1024;
    return;
  }
  if (!aspect && image.naturalWidth) {
    canvas.width = Math.min(image.naturalWidth, 1400);
    canvas.height = Math.round(canvas.width * (image.naturalHeight / image.naturalWidth));
    return;
  }
  canvas.width = 960;
  canvas.height = Math.round(canvas.width / (aspect || 1));
}

function drawCrop() {
  if (!currentFile || !currentFile.type.startsWith('image/') || !image.naturalWidth) return;
  setCanvasSize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#070b12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const zoom = Number($('zoom').value) / 100;
  const posX = Number($('posX').value) / 100;
  const posY = Number($('posY').value) / 100;
  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (canvas.width - width) * posX;
  const y = (canvas.height - height) * posY;
  ctx.drawImage(image, x, y, width, height);
}

function renderManifest() {
  const rows = JSON.parse(localStorage.getItem('tmlAssetManifest') || '[]');
  manifest.innerHTML = rows.length ? rows.map((row) => `
    <li><strong>${row.category}</strong> · <a href="${row.url}" target="_blank" rel="noreferrer">${row.pathname}</a></li>
  `).join('') : '<li>No uploaded assets in this browser yet.</li>';
}

function saveManifest(blob, category) {
  const rows = JSON.parse(localStorage.getItem('tmlAssetManifest') || '[]');
  rows.unshift({ category, url: blob.url, pathname: blob.pathname, uploadedAt: new Date().toISOString() });
  localStorage.setItem('tmlAssetManifest', JSON.stringify(rows.slice(0, 80)));
  renderManifest();
}

fileInput.addEventListener('change', () => {
  currentFile = fileInput.files && fileInput.files[0];
  preview.innerHTML = '';
  result.textContent = '';
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  if (!currentFile) return;
  objectUrl = URL.createObjectURL(currentFile);

  if (currentFile.type.startsWith('image/')) {
    imageControls.hidden = false;
    image = new Image();
    image.onload = drawCrop;
    image.src = objectUrl;
    preview.innerHTML = `<img src="${objectUrl}" alt="Selected asset preview">`;
  } else {
    imageControls.hidden = true;
    canvas.width = 1;
    canvas.height = 1;
    if (currentFile.type.startsWith('audio/')) preview.innerHTML = `<audio controls src="${objectUrl}"></audio>`;
    else if (currentFile.type.startsWith('video/')) preview.innerHTML = `<video controls src="${objectUrl}"></video>`;
    else preview.innerHTML = `<p>${currentFile.name}</p>`;
  }
});

['aspect', 'zoom', 'posX', 'posY'].forEach((id) => $(id).addEventListener('input', drawCrop));

async function croppedBlob() {
  if (!currentFile.type.startsWith('image/') || !$('cropImage').checked) return currentFile;
  drawCrop();
  const type = $('imageType').value;
  const quality = Number($('quality').value) / 100;
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentFile) return;

  const categoryKey = $('category').value;
  const category = categories[categoryKey] || '00_UNCATEGORIZED';
  const folder = `thats-my-lingo-casino/${category}`;
  const namePrefix = slug($('assetName').value || currentFile.name.replace(/\.[^.]+$/, ''));
  const uploadFile = await croppedBlob();
  if (!uploadFile) {
    result.textContent = 'Crop failed. Try the original file or choose a different output format.';
    return;
  }
  const outputExtensions = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' };
  const extension = outputExtensions[uploadFile.type] || slug(currentFile.name.split('.').pop() || 'bin');
  const pathname = `${folder}/${Date.now()}-${namePrefix}.${extension}`;

  progress.value = 0;
  result.textContent = 'Uploading directly to Vercel Blob...';

  try {
    const blob = await upload(pathname, uploadFile, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      clientPayload: JSON.stringify({
        category,
        originalName: currentFile.name,
        uploadKey: $('uploadKey').value,
        cropped: currentFile.type.startsWith('image/') && $('cropImage').checked
      }),
      onUploadProgress: (event) => {
        progress.value = event.percentage || 0;
      }
    });
    saveManifest(blob, category);
    result.innerHTML = `Uploaded: <a href="${blob.url}" target="_blank" rel="noreferrer">${blob.url}</a>`;
  } catch (error) {
    result.textContent = `Upload failed: ${error.message || error}`;
  }
});

renderManifest();
