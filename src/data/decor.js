// Süs eşyaları: üç yuva (çatı, masa, yer), her yuvaya bir eşya. Etkiler kalıcı değil, takılı olduğu sürece.
// effect: demand {tür: çarpan} · traffic (+ziyaretçi/gün) · tip (+bahşiş, öneride) · patience (bekleme çarpanı)
export const SLOTS = {
  roof:   { name: 'Çatı' },
  table:  { name: 'Sergi masası' },
  ground: { name: 'Kaldırım' },
};

export const DECOR = {
  kaktus:     { slot: 'roof',   name: 'Kaktüs',          icon: '🌵', price: 0,  effect: {}, desc: 'Karavanın ilk süsü.' },
  bayrak:     { slot: 'roof',   name: 'Flama dizisi',     icon: '🎏', price: 40, effect: { traffic: 2 }, desc: 'Uzaktan görünür: günde +2 ziyaretçi.' },
  firildak:   { slot: 'roof',   name: 'Rüzgâr gülü',      icon: '🎐', price: 75, effect: { traffic: 3, patience: 1.2 }, desc: '+3 ziyaretçi, müşteriler biraz daha sabırlı.' },

  bos:        { slot: 'table',  name: 'Boş masa',         icon: '🪵', price: 0,  effect: {}, desc: 'Sade bir masa.' },
  ayicik:     { slot: 'table',  name: 'Oyuncak ayı',      icon: '🧸', price: 35, effect: { demand: { cocuk: 1.6 } }, desc: 'Çocuk kitabı arayan artar.' },
  buyutec:    { slot: 'table',  name: 'Büyüteç ve şapka', icon: '🔍', price: 35, effect: { demand: { polisiye: 1.6 } }, desc: 'Polisiye meraklıları uğrar.' },
  ejderha:    { slot: 'table',  name: 'Ejderha figürü',   icon: '🐉', price: 45, effect: { demand: { fantastik: 1.6 } }, desc: 'Fantastik okurları çeker.' },
  harita:     { slot: 'table',  name: 'Eski harita',      icon: '🗺️', price: 45, effect: { demand: { tarih: 1.6 } }, desc: 'Tarih sevenlerin gözü takılır.' },
  mum:        { slot: 'table',  name: 'Mum ve gül',       icon: '🕯️', price: 40, effect: { demand: { roman: 1.4, siir: 1.4 } }, desc: 'Roman ve şiir arayan artar.' },
  demlik:     { slot: 'table',  name: 'Çay demliği',      icon: '🫖', price: 55, effect: { tip: 2, patience: 1.5 }, desc: 'Öneri bekleyenler sabırlı, bahşiş +₺2.' },

  // hediyeler: satın alınmaz, müdavimler 5 kalpte verir
  zeytin:     { slot: 'roof',   name: 'Zeytin dalı çelengi', icon: '🫒', price: 0, gift: 'hasan', effect: { traffic: 2, demand: { roman: 1.2 } }, desc: 'Hasan Usta\'nın hediyesi: +2 ziyaretçi, roman arayan artar.' },
  degirmen:   { slot: 'roof',   name: 'Minik yel değirmeni', icon: '🌬️', price: 0, gift: 'zeynep', effect: { traffic: 3, patience: 1.2 }, desc: 'Zeynep\'in hediyesi: +3 ziyaretçi, sabırlı müşteriler.' },
  kabuk:      { slot: 'table',  name: 'Deniz kabuğu kavanozu', icon: '🐚', price: 0, gift: 'ruya', effect: { tip: 2, demand: { siir: 1.3 } }, desc: 'Rüya\'nın hediyesi: bahşiş +₺2, şiir arayan artar.' },
  kostas:     { slot: 'roof',   name: "Kostas'ın feneri", icon: '🏮', price: 0, gift: 'story', effect: { traffic: 3, tip: 2, patience: 1.3 }, desc: 'Kayıp kütüphanenin kapısındaki fener: +3 ziyaretçi, bahşiş +₺2, sabırlı müşteriler.' },
  fok:        { slot: 'ground', name: 'Fok heykelciği', icon: '🦭', price: 0, gift: 'nuri', effect: { traffic: 2, demand: { cocuk: 1.3 } }, desc: 'Kaptan Nuri\'nin hediyesi: +2 ziyaretçi, çocuklu aileler uğrar.' },

  saksi:      { slot: 'ground', name: 'Papatya saksısı',  icon: '🌼', price: 0,  effect: {}, desc: 'Kaldırımda neşeli bir saksı.' },
  askida:     { slot: 'ground', name: 'Askıda kitap kutusu', icon: '📮', price: 55, effect: { traffic: 2, tip: 1 }, desc: '+2 ziyaretçi, bahşiş +₺1.' },
  lamba:      { slot: 'ground', name: 'Sokak lambası',    icon: '🏮', price: 70, effect: { traffic: 3 }, desc: 'Akşamüstü de uğrayan olur: +3 ziyaretçi.' },
};
export const DECOR_KEYS = Object.keys(DECOR);
export const DEFAULT_DECOR = { roof: 'kaktus', table: 'bos', ground: 'saksi' };

// Karavan geliştirmeleri
export const UPGRADES = {
  cay:  { name: 'Çay köşesi', icon: '🫖', price: 120, desc: 'Bekleyenler daha sabırlı (×1.3); müşteriler arada bir çay alır (₺3).' },
  plak: { name: 'Plak çalar', icon: '📻', price: 90, desc: 'Müzik temaları açılır: Akustik, Caz, Ninni (⚙️ Ayarlar).' },
};

// Raf kapasitesi yükseltmeleri (seviye 0 başlangıç)
export const SHELF_LEVELS = [
  { cap: 30, price: 0 },
  { cap: 40, price: 120 },
  { cap: 50, price: 260 },
];

// Karavan boyaları: gövde, kenar, alt bant
export const PAINTS = {
  nane:   { name: 'Nane',   price: 0,  body: '#9fd8c4', edge: '#5ea592', band: '#87c7b2', shine: '#c3ebdd' },
  pembe:  { name: 'Pembe',  price: 60, body: '#f7b9c4', edge: '#d67a8c', band: '#eea3b1', shine: '#fbd9df' },
  limon:  { name: 'Limon',  price: 60, body: '#f8dc87', edge: '#d1a73c', band: '#efcc6a', shine: '#fcebb6' },
  deniz:  { name: 'Deniz',  price: 60, body: '#9cc9ec', edge: '#5b8fbf', band: '#86b7de', shine: '#c7e2f6' },
  lavanta:{ name: 'Lavanta', price: 60, body: '#cdb8ea', edge: '#8f74bd', band: '#bca4df', shine: '#e3d6f4' },
};
