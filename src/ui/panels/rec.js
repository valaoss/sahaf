// Öneri paneli (müşterinin isteği, kitap kartları, sohbet, rica) ve gün içi olay kartı.
// Ortak durum ve yardımcılar ui/kit.js'te; ana arayüzün işlevlerine (raf, konfeti, konuşma) K.ui üzerinden ulaşılır.
import { BAL } from '../../data/balance.js';
import { T } from '../../i18n/i18n.js';
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
import { K, openPanel, closePanel, portraitBox, chips, hearts, markAsk, shownTags, bookTags, blurbOf } from '../kit.js';


// Öneri: müşterinin isteği + raftaki farklı kitaplar (türe göre süzülebilir)
// extra: { onTalk() → { text, genre }, tea: çay köşesi var mı, teaLine() → cümle }
export function recPanel(S, c, onPick, hints = true, extra = {}) {
  const opts = {};
  const ids = Object.keys(S.shelf);
  const genres = GENRE_KEYS.filter(g => ids.some(id => BOOK[id].genre === g));
  const tabs = `<button class="tab is-on" data-f="">${T`Hepsi`}</button>` +
    genres.map(g => `<button class="tab" data-f="${g}">${GENRES[g].icon}</button>`).join('');
  const cards = GENRE_KEYS.flatMap(g => booksOf(g)).filter(b => S.shelf[b.id]).map(b => `
    <button class="bcard" data-book="${b.id}" data-g="${b.genre}" style="--c:${GENRES[b.genre].color}">
      <span class="btitle">${b.title}</span><span class="bauthor">${b.author}</span>
      ${blurbOf(b)}<span class="btags">${bookTags(S, b)}</span>${S.shelf[b.id] > 1 ? `<span class="bcount">×${S.shelf[b.id]}</span>` : ''}
      ${S.rare[b.id] ? `<span class="rarebadge">✨ ${T`İlk baskı`}${S.rare[b.id] > 1 ? ' ×' + S.rare[b.id] : ''}</span>` : ''}
    </button>`).join('');
  const R = c.reg && REGULARS[c.reg];
  // ilk karşılaşmada kendini tanıtır, sonra kalp sayısına göre hikâyesinden bir parça anlatır
  const h = R ? S.friends[c.reg] || 0 : 0;
  const chat = !R ? null : !S.met.includes(c.reg) ? R.hello : h ? R.story[h - 1] : null;
  const who = R ? `${R.name} <span class="hearts">${hearts(h)}</span>`
    : `${nameOf(c.look, ARCHETYPES[c.arch]?.names)}${c.arch ? ` <span class="arch">· ${ARCHETYPES[c.arch].name}</span>` : ''}`;
  const p = openPanel(`
    <div class="rec-head">
      <div class="portrait"><svg viewBox="${portraitBox(c)}">${personSVG(c.look, c.style)}</svg></div>
      <div><div class="name">${who}</div>
        ${chat ? `<p class="hello">“${chat}”</p>` : ''}
        <p class="say">“${hints ? markAsk(c.ask.text) : c.ask.text}”</p>${c.ask.rare ? `<p class="hint">✨ ${T`İlk baskı arıyor: ilk baskı verirsen kat kat öder.`}</p>` : ''}</div>
    </div>
    <div class="talk2">
      ${extra.onTalk && !c.talked ? `<button class="btn sm" data-talk>💬 ${T`Biraz daha anlatır mısın?`}</button>` : ''}
      ${extra.tea ? `<button class="btn sm" data-tea>🍵 ${T`Çay ikram et`}</button>` : ''}
      <button class="btn sm" data-disc title="${T`Önerdiğin kitap isteğe uymazsa yine de %${Math.round((1 - BAL.discount) * 100)} indirimle satılır (bahşiş yok)`}">🏷️ ${T`Uymazsa indirim`}</button>
    </div>
    ${extra.favor ? `<div class="favor2">🎁 ${T`Ricası:`} <b>«${BOOK[extra.favor].title}»</b>${plainCopies(S, extra.favor) > 0 ? ` <button class="btn sm hl" data-favor>${T`Ricasını ver`}</button>` : ` <span class="hint">${ordered(S, extra.favor) ? T`siparişin yolda` : T`rafında yok; toptancıdan sipariş edebilirsin`}</span>`}</div>` : ''}
    <div class="tabs">${tabs}</div>
    <div class="bgrid">${cards || `<p class="hint">${T`Rafta hiç kitap yok…`}</p>`}</div>
    <div class="row end"><button class="btn" data-none>🤷 ${T`Elimde yok`}</button></div>`, 'wide rec');
  p.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    p.querySelectorAll('.tab').forEach(x => x.classList.toggle('is-on', x === t));
    p.querySelectorAll('.bcard').forEach(b => { b.style.display = !t.dataset.f || b.dataset.g === t.dataset.f ? '' : 'none'; });
  });
  p.querySelectorAll('[data-book]').forEach(b => b.onclick = () => { closePanel(); onPick(b.dataset.book, opts); });
  p.querySelector('[data-none]').onclick = () => { closePanel(); onPick(null, opts); };
  p.querySelector('[data-favor]')?.addEventListener('click', () => { closePanel(); extra.onFavor(); });
  const say = text => { const n = document.createElement('p'); n.className = 'hello'; n.textContent = '“' + text + '”'; p.querySelector('.rec-head > div:last-child').appendChild(n); };
  p.querySelector('[data-talk]')?.addEventListener('click', e => {
    const h = extra.onTalk();
    e.currentTarget.remove();
    if (!h) return;
    say(h.text);
    // söylediği türün sekmesi seçilir
    p.querySelector(`.tab[data-f="${h.genre}"]`)?.click();
  });
  p.querySelector('[data-tea]')?.addEventListener('click', e => { opts.tea = true; e.currentTarget.disabled = true; e.currentTarget.textContent = '🍵 ' + T`Çay ikram edildi`; say(extra.teaLine()); });
  p.querySelector('[data-disc]').addEventListener('click', e => { opts.discount = !opts.discount; e.currentTarget.classList.toggle('hl', opts.discount); });
  p.querySelectorAll('mark[data-tag]').forEach(m => m.onclick = () => {
    const on = !m.classList.contains('is-on');
    p.querySelectorAll('mark[data-tag]').forEach(x => x.classList.toggle('is-on', x === m && on));
    p.querySelectorAll('.tab').forEach(x => x.classList.toggle('is-on', !x.dataset.f));
    // süzgeç yalnız bildiğin etiketlere bakar (bilinmeyen etiketli kitaplar da görünür kalır: tanıtımı oku)
    p.querySelectorAll('.bcard').forEach(b => { const B = BOOK[b.dataset.book], k = shownTags(S, B); b.style.display = !on || k.includes(m.dataset.tag) || k.length < B.tags.length ? '' : 'none'; });
  });
}

// Gün içi olay kartı: seçenekler, sonra sonuç
export function hapPanel(H, onChoose) {
  const p = openPanel(`
    <div class="hap"><div class="big-icon">${H.icon}</div><h2>${H.title}</h2><p class="say">${H.text}</p></div>
    <div class="row center">${H.choices.map((c, i) => `<button class="btn ${i === 0 ? 'hl' : ''}" data-ch="${i}">${c.label}</button>`).join('')}</div>`);
  p.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => {
    const r = onChoose(+b.dataset.ch);
    p.innerHTML = `<div class="hap"><div class="big-icon">${H.icon}</div><h2>${H.title}</h2><p class="say">${r.text}</p>
      ${r.tags.length ? `<div class="chips center">${r.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>` : ''}</div>
      <div class="row center"><button class="btn hl" data-ok>${T`Devam`}</button></div>`;
    p.querySelector('[data-ok]').onclick = () => { closePanel(); r.after && r.after(); };
  });
}
