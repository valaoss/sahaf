// Müşteri tipleri: kim olduğu; ne sevdiği, nasıl konuştuğu, nerede ve ne zaman sık görüldüğü.
// genres: tür çarpanı (kasaba zevkiyle çarpılır) · likes: öneri isterken öne çıkan etiketler
// voice: konuşma üslubu (data/asks.js) · ask: öneri isteme çarpanı · style: görünüş (render/people.js personSVG)
// thrift: fiyata duyarlılık (data/balance.js priceTags): tight pahalıdan kaçar, loose fiyata bakmaz; yazılmayan mid
// where: mekân sahnesine göre ağırlık · when: mevsime göre ağırlık
export const ARCHETYPES = {
  ogrenci: {
    name: 'Öğrenci', thrift: 'tight', weight: 10, voice: 'genc', ask: 1.2,
    genres: { roman: 1.3, fantastik: 1.4, siir: 1.2 }, likes: ['felsefe', 'ask', 'yalniz', 'buyu'],
    style: { hat: 0, age: 'adult' }, where: { carsi: 1.3 }, when: { 'Yaz': 0.6 },
  },
  emekli: {
    name: 'Emekli öğretmen', thrift: 'tight', weight: 8, voice: 'resmi', ask: 1.3,
    genres: { tarih: 1.6, roman: 1.3 }, likes: ['savas', 'aile', 'felsefe', 'sehir'],
    style: { hair: '#dcdcdc', glasses: true }, where: { tepe: 1.4 }, when: { 'Kış': 1.4 },
  },
  balikci: {
    name: 'Balıkçı', weight: 6, voice: 'samimi', ask: 0.9,
    genres: { roman: 1.3, tarih: 1.3 }, likes: ['deniz', 'macera', 'yalniz'],
    style: { hat: 1, hatC: '#5b8bd0', beard: true, coat: '#6fb1d6' }, where: { sahil: 2.2, carsi: 0.5 }, when: {},
  },
  turist: {
    name: 'Turist', thrift: 'loose', weight: 8, voice: 'turist', ask: 0.9,
    genres: { polisiye: 1.4, roman: 1.2 }, likes: ['yolculuk', 'sehir', 'komik', 'macera'],
    style: { hat: 2, hatC: '#f2c45a' }, where: { carsi: 1.5, sahil: 1.3 }, when: { 'Yaz': 2.5, 'Kış': 0.2 },
  },
  anne: {
    name: 'Çocuklu anne', thrift: 'tight', weight: 7, voice: 'samimi', ask: 1.1,
    genres: { cocuk: 2.6 }, likes: ['cocukluk', 'hayvan', 'komik', 'buyu', 'aile'],
    style: { long: true, age: 'adult' }, where: { sahil: 1.2, carsi: 1.2 }, when: { 'Yaz': 1.3 },
  },
  cocuk: {
    name: 'Çocuk', thrift: 'tight', weight: 5, voice: 'cocuk', ask: 0.9,
    genres: { cocuk: 2.2, fantastik: 1.5 }, likes: ['buyu', 'hayvan', 'komik', 'macera'],
    style: { tall: 0.82, hat: 0 }, where: { sahil: 1.3 }, when: { 'Yaz': 1.5 },
  },
  sevgili: {
    name: 'Genç âşık', weight: 6, voice: 'genc', ask: 1.3,
    genres: { siir: 1.8, roman: 1.3 }, likes: ['ask', 'umut', 'huzun'],
    style: { age: 'adult' }, where: { tepe: 1.5, sahil: 1.2 }, when: { 'İlkbahar': 1.6 },
  },
  yazar: {
    name: 'Yazar adayı', weight: 4, voice: 'resmi', ask: 1.6,
    genres: { roman: 1.4, siir: 1.3 }, likes: ['felsefe', 'yalniz', 'sehir', 'gizem'],
    style: { glasses: true, hat: 1, hatC: '#3d2b24' }, where: { tepe: 1.6 }, when: { 'Sonbahar': 1.5 },
  },
  koleksiyoncu: {
    name: 'Kitap koleksiyoncusu', thrift: 'loose', weight: 3, voice: 'resmi', ask: 1.8, collector: true,
    genres: { tarih: 1.3, roman: 1.3 }, likes: ['felsefe', 'savas', 'yolculuk', 'gizem'],
    style: { glasses: true, hat: 1, hatC: '#8a5a3c', coat: '#4d5d82' }, where: { carsi: 1.2 }, when: {},
  },
  teyze: {
    name: 'Yaşlı teyze', thrift: 'tight', weight: 6, voice: 'samimi', ask: 1.2,
    genres: { roman: 1.4, siir: 1.2, cocuk: 1.2 }, likes: ['aile', 'ask', 'huzun', 'umut'],
    style: { hair: '#c8c8c8', long: true, hat: 0, coat: '#b98ad6' }, where: { carsi: 1.2 }, when: { 'Kış': 1.3 },
  },
  sorfcu: {
    name: 'Sörfçü', weight: 4, voice: 'genc', ask: 0.9,
    genres: { fantastik: 1.5, polisiye: 1.2 }, likes: ['macera', 'deniz', 'umut'],
    style: { coat: '#6fb1d6', hat: 0, age: 'adult' }, where: { sahil: 2, carsi: 0.4, tepe: 0.5 }, when: { 'Yaz': 2, 'Kış': 0.3 },
  },
};
export const DEFAULT_NAMES = ['Deniz', 'Elif', 'Mert', 'Zeynep', 'Can', 'Ayşe', 'Emre', 'Selin', 'Kerem', 'Defne', 'Ali', 'Nehir', 'Barış', 'Ece', 'Umut', 'Lale', 'Oya', 'Kaan'];
// müşterinin adı: görünüş tohumundan, tipinin isim listesinden
export const nameOf = (look, names = DEFAULT_NAMES) => names[look % names.length];

// Görünüşe uyan isimler (verilmeyen tipler genel listeden alır)
const NAMES = {
  balikci: ['Rıza Reis', 'Hüseyin Reis', 'Cemal Reis', 'Yaşar Reis', 'İsmail Reis'],
  teyze: ['Nazmiye Teyze', 'Saadet Teyze', 'Fikriye Teyze', 'Hatice Teyze', 'Gülsüm Teyze'],
  anne: ['Elif', 'Ayşe', 'Selin', 'Derya', 'Pınar', 'Gamze'],
  koleksiyoncu: ['Necdet Bey', 'Suna Hanım', 'Kemal Bey', 'Leyla Hanım', 'Orhan Bey'],
  emekli: ['Hikmet Hoca', 'Nevin Hanım', 'Sabri Hoca', 'Meral Hanım', 'Turgut Hoca'],
  turist: ['Anna', 'Lukas', 'Sophie', 'Marco', 'Emma', 'Hans', 'Chloé'],
  cocuk: ['Ege', 'Duru', 'Arda', 'Nil', 'Kuzey', 'Mira'],
};
for (const k in NAMES) ARCHETYPES[k].names = NAMES[k];

export const ARCH_KEYS = Object.keys(ARCHETYPES);
