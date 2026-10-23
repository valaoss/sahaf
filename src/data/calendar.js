// Hava ve etkinlikler: her gün için sabit (gün numarasından türetilir), böylece gazete yarını da yazabilir.
// traffic / ask: çarpan · demand: tür çarpanları. Etkinlik yalnızca kendi kasabasında geçerlidir.
// Havanın gelme ihtimali mevsime bağlı (SEASON.weather).
export const WEATHER = {
  gunesli: { name: 'Güneşli', icon: '☀️', traffic: 1,    ask: 1,   note: 'Sokaklar kalabalık olur.' },
  bulutlu: { name: 'Bulutlu', icon: '⛅', traffic: 0.95, ask: 1.1, note: 'Serin bir gün; insanlar biraz daha oyalanır.' },
  yagmurlu: { name: 'Yağmurlu', icon: '🌧️', traffic: 0.7,  ask: 1.5, note: 'Az kişi çıkar ama gelenler sohbet etmek ister.' },
  ruzgarli: { name: 'Rüzgârlı', icon: '🌬️', traffic: 0.9,  ask: 1,   note: 'Sahiller boşalır, şiir okuru artar.', demand: { siir: 1.3 } },
};

// Mevsimler: hava olasılıkları (ağırlık) ve kalabalık. Yazın tatilci çok, kışın az kişi ama sohbet çok.
export const SEASON = {
  'İlkbahar': { weather: { gunesli: 50, bulutlu: 25, yagmurlu: 15, ruzgarli: 10 }, traffic: 1,    ask: 1,    note: 'Begonviller açtı.' },
  'Yaz':      { weather: { gunesli: 72, bulutlu: 10, yagmurlu: 4,  ruzgarli: 14 }, traffic: 1.15, ask: 0.9,  note: 'Tatilciler geldi, kasabalar kalabalık.' },
  'Sonbahar': { weather: { gunesli: 40, bulutlu: 30, yagmurlu: 20, ruzgarli: 10 }, traffic: 0.95, ask: 1.1,  note: 'Yapraklar sararıyor, okuma mevsimi.' },
  'Kış':      { weather: { gunesli: 25, bulutlu: 30, yagmurlu: 35, ruzgarli: 10 }, traffic: 0.8,  ask: 1.3,  note: 'Sokaklar sakin; gelenler uzun uzun sohbet ediyor.' },
};

// Özel günler: mevsimin belli bir gününde bütün kasabalarda (dayOfSeason). arch: müşteri tipi çarpanı, rare: ilk baskı çarpanı
export const SPECIAL = {
  'İlkbahar': {
    3: { id: 'cocukbayrami', name: '23 Nisan Çocuk Bayramı', icon: '🎈', traffic: 1.3, ask: 1, demand: { cocuk: 2 }, arch: { cocuk: 3, anne: 2 },
      note: 'Bayram! Çocuklar sokakta, masal kitapları kapış kapış.' },
    6: { id: 'hidirellez', name: 'Hıdırellez', icon: '🌹', traffic: 1.25, ask: 1.3, demand: { siir: 1.6 }, arch: { sevgili: 3 },
      note: 'Dilekler gül dallarına asılıyor; âşıklar şiir kitabı arıyor.' },
  },
  'Yaz': {
    4: { id: 'kitapfuari', name: 'Ege Kitap Fuarı', icon: '📚', traffic: 1.35, ask: 1.2, demand: {}, arch: { koleksiyoncu: 4, yazar: 2 }, rare: 3,
      note: 'Fuar haftası: koleksiyoncular kasabalarda, kolilerden ilk baskı çıkma ihtimali üç kat.' },
  },
  'Sonbahar': {
    2: { id: 'okullar', name: 'Okullar açıldı', icon: '🎒', traffic: 1.15, ask: 1.1, demand: { cocuk: 1.6, tarih: 1.2 }, arch: { ogrenci: 3, anne: 1.5 },
      note: 'Defterler, kalemler ve tabii kitaplar: öğrenciler yolda.' },
  },
  'Kış': {
    7: { id: 'yilbasi', name: 'Yılbaşı', icon: '🎄', traffic: 1.4, ask: 1.1, demand: { roman: 1.3, cocuk: 1.3 }, arch: { teyze: 2 }, tip: 3,
      note: 'Hediye telaşı! Kitap en güzel hediye; bahşişler de cömert.' },
  },
};

export const EVENTS = {
  zeytin:  { town: 'ayvalik', name: 'Zeytinyağı Festivali', traffic: 1.5, ask: 1, demand: { roman: 1.3, tarih: 1.3 },
    note: 'Bütün bölge zeytin tadımına geliyor. Kalabalık büyük, eski usul roman ve tarih kitapları ilgi görür.' },
  sergi:   { town: 'cunda', name: 'Ada Resim Sergisi', traffic: 1.4, ask: 1.5, demand: { siir: 1.5 },
    note: 'Ressamlar sokağa iniyor. Şiir okuru çok, herkes sohbete hazır.' },
  fokgunu: { town: 'foca', name: 'Fok Gözlem Günü', traffic: 1.5, ask: 1, demand: { cocuk: 1.6, fantastik: 1.2 },
    note: 'Okullar Foça\'ya gezi düzenledi. Çocuk kitapları kapışılır.' },
  kumsal:  { town: 'dikili', name: 'Kumsal Kitap Şenliği', traffic: 1.5, ask: 1, demand: { cocuk: 1.5, polisiye: 1.2 },
    note: 'Kumsala şemsiyeler ve kitap sepetleri kuruldu. Aileler ve çocuklar akın akın geliyor.' },
  bagbozumu: { town: 'urla', name: 'Bağbozumu', traffic: 1.5, ask: 1.2, demand: { siir: 1.4, roman: 1.2 },
    note: 'Bağlarda üzüm toplanıyor, atölyeler kapılarını açıyor. Şiir ve roman okurları sokakta.' },
  tapinak: { town: 'assos', name: 'Tapınakta Gün Batımı', traffic: 1.4, ask: 1.5, demand: { tarih: 1.5, siir: 1.2 },
    note: 'Herkes Athena tapınağına güneşin Midilli\'nin ardına batışını izlemeye çıkıyor.' },
  sahaflar: { town: 'istanbul', name: 'Sahaflar Şenliği', traffic: 1.6, ask: 1.4, demand: { tarih: 1.4, siir: 1.3 },
    note: 'Beyazıt\'ta sahaflar tezgâhlarını sokağa taşıdı. İmza masaları, eski kitap avcıları.' },
  balon: { town: 'kapadokya', name: 'Balon Festivali', traffic: 1.6, ask: 1, demand: { fantastik: 1.5, cocuk: 1.3 },
    note: 'Yüzlerce balon aynı sabah havalanıyor. Vadiler turist dolu.' },
  kitapfuari_gr: { town: 'atina', name: 'Atina Kitap Fuarı', traffic: 1.6, ask: 1.2, demand: { tarih: 1.4, roman: 1.2 },
    note: 'Zappeion bahçesinde yüzlerce kitap tezgâhı. Atina\'nın bütün okurları sokakta.' },
  otfest:  { town: 'alacati', name: 'Ot Festivali', traffic: 1.6, ask: 0.9, demand: { polisiye: 1.3, cocuk: 1.2 },
    note: 'Tezgâhlar, müzik, kalabalık. Tatilciler hafif okumalık arıyor.' },
};
export const EVENT_CHANCE = 0.35;

// Gazetenin köşe yazıları: süs, havadan sudan
export const GOSSIP = [
  'Martılar iskeledeki simitçinin tezgâhını yine bastı.',
  'Kasabanın en yaşlı kedisi Pamuk, belediyeden "onursal sakin" belgesi aldı.',
  'Kahvede tavla turnuvası: şampiyon yine emekli postacı Ramiz Bey.',
  'Bu yıl incirler erken olgunlaştı, pazarda kilosu düştü.',
  'Fırıncı Mehmet, sahafın önünden geçerken her sabah bir kitap kapağına göz atıyormuş.',
  'Alaçatı\'da rüzgâr sörfçüleri yeni bir okul açtı.',
  'Cunda\'da bir ressam, sahaf karavanını tuvaline koymuş.',
  'Foça\'da balıkçılar fokların bu yıl kalabalık olduğunu söylüyor.',
  'Ayvalık\'ın tostçuları "en iyi tost" yarışmasında yine anlaşamadı.',
  'Belediye kütüphanesi hafta sonları çocuklara masal saati düzenliyor.',
];
