const seriesData = window.PORTFOLIO_SERIES || [];
const filterBar = document.querySelector('#filter-bar');
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('.lightbox');
const lightboxArt = dialog.querySelector('.lightbox-art');
const lightboxTitle = dialog.querySelector('h3');
const counter = dialog.querySelector('.counter');

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const imagePath = (series, item) => `assets/${series.folder}/${item.file}`;
const totalWorks = seriesData.reduce((sum, series) => sum + series.items.length, 0);

filterBar.innerHTML = [
  `<button class="filter active" data-filter="all">全部 <sup>${String(totalWorks).padStart(2, '0')}</sup></button>`,
  ...seriesData.map(series => `<button class="filter" data-filter="${escapeHtml(series.key)}">${escapeHtml(series.short)} <sup>${String(series.items.length).padStart(2, '0')}</sup></button>`)
].join('');

gallery.innerHTML = seriesData.map((series, seriesIndex) => {
  const heading = `<div class="series-heading" data-category="${escapeHtml(series.key)}"><span>系列 ${String(seriesIndex + 1).padStart(2, '0')}</span><h3>${escapeHtml(series.name)}</h3><p>${escapeHtml(series.description)}</p></div>`;
  const cards = series.items.map((item, itemIndex) => {
    const title = item.title || series.short;
    const path = imagePath(series, item);
    const rowClass = item.rowStart ? ' series-row-start' : '';
    return `<article class="work-card${rowClass}" data-category="${escapeHtml(series.key)}" data-image="${escapeHtml(path)}" tabindex="0"><img class="art series-photo" src="${escapeHtml(path)}" alt="${escapeHtml(title)}"><div class="meta"><h3>${escapeHtml(title)}</h3></div></article>`;
  }).join('');
  return heading + cards;
}).join('');

const cards = [...document.querySelectorAll('.work-card')];
const filters = document.querySelectorAll('.filter');
const seriesHeadings = document.querySelectorAll('.series-heading');
let browsingCards = cards;
let current = 0;

filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const selected = button.dataset.filter;
  cards.forEach(card => card.classList.toggle('hidden', selected !== 'all' && card.dataset.category !== selected));
  seriesHeadings.forEach(heading => { heading.hidden = selected !== 'all' && heading.dataset.category !== selected; });
}));

function showWork(index) {
  current = (index + browsingCards.length) % browsingCards.length;
  const card = browsingCards[current];
  lightboxArt.style.backgroundImage = `url("${card.dataset.image}")`;
  lightboxTitle.textContent = card.querySelector('h3').textContent;
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(browsingCards.length).padStart(2, '0')}`;
  if (!dialog.open) dialog.showModal();
}

cards.forEach(card => {
  const openCard = () => {
    browsingCards = cards.filter(item => item.dataset.category === card.dataset.category);
    showWork(browsingCards.indexOf(card));
  };
  card.addEventListener('click', openCard);
  card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCard(); } });
});

dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.querySelector('.prev').addEventListener('click', () => showWork(current - 1));
dialog.querySelector('.next').addEventListener('click', () => showWork(current + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', event => { if (!dialog.open) return; if (event.key === 'ArrowLeft') showWork(current - 1); if (event.key === 'ArrowRight') showWork(current + 1); });

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('#main-nav');
menuBtn.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }));
