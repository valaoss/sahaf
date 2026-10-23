// Ülkeler: karavan Ege'den bütün Akdeniz'e açılır. Ülkeler arası yolculuk feribotla (bir gün sürer, pasaporta damga).
// unlock: { story: true } hikâye bitince · { visited: { country, n } } o ülkede n şehir gezince · { stamps: n } pasaportta n damga
// label: haritada adın yazılacağı yer [boylam, enlem] · greet: o ülkenin müşterileri böyle selam verir
export const COUNTRIES = {
  tr: { name: 'Türkiye', greet: 'Merhaba', flag: 'tr', label: [32.5, 38.6], land: '#f3e2bf' },
  gr: { name: 'Yunanistan', greet: 'Kalimera', flag: 'gr', label: [21.9, 39.6], land: '#eef0e2', unlock: { story: true },
    hint: 'Assos\'tan karşı kıyı görünüyor. Defter tamamlanınca feribot yolu açılır.' },
  it: { name: 'İtalya', greet: 'Ciao', flag: 'it', label: [13.2, 42.6], land: '#f1e6cf', unlock: { visited: { country: 'gr', n: 3 } },
    hint: 'Yunanistan\'da üç şehir gezince İtalya feribotu açılır.' },
  fr: { name: 'Fransa', greet: 'Bonjour', flag: 'fr', label: [2.4, 44.4], land: '#ece8da', unlock: { visited: { country: 'it', n: 3 } },
    hint: 'İtalya\'da üç şehir gezince Fransa ve İspanya yolu açılır.' },
  es: { name: 'İspanya', greet: '¡Hola!', flag: 'es', label: [-3.6, 39.6], land: '#f2dfc0', unlock: { visited: { country: 'it', n: 3 } },
    hint: 'İtalya\'da üç şehir gezince Fransa ve İspanya yolu açılır.' },
  eg: { name: 'Mısır', greet: 'Marhaba', flag: 'eg', label: [29.6, 30.6], land: '#efd9b0', unlock: { stamps: 5 },
    hint: 'Pasaportunda beş ülkenin damgası olunca İskenderiye feribotu kalkar.' },
};
export const COUNTRY_KEYS = Object.keys(COUNTRIES);

// küçük bayraklar (emoji bayrakları her cihazda görünmüyor): 30×20
export function flagSVG(code) {
  const f = {
    tr: '<rect width="30" height="20" fill="#e30a17"/><circle cx="11" cy="10" r="5.2" fill="#fff"/><circle cx="12.4" cy="10" r="4.2" fill="#e30a17"/><path d="M17.5 10 l1.6 -1 -.4 1.8 1.4 1.2 -1.8 .1 -.8 1.7 -.6 -1.8 -1.8 -.3 1.5 -1Z" fill="#fff"/>',
    gr: '<rect width="30" height="20" fill="#0d5eaf"/>' + [2, 6, 10, 14, 18].map(y => `<rect y="${y}" width="30" height="2" fill="#fff"/>`).join('') + '<rect width="11" height="11" fill="#0d5eaf"/><rect x="4.5" width="2" height="11" fill="#fff"/><rect y="4.5" width="11" height="2" fill="#fff"/>',
    it: '<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/>',
    fr: '<rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/>',
    es: '<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>',
    eg: '<rect width="30" height="7" fill="#ce1126"/><rect y="7" width="30" height="6" fill="#fff"/><rect y="13" width="30" height="7" fill="#111"/><circle cx="15" cy="10" r="1.8" fill="#c09300"/>',
  }[code] || '';
  return `<svg class="flag" viewBox="0 0 30 20" width="30" height="20">${f}</svg>`;
}
