// Şehirlerin ufuktaki simgeleri: evlerin ve mekân süslerinin arkasında, denizin/ufkun önünde durur (sahne 1600×900).
// Ülke mimarisi (drawHouses paleti) de burada: evler o ülkenin rengini ve çatısını taşır.

const hill = (x0, x1, top, fill = '#c9d6a0', base = 470) => `<path d="M${x0} ${base} C${x0 + (x1 - x0) * .2} ${top + 30} ${x0 + (x1 - x0) * .35} ${top} ${(x0 + x1) / 2} ${top} C${x0 + (x1 - x0) * .65} ${top} ${x0 + (x1 - x0) * .8} ${top + 30} ${x1} ${base}Z" fill="${fill}"/>`;

// küçük kale: dişli duvar ve kule
const castle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#e3d4b4">
  <rect x="-90" y="-40" width="180" height="40"/>${[-90, -60, -30, 0, 30, 60].map(cx => `<rect x="${cx}" y="-52" width="18" height="12"/>`).join('')}
  <rect x="-24" y="-92" width="48" height="92"/>${[-24, -8, 8].map(cx => `<rect x="${cx}" y="-104" width="12" height="12"/>`).join('')}
  <rect x="-6" y="-70" width="12" height="18" rx="6" fill="#8a6a4f"/><path d="M0 -104 L0 -128 L22 -120 L0 -114" fill="#4a7fb5"/></g>`;

const LANDMARKS = {
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
