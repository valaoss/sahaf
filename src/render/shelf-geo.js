// Karavanın raf penceresinin sahne koordinatları (1600×900): raf katmanı (ui/shelf-stage.js) ve satış animasyonu
// (render2/crowd-view.js bookFly) aynı yerleri kullanır.
// ROWS: raf satırlarının üst kenarı ve tahtası · WIN: pencerenin solu ve genişliği · COUNTER: paketlemenin yapıldığı tezgâh
export const ROWS = [{ top: 546, plank: 598 }, { top: 606, plank: 652 }, { top: 660, plank: 704 }];
export const WIN = { x: 660, w: 350 };
export const COUNTER = { x: 835, y: 704 };

// Bölümdeki i. kitabın yaklaşık ortası (cap: bölüm kapasitesi; sırt genişliği raf katmanıyla aynı hesap)
export function slotXY(sec, i, cap) {
  const unit = Math.min(22, 164 / Math.max(1, cap)), r = ROWS[Math.floor(sec / 2)] || ROWS[0];
  return { x: WIN.x + 4 + (sec % 2) * (WIN.w / 2) + 2 + (i + 0.5) * (unit * 0.82 + 1.4), y: r.plank - 20 };
}
