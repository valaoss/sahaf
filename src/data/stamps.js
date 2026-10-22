// Pul albümü: başarımlar. need: koşul türü ve eşiği (game/stamps.js) · color: pulun zemin rengi
export const STAMP_REWARD = 15;

export const STAMPS = [
  { id: 'ilkgun',    name: 'İlk gün',           icon: '🌅', color: '#fde4c4', need: { days: 1 },       desc: 'İlk günü kapat.' },
  { id: 'isabet',    name: 'İlk isabet',        icon: '🎯', color: '#f9d0c8', need: { perfect: 1 },    desc: 'Bir öneride tam isabet yakala.' },
  { id: 'elli',      name: 'Elli kitap',        icon: '📚', color: '#d7e9f7', need: { sold: 50 },      desc: 'Toplam 50 kitap sat.' },
  { id: 'kurt',      name: 'Kitap kurdu',       icon: '🐛', color: '#dff0d5', need: { sold: 300 },     desc: 'Toplam 300 kitap sat.' },
  { id: 'falci',     name: 'Kitap falcısı',     icon: '🔮', color: '#e8dcf6', need: { perfect: 25 },   desc: 'Önerilerde 25 kez tam isabet.' },
  { id: 'ege',       name: 'Ege turu',          icon: '🗺️', color: '#cfeee9', need: { towns: 4 },      desc: 'Dört kasabanın hepsinde dükkân aç.' },
  { id: 'kose',      name: 'Her köşe',          icon: '📍', color: '#fbe3ee', need: { spots: 9 },      desc: 'Dokuz mekânın hepsinde dükkân aç.' },
  { id: 'festival',  name: 'Festival ruhu',     icon: '🎉', color: '#fff0c2', need: { festivals: 1 },  desc: 'Bir festival günü o kasabada ol.' },
  { id: 'takvim',    name: 'Festival takvimi',  icon: '🎪', color: '#ffe0cc', need: { festKinds: 4 },  desc: 'Dört farklı festivalin hepsine katıl.' },
  { id: 'yagmur',    name: 'Yağmurda sahaf',    icon: '☔', color: '#dbe4f0', need: { rain: 1 },       desc: 'Yağmurlu bir günde dükkân aç.' },
  { id: 'dost',      name: 'Gerçek dost',       icon: '💛', color: '#fff3c9', need: { hearts: 5 },     desc: 'Bir müdavimle 5 kalbe ulaş.' },
  { id: 'hediyeler', name: 'Hediye kutusu',     icon: '🎁', color: '#f6dcd2', need: { gifts: 4 },      desc: 'Dört müdavimden hediye al.' },
  { id: 'susler',    name: 'Süs meraklısı',     icon: '🪴', color: '#e3f1d8', need: { decor: 8 },      desc: '8 süs eşyasına sahip ol.' },
  { id: 'raflar',    name: 'Dolu raflar',       icon: '🗄️', color: '#efe3d2', need: { shelfLv: 2 },    desc: 'Rafları en büyük hâline getir.' },
  { id: 'gokkusagi', name: 'Gökkuşağı karavan', icon: '🌈', color: '#f3e2f7', need: { paints: 5 },     desc: 'Beş boyanın hepsini al.' },
  { id: 'nadir',     name: 'İlk baskı',         icon: '✨', color: '#fff4c4', need: { rareSold: 1 },   desc: 'Bir koleksiyoncuya ilk baskı sat.' },
  { id: 'nadir5',    name: 'Nadir kitap avcısı', icon: '🗝️', color: '#f0e2c8', need: { rareSold: 5 },   desc: 'Beş ilk baskı sat.' },
  { id: 'kasa',      name: 'Dolu kasa',         icon: '💰', color: '#fdeec4', need: { coins: 1000 },   desc: 'Kasada ₺1000 biriktir.' },
  { id: 'yil',       name: 'Bir yıl',           icon: '🍂', color: '#f7e1c6', need: { days: 28 },      desc: 'Dört mevsimi tamamla (28 gün).' },
  { id: 'kutuphane', name: 'Kayıp kütüphane',   icon: '🏛️', color: '#e6dccb', need: { story: 1 },      desc: 'Kostas Efendi\'nin defterini tamamla.' },
];
