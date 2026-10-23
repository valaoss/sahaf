// Raf düzenleyici: koliden kitapları sürükleyip bölümlere diz, bölümlere tür etiketi as, vitrine üç kitap koy.
// Telefon için dokun-seç / dokun-bırak da çalışır: bir sırta dokun (seçilir), sonra bir bölüme ya da koliye dokun.
// Durumu değiştirmez; her hamle act('shelf', { op, ... }) ile main.js'e gider, panel yeniden çizilir.
import { BAL } from '../data/balance.js';
import { GENRES } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { syncLayout, sectionCap, tidiness } from '../game/shelving.js';
import { wireShelf } from './shelf-drag.js';

const COND = { yipranmis: 'Yıpranmış', iyi: 'İyi', temiz: 'Temiz' };
const PRICE_LABEL = { ucuz: '₺↓ ucuz', normal: '₺ normal', pahali: '₺↑ pahalı' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const hash = str => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

export function createShelfPanel({ openPanel, closePanel, act, toast }) {
  let sel = null;            // seçili sırt: 'c:i' (koli) ya da 's:bölüm:i'
  let seenBox = null;        // koli açılış animasyonu yalnız yeni koli için

  function spine(S, e, from, pop) {
    const b = BOOK[e.id], G = GENRES[b.genre], h = hash(b.id);
    const cls = ['spine2', e.rare ? 'rare' : '', 'c-' + (e.cond || 'iyi'), S.featured.includes(e.id) && from[0] === 's' ? 'feat' : '', sel === from ? 'sel' : '', pop ? 'pop' : ''].join(' ');
    return `<div class="${cls}" data-from="${from}" style="--c:${G.color};--h:${78 + h % 20};--d:${pop ? pop * 0.06 : 0}s" title="${esc(b.title)} — ${esc(b.author)} · ${COND[e.cond] || 'İyi'}">
      <span>${esc(b.title)}</span>${e.rare ? '<i class="r">✨</i>' : ''}</div>`;
  }

  function render(S) {
    const L = syncLayout(S), cap = sectionCap(S), tidy = Math.round(tidiness(S) * 100);
    const fresh = S.lastBox && S.lastBox !== seenBox;
    seenBox = S.lastBox;
    const sec = (s, i) => {
      const off = s.label ? s.books.filter(e => BOOK[e.id].genre !== s.label).length : 0;
      return `<div class="sec2 ${s.label ? '' : 'nolab'} ${sel && sel.startsWith('s:' + i + ':') ? 'from' : ''}" data-sec="${i}" style="--c:${s.label ? GENRES[s.label].color : '#c9b49a'}">
        <button class="price2 p-${s.price}" data-price="${i}" title="Fiyat etiketi · ucuz: öğrenci, anne, teyze daha kolay alır, çoğu zaman iki kitap · pahalı: turist ve koleksiyoncu sever, cebine bakan vazgeçer (ve konuşur)">${PRICE_LABEL[s.price]}</button>
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

  function wire(p, S) {
    p.querySelector('[data-close]').onclick = () => { sel = null; closePanel(); };
    wireShelf(p, { act, S, sel: () => sel, setSel: v => { sel = v; }, rerender: () => render(S), scrollEl: p });
  }

  return { render, reset() { sel = null; } };
}
