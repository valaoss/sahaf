// Karavanda raf düzeni: kamera karavanın raf penceresine iner, raf kapakları açılır, kitaplar doğrudan karavanın raflarına dizilir.
// Raf katmanı sahne koordinatında (1600×900) çizilir ve kameranın eşlemesiyle ekrana oturtulur (map(): { left, top, s }).
// Raf penceresi: x 660–1010, y 546–708 · raflar 598 / 652 / 704 · ön tezgâh (vitrin) 714–756 (render/shelf-geo.js).
// Depo (satın alınıp henüz dizilmemiş kitaplar, S.crate) ekranın sağında (dikeyde altında) ayrı bir panel: kapaklar ve adetler.
// Etkileşim ui/shelf-drag.js ile: sürükle-bırak, dokun-seç, etiket, bölüm fiyatı; seçili raf kitabına fiyat kartı.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { syncLayout, sectionCap, tidiness, copyPrice, marketOf } from '../game/shelving.js';
import { wireShelf } from './shelf-drag.js';
import { TAGS } from '../data/books.js';
import { BLURBS } from '../data/blurbs.js';
import { knownTags, knowsAll, readsLeft } from '../game/knowledge.js';
import { settings, sfx } from '../audio/audio.js';
import { TOWNS } from '../data/towns.js';
import { ROWS, WIN } from '../render/shelf-geo.js';
import { T, tw } from '../i18n/i18n.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const hash = str => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k))); return `rgb(${c(16)},${c(8)},${c(0)})`; };
const PRICE_LABEL = { ucuz: '₺↓', normal: '₺', pahali: '₺↑' };
const COND = { yipranmis: 'Yıpranmış', iyi: 'İyi', temiz: 'Temiz' };

// "c:3" (depodaki 3.) ya da "s:bölüm:sıra" → o kopya
function entryOf(S, from) {
  const [k, x, y] = from.split(':');
  return k === 'c' ? S.crate[+x] : S.layout?.sections[+x]?.books[+y];
}

export function createShelfStage(root, { act, map }) {
  let el = null, bar = null, depot = null, sel = null, seenBox = null, landed = null, lastT = '', doorsOpen = false, closing = false, filter = '';

  // raftaki sırt: kitabın kendi boyu ve kalınlığı, türün tonu; altta fiyat etiketi (kendi kartı varsa renkli)
  function spine(S, e, from, unit, price, own) {
    const b = BOOK[e.id], h = hash(b.id), base = GENRES[b.genre].color;
    const cls = ['spine2', 'st', e.rare ? 'rare' : '', 'c-' + (e.cond || 'iyi'), S.featured.includes(e.id) ? 'feat' : '',
      sel === from ? 'sel' : '', landed === from ? 'land' : ''].join(' ');
    const w = unit * (0.74 + (h % 17) / 100), hh = 34 + (h % 13);
    return `<div class="${cls}" data-from="${from}" style="--c:${shade(base, .82 + (h % 30) / 100)};width:${w.toFixed(1)}px;height:${hh}px" title="${esc(b.title)} — ${esc(b.author)} · ${tw(COND[e.cond] || 'İyi')}"><span>${esc(b.title)}</span>${e.rare ? '<i class="r">✨</i>' : ''}<i class="pt ${own ? 'own' : ''}">${price}</i></div>`;
  }

  // depodaki kapak: aynı kitabın aynı durumdaki kopyaları tek kapakta ×adet
  function cover(e, from, n, pop) {
    const b = BOOK[e.id], G = GENRES[b.genre], h = hash(b.id);
    return `<div class="spine2 cover c-${e.cond || 'iyi'} ${e.rare ? 'rare' : ''} ${pop ? 'pop' : ''}" data-from="${from}" style="--c:${shade(G.color, .8 + (h % 30) / 100)};--d:${pop ? pop * .05 : 0}s" title="${esc(b.title)} — ${esc(b.author)} · ${tw(COND[e.cond] || 'İyi')}">
      <i class="cv-band"></i><span class="cv-t">${esc(b.title)}</span><span class="cv-a">${esc(b.author)}</span>
      <i class="cv-g">${G.icon}</i>${n > 1 ? `<i class="cv-n">×${n}</i>` : ''}${e.rare ? '<i class="r">✨</i>' : ''}${e.cond !== 'iyi' ? `<i class="cv-c">${tw(COND[e.cond])}</i>` : ''}</div>`;
  }

  function depotHTML(S, fresh) {
    const groups = new Map();
    S.crate.forEach((e, j) => {
      if (filter && BOOK[e.id].genre !== filter) return;
      const k = `${e.id}|${e.cond}|${e.rare ? 1 : 0}`;
      if (groups.has(k)) groups.get(k).n++; else groups.set(k, { e, j, n: 1 });
    });
    const present = GENRE_KEYS.filter(g => S.crate.some(e => BOOK[e.id].genre === g));
    const tabs = present.length > 1 ? `<div class="dp-tabs"><button class="${filter ? '' : 'on'}" data-f="">${T`Hepsi`}</button>${present.map(g => `<button class="${filter === g ? 'on' : ''}" data-f="${g}">${GENRES[g].icon}</button>`).join('')}</div>` : '';
    const covers = [...groups.values()].map(({ e, j, n }, k) => cover(e, `c:${j}`, n, fresh ? k + 1 : 0)).join('');
    return `<div class="dp-head"><b>📦 ${T`Depo`}</b><span>${S.crate.length}/${BAL.crateCap}</span>
        <button class="btn sm" data-auto ${S.crate.length ? '' : 'disabled'} title="${T`Depodaki kitapları türlerinin bölümlerindeki boşluklara dizer; raftakilere dokunmaz`}">✨ ${T`Boşlukları doldur`}</button></div>
      ${tabs}
      <div class="dp-grid">${covers || `<p class="hint">${S.crate.length ? T`Bu türden kitap yok.` : T`Depo boş: 📦 Toptancıdan kitap al. Raftaki bir kitabı buraya sürüklersen depoya döner.`}</p>`}</div>`;
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
        ${sec.books.map((e, j) => spine(S, e, `s:${i}:${j}`, unit, copyPrice(e.id, e, sec.price), !!e.own)).join('')}
        ${Array.from({ length: Math.max(0, cap - sec.books.length) }, () => `<i class="st-slot" style="width:${(unit * .8).toFixed(1)}px"></i>`).join('')}
      </div>
      <div class="st-tags" style="left:${x + 2}px;top:${r.plank + .5}px">
        <button class="st-lab" data-lab="${i}" style="--c:${sec.label ? GENRES[sec.label].color : '#c9b49a'}">${sec.label ? GENRES[sec.label].icon + ' ' + GENRES[sec.label].name : '🏷️ ' + T`etiket`}${off ? ` · ${off}≠` : ''}</button>
        <button class="st-price p-${sec.price}" data-price="${i}" title="${T`Bölümün fiyat etiketi (kendi fiyat kartı olmayan kitaplar için) · ucuz: cebine bakan kolay alır · pahalı: pazarlık eden çoğalır`}">${PRICE_LABEL[sec.price]}</button>
      </div>`;
    });
    // ön tezgâh: vitrin (kapağı öne dönük üç kitap)
    html += `<div class="st-ledge">${[0, 1, 2].map(k => {
      const id = S.featured[k];
      return id ? `<div class="st-vit on" data-vit="${esc(id)}" style="--c:${GENRES[BOOK[id].genre].color}"><b>${GENRES[BOOK[id].genre].icon}</b><span>${esc(BOOK[id].title)}</span></div>`
        : `<div class="st-vit" data-vit=""><span>⭐ ${T`vitrin`}</span></div>`;
    }).join('')}</div>`;
    // raf kapakları: raf modu açılırken yana açılır, kapanırken kapanır
    html += `<div class="st-doors ${doorsOpen ? '' : 'shut'}"><i class="st-door l"></i><i class="st-door r"></i></div>`;
    el.innerHTML = html;
    depot.innerHTML = depotHTML(S, fresh);
    landed = null;
    const tidy = Math.round(tidiness(S) * 100);
    // seçili kitap: adı, yazarı, durumu okunur büyüklükte; raftaysa fiyat kartı (± ve piyasa değeri)
    const pick = sel && entryOf(S, sel), pb = pick && BOOK[pick.id];
    let priceCard = '';
    if (pick && sel[0] === 's') {
      const si = +sel.split(':')[1], now = copyPrice(pick.id, pick, L.sections[si].price), m = Math.round(marketOf(pick.id, pick.cond || 'iyi', pick.rare));
      const pos = Math.max(0, Math.min(100, 100 * now / (m * 2)));
      priceCard = `<span class="st-pricecard"><span>🏷️</span><button class="btn sm" data-tagp="-1">−</button><b>₺${now}</b><button class="btn sm" data-tagp="1">+</button>
        <span class="pc-scale" title="${T`Piyasa değeri ₺${m}`}"><i class="pc-mid"></i><i class="pc-now" style="left:${pos.toFixed(0)}%"></i></span>
        <small>${T`piyasa ₺${m}`}</small>${pick.own ? `<button class="btn sm" data-tagp="reset">${T`Bölüm etiketi`}</button>` : ''}</span>`;
    }
    bar.innerHTML = `<span class="st-tidy">${T`Düzen %${tidy} · +%${Math.round(tidy * BAL.tidyBonus)} müşteri`}</span>
      ${pb ? `<span class="st-book"><i style="--c:${GENRES[pb.genre].color}"></i><b>${pick.rare ? '✨ ' : ''}${esc(pb.title)}</b><small>${esc(pb.author)} · ${tw(COND[pick.cond] || 'İyi')}</small></span>
        <span class="st-hint">→ ${T`rafa, depoya ya da ⭐ vitrine dokun`}</span>${priceCard}
        <span class="st-about">${BLURBS[pb.id] ? `<em>${esc(BLURBS[pb.id])}</em>` : ''}
          <span class="st-tags2">${(settings.allTags ? pb.tags : knownTags(S, pb.id)).map(t => TAGS[t].icon + ' ' + TAGS[t].name).join(' · ') || ''}${!settings.allTags && !knowsAll(S, pb.id) ? ` <button class="btn sm" data-read ${readsLeft(S) ? '' : 'disabled'} title="${T`Okursan bütün etiketlerini öğrenirsin`}">📖 ${T`Oku`} · ${readsLeft(S)}</button>` : ''}${TOWNS[S.town].country === 'eg' && pick.cond !== 'temiz' ? ` <button class="btn sm" data-restore title="${T`Kâğıt ustası bu kopyayı temize çevirir: daha pahalı satılır`}">🪶 ${T`Onar`} · ₺${BAL.restoreCost}</button>` : ''}</span></span>`
        : `<span class="st-hint">${T`Kitabı tut ve sürükle ya da dokunup seç`}</span>`}
      <button class="btn hl" data-done>${T`Bitti ✓`}</button>`;
    bar.querySelector('[data-done]').onclick = close;
    bar.querySelector('[data-read]')?.addEventListener('click', () => act('read', pb.id));
    bar.querySelector('[data-restore]')?.addEventListener('click', () => act('restore', sel));
    bar.querySelectorAll('[data-tagp]').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.tagp, now = copyPrice(pick.id, pick, L.sections[+sel.split(':')[1]].price);
      act('shelf', { op: 'tag', from: sel, price: v === 'reset' ? null : now + +v });
    }));
    depot.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; render(S); }));
    bar.classList.toggle('about', !!pb);
    const both = { act, S, sel: () => sel, setSel: v => { sel = v; }, rerender: () => render(S), onDrop: t => { if (t.to === 'sec') landed = `s:${t.sec}:${t.pos}`; },
      onDrag: on => { el?.classList.toggle('dragging', on); depot?.classList.toggle('dragging', on); } };
    wireShelf(el, both);
    wireShelf(depot, both);
    wireShelf(bar, both);
    tick();
  }

  function open(S) {
    if (closing) finishClose();
    if (!el) {
      el = document.createElement('div'); el.className = 'stage-shelf';
      depot = document.createElement('div'); depot.className = 'stage-depot'; depot.dataset.crate = '';
      bar = document.createElement('div'); bar.className = 'stage-bar';
      root.append(el, depot, bar);
    }
    root.classList.add('staging');
    root.parentElement?.classList.add('staging');
    sel = null; lastT = ''; doorsOpen = false; filter = '';
    render(S);
    const preview = import.meta.env.DEV && location.search.includes('sahne=');
    // kamera yaklaşırken katman yavaşça belirir, sonra raf kapakları açılır
    el.classList.remove('show'); bar.classList.remove('show'); depot.classList.remove('show');
    if (preview) { el.style.transition = bar.style.transition = depot.style.transition = 'none'; }
    setTimeout(() => { el?.classList.add('show'); bar?.classList.add('show'); depot?.classList.add('show'); }, preview ? 0 : 380);
    setTimeout(() => { if (!el) return; doorsOpen = true; el.querySelector('.st-doors')?.classList.remove('shut'); sfx('door'); }, preview ? 0 : 520);
  }

  // kapanış: kapaklar kapanır, depo ve çubuk söner, katman kalkar
  function close() {
    if (!el || closing) return;
    closing = true; doorsOpen = false;
    el.querySelector('.st-doors')?.classList.add('shut');
    bar.classList.remove('show'); depot.classList.remove('show');
    root.classList.remove('staging');
    root.parentElement?.classList.remove('staging');
    sfx('door');
    setTimeout(finishClose, 360);
  }
  function finishClose() {
    closing = false;
    el?.remove(); bar?.remove(); depot?.remove(); el = bar = depot = null; sel = null;
  }

  // yerleşim: yatayda (side) depo sağda, dikeyde (tall) altta; kamera buna göre yaklaşır (render2/scene2.js aim)
  let mode = 'side';
  function setMode(rr = root.getBoundingClientRect()) {
    const m = rr.height > rr.width ? 'tall' : 'side';
    for (const n of [el, depot]) if (n && !n.classList.contains(m)) { n.classList.remove('side', 'tall'); n.classList.add(m); }
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

  return { open, close, render, tick, get on() { return !!el && !closing; } };
}
