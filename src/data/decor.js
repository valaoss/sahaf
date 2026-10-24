// Süs eşyaları: üç yuva (çatı, masa, yer), her yuvaya bir eşya. Etkiler kalıcı değil, takılı olduğu sürece.
// effect: demand {tür: çarpan} · traffic (+ziyaretçi/gün) · tip (+bahşiş, öneride) · patience (bekleme çarpanı)
export const SLOTS = {
  roof:   { name: 'Çatı' },
  table:  { name: 'Sergi masası' },
  ground: { name: 'Kaldırım' },
};

export const DECOR = {
  kaktus:     { slot: 'roof',   name: 'Kaktüs',          icon: '🌵', price: 0,  effect: {}, desc: 'Karavanın ilk süsü.' },
  bayrak:     { slot: 'roof',   name: 'Flama dizisi',     icon: '🎏', price: 80, effect: { traffic: 2 }, desc: 'Uzaktan görünür: günde +2 ziyaretçi.' },
  firildak:   { slot: 'roof',   name: 'Rüzgâr gülü',      icon: '🎐', price: 150, effect: { traffic: 3, patience: 1.2 }, desc: '+3 ziyaretçi, müşteriler biraz daha sabırlı.' },

  bos:        { slot: 'table',  name: 'Boş masa',         icon: '🪵', price: 0,  effect: {}, desc: 'Sade bir masa.' },
  ayicik:     { slot: 'table',  name: 'Oyuncak ayı',      icon: '🧸', price: 70, effect: { demand: { cocuk: 1.6 } }, desc: 'Çocuk kitabı arayan artar.' },
  buyutec:    { slot: 'table',  name: 'Büyüteç ve şapka', icon: '🔍', price: 70, effect: { demand: { polisiye: 1.6 } }, desc: 'Polisiye meraklıları uğrar.' },
  ejderha:    { slot: 'table',  name: 'Ejderha figürü',   icon: '🐉', price: 90, effect: { demand: { fantastik: 1.6 } }, desc: 'Fantastik okurları çeker.' },
  harita:     { slot: 'table',  name: 'Eski harita',      icon: '🗺️', price: 90, effect: { demand: { tarih: 1.6 } }, desc: 'Tarih sevenlerin gözü takılır.' },
  mum:        { slot: 'table',  name: 'Mum ve gül',       icon: '🕯️', price: 80, effect: { demand: { roman: 1.4, siir: 1.4 } }, desc: 'Roman ve şiir arayan artar.' },
  demlik:     { slot: 'table',  name: 'Çay demliği',      icon: '🫖', price: 110, effect: { tip: 2, patience: 1.5 }, desc: 'Öneri bekleyenler sabırlı, bahşiş +₺2.' },

  // hediyeler: satın alınmaz, müdavimler 5 kalpte verir
  zeytin:     { slot: 'roof',   name: 'Zeytin dalı çelengi', icon: '🫒', price: 0, gift: 'hasan', effect: { traffic: 2, demand: { roman: 1.2 } }, desc: 'Hasan Usta\'nın hediyesi: +2 ziyaretçi, roman arayan artar.' },
  degirmen:   { slot: 'roof',   name: 'Minik yel değirmeni', icon: '🌬️', price: 0, gift: 'zeynep', effect: { traffic: 3, patience: 1.2 }, desc: 'Zeynep\'in hediyesi: +3 ziyaretçi, sabırlı müşteriler.' },
  kabuk:      { slot: 'table',  name: 'Deniz kabuğu kavanozu', icon: '🐚', price: 0, gift: 'ruya', effect: { tip: 2, demand: { siir: 1.3 } }, desc: 'Rüya\'nın hediyesi: bahşiş +₺2, şiir arayan artar.' },
  kostas:     { slot: 'roof',   name: "Kostas'ın feneri", icon: '🏮', price: 0, gift: 'story', effect: { traffic: 3, tip: 2, patience: 1.3 }, desc: 'Kayıp kütüphanenin kapısındaki fener: +3 ziyaretçi, bahşiş +₺2, sabırlı müşteriler.' },
  fok:        { slot: 'ground', name: 'Fok heykelciği', icon: '🦭', price: 0, gift: 'nuri', effect: { traffic: 2, demand: { cocuk: 1.3 } }, desc: 'Kaptan Nuri\'nin hediyesi: +2 ziyaretçi, çocuklu aileler uğrar.' },

  saksi:      { slot: 'ground', name: 'Papatya saksısı',  icon: '🌼', price: 0,  effect: {}, desc: 'Kaldırımda neşeli bir saksı.' },
  askida:     { slot: 'ground', name: 'Askıda kitap kutusu', icon: '📮', price: 110, effect: { traffic: 2, tip: 1 }, desc: '+2 ziyaretçi, bahşiş +₺1.' },
  lamba:      { slot: 'ground', name: 'Sokak lambası',    icon: '🏮', price: 140, effect: { traffic: 3 }, desc: 'Akşamüstü de uğrayan olur: +3 ziyaretçi.' },
};
export const DECOR_KEYS = Object.keys(DECOR);
export const DEFAULT_DECOR = { roof: 'kaktus', table: 'bos', ground: 'saksi' };

// Satış araçları ve karavan geliştirmeleri (Atölye). upkeep: tezgâh kirasına eklenen günlük gider
export const UPGRADES = {
  paket: { name: 'Paket köşesi', icon: '🎁', price: 160, desc: 'Kitabı kâğıda sarıp not iliştirirsin: hediye arayanlara 🎁 söz açılır.' },
  cay:  { name: 'Çay köşesi', icon: '🫖', price: 240, upkeep: 2, desc: 'Bekleyenler daha sabırlı (×1.3); müşteriler arada bir çay alır (₺3).' },
  fener: { name: 'Akşam feneri', icon: '🪔', price: 260, upkeep: 2, desc: 'Dükkân bir saat geç kapanır: akşamüstü gezenler de uğrar (+%15 ziyaretçi).' },
  cirak: { name: 'Çırak', icon: '🧒', price: 450, upkeep: 6, desc: 'Eşiğin üstündeki teklifleri senin yerine kabul eder; sen ilginç pazarlıklara girersin.' },
  koltuk: { name: 'Okuma koltuğu', icon: '🛋️', price: 300, desc: 'Sabahları bir kitap daha okursun (günde 3): etiketleri açılır.' },
  plak: { name: 'Plak çalar', icon: '📻', price: 180, desc: 'Müzik temaları açılır: Akustik, Caz, Ninni (⚙️ Ayarlar).' },
};

// Araba basamakları (v3 Faz 3; S.shelfLv sırası, 0 başlangıç): raf kapasitesi, fiyat, kalabalığa katkı (yeni araba merak edilir)
export const SHELF_LEVELS = [
  { name: 'Kitap el arabası', icon: '🛒', cap: 18, price: 0, traffic: 0 },
  { name: 'Kitap arabası', icon: '🛺', cap: 30, price: 350, traffic: 2 },
  { name: 'Büyük kitap arabası', icon: '🚚', cap: 40, price: 800, traffic: 4 },
  { name: 'Kitap karavanı', icon: '🚐', cap: 50, price: 1600, traffic: 6 },
];

// Tente renkleri (v3 Faz 5): a/b şeritler, edge saçak çıtası
export const AWNINGS = {
  mercan:  { name: 'Mercan',  price: 0,  a: '#f4a09c', b: '#fff4e6', edge: '#e57f73' },
  deniz:   { name: 'Deniz',   price: 60, a: '#93bfe4', b: '#fff4e6', edge: '#5b8bd0' },
  limon:   { name: 'Limon',   price: 60, a: '#f6d47a', b: '#fff4e6', edge: '#d9a93c' },
  zeytin:  { name: 'Zeytin',  price: 60, a: '#a9c48a', b: '#fff4e6', edge: '#7f9c5a' },
  lavanta: { name: 'Lavanta', price: 60, a: '#c8b2e6', b: '#fff4e6', edge: '#8f74bd' },
};

// Karavan boyaları: gövde, kenar, alt bant
export const PAINTS = {
  nane:   { name: 'Nane',   price: 0,  body: '#9fd8c4', edge: '#5ea592', band: '#87c7b2', shine: '#c3ebdd' },
  pembe:  { name: 'Pembe',  price: 120, body: '#f7b9c4', edge: '#d67a8c', band: '#eea3b1', shine: '#fbd9df' },
  limon:  { name: 'Limon',  price: 120, body: '#f8dc87', edge: '#d1a73c', band: '#efcc6a', shine: '#fcebb6' },
  deniz:  { name: 'Deniz',  price: 120, body: '#9cc9ec', edge: '#5b8fbf', band: '#86b7de', shine: '#c7e2f6' },
  lavanta:{ name: 'Lavanta', price: 120, body: '#cdb8ea', edge: '#8f74bd', band: '#bca4df', shine: '#e3d6f4' },
};
