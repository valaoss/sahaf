// Müşteriler: kapıdan girip karavanın önünde durur, raflara bakar, alır ya da üzülüp gider.
// Öneri isteyen müşteri "❓" ile bekler; dokunulunca öneri paneli açılır.
// Görünüm müşterinin `look` tohumundan gelir; aynı kişi hep aynı giyinir.
import { el } from '../core/svg.js';
import { seeded } from '../core/rng.js';
import { GENRES } from '../data/genres.js';

const COATS = ['#f6c552', '#e57f73', '#8bc49a', '#6fb1d6', '#b98ad6', '#f09a5e', '#fff1d6'];
const HAIR = ['#6a4434', '#3d2b24', '#a0643c', '#e2b56a', '#8a8a8a', '#c4572e'];
const SKIN = ['#f6d2b4', '#eec09c', '#d9a07a', '#b97d58'];
const PANTS = ['#4d5d82', '#5a4a42', '#6e7f5a', '#7d5f8a'];
const HATS = ['#e57f73', '#5b8bd0', '#f2c45a', '#8bc49a'];

// Karavanın önündeki duraklar; side: hangi kenardan gelip gider
const SPOTS = [{ x: 1250, side: 1 }, { x: 1370, side: 1 }, { x: 470, side: -1 }, { x: 320, side: -1 }];
const WALK = 300;      // birim/sn
const BROWSE = 1.9;    // sn

const NAMES = ['Deniz', 'Elif', 'Mert', 'Zeynep', 'Can', 'Ayşe', 'Emre', 'Selin', 'Kerem', 'Defne', 'Ali', 'Nehir', 'Barış', 'Ece', 'Umut', 'Lale', 'Oya', 'Kaan'];
// names: müşteri tipinin kendi isim listesi (varsa)
export const nameOf = (look, names = NAMES) => names[look % names.length];

// o: müdavimler için sabit görünüm (coat, hair, skin, hat, hatC, long, tall, beard, glasses)
export function personSVG(look, o = {}) {
  const r = seeded(look), pick = a => a[Math.floor(r() * a.length)];
  const rolled = { coat: pick(COATS), hair: pick(HAIR), skin: pick(SKIN), pants: pick(PANTS), hat: Math.floor(r() * 3), hatC: pick(HATS), long: r() > .5, tall: 0.92 + r() * .16 };
  const { coat, hair, skin, pants, hat, hatC, long, tall, beard, glasses } = { ...rolled, ...o };
  const coatDark = coat === '#fff1d6' ? '#e9d3ad' : 'rgba(0,0,0,.12)';
  const hatSvg = hat === 0 ? '' : hat === 1
    ? `<path d="M-40 590 C-34 552 34 548 44 586 C20 576 -16 578 -40 590Z" fill="${hatC}"/><circle cx="4" cy="552" r="9" fill="#fff4e0"/>`
    : `<ellipse cx="0" cy="584" rx="62" ry="12" fill="${hatC}"/><path d="M-32 584 C-30 548 30 548 32 584Z" fill="${hatC}"/><rect x="-32" y="574" width="64" height="8" fill="#fff4e0" opacity=".8"/>`;
  return `
    <ellipse cx="0" cy="806" rx="44" ry="10" fill="#c9a676" opacity=".6"/>
    <g transform="translate(0 806) scale(1 ${tall.toFixed(3)}) translate(0 -806)">
    <g class="legs">
      <rect x="-22" y="756" width="16" height="48" rx="8" fill="${pants}"/><rect x="6" y="756" width="16" height="48" rx="8" fill="${pants}"/>
      <ellipse cx="-14" cy="804" rx="13" ry="7" fill="#5a3d30"/><ellipse cx="14" cy="804" rx="13" ry="7" fill="#5a3d30"/>
    </g>
    <g class="body-bob">
      <path d="M-42 770 C-46 700 -36 660 0 656 C36 660 46 700 42 770 C20 778 -20 778 -42 770Z" fill="${coat}"/>
      <path d="M0 662 L0 770" stroke="${coatDark}" stroke-width="3"/>
      <circle cx="-8" cy="700" r="3.5" fill="${coatDark}"/><circle cx="-8" cy="730" r="3.5" fill="${coatDark}"/>
      <path d="M30 690 C46 704 50 724 40 736" fill="none" stroke="${coat}" stroke-width="16" stroke-linecap="round"/>
      <path d="M-30 690 C-46 704 -50 724 -40 736" fill="none" stroke="${coat}" stroke-width="16" stroke-linecap="round"/>
      <circle cx="40" cy="738" r="8" fill="${skin}"/><circle cx="-40" cy="738" r="8" fill="${skin}"/>
      ${long ? `<path d="M-48 614 C-56 660 -50 690 -36 690 L-30 620Z M48 614 C56 660 50 690 36 690 L30 620Z" fill="${hair}"/>` : ''}
      <circle cx="0" cy="616" r="46" fill="${skin}"/>
      <path d="M-48 614 C-52 566 -12 552 10 560 C40 566 54 590 48 618 C40 600 20 590 0 594 C-20 596 -36 604 -48 614Z" fill="${hair}"/>
      <circle cx="-16" cy="622" r="5" fill="#3d2b24"/><circle cx="16" cy="622" r="5" fill="#3d2b24"/>
      <circle cx="-14" cy="620" r="1.6" fill="#fff"/><circle cx="18" cy="620" r="1.6" fill="#fff"/>
      <circle cx="-28" cy="636" r="8" fill="#f59a8e" opacity=".55"/><circle cx="28" cy="636" r="8" fill="#f59a8e" opacity=".55"/>
      <path d="M-6 640 Q0 646 6 640" fill="none" stroke="#7a4e3c" stroke-width="3" stroke-linecap="round"/>
      ${beard ? `<path d="M-40 622 C-40 672 40 672 40 622 C30 648 -30 648 -40 622Z" fill="${hair}"/><path d="M-14 640 Q0 632 14 640 Q0 646 -14 640Z" fill="${hair}"/>` : ''}
      ${glasses ? '<g fill="none" stroke="#5a3d30" stroke-width="3"><circle cx="-16" cy="622" r="11"/><circle cx="16" cy="622" r="11"/><path d="M-5 622 L5 622"/></g>' : ''}
      ${hatSvg}
    </g>
    </g>`;
}

const BUBBLE = `
  <path d="M-34 470 L34 470 C48 470 56 478 56 492 L56 516 C56 530 48 538 34 538 L12 538 L0 554 L-10 538 L-34 538 C-48 538 -56 530 -56 516 L-56 492 C-56 478 -48 470 -34 470Z" fill="#fffaf0" stroke="#e9cfae" stroke-width="4"/>
  <text x="0" y="518" text-anchor="middle" font-size="36"></text>`;

// handlers: browse(c) → sonuç (normal müşteri), ask(c) (öneri isteyene dokunuldu), timeout(c) → sonuç (sabrı tükendi)
export function createCrowd(layer, fx, handlers) {
  const people = [], pending = [];

  function spawn(c) {
    const free = SPOTS.filter(s => !people.some(p => p.spot === s && p.state !== 'out'));
    if (!free.length) return false;
    const spot = free[Math.floor(Math.random() * free.length)];
    const g = el('g', {}, layer);
    const flip = el('g', {}, g);
    flip.innerHTML = personSVG(c.look, c.style);
    // dokunma alanı (yalnızca öneri isteyende işe yarar)
    el('rect', { x: -60, y: 470, width: 120, height: 340, fill: 'transparent' }, g);
    const bubble = el('g', { class: 'bubble' }, g);
    bubble.innerHTML = BUBBLE;
    const p = { c, spot, g, flip, bubble, x: spot.side > 0 ? 1720 : -120, state: 'in', t: 0, res: null };
    g.classList.add('walking');
    g.addEventListener('click', () => {
      if (p.state !== 'wait') return;
      p.state = 'asked';
      p.g.classList.remove('asking');
      handlers.ask(c);
    });
    people.push(p);
    place(p, -spot.side);
    return true;
  }

  function place(p, dir) {
    p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} 0)`);
    p.flip.setAttribute('transform', dir < 0 ? 'scale(-1 1)' : '');
  }

  function say(p, text) {
    p.bubble.querySelector('text').textContent = text;
    p.bubble.classList.add('show');
  }

  function floatText(x, text, color) {
    const t = el('text', { x, y: 560, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: color, class: 'float' }, fx);
    t.textContent = text;
    setTimeout(() => t.remove(), 1500);
  }

  function hearts(x) {
    for (let i = 0; i < 4; i++) {
      const h = el('text', { x: x - 30 + i * 20, y: 520, 'font-size': 28, class: 'float', style: `animation-delay:${i * .12}s` }, fx);
      h.textContent = '💛';
      setTimeout(() => h.remove(), 2000);
    }
  }

  // sonucu göster; kısa bir süre sonra yürüyüp gider
  function react(p, r) {
    p.res = r;
    if (r.grade) say(p, r.grade === 'perfect' ? '🤩' : r.grade === 'good' ? '🙂' : '😕');
    else say(p, r.happy ? '💛' : r.bought.length ? '🙂' : '😕');
    if (r.paid) floatText(p.x, `+₺${r.paid}${r.rare ? ' ✨' : ''}`, r.rare ? '#d9961a' : '#c7802b');
    else if (!r.grade) floatText(p.x, GENRES[p.c.wants].icon + '✕', '#a07d6c');
    if (r.grade === 'perfect') hearts(p.x);
    p.state = 'browse';
    p.t = BROWSE * .55;
  }

  return {
    add(c) { pending.push(c); },
    get busy() { return people.length + pending.length; },
    answer(c, r) { const p = people.find(q => q.c === c); if (p) react(p, r); },
    // patience: öneri isteyenin bekleme süresi (sn, normal hızda)
    update(dt, mult, patience) {
      while (pending.length && spawn(pending[0])) pending.shift();
      const step = WALK * mult * dt;
      for (const p of people) {
        if (p.state === 'in') {
          const d = p.spot.x - p.x;
          if (Math.abs(d) <= step) {
            p.x = p.spot.x; p.t = 0;
            p.g.classList.remove('walking');
            if (p.c.ask) { p.state = 'wait'; p.g.classList.add('asking'); say(p, p.c.reg ? '💌' : '❓'); }
            else { p.state = 'browse'; say(p, GENRES[p.c.wants].icon); }
          } else p.x += Math.sign(d) * step;
          place(p, Math.sign(d));
        } else if (p.state === 'wait') {
          p.t += dt * mult;
          if (p.t > patience * .65) say(p, '⏳');
          if (p.t > patience) { p.g.classList.remove('asking'); react(p, handlers.timeout(p.c)); }
        } else if (p.state === 'browse') {
          p.t += dt * mult;
          if (!p.res && p.t > BROWSE * .55) react(p, handlers.browse(p.c));
          if (p.t > BROWSE) {
            p.state = 'out';
            p.bubble.classList.remove('show');
            p.g.classList.add('walking');
          }
        } else if (p.state === 'out') {
          p.x += p.spot.side * step;
          place(p, p.spot.side);
          if (p.x > 1760 || p.x < -160) { p.g.remove(); p.dead = true; }
        }
      }
      for (let i = people.length - 1; i >= 0; i--) if (people[i].dead) people.splice(i, 1);
    },
    clear() { for (const p of people) p.g.remove(); people.length = 0; pending.length = 0; },
  };
}
