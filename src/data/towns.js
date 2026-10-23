// Kasabalar: her birinin kalabalığı, okur zevki (tür ağırlıkları) ve renkleri farklı.
// country: data/countries.js · geo: [boylam, enlem] (dünya haritası ve yol mesafesi) · map: eski Ege haritasındaki yer
export const TOWNS = {
  ayvalik: {
    name: 'Ayvalık', country: 'tr', geo: [26.69, 39.32], traffic: 22,
    demand: { roman: 3, siir: 2, tarih: 2, polisiye: 1, cocuk: 1, fantastik: 1 },
    blurb: 'Zeytinlikler ve eski taş evler. Okurları romana ve tarihe düşkün.',
    sky: ['#f8c9a8', '#fde4c4'], sea: ['#9ad7d2', '#6bbdc3'], map: { x: 760, y: 170 },
  },
  cunda: {
    name: 'Cunda', country: 'tr', geo: [26.62, 39.37], traffic: 16,
    demand: { siir: 3, roman: 2, fantastik: 2, tarih: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Küçük ada, sakin sokaklar. Şiir okuyan çok, kalabalık az.',
    sky: ['#f6b8b0', '#fde0cf'], sea: ['#8ccfe0', '#5fb0cc'], map: { x: 390, y: 320 },
  },
  foca: {
    name: 'Foça', country: 'tr', geo: [26.75, 38.67], traffic: 20,
    demand: { tarih: 3, polisiye: 2, cocuk: 2, roman: 1, siir: 1, fantastik: 1 },
    blurb: 'Fok kayalıkları ve kale. Tarih ve polisiye meraklıları burada.',
    sky: ['#cbd8f2', '#f7e6d6'], sea: ['#8fc9e6', '#5c9fcf'], map: { x: 790, y: 520 },
  },
  alacati: {
    name: 'Alaçatı', country: 'tr', geo: [26.37, 38.28], traffic: 26,
    demand: { fantastik: 3, polisiye: 2, cocuk: 2, roman: 1, siir: 1, tarih: 1 },
    blurb: 'Taş sokaklar, rüzgâr ve tatilciler. Kalabalık; fantastik ve polisiye satar.',
    sky: ['#f9d79b', '#fff0d2'], sea: ['#a4e0d6', '#69c2c0'], map: { x: 900, y: 790 },
  },
  // hikâye ilerledikçe açılanlar (unlock: bulunan defter sayfası sayısı)
  bozcaada: {
    name: 'Bozcaada', country: 'tr', geo: [26.05, 39.83], traffic: 18, unlock: { pages: 4 },
    demand: { siir: 3, roman: 2, tarih: 2, fantastik: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Rüzgârla çevrili bir ada: bağlar, kale ve sakin bir liman. Şiir ve tarih okuru çok.',
    sky: ['#f4c3c8', '#fde6dc'], sea: ['#7fc7d8', '#4f9fbd'], map: { x: 250, y: 130 },
  },
  sirince: {
    name: 'Şirince', country: 'tr', geo: [27.43, 37.94], traffic: 17, unlock: { pages: 7 },
    demand: { tarih: 3, fantastik: 2, siir: 2, roman: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Zeytin ve incir bahçeleri arasında taş bir dağ köyü. Masallar ve eski hikâyeler burada yaşar.',
    sky: ['#e8d3a8', '#fbefd6'], sea: ['#a7d3c9', '#7bb5ad'], map: { x: 1260, y: 470 },
  },
  dikili: {
    name: 'Dikili', country: 'tr', geo: [26.89, 39.07], traffic: 19, unlock: { pages: 2 },
    demand: { polisiye: 3, cocuk: 2, roman: 2, siir: 1, tarih: 1, fantastik: 1 },
    blurb: 'Geniş kumsal, ılık sular, sakin bir kordon. Emekliler ve aileler çok; polisiye ve çocuk kitabı sorulur.',
    sky: ['#f7c2a2', '#fde9cf'], sea: ['#93d3d8', '#5eb3c2'], map: { x: 850, y: 335 },
  },
  urla: {
    name: 'Urla', country: 'tr', geo: [26.76, 38.32], traffic: 18, unlock: { pages: 5 },
    demand: { siir: 3, roman: 2, fantastik: 2, tarih: 1, polisiye: 1, cocuk: 1 },
    blurb: 'Bağlar, enginar tarlaları ve sanatçı atölyeleri. Okurları meraklı; şiir ve düşündüren romanlar sorulur.',
    sky: ['#f2c9b6', '#fbe8da'], sea: ['#9fd2cf', '#6cb8b8'], map: { x: 1060, y: 640 },
  },
  assos: {
    name: 'Assos', country: 'tr', geo: [26.34, 39.49], traffic: 15, unlock: { pages: 8 },
    demand: { tarih: 3, siir: 2, roman: 2, fantastik: 1, cocuk: 1, polisiye: 1 },
    blurb: 'Athena tapınağının gölgesinde taş bir köy; karşıda Midilli. Tarih ve felsefe okurlarının son durağı.',
    sky: ['#e9c6c2', '#fbe4d8'], sea: ['#86c4dc', '#4f98bd'], map: { x: 700, y: 92 },
  },
  // Yunanistan: hikâye bitince feribotla
  midilli: {
    name: 'Midilli', country: 'gr', geo: [26.55, 39.1], traffic: 17,
    demand: { siir: 3, roman: 2, tarih: 2, cocuk: 1, polisiye: 1, fantastik: 1 },
    blurb: 'Ayvalık\'ın tam karşısı: zeytinlikler, taş kale, sabah balıkçıları. İki kıyının kitapları burada buluşur.',
    sky: ['#f6c4b0', '#fde6d4'], sea: ['#8fd0dc', '#5aaac4'],
  },
  atina: {
    name: 'Atina', country: 'gr', geo: [23.73, 37.98], traffic: 28,
    demand: { tarih: 3, roman: 2, polisiye: 2, siir: 2, fantastik: 1, cocuk: 1 },
    blurb: 'Akropolis\'in gölgesinde kalabalık bir şehir. Felsefe öğrencileri, turistler, tiyatrocular; herkes bir şey arar.',
    sky: ['#f4d2b0', '#fff0dc'], sea: ['#94cfe0', '#5aa2c8'],
  },
  selanik: {
    name: 'Selanik', country: 'gr', geo: [22.94, 40.64], traffic: 24,
    demand: { roman: 3, polisiye: 2, tarih: 2, siir: 2, cocuk: 1, fantastik: 1 },
    blurb: 'Beyaz Kule, uzun bir kordon, eski çarşılar. Atatürk\'ün doğduğu ev de burada; Türkçe bilen çok.',
    sky: ['#f2c8c0', '#fde8dc'], sea: ['#8ac8dc', '#5598c0'],
  },
  santorini: {
    name: 'Santorini', country: 'gr', geo: [25.43, 36.42], traffic: 22,
    demand: { siir: 3, fantastik: 2, roman: 2, cocuk: 1, tarih: 1, polisiye: 1 },
    blurb: 'Volkanın yarım ay kıyısı: uçurumda beyaz evler, mavi kubbeler, dünyanın en ünlü gün batımı.',
    sky: ['#f7b8a8', '#fde0d0'], sea: ['#6fb9d8', '#3f8fc0'],
  },
};
export const TOWN_KEYS = Object.keys(TOWNS);
// oyunun başında açık olan kasabalar
export const START_TOWNS = TOWN_KEYS.filter(k => !TOWNS[k].unlock && (TOWNS[k].country || 'tr') === 'tr');
