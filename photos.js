const photos = window.RETURN_PHOTOS || [];
const gallery = document.querySelector('#return-gallery');
const empty = document.querySelector('#returns-empty');
const dialog = document.querySelector('.return-lightbox');
const lightboxArt = dialog.querySelector('.lightbox-art');
const lightboxTitle = dialog.querySelector('h3');
const counter = dialog.querySelector('.counter');
const closeButton = dialog.querySelector('.close');
const previousButton = dialog.querySelector('.prev');
const nextButton = dialog.querySelector('.next');
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lightboxSwapTimer;
let lightboxCloseTimer;
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const photoPath = photo => `assets/返圖區/${photo.file}`;
let current = 0;

const slideshow = document.querySelector('#return-slideshow');
const slideImage = slideshow.querySelector('.slide-photo img');
const slideButton = slideshow.querySelector('.slide-photo');
const slideCounter = slideshow.querySelector('.slide-counter');
const slideDots = slideshow.querySelector('.slide-dots');
const randomIndexes = [...photos.keys()]
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.min(10, photos.length));
let slidePosition = 0;
let slideTimer;
let slideSwapTimer;

slideDots.innerHTML = randomIndexes.map((_, index) =>
  `<button type="button" data-slide="${index}" aria-label="前往第 ${index + 1} 張幻燈片"></button>`
).join('');

function showSlide(position, restart = true) {
  if (!randomIndexes.length) {
    slideshow.hidden = true;
    return;
  }
  slidePosition = (position + randomIndexes.length) % randomIndexes.length;
  const photoIndex = randomIndexes[slidePosition];
  const applySlide = () => {
    slideImage.src = photoPath(photos[photoIndex]);
    slideImage.alt = `隨機返圖 ${slidePosition + 1}`;
    slideButton.dataset.photoIndex = photoIndex;
    slideCounter.textContent = `${String(slidePosition + 1).padStart(2, '0')} / ${String(randomIndexes.length).padStart(2, '0')}`;
    slideDots.querySelectorAll('button').forEach((dot, index) => {
      const active = index === slidePosition;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };
  window.clearTimeout(slideSwapTimer);
  if (!slideImage.getAttribute('src') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applySlide();
  } else {
    slideImage.classList.add('changing');
    slideSwapTimer = window.setTimeout(applySlide, 360);
  }
  if (restart) startSlideshow();
}

function startSlideshow() {
  window.clearInterval(slideTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || randomIndexes.length < 2) return;
  slideTimer = window.setInterval(() => showSlide(slidePosition + 1, false), 3000);
}

slideImage.addEventListener('load', () => slideImage.classList.remove('changing'));
slideshow.querySelector('.slide-prev').addEventListener('click', () => showSlide(slidePosition - 1));
slideshow.querySelector('.slide-next').addEventListener('click', () => showSlide(slidePosition + 1));
slideDots.addEventListener('click', event => {
  const dot = event.target.closest('[data-slide]');
  if (dot) showSlide(Number(dot.dataset.slide));
});
slideshow.addEventListener('mouseenter', () => window.clearInterval(slideTimer));
slideshow.addEventListener('mouseleave', startSlideshow);
slideshow.addEventListener('focusin', () => window.clearInterval(slideTimer));
slideshow.addEventListener('focusout', event => {
  if (!slideshow.contains(event.relatedTarget)) startSlideshow();
});

gallery.innerHTML = photos.map((photo, index) => {
  const path = photoPath(photo);
  return `<button class="return-card" type="button" data-index="${index}" aria-label="開啟返圖照片 ${index + 1}"><img src="${escapeHtml(path)}" alt="返圖照片 ${index + 1}" loading="lazy"></button>`;
}).join('');
empty.hidden = photos.length > 0;

function openLightbox() {
  if (dialog.open) return;
  dialog.classList.remove('is-closing');
  dialog.showModal();
  if (reduceMotion()) {
    dialog.classList.add('is-visible');
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-visible')));
}

function closeLightbox() {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  window.clearTimeout(lightboxCloseTimer);
  dialog.classList.add('is-closing');
  dialog.classList.remove('is-visible');
  const finish = () => {
    if (dialog.open) dialog.close();
    dialog.classList.remove('is-closing');
  };
  if (reduceMotion()) finish();
  else lightboxCloseTimer = window.setTimeout(finish, 240);
}

function showPhoto(index, direction = 0) {
  if (!photos.length) return;
  current = (index + photos.length) % photos.length;
  const photo = photos[current];
  const applyPhoto = () => {
    lightboxArt.style.backgroundImage = `url("${photoPath(photo)}")`;
    lightboxTitle.textContent = '';
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  };

  window.clearTimeout(lightboxSwapTimer);
  if (!dialog.open || !direction || reduceMotion()) {
    applyPhoto();
    openLightbox();
    return;
  }

  lightboxArt.classList.remove('swap-prev', 'swap-next');
  lightboxArt.classList.add(direction < 0 ? 'swap-prev' : 'swap-next', 'is-swapping');
  lightboxSwapTimer = window.setTimeout(() => {
    applyPhoto();
    requestAnimationFrame(() => lightboxArt.classList.remove('is-swapping'));
    window.setTimeout(() => lightboxArt.classList.remove('swap-prev', 'swap-next'), 280);
  }, 150);
}

gallery.addEventListener('click', event => {
  const card = event.target.closest('.return-card');
  if (card) showPhoto(Number(card.dataset.index));
});
slideButton.addEventListener('click', () => showPhoto(Number(slideButton.dataset.photoIndex)));
closeButton.addEventListener('click', closeLightbox);
previousButton.addEventListener('click', () => showPhoto(current - 1, -1));
nextButton.addEventListener('click', () => showPhoto(current + 1, 1));
dialog.addEventListener('click', event => { if (event.target === dialog) closeLightbox(); });
dialog.addEventListener('cancel', event => { event.preventDefault(); closeLightbox(); });
dialog.addEventListener('close', () => dialog.classList.remove('is-visible', 'is-closing'));
document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowLeft') showPhoto(current - 1, -1);
  if (event.key === 'ArrowRight') showPhoto(current + 1, 1);
});

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('#main-nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

showSlide(0);
