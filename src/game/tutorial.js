// İlk günlerin rehberi: kısa adımlar; her adım bir eylemle (olay adıyla) ilerler. Oyuncu istediği an kapatabilir.
export const TUT_STEPS = [
  { on: 'morning', text: 'Günaydın! Önce 📦 Toptancıdan bir koli al.', target: '[data-a="stock"]', done: 'buy' },
  { on: 'morning', text: 'Raflar hazır. Şimdi 🔔 Dükkânı aç.', target: '[data-a="open"]', done: 'open' },
  { on: 'open', text: '❓ balonlu bir müşteri gelince ona dokun; cümlesine en uygun kitabı seç.', target: null, done: 'rec' },
  { on: 'evening', text: 'Gün bitti! Özeti oku, sonra ☀️ Ertesi sabah.', target: '[data-next]', done: 'next' },
  { on: 'morning', text: 'Sabah gazetesi her gün haber getirir. 📍 Mekânını değiştirip başka müşterilerle tanışmayı dene.', target: '[data-a="spot"]', done: 'spot' },
  { on: 'morning', text: 'Kasada para birikince 🪴 Süsle: süsler müşterileri etkiler.', target: '[data-a="decor"]', done: 'decor' },
  { on: 'morning', text: 'Son ipucu: 📜 Defter, Kostas Efendi\'nin kayıp kütüphanesine giden yolu gösterir. İyi okumalar!', target: '[data-a="book"]', done: 'book' },
];

export const tutorialStep = S => S.tut >= 0 && S.tut < TUT_STEPS.length ? TUT_STEPS[S.tut] : null;

// Olay geldiğinde: o anki adım bu olayla bitiyorsa ilerle. "skip" bütün rehberi kapatır.
export function tutorialEvent(S, ev) {
  if (ev === 'skip') { S.tut = -1; return true; }
  const st = tutorialStep(S);
  if (st && st.done === ev) { S.tut++; return true; }
  return false;
}
