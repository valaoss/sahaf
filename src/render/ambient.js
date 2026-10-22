// Canlı arka plan: gökte martılar, ufukta tekne, çiçeklerin etrafında kelebekler.
// Hepsi kozmetik (Math.random); oyun durumunu etkilemez. Ara sıra doğar, CSS animasyonuyla geçip kaybolur.
import { el } from '../core/svg.js';

const R = (a, b) => a + Math.random() * (b - a);

export function createAmbient(back, front) {
  const timers = { gull: R(2, 6), boat: R(8, 20), fly: 1 };
  let butterflies = 0;

  function gull() {
    const y = R(110, 280), s = R(0.6, 1.1), dir = Math.random() < 0.5 ? 1 : -1, dur = R(14, 24);
    const g = el('g', { class: 'amb-move', style: `--from:${dir > 0 ? -80 : 1680}px;--to:${dir > 0 ? 1680 : -80}px;--y:${y.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s` }, back);
    const body = el('g', { transform: `scale(${(s * dir).toFixed(2)} ${s.toFixed(2)})` }, g);
    el('path', { class: 'amb-flap', d: 'M-18 0 Q-9 -10 0 0 Q9 -10 18 0', fill: 'none', stroke: '#6b5a52', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, body);
    g.addEventListener('animationend', () => g.remove());
  }

  function boat() {
    const dur = R(50, 80);
    const g = el('g', { class: 'amb-move', style: `--from:1680px;--to:-160px;--y:${R(372, 392).toFixed(0)}px;animation-duration:${dur.toFixed(0)}s` }, back);
    const b = el('g', { class: 'bob' }, g);
    const sail = ['#fff4e0', '#f08a7e', '#f2c45a', '#9cc7e0'][Math.floor(Math.random() * 4)];
    b.innerHTML = `<path d="M0 14 L56 14 L46 28 L8 28Z" fill="#fffaf2"/><path d="M0 14 L56 14 L54 19 L2 19Z" fill="#5b8bd0"/>
      <line x1="28" y1="14" x2="28" y2="-22" stroke="#8a5a3c" stroke-width="3"/><path d="M30 -20 L52 10 L30 10Z" fill="${sail}"/>`;
    g.addEventListener('animationend', () => g.remove());
  }

  function butterfly() {
    butterflies++;
    const x = R(1180, 1560), y = R(560, 700), c = ['#f6a5c0', '#f2c45a', '#b98ad6', '#9cc7e0'][Math.floor(Math.random() * 4)];
    const g = el('g', { class: 'amb-wander', style: `--x:${x.toFixed(0)}px;--y:${y.toFixed(0)}px;animation-duration:${R(9, 14).toFixed(1)}s` }, front);
    const w = el('g', { class: 'amb-wings' }, g);
    w.innerHTML = `<ellipse cx="-6" cy="-3" rx="7" ry="9" fill="${c}"/><ellipse cx="6" cy="-3" rx="7" ry="9" fill="${c}"/>
      <ellipse cx="-4" cy="6" rx="4" ry="5" fill="${c}" opacity=".8"/><ellipse cx="4" cy="6" rx="4" ry="5" fill="${c}" opacity=".8"/>
      <rect x="-1" y="-8" width="2" height="16" rx="1" fill="#5a3d30"/>`;
    g.addEventListener('animationend', () => { g.remove(); butterflies--; });
  }

  return {
    // ctx: { season, weather } — yağmurda martı yok, kelebek yalnız ilkbahar/yazın açık havada
    update(dt, ctx) {
      for (const k in timers) timers[k] -= dt;
      if (timers.gull <= 0) { if (ctx.weather !== 'yagmurlu') gull(); timers.gull = R(7, 15); }
      if (timers.boat <= 0) { boat(); timers.boat = R(40, 70); }
      if (timers.fly <= 0) {
        const fair = (ctx.season === 'İlkbahar' || ctx.season === 'Yaz') && ctx.weather !== 'yagmurlu' && ctx.weather !== 'ruzgarli';
        if (fair && butterflies < 2) butterfly();
        timers.fly = R(6, 12);
      }
    },
  };
}
