// Mürekkep Koyu haritası (v3 Faz 6): eğik bakışlı minyatür kasaba, 1600×1000 SVG.
// Kıyı, yollar, her mahallenin kendi yapıları (2.5B kutu evler, simge yapı), kilitli mahallelerde sis.
// Canlılık sahnedeki CSS sınıflarıyla (style.css): bob tekne, twinkle su ışıltısı, sway ağaç, steam baca dumanı; martılar ve yürüyenler animateMotion.
// Görseller kodla çizilir (plan 7. bölüm, yol A); boyanmış katmanlar gelirse aynı yerlere oturur.
import { DISTRICTS, DISTRICT_KEYS } from '../data/districts.js';
import { seeded } from '../core/rng.js';
import { TOWNS } from '../data/towns.js';

export const KW = 1600, KH = 1000;

// mahalleler arası yollar (iki uç ve kıvrım için bir ara nokta)
export const ROADS = [
  ['iskele', 'park', [820, 640]], ['iskele', 'boyaci', [560, 480]], ['iskele', 'fener', [430, 610]], ['park', 'carsi', [980, 420]],
  ['park', 'okul', [1130, 520]], ['carsi', 'boyaci', [720, 290]], ['carsi', 'kosk', [1130, 230]], ['okul', 'kosk', [1320, 330]],
];
export const roadOf = (a, b) => ROADS.find(r => (r[0] === a && r[1] === b) || (r[0] === b && r[1] === a));
const P = k => [DISTRICTS[k].koy.x, DISTRICTS[k].koy.y];
// yol eğrisi a'dan b'ye (yol yoksa düz bir kavis)
export function roadPath(a, b) {
  const r = roadOf(a, b), [x1, y1] = P(a), [x2, y2] = P(b);
  const [cx, cy] = r ? r[2] : [(x1 + x2) / 2, (y1 + y2) / 2 - 60];
  return { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, at: t => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2] };
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// 2.5B ev: ön yüz, sağ yan (gölgede), beşik ya da düz çatı, pencere ve kapı. (x, y): ön yüzün alt ortası
function house(x, y, w, h, wall, roof, o = {}) {
  const dx = w * 0.42, dy = -w * 0.26, rh = o.flat ? 0 : w * 0.42, L = x - w / 2, Rr = x + w / 2, top = y - h;
  let s = `<path d="M${Rr} ${y} L${Rr + dx} ${y + dy} L${Rr + dx} ${top + dy} L${Rr} ${top}Z" fill="${shade(wall, .8)}"/>
    <rect x="${L}" y="${top}" width="${w}" height="${h}" fill="${wall}"/>`;
  if (o.flat) s += `<path d="M${L - 2} ${top} L${Rr + 2} ${top} L${Rr + dx + 2} ${top + dy} L${L + dx - 2} ${top + dy}Z" fill="${shade(wall, .92)}"/>
    <rect x="${L - 3}" y="${top - 4}" width="${w + 6}" height="5" fill="${shade(wall, .86)}"/>`;
  else s += `<path d="M${x} ${top - rh} L${x + dx} ${top - rh + dy} L${Rr + dx + 3} ${top + dy} L${Rr + 3} ${top}Z" fill="${shade(roof, .82)}"/>
    <path d="M${L - 3} ${top} L${x} ${top - rh} L${Rr + 3} ${top}Z" fill="${roof}"/>`;
  const wn = Math.max(1, Math.floor(w / 16));
  for (let i = 0; i < wn; i++) s += `<rect x="${(L + (i + .5) * w / wn - 3.5).toFixed(1)}" y="${(top + h * .22).toFixed(1)}" width="7" height="${(h * .2).toFixed(1)}" rx="2" fill="#9cc7e0" class="kwin"/>`;
  s += `<rect x="${x - 4}" y="${y - h * .32}" width="8" height="${h * .32}" rx="3" fill="${o.door || '#7a4e33'}"/>`;
  if (o.smoke) s += `<rect x="${x + w * .2}" y="${top - rh * .7 - 10}" width="6" height="12" fill="${shade(roof, .7)}"/><path class="steam" d="M${x + w * .2 + 3} ${top - rh * .7 - 12} c-4 -6 4 -10 0 -18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  return s;
}
const tree = (x, y, r = 14, c = '#86b85f') => `<g class="sway" style="animation-delay:-${(x % 7) * .4}s"><rect x="${x - 2}" y="${y - r * .6}" width="4" height="${r * .9}" fill="#8a6a4f"/>
  <circle cx="${x}" cy="${y - r}" r="${r}" fill="${c}"/><circle cx="${x - r * .4}" cy="${y - r * 1.3}" r="${r * .5}" fill="${shade(c, 1.12)}"/></g>`;
const lamp = (x, y) => `<rect x="${x - 1.5}" y="${y - 22}" width="3" height="22" fill="#5b4636"/><circle cx="${x}" cy="${y - 24}" r="3.5" fill="#ffe08a" class="twinkle"/>`;

const WALLS = ['#fffaf0', '#fdf1e0', '#fbe6dc', '#eef3f7', '#f6e3c8'], ROOFS = ['#e07a5f', '#d9694f', '#e8906e', '#c96f5a'];

// Mahallelerin yapıları (merkeze göre). Her biri kendi simgesiyle tanınır.
const ART = {
  iskele: (x, y, r) => {
    let s = `<path d="M${x - 40} ${y + 30} L${x - 10} ${y + 30} L${x - 4} ${y + 110} L${x - 34} ${y + 110}Z" fill="#b98a5f"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${x - 38 + i} ${y + 46 + i * 15} L${x - 7 + i} ${y + 46 + i * 15}" stroke="#8a5a3c" stroke-width="2"/>`;
    s += `<g class="bob"><path d="M${x + 30} ${y + 84} l40 0 l-8 12 l-26 0Z" fill="#fffaf2"/><path d="M${x + 50} ${y + 84} l0 -30 l16 26Z" fill="#f08a7e"/></g>`;
    s += `<g class="bob" style="animation-delay:-1.4s"><path d="M${x - 110} ${y + 96} l36 0 l-7 10 l-22 0Z" fill="#4a7fb5"/><path d="M${x - 92} ${y + 96} l0 -24 l13 20Z" fill="#fff4e0"/></g>`;
    s += `<path d="M${x - 140} ${y + 22} Q${x} ${y + 40} ${x + 150} ${y + 14}" fill="none" stroke="#d9c4a0" stroke-width="10" stroke-linecap="round"/>`;
    for (let i = 0; i < 6; i++) s += lamp(x - 120 + i * 50, y + 24 + Math.sin(i) * 4);
    [[-70, 0, 34, 28], [-26, -6, 30, 34], [16, -2, 36, 26], [58, -8, 30, 32], [96, 0, 28, 24]].forEach(([ox, oy, w, h], i) => { s += house(x + ox, y + oy, w, h, WALLS[(i + r) % 5], ROOFS[i % 4], { smoke: i === 2 }); });
    return s;
  },
  park: (x, y) => {
    let s = `<ellipse cx="${x + 10}" cy="${y + 20}" rx="120" ry="58" fill="#b9d98f"/><ellipse cx="${x + 54}" cy="${y + 34}" rx="36" ry="16" fill="#8fd0dc" stroke="#e9f6f5" stroke-width="3"/>`;
    s += `<rect x="${x - 70}" y="${y + 30}" width="26" height="5" fill="#a8704a"/><rect x="${x - 30}" y="${y + 48}" width="26" height="5" fill="#a8704a"/>`;
    s += `<g class="sway"><rect x="${x - 10}" y="${y - 30}" width="14" height="50" rx="4" fill="#8a6a4f"/><circle cx="${x - 3}" cy="${y - 48}" r="48" fill="#7fae5c"/><circle cx="${x - 30}" cy="${y - 62}" r="26" fill="#98c46f"/><circle cx="${x + 24}" cy="${y - 70}" r="24" fill="#98c46f"/></g>`;
    s += tree(x - 96, y + 6, 14) + tree(x + 100, y + 4, 13, '#9cc46f') + tree(x + 76, y - 22, 11);
    return s;
  },
  okul: (x, y, r) => {
    let s = '';
    for (let i = 0; i < 7; i++) s += `<rect x="${x - 70 + i * 8}" y="${y + 40 - i * 9}" width="34" height="9" fill="${i % 2 ? '#d9c4a0' : '#cdb48c'}"/>`;
    s += house(x + 34, y - 6, 92, 50, '#f6e3c8', '#c96f5a');
    s += `<rect x="${x + 70}" y="${y - 120}" width="2.5" height="54" fill="#5b4636"/><path d="M${x + 72} ${y - 120} l24 7 l-24 7Z" fill="#e57f73" class="flutter"/>`;
    s += `<circle cx="${x - 40}" cy="${y + 56}" r="7" fill="none" stroke="#4a7fb5" stroke-width="2.5"/><circle cx="${x - 20}" cy="${y + 56}" r="7" fill="none" stroke="#4a7fb5" stroke-width="2.5"/><path d="M${x - 40} ${y + 56} l8 -10 l10 10 M${x - 32} ${y + 46} l4 0" stroke="#4a7fb5" stroke-width="2.5" fill="none"/>`;
    s += house(x - 70, y - 10, 30, 30, WALLS[r % 5], ROOFS[1]) + house(x + 110, y + 14, 30, 26, WALLS[(r + 2) % 5], ROOFS[2], { smoke: true });
    return s;
  },
  carsi: (x, y, r) => {
    let s = house(x - 10, y + 10, 120, 46, '#f3dcb4', '#c96f5a', { flat: true });
    for (let i = 0; i < 5; i++) s += `<path d="M${x - 64 + i * 22} ${y + 10} l0 -20 a9 9 0 0 1 18 0 l0 20Z" fill="#8a5a3c" opacity=".55"/>`;
    s += `<path d="M${x - 50} ${y - 36} a20 20 0 0 1 40 0Z M${x - 8} ${y - 40} a22 22 0 0 1 44 0Z" fill="#d9c4a0"/>`;
    const aw = ['#f4a09c', '#93bfe4', '#f6d47a', '#a9c48a'];
    for (let i = 0; i < 4; i++) s += `<g transform="translate(${x - 90 + i * 52} ${y + 52})"><rect x="0" y="0" width="30" height="16" fill="#c48a5f"/><path d="M-3 0 L33 0 L28 -10 L2 -10Z" fill="${aw[i]}"/></g>`;
    s += house(x - 110, y - 6, 34, 34, WALLS[(r + 1) % 5], ROOFS[0]) + house(x + 92, y - 2, 34, 30, WALLS[(r + 3) % 5], ROOFS[3], { smoke: true });
    return s;
  },
  boyaci: (x, y) => {
    const C = ['#f6a5c0', '#93bfe4', '#f6d47a', '#a9c48a', '#c8b2e6', '#f4a09c'];
    let s = '';
    for (let i = 0; i < 6; i++) s += house(x - 100 + i * 38, y - (i % 2) * 6, 34, 34 + (i % 3) * 6, C[i], ROOFS[i % 4], { door: shade(C[(i + 2) % 6], .7), smoke: i === 4 });
    s += `<path d="M${x + 120} ${y + 30} l10 -36 l10 36 M${x + 124} ${y + 8} l14 0" stroke="#7a4e33" stroke-width="2.5" fill="none"/><rect x="${x + 118}" y="${y - 12}" width="24" height="18" fill="#fff6e8" stroke="#7a4e33" stroke-width="2"/><circle cx="${x + 126}" cy="${y - 4}" r="3" fill="#f08a7e"/><circle cx="${x + 134}" cy="${y - 2}" r="3" fill="#5b8bd0"/>`;
    s += `<path d="M${x - 60} ${y + 26} c4 -10 14 -10 16 0 l-2 6 l-12 0Z" fill="#f4b064"/>`;
    return s;
  },
  kosk: (x, y, r) => {
    let s = `<ellipse cx="${x}" cy="${y + 24}" rx="150" ry="40" fill="#a9cc86"/>`;
    s += tree(x - 130, y + 10, 16, '#7fae5c') + tree(x + 136, y + 16, 15, '#7fae5c');
    s += house(x - 60, y, 64, 52, '#fdf1e0', '#b85c48', { smoke: true }) + house(x + 50, y + 12, 70, 46, '#eef3f7', '#c96f5a');
    s += `<path d="M${x - 110} ${y + 46} L${x + 120} ${y + 52}" stroke="#5b4636" stroke-width="2"/>`;
    for (let i = 0; i < 12; i++) s += `<path d="M${x - 110 + i * 20} ${y + 46 + i * .5} l0 -12" stroke="#5b4636" stroke-width="2"/>`;
    s += lamp(x - 120, y + 46) + lamp(x + 126, y + 52) + `<circle cx="${x - 4}" cy="${y + 40}" r="5" fill="#f06fa4"/><circle cx="${x + 6}" cy="${y + 42}" r="5" fill="#f58bb6"/>`;
    return s;
  },
  fener: (x, y) => {
    let s = `<path d="M${x - 70} ${y + 40} Q${x} ${y - 10} ${x + 80} ${y + 40}Z" fill="#c9b48c"/>`;
    s += `<g transform="translate(${x + 4} ${y - 4})"><path d="M-12 0 L12 0 L8 -70 L-8 -70Z" fill="#fffaf2"/><path d="M-11 -20 L11 -20 L10 -32 L-10 -32Z M-9 -48 L9 -48 L8.5 -58 L-8.5 -58Z" fill="#f08a7e"/>
      <rect x="-9" y="-84" width="18" height="14" rx="3" fill="#ffe9a6"/><path d="M-12 -84 L0 -98 L12 -84Z" fill="#f08a7e"/>
      <g class="spin slow"><path d="M0 -77 L120 -100 L120 -54Z M0 -77 L-120 -54 L-120 -100Z" fill="#fff3b0" opacity=".28"/></g></g>`;
    s += house(x - 44, y + 26, 28, 22, '#fffaf0', '#4a7fb5') + `<rect x="${x + 30}" y="${y + 6}" width="44" height="18" fill="#c48a5f"/><path d="M${x + 27} ${y + 6} L${x + 77} ${y + 6} L${x + 72} ${y - 4} L${x + 32} ${y - 4}Z" fill="#f2c45a"/>`;
    return s;
  },
};

// kır: tarlalar, ağaç kümeleri, çiftlik evleri (mahalleler arası boşluk)
const FIELDS = [[170, 170, 120, 64, '#d6e29c', -8], [720, 150, 110, 56, '#e6e2a8', 6], [1400, 560, 130, 70, '#d6e29c', -6], [1470, 700, 120, 64, '#ead79c', 4],
  [1180, 640, 100, 52, '#e6e2a8', -10], [1500, 420, 90, 60, '#d6e29c', 8], [380, 150, 90, 50, '#ead79c', -4]];
const TREES = [[80, 120], [150, 250], [250, 90], [300, 260], [440, 110], [470, 250], [650, 210], [770, 380], [820, 520], [1060, 120], [1110, 330], [1180, 540],
  [1270, 640], [1410, 470], [1550, 560], [1450, 860], [1520, 770], [1300, 880], [1110, 700], [1080, 860], [700, 430], [380, 300], [1560, 130], [1200, 80], [1560, 300],
  [860, 160], [600, 120], [1350, 560], [1240, 760]];
const FARMS = [[230, 210], [1440, 610], [1220, 690], [760, 200]];
function scenery() {
  let s = '';
  for (const [x, y, w, h, c, a] of FIELDS) {
    s += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="${c}"/>`;
    for (let i = 1; i < 5; i++) s += `<path d="M${x - w / 2 + 6} ${y - h / 2 + i * h / 5} L${x + w / 2 - 6} ${y - h / 2 + i * h / 5}" stroke="${shade(c, .88)}" stroke-width="2"/>`;
    s += '</g>';
  }
  for (const [x, y] of FARMS) s += house(x, y, 26, 20, '#fdf1e0', '#d9694f', { smoke: true });
  for (const [x, y] of TREES) s += tree(x, y, 12 + (x * 7 + y) % 7, (x + y) % 3 ? '#86b85f' : '#9cb67f');
  return s;
}

// sis: kilitli mahallenin üstünde birkaç yumuşak bulut
const fog = (x, y) => `<g class="kfog" filter="url(#kblur)">${[[-90, 10, 90, 46], [0, -30, 110, 60], [90, 6, 90, 50], [10, 40, 120, 40]].map(([ox, oy, rx, ry]) => `<ellipse cx="${x + ox}" cy="${y + oy}" rx="${rx}" ry="${ry}" fill="#fbf6ee"/>`).join('')}</g>`;

// harita: S'ye göre açık/kilitli mahalleler, güven çubukları; o.reveal: az önce açılan mahalle (sis kalkar, yol çizilir)
export function koyMapSVG(S, o = {}) {
  const open = k => S.unlocked.includes(k);
  const r = seeded(7);
  let sea = '';
  for (let i = 0; i < 40; i++) {
    const x = r() * 1400, y = 430 + r() * 560;
    if (y < 720 - x * 0.12 && x > 380) continue;
    sea += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q8 -5 16 0 q8 5 16 0" fill="none" stroke="#e9fbf7" stroke-width="3" stroke-linecap="round" class="twinkle" style="animation-delay:${(r() * 2.4).toFixed(1)}s"/>`;
  }
  const land = 'M0 0 L1600 0 L1600 1000 L1210 1000 C1180 900 1060 790 900 750 C780 722 660 722 520 714 C430 708 380 680 330 640 C300 615 230 610 180 580 C130 550 110 500 150 470 C200 440 280 450 330 420 C370 395 330 350 260 340 C160 326 60 340 0 330Z';
  // yollar: iki ucu da açıksa dolu, biri kilitliyse soluk kesik
  let roads = '';
  for (const [a, b, [cx, cy]] of ROADS) {
    const [x1, y1] = P(a), [x2, y2] = P(b), live = open(a) && open(b), d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
    const fresh = o.reveal && (a === o.reveal || b === o.reveal) && live;
    roads += `<path d="${d}" fill="none" stroke="${live ? '#e6cfa4' : '#e8dcc6'}" stroke-width="${live ? 16 : 10}" stroke-linecap="round" ${live ? '' : 'stroke-dasharray="4 14" opacity=".7"'}/>`;
    if (live) roads += `<path d="${d}" fill="none" stroke="#d2b682" stroke-width="3" stroke-dasharray="10 12" ${fresh ? 'class="kdraw"' : ''}/>`;
  }
  // yürüyenler: açık yollarda küçük insanlar gidip gelir
  let walkers = '';
  ROADS.filter(([a, b]) => open(a) && open(b)).forEach(([a, b, [cx, cy]], i) => {
    const [x1, y1] = P(a), [x2, y2] = P(b), cols = ['#f08a7e', '#5b8bd0', '#f2c45a', '#8bc49a'];
    for (let j = 0; j < 2; j++) walkers += `<g><circle r="4" fill="${cols[(i + j) % 4]}"/><circle cy="-6" r="3" fill="#f3c9a4"/>
      <animateMotion dur="${14 + i * 2 + j * 5}s" repeatCount="indefinite" begin="-${j * 7 + i}s" keyPoints="${j ? '1;0' : '0;1'}" keyTimes="0;1" calcMode="linear" path="M${x1} ${y1 - 4} Q${cx} ${cy - 4} ${x2} ${y2 - 4}"/></g>`;
  });
  // mahalleler: yapılar, sis, ad ve güven
  const keys = [...DISTRICT_KEYS].sort((a, b) => P(a)[1] - P(b)[1]);
  let towns = '', labels = '';
  for (const k of keys) {
    const D = DISTRICTS[k], [x, y] = P(k), on = open(k), g = Math.min(100, S.rep[k] || 0), here = S.town === k;
    towns += `<g class="kd ${on ? 'open' : 'locked'}" data-d="${k}"><g transform="translate(${x} ${y}) scale(1.25) translate(${-x} ${-y})">${ART[k](x, y, DISTRICT_KEYS.indexOf(k))}</g>${on && o.reveal !== k ? '' : fog(x, y)}
      <ellipse cx="${x}" cy="${y + 10}" rx="150" ry="90" fill="transparent"/></g>`;
    labels += `<g class="klabel ${on ? '' : 'locked'} ${here ? 'here' : ''}" data-d="${k}" transform="translate(${x} ${y + 92})">
      <rect x="-82" y="-16" width="164" height="${on ? 40 : 30}" rx="15" fill="#fffaf0" stroke="${here ? '#f08a7e' : '#e2c29c'}" stroke-width="${here ? 4 : 2.5}"/>
      <text y="5" text-anchor="middle" font-size="17" font-weight="700" fill="#5a3d30">${on ? '' : '🔒 '}${TOWNS[k].name}</text>
      ${on ? `<rect x="-56" y="12" width="112" height="6" rx="3" fill="#f1e2c8"/><rect x="-56" y="12" width="${(112 * g / 100).toFixed(1)}" height="6" rx="3" fill="#f08a7e"/><text x="-66" y="19" text-anchor="middle" font-size="10">💛</text>` : ''}</g>`;
  }
  const [vx, vy] = P(S.town);
  const gull = (d, dur, delay) => `<path d="M-8 0 q4 -6 8 0 q4 -6 8 0" fill="none" stroke="#5a5a6a" stroke-width="2"><animateMotion dur="${dur}s" begin="-${delay}s" repeatCount="indefinite" path="${d}"/></path>`;
  return `<defs>
      <linearGradient id="ksea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad7d2"/><stop offset="1" stop-color="#5fb0c4"/></linearGradient>
      <linearGradient id="kland" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3dcae"/><stop offset=".6" stop-color="#eee2bd"/><stop offset="1" stop-color="#f3e2bf"/></linearGradient>
      <filter id="kblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    <rect width="${KW}" height="${KH}" fill="url(#ksea)"/>${sea}
    <path d="${land}" fill="#d9c79a" transform="translate(0 10)"/>
    <path d="${land}" fill="url(#kland)"/>
    <path d="M1600 0 L1600 260 C1500 200 1420 130 1300 110 C1180 90 1080 60 980 0Z" fill="#cfd9a3" opacity=".8"/>
    <path d="M0 0 L0 250 C120 230 260 170 380 120 C470 80 540 30 600 0Z" fill="#c9d7a0" opacity=".7"/>
    ${scenery()}
    ${roads}${towns}${walkers}
    <g class="kgulls">${gull('M-40 520 C300 460 600 560 1700 470', 26, 3)}${gull('M1700 800 C1200 760 700 880 -60 820', 32, 11)}${gull('M-40 640 C400 600 900 700 1700 620', 38, 20)}</g>
    ${labels}
    <g id="kvan" transform="translate(${vx} ${vy - 26})"><g class="bob"><rect x="-22" y="-18" width="44" height="26" rx="9" fill="#9fd8c4" stroke="#5ea592" stroke-width="3"/><rect x="-14" y="-12" width="28" height="11" rx="3" fill="#6b4a3a"/><circle cx="-11" cy="9" r="5" fill="#5b4636"/><circle cx="11" cy="9" r="5" fill="#5b4636"/></g></g>`;
}
