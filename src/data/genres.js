// Kitap türleri: alış (toptancı) ve satış fiyatı kitap başına
export const GENRES = {
  roman:     { name: 'Roman',     icon: '📖', color: '#e57f73', cost: 3, price: 7 },
  polisiye:  { name: 'Polisiye',  icon: '🔍', color: '#5b8bd0', cost: 3, price: 7 },
  fantastik: { name: 'Fantastik', icon: '🐉', color: '#b98ad6', cost: 4, price: 9 },
  siir:      { name: 'Şiir',      icon: '🌸', color: '#f6a5c0', cost: 2, price: 5 },
  cocuk:     { name: 'Çocuk',     icon: '🧸', color: '#f2c45a', cost: 2, price: 5 },
  tarih:     { name: 'Tarih',     icon: '🏛️', color: '#8bc49a', cost: 4, price: 8 },
};
export const GENRE_KEYS = Object.keys(GENRES);
