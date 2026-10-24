// Arayüz: üst bilgi, alt düğmeler, rehber, raf katmanı, konuşma balonları; paneller ui/panels/*.js'te.
// Durumu değiştirmez; eylemleri main.js'e `act` üzerinden iletir.
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
import { K, $, toast, openPanel, closePanel, isOpen, portraitBox, hhmm, chips, hearts, SCENE_ICON, level, markAsk, tagChips, shownTags, bookTags, BOOKS_N, blurbOf } from './kit.js';
import { stockPanel, spotPanel, giftPanel, decorPanel } from './panels/shop.js';
import { recPanel, hapPanel } from './panels/rec.js';
import { mapPanel } from './panels/map.js';
import { summaryPanel, paperPanel } from './panels/day.js';
import { voyagePanel, grandPanel, mailPanel, kostasPanel, kostasFoundPanel, statsPanel, bookPanel, albumPanel, finalePanel } from './panels/book.js';
import { settingsPanel } from './panels/settings.js';
import { hagglePanel } from './panels/haggle.js';
import { T, tw } from '../i18n/i18n.js';

export function createUI(root, act) {
  K.root = root; K.act = act;
  root.innerHTML = `
    <div class="top">
      <div class="col">
        <span class="pill where" id="where" data-a="spot" title="${T`Mekân`}"></span>
        <span class="pill clock"><span id="time"></span><span class="bar"><i id="bar"></i></span></span>
      </div>
      <div class="col right">
        <span class="pill coins">🪙 <b id="coins"></b></span>
        <span class="pill shelf">📚 <span id="shelf"></span></span>
        <span class="icons"><button class="pill gear" data-a="decor" title="${T`Atölye`}">🔨</button><button class="pill gear" data-a="book" title="${T`Defter`}">📜</button><button class="pill gear" id="gear" title="${T`Ayarlar`}">⚙️</button></span>
      </div>
    </div>
    <div class="bottom" id="bottom"></div>
    <div class="toast" id="toast"></div>
    <div class="veil" id="veil"><div class="panel" id="panel"></div></div>`;
  const $ = id => root.querySelector('#' + id);
  const hudMemo = {};
  const put = (id, v, prop = 'textContent') => {
    if (hudMemo[id + prop] === v) return;
    hudMemo[id + prop] = v;
    if (prop === 'width') $(id).style.width = v; else $(id)[prop] = v;
  };
  function hud(S, speed) {
    K.S = S;
    put('where', T`${WEATHER[weatherOf(S.day)].icon} ${TOWNS[S.town].name} · ${SPOTS[S.town][S.spot].name} · ${S.day}. gün`);
    put('time', hhmm(Math.round(S.clock)));
    put('bar', ((S.clock - BAL.dayStart) / (BAL.dayEnd - BAL.dayStart) * 100).toFixed(0) + '%', 'width');
    put('coins', String(S.coins));
    put('shelf', `${shelfCount(S)}/${shelfCap(S)}`);
    const b = $('bottom');
    const want = S.phase + speed + S.town + S.spot + S.crate.length;
    if (b.dataset.k === want) return;
    b.dataset.k = want;
    if (S.phase === 'morning') {
      const sp = SPOTS[S.town][S.spot];
      // v3: sabah yalnız ana işler; mekân üstteki konum hapında, süs ve defter sağ üstteki simgelerde
      b.innerHTML = `<button class="btn" data-a="stock">📦 ${T`Toptancı`}</button>
        ${S.crate.length ? `<button class="btn hl2" data-a="inside">📚 ${T`Diz`} <b class="badge2">${S.crate.length}</b></button>` : ''}
        <button class="btn" data-a="map">🗺️ ${T`Harita`}</button>
        <button class="btn hl" data-a="open">🔔 ${T`Dükkânı aç`}</button>`;
    } else if (S.phase === 'open') {
      b.innerHTML = `<button class="btn ${speed > 1 ? 'hl' : ''}" data-a="speed">${speed > 1 ? '⏩ ' + T`Hızlı` : '▶️ ' + T`Normal`}</button>`;
    } else b.innerHTML = '';
  }
  // konum hapı mekân panelini, sağ üst simgeler süs ve defteri açar (yalnız sabah: gün içinde panel saati durdurur)
  root.querySelector('.top').addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a && K.S?.phase !== 'open') act(a.dataset.a); });
  $('gear').addEventListener('click', () => act('settings'));
  $('bottom').addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a) act(a.dataset.a); });

  // İlk günlerin rehber balonu: hedef düğme parlar; × ile kapatılır
  let coachKey = '';
  function coach(step) {
    const key = step ? step.text : '';
    if (key === coachKey) return;
    coachKey = key;
    root.querySelectorAll('.pulse').forEach(e => e.classList.remove('pulse'));
    let box = $('coach');
    if (!step) { box?.remove(); return; }
    if (!box) { box = document.createElement('div'); box.id = 'coach'; box.className = 'coach'; root.appendChild(box); }
    box.innerHTML = `<span>💡 ${step.text}</span><button class="x" title="${T`Rehberi kapat`}">×</button>`;
    box.querySelector('.x').onclick = () => act('tutskip');
    if (step.target) setTimeout(() => root.querySelector(step.target)?.classList.add('pulse'), 60);
  }

  // Karavanın içi: raf düzenleyici (ui/shelf-panel.js)
  const shelves = createShelfPanel({ openPanel, closePanel, act, toast });
  // yeni motorda kitaplar karavanın kendisinde dizilir; basit görünümde panel
  const interiorPanel = S => K.stage ? (K.stage.on ? K.stage.render(S) : K.stage.open(S)) : shelves.render(S);
  const useStage = map => { K.stage = createShelfStage(root, { act, map }); };


  // Müşterinin karşılığı: küçük portreli konuşma kartı, birkaç saniye sonra kaybolur
  let speechTimer = 0;
  function speech(c, text, grade, note = '', at = null) {
    let box = $('speech');
    if (!box) { box = document.createElement('div'); box.id = 'speech'; box.className = 'speech'; root.appendChild(box); }
    const R = c.reg && REGULARS[c.reg];
    const name = R ? R.name : nameOf(c.look, ARCHETYPES[c.arch]?.names);
    box.className = 'speech ' + (grade || '');
    box.innerHTML = `<div class="name">${name}${note ? ` · <small>${note}</small>` : ''}</div><p>“${text}”</p>`;
    const xf = at ? at.xf : 0.5, yf = at ? at.yf : 0.45;
    // ekran kenarına taşmasın; kuyruk yine de kişiyi göstersin
    const fw = root.clientWidth, bw = box.offsetWidth, want = xf * fw;
    const left = Math.min(fw - bw / 2 - 8, Math.max(bw / 2 + 8, want));
    box.style.left = left.toFixed(0) + 'px';
    box.style.top = (Math.max(0.2, yf) * 100).toFixed(1) + '%';
    box.style.setProperty('--tail', Math.min(88, Math.max(12, (want - left) / bw * 100 + 50)).toFixed(0) + '%');
    box.classList.add('show');
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => box.classList.remove('show'), 3200);
  }

  // Para kasaya uçar: (xf, yf) sahne içi oran, hedef üstteki para hapı
  function flyCoin(xf, yf) {
    const c = document.createElement('div');
    c.className = 'coinfly';
    c.textContent = '🪙';
    c.style.left = (xf * 100) + '%';
    c.style.top = (yf * 100) + '%';
    root.appendChild(c);
    const a = root.getBoundingClientRect(), b = $('coins').getBoundingClientRect();
    requestAnimationFrame(() => {
      c.style.transform = `translate(${b.left - a.left - c.offsetLeft}px, ${b.top - a.top - c.offsetTop}px) scale(.6)`;
      c.style.opacity = '0.2';
    });
    setTimeout(() => c.remove(), 750);
  }

  // Konfeti: yeni pul, hediye, defter sayfası
  function confetti() {
    const cols = ['#f08a7e', '#f2c45a', '#5b8bd0', '#8bc49a', '#b98ad6', '#f6a5c0'];
    for (let i = 0; i < 46; i++) {
      const d = document.createElement('i');
      d.className = 'confetto';
      d.style.left = (Math.random() * 100) + '%';
      d.style.background = cols[i % cols.length];
      d.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';
      d.style.setProperty('--drift', ((Math.random() - 0.5) * 160).toFixed(0) + 'px');
      d.style.setProperty('--spin', (360 + Math.random() * 540).toFixed(0) + 'deg');
      root.appendChild(d);
      setTimeout(() => d.remove(), 2400);
    }
  }

  const api = { grandPanel, voyagePanel, useStage, stageOn: () => !!K.stage?.on, stageTick: () => K.stage?.tick(), hud, toast, speech, interiorPanel, coach, statsPanel, flyCoin, confetti, hapPanel, kostasPanel, kostasFoundPanel, mailPanel, paperPanel, bookPanel, albumPanel, finalePanel, settingsPanel, stockPanel, spotPanel, giftPanel, decorPanel, mapPanel, recPanel, hagglePanel, summaryPanel, closePanel, isOpen };
  K.ui = api;
  return api;
}
