// Ekonomi ve gün ayarları: denge değişiklikleri buradan yapılır, `npm run sim` ile ölçülür
export const BAL = {
  startCoins: 60,
  startStock: { roman: 5, polisiye: 5, cocuk: 5 },
  boxSize: 5,          // bir kolide kaç kitap
  shelfCap: 30,        // karavan raflarına sığan kitap
  dayStart: 9 * 60,    // 09:00
  dayEnd: 18 * 60,     // 18:00
  buyChance: 0.85,     // aradığı tür raftaysa alma ihtimali
  extraChance: 0.2,    // aynı türden bir kitap daha alma ihtimali
  cheapExtra: 3,       // ucuz etiketin çektiği müşteride (alma isteği arttıysa) bu ihtimal kaç katına çıkar
  altChance: 0.3,      // aradığını bulamayınca başka bir şey alma ihtimali
  trafficJitter: 3,    // günlük ziyaretçi sayısı ± bu kadar oynar
  crateCap: 10,        // koli: rafa dizilmeyi bekleyen en fazla kitap
  tidyBonus: 0.15,     // raf düzeni %100 iken kalabalık bu kadar artar
  // raf bölümü fiyat etiketi: satış fiyatı çarpanı (mul) ve müşterinin cebine göre almaya karar verme çarpanı (chance).
  // tight: öğrenci, anne, çocuk, teyze, emekli (normal fiyatta bile tereddüt eder) · mid: çoğu
  // loose: turist, koleksiyoncu (ucuz kitaba güvenmez, pahalıyı kaliteli sanar) · data/archetypes.js thrift
  priceTags: {
    ucuz: { mul: 0.8, chance: { tight: 1.25, mid: 1.1, loose: 0.85 } },
    normal: { mul: 1, chance: { tight: 0.85, mid: 1, loose: 1 } },
    pahali: { mul: 1.2, chance: { tight: 0.3, mid: 0.7, loose: 1.2 } },
  },
  // giderler (gün kapanınca ödenir): park = kasabanın kalabalığı × mekânın kalabalığı × parkRate;
  // takılı her süsün bakımı fiyatının 1/upkeepPer'i (yukarı yuvarlanır); geliştirmelerin kendi gideri (data/decor.js UPGRADES.upkeep)
  parkRate: 0.6,
  upkeepPer: 30,
  // tür doygunluğu: bir kasabada çok satılan türü arayan azalır, her sabah satilan × satDecay'e iner
  satDecay: 0.7,
  satScale: 10,        // talep çarpanı 1 / (1 + satılan / satScale)
  // fiyat ünü: fiyatı yüzünden vazgeçen her müşteri ertesi gün o kasabanın kalabalığını bu kadar azaltır,
  // ucuz etiketle ikna olan her müşteri artırır (sınırlar: wordMin–wordMax)
  wordOfMouth: 0.03, wordMin: 0.75, wordMax: 1.15,
  // kasabaya okuma köşesi bağışı: o kasabada park ücretsiz, kalabalık kalıcı olarak artar
  donateCost: 250,
  donateTraffic: 1.12,
  // festival sponsorluğu: o gün o kasabada dükkân açarsan kalabalık artar
  sponsorCost: 60,
  sponsorTraffic: 1.6,
  // kitabın durumu: satış ve tezgâh alış çarpanı, tezgâhta çıkma ağırlığı
  conds: { yipranmis: { sell: 0.7, buy: 0.5, w: 3 }, iyi: { sell: 1, buy: 1, w: 5 }, temiz: { sell: 1.3, buy: 1.6, w: 2 } },
  stallSize: 9,        // pazar tezgâhında her sabah bu kadar kitap
  stallRare: 0.08,     // tezgâhta ilk baskı olasılığı
  talkMinutes: 10,     // "Biraz daha anlat" sohbeti saati bu kadar ilerletir
  teaTip: 3,           // çay ikram edilen müşteri, alırsa bu kadar fazla bahşiş bırakır
  discount: 0.7,       // indirim: uymayan öneri yine de bu fiyat oranıyla satılır
  travelCost: 6,       // kasabalar arası yakıt (en az)
  roadPerDeg: 4,       // uzak şehirlere yakıt: kuş uçuşu her derece için
  ferryMin: 30, ferryMax: 90, ferryPerDeg: 6,   // başka ülkeye feribot bileti
  newTownTraffic: 5,   // dün başka kasabadaydıysan: yeni karavanı merak eden ek ziyaretçi
  askChance: 0.2,      // müşterinin öneri isteme ihtimali
  askFromShelf: 0.6,   // isteğin raftaki bir kitaptan doğma ihtimali (kalanı tüm katalogdan)
  rareChance: 0.05,    // kolideki her kitabın ilk baskı çıkma ihtimali
  rareMul: 5,          // ilk baskı koleksiyoncuya kaç katına satılır
  tipPerfect: 5,       // istediği her şeye uyan öneri: bahşiş
  tipGood: 1,          // kısmen uyan öneri: bahşiş
  hapChance: 0.55,     // bir günde en az bir olay çıkma ihtimali
  letterChance: 0.35,  // sabah mektup gelme ihtimali (bekleyen tam isabet varsa)
  questChance: 0.4,    // aktif ilan yokken sabah yeni ilan çıkma ihtimali
  teaChance: 0.15,     // çay köşesi varken müşterinin çay alma ihtimali
  teaPrice: 3,
  featureMax: 3,       // vitrine sığan kitap
  featureBuy: 0.08,    // vitrinde aradığı türden kitap varsa alma ihtimaline eklenen
  featureDemand: 0.15, // vitrindeki her kitap kendi türüne olan ilgiyi bu kadar artırır
  patience: 14,        // öneri isteyen müşterinin bekleme süresi (sn, normal hızda)
  keepsakeTraffic: 1,
  // Akdeniz'in işleri (game/voyage.js)
  islandFee: 18,       // Yunanistan: adaya kayık (park ücreti yerine)
  islandTourists: 5,   // adada turist ağırlığı bu kadar kat (yakın zamanda gelen tip daha az olası olduğundan payı ~1,5 kat artar)
  auctionMin: 0.8, auctionSpread: 1.6,   // İtalya: müzayede, ilk baskı fiyatının 0.8–2.4 katı
  bqRent: 35, bqDays: 7, bqCap: 10,      // Fransa: bukinist kutusu (haftalık kira, süre, kapasite)
  rosePrice: 1, roseTip: 3, roseMax: 20, roseDayTraffic: 1.3,   // İspanya: gül ve kitap
  restoreCost: 5, restorePerDay: 4,      // Mısır: el yazması onarımı  // her hatıra kendi kasabasında bu kadar fazladan ziyaretçi
  favorPay: 3,         // getirilen rica: kitabın satış fiyatının bu katı ödenir
  readsPerDay: 2,      // okuma köşesi: sabahları okunabilen kitap (okuma koltuğuyla bir fazla)
  learnOnSale: 0.35,   // satılan kitabın bir etiketini öğrenme ihtimali (müşteri giderken bir şey söyler)
  // dolaylı istek: etiketin adını değil bir imgesini söyleme ihtimali (ilk günler az, oyun ilerledikçe artar)
  indirectBase: 0.15, indirectPerDay: 0.025, indirectMax: 0.65,
  daysPerSeason: 7,
};

export const SEASONS = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
