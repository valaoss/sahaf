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
  travelCost: 6,       // kasabalar arası yakıt
  daysPerSeason: 7,
};

export const SEASONS = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
