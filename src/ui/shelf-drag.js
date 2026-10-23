// Raf etkileşimi (panel ve karavan içi katman ortak): sürükle-bırak, dokun-seç, etiket ve fiyat seçimi.
// DOM kuralı: sırtlar .spine2[data-from="c:i" | "s:bölüm:i"], bölümler [data-sec], koli [data-crate], vitrin [data-vit],
// etiket düğmesi [data-lab], fiyat düğmesi [data-price], "Hepsini diz" [data-auto].
import { GENRES, GENRE_KEYS } from '../data/genres.js';

export const NEXT_PRICE = { ucuz: 'normal', normal: 'pahali', pahali: 'ucuz' };

// bırakma noktası: bölüm (araya), koli ya da vitrin
export function targetAt(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  if (el.closest('[data-vit]')) return { to: 'vit', el: el.closest('[data-vit]') };
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

// o: { act, S, sel: () => seçili, setSel(v), rerender(), scrollEl (kenarda otomatik kaydırma), onDrop(t) }
export function wireShelf(root, o) {
  const drop = (from, t) => {
    if (!t) return;
    o.setSel(null);
    o.onDrop?.(t);
    o.act('shelf', { op: 'drop', from, to: t.to, sec: t.sec, pos: t.pos });
  };
  root.querySelector('[data-auto]')?.addEventListener('click', () => { o.setSel(null); o.act('shelf', { op: 'auto' }); });
  root.querySelectorAll('[data-price]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const i = +b.dataset.price;
    o.act('shelf', { op: 'price', sec: i, tag: NEXT_PRICE[o.S.layout.sections[i].price] });
  }));
  // etiket: dokununca tür seçici açılır
  root.querySelectorAll('[data-lab]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const i = +b.dataset.lab, box = b.closest('[data-sec]') || b.parentElement;
    if (box.querySelector('.labpick2')) return box.querySelector('.labpick2').remove();
    root.querySelectorAll('.labpick2').forEach(n => n.remove());
    const pickEl = document.createElement('div');
    pickEl.className = 'labpick2';
    pickEl.innerHTML = GENRE_KEYS.map(g => `<button data-g="${g}" style="--c:${GENRES[g].color}">${GENRES[g].icon} ${GENRES[g].name}</button>`).join('') + '<button data-g="">🏷️ Etiketsiz</button>';
    pickEl.addEventListener('click', ev => { ev.stopPropagation(); const g = ev.target.closest('[data-g]'); if (g) o.act('shelf', { op: 'label', sec: i, g: g.dataset.g || null }); });
    box.appendChild(pickEl);
  }));
  // sürükle-bırak ve dokun-seç
  let drag = null;
  root.querySelectorAll('.spine2').forEach(el => {
    el.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      drag = { el, from: el.dataset.from, x0: e.clientX, y0: e.clientY, ghost: null };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* sentetik olay */ }
    });
    el.addEventListener('pointermove', e => {
      if (!drag || drag.el !== el) return;
      if (!drag.ghost) {
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
        const r = el.getBoundingClientRect();
        drag.ghost = el.cloneNode(true);
        drag.ghost.classList.add('ghost2');
        Object.assign(drag.ghost.style, { width: r.width + 'px', height: r.height + 'px', fontSize: (parseFloat(getComputedStyle(el).fontSize) * r.width / el.offsetWidth || 12) + 'px' });
        document.body.appendChild(drag.ghost);
        drag.dx = drag.x0 - r.left; drag.dy = drag.y0 - r.top;
        el.classList.add('lifted');
      }
      drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px) rotate(-4deg)`;
      if (o.scrollEl) {
        const pr = o.scrollEl.getBoundingClientRect();
        if (e.clientY > pr.bottom - 40) o.scrollEl.scrollTop += 12; else if (e.clientY < pr.top + 40) o.scrollEl.scrollTop -= 12;
      }
      root.querySelectorAll('.over').forEach(n => n.classList.remove('over'));
      targetAt(e.clientX, e.clientY)?.el?.classList.add('over');
    });
    const end = e => {
      if (!drag || drag.el !== el) return;
      const d = drag; drag = null;
      if (d.ghost) {
        d.ghost.remove();
        el.classList.remove('lifted');
        drop(d.from, targetAt(e.clientX, e.clientY));
      } else {
        // dokunma: seç / seçimi kaldır / seçiliyken raftaki başka bir sırta dokunmak onun yanına taşır
        const sel = o.sel();
        if (sel && sel !== d.from && d.from[0] === 's') return drop(sel, targetAt(e.clientX, e.clientY));
        o.setSel(sel === d.from ? null : d.from);
        o.rerender();
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { if (drag?.ghost) drag.ghost.remove(); drag = null; el.classList.remove('lifted'); });
  });
  // seçiliyken bölüme, koliye ya da vitrine dokun
  root.querySelectorAll('[data-sec], [data-crate], [data-vit]').forEach(n => n.addEventListener('click', e => {
    if (!o.sel() || e.target.closest('.spine2, [data-lab], [data-price], .labpick2')) return;
    drop(o.sel(), targetAt(e.clientX, e.clientY));
  }));
  // vitrindeki kitaba dokununca vitrinden çıkar
  root.querySelectorAll('[data-vit].on').forEach(n => n.addEventListener('click', () => { if (!o.sel()) o.act('feature', n.dataset.vit); }));
}
