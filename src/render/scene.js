// Kasaba sahnesi: tek SVG (1600×900). Statik parçalar burada, değişenler (evler, raflar, renkler) fonksiyonlarla.
import { el } from '../core/svg.js';
import { seeded } from '../core/rng.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { booksOf } from '../data/books.js';
import { PAINTS } from '../data/decor.js';
import { shelfCap, genreCounts } from '../game/state.js';
import { DECOR_ART } from './decor-art.js';
import { spotArt, GROUND, SHOW_HOUSES } from './spot-art.js';

// Mevsim görünümleri: a/b ağaç yaprakları, bits uçuşan parçacık renkleri, tint serin/ılık ton
const SEASON_LOOK = {
  'İlkbahar': { a: '#9cb67f', b: '#b5cb94', bits: ['#f6a5c0', '#fbd0dc', '#fff'] },
  'Yaz':      { a: '#86b85f', b: '#a9d27e' },
  'Sonbahar': { a: '#d39a52', b: '#e6b86c', bits: ['#e08a3c', '#c96f3a', '#e8b04a'] },
  'Kış':      { a: '#8ea596', b: '#a9bcae', tint: '#6f8fc0' },
};

const cloud = (delay, slow, cy, s) => `
  <g class="drift${slow ? ' slow' : ''}" style="animation-delay:${delay}s">
    <g fill="#fff8ee" opacity=".92" transform="translate(0 ${cy}) scale(${s})">
      <ellipse cx="0" cy="0" rx="70" ry="30"/><ellipse cx="45" cy="-20" rx="50" ry="38"/><ellipse cx="95" cy="2" rx="60" ry="26"/>
    </g>
  </g>`;

const MARKUP = `
<svg class="scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" id="skyTop"/><stop offset="1" id="skyBot"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" id="seaTop"/><stop offset="1" id="seaBot"/></linearGradient>
    <radialGradient id="sunGlow"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".6"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
    <pattern id="cobble" width="70" height="40" patternUnits="userSpaceOnUse">
      <rect width="70" height="40" fill="#f1dcb5"/>
      <rect x="4" y="5" width="28" height="13" rx="6" fill="#ead0a3"/><rect x="38" y="5" width="28" height="13" rx="6" fill="#edd5ab"/>
      <rect x="-14" y="23" width="28" height="13" rx="6" fill="#edd5ab"/><rect x="20" y="23" width="28" height="13" rx="6" fill="#ead0a3"/>
      <rect x="56" y="23" width="28" height="13" rx="6" fill="#ead0a3"/>
    </pattern>
    <pattern id="sand" width="60" height="40" patternUnits="userSpaceOnUse">
      <rect width="60" height="40" fill="#f3e0b8"/>
      <circle cx="10" cy="8" r="2" fill="#e6cc9a"/><circle cx="40" cy="20" r="2.5" fill="#e6cc9a"/><circle cx="24" cy="32" r="1.8" fill="#ead3a8"/><circle cx="52" cy="5" r="1.5" fill="#ead3a8"/>
    </pattern>
    <pattern id="grass" width="70" height="44" patternUnits="userSpaceOnUse">
      <rect width="70" height="44" fill="#dfe3ae"/>
      <path d="M10 30 l3 -8 l3 8 M44 14 l3 -8 l3 8 M58 38 l2 -6 l2 6" fill="none" stroke="#b9c983" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="30" cy="8" r="2.5" fill="#fff6e8"/><circle cx="64" cy="22" r="2" fill="#f6a5c0"/>
    </pattern>
  </defs>

  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="1290" cy="170" r="190" fill="url(#sunGlow)"/>
  <circle cx="1290" cy="170" r="62" fill="#fff0bd"/>
  ${cloud(-20, false, 120, 1)}${cloud(-60, true, 220, 1.2)}${cloud(-45, false, 80, .7)}

  <!-- uzak tepe + deniz feneri -->
  <path d="M1080 360 C1200 270 1320 250 1420 265 C1500 278 1560 300 1600 320 L1600 380 L1080 380Z" fill="#c4dc9b"/>
  <path d="M1180 360 C1260 310 1360 300 1450 312 C1520 322 1570 340 1600 352 L1600 380 L1180 380Z" fill="#acd08a"/>
  <g transform="translate(1440 190)">
    <path d="M10 0 L40 0 L46 90 L4 90Z" fill="#fffaf2"/>
    <path d="M8 22 L42 22 L43 40 L7 40Z M6 58 L44 58 L45 74 L5 74Z" fill="#f08a7e"/>
    <rect x="6" y="-22" width="38" height="24" rx="6" fill="#ffe9a6"/>
    <path d="M2 -22 L25 -46 L48 -22Z" fill="#f08a7e"/>
    <circle cx="25" cy="-10" r="30" fill="#fff3b0" opacity=".35" class="twinkle"/>
  </g>
  <path d="M0 330 C80 280 170 270 260 300 C330 320 380 335 420 345 L420 380 L0 380Z" fill="#d6cfe4" opacity=".8"/>

  <!-- deniz -->
  <rect x="0" y="340" width="1600" height="160" fill="url(#sea)"/>
  <g stroke="#e9fbf7" stroke-width="4" stroke-linecap="round">
    <line x1="160" y1="380" x2="190" y2="380" class="twinkle"/>
    <line x1="520" y1="400" x2="560" y2="400" class="twinkle" style="animation-delay:.8s"/>
    <line x1="880" y1="372" x2="905" y2="372" class="twinkle" style="animation-delay:1.3s"/>
    <line x1="1120" y1="410" x2="1160" y2="410" class="twinkle" style="animation-delay:.4s"/>
    <line x1="1340" y1="390" x2="1365" y2="390" class="twinkle" style="animation-delay:1.8s"/>
    <line x1="700" y1="430" x2="730" y2="430" class="twinkle" style="animation-delay:2.1s"/>
  </g>
  <g transform="translate(330 365)"><g class="bob">
    <path d="M0 20 L90 20 L74 42 L14 42Z" fill="#fffaf2"/><path d="M0 20 L90 20 L86 28 L4 28Z" fill="#4a7fb5"/>
    <line x1="45" y1="20" x2="45" y2="-38" stroke="#8a5a3c" stroke-width="4"/>
    <path d="M48 -34 L84 14 L48 14Z" fill="#fff4e0"/><path d="M42 -26 L14 14 L42 14Z" fill="#f08a7e"/>
  </g></g>

  <g id="houses"></g>
  <g id="spotBack"></g>
  <g id="festival"></g>

  <!-- zemin -->
  <rect id="ground" x="0" y="560" width="1600" height="340" fill="url(#cobble)"/>
  <rect id="curb" x="0" y="556" width="1600" height="10" fill="#e3c597"/>

  <!-- zeytin ağacı -->
  <ellipse cx="160" cy="642" rx="80" ry="12" fill="#d9bb8b" opacity=".7"/>
  <g transform="translate(150 640)"><g class="sway">
    <path d="M-8 0 C-6 -50 -16 -80 -4 -120 L8 -120 C2 -80 12 -50 10 0Z" fill="#8a6a4f"/>
    <g id="treeA" fill="#9cb67f"><circle cx="-40" cy="-140" r="46"/><circle cx="20" cy="-170" r="52"/><circle cx="58" cy="-128" r="40"/><circle cx="-6" cy="-112" r="40"/></g>
    <g id="treeB" fill="#b5cb94"><circle cx="-30" cy="-158" r="22"/><circle cx="30" cy="-190" r="24"/></g>
    <g fill="#5d6e45"><circle cx="-10" cy="-150" r="5"/><circle cx="38" cy="-140" r="5"/><circle cx="-44" cy="-120" r="5"/><circle cx="16" cy="-184" r="5"/></g>
  </g></g>

  <!-- sergi masası -->
  <g transform="translate(390 610)">
    <ellipse cx="100" cy="150" rx="120" ry="14" fill="#d2b183" opacity=".7"/>
    <rect x="20" y="70" width="12" height="80" rx="4" fill="#7a4e33"/><rect x="168" y="70" width="12" height="80" rx="4" fill="#7a4e33"/>
    <rect x="0" y="54" width="200" height="22" rx="8" fill="#a8704a"/><rect x="0" y="54" width="200" height="8" rx="4" fill="#c48a5f"/>
    <path d="M6 72 L194 72 L188 104 C170 112 150 100 130 108 C110 116 90 102 70 110 C50 118 30 104 12 108Z" fill="#fff4e0"/>
    <path d="M6 72 L194 72 L192 82 L8 82Z" fill="#f08a7e" opacity=".8"/>
    <g id="tableBooks"></g>
    <g id="slotTable" transform="translate(170 54)"></g>
  </g>

  <ellipse cx="830" cy="790" rx="300" ry="26" fill="#c9a676" opacity=".55"/>

  <!-- kitap karavanı -->
  <g transform="translate(610 420)">
    <path d="M430 300 L500 316 L500 326 L428 316Z" fill="#6b5446"/><circle cx="502" cy="321" r="9" fill="#6b5446"/>
    <path d="M10 330 L10 120 C10 40 70 0 150 0 L300 0 C380 0 440 40 440 120 L440 330 C440 342 432 350 420 350 L30 350 C18 350 10 342 10 330Z" id="cartBody" fill="#9fd8c4" stroke="#5ea592" stroke-width="7"/>
    <path id="cartBand" d="M24 300 L426 300 L426 330 C426 336 422 340 416 340 L34 340 C28 340 24 336 24 330Z" fill="#87c7b2"/>
    <path d="M40 88 C70 34 110 18 160 18 L290 18 C340 18 380 34 410 88" id="cartShine" fill="none" stroke="#c3ebdd" stroke-width="8" stroke-linecap="round"/>
    <rect x="50" y="118" width="350" height="170" rx="18" fill="#6b4a3a"/>
    <rect x="50" y="118" width="350" height="22" rx="10" fill="#5a3d30"/>
    <g id="shelves"></g>
    <g id="awning"></g>
    <g transform="translate(140 -58)">
      <path d="M30 58 L22 78 M140 58 L148 78" stroke="#7a4e33" stroke-width="6" stroke-linecap="round"/>
      <rect x="0" y="0" width="170" height="62" rx="16" fill="#fff6e8" stroke="#e2c29c" stroke-width="5"/>
      <text x="85" y="42" text-anchor="middle" font-size="34" font-weight="700" fill="#f08a7e">Sahaf</text>
      <circle cx="18" cy="31" r="6" fill="#f2c45a"/><circle cx="152" cy="31" r="6" fill="#f2c45a"/>
    </g>
    <g id="slotRoof" transform="translate(392 32)"></g>
    <path d="M30 104 C120 150 330 150 420 104" fill="none" stroke="#5a3d30" stroke-width="3"/>
    <g id="lights"></g>
    <g transform="translate(110 350)"><circle r="44" fill="#5b4636"/><circle r="22" fill="#f6e2c4"/><circle r="8" fill="#5b4636"/></g>
    <g transform="translate(340 350)"><circle r="44" fill="#5b4636"/><circle r="22" fill="#f6e2c4"/><circle r="8" fill="#5b4636"/></g>
    <path class="cartEdge" d="M56 320 C60 284 160 284 164 320" fill="none" stroke="#5ea592" stroke-width="10" stroke-linecap="round"/>
    <path class="cartEdge" d="M286 320 C290 284 390 284 394 320" fill="none" stroke="#5ea592" stroke-width="10" stroke-linecap="round"/>
  </g>

  <!-- kedi -->
  <g transform="translate(1110 735)">
    <ellipse cx="40" cy="44" rx="60" ry="9" fill="#c9a676" opacity=".6"/>
    <path class="tail" d="M70 30 C110 30 116 0 100 -6" fill="none" stroke="#f0a35a" stroke-width="13" stroke-linecap="round"/>
    <g class="breathe"><ellipse cx="40" cy="22" rx="46" ry="26" fill="#f4b064"/>
      <path d="M10 22 C14 6 26 2 34 8" fill="none" stroke="#e08d3e" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 6 C50 2 60 4 64 10" fill="none" stroke="#e08d3e" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(-6 8)">
        <path d="M-8 -14 L-2 -30 L10 -18Z M18 -18 L28 -30 L32 -12Z" fill="#f4b064"/>
        <path d="M-4 -18 L-1 -25 L5 -19Z M21 -19 L26 -25 L28 -16Z" fill="#f7c9b8"/>
        <circle cx="12" cy="0" r="22" fill="#f4b064"/>
        <path d="M2 2 Q6 6 10 2 M16 2 Q20 6 24 2" fill="none" stroke="#5a3d30" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="1" cy="9" r="4" fill="#f59a8e" opacity=".6"/><circle cx="25" cy="9" r="4" fill="#f59a8e" opacity=".6"/>
        <path d="M11 9 L13 9 L12 11Z" fill="#c76b5e"/>
      </g>
    </g>
    <text x="10" y="-30" class="zzz" font-size="20" font-weight="700" fill="#8a7468">z</text>
    <text x="16" y="-30" class="zzz d2" font-size="16" font-weight="700" fill="#8a7468">z</text>
    <text x="22" y="-30" class="zzz d3" font-size="13" font-weight="700" fill="#8a7468">z</text>
  </g>

  <g id="slotGround" transform="translate(1510 780)"></g>

  <g id="people"></g>
  <g id="fx"></g>
  <g id="seasonFx"></g>
  <g id="weather"></g>
  <rect id="dusk" width="1600" height="900" fill="#3b2a5a" opacity="0" pointer-events="none"/>
</svg>`;

const WALLS = ['#fffaf0', '#fdf1e0', '#fbe6dc', '#eef3f7'];
const DOORS = ['#4a7fb5', '#5aa3a3', '#e57f73', '#7f9c5a'];
const ROOFS = ['#e07a5f', '#d9694f', '#e8906e'];
const BLOOM = ['#f06fa4', '#f58bb6', '#e9579a'];

function drawHouses(g, seed) {
  g.innerHTML = '';
  const r = seeded(seed), pick = a => a[Math.floor(r() * a.length)];
  let x = -40;
  while (x < 1640) {
    const w = 120 + r() * 90, h = 110 + r() * 70, base = 562, hg = el('g', {}, g);
    el('rect', { x, y: base - h, width: w, height: h, fill: pick(WALLS) }, hg);
    el('rect', { x, y: base - h, width: w, height: 6, fill: '#000', opacity: .05 }, hg);
    el('path', { d: `M${x - 10} ${base - h} L${x + w / 2} ${base - h - 46} L${x + w + 10} ${base - h}Z`, fill: pick(ROOFS) }, hg);
    const dc = pick(DOORS);
    el('rect', { x: x + w / 2 - 15, y: base - 54, width: 30, height: 54, rx: 14, fill: dc }, hg);
    for (const wx of [x + 18, x + w - 44]) {
      el('rect', { x: wx, y: base - h + 26, width: 26, height: 30, rx: 12, fill: '#9cc7e0' }, hg);
      el('rect', { x: wx - 4, y: base - h + 56, width: 34, height: 6, rx: 3, fill: dc }, hg);
    }
    if (r() > .45) { // begonvil
      const bx = x + (r() > .5 ? 8 : w - 30);
      for (let i = 0; i < 9; i++) el('circle', { cx: bx + r() * 34, cy: base - h + 10 + r() * 60, r: 9 + r() * 8, fill: pick(BLOOM) }, hg);
      for (let i = 0; i < 4; i++) el('circle', { cx: bx + r() * 34, cy: base - h + 30 + r() * 50, r: 5, fill: '#7fb36d' }, hg);
    }
    x += w + 6 + r() * 30;
  }
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// Kitaba özgü sabit ton: aynı kitap her zaman aynı renkte görünür
const hash = str => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

// Raflar: her kitap bir sırt. Stok azaldıkça raflar gözle görülür boşalır.
const SHELF_Y = [178, 232, 284];
function drawShelves(g, shelf, cap) {
  g.innerHTML = '';
  const books = [];
  for (const k of GENRE_KEYS) for (const b of booksOf(k)) for (let i = 0; i < (shelf[b.id] || 0); i++) books.push(b);
  const per = Math.ceil(cap / SHELF_Y.length), unit = Math.min(28, 296 / per);
  const r = seeded(4242);
  SHELF_Y.forEach((sy, row) => {
    let bx = 64;
    for (let i = 0; i < per; i++) {
      const bw = unit * (.78 + r() * .14), bh = 36 + r() * 12, b = books[row * per + i];
      if (b) {
        const h = hash(b.id), col = shade(GENRES[b.genre].color, .86 + (h % 28) / 100);
        el('rect', { x: bx, y: sy - bh, width: bw, height: bh, rx: 3, fill: col }, g);
        el('rect', { x: bx + 2.5, y: sy - bh + 7, width: bw - 5, height: 3.5, rx: 1.5, fill: '#fff', opacity: .6 }, g);
        if (h % 2) el('rect', { x: bx + 2.5, y: sy - 12, width: bw - 5, height: 3, rx: 1.5, fill: '#000', opacity: .15 }, g);
      }
      bx += unit;
    }
    el('rect', { x: 54, y: sy, width: 342, height: 8, rx: 3, fill: '#a8704a' }, g);
  });
  // rafın ucunda küçük bir saksı
  el('rect', { x: 366, y: 160, width: 22, height: 18, rx: 4, fill: '#e0805f' }, g);
  el('circle', { cx: 377, cy: 154, r: 11, fill: '#7fb36d' }, g);
}

function drawTableBooks(g, counts) {
  // sergi masasında en kalabalık iki tür
  g.innerHTML = '';
  const top = GENRE_KEYS.filter(k => counts[k] > 0).sort((a, b) => counts[b] - counts[a]).slice(0, 2);
  top.forEach((k, i) => {
    const x = 8 + i * 72, n = Math.min(4, Math.ceil(counts[k] / 2));
    for (let j = 0; j < n; j++) {
      el('rect', { x: x + (j % 2) * 4, y: 40 - j * 13, width: 54 - (j % 2) * 6, height: 13, rx: 3, fill: shade(GENRES[k].color, .9 + j * .06) }, g);
    }
    el('text', { x: x + 27, y: 38 - n * 13, 'text-anchor': 'middle', 'font-size': 22 }, g).textContent = GENRES[k].icon;
  });
}

function drawAwning(g) {
  const aw = 380, ax = 35, stripes = 10, sw = aw / stripes;
  for (let i = 0; i < stripes; i++) {
    const c = i % 2 ? '#fff4e6' : '#f4a09c';
    el('rect', { x: ax + i * sw, y: 96, width: sw + .5, height: 30, fill: c }, g);
    el('circle', { cx: ax + i * sw + sw / 2, cy: 126, r: sw / 2, fill: c }, g);
  }
  el('rect', { x: ax - 6, y: 90, width: aw + 12, height: 10, rx: 5, fill: '#e57f73' }, g);
}

function drawLights(g) {
  const lc = ['#ffd56b', '#ff9e8a', '#9fe0d0', '#fff1b8'];
  for (let i = 1; i < 12; i++) {
    const t = i / 12, mt = 1 - t;
    const px = mt ** 3 * 30 + 3 * mt * mt * t * 120 + 3 * mt * t * t * 330 + t ** 3 * 420;
    const py = mt ** 3 * 104 + 3 * mt * mt * t * 150 + 3 * mt * t * t * 150 + t ** 3 * 104;
    el('circle', { cx: px, cy: py + 8, r: 7, fill: lc[i % 4], class: 'bulb', style: `animation-delay:${(i * .37) % 1.8}s` }, g);
  }
}

export function buildScene(host) {
  host.innerHTML = MARKUP;
  const $ = id => host.querySelector('#' + id);
  drawAwning($('awning'));
  drawLights($('lights'));
  return {
    svg: host.querySelector('svg'),
    people: $('people'),
    fx: $('fx'),
    setTown(key) {
      const t = TOWNS[key];
      $('skyTop').setAttribute('stop-color', t.sky[0]);
      $('skyBot').setAttribute('stop-color', t.sky[1]);
      $('seaTop').setAttribute('stop-color', t.sea[0]);
      $('seaBot').setAttribute('stop-color', t.sea[1]);
      drawHouses($('houses'), 7 + TOWN_KEYS.indexOf(key) * 101);
    },
    // kasaba içindeki mekân: arka plan, zemin, evlerin görünürlüğü
    setSpot(scene, town) {
      $('spotBack').innerHTML = spotArt(scene, town);
      $('ground').setAttribute('fill', GROUND[scene]);
      $('curb').setAttribute('fill', scene === 'sahil' ? '#ecd3a4' : scene === 'tepe' ? '#c9d38f' : '#e3c597');
      $('houses').style.display = SHOW_HOUSES[scene] ? '' : 'none';
    },
    // hava: yağmur çizgileri, bulut gölgesi, rüzgârda hızlanan bulutlar
    setWeather(key) {
      const svg = host.querySelector('svg');
      svg.classList.toggle('windy', key === 'ruzgarli');
      let html = '';
      if (key === 'yagmurlu' || key === 'bulutlu') html += `<rect width="1600" height="900" fill="#5a6b80" opacity="${key === 'yagmurlu' ? .22 : .1}"/>`;
      if (key === 'yagmurlu') {
        const r = seeded(99);
        let lines = '';
        for (let i = 0; i < 90; i++) {
          const x = r() * 1700, y = r() * 1800 - 900;
          lines += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 10).toFixed(0)}" y2="${(y + 34).toFixed(0)}"/>`;
        }
        html += `<g class="rain" stroke="#e8f1fb" stroke-width="3" stroke-linecap="round" opacity=".75">${lines}</g>`;
      }
      $('weather').innerHTML = html;
    },
    // festival günü: karavanın yanında balonlar
    setFestival(on) {
      const cols = ['#f08a7e', '#f2c45a', '#5b8bd0', '#8bc49a', '#b98ad6'];
      $('festival').innerHTML = !on ? '' : cols.map((c, i) => {
        const x = 520 + (i % 3) * 34 - 30, y = 300 + (i % 2) * 40 + Math.floor(i / 3) * 30;
        return `<g class="bob" style="animation-delay:-${i * .6}s"><path d="M${x} ${y + 34} Q${x + 10} ${y + 120} 500 610" fill="none" stroke="#8a7468" stroke-width="2"/>
          <ellipse cx="${x}" cy="${y}" rx="24" ry="30" fill="${c}"/><ellipse cx="${x - 8}" cy="${y - 10}" rx="6" ry="9" fill="#fff" opacity=".45"/>
          <path d="M${x - 5} ${y + 30} L${x + 5} ${y + 30} L${x} ${y + 37}Z" fill="${c}"/></g>`;
      }).join('');
    },
    // mevsim: ağaç rengi, uçuşan yaprak/çiçek, kışın serin ton
    setSeason(name) {
      const P = SEASON_LOOK[name] || SEASON_LOOK['İlkbahar'];
      $('treeA').setAttribute('fill', P.a);
      $('treeB').setAttribute('fill', P.b);
      let html = P.tint ? `<rect width="1600" height="900" fill="${P.tint}" opacity=".1"/>` : '';
      if (P.bits) {
        const r = seeded(7);
        for (let i = 0; i < 16; i++) {
          const x = 100 + r() * 1700, d = (r() * 9).toFixed(1), dur = (7 + r() * 5).toFixed(1), c = P.bits[i % P.bits.length];
          html += `<g class="petal" style="animation-delay:-${d}s;animation-duration:${dur}s"><g transform="translate(${x.toFixed(0)} -40) scale(1.6)"><path class="tumble" style="animation-delay:-${d}s" d="M0 0 C8 -8 16 0 8 10 C0 14 -8 8 0 0Z" fill="${c}"/></g></g>`;
        }
      }
      $('seasonFx').innerHTML = html;
    },
    setStock(S) {
      drawShelves($('shelves'), S.shelf, shelfCap(S));
      drawTableBooks($('tableBooks'), genreCounts(S));
    },
    setDecor(on) {
      $('slotRoof').innerHTML = DECOR_ART[on.roof] || '';
      $('slotTable').innerHTML = DECOR_ART[on.table] || '';
      $('slotGround').innerHTML = DECOR_ART[on.ground] || '';
    },
    setPaint(key) {
      const p = PAINTS[key];
      $('cartBody').setAttribute('fill', p.body);
      $('cartBody').setAttribute('stroke', p.edge);
      $('cartBand').setAttribute('fill', p.band);
      $('cartShine').setAttribute('stroke', p.shine);
      host.querySelectorAll('.cartEdge').forEach(e => e.setAttribute('stroke', p.edge));
    },
    // akşam alacası: 0 gündüz, 1 kapanış
    setDusk(k) { $('dusk').setAttribute('opacity', (k * .28).toFixed(3)); },
  };
}
