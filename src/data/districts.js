// Mürekkep Koyu (v3 Faz 6): oyunun tek kasabası, yedi mahalle. Motor her mahalleyi bir kasaba gibi işler
// (data/towns.js ve data/spots.js bunları içine alır); Ege kasabaları FEATURES.ege kapalıyken görünmez.
// traffic: kalabalık · demand: tür ağırlıkları · koy: mahalleye özgü alanlar
//   rent: günlük tezgâh kirası (en yüksek güvende dörtte biri düşer) · worth: kitaba biçilen değer çarpanı (pahalı etiketi kaldırır)
//   mix: müşteri tipi çarpanları · purse: cüzdan çarpanı · haggle: pazarlık eğilimi çarpanı
//   open: açılış koşulu (coins: tek seferlik bedel, rep: { mahalle: güven }, reps: { n, min } n mahallede en az min güven,
//         shelfLv: araba basamağı) · ev: mahalle olayı (every günde bir, at: kaçıncı gün; çarpanlar dayMods'a katılır)
//   x, y: Mürekkep Koyu haritasındaki yeri (render/koy-map.js)
// spot: mahallenin tek mekânı (scene: render/spot-art.js sahnesi)
export const DISTRICTS = {
  iskele: {
    name: 'İskele Boyu', country: 'tr', geo: [26.80, 38.90], traffic: 20,
    demand: { polisiye: 3, cocuk: 3, roman: 2, fantastik: 1, siir: 1, tarih: 1 },
    blurb: 'Taş kordon, ahşap iskele, martılar. Turistler, aileler ve balıkçılar; polisiye ve çocuk kitabı satar.',
    sky: ['#f8c3a4', '#fde2c2'], sea: ['#93d3cf', '#62b6be'],
    koy: { rent: 18, worth: 1, mix: { turist: 1.6, anne: 1.4, balikci: 1.8, cocuk: 1.3 }, purse: 1, haggle: 1, x: 640, y: 640,
      ev: { id: 'balik', name: 'Balıkçı Şenliği', icon: '🐟', every: 9, at: 4, traffic: 1.4, ask: 1, arch: { balikci: 2, turist: 1.6 }, demand: { polisiye: 1.3, cocuk: 1.3 },
        note: 'Tekneler bayraklarla süslendi; kordon kalabalık, çocuklar iskelede.' } },
    spot: { kordon: { name: 'Kordon', scene: 'kordon', traffic: 1, ask: 1, demand: {}, tags: ['deniz', 'macera'],
      desc: 'Taş kordon ve korkuluk; arkada koyun evleri.' } },
  },
  park: {
    name: 'Çınaraltı Parkı', country: 'tr', geo: [26.82, 38.92], traffic: 16,
    demand: { siir: 3, cocuk: 3, roman: 3, tarih: 1, polisiye: 1, fantastik: 1 },
    blurb: 'Dev çınarın gölgesinde havuz ve banklar. Emekliler, anneler, âşıklar; şiir, roman ve çocuk kitabı.',
    sky: ['#f6c6b4', '#fde6d2'], sea: ['#9ad7d2', '#6bbdc3'],
    koy: { rent: 20, worth: 1, mix: { emekli: 1.8, anne: 1.8, cocuk: 1.5, sevgili: 1.8, turist: 0.6 }, purse: 0.95, haggle: 0.8, x: 980, y: 560,
      open: { coins: 150, rep: { iskele: 20 } },
      ev: { id: 'konser', name: 'Çınaraltı Konseri', icon: '🎻', every: 7, at: 2, traffic: 1.35, ask: 1.3, arch: { sevgili: 2, emekli: 1.5 }, demand: { siir: 1.4 },
        note: 'Akşamüstü çınarın altında bir dörtlü çalıyor; banklar dolu, herkes oyalanıyor.' } },
    spot: { cinar: { name: 'Çınarın altı', scene: 'park', traffic: 1, ask: 1.3, demand: {}, tags: ['doga', 'ask'],
      desc: 'Havuz başı, gölgelik, kuş sesi. Öneri isteyen çok.' } },
  },
  okul: {
    name: 'Okul Yokuşu', country: 'tr', geo: [26.84, 38.94], traffic: 26,
    demand: { fantastik: 4, siir: 2, polisiye: 2, roman: 1, cocuk: 1, tarih: 1 },
    blurb: 'Taş merdivenler, bisikletler, afişler. Öğrenciler ve genç yazarlar: cepleri dar, sayıları çok.',
    sky: ['#f4c7b8', '#fbe5d6'], sea: ['#93d3cf', '#62b6be'],
    koy: { rent: 36, worth: 0.88, mix: { ogrenci: 3.5, yazar: 1.6, emekli: 0.5, koleksiyoncu: 0.4 }, purse: 0.75, haggle: 1.25, x: 1240, y: 420,
      open: { coins: 300 },
      ev: { id: 'donem', name: 'Dönem başı', icon: '🎒', every: 10, at: 1, traffic: 1.6, ask: 1, arch: { ogrenci: 3 }, demand: { fantastik: 1.4, siir: 1.2 },
        note: 'Okullar açıldı: yokuş öğrenci dolu, okuma listeleri ellerde.' } },
    spot: { yokus: { name: 'Merdiven başı', scene: 'yokus', traffic: 1, ask: 0.9, demand: {}, tags: ['buyu', 'macera'],
      desc: 'Okul çıkışı kalabalık, aceleci, meraklı.' } },
  },
  carsi: {
    name: 'Eski Çarşı', country: 'tr', geo: [26.86, 38.91], traffic: 30,
    demand: { roman: 2, polisiye: 2, cocuk: 2, tarih: 2, siir: 2, fantastik: 2 },
    blurb: 'Kemerli meydan, tezgâhlar, kalabalık. Her tür satar ama herkes pazarlık eder.',
    sky: ['#f7c9a0', '#fde4c4'], sea: ['#9ad7d2', '#6bbdc3'],
    koy: { rent: 64, worth: 1, mix: { teyze: 1.8, turist: 1.3, emekli: 1.2 }, purse: 1.05, haggle: 1.45, x: 920, y: 300,
      open: { coins: 500, reps: { n: 2, min: 40 } },
      ev: { id: 'pazar', name: 'Pazar kuruldu', icon: '🧺', every: 7, at: 6, traffic: 1.5, ask: 0.8, arch: { teyze: 2 }, demand: {},
        note: 'Meydanda haftalık pazar: sepetler, sesler, pazarlık. Kalabalık büyük, sabır kısa.' } },
    spot: { meydan: { name: 'Kemerli meydan', scene: 'carsi', traffic: 1, ask: 0.8, demand: {}, tags: ['sehir', 'aile'],
      desc: 'Tezgâhlar arasında bir köşe. Çok satış, çok pazarlık.' } },
  },
  boyaci: {
    name: 'Boyacılar Sokağı', country: 'tr', geo: [26.81, 38.95], traffic: 17,
    demand: { siir: 4, roman: 2, fantastik: 2, tarih: 1, polisiye: 1, cocuk: 1 },
    blurb: 'Renkli kepenkler, ressam şövaleleri, pencerede kediler. Sanatçılar ve tutkun okurlar; şiir ve ilk baskı.',
    sky: ['#f3bfc6', '#fde3dc'], sea: ['#9ad7d2', '#6bbdc3'],
    koy: { rent: 40, worth: 1.12, mix: { yazar: 3, sevgili: 1.4, koleksiyoncu: 1.5, turist: 0.7 }, purse: 1.15, haggle: 0.9, x: 520, y: 330,
      open: { shelfLv: 1 },
      ev: { id: 'sergi', name: 'Sokak sergisi', icon: '🎨', every: 8, at: 5, traffic: 1.3, ask: 1.5, arch: { yazar: 2 }, demand: { siir: 1.5 },
        note: 'Kepenkler tuval oldu; ressamlar sokakta, herkes sohbete hazır.' } },
    spot: { kepenk: { name: 'Kepenkler', scene: 'boyaci', traffic: 1, ask: 1.4, demand: {}, tags: ['ask', 'felsefe'],
      desc: 'Atölyelerin önü. Az ama meraklı müşteri.' } },
  },
  kosk: {
    name: 'Köşkler Sırtı', country: 'tr', geo: [26.88, 38.96], traffic: 13,
    demand: { tarih: 4, roman: 3, siir: 1, polisiye: 1, cocuk: 1, fantastik: 1 },
    blurb: 'Bahçeli köşkler, fener direkleri, sessizlik. Koleksiyoncular ve varlıklı okurlar: az kişi, dolu cüzdan.',
    sky: ['#e9cbb2', '#fbecd8'], sea: ['#93c9d6', '#64a9bf'],
    koy: { rent: 80, worth: 1.3, mix: { koleksiyoncu: 3, emekli: 1.5, ogrenci: 0.3, turist: 0.5, sorfcu: 0.3 }, purse: 1.7, haggle: 0.7, x: 1330, y: 210,
      open: { coins: 1200, rep: { carsi: 50 } },
      ev: { id: 'cay', name: 'Köşk bahçesinde kitap çayı', icon: '🫖', every: 12, at: 6, traffic: 1.3, ask: 1.4, arch: { koleksiyoncu: 2, emekli: 1.5 }, demand: { tarih: 1.4 },
        note: 'Bir köşkün bahçesinde kitap çayı var; konuklar dönüşte sahafa uğruyor.' } },
    spot: { bahce: { name: 'Köşk bahçeleri', scene: 'kosk', traffic: 1, ask: 1.3, demand: {}, tags: ['savas', 'gizem'],
      desc: 'Demir parmaklıklar, gül bahçeleri. Temiz ve nadir kitap aranır.' } },
  },
  fener: {
    name: 'Fener Burnu', country: 'tr', geo: [26.78, 38.97], traffic: 9,
    demand: { tarih: 2, roman: 2, siir: 2, fantastik: 2, polisiye: 1, cocuk: 1 },
    blurb: 'Deniz feneri ve rüzgâr. Haftada bir sahaf fuarı kurulur: koleksiyoncular ilk baskı peşinde.',
    sky: ['#f2bfae', '#fde0cc'], sea: ['#86c7d6', '#4f9fbd'],
    koy: { rent: 24, worth: 1.1, mix: { koleksiyoncu: 2, sorfcu: 2, anne: 0.5 }, purse: 1.25, haggle: 1, x: 260, y: 520,
      open: { shelfLv: 3 },
      ev: { id: 'fuar', name: 'Sahaf fuarı', icon: '📜', every: 7, at: 3, traffic: 3.2, ask: 1.2, arch: { koleksiyoncu: 4 }, rare: 3, demand: { tarih: 1.3 },
        note: 'Fenerin dibinde sahaf fuarı: koleksiyoncular ilk baskı arıyor, cüzdanlar açık.' } },
    spot: { burun: { name: 'Fenerin dibi', scene: 'fener', traffic: 1, ask: 1.2, demand: {}, tags: ['deniz', 'yolculuk'],
      desc: 'Rüzgârlı burun. Fuar günü dışında sakin.' } },
  },
};
export const DISTRICT_KEYS = Object.keys(DISTRICTS);

// Mahalle sahneleri (kordon, park…) kendi görsellerini bekliyor (docs/gorsel-promptlari.md); o zamana kadar
// çizim, ses ve müşteri cümleleri en yakın eski sahneyi kullanır
export const SCENE_BASE = { kordon: 'sahil', park: 'tepe', yokus: 'carsi', boyaci: 'carsi', kosk: 'tepe', fener: 'tepe' };
export const baseScene = s => SCENE_BASE[s] || s;

// Bugün bu mahallede olay var mı (gün numarasından sabit; yoksa null)
export function districtEvent(day, k) {
  const e = DISTRICTS[k]?.koy.ev;
  return e && day % e.every === e.at % e.every ? e : null;
}
export const START_DISTRICT = 'iskele';

// müdavimlerin Mürekkep Koyu'ndaki evleri (Ege kasabalarından taşınanlar; her mahallede iki)
export const KOY_HOMES = {
  hasan: 'iskele', nuri: 'iskele', ela: 'park', nine: 'park', melis: 'okul', orhan: 'okul', bora: 'carsi', riza: 'carsi',
  ruya: 'boyaci', leyla: 'boyaci', selim: 'kosk', cem: 'kosk', zeynep: 'fener', deniz: 'fener',
};
