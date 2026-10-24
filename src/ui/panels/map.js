// Akdeniz haritası: tam ekran, yakınlaştırma, şehir kartı, karavanın rotada gidişi.
// Ortak durum ve yardımcılar ui/kit.js'te; ana arayüzün işlevlerine (raf, konfeti, konuşma) K.ui üzerinden ulaşılır.
import { BAL } from '../../data/balance.js';
import { T, tw } from '../../i18n/i18n.js';
import { FEATURES } from '../../data/features.js';
import { GENRES, GENRE_KEYS } from '../../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../../data/towns.js';
import { BOOK, booksOf, TAGS } from '../../data/books.js';
import { DECOR, SLOTS, PAINTS, UPGRADES } from '../../data/decor.js';
import { THEMES } from '../../audio/compose.js';
import { worldSVG, routePath, townXY, declutter, flagSVG, WW, WH } from '../../render/world.js';
import { hasBackup } from '../../core/save.js';
import { settings } from '../../audio/audio.js';
import { BLURBS } from '../../data/blurbs.js';
import { knownTags, knowsAll, knownCount, readsLeft } from '../../game/knowledge.js';
import { REP_LEVELS, repOf, repLevel, favorOpen, orderCost, ordered } from '../../game/bonds.js';
import { KEEPSAKES } from '../../data/keepsakes.js';
import { VOYAGE, VOYAGE_KEYS, GRAND } from '../../data/voyage.js';
import { voyagePages, stat as vstat, roseDay } from '../../game/voyage.js';
import { plainCopies } from '../../game/shop.js';
import { paperName } from '../../data/countries.js';
import { COUNTRIES, COUNTRY_KEYS } from '../../data/countries.js';
import { travelInfo } from '../../game/travel.js';
import { createShelfPanel } from '../shelf-panel.js';
import { createShelfStage } from '../shelf-stage.js';
import { KOSTAS } from '../../data/kostas.js';
import { shelfCount, shelfCap, genreCount, seasonOf, dayOfSeason } from '../../game/state.js';
import { boxCost, canBuyBox, canTravel, topDemand, stallOf, COND_NAME, satFactor, parkFee, upkeepOf, sponsorable } from '../../game/shop.js';
import { nextShelf } from '../../game/decor.js';
import { SPOTS } from '../../data/spots.js';
import { REGULARS, REGULAR_KEYS, HEARTS_MAX } from '../../data/regulars.js';
import { WEATHER, EVENTS } from '../../data/calendar.js';
import { weatherOf, eventOf, gossipOf, specialOf } from '../../game/calendar.js';
import { questText, questProgress } from '../../game/mail.js';
import { SEASON } from '../../data/calendar.js';
import { PAGES } from '../../data/story.js';
import { nextPage, progressOf } from '../../game/story.js';
import { statsOf } from '../../game/stats.js';
import { HAP } from '../../game/happenings.js';
import { STAMPS, STAMP_REWARD } from '../../data/stamps.js';
import { stampProgress } from '../../game/stamps.js';
import { personSVG, figureMeta, nameOf } from '../../render/people.js';
import { ARCHETYPES } from '../../data/archetypes.js';
import { K, act, openPanel, closePanel } from '../kit.js';


// Akdeniz haritası: tam ekran; bir şehre dokununca kartı açılır (yol türü, ücret, süre), "Yola çık" ile karavan gider
export function mapPanel(S) {
  const p = openPanel(`
    <div class="wmap">
      <svg class="map3d world" viewBox="0 0 ${WW} ${WH}">${worldSVG(S)}</svg>
      <div class="wbar"><b>🗺️ ${FEATURES.akdeniz ? T`Akdeniz` : T`Ege`}</b><span class="hint grow">${T`Bir şehre dokun · iki parmakla yakınlaştır`}</span>
        <span class="zoom2"><button class="btn sm" data-zin title="${T`Yakınlaştır`}">＋</button><button class="btn sm" data-zout title="${T`Uzaklaştır`}">－</button></span>
        <button class="btn sm" data-close>✕ ${T`Kapat`}</button></div>
      <div class="wcard" id="wcard"></div>
    </div>`, 'mapfull');
  const svg = p.querySelector('svg.world');
  p.querySelector('[data-close]').onclick = closePanel;
  // önce bulunduğun bölgeye yakın açılır
  const [hx, hy] = townXY(S.town);
  // kümeler yalnız ölçek değişince yeniden kurulur (kaydırmak ekrandaki aralıkları değiştirmez)
  let lastSc = 0;
  const zm = zoomable(svg, WW, WH, {
    minW: 160, init: { x: hx - 330, y: hy - 160, w: 660, h: 660 * WH / WW },
    onChange: (vb, sc) => {
      svg.style.setProperty('--ms', (1 / sc).toFixed(3));
      if (Math.abs(sc - lastSc) > 1e-4) { lastSc = sc; declutter(svg, sc); }
    },
  });
  p.querySelector('[data-zin]').onclick = () => zm.zoom(1.5);
  p.querySelector('[data-zout]').onclick = () => zm.zoom(1 / 1.5);
  const card = p.querySelector('#wcard');
  const showTown = k => {
    const Tn = TOWNS[k], c = Tn.country || 'tr', C = COUNTRIES[c], open = S.unlocked.includes(k), info = travelInfo(S, k), why = canTravel(S, k);
    p.querySelectorAll('.city.sel').forEach(n => n.classList.remove('sel'));
    p.querySelector(`.city[data-town="${k}"]`)?.classList.add('sel');
    if (lastSc) declutter(svg, lastSc);
    card.innerHTML = `<div class="wc-head">${flagSVG(C.flag)}<div><b>${open ? Tn.name : '???'}</b><small>${C.name}</small></div></div>
      <p>${open ? Tn.blurb : T`Haritada sisli bir köşe… Defterde ilerledikçe buranın yolunu öğreneceksin.`}</p>
      ${k === S.town ? `<p class="hint">📍 ${T`Buradasın.`}</p>` : open ? `<p class="wc-trip">${info.abroad ? `⛴️ ${T`Feribot · ₺${info.cost} · bir gün sürer`}${S.passport[c] ? '' : ` · 🛂 ${T`pasaporta damga`}`}` : `🚐 ${T`Karayolu · ₺${info.cost}`}`}</p>` : ''}
      <div class="row end">${k !== S.town && open ? `<button class="btn hl" data-go ${why ? 'disabled' : ''}>${why ? tw(why) : (info.abroad ? T`⛴️ Feribota bin` : T`🚐 Yola çık`)}</button>` : ''}</div>`;
    card.classList.add('show');
    card.querySelector('[data-go]')?.addEventListener('click', () => {
      card.classList.remove('show');
      driveVan(svg, S.town, k, info.abroad, () => act('travel', k));
    });
  };
  const showCountry = c => {
    const C = COUNTRIES[c];
    card.innerHTML = `<div class="wc-head">${flagSVG(C.flag)}<div><b>${C.name}</b><small>${S.countries.includes(c) ? T`Açık` : T`🔒 Kapalı`}</small></div></div>
      <p>${S.countries.includes(c) ? T`"${C.greet}!" diye karşılarlar. Şehirleri haritada.` : C.hint}</p>`;
    card.classList.add('show');
  };
  // kümeye dokununca harita o şehirlerin üstüne yaklaşır
  p.querySelectorAll('.city').forEach(g => g.addEventListener('click', () => {
    if (g.classList.contains('clus')) {
      const pts = [g.dataset.town, ...g.dataset.kids.split(',')].map(townXY), xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
      const spread = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) * WW / WH);
      zm.flyTo((Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2, Math.min(spread * 4 + 120, zm.view().w / 2));
    }
    showTown(g.dataset.town);
  }));
  p.querySelectorAll('.country').forEach(g => g.addEventListener('click', () => { if (FEATURES.akdeniz) showCountry(g.dataset.country); }));
  showTown(S.town);
}

// Karavan rotada gider: karayolunda kahverengi kesik çizgi, feribotta mavi deniz yolu
export function driveVan(svg, from, to, abroad, done) {
  const r = routePath(from, to, abroad), van = svg.querySelector('#wvan');
  svg.querySelector('#wroute').innerHTML = `<path d="${r.d}" fill="none" stroke="${abroad ? '#3f7fb0' : '#a07d5c'}" stroke-width="4" stroke-dasharray="10 9" stroke-linecap="round" opacity=".85"/>`;
  van.style.display = '';
  const start = performance.now(), dur = abroad ? 2200 : 1400;
  (function step(now) {
    const k = Math.min((now - start) / dur, 1), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    const [x, y] = r.at(e), bob = Math.abs(Math.sin(k * Math.PI * (abroad ? 4 : 7))) * 5;
    van.style.transform = `translate(${x.toFixed(1)}px, ${(y - bob).toFixed(1)}px) scale(var(--ms, 1))`;
    if (k < 1) requestAnimationFrame(step); else setTimeout(done, 250);
  })(start);
}

// Harita yakınlaştırma: viewBox kaydırılır. İki parmak kıstırma, tekerlek, çift dokunuş; tek parmakla sürükleme.
// Sürükleme ya da kıstırmadan sonra gelen tıklama kasaba seçmez.
// o: { minW (en yakın görünüm genişliği), init (başlangıç viewBox), onChange(vb, ekranPikseli/birim) }
// Görünüm ekranın oranını alır: dikey telefonda yakınlaşınca harita boydan boya dolar, yukarı aşağı da kaydırılır.
export function zoomable(svg, W = 1600, H = 900, o = {}) {
  const asp = () => { const r = svg.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r.width / r.height : W / H; };
  const hOf = w => Math.min(H, w / asp());
  const clamp = v => ({ ...v, x: Math.max(0, Math.min(W - v.w, v.x)), y: Math.max(0, Math.min(H - v.h, v.y)) });
  // ortası yerinde kalarak ekran oranına getirir
  const shape = v => { const w = Math.min(v.w, W), h = hOf(w); return clamp({ x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h }); };
  let vb = o.init ? shape(o.init) : shape({ x: 0, y: 0, w: W, h: H }), moved = 0;
  const pts = new Map();
  // oran tutmadığı anlarda (boyut değişirken) "meet" yerleşimi: ölçek ve kenar boşluğu
  const fit = () => { const r = svg.getBoundingClientRect(), sc = Math.min(r.width / vb.w, r.height / vb.h); return { r, sc, ox: (r.width - vb.w * sc) / 2, oy: (r.height - vb.h * sc) / 2 }; };
  const apply = () => {
    vb = shape(vb);
    svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
    svg.classList.toggle('zoomed', vb.w < W - 1);
    o.onChange?.(vb, fit().sc || 1);
  };
  const toSvg = (cx, cy) => { const { r, sc, ox, oy } = fit(); return { x: vb.x + (cx - r.left - ox) / sc, y: vb.y + (cy - r.top - oy) / sc }; };
  function zoomAt(cx, cy, k) {
    const p = toSvg(cx, cy), w = Math.min(W, Math.max(o.minW || W / 4, vb.w / k)), s = w / vb.w;
    vb = clamp({ x: p.x - (p.x - vb.x) * s, y: p.y - (p.y - vb.y) * s, w, h: hOf(w) });
    apply();
  }
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  svg.addEventListener('pointerdown', e => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 1) moved = 0; });
  svg.addEventListener('pointermove', e => {
    const prev = pts.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY }, r = svg.getBoundingClientRect();
    if (pts.size === 1) {
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (vb.w < W - 1 || vb.h < H - 1) { const sc = fit().sc; vb = clamp({ ...vb, x: vb.x - dx / sc, y: vb.y - dy / sc }); apply(); }
    } else {
      const o = [...pts].find(([id]) => id !== e.pointerId)[1];
      const d0 = Math.hypot(prev.x - o.x, prev.y - o.y), d1 = Math.hypot(cur.x - o.x, cur.y - o.y);
      if (d0 > 0) zoomAt((cur.x + o.x) / 2, (cur.y + o.y) / 2, d1 / d0);
      moved += 20;
    }
    pts.set(e.pointerId, cur);
  });
  const up = e => pts.delete(e.pointerId);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => svg.addEventListener(n, up));
  svg.addEventListener('click', e => { if (moved > 8) { e.stopPropagation(); e.preventDefault(); } }, true);
  svg.addEventListener('dblclick', e => zoomAt(e.clientX, e.clientY, vb.w < W - 1 ? vb.w / W : 2));
  apply();
  // panel kapanınca harita belgeden çıkar: gözlemci de bırakılır
  const ro = new ResizeObserver(() => { if (svg.isConnected) apply(); else ro.disconnect(); });
  ro.observe(svg);
  // düğmelerle: haritanın ortasına göre · flyTo: (cx, cy) merkezli w genişliğinde görünüme yumuşakça geçer
  return {
    zoom(k) { const r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, k); },
    view: () => vb,
    flyTo(cx, cy, w) {
      w = Math.min(W, Math.max(o.minW || W / 4, w));
      const a = { ...vb }, b = clamp({ x: cx - w / 2, y: cy - hOf(w) / 2, w, h: hOf(w) }), t0 = performance.now();
      (function step(now) {
        const k = Math.min((now - t0) / 450, 1), e = 1 - (1 - k) ** 3;
        vb = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, w: a.w + (b.w - a.w) * e, h: a.h + (b.h - a.h) * e };
        apply();
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    },
  };
}
