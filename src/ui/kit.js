// Arayüzün ortak parçaları: kök, komut (act), raf katmanı, panel açma/kapama, uyarı ve küçük yardımcılar.
// createUI (ui.js) açılışta K'yi doldurur; paneller (ui/panels/*.js) buradan alır.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { BOOK, booksOf, TAGS } from '../data/books.js';
import { DECOR, SLOTS, PAINTS, UPGRADES } from '../data/decor.js';
import { THEMES } from '../audio/compose.js';
import { worldSVG, routePath, townXY, declutter, flagSVG, WW, WH } from '../render/world.js';
import { hasBackup } from '../core/save.js';
import { settings } from '../audio/audio.js';
import { BLURBS } from '../data/blurbs.js';
import { knownTags, knowsAll, knownCount, readsLeft } from '../game/knowledge.js';
import { REP_LEVELS, repOf, repLevel, favorOpen, orderCost, ordered } from '../game/bonds.js';
import { KEEPSAKES } from '../data/keepsakes.js';
import { VOYAGE, VOYAGE_KEYS, GRAND } from '../data/voyage.js';
import { voyagePages, stat as vstat, roseDay } from '../game/voyage.js';
import { plainCopies } from '../game/shop.js';
import { paperName } from '../data/countries.js';
import { COUNTRIES, COUNTRY_KEYS } from '../data/countries.js';
import { travelInfo } from '../game/travel.js';
import { createShelfPanel } from './shelf-panel.js';
import { createShelfStage } from './shelf-stage.js';
import { KOSTAS } from '../data/kostas.js';
import { shelfCount, shelfCap, genreCount, seasonOf, dayOfSeason } from '../game/state.js';
import { boxCost, canBuyBox, canTravel, topDemand, stallOf, COND_NAME, satFactor, parkFee, upkeepOf, sponsorable } from '../game/shop.js';
import { nextShelf } from '../game/decor.js';
import { SPOTS } from '../data/spots.js';
import { REGULARS, REGULAR_KEYS, HEARTS_MAX } from '../data/regulars.js';
import { WEATHER, EVENTS } from '../data/calendar.js';
import { weatherOf, eventOf, gossipOf, specialOf } from '../game/calendar.js';
import { questText, questProgress } from '../game/mail.js';
import { SEASON } from '../data/calendar.js';
import { PAGES } from '../data/story.js';
import { nextPage, progressOf } from '../game/story.js';
import { statsOf } from '../game/stats.js';
import { HAP } from '../game/happenings.js';
import { STAMPS, STAMP_REWARD } from '../data/stamps.js';
import { stampProgress } from '../game/stamps.js';
import { personSVG, figureMeta, nameOf } from '../render/people.js';
import { ARCHETYPES } from '../data/archetypes.js';

import { T, tw, isEn } from '../i18n/i18n.js';

export const K = { root: null, act: null, stage: null, ui: null };
export const $ = id => K.root.querySelector('#' + id);
export const act = (...a) => K.act(...a);

let toastTimer = 0;
// kurallardan gelen hazır uyarılar (Paran yetmiyor. …) de sözlükten çevrilir
export function toast(msg) {
  const t = $('toast');
  t.textContent = tw(msg); t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

export function openPanel(html, cls = '') {
  const p = $('panel');
  p.innerHTML = html;
  p.className = 'panel ' + cls;
  $('veil').classList.add('open');
  return p;
}
export const closePanel = () => $('veil').classList.remove('open');
// raf modu (karavanda dizme) açıkken de zaman durur
export const isOpen = () => $('veil').classList.contains('open') || !!K.stage?.on;

// portre: figürün başını ve omuzlarını kadraja al
export const portraitBox = c => { const m = figureMeta(c.look, c.style); const top = 806 + m.headTop - 8; return `-52 ${top.toFixed(0)} 104 ${(110 * m.scale + 10).toFixed(0)}`; };

export const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const chips = (obj, cls = '') => Object.keys(obj).sort((a, b) => obj[b] - obj[a])
  .map(g => `<span class="chip ${cls}" style="--c:${GENRES[g].color}">${GENRES[g].icon} ${GENRES[g].name} <b>×${obj[g]}</b></span>`).join('');
export const hearts = n => '♥'.repeat(n) + '♡'.repeat(HEARTS_MAX - n);
export const SCENE_ICON = { sahil: '🏖️', carsi: '🛍️', tepe: '⛰️' };
export const level = (x, lo, hi) => x >= hi ? T`çok` : x <= lo ? T`az` : T`orta`;
// Cümledeki etiket söyleyişlerini işaretle (öneri ipucu): <mark data-tag="..">
export function markAsk(text) {
  // Türkçe küçük harfe çevirmek uzunluğu değiştirmez (İ→i, I→ı), konumlar korunur
  // Türkçede "I" → "ı" olur; İngilizcede İngilizce kurallarla küçültülür (uzunluk aynı kalır, konumlar korunur)
  const low = text.toLocaleLowerCase(isEn() ? 'en' : 'tr'), hits = [];
  for (const t in TAGS) for (const say of [...TAGS[t].say, ...(TAGS[t].hint || [])]) {
    const m = low.indexOf(say);
    if (m >= 0) hits.push({ t, at: m, len: say.length });
  }
  hits.sort((a, b) => a.at - b.at || b.len - a.len);
  let out = '', i = 0;
  for (const h of hits) {
    if (h.at < i) continue;
    out += text.slice(i, h.at) + `<mark data-tag="${h.t}" title="${TAGS[h.t].icon} ${TAGS[h.t].name}">${text.slice(h.at, h.at + h.len)}</mark>`;
    i = h.at + h.len;
  }
  return out + text.slice(i);
}
export const tagChips = tags =>tags.map(t => `<span class="tag">${TAGS[t].icon} ${TAGS[t].name}</span>`).join('');
// kitabın oyuncunun bildiği etiketleri; bilinmeyenler ❔ (⚙️ kolay modda hepsi görünür)
export const shownTags = (S, b) => settings.allTags ? b.tags : knownTags(S, b.id);
export const bookTags = (S, b) => {
  const k = shownTags(S, b), unk = b.tags.length - k.length;
  return tagChips(k) + (unk > 0 ? `<span class="tag unk" title="${T`Henüz bilmiyorsun: satınca, önerince ya da okuyunca öğrenirsin`}">${'❔'.repeat(unk)}</span>` : '');
};
export const BOOKS_N = GENRE_KEYS.reduce((n, g) => n + booksOf(g).length, 0);
export const blurbOf = b => BLURBS[b.id] ? `<span class="bblurb">${BLURBS[b.id]}</span>` : '';
