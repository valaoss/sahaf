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
  altChance: 0.3,      // aradığını bulamayınca başka bir şey alma ihtimali
  trafficJitter: 3,    // günlük ziyaretçi sayısı ± bu kadar oynar
  crateCap: 10,        // koli: rafa dizilmeyi bekleyen en fazla kitap
  tidyBonus: 0.15,     // raf düzeni %100 iken kalabalık bu kadar artar
  // raf bölümü fiyat etiketi: satış fiyatı çarpanı (mul) ve almaya karar verme çarpanı (chance)
  priceTags: { ucuz: { mul: 0.8, chance: 1.15 }, normal: { mul: 1, chance: 1 }, pahali: { mul: 1.3, chance: 0.8 } },
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
  daysPerSeason: 7,
};

export const SEASONS = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
