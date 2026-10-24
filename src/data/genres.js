// Kitap türleri: alış (toptancı) ve satış fiyatı kitap başına (v3 Faz 1: pazarlıkta ₺1 adım ince kalsın diye iki katına çıktı)
export const GENRES = {
  roman:     { name: 'Roman',     icon: '📖', color: '#e57f73', cost: 6, price: 14 },
  polisiye:  { name: 'Polisiye',  icon: '🔍', color: '#5b8bd0', cost: 6, price: 14 },
  fantastik: { name: 'Fantastik', icon: '🐉', color: '#b98ad6', cost: 8, price: 18 },
  siir:      { name: 'Şiir',      icon: '🌸', color: '#f6a5c0', cost: 4, price: 10 },
  cocuk:     { name: 'Çocuk',     icon: '🧸', color: '#f2c45a', cost: 4, price: 10 },
  tarih:     { name: 'Tarih',     icon: '🏛️', color: '#8bc49a', cost: 8, price: 16 },
};
export const GENRE_KEYS = Object.keys(GENRES);
