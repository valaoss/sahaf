// Müşteriler: kapıdan girip karavanın önünde durur, raflara bakar, alır ya da üzülüp gider.
// Öneri isteyen müşteri "❓" ile bekler; dokunulunca öneri paneli açılır.
// Görünüm müşterinin `look` tohumundan gelir; aynı kişi hep aynı giyinir.
// Davranış (durum makinesi) burada; çizim bir "görünüm"e bırakılır: svgView (bu dosya) ya da canvas (render2/crowd-view.js).
// Görünüm arayüzü: create(p, onTap), place(p, dir), set(p, durum, açık), say(p, metin), hush(p), remove(p),
// floatText(x, metin, renk), hearts(x). Durumlar: walking, reading, asking, cheer, sad, holding.
import { el } from '../core/svg.js';
import { seeded } from '../core/rng.js';
import { GENRES } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { personSVG, figureMeta } from './figure.js';

const NS = 'http://www.w3.org/2000/svg';
// her kişi kendi küçük svg'si (sprite): yer değiştirmesi GPU'da kaydırma, sahneyi yeniden çizdirmez
const BOX = { x: -130, y: 440, w: 260, h: 390 };

// Karavanın önündeki duraklar; side: hangi kenardan gelip gider
const SPOTS = [{ x: 1210, side: 1 }, { x: 1310, side: 1 }, { x: 480, side: -1 }, { x: 370, side: -1 }];
const WALK = 300;      // birim/sn
const BROWSE = 1.9;    // sn

export { nameOf } from '../data/archetypes.js';

export { personSVG, figureMeta } from './figure.js';

const BUBBLE = `
  <path d="M-34 470 L34 470 C48 470 56 478 56 492 L56 516 C56 530 48 538 34 538 L12 538 L0 554 L-10 538 L-34 538 C-48 538 -56 530 -56 516 L-56 492 C-56 478 -48 470 -34 470Z" fill="#fffaf0" stroke="#e9cfae" stroke-width="4"/>
  <text x="0" y="518" text-anchor="middle" font-size="36"></text>`;

// SVG görünümü: her kişi ayrı bir küçük svg, durumlar CSS sınıfı
export function svgView(layer, fx) {
  return {
    create(p, onTap) {
      const sprite = document.createElementNS(NS, 'svg');
      sprite.setAttribute('class', 'sprite');
      sprite.setAttribute('viewBox', `${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`);
      layer.appendChild(sprite);
      const g = el('g', {}, sprite);
      const flip = el('g', {}, g);
      flip.innerHTML = personSVG(p.c.look, p.c.style, p.carry);
      // dokunma alanı (yalnızca öneri isteyende işe yarar)
      el('rect', { class: 'hit', x: -60, y: 470, width: 120, height: 340, fill: 'transparent' }, g);
      const bubble = el('g', { class: 'bubble' }, g);
      bubble.innerHTML = BUBBLE;
      g.classList.add('age-' + p.meta.age);
      // balon başın üstünde dursun
      bubble.setAttribute('transform', `translate(0 ${(806 + p.meta.headTop - 556).toFixed(0)})`);
      g.addEventListener('click', onTap);
      p.v = { sprite, g, flip, bubble };
    },
    place(p, dir) {
      const x = Math.round(p.x);
      if (x !== p.v.px) { p.v.sprite.style.transform = `translate3d(${x}px, 0, 0)`; p.v.px = x; }
      if (dir !== p.v.dir) { p.v.flip.setAttribute('transform', dir < 0 ? 'scale(-1 1)' : ''); p.v.dir = dir; }
    },
    set(p, cls, on) {
      if (on && (cls === 'cheer' || cls === 'sad')) void p.v.g.getBBox();   // animasyon yeniden başlasın
      p.v.g.classList.toggle(cls, on);
    },
    say(p, text) { p.v.bubble.querySelector('text').textContent = text; p.v.bubble.classList.add('show'); },
    hush(p) { p.v.bubble.classList.remove('show'); },
    remove(p) { p.v.sprite.remove(); },
    floatText(x, text, color) {
      const t = el('text', { x, y: 560, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: color, class: 'float' }, fx);
      t.textContent = text;
      setTimeout(() => t.remove(), 1500);
    },
    hearts(x) {
      for (let i = 0; i < 4; i++) {
        const h = el('text', { x: x - 30 + i * 20, y: 520, 'font-size': 28, class: 'float', style: `animation-delay:${i * .12}s` }, fx);
        h.textContent = '💛';
        setTimeout(() => h.remove(), 2000);
      }
    },
  };
}

// handlers: browse(c) → sonuç (normal müşteri), ask(c) (öneri isteyene dokunuldu), timeout(c) → sonuç (sabrı tükendi)
export function createCrowd(view, handlers) {
  const people = [], pending = [];
  const ctx = { rain: false, dark: false };

  function make(c, x, spot) {
    // yağmurda çoğu kişi şemsiyeli, akşam bazıları fenerli (aynı kişi her seferinde aynı karar)
    const r = seeded(c.look * 31 + 7);
    const carry = { umbrella: ctx.rain && r() < 0.85, lantern: ctx.dark && r() < 0.6 };
    const p = { c, spot, carry, meta: figureMeta(c.look, c.style), x, state: 'in', t: 0, res: null };
    view.create(p, () => {
      if (p.state !== 'wait') return;
      p.state = 'asked';
      view.set(p, 'asking', false);
      handlers.ask(c);
    });
    if (carry.umbrella) view.set(p, 'holding', true);
    return p;
  }

  function spawn(c) {
    const free = SPOTS.filter(s => !people.some(p => p.spot === s && p.state !== 'out'));
    if (!free.length) return false;
    const spot = free[Math.floor(Math.random() * free.length)];
    const p = make(c, spot.side > 0 ? 1720 : -120, spot);
    view.set(p, 'walking', true);
    people.push(p);
    view.place(p, -spot.side);
    return true;
  }

  function say(p, text) {
    if (p.said === text) return;
    p.said = text;
    view.say(p, text);
  }

  function mood(p, cls) {
    view.set(p, 'cheer', cls === 'cheer');
    view.set(p, 'sad', cls === 'sad');
  }

  // sonucu göster; kısa bir süre sonra yürüyüp gider
  function react(p, r) {
    p.res = r;
    view.set(p, 'reading', false);
    mood(p, r.happy ? 'cheer' : r.bought.length ? null : 'sad');
    if (r.grade) say(p, r.grade === 'perfect' ? '🤩' : r.grade === 'good' ? '🙂' : '😕');
    else say(p, r.happy ? '💛' : r.bought.length ? '🙂' : '😕');
    if (r.paid) { handlers.paid?.(p.x); view.pay?.(p); }
    for (const id of r.bought || []) view.bookFly?.(p.x, GENRES[BOOK[id].genre].color);
    if (r.paid) view.floatText(p.x, `+₺${r.paid}${r.rare ? ' ✨' : ''}`, r.rare ? '#d9961a' : '#c7802b');
    else if (!r.grade) view.floatText(p.x, GENRES[p.c.wants].icon + '✕', '#a07d6c');
    if (r.grade === 'perfect') view.hearts(p.x);
    p.state = 'browse';
    p.t = BROWSE * .55;
  }

  return {
    // hava ve ışık: yeni gelenlerin elindekini belirler
    setContext(o) { Object.assign(ctx, o); },
    add(c) { pending.push(c); },
    get busy() { return people.length + pending.length; },
    answer(c, r) { const p = people.find(q => q.c === c); if (p) react(p, r); },
    // konuşma balonu için: kişinin baş üstü (emoji balonunun da üstü)
    anchor(c) { const p = people.find(q => q.c === c); return p ? { x: p.x, y: 806 + p.meta.headTop - 110 } : null; },
    // önizleme (ekran görüntüleri): verilen konumlarda duran kişiler; durum: walking | reading | cheer | ''
    preview(list) {
      for (const { c, x, state } of list) {
        const p = make(c, x, null);
        p.state = 'still';
        if (state) view.set(p, state, true);
        view.place(p, 1);
        people.push(p);
      }
    },
    // patience: öneri isteyenin bekleme süresi (sn, normal hızda)
    update(dt, mult, patience) {
      while (pending.length && spawn(pending[0])) pending.shift();
      for (const p of people) {
        const step = WALK * mult * dt * p.meta.speed;
        if (p.state === 'in') {
          const d = p.spot.x - p.x;
          if (Math.abs(d) <= step) {
            p.x = p.spot.x; p.t = 0;
            view.set(p, 'walking', false);
            view.set(p, 'reading', true);
            if (p.c.ask) { p.state = 'wait'; view.set(p, 'asking', true); say(p, p.c.reg ? '💌' : '❓'); }
            else { p.state = 'browse'; say(p, GENRES[p.c.wants].icon); }
          } else p.x += Math.sign(d) * step;
          view.place(p, Math.sign(d));
        } else if (p.state === 'wait') {
          p.t += dt * mult;
          if (p.t > patience * .65) say(p, '⏳');
          if (p.t > patience) { view.set(p, 'asking', false); react(p, handlers.timeout(p.c)); }
        } else if (p.state === 'browse') {
          p.t += dt * mult;
          if (!p.res && p.t > BROWSE * .55) react(p, handlers.browse(p.c));
          if (p.t > BROWSE) {
            p.state = 'out';
            view.hush(p);
            mood(p, null);
            view.set(p, 'reading', false);
            view.set(p, 'walking', true);
          }
        } else if (p.state === 'out') {
          p.x += p.spot.side * step;
          view.place(p, p.spot.side);
          if (p.x > 1760 || p.x < -160) { view.remove(p); p.dead = true; }
        }
      }
      for (let i = people.length - 1; i >= 0; i--) if (people[i].dead) people.splice(i, 1);
    },
    clear() { for (const p of people) view.remove(p); people.length = 0; pending.length = 0; },
  };
}
