// Arayüz: üst bilgi, alt düğmeler ve paneller (toptancı, süsle, harita, öneri, gün sonu).
// Durumu değiştirmez; eylemleri main.js'e `act` üzerinden iletir.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { BOOK, booksOf, TAGS } from '../data/books.js';
import { DECOR, SLOTS, PAINTS } from '../data/decor.js';
import { shelfCount, shelfCap, genreCount, seasonOf, dayOfSeason } from '../game/state.js';
import { boxCost, canBuyBox, canTravel, topDemand } from '../game/shop.js';
import { nextShelf } from '../game/decor.js';
import { SPOTS } from '../data/spots.js';
import { REGULARS, REGULAR_KEYS, HEARTS_MAX } from '../data/regulars.js';
import { WEATHER, EVENTS } from '../data/calendar.js';
import { weatherOf, eventOf, gossipOf } from '../game/calendar.js';
import { SEASON } from '../data/calendar.js';
import { PAGES } from '../data/story.js';
import { nextPage, progressOf } from '../game/story.js';
import { STAMPS, STAMP_REWARD } from '../data/stamps.js';
import { stampProgress } from '../game/stamps.js';
import { personSVG, nameOf } from '../render/people.js';

const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const chips = (obj, cls = '') => Object.keys(obj).sort((a, b) => obj[b] - obj[a])
  .map(g => `<span class="chip ${cls}" style="--c:${GENRES[g].color}">${GENRES[g].icon} ${GENRES[g].name} <b>×${obj[g]}</b></span>`).join('');
const hearts = n => '♥'.repeat(n) + '♡'.repeat(HEARTS_MAX - n);
const SCENE_ICON = { sahil: '🏖️', carsi: '🛍️', tepe: '⛰️' };
const level = (x, lo, hi) => x >= hi ? 'çok' : x <= lo ? 'az' : 'orta';
const tagChips = tags =>tags.map(t => `<span class="tag">${TAGS[t].icon} ${TAGS[t].name}</span>`).join('');

export function createUI(root, act) {
  root.innerHTML = `
    <div class="top">
      <div class="col">
        <span class="pill where" id="where" title="Gazete"></span>
        <span class="pill clock"><span id="time"></span><span class="bar"><i id="bar"></i></span></span>
      </div>
      <div class="col right">
        <span class="pill coins">🪙 <b id="coins"></b></span>
        <span class="pill shelf">📚 <span id="shelf"></span></span>
        <button class="pill gear" id="gear" title="Ayarlar">⚙️</button>
      </div>
    </div>
    <div class="bottom" id="bottom"></div>
    <div class="toast" id="toast"></div>
    <div class="veil" id="veil"><div class="panel" id="panel"></div></div>`;
  const $ = id => root.querySelector('#' + id);
  let toastTimer = 0;

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function openPanel(html, cls = '') {
    const p = $('panel');
    p.innerHTML = html;
    p.className = 'panel ' + cls;
    $('veil').classList.add('open');
    return p;
  }
  const closePanel = () => $('veil').classList.remove('open');
  const isOpen = () => $('veil').classList.contains('open');

  function hud(S, speed) {
    $('where').textContent = `${WEATHER[weatherOf(S.day)].icon} ${TOWNS[S.town].name} · ${seasonOf(S.day)}, ${dayOfSeason(S.day)}. gün · 📰`;
    $('time').textContent = hhmm(Math.round(S.clock));
    $('bar').style.width = ((S.clock - BAL.dayStart) / (BAL.dayEnd - BAL.dayStart) * 100).toFixed(1) + '%';
    $('coins').textContent = S.coins;
    $('shelf').textContent = `${shelfCount(S)}/${shelfCap(S)}`;
    const b = $('bottom');
    const want = S.phase + speed + S.spot;
    if (b.dataset.k === want) return;
    b.dataset.k = want;
    if (S.phase === 'morning') {
      const sp = SPOTS[S.town][S.spot];
      b.innerHTML = `<button class="btn" data-a="spot">📍 ${sp.name}</button>
        <button class="btn" data-a="stock">📦 Toptancı</button>
        <button class="btn" data-a="decor">🪴 Süsle</button>
        <button class="btn" data-a="map">🗺️ Harita</button>
        <button class="btn" data-a="book">📜 Defter</button>
        <button class="btn hl" data-a="open">🔔 Dükkânı aç</button>`;
    } else if (S.phase === 'open') {
      b.innerHTML = `<button class="btn ${speed > 1 ? 'hl' : ''}" data-a="speed">${speed > 1 ? '⏩ Hızlı' : '▶️ Normal'}</button>`;
    } else b.innerHTML = '';
  }
  $('where').addEventListener('click', () => act('paper'));
  $('gear').addEventListener('click', () => act('settings'));
  $('bottom').addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a) act(a.dataset.a); });

  function stockPanel(S) {
    const hot = topDemand(S.town).map(g => `${GENRES[g].icon} ${GENRES[g].name}`).join(', ');
    const missed = S.lastDay && S.lastDay.town === S.town && Object.keys(S.lastDay.missed).length
      ? `<p class="hint">Dün burada aranıp bulunamayan: ${chips(S.lastDay.missed, 'sm')}</p>` : '';
    const cards = GENRE_KEYS.map(g => {
      const G = GENRES[g], why = canBuyBox(S, g);
      return `<div class="gcard" style="--c:${G.color}">
        <div class="gicon">${G.icon}</div>
        <div class="gname">${G.name}</div>
        <div class="gmeta">Rafta <b>${genreCount(S, g)}</b> · Satış ₺${G.price}</div>
        <button class="btn sm ${why ? 'off' : ''}" data-buy="${g}" title="${why || ''}">+ Koli (${BAL.boxSize}) · ₺${boxCost(g)}</button>
      </div>`;
    }).join('');
    const p = openPanel(`
      <h2>📦 Toptancı</h2>
      <p class="hint">Bu kasabada çok aranan: <b>${hot}</b></p>${missed}
      <div class="gridline"><span>🪙 <b>${S.coins}</b></span><span>📚 Raflar <b>${shelfCount(S)}/${shelfCap(S)}</b></span></div>
      <div class="ggrid">${cards}</div>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`, 'wide');
    p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => act('buy', b.dataset.buy));
    p.querySelector('[data-close]').onclick = closePanel;
  }

  function spotPanel(S) {
    const spots = SPOTS[S.town];
    const cards = Object.keys(spots).map(k => {
      const sp = spots[k], here = S.spot === k;
      const hot = Object.keys(sp.demand).map(g => GENRES[g].icon).join(' ');
      return `<div class="dcard spot ${here ? 'is-on' : ''}"><div class="dicon">${SCENE_ICON[sp.scene]}</div>
        <div><div class="gname">${sp.name}</div><div class="gmeta">${sp.desc}</div>
        <div class="gmeta">👣 Kalabalık: <b>${level(sp.traffic, .9, 1.2)}</b> · 💬 Öneri: <b>${level(sp.ask, .9, 1.3)}</b> · Sevilen: ${hot}</div></div>
        ${here ? '<span class="on">✓ Buradasın</span>' : `<button class="btn sm" data-spot="${k}">Burada kur</button>`}</div>`;
    }).join('');
    const regs = REGULAR_KEYS.filter(id => REGULARS[id].town === S.town).map(id => {
      const met = S.met.includes(id);
      return `<span class="chip reg">${met ? REGULARS[id].name : '❔ Henüz tanışmadın'} <b class="hearts">${hearts(S.friends[id] || 0)}</b></span>`;
    }).join('');
    const p = openPanel(`
      <h2>📍 Karavanı nereye kuralım?</h2>
      <p class="hint">${TOWNS[S.town].name} içinde yer değiştirmek ücretsiz. Kalabalık yerde satış, sakin yerde sohbet ve öneri çok olur.</p>
      <div class="dgrid one">${cards}</div>
      <h3>Bu kasabanın müdavimleri</h3><div class="chips">${regs}</div>
      <p class="hint">Müdavimler 💌 balonuyla gelir. Zevklerine tam uyan her öneri bir kalp; 5 kalpte bir hediye bırakırlar.</p>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`, 'wide');
    p.querySelectorAll('[data-spot]').forEach(b => b.onclick = () => act('spot', b.dataset.spot));
    p.querySelector('[data-close]').onclick = closePanel;
  }

  // Müdavimin hediyesi: küçük bir mektup
  function giftPanel(f) {
    const R = REGULARS[f.id], d = f.gift && DECOR[f.gift];
    const p = openPanel(`
      <div class="letter">
        <h2>💌 Bir not var · ${R.name}</h2>
        <p class="say">“${R.giftNote}”</p>
        ${d ? `<div class="dcard is-on"><div class="dicon">${d.icon}</div><div><div class="gname">${d.name}</div><div class="gmeta">${d.desc}</div></div></div>
          <p class="hint">🪴 Süsle panelinden takabilirsin.</p>` : `<p class="gold big">+₺${f.coins}</p>`}
      </div>
      <div class="row end"><button class="btn hl" data-close>Teşekkürler!</button></div>`);
    p.querySelector('[data-close]').onclick = closePanel;
  }

  function decorPanel(S) {
    const slots = Object.keys(SLOTS).map(slot => {
      const items = Object.keys(DECOR).filter(k => DECOR[k].slot === slot).map(k => {
        const d = DECOR[k], on = S.decor.on[slot] === k, owned = S.decor.owned.includes(k);
        if (d.gift && !owned) {
          return `<div class="dcard locked"><div class="dicon">🎁</div>
            <div><div class="gname">Gizli hediye</div><div class="gmeta">${d.gift === 'story' ? 'Kayıp kütüphaneyi bul.' : `Bir müdavimle dost ol (${TOWNS[REGULARS[d.gift].town].name}).`}</div></div></div>`;
        }
        const btn = on ? '<span class="on">✓ Takılı</span>'
          : `<button class="btn sm ${!owned && S.coins < d.price ? 'off' : ''}" data-decor="${k}">${owned ? 'Tak' : `₺${d.price} · Al`}</button>`;
        return `<div class="dcard ${on ? 'is-on' : ''}"><div class="dicon">${d.icon}</div>
          <div><div class="gname">${d.name}</div><div class="gmeta">${d.desc}</div></div>${btn}</div>`;
      }).join('');
      return `<h3>${SLOTS[slot].name}</h3><div class="dgrid">${items}</div>`;
    }).join('');
    const ns = nextShelf(S);
    const shelfCard = ns
      ? `<div class="dcard"><div class="dicon">📚</div><div><div class="gname">Raf genişletme</div>
          <div class="gmeta">${shelfCap(S)} → ${ns.cap} kitap</div></div>
          <button class="btn sm ${S.coins < ns.price ? 'off' : ''}" data-shelf>₺${ns.price} · Yap</button></div>`
      : `<div class="dcard is-on"><div class="dicon">📚</div><div><div class="gname">Raflar</div><div class="gmeta">En büyük hâlinde (${shelfCap(S)} kitap)</div></div><span class="on">✓</span></div>`;
    const paints = Object.keys(PAINTS).map(k => {
      const p = PAINTS[k], on = S.paint === k, owned = S.paints.includes(k);
      return `<button class="swatch ${on ? 'is-on' : ''}" data-paint="${k}" style="--b:${p.body};--e:${p.edge}">
        <i></i><span>${p.name}</span><small>${on ? '✓' : owned ? 'Seç' : '₺' + p.price}</small></button>`;
    }).join('');
    const p = openPanel(`
      <h2>🪴 Süsle ve geliştir</h2>
      <p class="hint">Süsler müşterileri etkiler; her yuvaya bir tane takılır. Aldığın süs sende kalır. 🪙 <b>${S.coins}</b></p>
      ${slots}
      <h3>Atölye</h3><div class="dgrid">${shelfCard}</div>
      <h3>Karavan boyası</h3><div class="swatches">${paints}</div>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`, 'wide');
    p.querySelectorAll('[data-decor]').forEach(b => b.onclick = () => act('decor-on', b.dataset.decor));
    p.querySelectorAll('[data-paint]').forEach(b => b.onclick = () => act('paint', b.dataset.paint));
    p.querySelector('[data-shelf]')?.addEventListener('click', () => act('shelf'));
    p.querySelector('[data-close]').onclick = closePanel;
    return p;
  }

  // Öneri: müşterinin isteği + raftaki farklı kitaplar (türe göre süzülebilir)
  function recPanel(S, c, onPick) {
    const ids = Object.keys(S.shelf);
    const genres = GENRE_KEYS.filter(g => ids.some(id => BOOK[id].genre === g));
    const tabs = `<button class="tab is-on" data-f="">Hepsi</button>` +
      genres.map(g => `<button class="tab" data-f="${g}">${GENRES[g].icon}</button>`).join('');
    const cards = GENRE_KEYS.flatMap(g => booksOf(g)).filter(b => S.shelf[b.id]).map(b => `
      <button class="bcard" data-book="${b.id}" data-g="${b.genre}" style="--c:${GENRES[b.genre].color}">
        <span class="btitle">${b.title}</span><span class="bauthor">${b.author}</span>
        <span class="btags">${tagChips(b.tags)}</span>${S.shelf[b.id] > 1 ? `<span class="bcount">×${S.shelf[b.id]}</span>` : ''}
      </button>`).join('');
    const R = c.reg && REGULARS[c.reg];
    // ilk karşılaşmada kendini tanıtır, sonra kalp sayısına göre hikâyesinden bir parça anlatır
    const h = R ? S.friends[c.reg] || 0 : 0;
    const chat = !R ? null : !S.met.includes(c.reg) ? R.hello : h ? R.story[h - 1] : null;
    const who = R ? `${R.name} <span class="hearts">${hearts(h)}</span>` : nameOf(c.look);
    const p = openPanel(`
      <div class="rec-head">
        <div class="portrait"><svg viewBox="-62 540 124 150">${personSVG(c.look, c.style)}</svg></div>
        <div><div class="name">${who}</div>
          ${chat ? `<p class="hello">“${chat}”</p>` : ''}
          <p class="say">“${c.ask.text}”</p></div>
      </div>
      <div class="tabs">${tabs}</div>
      <div class="bgrid">${cards || '<p class="hint">Rafta hiç kitap yok…</p>'}</div>
      <div class="row end"><button class="btn" data-none>🤷 Elimde yok</button></div>`, 'wide rec');
    p.querySelectorAll('.tab').forEach(t => t.onclick = () => {
      p.querySelectorAll('.tab').forEach(x => x.classList.toggle('is-on', x === t));
      p.querySelectorAll('.bcard').forEach(b => { b.style.display = !t.dataset.f || b.dataset.g === t.dataset.f ? '' : 'none'; });
    });
    p.querySelectorAll('[data-book]').forEach(b => b.onclick = () => { closePanel(); onPick(b.dataset.book); });
    p.querySelector('[data-none]').onclick = () => { closePanel(); onPick(null); };
  }

  function mapPanel(S) {
    const pins = TOWN_KEYS.map(k => {
      const t = TOWNS[k], here = k === S.town;
      const icons = topDemand(k).map(g => GENRES[g].icon).join(' ');
      return `<g class="town ${here ? 'here' : ''}" data-town="${k}" transform="translate(${t.map.x} ${t.map.y})">
        <g class="pin"><path d="M0 0 C-18 -24 -26 -36 -26 -50 A26 26 0 1 1 26 -50 C26 -36 18 -24 0 0Z" fill="${here ? '#5ea592' : '#f08a7e'}" stroke="#fff6e8" stroke-width="5"/>
        <circle cy="-50" r="10" fill="#fff6e8"/></g>
        <text y="40" text-anchor="middle" font-size="32" font-weight="600" fill="#4a3a33">${t.name}</text>
        <text y="78" text-anchor="middle" font-size="26">${icons}</text>
        ${EVENTS[eventOf(S.day)]?.town === k ? `<text y="-92" text-anchor="middle" font-size="30" font-weight="700" fill="#e5546a">🎉 ${EVENTS[eventOf(S.day)].name}</text>` : ''}
      </g>`;
    }).join('');
    const here = TOWNS[S.town].map;
    const p = openPanel(`
      <h2>🗺️ Nereye gidelim?</h2>
      <p class="hint">Yol ₺${BAL.travelCost} · günde bir kez, sabahları. Yeni gittiğin kasabada karavanı merak eden ${BAL.newTownTraffic} kişi daha uğrar.</p>
      <svg class="map" viewBox="0 0 1600 900">
        <rect width="1600" height="900" rx="40" fill="#a9dcd8"/>
        <g stroke="#c6ebe7" stroke-width="4" stroke-linecap="round" fill="none">
          <path d="M120 200 q20 -10 40 0 q20 10 40 0"/><path d="M260 620 q20 -10 40 0 q20 10 40 0"/><path d="M180 460 q20 -10 40 0 q20 10 40 0"/>
        </g>
        <path d="M560 0 L1600 0 L1600 900 L700 900 C640 840 700 780 640 740 C560 690 520 640 580 590 C640 540 560 500 600 450 C640 400 720 420 700 360 C680 300 560 300 580 240 C600 180 700 190 680 120 C670 70 590 60 560 0Z" fill="#f3e2bf" stroke="#e6cd9f" stroke-width="10"/>
        <path d="M330 300 C380 260 460 280 450 330 C440 380 360 390 330 360 C310 340 310 316 330 300Z" fill="#f3e2bf" stroke="#e6cd9f" stroke-width="8"/>
        <g fill="#c4dc9b"><ellipse cx="1150" cy="250" rx="140" ry="60"/><ellipse cx="1300" cy="600" rx="160" ry="70"/><ellipse cx="1200" cy="800" rx="120" ry="50"/></g>
        <g fill="#9cb67f"><circle cx="1110" cy="230" r="18"/><circle cx="1150" cy="216" r="22"/><circle cx="1190" cy="234" r="16"/><circle cx="1280" cy="580" r="20"/><circle cx="1320" cy="570" r="24"/></g>
        <path d="M760 170 C880 260 820 360 790 520 C770 640 860 720 900 790" fill="none" stroke="#d8b886" stroke-width="10" stroke-dasharray="4 20" stroke-linecap="round"/>
        <path d="M770 280 C640 300 520 310 400 320" fill="none" stroke="#7fb8c4" stroke-width="6" stroke-dasharray="2 16" stroke-linecap="round"/>
        <g transform="translate(1460 760)"><circle r="60" fill="#fff6e8" stroke="#e2c29c" stroke-width="5"/><path d="M0 -44 L12 0 L0 44 L-12 0Z" fill="#f08a7e"/><path d="M0 0 L12 0 L0 44 L-12 0Z" fill="#c7b6a4"/><text y="-64" text-anchor="middle" font-size="22" font-weight="700" fill="#4a3a33">K</text></g>
        ${pins}
        <g id="van" transform="translate(${here.x} ${here.y - 110})"><g transform="translate(-32 -30)">
          <rect x="0" y="8" width="64" height="40" rx="12" fill="${PAINTS[S.paint].body}" stroke="${PAINTS[S.paint].edge}" stroke-width="4"/>
          <rect x="10" y="16" width="30" height="16" rx="4" fill="#6b4a3a"/><path d="M8 16 L42 16 L40 22 L10 22Z" fill="#f08a7e"/>
          <circle cx="16" cy="50" r="8" fill="#5b4636"/><circle cx="48" cy="50" r="8" fill="#5b4636"/>
        </g></g>
      </svg>
      <p class="hint" id="blurb">${TOWNS[S.town].blurb}</p>
      <div class="row end"><button class="btn" data-close>Kapat</button></div>`, 'wide');
    p.querySelector('[data-close]').onclick = closePanel;
    p.querySelectorAll('[data-town]').forEach(g => {
      g.onmouseenter = () => { p.querySelector('#blurb').textContent = TOWNS[g.dataset.town].blurb; };
      g.onclick = () => {
        const k = g.dataset.town, why = canTravel(S, k);
        if (why) { toast(why); p.querySelector('#blurb').textContent = TOWNS[k].blurb; return; }
        driveVan(p.querySelector('#van'), TOWNS[S.town].map, TOWNS[k].map, () => act('travel', k));
      };
    });
  }

  function driveVan(van, a, b, done) {
    const start = performance.now(), dur = 1300;
    (function step(now) {
      const k = Math.min((now - start) / dur, 1), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e - 110 - Math.sin(k * Math.PI) * 30;
      van.setAttribute('transform', `translate(${x} ${y})`);
      if (k < 1) requestAnimationFrame(step); else setTimeout(done, 200);
    })(start);
  }

  function summaryPanel(S, T) {
    const profitNote = T.soldCount ? `Bugün <b>${T.soldCount}</b> kitap sattın.` : 'Bugün hiç kitap satılmadı.';
    const R = T.recs, asked = R.perfect + R.good + R.miss;
    const recLine = asked
      ? `<p class="recline">Öneriler: 🤩 <b>${R.perfect}</b> tam isabet · 🙂 <b>${R.good}</b> idare eder · 😕 <b>${R.miss}</b> olmadı${T.tips ? ` · bahşiş <b class="gold">₺${T.tips}</b>` : ''}</p>` : '';
    let tip = '';
    const missedTop = Object.keys(T.missed).sort((a, b) => T.missed[b] - T.missed[a])[0];
    if (R.miss > R.perfect && asked > 1) tip = 'Öneri isteyenlerin cümlesine dikkat: kitap kartlarındaki etiketler ipucu verir.';
    else if (missedTop) tip = `${GENRES[missedTop].icon} ${GENRES[missedTop].name} arayan ${T.missed[missedTop]} kişi eli boş döndü. Yarın bir koli almayı düşün.`;
    else if (shelfCount(S) < 8) tip = 'Raflar neredeyse boş. Sabah toptancıya uğra.';
    else tip = 'Herkes aradığını buldu. Böyle devam!';
    const p = openPanel(`
      <h2>🌙 ${S.day}. gün kapandı · ${TOWNS[T.town].name}</h2>
      ${T.weather ? `<p class="hint">${WEATHER[T.weather].icon} ${WEATHER[T.weather].name}${T.event ? ` · 🎉 ${EVENTS[T.event].name}` : ''}</p>` : ''}
      <div class="stats">
        <div><span>Ziyaretçi</span><b>${T.visitors}</b></div>
        <div><span>Satılan</span><b>${T.soldCount}</b></div>
        <div><span>Kasa</span><b class="gold">+₺${T.revenue}</b></div>
        <div><span>Toplam</span><b>🪙 ${S.coins}</b></div>
      </div>
      <p>${profitNote}${T.newTown ? ` Yeni kasabada karavanı merak edenler de uğradı.` : ''}</p>
      ${(T.regulars || []).length ? `<p class="recline">Uğrayan müdavimler: ${T.regulars.map(r => `${REGULARS[r.id].name} ${r.grade === 'perfect' ? '💛' : r.grade === 'good' ? '🙂' : '😕'} <span class="hearts">${hearts(S.friends[r.id] || 0)}</span>`).join(' · ')}</p>` : ''}
      ${T.soldCount ? `<div class="chips">${chips(T.sold)}</div>` : ''}
      ${recLine}
      ${Object.keys(T.missed).length ? `<p class="hint">Aranıp bulunamayan:</p><div class="chips">${chips(T.missed, 'miss')}</div>` : ''}
      ${(T.stamps || []).length ? `<p class="tip page">🏅 Yeni pul: ${T.stamps.map(id => { const st = STAMPS.find(x => x.id === id); return `${st.icon} <b>${st.name}</b>`; }).join(', ')} (+₺${T.stamps.length * STAMP_REWARD})</p>` : ''}
      ${T.page ? `<p class="tip page">📜 Defterden yeni bir sayfa bulundu: <b>${PAGES.find(p => p.id === T.page).title}</b></p>` : ''}
      <p class="tip">💡 ${tip}</p>
      <div class="row end">${T.page ? '<button class="btn" data-book>📜 Oku</button>' : ''}<button class="btn hl" data-next>☀️ Ertesi sabah</button></div>`);
    p.querySelector('[data-next]').onclick = () => { closePanel(); act('next'); };
    p.querySelector('[data-book]')?.addEventListener('click', () => bookPanel(S, T.page, () => summaryPanel(S, T)));
  }

  // Sabah gazetesi: hava, bugünün ve yarının etkinliği, kasabadan bir haber
  function paperPanel(S) {
    const w = WEATHER[weatherOf(S.day)], wt = WEATHER[weatherOf(S.day + 1)];
    const ev = eventOf(S.day), evT = eventOf(S.day + 1);
    const today = ev
      ? `<div class="kicker">Bugün · ${TOWNS[EVENTS[ev].town].name}</div><div class="headline">🎉 ${EVENTS[ev].name}</div><p>${EVENTS[ev].note}</p>
         <p class="hint">${EVENTS[ev].town === S.town ? 'Tam da buradasın, kaçırma!' : 'Haritadan yola çıkabilirsin.'}</p>`
      : '<div class="kicker">Bugün</div><div class="headline">Sakin bir gün</div><p>Kasabalarda özel bir etkinlik yok. Raflara özen göstermek için iyi bir gün.</p>';
    const p = openPanel(`
      <div class="paper">
        <div class="masthead"><h2>📰 Ege Postası</h2><small>${seasonOf(S.day)}, ${dayOfSeason(S.day)}. gün · fiyatı bir gülümseme</small></div>
        <div class="news">
          <div>${today}</div>
          <div class="col2">
            <div class="kicker">Hava</div><div class="headline">${w.icon} ${w.name}</div><p>${w.note}</p>
            <div class="kicker">Yarın</div><p>${wt.icon} ${wt.name}${evT ? ` · 🎉 ${EVENTS[evT].name} (${TOWNS[EVENTS[evT].town].name})` : ''}</p>
            <div class="kicker">Mevsim</div><p>${seasonOf(S.day)}: ${SEASON[seasonOf(S.day)].note}</p>
            <div class="kicker">Kasabadan</div><p>${gossipOf(S.day)}</p>
          </div>
        </div>
      </div>
      <div class="row end">${ev && EVENTS[ev].town !== S.town && S.phase === 'morning' ? '<button class="btn" data-go>🗺️ Haritayı aç</button>' : ''}<button class="btn hl" data-close>Günaydın!</button></div>`, 'wide');
    p.querySelector('[data-close]').onclick = closePanel;
    p.querySelector('[data-go]')?.addEventListener('click', () => act('map'));
  }

  // Kostas Efendi'nin defteri: bulunan sayfalar, seçili sayfanın metni, sıradaki ipucu
  function bookPanel(S, open = null, back = null) {
    const found = PAGES.filter(p => S.pages.includes(p.id));
    const cur = PAGES.find(p => p.id === (open || S.pages[S.pages.length - 1])) || found[0];
    const np = nextPage(S), pr = progressOf(S);
    const list = PAGES.map((p, i) => S.pages.includes(p.id)
      ? `<button class="ptab ${cur && p.id === cur.id ? 'is-on' : ''}" data-page="${p.id}">${i + 1}. ${p.title}</button>`
      : `<span class="ptab locked">${i + 1}. ???</span>`).join('');
    const p = openPanel(`
      <div class="tabs head"><button class="tab is-on">📜 Kostas Efendi'nin defteri</button><button class="tab" data-album>🏅 Pul albümü (${S.stamps.length}/${STAMPS.length})</button></div>
      <div class="book">
        <div class="ptabs">${list}</div>
        <div class="pagebody">
          ${cur ? `<h3>${cur.title}</h3><p class="say">${cur.text}</p>` : ''}
          ${np ? `<p class="tip">🔎 Sıradaki sayfa: ${np.hint}${pr ? ` <b>(${pr.now}/${pr.of})</b>` : ''}</p>` : '<p class="tip">✨ Defter tamamlandı. Kütüphane artık senin karavanında yaşıyor.</p>'}
        </div>
      </div>
      <div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    p.querySelectorAll('[data-page]').forEach(b => b.onclick = () => bookPanel(S, b.dataset.page, back));
    p.querySelector('[data-album]').onclick = () => albumPanel(S, back);
    p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
  }

  // Ayarlar: müzik, ses efektleri, kaydı sıfırlama (iki adımlı onay)
  function settingsPanel(set) {
    const row = (k, label) => `<div class="dcard"><div class="dicon">${k === 'music' ? '🎵' : '🔔'}</div><div class="gname">${label}</div>
      <button class="btn sm toggle ${set[k] ? 'hl' : ''}" data-toggle="${k}">${set[k] ? 'Açık' : 'Kapalı'}</button></div>`;
    const p = openPanel(`
      <h2>⚙️ Ayarlar</h2>
      <div class="dgrid one">${row('music', 'Müzik')}${row('sfx', 'Ses efektleri ve yağmur')}</div>
      <h3>Kayıt</h3>
      <div class="dcard"><div class="dicon">🗑️</div><div><div class="gname">Baştan başla</div><div class="gmeta">Bütün ilerleme silinir, geri alınamaz.</div></div>
        <button class="btn sm" data-reset>Sıfırla</button></div>
      <p class="hint">Sahaf · müzik ve sesler oyunun içinde üretilir, hiçbir veri toplanmaz.</p>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`);
    p.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => act('toggle', b.dataset.toggle));
    const r = p.querySelector('[data-reset]');
    r.onclick = () => {
      if (r.dataset.armed) return act('reset');
      r.dataset.armed = '1'; r.textContent = 'Emin misin? Dokun'; r.classList.add('danger');
    };
    p.querySelector('[data-close]').onclick = closePanel;
  }

  // Pul albümü: kazanılanlar renkli, kalanlar soluk ve ilerlemesiyle
  function albumPanel(S, back = null) {
    const cards = STAMPS.map(st => {
      const got = S.stamps.includes(st.id), pr = stampProgress(S, st);
      return `<div class="stamp ${got ? 'got' : ''}" style="--s:${st.color}">
        <div class="sface"><span class="sicon">${got ? st.icon : '❔'}</span><span class="sname">${got ? st.name : '???'}</span></div>
        <div class="sdesc">${st.desc}${got ? '' : ` <b>${pr.now}/${pr.of}</b>`}</div></div>`;
    }).join('');
    const p = openPanel(`
      <div class="tabs head"><button class="tab" data-book>📜 Kostas Efendi'nin defteri</button><button class="tab is-on">🏅 Pul albümü (${S.stamps.length}/${STAMPS.length})</button></div>
      <p class="hint">Her pul kasaya ₺${STAMP_REWARD} bırakır.</p>
      <div class="album">${cards}</div>
      <div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    p.querySelector('[data-book]').onclick = () => bookPanel(S, null, back);
    p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
  }

  // Hikâye bitti: kısa bir kapanış ve oyuna devam
  function finalePanel(S, onContinue) {
    const best = Object.entries(S.friends).sort((a, b) => b[1] - a[1])[0];
    const p = openPanel(`
      <div class="finale">
        <div class="big-icon">🏛️✨</div>
        <h2>Kayıp kütüphane bulundu</h2>
        <p class="say">Nermin Teyzenin karavanı, Kostas Efendi'nin kitaplarıyla yeniden yollarda. Ege'nin kasabaları onları sabırsızlıkla bekliyor.</p>
        <div class="stats">
          <div><span>Gün</span><b>${S.totals.days}</b></div>
          <div><span>Satılan kitap</span><b>${S.totals.sold}</b></div>
          <div><span>Tam isabet</span><b>${S.totals.perfect}</b></div>
          <div><span>Pul</span><b>${S.stamps.length}/${STAMPS.length}</b></div>
        </div>
        ${best ? `<p class="hint">En yakın dostun: <b>${REGULARS[best[0]].name}</b> <span class="hearts">${hearts(best[1])}</span></p>` : ''}
        <p class="hint">Oyun burada bitmiyor: kalan pulları topla, müdavimlerinle dostluğunu sürdür.</p>
      </div>
      <div class="row end"><button class="btn hl" data-go>☀️ Yola devam</button></div>`, 'wide');
    p.querySelector('[data-go]').onclick = () => { closePanel(); onContinue(); };
  }

  return { hud, toast, paperPanel, bookPanel, albumPanel, finalePanel, settingsPanel, stockPanel, spotPanel, giftPanel, decorPanel, mapPanel, recPanel, summaryPanel, closePanel, isOpen };
}
