// Raf düzenleyici: koliden kitapları sürükleyip bölümlere diz, bölümlere tür etiketi as, vitrine üç kitap koy.
// Telefon için dokun-seç / dokun-bırak da çalışır: bir sırta dokun (seçilir), sonra bir bölüme ya da koliye dokun.
// Durumu değiştirmez; her hamle act('shelf', { op, ... }) ile main.js'e gider, panel yeniden çizilir.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { syncLayout, sectionCap, tidiness, crateFree } from '../game/shelving.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const hash = str => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

export function createShelfPanel({ openPanel, closePanel, act, toast }) {
  let sel = null;            // seçili sırt: 'c:i' (koli) ya da 's:bölüm:i'
  let seenBox = null;        // koli açılış animasyonu yalnız yeni koli için

  function spine(S, e, from, pop) {
    const b = BOOK[e.id], G = GENRES[b.genre], h = hash(b.id);
    const cls = ['spine2', e.rare ? 'rare' : '', S.featured.includes(e.id) && from[0] === 's' ? 'feat' : '', sel === from ? 'sel' : '', pop ? 'pop' : ''].join(' ');
    return `<div class="${cls}" data-from="${from}" style="--c:${G.color};--h:${78 + h % 20};--d:${pop ? pop * 0.06 : 0}s" title="${esc(b.title)} — ${esc(b.author)}">
      <span>${esc(b.title)}</span>${e.rare ? '<i class="r">✨</i>' : ''}</div>`;
  }

  function render(S) {
    const L = syncLayout(S), cap = sectionCap(S), tidy = Math.round(tidiness(S) * 100);
    const fresh = S.lastBox && S.lastBox !== seenBox;
    seenBox = S.lastBox;
    const sec = (s, i) => {
      const off = s.label ? s.books.filter(e => BOOK[e.id].genre !== s.label).length : 0;
      return `<div class="sec2 ${s.label ? '' : 'nolab'} ${sel && sel.startsWith('s:' + i + ':') ? 'from' : ''}" data-sec="${i}" style="--c:${s.label ? GENRES[s.label].color : '#c9b49a'}">
        <button class="lab2" data-lab="${i}">${s.label ? `${GENRES[s.label].icon} ${GENRES[s.label].name}` : '🏷️ Etiketsiz'}${off ? ` <b title="Etikete uymayan">· ${off} karışık</b>` : ''}</button>
        <div class="row2">${s.books.map((e, j) => spine(S, e, `s:${i}:${j}`)).join('')}${'<i class="slot2"></i>'.repeat(Math.max(0, cap - s.books.length))}</div>
      </div>`;
    };
    const rows = [0, 1, 2].map(r => `<div class="plank2">${sec(L.sections[r * 2], r * 2)}${sec(L.sections[r * 2 + 1], r * 2 + 1)}</div>`).join('');
    const vit = [0, 1, 2].map(i => {
      const id = S.featured[i];
      return id ? `<div class="vslot2 on" data-vit="${esc(id)}" style="--c:${GENRES[BOOK[id].genre].color}"><span>⭐ ${esc(BOOK[id].title)}</span></div>` : `<div class="vslot2" data-vit=""><span>⭐ boş</span></div>`;
    }).join('');
    const crate = S.crate.map((e, j) => spine(S, e, `c:${j}`, fresh ? j + 1 : 0)).join('');
    const selBook = sel && pick(S, sel);
    const prev = document.querySelector('.panel.shelf2')?.scrollTop || 0;
    const p = openPanel(`
      <h2>📚 Raflar <span class="tidy2" title="Etiketine uyan kitapların oranı">Düzen %${tidy} · +%${Math.round(tidy * BAL.tidyBonus)} müşteri</span></h2>
      <div class="vit2" data-vitrow>${vit}</div>
      <div class="body2"><div class="case2">${rows}</div>
      <div class="side2">
        <div class="crate2 ${S.crate.length ? '' : 'empty'}" data-crate>
          <div class="crate-lid">📦 Koli <b>${S.crate.length}/${BAL.crateCap}</b></div>
          <div class="row2">${crate || '<span class="hint">Koli boş. Toptancıdan yeni kitap alabilirsin.</span>'}</div>
        </div>
        <p class="hint" id="shelfhint">${selBook ? `Seçili: <b>${esc(BOOK[selBook.id].title)}</b> — bir bölüme, koliye ya da ⭐ vitrine dokun.` : 'Kitabı sürükle ya da dokunup seç. Rafa konmayan kitap satılmaz; türüne uygun bölüm müşteri çeker.'}</p>
        <div class="row end">
          <button class="btn" data-auto ${S.crate.length ? '' : 'disabled'}>✨ Hepsini diz</button>
          <button class="btn hl" data-close>Tamam</button>
        </div>
      </div></div>`, 'wide shelf2');
    p.scrollTop = prev;
    wire(p, S);
  }

  // 'c:3' / 's:2:4' → kitap kaydı
  function pick(S, from) {
    const [k, a, b] = from.split(':');
    return k === 'c' ? S.crate[+a] : S.layout.sections[+a]?.books[+b];
  }

  // bırakma noktası: bölüm (araya), koli ya da vitrin
  function targetAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const vit = el.closest('[data-vit]');
    if (vit) return { to: 'vit' };
    const sec = el.closest('[data-sec]');
    if (sec) {
      const spines = [...sec.querySelectorAll('.spine2')];
      let pos = spines.length;
      for (let i = 0; i < spines.length; i++) { const r = spines[i].getBoundingClientRect(); if (x < r.left + r.width / 2) { pos = i; break; } }
      return { to: 'sec', sec: +sec.dataset.sec, pos, el: sec };
    }
    const crate = el.closest('[data-crate]');
    if (crate) return { to: 'crate', el: crate };
    return null;
  }

  function drop(S, from, t) {
    if (!t) return;
    sel = null;
    act('shelf', { op: 'drop', from, ...t, el: undefined });
  }

  function wire(p, S) {
    p.querySelector('[data-close]').onclick = () => { sel = null; closePanel(); };
    p.querySelector('[data-auto]').onclick = () => { sel = null; act('shelf', { op: 'auto' }); };
    // etiket: dokununca tür seçici açılır
    p.querySelectorAll('[data-lab]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const i = +b.dataset.lab, box = b.closest('.sec2');
      if (box.querySelector('.labpick2')) return box.querySelector('.labpick2').remove();
      p.querySelectorAll('.labpick2').forEach(n => n.remove());
      const pickEl = document.createElement('div');
      pickEl.className = 'labpick2';
      pickEl.innerHTML = GENRE_KEYS.map(g => `<button data-g="${g}" style="--c:${GENRES[g].color}">${GENRES[g].icon} ${GENRES[g].name}</button>`).join('') + '<button data-g="">🏷️ Etiketsiz</button>';
      pickEl.onclick = ev => { const g = ev.target.closest('[data-g]'); if (g) act('shelf', { op: 'label', sec: i, g: g.dataset.g || null }); };
      box.appendChild(pickEl);
    });
    // sürükle-bırak ve dokun-seç
    let drag = null;
    p.querySelectorAll('.spine2').forEach(el => {
      el.addEventListener('pointerdown', e => {
        if (e.button > 0) return;
        drag = { el, from: el.dataset.from, x0: e.clientX, y0: e.clientY, ghost: null, id: e.pointerId };
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* sentetik olay */ }
      });
      el.addEventListener('pointermove', e => {
        if (!drag || drag.el !== el) return;
        if (!drag.ghost) {
          if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
          const r = el.getBoundingClientRect();
          drag.ghost = el.cloneNode(true);
          drag.ghost.classList.add('ghost2');
          Object.assign(drag.ghost.style, { width: r.width + 'px', height: r.height + 'px', fontSize: getComputedStyle(el).fontSize });
          document.body.appendChild(drag.ghost);
          drag.dx = drag.x0 - r.left; drag.dy = drag.y0 - r.top;
          el.classList.add('lifted');
        }
        drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px) rotate(-4deg)`;
        // panelin kenarına yaklaşınca kendiliğinden kaydır
        const pr = p.getBoundingClientRect();
        if (e.clientY > pr.bottom - 40) p.scrollTop += 12; else if (e.clientY < pr.top + 40) p.scrollTop -= 12;
        p.querySelectorAll('.over').forEach(n => n.classList.remove('over'));
        const t = targetAt(e.clientX, e.clientY);
        t?.el?.classList.add('over');
      });
      const end = e => {
        if (!drag || drag.el !== el) return;
        const d = drag; drag = null;
        if (d.ghost) {
          d.ghost.remove();
          el.classList.remove('lifted');
          drop(S, d.from, targetAt(e.clientX, e.clientY));
        } else {
          // dokunma: seç / seçimi kaldır / seçiliyken başka sırta dokunmak onun yanına taşır
          if (sel && sel !== d.from && d.from[0] === 's') { const t = targetAt(e.clientX, e.clientY); return drop(S, sel, t); }
          sel = sel === d.from ? null : d.from;
          render(S);
        }
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', () => { if (drag?.ghost) drag.ghost.remove(); drag = null; el.classList.remove('lifted'); });
    });
    // seçiliyken bölüme, koliye ya da vitrine dokun
    p.querySelectorAll('[data-sec], [data-crate], [data-vit]').forEach(n => n.addEventListener('click', e => {
      if (!sel || e.target.closest('.spine2, [data-lab], .labpick2')) return;
      drop(S, sel, targetAt(e.clientX, e.clientY));
    }));
    // vitrindeki kitaba dokununca vitrinden çıkar
    p.querySelectorAll('[data-vit].on').forEach(n => n.addEventListener('click', () => { if (!sel) act('feature', n.dataset.vit); }));
  }

  return { render, reset() { sel = null; } };
}
