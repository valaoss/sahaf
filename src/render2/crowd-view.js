// Canvas'ta insanlar: render/people.js durum makinesinin görünümü. Her kişi bir iskelet (rig.js);
// pozlar zamana göre hesaplanır, durum geçişleri yumuşak (açılar hedefe doğru akar).
import { buildRig, drawCell } from './rig.js';
import { slotXY, COUNTER } from '../render/shelf-geo.js';

const TAU = Math.PI * 2;
const deg = d => d * Math.PI / 180;
const wave = f => 0.5 - 0.5 * Math.cos(TAU * f);
const frac = x => x - Math.floor(x);
const BUBBLE = new Path2D('M-34 470 L34 470 C48 470 56 478 56 492 L56 516 C56 530 48 538 34 538 L12 538 L0 554 L-10 538 L-34 538 C-48 538 -56 530 -56 516 L-56 492 C-56 478 -48 470 -34 470Z');

// satış: 0–.3 raftan kalkıp tezgâha iner · .3–.5 kâğıda sarılır (kraft rengi, sicim) · .5–1 kavisle müşterinin eline
const ease = v => v * v * (3 - 2 * v);
function drawSale(ctx, f, u) {
  let x, y, wrap = 0, s = 1;
  if (u < .3) {
    const v = u / .3, lift = Math.min(1, v * 4);
    x = f.x0 + (COUNTER.x - f.x0) * ease(Math.max(0, v - .2) / .8);
    y = f.y0 - 14 * lift + (COUNTER.y - f.y0 + 14) * ease(Math.max(0, v - .2) / .8);
    s = 1 + .15 * lift;
  } else if (u < .5) { x = COUNTER.x; y = COUNTER.y; wrap = (u - .3) / .2; s = 1.15 - .1 * wrap; }
  else { const v = ease((u - .5) / .5); x = COUNTER.x + (f.x1 - COUNTER.x) * v; y = COUNTER.y + (f.y1 - COUNTER.y) * v - 70 * Math.sin(Math.PI * v); wrap = 1; s = 1.05; }
  ctx.save(); ctx.translate(x, y); ctx.scale(s * 1.6, s * 1.6);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-8, 11, 18, 4);
  ctx.fillStyle = f.color; ctx.fillRect(-9, -12, 18, 24);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(-6, -9, 12, 3);
  if (wrap > 0) {
    // kâğıt aşağıdan yukarı sarar, sonra sicim çapraz bağlanır
    ctx.fillStyle = '#d8b98a'; ctx.fillRect(-10, 13 - 26 * Math.min(1, wrap * 1.4), 20, 26 * Math.min(1, wrap * 1.4));
    if (wrap > .7) { ctx.strokeStyle = '#8a5a3c'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 13); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); }
  }
  ctx.restore();
}

export function canvasCrowdView(getScale) {
  const list = [], fx = [];
  let now = 0;

  const view = {
    create(p, onTap) {
      p.v = { st: new Set(), tap: onTap, dir: 1, seed: Math.random() * 10, ang: {}, up: 0, head: 0, headY: 0, book: 0, bub: 0, text: '', born: now };
      list.push(p);
      buildRig(p.c.look, p.c.style, p.carry, getScale()).then(r => { p.v.rig = r; });
    },
    place(p, dir) { p.v.dir = dir; },
    set(p, cls, on) {
      if (on && !p.v.st.has(cls)) p.v.since = { ...(p.v.since || {}), [cls]: now };
      on ? p.v.st.add(cls) : p.v.st.delete(cls);
    },
    say(p, text) { p.v.text = text; p.v.bubOn = true; },
    hush(p) { p.v.bubOn = false; },
    remove(p) { const i = list.indexOf(p); if (i >= 0) list.splice(i, 1); },
    floatText(x, text, color) { fx.push({ x, y: 560, text, color, size: 34, bold: true, t0: now, dur: 1.5 }); },
    pay(p) { p.v.payAt = now; },
    // satılan kitap raftaki yerinden kalkar, tezgâhta kâğıda sarılır, müşterinin eline uzanır (spot: { sec, i, cap }, k: aynı müşterinin kaçıncı kitabı)
    bookFly(x, color, spot, k = 0) {
      const from = spot && spot.sec >= 0 ? slotXY(spot.sec, spot.i, spot.cap) : { x: 760 + Math.random() * 140, y: 600 };
      fx.push({ book: true, x0: from.x, y0: from.y, x1: x, y1: 690, color, t0: now + k * .25, dur: 1.05 });
    },
    hearts(x) { for (let i = 0; i < 4; i++) fx.push({ x: x - 30 + i * 20, y: 520, text: '💛', size: 28, t0: now + i * .12, dur: 1.5 }); },

    // dokunma: öneri bekleyen kişiye isabet
    hit(x, y) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        if (!p.v.st.has('asking')) continue;
        const top = 806 + p.meta.headTop - 90;
        if (Math.abs(x - p.x) < 64 && y > top && y < 812) return () => p.v.tap();
      }
      return null;
    },

    // akşam ışık havuzu için fenerlerin yaklaşık yeri
    lamps() { return list.filter(p => p.carry.lantern && p.v.rig).map(p => [p.x - 22 * p.meta.scale * p.v.dir, 806 - 70 * p.meta.scale]); },

    draw(ctx, t, dt, o = {}) {
      now = t;
      for (const p of list) person(ctx, p, t, dt, o);
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i], u = (t - f.t0) / f.dur;
        if (u >= 1) { fx.splice(i, 1); continue; }
        if (u < 0) continue;
        if (f.book) { drawSale(ctx, f, u); continue; }
        // style.css "float": 0–%20 belirip büyür, sonra yavaşlayarak yükselip söner
        const w = (u - .2) / .8;
        const alpha = u < .2 ? u / .2 : 1 - w;
        const ty = u < .2 ? 10 - 20 * (u / .2) : -10 - 80 * (1 - (1 - w) ** 2);
        const s = u < .2 ? .6 + .5 * (u / .2) : 1.1 - .1 * ((u - .2) / .8);
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(f.x, f.y + ty);
        ctx.scale(s, s);
        ctx.font = `${f.bold ? 700 : 400} ${f.size}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        if (f.color) { ctx.fillStyle = f.color; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,248,236,.85)'; ctx.strokeText(f.text, 0, 0); }
        ctx.fillText(f.text, 0, 0);
        ctx.restore();
      }
    },
  };

  // açıyı hedefe doğru yumuşakça taşı
  const ease = (v, k, target, rate, dt) => { v.ang[k] = (v.ang[k] ?? target) + (target - (v.ang[k] ?? target)) * Math.min(1, dt * rate); return v.ang[k]; };

  function person(ctx, p, t, dt, o) {
    const v = p.v, r = v.rig;
    if (!r) return;
    const st = v.st, walking = st.has('walking'), age = r.meta.age, s = r.meta.scale;
    const lt = t + v.seed;
    ctx.save();
    ctx.translate(p.x, 0);
    // gölge: güneşin tersine uzar (sabah ve akşam daha uzun)
    const lean = o.lean ? o.lean(p.x) : 0;
    ctx.globalAlpha = .22;
    ctx.fillStyle = '#7a5a3c';
    ctx.beginPath(); ctx.ellipse(lean * 48 * s, 806, r.shadowRx + Math.abs(lean) * 60 * s, 7, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(0, 806);
    ctx.scale(v.dir < 0 ? -s : s, s);
    const items = walking ? r.side : r.front;
    // poz
    const A = {};
    let upY = 0, headR = 0, headY = 0, blink = false, squash = 1;
    if (walking) {
      const period = age === 'child' ? .8 : age === 'elder' ? 1.6 : 1.04;
      const ph = TAU * (t - (v.since?.walking || 0)) / period;
      const leg = age === 'elder' ? 12 : 24, arm = age === 'elder' ? 8 : 22;
      A.legF = deg(leg * Math.sin(ph)); A.legB = -A.legF;
      A.armF = st.has('holding') ? deg(-6 + 2.5 * Math.sin(ph)) : deg(-arm * Math.sin(ph)); A.armB = deg(arm * Math.sin(ph));
      upY = -(age === 'child' ? 9 : 4) * (0.5 - 0.5 * Math.cos(2 * ph));
    } else {
      upY = -1.5 * wave(lt / 3.6);
      const cheerAt = v.since?.cheer;
      // sevinç: önce hafifçe çöker, sonra iki kez sıçrar (ezilip esneyerek)
      if (st.has('cheer') && cheerAt !== undefined && t - cheerAt < 1.1) {
        const u = t - cheerAt;
        if (u < .12) squash = 1 - .08 * (u / .12);
        else { const j = Math.abs(Math.sin(Math.PI * (u - .12) / .5)); upY = -16 * j; squash = .95 + .1 * j; }
      }
      const paying = v.payAt !== undefined && t - v.payAt < .7;
      A.armR = ease(v, 'armR', paying ? deg(-65) : st.has('holding') ? deg(-6) : st.has('reading') ? deg(22) : 0, paying ? 12 : 6, dt);
      A.armL = ease(v, 'armL', st.has('cheer') ? deg(-150) : 0, 10, dt);
      A.legL = 0; A.legR = 0;
      // baş: okurken eğik, üzgünken düşük, yoksa ara sıra bakınır
      let hr = 0, hy = 0;
      if (st.has('sad')) { hr = deg(8); hy = 3; }
      else if (st.has('reading')) hr = deg(3 + 3 * wave(lt / 3));
      else { const f = frac(lt / 7); hr = deg(f < .6 ? 0 : f < .7 ? -5 * (f - .6) / .1 : f < .8 ? -5 : -5 * (1 - (f - .8) / .2)); }
      headR = ease(v, 'head', hr, 5, dt); headY = ease(v, 'headY', hy, 5, dt);
      blink = frac(lt / 4.6) > .93 && frac(lt / 4.6) < .97;
    }
    v.book += ((st.has('reading') && !walking ? 1 : 0) - v.book) * Math.min(1, dt * 6);

    for (const it of items) {
      if (it.type === 'up') {
        ctx.save();
        ctx.translate(0, upY);
        if (squash !== 1) { ctx.translate(0, -82); ctx.scale(2 - squash, squash); ctx.translate(0, 82); }
        if (it.hunch) { const [a, cx, cy] = it.hunch; ctx.translate(cx, cy); ctx.rotate(deg(a)); ctx.translate(-cx, -cy); }
      } else if (it.type === 'down') ctx.restore();
      else if (it.type === 'seg') drawCell(ctx, r, it.cell);
      else if (it.type === 'limb') {
        ctx.save();
        ctx.translate(it.pivot[0], it.pivot[1]);
        const a = A[it.name] || 0;
        if (a) ctx.rotate(a);
        drawCell(ctx, r, it.cell);
        if (it.book && v.book > .02) { ctx.globalAlpha = v.book; drawCell(ctx, r, it.book); ctx.globalAlpha = 1; }
        ctx.restore();
      } else if (it.type === 'head') {
        ctx.save();
        ctx.translate(it.pivot[0], it.pivot[1] + headY);
        if (headR) ctx.rotate(headR);
        drawCell(ctx, r, blink && it.blink ? it.blink : it.cell);
        ctx.restore();
      }
    }
    ctx.restore();

    // emoji balonu: başın üstünde, açılırken büyür; öneri bekleyen hafifçe zıplar
    v.bub += ((v.bubOn ? 1 : 0) - v.bub) * Math.min(1, dt * 9);
    if (v.bub > .02 && v.text) {
      const oy = 806 + r.meta.headTop - 556 + (st.has('asking') ? -8 * wave(t / 1.2) : 0);
      const k = .4 + .6 * Math.min(1, v.bub * 1.08);
      ctx.save();
      ctx.globalAlpha = v.bub;
      ctx.translate(0, oy + 554);
      ctx.scale(k, k);
      ctx.translate(0, -554);
      ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = '#e9cfae'; ctx.lineWidth = 4;
      ctx.fill(BUBBLE); ctx.stroke(BUBBLE);
      ctx.font = '36px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#4a3a33';
      ctx.fillText(v.text, 0, 518);
      ctx.restore();
    }
    ctx.restore();
  }

  return view;
}
