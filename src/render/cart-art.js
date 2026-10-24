// Araba çizimleri (v3 Faz 5): dört basamak, hepsi karavan koordinatında (sahnede translate(610 420)).
// Raf penceresi her basamakta aynı yerde (50–400 × 118–288; render/shelf-geo.js), araç onun çevresinde değişir:
// 0 el arabası (tekerlekli dolap, çekme kolu) · 1 kitap arabası (kemerli çatılı kulübe) · 2 büyük araba (+ sarmaşık, fenerli kol)
// 3 kitap karavanı: referanstaki üç çeyrek bakışlı karavan (sol önde kabin, ön camı ve farı gölgede).
// Dönüş: back (rafların arkası: gövde ve pencere içi), front (rafların önü: çerçeve, tezgâh, tekerler, tabela),
// slot konumları (çatı süsü, plak çalar, yan kanat raf) ve varsa fenerin yeri (lamp).

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// raf penceresinin içi (koyu ahşap) ve üst gölgesi
const WINDOW_IN = `<rect x="50" y="118" width="350" height="170" rx="14" fill="#6b4a3a"/>
  <rect x="50" y="118" width="350" height="22" rx="10" fill="#5a3d30"/>`;
// pencere çerçevesi ve altındaki katlanır tezgâh (satılan kitap burada paketlenir: shelf-geo COUNTER)
const FRAME = `<rect x="44" y="112" width="362" height="182" rx="14" fill="none" stroke="#8a5a3c" stroke-width="8"/>
  <rect x="26" y="292" width="398" height="15" rx="5" fill="#a8704a"/><rect x="26" y="292" width="398" height="5" rx="2.5" fill="#c48a5f"/>
  <path d="M58 307 L82 334 M392 307 L368 334" stroke="#7a4e33" stroke-width="5" stroke-linecap="round"/>`;

// tabela: krem tahta, mercan yazı, iki ayak (x: sol kenar, y: üst kenar, foot: ayakların indiği yükseklik)
const sign = (x, y, w, foot) => `<g transform="translate(${x} ${y})">
  <path d="M${w * .2} 52 L${w * .17} ${foot - y} M${w * .8} 52 L${w * .83} ${foot - y}" stroke="#7a4e33" stroke-width="6" stroke-linecap="round"/>
  <rect x="0" y="0" width="${w}" height="56" rx="16" fill="#fff6e8" stroke="#e2c29c" stroke-width="5"/>
  <text x="${w / 2}" y="39" text-anchor="middle" font-size="32" font-weight="700" fill="#f08a7e">Sahaf</text>
  <circle cx="15" cy="28" r="5.5" fill="#f2c45a"/><circle cx="${w - 15}" cy="28" r="5.5" fill="#f2c45a"/></g>`;

// fenerli demir kol: x'te çatıdan yükselir, sola kıvrılır, ucunda fener asılı (referanstaki tabela lambası)
const lampArm = (x, base) => `<path d="M${x} ${base} L${x} -34 Q${x} -46 ${x - 12} -46 L${x - 44} -46" fill="none" stroke="#5b4636" stroke-width="5" stroke-linecap="round"/>
  <path d="M${x - 14} -46 Q${x - 4} -36 ${x} -26" fill="none" stroke="#5b4636" stroke-width="3"/><circle cx="${x - 14}" cy="-40" r="3" fill="#5b4636"/>
  <circle cx="${x - 44}" cy="-22" r="22" fill="#ffd56b" opacity=".22"/>
  <path d="M${x - 44} -46 L${x - 44} -38" stroke="#5b4636" stroke-width="2"/>
  <path d="M${x - 56} -38 L${x - 32} -38 L${x - 36} -12 L${x - 52} -12Z" fill="#ffe08a" stroke="#5b4636" stroke-width="3" stroke-linejoin="round"/>
  <path d="M${x - 59} -37 L${x - 44} -48 L${x - 29} -37Z" fill="#5b4636"/><rect x="${x - 54}" y="-13" width="20" height="5" rx="2" fill="#5b4636"/>
  <path d="M${x - 44} -34 L${x - 44} -16" stroke="#fff6c2" stroke-width="3" opacity=".8"/>`;

// sarmaşık: noktalar boyunca kıvrık dal, iki yeşilde yapraklar
function ivy(pts, seed = 1) {
  let d = `M${pts[0][0]} ${pts[0][1]}`, leaves = '';
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    d += ` Q${(ax + bx) / 2 + (i % 2 ? 7 : -7)} ${(ay + by) / 2} ${bx} ${by}`;
    for (let j = 0; j < 3; j++) {
      const t = (j + .5) / 3, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, side = (i + j + seed) % 2 ? 1 : -1;
      const rot = (side * 50 + (i * 37 + j * 23) % 40 - 20).toFixed(0);
      leaves += `<path d="M0 0 C-6 -4 -7 -12 0 -13 C7 -12 6 -4 0 0Z" fill="${(i + j) % 3 ? '#6f9a55' : '#8fbf6e'}" transform="translate(${(x + side * 5).toFixed(1)} ${y.toFixed(1)}) rotate(${rot})"/>`;
    }
  }
  return `<path d="${d}" fill="none" stroke="#5d7a43" stroke-width="2.5" stroke-linecap="round"/>${leaves}`;
}

const wheelVan = x => `<g transform="translate(${x} 352)"><circle r="42" fill="#3d3330"/><circle r="42" fill="none" stroke="#2a2220" stroke-width="3"/>
  <circle r="24" fill="#f3ead8"/><circle r="24" fill="none" stroke="#d6cab4" stroke-width="3"/><circle r="8" fill="#bdb3a3"/></g>`;
const wheelWood = (x, r) => `<g transform="translate(${x} ${384 - r})"><circle r="${r}" fill="none" stroke="#7a4e33" stroke-width="8"/>
  <path d="M${-r + 4} 0 L${r - 4} 0 M0 ${-r + 4} L0 ${r - 4} M${-(r - 4) * .7} ${-(r - 4) * .7} L${(r - 4) * .7} ${(r - 4) * .7} M${-(r - 4) * .7} ${(r - 4) * .7} L${(r - 4) * .7} ${-(r - 4) * .7}" stroke="#8a5a3c" stroke-width="4" stroke-linecap="round"/>
  <circle r="8" fill="#5b4636"/></g>`;
const wheelCart = x => `<g transform="translate(${x} 350)"><circle r="38" fill="#4a3a32"/><circle r="38" fill="none" stroke="#2f2420" stroke-width="3"/>
  <circle r="20" fill="#f3ead8"/><path d="M-20 0 L20 0 M0 -20 L0 20" stroke="#d6cab4" stroke-width="3"/><circle r="7" fill="#8a5a3c"/></g>`;
// gövdenin yan ışığı: güneş sağdan, sol kenar gölgede
const vol = d => `<path d="${d}" fill="url(#cartVol)" pointer-events="none"/>`;

// 0 · el arabası: boyalı dolap, tente direkleri, tahta tekerler, çekme kolu
function handCart(p) {
  const body = 'M28 300 L28 104 Q28 92 40 92 L410 92 Q422 92 422 104 L422 300Z';
  return {
    back: `<path d="M34 300 L34 58 M416 300 L416 58" stroke="#7a4e33" stroke-width="7" stroke-linecap="round"/>
      <rect x="28" y="54" width="394" height="8" rx="4" fill="#7a4e33"/>
      <path d="${body}" fill="${p.body}" stroke="${p.edge}" stroke-width="6"/>${vol(body)}${WINDOW_IN}`,
    front: `${FRAME}<rect x="8" y="306" width="434" height="16" rx="5" fill="#8a5a3c"/>
      <rect x="40" y="322" width="370" height="22" rx="4" fill="#c48a5f" stroke="#8a5a3c" stroke-width="3"/>
      <path d="M60 322 L60 344 M120 322 L120 344 M330 322 L330 344 M390 322 L390 344" stroke="#8a5a3c" stroke-width="3"/>
      <path d="M12 318 L-46 370" stroke="#7a4e33" stroke-width="7" stroke-linecap="round"/><path d="M-60 360 L-34 382" stroke="#5b4636" stroke-width="10" stroke-linecap="round"/>
      ${wheelWood(92, 40)}${wheelWood(358, 40)}${sign(160, 0, 130, 58)}`,
    roof: [392, 56], gramo: [70, 56], wing: [422, 210], lamp: null,
  };
}

// 1–2 · kitap arabası: kemerli krem çatı, boyalı gövde, alt bant, çeki demiri; büyük arabada sarmaşık ve fenerli kol
function boothCart(p, big) {
  const body = 'M10 330 L10 66 Q225 6 440 66 L440 330 Q440 346 424 346 L26 346 Q10 346 10 330Z';
  return {
    back: `<path d="M430 300 L500 316 L500 326 L428 316Z" fill="#6b5446"/><circle cx="502" cy="321" r="9" fill="#6b5446"/>
      <path d="${body}" fill="${p.body}" stroke="${p.edge}" stroke-width="7"/>${vol(body)}
      <path d="M14 304 L436 304 L436 330 Q436 342 424 342 L26 342 Q14 342 14 330Z" fill="${p.band}"/>
      <path d="M14 304 L436 304" stroke="${p.shine}" stroke-width="4"/>
      <path d="M-8 58 Q225 -14 458 58 L458 72 Q225 0 -8 72Z" fill="#fff6e8" stroke="#e2c29c" stroke-width="4" stroke-linejoin="round"/>
      <path d="M28 82 Q225 30 422 82" fill="none" stroke="${p.shine}" stroke-width="6" stroke-linecap="round"/>
      ${big ? `<path d="M60 22 Q225 -16 390 22" fill="none" stroke="#5b4636" stroke-width="4"/><path d="M90 16 L90 30 M225 4 L225 20 M360 16 L360 30" stroke="#5b4636" stroke-width="4"/>` : ''}
      ${WINDOW_IN}`,
    front: `${FRAME}<path d="M54 346 A50 50 0 0 1 154 346Z M296 346 A50 50 0 0 1 396 346Z" fill="#3d2f28"/>
      ${wheelCart(104)}${wheelCart(346)}
      <rect x="436" y="250" width="6" height="22" rx="3" fill="#e57f73"/>
      ${big ? ivy([[40, 84], [34, 120], [44, 160], [36, 200], [46, 236], [40, 262]], 2) + ivy([[52, 60], [96, 46], [140, 36]], 1) + lampArm(30, 52) : ''}
      ${sign(150, -36, 150, 26)}`,
    roof: [392, 42], gramo: [74, 40], wing: [440, 210], lamp: big ? [-14, -25] : null,
  };
}

// 3 · kitap karavanı: yan yüz önde, kabin solda üç çeyrek bakışla (ön yüz gölgede, ön cam, far, tampon)
function van(p) {
  const body = 'M-6 336 L-6 118 C-6 50 40 12 120 8 L340 8 C410 10 452 48 452 118 L452 334 C452 344 444 350 434 350 L12 350 C2 350 -6 344 -6 336Z';
  const nose = 'M-6 50 C-30 54 -56 70 -64 96 L-70 302 C-70 326 -62 338 -44 342 L-6 350Z';
  return {
    back: `<path d="${nose}" fill="${shade(p.body, .8)}" stroke="${p.edge}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-14 72 C-32 76 -48 86 -54 102 L-57 168 L-14 176Z" fill="#bfe3ea" stroke="#5b4636" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-48 116 L-24 98 M-52 146 L-22 122" stroke="#fff" stroke-width="4" opacity=".55" stroke-linecap="round"/>
      <path d="M-50 168 L-28 150" stroke="#5b4636" stroke-width="3" stroke-linecap="round"/>
      <path d="M-58 188 L-12 196 L-12 212 L-60 204Z" fill="${p.shine}" opacity=".7"/>
      <path d="M-60 224 L-16 230 M-60 236 L-16 242" stroke="${p.edge}" stroke-width="3" stroke-linecap="round"/>
      <path d="${body}" fill="${p.body}" stroke="${p.edge}" stroke-width="6"/>${vol(body)}
      <path d="M-2 306 L448 306 L448 334 C448 342 442 346 434 346 L12 346 C4 346 -2 342 -2 336Z" fill="${p.band}"/>
      <path d="M-2 306 L448 306" stroke="${p.shine}" stroke-width="4"/>
      <path d="M10 40 C26 22 62 14 120 12 L340 12 C394 14 428 30 440 54" fill="none" stroke="${p.shine}" stroke-width="8" stroke-linecap="round"/>
      <path d="M60 2 L410 2" stroke="#5b4636" stroke-width="4" stroke-linecap="round"/><path d="M80 2 L80 12 M245 2 L245 12 M395 2 L395 14" stroke="#5b4636" stroke-width="4"/>
      <path d="M-2 56 L40 56 L40 300" fill="none" stroke="${p.edge}" stroke-width="3"/>
      <rect x="2" y="62" width="32" height="84" rx="11" fill="#bfe3ea" stroke="#5b4636" stroke-width="3"/>
      <path d="M8 100 L26 82" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>
      <rect x="24" y="190" width="12" height="4" rx="2" fill="#5b4636"/>
      ${WINDOW_IN}`,
    front: `${FRAME}<path d="M56 350 A54 54 0 0 1 164 350Z M286 350 A54 54 0 0 1 394 350Z" fill="#3d2f28"/>
      <path d="M56 350 A54 54 0 0 1 164 350 M286 350 A54 54 0 0 1 394 350" fill="none" stroke="${p.edge}" stroke-width="7"/>
      ${wheelVan(110)}${wheelVan(340)}
      <circle cx="-40" cy="266" r="15" fill="#fff6c2" stroke="#d9d2c0" stroke-width="5"/><circle cx="-44" cy="262" r="4" fill="#fff"/>
      <path d="M-76 316 L-6 330 L-6 342 L-76 328Z" fill="#d9d2c0" stroke="#b8ae9c" stroke-width="2" stroke-linejoin="round"/>
      <rect x="444" y="250" width="8" height="26" rx="3" fill="#e57f73"/><path d="M446 330 L458 330" stroke="#d9d2c0" stroke-width="8" stroke-linecap="round"/>
      ${ivy([[44, 70], [36, 108], [46, 148], [38, 188], [48, 226], [40, 258]], 2)}${ivy([[46, 30], [92, 14], [140, 10]], 1)}
      ${lampArm(24, 30)}${sign(150, -52, 150, 10)}`,
    roof: [392, 18], gramo: [86, 18], wing: [452, 210], lamp: [-20, -25],
  };
}

export function cartArt(lv, paint) {
  return lv >= 3 ? van(paint) : lv >= 1 ? boothCart(paint, lv >= 2) : handCart(paint);
}
