// Şehirlerin ufuktaki simgeleri: evlerin ve mekân süslerinin arkasında, denizin/ufkun önünde durur (sahne 1600×900).
// Ülke mimarisi (drawHouses paleti) de burada: evler o ülkenin rengini ve çatısını taşır.

const hill = (x0, x1, top, fill = '#c9d6a0', base = 470) => `<path d="M${x0} ${base} C${x0 + (x1 - x0) * .2} ${top + 30} ${x0 + (x1 - x0) * .35} ${top} ${(x0 + x1) / 2} ${top} C${x0 + (x1 - x0) * .65} ${top} ${x0 + (x1 - x0) * .8} ${top + 30} ${x1} ${base}Z" fill="${fill}"/>`;

// küçük kale: dişli duvar ve kule
const castle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#e3d4b4">
  <rect x="-90" y="-40" width="180" height="40"/>${[-90, -60, -30, 0, 30, 60].map(cx => `<rect x="${cx}" y="-52" width="18" height="12"/>`).join('')}
  <rect x="-24" y="-92" width="48" height="92"/>${[-24, -8, 8].map(cx => `<rect x="${cx}" y="-104" width="12" height="12"/>`).join('')}
  <rect x="-6" y="-70" width="12" height="18" rx="6" fill="#8a6a4f"/><path d="M0 -104 L0 -128 L22 -120 L0 -114" fill="#4a7fb5"/></g>`;

// cami silüeti: büyük kubbe, yarım kubbeler, dört minare (uzak, mor-gri)
const mosque = (x, y, s, c = '#b9a9c4') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
  <rect x="-120" y="-40" width="240" height="40"/><path d="M-70 -40 A70 70 0 0 1 70 -40Z"/><path d="M-115 -40 A35 35 0 0 1 -55 -40Z M55 -40 A35 35 0 0 1 115 -40Z"/>
  <rect x="-4" y="-115" width="8" height="10"/><path d="M0 -125 L4 -115 L-4 -115Z"/>
  ${[-150, -130, 130, 150].map(mx => `<rect x="${mx - 4}" y="-160" width="8" height="160"/><path d="M${mx - 5} -160 L${mx} -186 L${mx + 5} -160Z"/><rect x="${mx - 7}" y="-120" width="14" height="4"/>`).join('')}</g>`;

// balon: renkli dilimler, sepet (Kapadokya); bob sınıfı canvas motorunda süzülür
const balloon = (x, y, s, c1, c2, d) => `<g class="bob" style="animation-delay:-${d}s"><g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 -40 C30 -40 34 -6 14 14 L-14 14 C-34 -6 -30 -40 0 -40Z" fill="${c1}"/><path d="M0 -40 C10 -40 12 -6 5 14 L-5 14 C-12 -6 -10 -40 0 -40Z" fill="${c2}"/>
  <path d="M-12 16 L-6 26 M12 16 L6 26" stroke="#7a5a48" stroke-width="1.5"/><rect x="-7" y="26" width="14" height="9" rx="2" fill="#a07448"/></g></g>`;

// palmiye (Palermo, Mısır, İspanya kıyıları)
const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C4 -60 -4 -120 6 -170" fill="none" stroke="#8a6a4f" stroke-width="7"/>
  ${[-60, -20, 20, 60, 100].map(a => `<ellipse cx="${6 + Math.cos(a * Math.PI / 180) * 30}" cy="${-170 + Math.sin(a * Math.PI / 180) * 14}" rx="34" ry="9" fill="#7f9c5a" transform="rotate(${a} 6 -170)"/>`).join('')}</g>`;

const LANDMARKS = {
  // Venedik: San Marco kubbeleri, çan kulesi
  venedik: () => `<g transform="translate(1240 470)" fill="#e9d2b0">
      <rect x="-150" y="-80" width="300" height="80"/>${[-110, -40, 40, 110].map(dx => `<path d="M${dx - 34} -80 A34 30 0 0 1 ${dx + 34} -80Z" fill="#c9b08e"/><rect x="${dx - 2}" y="-118" width="4" height="10" fill="#c9a676"/>`).join('')}
      ${[-120, -80, -40, 0, 40, 80, 120].map(dx => `<path d="M${dx - 14} 0 L${dx - 14} -40 A14 14 0 0 1 ${dx + 14} -40 L${dx + 14} 0Z" fill="#b8a07a"/>`).join('')}</g>
    <g transform="translate(980 470)"><rect x="-24" y="-260" width="48" height="260" fill="#c96f5a"/><rect x="-28" y="-200" width="56" height="34" fill="#efe4cc"/>
      ${[-16, -2, 12].map(dx => `<rect x="${dx - 4}" y="-196" width="8" height="26" rx="4" fill="#8a6a4f"/>`).join('')}<path d="M-26 -260 L0 -320 L26 -260Z" fill="#7f9c8a"/><circle cx="0" cy="-324" r="5" fill="#f2c45a"/></g>`,
  // Roma: Kolezyum
  roma: () => `<g transform="translate(1250 470)"><path d="M-250 0 L-250 -150 C-160 -176 160 -176 250 -150 L250 0Z" fill="#dcb98a"/>
      <path d="M120 -160 C180 -160 230 -156 250 -150 L250 -40 C230 -60 170 -90 120 -100Z" fill="#c9a676"/>
      ${[0, 1, 2].map(row => Array.from({ length: 12 }, (_, i) => `<path d="M${-230 + i * 38} ${-12 - row * 48} L${-230 + i * 38} ${-36 - row * 48} A12 12 0 0 1 ${-206 + i * 38} ${-36 - row * 48} L${-206 + i * 38} ${-12 - row * 48}Z" fill="#8a6a4f" opacity=".75"/>`).join('')).join('')}
      <rect x="-250" y="-4" width="500" height="4" fill="#000" opacity=".08"/></g>`,
  // Napoli: Vezüv (tepesinden duman)
  napoli: () => `<path d="M800 470 C900 420 1000 330 1100 260 L1170 250 L1240 262 C1340 330 1460 420 1600 450 L1600 470Z" fill="#9a8aa0"/>
    <path d="M1100 260 L1170 250 L1240 262 L1210 280 L1170 270 L1130 282Z" fill="#7d6e84"/>
    <g class="steam"><ellipse cx="1170" cy="230" rx="26" ry="16" fill="#eee6ee" opacity=".8"/><ellipse cx="1195" cy="205" rx="30" ry="18" fill="#eee6ee" opacity=".6"/></g>`,
  // Palermo: kırmızı kubbeli katedral, palmiyeler
  palermo: () => `<g transform="translate(1260 470)" fill="#efd9b0"><rect x="-140" y="-100" width="280" height="100"/>
      ${[-90, 0, 90].map(dx => `<path d="M${dx - 32} -100 A32 32 0 0 1 ${dx + 32} -100Z" fill="#d0503c"/>`).join('')}
      <rect x="-170" y="-160" width="40" height="160" fill="#e3c99a"/><rect x="130" y="-160" width="40" height="160" fill="#e3c99a"/>
      ${[-80, -40, 0, 40, 80].map(dx => `<path d="M${dx - 10} -20 L${dx - 10} -60 A10 10 0 0 1 ${dx + 10} -60 L${dx + 10} -20Z" fill="#8a6a4f"/>`).join('')}</g>`
    + palm(1010, 470, .9) + palm(1500, 470, 1),
  // Bodrum: denizin içinde kale (St. Peter)
  bodrum: () => `<path d="M1120 470 C1150 440 1200 432 1260 430 C1350 428 1420 438 1480 470Z" fill="#b8a07a"/>` + castle(1300, 438, 1.05),
  // Antalya: karlı Toroslar ve Yivli Minare
  antalya: () => `<path d="M0 420 L120 300 L210 360 L330 250 L460 350 L560 290 L700 390 L760 470 L0 470Z" fill="#a9b6c8"/>
    <path d="M300 280 L330 250 L362 278 L345 288 L330 276 L314 290Z M100 320 L120 300 L142 322 L128 326Z M540 308 L560 290 L582 310 L566 314Z" fill="#fbfbff"/>
    <g transform="translate(1260 470)"><rect x="-16" y="-200" width="32" height="200" fill="#c96f5a"/>${[-10, -2, 6].map(gx => `<rect x="${gx}" y="-196" width="3" height="190" fill="#000" opacity=".12"/>`).join('')}
      <rect x="-22" y="-150" width="44" height="8" fill="#b85c48"/><path d="M-12 -200 L0 -236 L12 -200Z" fill="#7f9c5a"/><rect x="-40" y="-40" width="80" height="40" fill="#e3d4b4"/></g>`,
  // İstanbul: karşı kıyıda tepedeki cami silüeti ve Galata Kulesi
  istanbul: () => `<path d="M780 470 C860 400 1000 380 1150 390 C1300 400 1450 420 1600 400 L1600 470Z" fill="#cdbfd2"/>`
    + mosque(1180, 400, .95) + mosque(1450, 418, .55, '#c4b4cc')
    + `<g transform="translate(330 470)" fill="#c7b2bf"><rect x="-26" y="-190" width="52" height="190"/><rect x="-32" y="-196" width="64" height="12"/>
      <path d="M-30 -196 L0 -250 L30 -196Z" fill="#9a8a9e"/>${[-150, -110, -70].map(y => `<rect x="-6" y="${y}" width="12" height="18" rx="6" fill="#a8949f"/>`).join('')}</g>`,
  // Kapadokya: deniz yok; yayla, peribacaları, balonlar
  kapadokya: () => `<path d="M0 330 C200 310 400 320 600 330 C800 340 1000 318 1200 324 C1400 330 1520 322 1600 326 L1600 562 L0 562Z" fill="#e6c9a0"/>
    <path d="M0 380 C300 360 600 372 900 380 C1200 388 1400 370 1600 378 L1600 562 L0 562Z" fill="#d9b88a"/>
    ${[[160, 470, 1.1], [270, 486, .8], [1180, 474, 1.2], [1300, 490, .9], [1420, 470, 1.05], [560, 492, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-34 0 C-30 -60 -18 -120 -10 -150 L10 -150 C18 -120 30 -60 34 0Z" fill="#f1dcb8"/><ellipse cx="0" cy="-152" rx="20" ry="11" fill="#9a7a5a"/>
      <rect x="-8" y="-70" width="10" height="14" rx="5" fill="#8a6a4f"/><rect x="8" y="-100" width="8" height="11" rx="4" fill="#8a6a4f"/></g>`).join('')}
    ${balloon(420, 170, 1.4, '#e57f73', '#f2c45a', 0)}${balloon(760, 120, 1.1, '#5b8bd0', '#fff4e0', 1.2)}${balloon(980, 210, 1.6, '#8bc49a', '#f08a7e', 2.1)}${balloon(1350, 150, 1, '#b98ad6', '#f2c45a', .7)}${balloon(1150, 90, .8, '#f2c45a', '#e57f73', 1.6)}`,

  // Ayvalık'ın karşısı: tepede taş kale
  midilli: () => hill(1050, 1600, 330, '#bfd29a') + castle(1330, 352, .8),
  // Akropolis tepesi ve Parthenon
  atina: () => hill(980, 1600, 300, '#d8c49a') + `<g transform="translate(1310 318)">
    <rect x="-130" y="-8" width="260" height="12" fill="#efe4cc"/><rect x="-140" y="4" width="280" height="10" fill="#e3d4b4"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${-118 + i * 29}" y="-70" width="14" height="62" fill="#f5ecd8"/>`).join('')}
    <rect x="-126" y="-82" width="252" height="14" fill="#efe4cc"/><path d="M-130 -82 L0 -112 L130 -82Z" fill="#f5ecd8"/>
    <path d="M-120 -84 L0 -108 L120 -84Z" fill="#000" opacity=".06"/></g>`,
  // Beyaz Kule, kıyıda
  selanik: () => `<g transform="translate(1330 470)">
    <rect x="-46" y="-150" width="92" height="150" fill="#f6f1e6"/><rect x="-46" y="-150" width="92" height="150" fill="url(#cartVol)" opacity=".6"/>
    ${[-120, -80, -40].map(y => `<rect x="-46" y="${y}" width="92" height="3" fill="#000" opacity=".06"/>`).join('')}
    <rect x="-30" y="-182" width="60" height="32" fill="#f6f1e6"/>${[-30, -14, 2, 18].map(cx => `<rect x="${cx}" y="-192" width="10" height="10" fill="#f6f1e6"/>`).join('')}
    ${[-30, 0, 30].map(cx => `<rect x="${cx - 5}" y="-110" width="10" height="16" rx="5" fill="#8a7a6a"/>`).join('')}
    <path d="M0 -192 L0 -214 L18 -207 L0 -202" fill="#4a7fb5"/></g>`,
  // kalderanın yamacı: beyaz evler, mavi kubbeler
  santorini: () => `<path d="M0 360 C120 330 260 330 380 350 C470 365 560 360 640 390 L700 470 L0 470Z" fill="#9a6a58"/>
    <path d="M0 400 C150 380 330 385 470 410 C560 425 640 430 700 470 L0 470Z" fill="#7d5446"/>
    ${[[40, 330, 70, 40], [120, 318, 60, 44], [190, 326, 80, 38], [280, 320, 64, 42], [350, 334, 74, 36], [430, 346, 60, 32], [500, 352, 70, 34]]
      .map(([x, y, w, h], i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fdfdf8"/><rect x="${x + w / 2 - 7}" y="${y + h - 18}" width="14" height="18" rx="6" fill="#3f6fa8"/>
        ${i % 2 ? `<path d="M${x + 10} ${y} A${w / 2 - 10} ${w / 2 - 10} 0 0 1 ${x + w - 10} ${y}Z" fill="#2f6fb8"/><path d="M${x + w / 2} ${y - w / 2 + 10} L${x + w / 2} ${y - w / 2 - 6} M${x + w / 2 - 5} ${y - w / 2 + 1} L${x + w / 2 + 5} ${y - w / 2 + 1}" stroke="#fdfdf8" stroke-width="2.5"/>` : `<rect x="${x - 3}" y="${y - 5}" width="${w + 6}" height="6" fill="#fdfdf8"/>`}`).join('')}`,
};

// sahnenin ufkuna simge (sahil sahnesinde deniz önde kalır, tepe sahnesinde tepenin arkasında)
export function landmarkArt(town) {
  return LANDMARKS[town] ? LANDMARKS[town]() : '';
}

// ülke mimarisi: duvar, çatı, kapı renkleri ve çatı biçimi
export const ARCH = {
  tr: { walls: ['#fffaf0', '#fdf1e0', '#fbe6dc', '#eef3f7'], roofs: ['#e07a5f', '#d9694f', '#e8906e'], doors: ['#4a7fb5', '#5aa3a3', '#e57f73', '#7f9c5a'], roof: 'gable', bloom: true },
  gr: { walls: ['#ffffff', '#fbfbf6', '#f4f6f8'], roofs: ['#3f6fa8', '#4a7fb5'], doors: ['#3f6fa8', '#5aa3d6', '#4a7fb5'], roof: 'flat', dome: .4, bloom: true },
  it: { walls: ['#f2c98a', '#e8a86c', '#f4dca8', '#d98f6a'], roofs: ['#c96f5a', '#b85c48'], doors: ['#5a7f4a', '#8a5a3c'], roof: 'gable', bloom: false },
  es: { walls: ['#fffaf2', '#fbf1e2', '#f7e7d0'], roofs: ['#d9694f', '#c96f5a'], doors: ['#8a5a3c', '#4a7fb5'], roof: 'gable', bloom: true },
  fr: { walls: ['#f4e6d2', '#e9dcef', '#dcebf0', '#f6dccf'], roofs: ['#6a7a8c', '#7d8a96'], doors: ['#4a6f8a', '#8a4a5a'], roof: 'mansard', bloom: false },
  eg: { walls: ['#e8d2a8', '#dcc08e', '#f0dfbd'], roofs: ['#c9a676'], doors: ['#5aa3a3', '#8a5a3c'], roof: 'flat', dome: .2, palm: true },
};
