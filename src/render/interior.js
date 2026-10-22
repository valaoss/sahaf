// Karavanın içi: sıcak ışıklı ahşap raflar, sırtında adı yazan kitaplar, rafın üstünde kedi, pencereden kasaba.
// Kitap sırtına dokununca vitrine girer/çıkar (data-feature). Vitrindekiler yukarı kalkık ve altın çerçeveli.
import { seeded } from '../core/rng.js';
import { BOOK, booksOf } from '../data/books.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';

const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function interiorSVG(S) {
  const ids = GENRE_KEYS.flatMap(g => booksOf(g)).filter(b => S.shelf[b.id]).map(b => b.id);
  const rows = [190, 390, 590], left = 150, right = 1470, unit = 40;
  // kitaplar üç rafa eşit dağılır, her raf ortalanır
  const perRow = Math.min(Math.floor((right - left) / unit), Math.max(8, Math.ceil(ids.length / rows.length)));
  const rowStart = row => { const n = Math.min(perRow, ids.length - row * perRow); return left + ((right - left) - n * unit) / 2; };
  const sky = TOWNS[S.town].sky;
  let spines = '';
  ids.forEach((id, i) => {
    const row = Math.floor(i / perRow);
    if (row >= rows.length) return;
    const b = BOOK[id], r = seeded([...id].reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7) % 99991);
    const x = rowStart(row) + (i % perRow) * unit, base = rows[row], h = 130 + r() * 42, w = unit - 4;
    const feat = S.featured.includes(id), rare = (S.rare[id] || 0) > 0;
    const col = shade(GENRES[b.genre].color, 0.82 + r() * 0.25);
    const lift = feat ? 14 : 0, title = b.title.length > 22 ? b.title.slice(0, 21) + '…' : b.title;
    spines += `<g class="spine ${feat ? 'feat' : ''}" data-feature="${id}">
      <rect x="${x}" y="${base - h - lift}" width="${w}" height="${h}" rx="4" fill="${rare ? '#e7b84a' : col}" stroke="${feat ? '#ffd56b' : 'rgba(0,0,0,.15)'}" stroke-width="${feat ? 4 : 1}"/>
      <rect x="${x + 4}" y="${base - h - lift + 10}" width="${w - 8}" height="4" rx="2" fill="#fff" opacity=".5"/>
      <rect x="${x + 4}" y="${base - lift - 18}" width="${w - 8}" height="4" rx="2" fill="#000" opacity=".15"/>
      <text transform="translate(${x + w / 2 + 5} ${base - lift - 26}) rotate(-90)" font-size="14" font-weight="600" fill="#fff" opacity=".92">${esc(title)}</text>
      ${S.shelf[id] > 1 ? `<text x="${x + w / 2}" y="${base - h - lift - 6}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff6e8">×${S.shelf[id]}</text>` : ''}
      ${feat ? `<text x="${x + w / 2}" y="${base - h - lift - (S.shelf[id] > 1 ? 22 : 6)}" text-anchor="middle" font-size="18">⭐</text>` : ''}
      ${rare ? `<circle cx="${x + w / 2}" cy="${base - h - lift + 26}" r="5" fill="#fff6c2" class="twinkle"/>` : ''}
    </g>`;
  });
  const shelves = rows.map(y => `<rect x="${left - 30}" y="${y}" width="${right - left + 60}" height="18" rx="4" fill="#9a6440"/><rect x="${left - 30}" y="${y}" width="${right - left + 60}" height="5" fill="#c08657"/><rect x="${left - 30}" y="${y + 18}" width="${right - left + 60}" height="10" fill="#000" opacity=".12"/>`).join('');
  return `
    <defs>
      <linearGradient id="inWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a3a"/><stop offset="1" stop-color="#4f3529"/></linearGradient>
      <radialGradient id="inLamp" cx=".5" cy=".1" r=".7"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset=".6" stop-color="#ffb347" stop-opacity=".12"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
      <linearGradient id="inSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
    </defs>
    <rect width="1600" height="760" rx="30" fill="url(#inWall)"/>
    <g opacity=".08" stroke="#fff" stroke-width="2">${Array.from({ length: 30 }, (_, i) => `<line x1="${i * 56}" y1="0" x2="${i * 56}" y2="760"/>`).join('')}</g>
    <!-- pencere -->
    <g transform="translate(40 40)"><rect width="80" height="110" rx="38" fill="url(#inSky)" stroke="#c08657" stroke-width="8"/>
      <path d="M40 0 L40 110 M0 60 L80 60" stroke="#c08657" stroke-width="5"/><path d="M0 92 C20 80 60 80 80 92 L80 110 L0 110Z" fill="#9ad7d2" opacity=".8"/></g>
    <!-- lamba -->
    <rect width="1600" height="760" fill="url(#inLamp)"/>
    <path d="M800 0 L800 40" stroke="#3d2b24" stroke-width="3"/><path d="M770 40 L830 40 L812 66 L788 66Z" fill="#f2c45a"/><circle cx="800" cy="70" r="7" fill="#fff3b0" class="twinkle"/>
    ${shelves}
    ${spines}
    <!-- rafın üstünde kedi -->
    <g transform="translate(1380 ${rows[0] - 6})"><ellipse cx="0" cy="-14" rx="36" ry="16" fill="#f4b064"/><circle cx="-26" cy="-22" r="13" fill="#f4b064"/>
      <path d="M-36 -30 L-32 -42 L-26 -32Z M-20 -32 L-14 -42 L-12 -28Z" fill="#f4b064"/><path d="M-31 -21 Q-28 -18 -25 -21 M-21 -21 Q-18 -18 -15 -21" stroke="#5a3d30" stroke-width="2" fill="none"/>
      <path class="tail" d="M30 -10 C48 -4 50 12 40 16" fill="none" stroke="#f0a35a" stroke-width="8" stroke-linecap="round"/></g>
    <!-- saksı -->
    <g transform="translate(70 ${rows[2]})"><path d="M-18 0 L18 0 L14 -26 L-14 -26Z" fill="#e0805f"/><g fill="#7fb36d"><ellipse cx="-8" cy="-40" rx="7" ry="16"/><ellipse cx="6" cy="-46" rx="7" ry="20"/></g></g>
    ${ids.length ? '' : '<text x="800" y="420" text-anchor="middle" font-size="40" fill="#f3e2bf">Raflar boş… toptancıya uğra.</text>'}`;
}
