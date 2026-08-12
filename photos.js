const photos = window.RETURN_PHOTOS || [];
const gallery = document.querySelector('#return-gallery');
const empty = document.querySelector('#returns-empty');
const dialog = document.querySelector('.return-lightbox');
const lightboxArt = dialog.querySelector('.lightbox-art');
const lightboxTitle = dialog.querySelector('h3');
const counter = dialog.querySelector('.counter');
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const photoPath = photo => `assets/返圖區/${photo.file}`;
let current = 0;

gallery.innerHTML = photos.map((photo, index) => {
  const path = photoPath(photo);
  return `<button class="return-card" type="button" data-index="${index}" aria-label="開啟返圖照片 ${index + 1}"><img src="${escapeHtml(path)}" alt="返圖照片 ${index + 1}" loading="lazy"></button>`;
}).join('');
empty.hidden = photos.length > 0;

function showPhoto(index) {
  if (!photos.length) return;
  current = (index + photos.length) % photos.length;
  const photo = photos[current];
  lightboxArt.style.backgroundImage = `url("${photoPath(photo)}")`;
  lightboxTitle.textContent = '';
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  if (!dialog.open) dialog.showModal();
}

gallery.addEventListener('click', event => {
  const card = event.target.closest('.return-card');
  if (card) showPhoto(Number(card.dataset.index));
});
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.querySelector('.prev').addEventListener('click', () => showPhoto(current - 1));
dialog.querySelector('.next').addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowLeft') showPhoto(current - 1);
  if (event.key === 'ArrowRight') showPhoto(current + 1);
});

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('#main-nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
