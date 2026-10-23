// Karavanda raf düzeni: kamera karavanın raf penceresine iner, kitaplar doğrudan karavanın raflarına dizilir.
// Katman sahne koordinatında (1600×900) çizilir ve kameranın eşlemesiyle ekrana oturtulur (map(): { left, top, s }).
// Raf penceresi: x 660–1010, y 546–708 · raflar 598 / 652 / 704 · ön tezgâh (vitrin) 714–756 · koli karavanın önünde.
// Etkileşim ui/shelf-drag.js ile panelle aynı: sürükle-bırak, dokun-seç, etiket, fiyat.
import { BAL } from '../data/balance.js';
import { GENRES } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { syncLayout, sectionCap, tidiness } from '../game/shelving.js';
import { wireShelf } from './shelf-drag.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const hash = str => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k))); return `rgb(${c(16)},${c(8)},${c(0)})`; };

// raf satırları: üst kenar ve rafın (tahtanın) yüksekliği
const ROWS = [{ top: 546, plank: 598 }, { top: 606, plank: 652 }, { top: 660, plank: 704 }];
const WIN = { x: 660, w: 350 };
const PRICE_LABEL = { ucuz: '₺↓', normal: '₺', pahali: '₺↑' };
const COND = { yipranmis: 'Yıpranmış', iyi: 'İyi', temiz: 'Temiz' };

// "c:3" (kolideki 3.) ya da "s:bölüm:sıra" → o kopya
function entryOf(S, from) {
  const [k, x, y] = from.split(':');
  return k === 'c' ? S.crate[+x] : S.layout?.sections[+x]?.books[+y];
}

export function createShelfStage(root, { act, map }) {
  let el = null, bar = null, sel = null, seenBox = null, landed = null, lastT = '';

  function spine(S, e, from, unit, pop) {
    const b = BOOK[e.id], h = hash(b.id), base = GENRES[b.genre].color;
    const cls = ['spine2', 'st', e.rare ? 'rare' : '', 'c-' + (e.cond || 'iyi'), S.featured.includes(e.id) && from[0] === 's' ? 'feat' : '',
      sel === from ? 'sel' : '', pop ? 'pop' : '', landed === from ? 'land' : ''].join(' ');
    // gerçekçi oran: kitabın kendi boyu ve kalınlığı, aynı türde farklı tonlar
    const w = unit * (0.74 + (h % 17) / 100), hh = 34 + (h % 13);
    return `<div class="${cls}" data-from="${from}" style="--c:${shade(base, .82 + (h % 30) / 100)};width:${w.toFixed(1)}px;height:${hh}px;--d:${pop ? pop * .06 : 0}s" title="${esc(b.title)} — ${esc(b.author)} · ${COND[e.cond] || 'İyi'}"><span>${esc(b.title)}</span>${e.rare ? '<i class="r">✨</i>' : ''}</div>`;
  }

  function render(S) {
    if (!el) return;
    lastS = S;
    const L = syncLayout(S), cap = sectionCap(S), unit = Math.min(22, 164 / cap);
    const fresh = S.lastBox && S.lastBox !== seenBox;
    setMode();
    seenBox = S.lastBox;
    let html = '<div class="st-win"></div>';
    L.sections.forEach((sec, i) => {
      const r = ROWS[Math.floor(i / 2)], x = WIN.x + 4 + (i % 2) * (WIN.w / 2);
      const off = sec.label ? sec.books.filter(e => BOOK[e.id].genre !== sec.label).length : 0;
      html += `<div class="st-sec" data-sec="${i}" style="left:${x}px;top:${r.top}px;width:${WIN.w / 2 - 8}px;height:${r.plank - r.top}px">
        ${sec.books.map((e, j) => spine(S, e, `s:${i}:${j}`, unit)).join('')}
        ${Array.from({ length: Math.max(0, cap - sec.books.length) }, () => `<i class="st-slot" style="width:${(unit * .8).toFixed(1)}px"></i>`).join('')}
      </div>
      <div class="st-tags" style="left:${x + 2}px;top:${r.plank + .5}px">
        <button class="st-lab" data-lab="${i}" style="--c:${sec.label ? GENRES[sec.label].color : '#c9b49a'}">${sec.label ? GENRES[sec.label].icon + ' ' + GENRES[sec.label].name : '🏷️ etiket'}${off ? ` · ${off}≠` : ''}</button>
        <button class="st-price p-${sec.price}" data-price="${i}" title="Fiyat etiketi · ucuz: öğrenci, anne, teyze daha kolay alır, çoğu zaman iki kitap · pahalı: turist ve koleksiyoncu sever, cebine bakan vazgeçer (ve konuşur)">${PRICE_LABEL[sec.price]}</button>
      </div>`;
    });
    // ön tezgâh: vitrin (kapağı öne dönük üç kitap)
    html += `<div class="st-ledge">${[0, 1, 2].map(k => {
      const id = S.featured[k];
      return id ? `<div class="st-vit on" data-vit="${esc(id)}" style="--c:${GENRES[BOOK[id].genre].color}"><b>${GENRES[BOOK[id].genre].icon}</b><span>${esc(BOOK[id].title)}</span></div>`
        : '<div class="st-vit" data-vit=""><span>⭐ vitrin</span></div>';
    }).join('')}</div>`;
    // koli: karavanın önünde yerde, kapağı açık
    html += `<div class="st-crate ${S.crate.length ? '' : 'empty'}" data-crate>
      <div class="st-flap l"></div><div class="st-flap r"></div>
      <div class="st-in">${S.crate.map((e, j) => spine(S, e, `c:${j}`, mode === 'tall' ? 27 : 18, fresh ? j + 1 : 0)).join('') || '<em>koli boş</em>'}</div>
      <div class="st-front">📦 ${S.crate.length}/${BAL.crateCap}</div>
    </div>`;
    el.innerHTML = html;
    landed = null;
    const tidy = Math.round(tidiness(S) * 100);
    // seçili kitap: adı, yazarı ve durumu okunur büyüklükte (sahnedeki sırt telefonda çok küçük)
    const pick = sel && entryOf(S, sel), pb = pick && BOOK[pick.id];
    bar.innerHTML = `<span class="st-tidy">Düzen %${tidy} · +%${Math.round(tidy * BAL.tidyBonus)} müşteri</span>
      ${pb ? `<span class="st-book"><i style="--c:${GENRES[pb.genre].color}"></i><b>${pick.rare ? '✨ ' : ''}${esc(pb.title)}</b><small>${esc(pb.author)} · ${COND[pick.cond] || 'İyi'}</small></span>
        <span class="st-hint">→ rafa, koliye ya da ⭐ vitrine dokun</span>`
        : '<span class="st-hint">Kitabı sürükle ya da dokunup seç</span>'}
      <button class="btn sm" data-auto ${S.crate.length ? '' : 'disabled'}>✨ Hepsini diz</button>
      <button class="btn hl" data-done>Bitti ✓</button>`;
    bar.querySelector('[data-done]').onclick = close;
    const both = { act, S, sel: () => sel, setSel: v => { sel = v; }, rerender: () => render(S), onDrop: t => { if (t.to === 'sec') landed = `s:${t.sec}:${t.pos}`; } };
    wireShelf(el, both);
    wireShelf(bar, both);
    tick();
  }

  function open(S) {
    if (!el) {
      el = document.createElement('div'); el.className = 'stage-shelf';
      bar = document.createElement('div'); bar.className = 'stage-bar';
      root.append(el, bar);
    }
    root.classList.add('staging');
    root.parentElement?.classList.add('staging');
    sel = null; lastT = '';
    render(S);
    // kamera yaklaşırken katman yavaşça belirir
    el.classList.remove('show'); bar.classList.remove('show');
    if (import.meta.env.DEV && location.search.includes('sahne=')) { el.style.transition = bar.style.transition = 'none'; }
    setTimeout(() => { el?.classList.add('show'); bar?.classList.add('show'); }, import.meta.env.DEV && location.search.includes('sahne=') ? 0 : 380);
  }

  function close() {
    if (!el) return;
    root.classList.remove('staging');
    root.parentElement?.classList.remove('staging');
    el.remove(); bar.remove(); el = bar = null; sel = null;
  }

  // yerleşim: yatayda (side) koli karavanın sağında, dikeyde (tall) altında ve büyük; kamera buna göre yaklaşır (render2/scene2.js aim)
  let mode = 'side';
  function setMode(rr = root.getBoundingClientRect()) {
    const m = rr.height > rr.width ? 'tall' : 'side';
    if (m !== mode || !el.classList.contains(m)) { el.classList.remove('side', 'tall'); el.classList.add(m); }
    if (m !== mode) { mode = m; if (lastS) render(lastS); }
  }
  let lastS = null;

  // her kare: katmanı kameranın eşlemesine oturt
  function tick() {
    if (!el) return;
    const m = map(), rr = root.getBoundingClientRect();
    setMode(rr);
    const t = `translate(${(m.left - rr.left).toFixed(1)}px, ${(m.top - rr.top).toFixed(1)}px) scale(${m.s.toFixed(4)})`;
    if (t !== lastT) { el.style.transform = t; lastT = t; }
  }

  return { open, close, render, tick, get on() { return !!el; } };
}
