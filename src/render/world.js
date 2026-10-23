// Akdeniz haritası: gerçek boylam/enlemden basitleştirilmiş kıyılar (eşdikdörtgen izdüşüm, 38° enleme göre).
// Kıyı noktaları yumuşatılır (Catmull-Rom → Bézier), ülkeler kesik çizgiyle ayrılır, şehirler gerçek konumlarında.
// Şehir işaretleri ekranda hep aynı boyda kalır: CSS değişkeni --ms (yakınlaştırmaya göre ui.js ayarlar).
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { COUNTRIES, COUNTRY_KEYS, flagSVG } from '../data/countries.js';

export const WW = 2400, WH = 1160;
const LON0 = -6, LAT0 = 46.5, KY = 70, KX = KY * Math.cos(38 * Math.PI / 180);
export const geo = (lon, lat) => [(lon - LON0) * KX, (LAT0 - lat) * KY];
export const townXY = k => geo(...TOWNS[k].geo);

// kuzey kıyısı: Cebelitarık'tan İspanya, Fransa, İtalya (Adriyatik), Balkanlar, Yunanistan, Ege, Anadolu, Levant
const NORTH = [[-6, 36.15], [-5.35, 36.15], [-4.4, 36.72], [-2.4, 36.83], [-1.95, 36.85], [-1.0, 37.6], [-0.5, 38.3], [0.2, 38.75], [-0.3, 39.5], [0.05, 40.1],
  [0.9, 40.7], [1.25, 41.1], [2.2, 41.4], [3.2, 41.9], [3.3, 42.35], [3.05, 42.75], [3.7, 43.4], [4.6, 43.4], [5.35, 43.3], [5.9, 43.1], [6.6, 43.2],
  [7.3, 43.7], [8.2, 43.9], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [10.55, 42.95], [11.2, 42.4], [11.8, 42.1], [12.3, 41.7], [13.5, 41.2], [14.25, 40.85],
  [14.8, 40.55], [15.6, 40.05], [15.9, 39.5], [16.05, 38.95], [15.65, 38.25], [15.95, 37.95], [16.55, 38.45], [17.15, 39.0], [16.6, 39.65], [17.2, 40.45],
  [18.0, 40.15], [18.4, 39.8], [18.5, 40.15], [17.95, 40.65], [16.85, 41.13], [16.0, 41.45], [16.15, 41.9], [15.2, 41.95], [14.2, 42.45], [13.5, 43.6],
  [12.6, 44.06], [12.45, 44.9], [12.35, 45.45], [13.0, 45.7], [13.75, 45.65], [13.6, 45.1], [13.95, 44.8], [14.4, 45.3], [15.2, 44.1], [16.45, 43.5],
  [17.4, 43.0], [18.1, 42.65], [19.0, 42.1], [19.45, 41.3], [19.45, 40.45], [20.0, 39.7], [20.75, 38.95], [21.1, 38.35], [21.7, 38.3], [21.3, 37.6],
  [21.7, 36.8], [22.4, 36.4], [22.9, 36.75], [23.2, 36.45], [22.75, 37.5], [23.15, 37.95], [23.7, 37.9], [24.05, 37.65], [24.0, 38.25], [23.3, 38.65],
  [22.95, 39.3], [22.6, 40.0], [22.95, 40.6], [23.7, 40.2], [24.3, 40.25], [24.4, 40.9], [25.9, 40.85], [26.2, 40.4], [26.45, 40.05], [26.2, 39.95],
  [26.15, 39.7], [26.3, 39.48], [27.0, 39.55], [26.68, 39.28], [26.85, 39.05], [26.75, 38.65], [27.1, 38.45], [26.75, 38.35], [26.3, 38.32], [26.6, 38.1],
  [27.25, 37.85], [27.25, 37.35], [27.45, 37.0], [28.0, 36.8], [28.3, 36.85], [29.1, 36.6], [29.6, 36.2], [30.4, 36.25], [30.7, 36.85], [31.4, 36.75],
  [32.0, 36.55], [32.8, 36.05], [33.7, 36.2], [34.6, 36.8], [35.5, 36.55], [36.1, 36.6], [35.85, 35.9], [35.8, 35.5], [35.9, 34.9], [35.5, 33.9],
  [35.1, 33.1], [35.0, 32.8], [34.75, 32.05], [34.4, 31.5], [37, 31.5], [37, 46.5], [-6, 46.5]];
// güney kıyısı: Fas, Cezayir, Tunus, Libya, Mısır
const SOUTH = [[-6, 35.75], [-5.8, 35.8], [-5.3, 35.9], [-4.4, 35.2], [-2.95, 35.3], [-1.9, 35.1], [-0.6, 35.7], [1.0, 36.45], [3.05, 36.78], [5.1, 36.75],
  [6.4, 37.05], [7.75, 36.95], [9.0, 37.15], [9.85, 37.3], [10.3, 36.9], [11.05, 37.05], [10.5, 36.4], [10.6, 35.8], [11.1, 35.2], [10.75, 34.7],
  [10.1, 33.9], [10.9, 33.6], [11.5, 33.15], [13.2, 32.9], [15.1, 32.4], [15.7, 31.6], [16.6, 31.2], [18.4, 30.4], [19.8, 30.9], [20.05, 32.1],
  [21.5, 32.9], [23.0, 32.6], [24.0, 32.05], [25.15, 31.6], [27.25, 31.35], [28.8, 30.95], [29.9, 31.22], [31.0, 31.6], [32.3, 31.3], [33.5, 31.1],
  [34.4, 31.5], [37, 31.5], [37, 30], [-6, 30]];
const ISLANDS = {
  mallorca: [[2.35, 39.55], [3.1, 39.95], [3.45, 39.75], [3.2, 39.35], [2.7, 39.45]],
  menorca: [[3.8, 40.0], [4.3, 40.05], [4.2, 39.85], [3.85, 39.9]],
  ibiza: [[1.2, 38.95], [1.6, 39.1], [1.55, 38.85]],
  korsika: [[8.6, 43.0], [9.45, 43.0], [9.55, 42.2], [9.25, 41.4], [8.75, 41.6], [8.6, 42.3]],
  sardinya: [[8.2, 41.1], [9.3, 41.25], [9.8, 40.6], [9.65, 39.2], [9.0, 39.0], [8.4, 39.0], [8.4, 40.0], [8.15, 40.6]],
  sicilya: [[12.4, 38.15], [13.4, 38.2], [15.55, 38.3], [15.15, 37.2], [15.1, 36.65], [14.4, 36.75], [12.45, 37.7]],
  girit: [[23.5, 35.6], [24.2, 35.55], [25.4, 35.35], [26.3, 35.3], [26.2, 35.0], [24.7, 34.95], [23.6, 35.2]],
  kibris: [[32.3, 35.1], [33.0, 35.4], [34.6, 35.7], [34.0, 35.2], [33.9, 34.95], [32.9, 34.65], [32.3, 34.8]],
  rodos: [[27.75, 36.4], [28.25, 36.45], [28.15, 35.9], [27.75, 36.1]],
  midilli: [[25.85, 39.3], [26.4, 39.4], [26.6, 39.05], [26.0, 39.05]],
  sakiz: [[25.9, 38.6], [26.15, 38.55], [26.1, 38.2], [25.9, 38.3]],
  sisam: [[26.6, 37.8], [27.05, 37.75], [26.95, 37.65], [26.6, 37.7]],
  bozcaada: [[25.98, 39.85], [26.1, 39.85], [26.08, 39.78], [25.98, 39.8]],
  cunda: [[26.6, 39.4], [26.68, 39.38], [26.65, 39.33], [26.58, 39.35]],
  santorini: [[25.35, 36.48], [25.48, 36.45], [25.45, 36.35], [25.38, 36.38]],
  eğriboz: [[22.9, 39.0], [23.6, 38.8], [24.6, 38.15], [24.3, 37.98], [23.5, 38.5], [22.85, 38.85]],
  korfu: [[19.65, 39.8], [19.95, 39.75], [20.1, 39.4], [19.85, 39.5]],
  malta: [[14.2, 36.05], [14.55, 35.95], [14.45, 35.82], [14.3, 35.95]],
};
const BLACK = [[27.95, 41.7], [29.1, 41.25], [31.2, 41.1], [33.0, 41.95], [35.1, 42.05], [36.7, 41.3], [37, 41.2], [37, 46.5], [30.5, 46.5], [30.2, 45.8], [29.6, 45.3], [28.7, 44.4], [28.0, 43.4], [27.9, 42.5]];
const MARMARA = [[26.65, 40.45], [27.5, 40.35], [28.95, 41.0], [29.2, 40.75], [28.2, 40.4], [27.3, 40.35], [26.75, 40.3]];
// kabaca ülke sınırları (kesik çizgi)
const BORDERS = [[[-1.8, 43.4], [3.2, 42.4]], [[7.5, 43.8], [7.0, 45.9]], [[13.6, 45.6], [13.9, 46.5]], [[19.0, 42.1], [21.0, 42.3], [22.5, 41.2], [24.6, 41.4], [26.0, 41.7], [26.35, 40.95]],
  [[20.0, 39.7], [21.0, 40.6], [22.5, 41.2]], [[35.9, 35.9], [37, 36.8]], [[25.15, 31.6], [25.0, 30]], [[11.5, 33.15], [10.0, 30]], [[8.3, 36.95], [8.0, 30]], [[-1.9, 35.1], [-1.6, 30]],
  [[26.0, 41.7], [28.0, 42.0]]];

// kapalı yolu yumuşat (Catmull-Rom → kübik Bézier); kenar boyunca giden çizgiler düz kalsın diye 'hard' noktalar keskin
function smooth(pts, closed = true) {
  const P = pts.map(p => geo(...p)), n = P.length;
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const edge = q => q[0] <= 0.5 || q[0] >= WW - 30 || q[1] <= 0.5 || q[1] >= WH - 10;
    if (edge(p1) || edge(p2)) { d += ` L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; continue; }
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + (closed ? 'Z' : '');
}
const line = pts => 'M' + pts.map(p => geo(...p).map(v => v.toFixed(1)).join(' ')).join(' L');

// iki şehir arasındaki yol: karayolu hafif kavisli, feribot denize doğru açılan bir yay
export function routePath(a, b, abroad) {
  const [x1, y1] = townXY(a), [x2, y2] = townXY(b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, bend = abroad ? .28 : .1;
  const cx = mx - dy / len * len * bend, cy = my + dx / len * len * bend;
  return { d: `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, at: u => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * cy + u * u * y2] };
}

// şehir işareti: ülkenin çatı rengiyle küçük ev, adı; bulunduğun yerde karavan
const ROOF = { tr: '#d9694f', gr: '#4a7fb5', it: '#c96f5a', fr: '#7f9c5a', es: '#e07a5f', eg: '#c9a676' };
function marker(S, k) {
  const [x, y] = townXY(k), T = TOWNS[k], c = T.country || 'tr', open = S.unlocked.includes(k), here = k === S.town;
  const icon = here
    ? '<g transform="translate(-16 -30)"><rect x="0" y="6" width="32" height="20" rx="6" fill="#9fd8c4" stroke="#5ea592" stroke-width="2"/><rect x="5" y="10" width="12" height="8" rx="2" fill="#6b4a3a"/><circle cx="8" cy="27" r="3.5" fill="#5b4636"/><circle cx="24" cy="27" r="3.5" fill="#5b4636"/></g>'
    : open ? `<g transform="translate(-11 -26)"><rect x="2" y="10" width="18" height="14" fill="#fffaf0" stroke="#c9a676" stroke-width="1.5"/><path d="M0 11 L11 1 L22 11Z" fill="${ROOF[c]}"/><rect x="9" y="16" width="5" height="8" rx="2" fill="${ROOF[c]}"/></g>`
      : '<g transform="translate(-9 -22)"><circle cx="9" cy="11" r="10" fill="#e9dcc8" stroke="#c9b49a" stroke-width="1.5"/><text x="9" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="#a08a72">?</text></g>';
  return `<g class="city ${open ? 'open' : 'locked'} ${here ? 'here' : ''}" data-town="${k}" style="transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(var(--ms,1))">
    <ellipse cx="0" cy="0" rx="12" ry="4" fill="#000" opacity=".12"/>${icon}
    <g class="city-label"><rect x="${-T.name.length * 4.2 - 7}" y="4" width="${T.name.length * 8.4 + 14}" height="19" rx="9.5" fill="${here ? '#5ea592' : '#fffaf0'}" stroke="${here ? '#4a8a78' : '#e2c29c'}" stroke-width="1.5"/>
      <text x="0" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="${here ? '#fff' : open ? '#4a3a33' : '#a08a72'}">${open ? T.name : '???'}</text></g>
    <circle class="hit" r="22" fill="transparent"/></g>`;
}

export function worldSVG(S) {
  const sea = `<defs>
      <linearGradient id="wsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8dc"/><stop offset="1" stop-color="#7cc3cf"/></linearGradient>
      <pattern id="wwave" width="90" height="46" patternUnits="userSpaceOnUse"><path d="M8 22 q8 -7 16 0 q8 7 16 0" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/></pattern>
      <filter id="wshadow" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="5" stdDeviation="0" flood-color="#c9a676" flood-opacity=".9"/></filter>
    </defs>
    <rect width="${WW}" height="${WH}" fill="url(#wsea)"/><rect width="${WW}" height="${WH}" fill="url(#wwave)"/>`;
  const land = [NORTH, SOUTH, ...Object.values(ISLANDS)].map(p => `<path d="${smooth(p)}"/>`).join('');
  const waters = [BLACK, MARMARA].map(p => `<path d="${smooth(p)}" fill="url(#wsea)"/>`).join('');
  const borders = BORDERS.map(b => `<path d="${line(b)}"/>`).join('');
  const labels = COUNTRY_KEYS.map(c => {
    const C = COUNTRIES[c], [x, y] = geo(...C.label), open = S.countries.includes(c);
    return `<g class="country ${open ? 'open' : 'locked'}" data-country="${c}" transform="translate(${x.toFixed(0)} ${y.toFixed(0)})">
      <text text-anchor="middle" font-size="40" font-weight="700" letter-spacing="3" fill="${open ? '#a07d5c' : '#bba98f'}" opacity=".75">${C.name.toLocaleUpperCase('tr')}</text>
      ${open ? '' : '<text y="44" text-anchor="middle" font-size="30">🔒</text>'}</g>`;
  }).join('');
  // haritada sahibi olmayan ülke kıyılarındaki tanıdık denizler
  const seas = [['AKDENİZ', 17.5, 34.6], ['EGE', 25.0, 37.6], ['ADRİYATİK', 15.6, 43.2], ['İYON', 18.6, 37.3], ['KARADENİZ', 33.5, 43.4]]
    .map(([n, lo, la]) => { const [x, y] = geo(lo, la); return `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" font-size="${n === 'AKDENİZ' ? 44 : 26}" font-style="italic" letter-spacing="6" fill="#fff" opacity=".55">${n}</text>`; }).join('');
  const cities = TOWN_KEYS.filter(k => TOWNS[k].geo && S.countries.includes(TOWNS[k].country || 'tr')).map(k => marker(S, k)).join('');
  return `${sea}${seas}
    <g fill="#f3e2bf" stroke="#c9a676" stroke-width="2.5" stroke-linejoin="round" filter="url(#wshadow)">${land}</g>
    ${waters}
    <g fill="none" stroke="#b49a7c" stroke-width="2.2" stroke-dasharray="7 7" opacity=".7">${borders}</g>
    ${labels}
    <g id="wroute"></g>
    <g id="wcities">${cities}</g>
    <g id="wvan" style="display:none"><rect x="-16" y="-24" width="32" height="20" rx="6" fill="#9fd8c4" stroke="#5ea592" stroke-width="2"/><circle cx="-8" cy="-3" r="3.5" fill="#5b4636"/><circle cx="8" cy="-3" r="3.5" fill="#5b4636"/></g>`;
}

export { flagSVG };
