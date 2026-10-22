// Kasabalar: her birinin kalabalığı, okur zevki (tür ağırlıkları) ve renkleri farklı
export const TOWNS = {
  ayvalik: {
    name: 'Ayvalık', traffic: 22,
    demand: { roman: 3, siir: 2, tarih: 2, polisiye: 1, cocuk: 1, fantastik: 1 },
    blurb: 'Zeytinlikler ve eski taş evler. Okurları romana ve tarihe düşkün.',
    sky: ['#f8c9a8', '#fde4c4'], sea: ['#9ad7d2', '#6bbdc3'], map: { x: 760, y: 170 },
  },
  cunda: {
    name: 'Cunda', traffic: 16,
    demand: { siir: 3, roman: 2, fantastik: 2, tarih: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Küçük ada, sakin sokaklar. Şiir okuyan çok, kalabalık az.',
    sky: ['#f6b8b0', '#fde0cf'], sea: ['#8ccfe0', '#5fb0cc'], map: { x: 390, y: 320 },
  },
  foca: {
    name: 'Foça', traffic: 20,
    demand: { tarih: 3, polisiye: 2, cocuk: 2, roman: 1, siir: 1, fantastik: 1 },
    blurb: 'Fok kayalıkları ve kale. Tarih ve polisiye meraklıları burada.',
    sky: ['#cbd8f2', '#f7e6d6'], sea: ['#8fc9e6', '#5c9fcf'], map: { x: 790, y: 520 },
  },
  alacati: {
    name: 'Alaçatı', traffic: 26,
    demand: { fantastik: 3, polisiye: 2, cocuk: 2, roman: 1, siir: 1, tarih: 1 },
    blurb: 'Taş sokaklar, rüzgâr ve tatilciler. Kalabalık; fantastik ve polisiye satar.',
    sky: ['#f9d79b', '#fff0d2'], sea: ['#a4e0d6', '#69c2c0'], map: { x: 900, y: 790 },
  },
  // hikâye ilerledikçe açılanlar (unlock: bulunan defter sayfası sayısı)
  bozcaada: {
    name: 'Bozcaada', traffic: 18, unlock: { pages: 4 },
    demand: { siir: 3, roman: 2, tarih: 2, fantastik: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Rüzgârla çevrili bir ada: bağlar, kale ve sakin bir liman. Şiir ve tarih okuru çok.',
    sky: ['#f4c3c8', '#fde6dc'], sea: ['#7fc7d8', '#4f9fbd'], map: { x: 250, y: 130 },
  },
  sirince: {
    name: 'Şirince', traffic: 17, unlock: { pages: 7 },
    demand: { tarih: 3, fantastik: 2, siir: 2, roman: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Zeytin ve incir bahçeleri arasında taş bir dağ köyü. Masallar ve eski hikâyeler burada yaşar.',
    sky: ['#e8d3a8', '#fbefd6'], sea: ['#a7d3c9', '#7bb5ad'], map: { x: 1260, y: 470 },
  },
};
export const TOWN_KEYS = Object.keys(TOWNS);
// oyunun başında açık olan kasabalar
export const START_TOWNS = TOWN_KEYS.filter(k => !TOWNS[k].unlock);
