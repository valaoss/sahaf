// Mürekkep Koyu haritası ve mahalle kartı (v3 Faz 6). Sabah haritayı açarsın, bir mahalleye dokunursun:
// bugünkü kalabalık, aranan türler, kira, güven ve olay. Açık mahalleye "Buraya git", kilitliye koşullar ve "Mahalleyi aç".
import { T, tw } from '../../i18n/i18n.js';
import { TOWNS } from '../../data/towns.js';
import { GENRES, GENRE_KEYS } from '../../data/genres.js';
import { SPOTS } from '../../data/spots.js';
import { SHELF_LEVELS } from '../../data/decor.js';
import { DISTRICTS, DISTRICT_KEYS, districtEvent } from '../../data/districts.js';
import { REGULARS, REGULAR_KEYS } from '../../data/regulars.js';
import { koyMapSVG, roadPath, KW, KH } from '../../render/koy-map.js';
import { dayMods } from '../../game/calendar.js';
import { demandOf, canTravel } from '../../game/shop.js';
import { openReqs, canOpenDistrict, guvenOf, homeOf, GUVEN_MAX } from '../../game/koy.js';
import { genreOpen } from '../../game/progress.js';
import { K, act, openPanel, closePanel, hearts } from '../kit.js';
import { zoomable } from './map.js';

const RENT_CUT_AT = 40;    // en yüksek güven kademesi (game/bonds.js REP_LEVELS): kira dörtte bir düşer
export const rentOf = (S, k) => Math.round(DISTRICTS[k].koy.rent * (guvenOf(S, k) >= RENT_CUT_AT ? 0.75 : 1));
// bugün bu mahallede yaklaşık ziyaretçi
export const crowdOf = (S, k) => Math.round(TOWNS[k].traffic * Object.values(SPOTS[k])[0].traffic * dayMods(S.day, k).traffic);
// en çok aranan açık türler
const topGenres = (S, k) => { const d = demandOf(S, k); return GENRE_KEYS.filter(g => genreOpen(S, g)).sort((a, b) => d[b] - d[a]).slice(0, 3); };
// sıradaki olay: bugün ya da kaç gün sonra
function nextEvent(S, k) {
  for (let i = 0; i < 14; i++) { const e = districtEvent(S.day + i, k); if (e) return { e, in: i }; }
  return null;
}
const reqText = r => r.kind === 'coins' ? `🪙 ₺${r.need}`
  : r.kind === 'shelfLv' ? `${SHELF_LEVELS[r.need].icon} ${SHELF_LEVELS[r.need].name}`
  : r.kind === 'rep' ? T`💛 ${TOWNS[r.town].name} güveni ${r.need} (şimdi ${r.have})`
  : T`💛 ${r.need} mahallede güven ${r.min} (şimdi ${r.have})`;

export const guvenBar = (S, k) => { const g = guvenOf(S, k); return `<span class="kbar"><i style="width:${Math.round(100 * g / GUVEN_MAX)}%"></i></span><b>${g}</b>`; };

// Mahalle kartının gövdesi (harita kartı ve mekân paneli ortak)
export function districtBody(S, k) {
  const D = TOWNS[k], open = S.unlocked.includes(k), ev = nextEvent(S, k);
  const regs = REGULAR_KEYS.filter(id => homeOf(id) === k).map(id => `<span class="chip reg">${S.met.includes(id) ? REGULARS[id].name : `❔ ${T`Henüz tanışmadın`}`} <b class="hearts">${hearts(S.friends[id] || 0)}</b></span>`).join('');
  return `<p>${D.blurb}</p>
    ${open ? `<div class="kstats">
      <span>👣 ${T`bugün ~${crowdOf(S, k)} kişi`}</span><span>🏪 ${T`kira ₺${rentOf(S, k)}/gün`}</span>
      <span>${T`Aranan:`} ${topGenres(S, k).map(g => GENRES[g].icon).join(' ')}</span></div>
      <div class="kguven">💛 ${T`Güven`} ${guvenBar(S, k)}</div>` : ''}
    ${ev ? `<p class="kev">${ev.e.icon} <b>${ev.e.name}</b> · ${ev.in === 0 ? T`bugün` : ev.in === 1 ? T`yarın` : T`${ev.in} gün sonra`}${ev.in === 0 ? `<br><small>${ev.e.note}</small>` : ''}</p>` : ''}
    ${open && regs ? `<div class="chips">${regs}</div>` : ''}`;
}

// Harita: o.reveal az önce açılan mahalle (sis kalkar, yol çizilir); o.focus kartı açık gelecek mahalle
export function koyMapPanel(S, o = {}) {
  const p = openPanel(`
    <div class="wmap kmap">
      <svg class="map3d world koy" viewBox="0 0 ${KW} ${KH}">${koyMapSVG(S, o)}</svg>
      <div class="wbar"><b>🗺️ ${T`Mürekkep Koyu`}</b><span class="hint grow">${T`Bir mahalleye dokun · iki parmakla yakınlaştır`}</span>
        <span class="zoom2"><button class="btn sm" data-zin title="${T`Yakınlaştır`}">＋</button><button class="btn sm" data-zout title="${T`Uzaklaştır`}">－</button></span>
        <button class="btn sm" data-close>✕ ${T`Kapat`}</button></div>
      <div class="wcard" id="wcard"></div>
    </div>`, 'mapfull');
  const svg = p.querySelector('svg.koy');
  p.querySelector('[data-close]').onclick = closePanel;
  // dikey ekranda harita boydan doldurur ve bulunduğun mahalleye ortalanır; yatayda bütün koy görünür
  const rc = svg.getBoundingClientRect(), asp = rc.width && rc.height ? rc.width / rc.height : KW / KH;
  const w0 = asp < KW / KH ? Math.max(360, KH * asp) : KW, [cx] = [DISTRICTS[o.focus || o.reveal || S.town].koy.x];
  const zm = zoomable(svg, KW, KH, { minW: 360, init: { x: cx - w0 / 2, y: 0, w: w0, h: KH } });
  p.querySelector('[data-zin]').onclick = () => zm.zoom(1.5);
  p.querySelector('[data-zout]').onclick = () => zm.zoom(1 / 1.5);
  const card = p.querySelector('#wcard');
  const show = k => {
    const open = S.unlocked.includes(k), here = k === S.town;
    p.querySelectorAll('.klabel.sel').forEach(n => n.classList.remove('sel'));
    p.querySelector(`.klabel[data-d="${k}"]`)?.classList.add('sel');
    let foot = '';
    if (here) foot = `<p class="hint">📍 ${T`Buradasın.`}</p>`;
    else if (open) { const why = canTravel(S, k); foot = `<div class="row end"><button class="btn hl" data-go ${why ? 'disabled' : ''}>${why ? tw(why) : T`🚐 Buraya git`}</button></div>`; }
    else {
      const reqs = openReqs(S, k), why = canOpenDistrict(S, k), cost = DISTRICTS[k].koy.open?.coins;
      foot = `<ul class="kreq">${reqs.map(r => `<li class="${r.ok ? 'ok' : ''}">${r.ok ? '✓' : '○'} ${reqText(r)}</li>`).join('')}</ul>
        <div class="row end"><button class="btn hl" data-open ${why ? 'disabled' : ''}>${why ? tw(why) : cost ? T`₺${cost} · Mahalleyi aç` : T`Mahalleyi aç`}</button></div>`;
    }
    card.innerHTML = `<div class="wc-head"><span class="kicon">${open ? '🏘️' : '🔒'}</span><div><b>${TOWNS[k].name}</b><small>${open ? T`Mürekkep Koyu` : T`Sisli mahalle`}</small></div></div>
      ${districtBody(S, k)}${foot}`;
    card.classList.add('show');
    card.querySelector('[data-go]')?.addEventListener('click', () => { card.classList.remove('show'); driveKoy(svg, S.town, k, () => act('travel', k)); });
    card.querySelector('[data-open]')?.addEventListener('click', () => act('district', k));
  };
  p.querySelectorAll('[data-d]').forEach(g => g.addEventListener('click', () => show(g.dataset.d)));
  show(o.focus || o.reveal || S.town);
  return p;
}

// Araba yolda: mahalleler arası yol boyunca gider
function driveKoy(svg, from, to, done) {
  const r = roadPath(from, to), van = svg.querySelector('#kvan'), t0 = performance.now(), dur = 1100;
  (function step(now) {
    const k = Math.min((now - t0) / dur, 1), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, [x, y] = r.at(e);
    van.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - 26 - Math.abs(Math.sin(k * 20)) * 4).toFixed(1)})`);
    if (k < 1) requestAnimationFrame(step); else setTimeout(done, 200);
  })(t0);
}

// Mekân hapı (sol üst): bulunduğun mahallenin kartı ve haritaya geçiş
export function districtPanel(S) {
  const k = S.town;
  const p = openPanel(`<h2>📍 ${TOWNS[k].name} <span class="hint">· ${SPOTS[k][S.spot].name}</span></h2>
    ${districtBody(S, k)}
    <p class="hint">${T`Güven: burada dükkân açtığın her gün, her satış ve memnun ayrılan her pazarlık artırır; kızıp gidenler azaltır. Güven yükseldikçe müşteriler daha az pazarlık eder, ${RENT_CUT_AT} güvende kira dörtte bir düşer.`}</p>
    <div class="row end"><button class="btn" data-map>🗺️ ${T`Harita`}</button><button class="btn hl" data-close>${T`Tamam`}</button></div>`);
  p.querySelector('[data-map]').onclick = () => act('map');
  p.querySelector('[data-close]').onclick = closePanel;
  return p;
}
