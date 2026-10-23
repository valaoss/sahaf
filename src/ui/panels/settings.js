// Ayarlar: ses, ipuçları, kolay mod, görünüm, yazı boyutu, dil, kayıt.
// Ortak durum ve yardımcılar ui/kit.js'te; ana arayüzün işlevlerine (raf, konfeti, konuşma) K.ui üzerinden ulaşılır.
import { BAL } from '../../data/balance.js';
import { T, LANG } from '../../i18n/i18n.js';
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


// Ayarlar: müzik, ses efektleri, kaydı sıfırlama (iki adımlı onay)
export function settingsPanel(set, S = null) {
  const row = (k, label) => `<div class="dcard"><div class="dicon">${k === 'music' ? '🎵' : k === 'hints' ? '🔍' : k === 'allTags' ? '🏷️' : k === 'paint' ? '🖌️' : k === 'simple' ? '🎞️' : '🔔'}</div><div class="gname">${label}</div>
    <button class="btn sm toggle ${set[k] ? 'hl' : ''}" data-toggle="${k}">${set[k] ? T`Açık` : T`Kapalı`}</button></div>`;
  const p = openPanel(`
    <h2>⚙️ ${T`Ayarlar`}</h2>
    <div class="dgrid one">${row('music', T`Müzik`)}${row('sfx', T`Ses efektleri ve yağmur`)}${row('hints', T`Öneri ipuçları (cümledeki anahtar kelimeler)`)}${row('allTags', T`Kolay mod: kitapların bütün etiketleri baştan görünür`)}${row('paint', T`Boyanmış doku (kapatırsan telefon daha az yorulur)`)}${row('simple', T`Basit görünüm (eski çizim; oyun yeniden açılır)`)}</div>
    <h3>🌐 Dil · Language</h3><div class="swatches">${[['tr', 'Türkçe'], ['en', 'English']].map(([v, n]) => `<button class="swatch ${LANG === v ? 'is-on' : ''}" data-lang="${v}"><span>${v === 'tr' ? '🇹🇷' : '🇬🇧'}</span><small>${n}</small></button>`).join('')}</div>
    <h3>🔠 ${T`Yazı boyutu`}</h3><div class="swatches">${[[1, T`Normal`], [1.15, T`Büyük`], [1.3, T`Çok büyük`]].map(([v, n]) => `<button class="swatch ${set.textScale === v ? 'is-on' : ''}" data-scale="${v}"><span style="font-size:${v}em">Aa</span><small>${n}</small></button>`).join('')}</div>
    ${S?.upgrades.includes('plak') ? `<h3>📻 ${T`Plak çalar`}</h3><div class="swatches">${Object.keys(THEMES).map(k => `<button class="swatch ${set.theme === k ? 'is-on' : ''}" data-theme="${k}"><span>${THEMES[k].name}</span><small>${set.theme === k ? T`✓ çalıyor` : T`Çal`}</small></button>`).join('')}</div>` : ''}
    <h3>${T`Kayıt`}</h3>
    <div class="dcard"><div class="dicon">🗑️</div><div><div class="gname">${T`Baştan başla`}</div><div class="gmeta">${T`Bütün ilerleme silinir; son kayıt yedek olarak saklanır.`}</div></div>
      <button class="btn sm" data-reset>${T`Sıfırla`}</button></div>
    ${hasBackup() ? `<div class="dcard"><div class="dicon">↩️</div><div><div class="gname">${T`Yedek kaydı geri yükle`}</div><div class="gmeta">${T`Okunamayan ya da sıfırlanan son kayıt. Şimdiki oyunun yerine geçer.`}</div></div>
      <button class="btn sm" data-bak>${T`Geri yükle`}</button></div>` : ''}
    <p class="hint">${T`Sahaf · müzik ve sesler oyunun içinde üretilir, hiçbir veri toplanmaz.`}</p>
    <div class="row end"><button class="btn hl" data-close>${T`Tamam`}</button></div>`);
  p.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => act('toggle', b.dataset.toggle));
  p.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => act('theme', b.dataset.theme));
  p.querySelectorAll('[data-scale]').forEach(b => b.onclick = () => act('scale', +b.dataset.scale));
  // dil değişince oyun yeniden açılır
  p.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { if (b.dataset.lang !== LANG) act('lang', b.dataset.lang); });
  const bak = p.querySelector('[data-bak]');
  if (bak) bak.onclick = () => {
    if (bak.dataset.armed) return act('restore-bak');
    bak.dataset.armed = '1'; bak.textContent = T`Emin misin? Dokun`; bak.classList.add('danger');
  };
  const r = p.querySelector('[data-reset]');
  r.onclick = () => {
    if (r.dataset.armed) return act('reset');
    r.dataset.armed = '1'; r.textContent = T`Emin misin? Dokun`; r.classList.add('danger');
  };
  p.querySelector('[data-close]').onclick = closePanel;
}
