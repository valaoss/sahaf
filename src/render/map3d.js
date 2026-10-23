// 2.5D harita: eğik bir zemin (perspektif için dikeyde basık), kalınlığı görünen kara parçaları,
// dik duran evler, ağaçlar, tepeler ve simgeler. Kasaba koordinatları (data/towns.js map) "plan" düzlemindedir;
// proj() onları ekrana taşır. Dik nesneler ekranda çizilir, öndeki arkadakini örter (y'ye göre sıralı).
import { seeded } from '../core/rng.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { GENRES } from '../data/genres.js';

const TILT = 0.74, TOP = 60, THICK = 24;
export const proj = (x, y) => ({ x, y: TOP + y * TILT });

const LAND = 'M560 0 L1600 0 L1600 900 L700 900 C640 840 700 780 640 740 C560 690 520 640 580 590 C640 540 560 500 600 450 C640 400 720 420 700 360 C680 300 560 300 580 240 C600 180 700 190 680 120 C670 70 590 60 560 0Z';
const CUNDA = 'M330 300 C380 260 460 280 450 330 C440 380 360 390 330 360 C310 340 310 316 330 300Z';
const BOZCA = 'M190 120 C220 70 300 76 318 122 C334 166 280 200 232 190 C190 180 172 152 190 120Z';
const ROADS = [
  'M760 170 C880 260 820 360 790 520 C770 640 860 720 900 790',
  'M800 520 C960 500 1100 480 1260 470',
  'M700 92 C720 120 740 145 760 170',
  'M900 790 C960 740 1010 690 1060 640',
];
const FERRIES = ['M760 200 C640 290 520 310 400 320', 'M740 160 C580 110 420 100 270 130'];

// her kasabanın ev renkleri ve simgesi
const LOOK = {
  ayvalik: { walls: ['#fffaf0', '#fbe6dc', '#f3e2bf'], roof: '#d9694f', mark: 'olive' },
  cunda: { walls: ['#fffaf0', '#eef3f7', '#fdf1e0'], roof: '#5b8bd0', mark: 'chapel' },
  foca: { walls: ['#f7ecd8', '#fffaf0', '#e9dcc4'], roof: '#c96f5a', mark: 'castle' },
  alacati: { walls: ['#f3e7d3', '#fffaf0', '#e8dccb'], roof: '#d9694f', mark: 'mill' },
  bozcaada: { walls: ['#efe6d6', '#fffaf0', '#e3d8c4'], roof: '#b85c48', mark: 'castle' },
  sirince: { walls: ['#f1e3c6', '#e9d6b0', '#fffaf0'], roof: '#a65a3c', mark: 'chapel' },
  dikili: { walls: ['#fffaf0', '#fbe6dc', '#eef3f7'], roof: '#e07a5f', mark: 'olive' },
  urla: { walls: ['#f3e7d3', '#fffaf0', '#efe6d6'], roof: '#c96f5a', mark: 'mill' },
  assos: { walls: ['#e3d8c4', '#efe6d6', '#d9cbb2'], roof: '#a65a3c', mark: 'castle' },
};

const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

// Ön yüz + yan yüz + beşik çatı: dik bir ev (sx, sy: ön yüzün taban ortası)
function house(sx, sy, w, h, wall, roof) {
  const d = w * 0.55, dx = d * 0.8, dy = d * 0.45, L = sx - w / 2, R = sx + w / 2, rh = w * 0.5;
  return `<g>
    <ellipse cx="${sx + dx / 2}" cy="${sy + 2}" rx="${w * 0.8}" ry="${w * 0.22}" fill="#3d2b24" opacity=".12"/>
    <path d="M${R} ${sy} L${R + dx} ${sy - dy} L${R + dx} ${sy - dy - h} L${R} ${sy - h}Z" fill="${shade(wall, 0.82)}"/>
    <rect x="${L}" y="${sy - h}" width="${w}" height="${h}" fill="${wall}"/>
    <path d="M${sx} ${sy - h - rh} L${sx + dx} ${sy - h - rh - dy} L${R + dx + 2} ${sy - h - dy} L${R + 2} ${sy - h}Z" fill="${shade(roof, 0.82)}"/>
    <path d="M${L - 2} ${sy - h} L${sx} ${sy - h - rh} L${R + 2} ${sy - h}Z" fill="${roof}"/>
    <rect x="${sx - w * 0.12}" y="${sy - h * 0.55}" width="${w * 0.24}" height="${h * 0.55}" rx="${w * 0.1}" fill="${shade(roof, 0.7)}"/>
    <rect x="${L + w * 0.12}" y="${sy - h * 0.82}" width="${w * 0.16}" height="${h * 0.2}" rx="2" fill="#9cc7e0"/>
  </g>`;
}

function tree(sx, sy, s, c = '#9cb67f') {
  return `<g><ellipse cx="${sx + 4 * s}" cy="${sy + 1}" rx="${12 * s}" ry="${4 * s}" fill="#3d2b24" opacity=".12"/>
    <rect x="${sx - 1.5 * s}" y="${sy - 10 * s}" width="${3 * s}" height="${10 * s}" fill="#8a6a4f"/>
    <circle cx="${sx}" cy="${sy - 16 * s}" r="${10 * s}" fill="${c}"/><circle cx="${sx - 5 * s}" cy="${sy - 20 * s}" r="${6 * s}" fill="${shade(c, 1.12)}"/></g>`;
}

function mark(kind, sx, sy) {
  if (kind === 'mill') return `<g>
    <path d="M${sx - 10} ${sy} L${sx - 7} ${sy - 34} L${sx + 7} ${sy - 34} L${sx + 10} ${sy}Z" fill="#fffaf0"/><path d="M${sx + 7} ${sy - 34} L${sx + 13} ${sy - 37} L${sx + 16} ${sy - 3} L${sx + 10} ${sy}Z" fill="#e3d8c4"/>
    <path d="M${sx - 9} ${sy - 34} Q${sx} ${sy - 46} ${sx + 9} ${sy - 34}Z" fill="#c96f5a"/>
    <g transform="translate(${sx} ${sy - 36})"><g class="spin slow"><path d="M0 0 L-2 -24 L2 -24Z M0 0 L24 -2 L24 2Z M0 0 L2 24 L-2 24Z M0 0 L-24 2 L-24 -2Z" fill="#8a6a4f"/></g></g></g>`;
  if (kind === 'castle') return `<g>
    <path d="M${sx - 30} ${sy} L${sx - 30} ${sy - 22} L${sx - 24} ${sy - 22} L${sx - 24} ${sy - 27} L${sx - 18} ${sy - 27} L${sx - 18} ${sy - 22} L${sx + 18} ${sy - 22} L${sx + 18} ${sy - 27} L${sx + 24} ${sy - 27} L${sx + 24} ${sy - 22} L${sx + 30} ${sy - 22} L${sx + 30} ${sy}Z" fill="#e2cfa9"/>
    <path d="M${sx + 30} ${sy} L${sx + 40} ${sy - 6} L${sx + 40} ${sy - 28} L${sx + 30} ${sy - 22}Z" fill="#c9b285"/>
    <rect x="${sx - 8}" y="${sy - 38}" width="16" height="38" fill="#d6c094"/><path d="M${sx} ${sy - 38} L${sx} ${sy - 52}" stroke="#7a4e33" stroke-width="2"/><path d="M${sx} ${sy - 52} L${sx + 10} ${sy - 48} L${sx} ${sy - 45}Z" fill="#e5546a"/></g>`;
  if (kind === 'chapel') return `<g>
    <rect x="${sx - 14}" y="${sy - 22}" width="28" height="22" fill="#fffaf0"/><path d="M${sx + 14} ${sy} L${sx + 22} ${sy - 5} L${sx + 22} ${sy - 27} L${sx + 14} ${sy - 22}Z" fill="#e3e0d8"/>
    <path d="M${sx - 10} ${sy - 22} A10 10 0 0 1 ${sx + 10} ${sy - 22}Z" fill="#9cc7e0"/><path d="M${sx} ${sy - 32} L${sx} ${sy - 40} M${sx - 3} ${sy - 37} L${sx + 3} ${sy - 37}" stroke="#c9a676" stroke-width="2"/></g>`;
  // zeytin bahçesi
  return [[-22, 4], [0, 10], [22, 2], [-10, -6], [12, -8]].map(([x, y]) => tree(sx + x, sy + y, 0.7, '#a3b88a')).join('');
}

// Kasaba: evlerden küçük bir küme + simge; kilitliyse sis
function town(k, S, here) {
  const t = TOWNS[k], p = proj(t.map.x, t.map.y), L = LOOK[k];
  if (!S.unlocked.includes(k)) {
    return { y: p.y, svg: `<g class="town locked" data-town="${k}">
      ${[[-40, 0, 34], [0, -14, 42], [38, 2, 32], [-12, 18, 30], [20, 16, 28]].map(([x, y, r]) => `<circle cx="${p.x + x}" cy="${p.y + y - 20}" r="${r}" fill="#f7f4ee" opacity=".88"/>`).join('')}
      <g class="pin"><rect x="${p.x - 24}" y="${p.y - 74}" width="48" height="34" rx="10" fill="#c7b6a4"/><text x="${p.x}" y="${p.y - 49}" text-anchor="middle" font-size="24" font-weight="700" fill="#fff6e8">?</text></g>
      <circle cx="${p.x}" cy="${p.y - 20}" r="60" fill="transparent"/></g>` };
  }
  const r = seeded(TOWN_KEYS.indexOf(k) * 97 + 13);
  const spots = [[-52, -8], [-10, -22], [32, -6], [-30, 20], [14, 18], [54, 22]].slice(0, 4 + Math.floor(r() * 3));
  const houses = spots.map(([dx, dy]) => ({ y: p.y + dy, svg: house(p.x + dx, p.y + dy, 30 + r() * 10, 24 + r() * 14, L.walls[Math.floor(r() * L.walls.length)], L.roof) }))
    .concat([{ y: p.y - 30, svg: `<g transform="translate(${p.x + 92} ${p.y - 30}) scale(1.5) translate(${-(p.x + 92)} ${-(p.y - 30)})">${mark(L.mark, p.x + 92, p.y - 30)}</g>` }])
    .sort((a, b) => a.y - b.y).map(o => o.svg).join('');
  const icons = Object.keys(t.demand).sort((a, b) => t.demand[b] - t.demand[a]).slice(0, 2).map(g => GENRES[g].icon).join(' ');
  const w = Math.max(130, t.name.length * 20 + 40);
  return { y: p.y, svg: `<g class="town ${here ? 'here' : ''}" data-town="${k}">
    ${houses}
    <g class="pin"><path d="M${p.x} ${p.y - 56} L${p.x} ${p.y - 80}" stroke="#7a4e33" stroke-width="4"/>
      <rect x="${p.x - w / 2}" y="${p.y - 136}" width="${w}" height="58" rx="14" fill="${here ? '#5ea592' : '#fff6e8'}" stroke="${here ? '#4b8a79' : '#e2c29c'}" stroke-width="3"/>
      <text x="${p.x}" y="${p.y - 109}" text-anchor="middle" font-size="30" font-weight="700" fill="${here ? '#fff6e8' : '#4a3a33'}">${t.name}</text>
      <text x="${p.x}" y="${p.y - 85}" text-anchor="middle" font-size="20">${icons}</text></g>
    <circle cx="${p.x}" cy="${p.y - 40}" r="90" fill="transparent"/>
  </g>` };
}

export function vanSVG(paint) {
  return `<g transform="translate(-26 -40)">
    <ellipse cx="28" cy="44" rx="30" ry="7" fill="#3d2b24" opacity=".18"/>
    <path d="M44 10 L56 4 L56 32 L44 40Z" fill="${paint.edge}"/>
    <rect x="0" y="10" width="44" height="30" rx="9" fill="${paint.body}" stroke="${paint.edge}" stroke-width="3"/>
    <path d="M0 18 Q22 2 44 18" fill="none" stroke="#f08a7e" stroke-width="5"/>
    <rect x="7" y="18" width="20" height="11" rx="3" fill="#6b4a3a"/>
    <circle cx="11" cy="41" r="5.5" fill="#5b4636"/><circle cx="34" cy="41" r="5.5" fill="#5b4636"/></g>`;
}

// Bütün harita (SVG içeriği). S: oyun durumu, eventTown: bugün şenlik olan kasaba (varsa)
export function mapSVG(S, { eventTown = null, paint } = {}) {
  const r = seeded(4242);
  const plan = d => `<path d="${d}"/>`;
  const slab = (d, top, side) => `
    <g transform="translate(0 ${THICK})"><g transform="translate(0 ${TOP}) scale(1 ${TILT})" fill="${side}">${plan(d)}</g></g>
    <g transform="translate(0 ${THICK / 2})"><g transform="translate(0 ${TOP}) scale(1 ${TILT})" fill="${shade(side.slice(0, 7), 1.1)}">${plan(d)}</g></g>
    <g transform="translate(0 ${TOP}) scale(1 ${TILT})" fill="${top}" stroke="#f7ecd2" stroke-width="7">${plan(d)}</g>`;

  // dalgalar: uzakta küçük, yakında büyük
  let waves = '';
  for (let i = 0; i < 40; i++) {
    const x = r() * 640, y = 40 + r() * 820, s = 0.5 + y / 900;
    waves += `<path class="wave" style="animation-delay:-${(r() * 3).toFixed(1)}s" d="M${x.toFixed(0)} ${y.toFixed(0)} q${8 * s} ${-5 * s} ${16 * s} 0 q${8 * s} ${5 * s} ${16 * s} 0" fill="none" stroke="#e6f7f5" stroke-width="${(2 + s * 1.5).toFixed(1)}" stroke-linecap="round"/>`;
  }
  // tepeler ve ağaçlar (dik nesneler: sıralanacak)
  const objs = [];
  for (const [x, y, w, h] of [[1180, 230, 170, 70], [1330, 600, 190, 80], [1230, 820, 150, 60], [1480, 380, 130, 66], [1020, 420, 120, 46]]) {
    const p = proj(x, y);
    objs.push({ y: p.y, svg: `<g><ellipse cx="${p.x}" cy="${p.y}" rx="${w}" ry="${h * 0.42}" fill="#8fae6a" opacity=".35"/>
      <path d="M${p.x - w} ${p.y} C${p.x - w * 0.6} ${p.y - h} ${p.x + w * 0.5} ${p.y - h * 1.1} ${p.x + w} ${p.y}Z" fill="url(#hillg)"/></g>` });
  }
  for (let i = 0; i < 46; i++) {
    const x = 760 + r() * 800, y = 20 + r() * 860;
    if (TOWN_KEYS.some(k => Math.hypot(TOWNS[k].map.x - x, TOWNS[k].map.y - y) < 150)) continue;
    const p = proj(x, y);
    objs.push({ y: p.y, svg: tree(p.x, p.y, 1.1 + r() * 0.6, r() < 0.5 ? '#9cb67f' : '#8fae6a') });
  }
  const here = S.town;
  for (const k of TOWN_KEYS) objs.push(town(k, S, k === here));
  objs.sort((a, b) => a.y - b.y);

  // şenlik bayrağı
  let fest = '';
  if (eventTown && S.unlocked.includes(eventTown)) {
    const p = proj(TOWNS[eventTown].map.x, TOWNS[eventTown].map.y);
    fest = `<g class="bob"><text x="${p.x + 70}" y="${p.y - 110}" font-size="40">🎉</text></g>`;
  }
  // tekneler ve bulutlar (gölgeleriyle)
  const boats = [[180, 520, 26], [420, 700, 34], [90, 260, 20]].map(([x, y, d], i) => `<g class="map-boat" style="--dx:${(160 + i * 40)}px;animation-duration:${d}s">
      <g transform="translate(${x} ${y})"><ellipse cx="0" cy="6" rx="18" ry="4" fill="#3d6d78" opacity=".2"/>
      <path d="M-14 0 L14 0 L10 7 L-10 7Z" fill="#fffaf0"/><path d="M0 0 L0 -20 L11 -2Z" fill="${['#f08a7e', '#f2c45a', '#fff4e0'][i]}"/></g></g>`).join('');
  const clouds = [[300, 120, 70], [980, 300, 90], [1350, 140, 60]].map(([x, y, s], i) => `<g class="map-cloud" style="animation-duration:${60 + i * 25}s;animation-delay:-${i * 20}s">
      <ellipse cx="${x}" cy="${y + 150}" rx="${s * 1.3}" ry="${s * 0.35}" fill="#3d2b24" opacity=".08"/>
      <g fill="#fff" opacity=".85"><ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s * 0.42}"/><ellipse cx="${x - s * 0.5}" cy="${y + 6}" rx="${s * 0.55}" ry="${s * 0.32}"/><ellipse cx="${x + s * 0.45}" cy="${y - 8}" rx="${s * 0.6}" ry="${s * 0.4}"/></g></g>`).join('');

  const vp = proj(TOWNS[here].map.x, TOWNS[here].map.y);
  return `
    <defs>
      <linearGradient id="seag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3ece6"/><stop offset="1" stop-color="#7fc6c8"/></linearGradient>
      <linearGradient id="hillg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe3a8"/><stop offset=".6" stop-color="#a9c97f"/><stop offset="1" stop-color="#86a865"/></linearGradient>
    </defs>
    <rect width="1600" height="900" rx="40" fill="url(#seag)"/>
    ${waves}
    ${slab(LAND, '#f3e2bf', '#c9a676')}
    ${slab(CUNDA, '#f3e2bf', '#c9a676')}
    ${S.unlocked.includes('bozcaada') ? slab(BOZCA, '#f3e2bf', '#c9a676') : slab(BOZCA, '#e9e4da', '#bdb4a6')}
    <g transform="translate(0 ${TOP}) scale(1 ${TILT})">
      <g fill="#d6e6b0" opacity=".7"><ellipse cx="1050" cy="640" rx="90" ry="40"/><ellipse cx="1420" cy="230" rx="80" ry="36"/><ellipse cx="980" cy="120" rx="70" ry="30"/></g>
      ${ROADS.map(d => `<path d="${d}" fill="none" stroke="#e2c99c" stroke-width="16" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff6e0" stroke-width="3" stroke-dasharray="10 14"/>`).join('')}
      ${FERRIES.map(d => `<path d="${d}" fill="none" stroke="#e9fbf7" stroke-width="5" stroke-dasharray="3 16" stroke-linecap="round"/>`).join('')}
    </g>
    ${boats}
    ${objs.map(o => o.svg).join('')}
    ${fest}
    ${clouds}
    <g transform="translate(1480 790)"><circle r="46" fill="#fff6e8" stroke="#e2c29c" stroke-width="4"/><path d="M0 -32 L9 0 L0 32 L-9 0Z" fill="#f08a7e"/><path d="M0 0 L9 0 L0 32 L-9 0Z" fill="#c7b6a4"/><text y="-50" text-anchor="middle" font-size="18" font-weight="700" fill="#4a3a33">K</text></g>
    <g id="van" transform="translate(${vp.x - 70} ${vp.y + 10})"><g transform="scale(1.4)">${vanSVG(paint)}</g></g>`;
}
