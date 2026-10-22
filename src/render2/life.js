// Canvas'ta canlı arka plan ve parçacıklar: martı, geçen tekne, kelebek (render/ambient.js karşılığı),
// mevsim yaprakları/çiçekleri ve yağmur. Hepsi kozmetik (Math.random); oyun durumunu etkilemez.
import { seeded } from '../core/rng.js';

const TAU = Math.PI * 2;
const R = (a, b) => a + Math.random() * (b - a);
const GULL = new Path2D('M-18 0 Q-9 -10 0 0 Q9 -10 18 0');
const HULL = new Path2D('M0 14 L56 14 L46 28 L8 28Z'), STRIPE = new Path2D('M0 14 L56 14 L54 19 L2 19Z');
const SAIL = new Path2D('M30 -20 L52 10 L30 10Z');
const PETAL = new Path2D('M0 0 C8 -8 16 0 8 10 C0 14 -8 8 0 0Z');
const SAILS = ['#fff4e0', '#f08a7e', '#f2c45a', '#9cc7e0'];
const FLY = ['#f6a5c0', '#f2c45a', '#b98ad6', '#9cc7e0'];

// kelebeğin gezinme yolu (style.css "wander" anahtar kareleri)
const WANDER = [[0, 0, 0], [.3, -60, -50], [.55, 40, -90], [.8, -30, -30], [1, 80, -160]];
function wanderAt(f) {
  for (let i = 1; i < WANDER.length; i++) {
    const [f1, x1, y1] = WANDER[i], [f0, x0, y0] = WANDER[i - 1];
    if (f <= f1) { const u = (f - f0) / (f1 - f0), e = u * u * (3 - 2 * u); return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e]; }
  }
  return [80, -160];
}

export function createLife() {
  const gulls = [], boats = [], flies = [];
  const timers = { gull: R(2, 6), boat: R(8, 20), fly: 1 };
  let petals = null, petalKey = '';

  return {
    // ctx: { season, weather, bits } — yağmurda martı yok, kelebek yalnız ilkbahar/yazın açık havada
    update(dt, c) {
      for (const k in timers) timers[k] -= dt;
      if (timers.gull <= 0) {
        if (c.weather !== 'yagmurlu') { const dir = Math.random() < .5 ? 1 : -1; gulls.push({ y: R(110, 280), s: R(.6, 1.1), dir, dur: R(14, 24), t: 0, ph: Math.random() }); }
        timers.gull = R(7, 15);
      }
      if (timers.boat <= 0) { boats.push({ y: R(372, 392), dur: R(50, 80), t: 0, sail: SAILS[Math.floor(Math.random() * 4)] }); timers.boat = R(40, 70); }
      if (timers.fly <= 0) {
        const fair = (c.season === 'İlkbahar' || c.season === 'Yaz') && c.weather !== 'yagmurlu' && c.weather !== 'ruzgarli';
        if (fair && flies.length < 2) flies.push({ x: R(1180, 1560), y: R(560, 700), dur: R(9, 14), t: 0, c: FLY[Math.floor(Math.random() * 4)] });
        timers.fly = R(6, 12);
      }
      for (const a of [gulls, boats, flies]) for (let i = a.length - 1; i >= 0; i--) { a[i].t += dt; if (a[i].t >= a[i].dur) a.splice(i, 1); }
    },
    // ufuk: martılar ve tekneler (evlerin arkasında)
    drawBack(ctx, t) {
      ctx.lineCap = 'round';
      for (const g of gulls) {
        const f = g.t / g.dur, x = g.dir > 0 ? -80 + 1760 * f : 1680 - 1760 * f;
        const flap = 1 - 1.6 * (0.5 - 0.5 * Math.cos(TAU * (t / 1 + g.ph)));
        ctx.save(); ctx.translate(x, g.y); ctx.scale(g.s * g.dir, g.s * flap);
        ctx.strokeStyle = '#6b5a52'; ctx.lineWidth = 3.5 / g.s; ctx.stroke(GULL); ctx.restore();
      }
      for (const b of boats) {
        const x = 1680 - 1840 * (b.t / b.dur), bob = Math.sin(TAU * t / 3.2);
        ctx.save(); ctx.translate(x, b.y - 3 * (bob + 1)); ctx.rotate(bob * .03);
        ctx.fillStyle = '#fffaf2'; ctx.fill(HULL); ctx.fillStyle = '#5b8bd0'; ctx.fill(STRIPE);
        ctx.strokeStyle = '#8a5a3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(28, 14); ctx.lineTo(28, -22); ctx.stroke();
        ctx.fillStyle = b.sail; ctx.fill(SAIL); ctx.restore();
      }
    },
    // ön: kelebekler
    drawFront(ctx, t) {
      for (const f of flies) {
        const u = f.t / f.dur, [dx, dy] = wanderAt(u), a = u < .1 ? u / .1 : u > .8 ? 1 - (u - .8) / .2 : 1;
        const w = 1 - .7 * (0.5 - 0.5 * Math.cos(TAU * t / .36));
        ctx.save(); ctx.globalAlpha = a; ctx.translate(f.x + dx, f.y + dy); ctx.fillStyle = f.c;
        for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.ellipse(s * 6 * w, -3, 7 * w, 9, 0, 0, TAU); ctx.fill();
          ctx.globalAlpha = a * .8; ctx.beginPath(); ctx.ellipse(s * 4 * w, 6, 4 * w, 5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = a;
        }
        ctx.fillStyle = '#5a3d30'; ctx.fillRect(-1, -8, 2, 16); ctx.restore();
      }
    },
    // mevsim parçacıkları: aynı tohumla aynı 16 yaprak (style.css "petal" + "tumble")
    drawPetals(ctx, t, bits) {
      if (!bits) return;
      const key = bits.join();
      if (key !== petalKey) {
        const r = seeded(7);
        petals = Array.from({ length: 16 }, (_, i) => ({ x: 100 + r() * 1700, d: r() * 9, dur: 7 + r() * 5, c: bits[i % bits.length] }));
        petalKey = key;
      }
      for (const p of petals) {
        const f = ((t + p.d) / p.dur) % 1;
        const [dx, dy] = f < .5 ? [-120 * f / .5, 480 * f / .5] : [-120 - 140 * (f - .5) / .5, 480 + 500 * (f - .5) / .5];
        ctx.save(); ctx.translate(p.x + dx, -40 + dy); ctx.scale(1.6, 1.6);
        ctx.translate(4, 3); ctx.rotate(TAU * ((t + p.d) / 2.6)); ctx.translate(-4, -3);
        ctx.fillStyle = p.c; ctx.fill(PETAL); ctx.restore();
      }
    },
    // yağmur: 90 eğik çizgi, 0.55 sn'de ekranı geçer
    drawRain(ctx, t) {
      const r = seeded(99), off = (t / .55) % 1 * 900;
      ctx.save(); ctx.strokeStyle = 'rgba(232,241,251,.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 90; i++) {
        const x = r() * 1700; let y = r() * 1800 - 900 + off;
        if (y > 900) y -= 1800;
        ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 34);
        ctx.moveTo(x, y + 900); ctx.lineTo(x - 10, y + 934);
      }
      ctx.stroke(); ctx.restore();
    },
  };
}
