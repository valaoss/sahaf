// Atmosfer: günün saatine göre gökyüzü ve güneş, gece yıldızları, canlı deniz (dalga, ışıltı, kıyı köpüğü),
// zeminde süzülen bulut gölgeleri, yağmur sıçramaları, rüzgârda savrulan yapraklar ve akşam ışık havuzları.
// Hepsi her karede birkaç basit şekil; bitmap gerektirmez.
import { seeded } from '../core/rng.js';

const TAU = Math.PI * 2;
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixc = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

// gün içi renk anahtarları: sabah pembe, öğle kasabanın kendi rengi, ikindi altın, akşam mor-lacivert
const KEYS = {
  dawn: [hex('#f7b8c4'), hex('#fde3d0')],
  gold: [hex('#f6b47c'), hex('#fde0b0')],
  dusk: [hex('#4b3f78'), hex('#e8977a')],
};

export function createAtmos() {
  const stars = (() => { const r = seeded(31); return Array.from({ length: 70 }, () => ({ x: r() * 1600, y: r() * 330, s: .6 + r() * 1.6, p: r() * 6 })); })();
  const shadows = (() => { const r = seeded(77); return Array.from({ length: 4 }, () => ({ x: r() * 2000, y: 640 + r() * 220, w: 260 + r() * 220, h: 40 + r() * 30, v: 12 + r() * 10 })); })();
  const leaves = (() => { const r = seeded(13); return Array.from({ length: 14 }, () => ({ y: 120 + r() * 640, sp: 260 + r() * 260, ph: r() * 10, s: .7 + r() * .6, c: ['#9cb67f', '#d39a52', '#b5cb94'][Math.floor(r() * 3)] })); })();
  const splash = (() => { const r = seeded(5); return Array.from({ length: 34 }, () => ({ x: r() * 1600, y: 580 + r() * 310, p: r() })); })();
  const LEAF = new Path2D('M0 0 C6 -6 14 -2 12 4 C8 10 0 8 0 0Z');

  // sabit gökyüzü: kasaba rengi, saat ilerledikçe sabah → öğle → altın → akşam
  function sky(ctx, town, d, night, t) {
    const base = town.sky.map(hex);
    let top = base[0], bot = base[1];
    const dawn = 1 - smooth(0, .18, d), gold = smooth(.5, .8, d) * (1 - smooth(.82, .95, d)), dusk = smooth(.8, 1, d);
    top = mixc(top, KEYS.dawn[0], dawn * .55); bot = mixc(bot, KEYS.dawn[1], dawn * .5);
    top = mixc(top, KEYS.gold[0], gold * .55); bot = mixc(bot, KEYS.gold[1], gold * .5);
    top = mixc(top, KEYS.dusk[0], dusk * .85); bot = mixc(bot, KEYS.dusk[1], dusk * .7);
    const g = ctx.createLinearGradient(0, 0, 0, 560);
    g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot));
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1600, 562);
    // sahnenin üstü (dikey ekranda): gökyüzünün tepe rengi
    ctx.fillStyle = rgb(top); ctx.fillRect(0, -1600, 1600, 1600);
    // yıldızlar
    if (night > .35) {
      const a = smooth(.35, .8, night);
      ctx.fillStyle = '#fff8e6';
      for (const s of stars) {
        ctx.globalAlpha = a * (.4 + .6 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.p)));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // güneş: doğudan yükselir, ikindi batıya iner, akşam tepelerin ardında batar
  function sunPos(d) {
    const a = Math.PI * (.12 + .8 * d);
    return { x: 380 + 1100 * d, y: 360 - 250 * Math.sin(a) };
  }
  function sun(ctx, d) {
    const p = sunPos(d), warm = smooth(.5, .95, d);
    const core = rgb(mixc(hex('#fff7d6'), hex('#ffb066'), warm)), halo = mixc(hex('#ffe2a0'), hex('#ff9a5c'), warm);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 200);
    g.addColorStop(0, rgb(halo, .85)); g.addColorStop(.55, rgb(halo, .35)); g.addColorStop(1, rgb(halo, 0));
    ctx.fillStyle = g; ctx.fillRect(p.x - 200, p.y - 200, 400, 400);
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(p.x, p.y, 58, 0, TAU); ctx.fill();
  }

  // uzak deniz: yavaş kayan ışık çizgileri (evlerin arkasında)
  function seaFar(ctx, t, night) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const y = 352 + i * 22, a = (.16 - i * .015) * (1 - night * .6);
      ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 2.2;
      ctx.beginPath();
      const sh = (t * (8 + i * 3) + i * 140) % 160;
      for (let x = -160 + sh; x < 1600; x += 160) {
        const w = 40 + 30 * Math.sin(i * 1.7 + x * .013);
        ctx.moveTo(x, y + 2 * Math.sin(t * .9 + x * .02 + i)); ctx.lineTo(x + w, y + 2 * Math.sin(t * .9 + (x + w) * .02 + i));
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // yakın deniz ve kıyı köpüğü (yalnız sahilde; iskele ayaklarının önüne çizmez)
  function seaNear(ctx, t) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const y = 484 + i * 22;
      ctx.strokeStyle = `rgba(255,255,255,${.22 - i * .04})`; ctx.lineWidth = 3;
      ctx.beginPath();
      const sh = (t * (14 + i * 5) + i * 90) % 140;
      for (let x = -140 + sh; x < 1600; x += 140) {
        if (x > 160 && x < 600) continue;
        ctx.moveTo(x, y + 2 * Math.sin(t + x * .03)); ctx.lineTo(x + 46, y + 2 * Math.sin(t + (x + 46) * .03));
      }
      ctx.stroke();
    }
    // köpük: kıyıya gelip giden dalgalı beyaz şerit
    const reach = 3 * Math.sin(t * 1.1);
    ctx.fillStyle = `rgba(255,252,244,${.55 + .2 * Math.sin(t * 1.1)})`;
    ctx.beginPath();
    ctx.moveTo(0, 556);
    for (let x = 0; x <= 1600; x += 40) ctx.lineTo(x, 546 + reach + 3 * Math.sin(x * .025 + t * 1.6));
    ctx.lineTo(1600, 556); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // zeminde süzülen bulut gölgeleri
  function cloudShadows(ctx, t, windy) {
    ctx.save();
    ctx.fillStyle = 'rgba(70,50,40,.06)';
    for (const s of shadows) {
      const x = ((s.x + t * s.v * (windy ? 3 : 1)) % 2400) - 400;
      ctx.beginPath(); ctx.ellipse(x, s.y, s.w, s.h, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // güneşe göre gölge yönü: kişinin altındaki gölge güneşin tersine uzar (sabah ve akşam daha uzun)
  function shadowLean(x, d) {
    const p = sunPos(d), low = 1 - clamp((380 - p.y) / 250);
    return clamp((x - p.x) / 900, -1, 1) * (.35 + .9 * low);
  }

  // yağmur: zeminde halkalar ve parıltı
  function rainGround(ctx, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(235,244,252,.55)'; ctx.lineWidth = 1.6;
    for (const s of splash) {
      const f = (t * 1.6 + s.p) % 1;
      ctx.globalAlpha = 1 - f;
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 4 + 14 * f, 1.5 + 4 * f, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = .12; ctx.fillStyle = '#e8f1fb';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(200 + i * 260, 640 + (i % 3) * 80, 90, 10, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  // rüzgâr: soldan sağa savrulan yapraklar
  function windLeaves(ctx, t) {
    for (const l of leaves) {
      const x = ((t * l.sp + l.ph * 300) % 1900) - 150, y = l.y + 30 * Math.sin(t * 2 + l.ph);
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + l.ph); ctx.scale(l.s, l.s);
      ctx.fillStyle = l.c; ctx.fill(LEAF); ctx.restore();
    }
  }

  // akşam: karavanın önüne ve fenerlerin çevresine düşen ılık ışık
  function lightPools(ctx, night, lamps) {
    if (night <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(830, 790, 10, 830, 790, 360);
    g.addColorStop(0, `rgba(255,190,110,${.28 * night})`); g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g; ctx.fillRect(470, 560, 720, 340);
    for (const [x, y] of lamps) {
      const h = ctx.createRadialGradient(x, y, 0, x, y, 120);
      h.addColorStop(0, `rgba(255,205,120,${.35 * night})`); h.addColorStop(1, 'rgba(255,205,120,0)');
      ctx.fillStyle = h; ctx.fillRect(x - 120, y - 120, 240, 240);
    }
    ctx.restore();
  }

  // ay: akşam doğu ufkundan yükselir
  function moon(ctx, night) {
    const a = smooth(.4, .9, night), x = 610, y = 225 - 85 * a;
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 120);
    g.addColorStop(0, 'rgba(255,248,220,.35)'); g.addColorStop(1, 'rgba(255,248,220,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 120, y - 120, 240, 240);
    ctx.fillStyle = '#fff8e2'; ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(220,210,190,.5)';
    for (const [dx, dy, r] of [[-9, -6, 6], [8, 8, 4], [10, -10, 3]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  return { sky, sun, moon, sunPos, seaFar, seaNear, cloudShadows, shadowLean, rainGround, windLeaves, lightPools };
}
