// Arayüz: üst bilgi, alt düğmeler ve paneller (toptancı, süsle, harita, öneri, gün sonu).
// Durumu değiştirmez; eylemleri main.js'e `act` üzerinden iletir.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { BOOK, booksOf, TAGS } from '../data/books.js';
import { DECOR, SLOTS, PAINTS, UPGRADES } from '../data/decor.js';
import { THEMES } from '../audio/compose.js';
import { mapSVG, proj } from '../render/map3d.js';
import { createShelfPanel } from './shelf-panel.js';
import { KOSTAS } from '../data/kostas.js';
import { shelfCount, shelfCap, genreCount, seasonOf, dayOfSeason } from '../game/state.js';
import { boxCost, canBuyBox, canTravel, topDemand, stallOf, COND_NAME } from '../game/shop.js';
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
// portre: figürün başını ve omuzlarını kadraja al
const portraitBox = c => { const m = figureMeta(c.look, c.style); const top = 806 + m.headTop - 8; return `-52 ${top.toFixed(0)} 104 ${(110 * m.scale + 10).toFixed(0)}`; };
import { ARCHETYPES } from '../data/archetypes.js';

const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const chips = (obj, cls = '') => Object.keys(obj).sort((a, b) => obj[b] - obj[a])
  .map(g => `<span class="chip ${cls}" style="--c:${GENRES[g].color}">${GENRES[g].icon} ${GENRES[g].name} <b>×${obj[g]}</b></span>`).join('');
const hearts = n => '♥'.repeat(n) + '♡'.repeat(HEARTS_MAX - n);
const SCENE_ICON = { sahil: '🏖️', carsi: '🛍️', tepe: '⛰️' };
const level = (x, lo, hi) => x >= hi ? 'çok' : x <= lo ? 'az' : 'orta';
// Cümledeki etiket söyleyişlerini işaretle (öneri ipucu): <mark data-tag="..">
function markAsk(text) {
  // Türkçe küçük harfe çevirmek uzunluğu değiştirmez (İ→i, I→ı), konumlar korunur
  const low = text.toLocaleLowerCase('tr'), hits = [];
  for (const t in TAGS) for (const say of TAGS[t].say) {
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

  const hudMemo = {};
  const put = (id, v, prop = 'textContent') => {
    if (hudMemo[id + prop] === v) return;
    hudMemo[id + prop] = v;
    if (prop === 'width') $(id).style.width = v; else $(id)[prop] = v;
  };
  function hud(S, speed) {
    put('where', `${WEATHER[weatherOf(S.day)].icon} ${TOWNS[S.town].name} · ${seasonOf(S.day)}, ${dayOfSeason(S.day)}. gün · 📰`);
    put('time', hhmm(Math.round(S.clock)));
    put('bar', ((S.clock - BAL.dayStart) / (BAL.dayEnd - BAL.dayStart) * 100).toFixed(0) + '%', 'width');
    put('coins', String(S.coins));
    put('shelf', `${shelfCount(S)}/${shelfCap(S)}`);
    const b = $('bottom');
    const want = S.phase + speed + S.spot + S.crate.length;
    if (b.dataset.k === want) return;
    b.dataset.k = want;
    if (S.phase === 'morning') {
      const sp = SPOTS[S.town][S.spot];
      b.innerHTML = `<button class="btn" data-a="spot">📍 ${sp.name}</button>
        <button class="btn" data-a="stock">📦 Toptancı</button>
        ${S.crate.length ? `<button class="btn hl2" data-a="inside">📚 Diz <b class="badge2">${S.crate.length}</b></button>` : ''}
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
    const stall = stallOf(S).map(x => {
      const b = BOOK[x.id], G = GENRES[b.genre];
      return `<div class="scard2 ${x.sold ? 'sold' : ''} c-${x.cond}" style="--c:${G.color}">
        <div class="st-title">${G.icon} ${b.title}</div><div class="st-author">${b.author}</div>
        <div class="btags">${tagChips(b.tags.slice(0, 3))}</div>
        <div class="st-foot"><span class="cond2">${COND_NAME[x.cond]}</span>${x.rare ? '<span class="rarebadge">✨ İlk baskı</span>' : ''}
          <button class="btn sm" data-stall="${x.i}" ${x.sold ? 'disabled' : ''}>${x.sold ? 'Alındı' : '₺' + x.cost}</button></div></div>`;
    }).join('');
    const p = openPanel(`
      <h2>📦 Toptancı <button class="btn sm" data-inside>📚 Raflar${S.crate.length ? ` · 📦 ${S.crate.length}` : ''}</button></h2>
      <p class="hint">Bu kasabada çok aranan: <b>${hot}</b></p>${missed}
      ${S.quest ? `<p class="hint">📌 İlan: ${questText(S.quest)} <b>(${questProgress(S).have}/${questProgress(S).n})</b></p>` : ''}
      <div class="gridline"><span>🪙 <b>${S.coins}</b></span><span>📚 Raflar <b>${shelfCount(S)}/${shelfCap(S)}</b></span></div>
      <div class="ggrid">${cards}</div>
      <h3>🧺 Bugün pazar tezgâhında <span class="hint">· tek tek seç; yıpranmış ucuz ama ucuza satılır, temiz pahalı ama iyi kazandırır</span></h3>
      <div class="stall2">${stall}</div>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`, 'wide');
    p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => act('buy', b.dataset.buy));
    p.querySelectorAll('[data-stall]').forEach(b => b.onclick = () => act('stall', +b.dataset.stall));
    p.querySelector('[data-inside]').onclick = () => interiorPanel(S);
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
      <h3>Atölye</h3><div class="dgrid">${shelfCard}${Object.keys(UPGRADES).map(k => {
        const u = UPGRADES[k], has = S.upgrades.includes(k);
        return `<div class="dcard ${has ? 'is-on' : ''}"><div class="dicon">${u.icon}</div><div><div class="gname">${u.name}</div><div class="gmeta">${u.desc}</div></div>${has ? '<span class="on">✓</span>' : `<button class="btn sm ${S.coins < u.price ? 'off' : ''}" data-upgrade="${k}">₺${u.price} · Al</button>`}</div>`;
      }).join('')}</div>
      <h3>Karavan boyası</h3><div class="swatches">${paints}</div>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`, 'wide');
    p.querySelectorAll('[data-decor]').forEach(b => b.onclick = () => act('decor-on', b.dataset.decor));
    p.querySelectorAll('[data-paint]').forEach(b => b.onclick = () => act('paint', b.dataset.paint));
    p.querySelector('[data-shelf]')?.addEventListener('click', () => act('shelf'));
    p.querySelectorAll('[data-upgrade]').forEach(b => b.onclick = () => act('upgrade', b.dataset.upgrade));
    p.querySelector('[data-close]').onclick = closePanel;
    return p;
  }

  // Öneri: müşterinin isteği + raftaki farklı kitaplar (türe göre süzülebilir)
  // extra: { onTalk() → { text, genre }, tea: çay köşesi var mı, teaLine() → cümle }
  function recPanel(S, c, onPick, hints = true, extra = {}) {
    const opts = {};
    const ids = Object.keys(S.shelf);
    const genres = GENRE_KEYS.filter(g => ids.some(id => BOOK[id].genre === g));
    const tabs = `<button class="tab is-on" data-f="">Hepsi</button>` +
      genres.map(g => `<button class="tab" data-f="${g}">${GENRES[g].icon}</button>`).join('');
    const cards = GENRE_KEYS.flatMap(g => booksOf(g)).filter(b => S.shelf[b.id]).map(b => `
      <button class="bcard" data-book="${b.id}" data-g="${b.genre}" style="--c:${GENRES[b.genre].color}">
        <span class="btitle">${b.title}</span><span class="bauthor">${b.author}</span>
        <span class="btags">${tagChips(b.tags)}</span>${S.shelf[b.id] > 1 ? `<span class="bcount">×${S.shelf[b.id]}</span>` : ''}
        ${S.rare[b.id] ? `<span class="rarebadge">✨ İlk baskı${S.rare[b.id] > 1 ? ' ×' + S.rare[b.id] : ''}</span>` : ''}
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
          <p class="say">“${hints ? markAsk(c.ask.text) : c.ask.text}”</p>${c.ask.rare ? '<p class="hint">✨ İlk baskı arıyor: ilk baskı verirsen kat kat öder.</p>' : ''}</div>
      </div>
      <div class="talk2">
        ${extra.onTalk && !c.talked ? '<button class="btn sm" data-talk>💬 Biraz daha anlatır mısın?</button>' : ''}
        ${extra.tea ? '<button class="btn sm" data-tea>🍵 Çay ikram et</button>' : ''}
        <button class="btn sm" data-disc title="Önerdiğin kitap isteğe uymazsa yine de %${Math.round((1 - BAL.discount) * 100)} indirimle satılır (bahşiş yok)">🏷️ Uymazsa indirim</button>
      </div>
      <div class="tabs">${tabs}</div>
      <div class="bgrid">${cards || '<p class="hint">Rafta hiç kitap yok…</p>'}</div>
      <div class="row end"><button class="btn" data-none>🤷 Elimde yok</button></div>`, 'wide rec');
    p.querySelectorAll('.tab').forEach(t => t.onclick = () => {
      p.querySelectorAll('.tab').forEach(x => x.classList.toggle('is-on', x === t));
      p.querySelectorAll('.bcard').forEach(b => { b.style.display = !t.dataset.f || b.dataset.g === t.dataset.f ? '' : 'none'; });
    });
    p.querySelectorAll('[data-book]').forEach(b => b.onclick = () => { closePanel(); onPick(b.dataset.book, opts); });
    p.querySelector('[data-none]').onclick = () => { closePanel(); onPick(null, opts); };
    const say = text => { const n = document.createElement('p'); n.className = 'hello'; n.textContent = '“' + text + '”'; p.querySelector('.rec-head > div:last-child').appendChild(n); };
    p.querySelector('[data-talk]')?.addEventListener('click', e => {
      const h = extra.onTalk();
      e.currentTarget.remove();
      if (!h) return;
      say(h.text);
      // söylediği türün sekmesi seçilir
      p.querySelector(`.tab[data-f="${h.genre}"]`)?.click();
    });
    p.querySelector('[data-tea]')?.addEventListener('click', e => { opts.tea = true; e.currentTarget.disabled = true; e.currentTarget.textContent = '🍵 Çay ikram edildi'; say(extra.teaLine()); });
    p.querySelector('[data-disc]').addEventListener('click', e => { opts.discount = !opts.discount; e.currentTarget.classList.toggle('hl', opts.discount); });
    p.querySelectorAll('mark[data-tag]').forEach(m => m.onclick = () => {
      const on = !m.classList.contains('is-on');
      p.querySelectorAll('mark[data-tag]').forEach(x => x.classList.toggle('is-on', x === m && on));
      p.querySelectorAll('.tab').forEach(x => x.classList.toggle('is-on', !x.dataset.f));
      p.querySelectorAll('.bcard').forEach(b => { b.style.display = !on || BOOK[b.dataset.book].tags.includes(m.dataset.tag) ? '' : 'none'; });
    });
  }

  function mapPanel(S) {
    const ev = eventOf(S.day);
    const p = openPanel(`
      <h2>🗺️ Nereye gidelim?</h2>
      <p class="hint">Yol ₺${BAL.travelCost} · günde bir kez, sabahları. Yeni gittiğin kasabada karavanı merak eden ${BAL.newTownTraffic} kişi daha uğrar.</p>
      <svg class="map map3d" viewBox="0 0 1600 900">${mapSVG(S, { eventTown: ev ? EVENTS[ev].town : null, paint: PAINTS[S.paint] })}</svg>
      <p class="hint" id="blurb">${TOWNS[S.town].blurb}</p>
      <div class="row end"><span class="hint grow">🔍 İki parmakla, tekerlekle ya da düğmelerle yakınlaştır; yakınken sürükleyerek gez.</span><span class="zoom2"><button class="btn sm" data-zin title="Yakınlaştır">＋</button><button class="btn sm" data-zout title="Uzaklaştır">－</button></span><button class="btn" data-close>Kapat</button></div>`, 'wide');
    p.querySelector('[data-close]').onclick = closePanel;
    const zm = zoomable(p.querySelector('svg.map3d'));
    p.querySelector('[data-zin]').onclick = () => zm.zoom(1.5);
    p.querySelector('[data-zout]').onclick = () => zm.zoom(1 / 1.5);
    p.querySelectorAll('[data-town]').forEach(g => {
      const blurb = k => S.unlocked.includes(k) ? TOWNS[k].blurb : 'Haritada sisli bir köşe… Defterde ilerledikçe buranın yolunu öğreneceksin.';
      g.onmouseenter = () => { p.querySelector('#blurb').textContent = blurb(g.dataset.town); };
      g.onclick = () => {
        const k = g.dataset.town, why = canTravel(S, k);
        if (why) { toast(why); p.querySelector('#blurb').textContent = blurb(k); return; }
        driveVan(p.querySelector('#van'), proj(TOWNS[S.town].map.x, TOWNS[S.town].map.y), proj(TOWNS[k].map.x, TOWNS[k].map.y), () => act('travel', k));
      };
    });
  }

  // Harita yakınlaştırma: viewBox kaydırılır. İki parmak kıstırma, tekerlek, çift dokunuş; tek parmakla sürükleme.
  // Sürükleme ya da kıstırmadan sonra gelen tıklama kasaba seçmez.
  function zoomable(svg, W = 1600, H = 900) {
    let vb = { x: 0, y: 0, w: W, h: H }, moved = 0;
    const pts = new Map();
    const clamp = v => ({ ...v, x: Math.max(0, Math.min(W - v.w, v.x)), y: Math.max(0, Math.min(H - v.h, v.y)) });
    const apply = () => { svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`); svg.classList.toggle('zoomed', vb.w < W - 1); };
    const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(); return { x: vb.x + (cx - r.left) / r.width * vb.w, y: vb.y + (cy - r.top) / r.height * vb.h }; };
    function zoomAt(cx, cy, k) {
      const p = toSvg(cx, cy), w = Math.min(W, Math.max(W / 4, vb.w / k)), s = w / vb.w;
      vb = clamp({ x: p.x - (p.x - vb.x) * s, y: p.y - (p.y - vb.y) * s, w, h: w * H / W });
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
        if (vb.w < W) { vb = clamp({ ...vb, x: vb.x - dx / r.width * vb.w, y: vb.y - dy / r.height * vb.h }); apply(); }
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
    // düğmelerle: haritanın ortasına göre
    return { zoom(k) { const r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, k); } };
  }

  // Karavan haritada bir kasabadan ötekine sekerek gider (ekran koordinatlarında)
  function driveVan(van, a, b, done) {
    const start = performance.now(), dur = 1400;
    (function step(now) {
      const k = Math.min((now - start) / dur, 1), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const x = a.x + (b.x - a.x) * e - 70, y = a.y + (b.y - a.y) * e + 10 - Math.abs(Math.sin(k * Math.PI * 6)) * 8;
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
      ${(T.unlocked || []).length ? `<p class="tip page">🧭 Yeni bir yol açıldı: <b>${T.unlocked.map(k => TOWNS[k].name).join(', ')}</b> artık haritada!</p>` : ''}
      ${T.tea ? `<p class="hint">🫖 Çay köşesinden ${T.tea} çay satıldı.</p>` : ''}
      ${(T.haps || []).length ? `<p class="recline">Bugün yaşananlar: ${T.haps.map(id => HAP[id].icon + ' ' + HAP[id].title).join(' · ')}</p>` : ''}
      ${T.quest ? `<p class="tip page">${T.quest.done ? `📌 İlan teslim edildi: +₺${T.quest.coins}${T.quest.rare ? ` ve bir ilk baskı (${BOOK[T.quest.rare].title})` : ''}` : '📌 İlanın süresi doldu; bir dahaki sefere.'}</p>` : ''}
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
    const sp = specialOf(S.day);
    const special = sp ? `<div class="kicker">Bugün · bütün kasabalarda</div><div class="headline">${sp.icon} ${sp.name}</div><p>${sp.note}</p>` : '';
    const today = ev && !S.unlocked.includes(EVENTS[ev].town)
      ? '<div class="kicker">Bugün · ???</div><div class="headline">🎉 Uzak bir kasabada şenlik</div><p>Haritada henüz olmayan bir yerden müzik sesleri geliyor. Kim bilir, belki bir gün yolun düşer.</p>'
      : ev
      ? `<div class="kicker">Bugün · ${TOWNS[EVENTS[ev].town].name}</div><div class="headline">🎉 ${EVENTS[ev].name}</div><p>${EVENTS[ev].note}</p>
         <p class="hint">${EVENTS[ev].town === S.town ? 'Tam da buradasın, kaçırma!' : 'Haritadan yola çıkabilirsin.'}</p>`
      : sp ? '' : '<div class="kicker">Bugün</div><div class="headline">Sakin bir gün</div><p>Kasabalarda özel bir etkinlik yok. Raflara özen göstermek için iyi bir gün.</p>';
    // bu sabahın mektubu (varsa) ve ilan panosu
    const L = S.post?.letter;
    const letter = L ? `<div class="letterbox"><div class="kicker">📮 Sana bir mektup var · ${L.from}</div><p class="say">“${L.text}”</p>${L.coins ? `<p class="hint">Zarfın içinden ₺${L.coins} çıktı: “bir sonraki kitap benden”.</p>` : ''}</div>` : '';
    const q = S.quest, qp = questProgress(S);
    const ad = q ? `<div class="kicker">📌 İlan${S.post?.quest ? ' · yeni' : ''}</div><p>${questText(q)}</p>
      <p class="hint">Rafta ${qp.have}/${qp.n} · son gün: ${q.deadline - S.day === 0 ? 'bugün' : `${q.deadline - S.day} gün sonra`} · ödül ₺${q.coins}${q.rare ? ' + sürpriz' : ''}</p>` : '';
    const p = openPanel(`
      <div class="paper">
        <div class="masthead"><h2>📰 Ege Postası</h2><small>${seasonOf(S.day)}, ${dayOfSeason(S.day)}. gün · fiyatı bir gülümseme</small></div>
        ${letter}
        <div class="news">
          <div>${special}${today}${ad}</div>
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

  // Defter sekmeleri: hikâye, pul albümü, mektuplar
  function bookTabs(S, on) {
    const t = (k, label) => `<button class="tab ${on === k ? 'is-on' : ''}" data-tab="${k}">${label}</button>`;
    return `<div class="tabs head">${t('book', '📜 Defter')}${t('album', `🏅 Pul albümü (${S.stamps.length}/${STAMPS.length})`)}${t('mail', `💌 Mektuplar (${S.letters.length})`)}${t('stats', '📊 İstatistik')}</div>`;
  }
  function wireTabs(p, S, back) {
    p.querySelectorAll('[data-tab]').forEach(b => b.onclick = () =>
      b.dataset.tab === 'book' ? bookPanel(S, null, back) : b.dataset.tab === 'album' ? albumPanel(S, back)
        : b.dataset.tab === 'stats' ? statsPanel(S, back) : mailPanel(S, back));
  }
  function mailPanel(S, back = null) {
    const list = S.letters.slice().reverse().map(L => `<div class="letterbox"><div class="kicker">${L.from} · ${seasonOf(L.day)}, ${dayOfSeason(L.day)}. gün</div><p>“${L.text}”</p></div>`).join('')
      || '<p class="hint">Henüz mektup yok. Tam isabetli öneriler bir gün kapını çalar.</p>';
    const p = openPanel(`${bookTabs(S, 'mail')}<div class="maillist">${list}</div>
      <div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    wireTabs(p, S, back);
    p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
  }

  // 2. bölüm: Kostas'ın dağıttığı kitaplar; bulunanların notu, kalanların ipucu
  function kostasPanel(S, back = null) {
    const cards = KOSTAS.map(k => {
      const got = S.kostasFound.includes(k.book), B = BOOK[k.book];
      const where = S.unlocked.includes(k.town) ? TOWNS[k.town].name : '???';
      return got ? `<div class="letterbox"><div class="kicker">🔖 ${B.title} · ${TOWNS[k.town].name}</div><p>“${k.note}”</p></div>`
        : `<div class="letterbox locked"><div class="kicker">❔ ${where} · ${GENRES[B.genre].icon} ${GENRES[B.genre].name} kolisinde</div></div>`;
    }).join('');
    const p = openPanel(`${bookTabs(S, 'book')}<p class="hint">Kostas Efendi kitaplarını kasabalara dağıtmış. Doğru kasabada doğru türden koli alınca arada bir içinden çıkarlar. Hepsini bulana ₺300.</p>
      <div class="maillist">${cards}</div><div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    wireTabs(p, S, back);
    p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
  }

  // Kostas'ın kitabı koliden çıktı
  function kostasFoundPanel(found) {
    const B = BOOK[found.book];
    const p = openPanel(`<div class="hap"><div class="big-icon">🔖</div><h2>Kolinin dibinde: ${B.title}</h2>
      <p class="hint">Kitabın arasından Kostas Efendi'nin el yazısıyla bir not çıktı:</p><p class="say">“${found.note}”</p>
      ${found.done ? '<p class="tip page">✨ On iki kitabın hepsi bulundu! Kostas Efendi\'nin rafı tamamlandı: +₺300</p>' : ''}</div>
      <div class="row center"><button class="btn hl" data-close>Rafa koy</button></div>`);
    p.querySelector('[data-close]').onclick = closePanel;
  }

// İstatistik: oyunun özeti
  function statsPanel(S, back = null) {
    const st = statsOf(S), max = Math.max(1, ...Object.values(st.byGenre));
    const bars = GENRE_KEYS.map(g => `<div class="sbar"><span>${GENRES[g].icon} ${GENRES[g].name}</span><i style="--w:${(st.byGenre[g] / max * 100).toFixed(0)}%;--c:${GENRES[g].color}"></i><b>${st.byGenre[g]}</b></div>`).join('');
    const top = st.topBooks.map((b, i) => `<li>${['🥇', '🥈', '🥉', '4.', '5.'][i]} ${b.title} <b>×${b.n}</b></li>`).join('') || '<li class="hint">Henüz satış yok.</li>';
    const p = openPanel(`${bookTabs(S, 'stats')}
      <div class="stats">
        <div><span>Gün</span><b>${st.days}</b></div><div><span>Satılan</span><b>${st.sold}</b></div>
        <div><span>Kazanç</span><b class="gold">₺${st.revenue}</b></div><div><span>Tam isabet</span><b>${st.perfect}</b></div>
      </div>
      <div class="news"><div><h3>Türlere göre satış</h3>${bars}</div>
        <div class="col2"><h3>En çok satanlar</h3><ul class="toplist">${top}</ul>
          <p class="hint">En iyi gün: ${st.bestDayNo ? `${st.bestDayNo}. gün, ₺${st.bestDay}` : '—'} · En sevilen kasaba: ${st.topTownName} · İlk baskı: ${st.rareSold} · Can dostlar: ${st.friends}</p></div></div>
      <div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    wireTabs(p, S, back);
    p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
  }

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
    box.innerHTML = `<span>💡 ${step.text}</span><button class="x" title="Rehberi kapat">×</button>`;
    box.querySelector('.x').onclick = () => act('tutskip');
    if (step.target) setTimeout(() => root.querySelector(step.target)?.classList.add('pulse'), 60);
  }

  // Karavanın içi: raf düzenleyici (ui/shelf-panel.js)
  const shelves = createShelfPanel({ openPanel, closePanel, act, toast });
  const interiorPanel = S => shelves.render(S);


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

  // Gün içi olay kartı: seçenekler, sonra sonuç
  function hapPanel(H, onChoose) {
    const p = openPanel(`
      <div class="hap"><div class="big-icon">${H.icon}</div><h2>${H.title}</h2><p class="say">${H.text}</p></div>
      <div class="row center">${H.choices.map((c, i) => `<button class="btn ${i === 0 ? 'hl' : ''}" data-ch="${i}">${c.label}</button>`).join('')}</div>`);
    p.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => {
      const r = onChoose(+b.dataset.ch);
      p.innerHTML = `<div class="hap"><div class="big-icon">${H.icon}</div><h2>${H.title}</h2><p class="say">${r.text}</p>
        ${r.tags.length ? `<div class="chips center">${r.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>` : ''}</div>
        <div class="row center"><button class="btn hl" data-ok>Devam</button></div>`;
      p.querySelector('[data-ok]').onclick = () => { closePanel(); r.after && r.after(); };
    });
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
      ${bookTabs(S, 'book')}
      <div class="book">
        <div class="ptabs">${list}${S.pages.length >= PAGES.length ? `<button class="ptab ch2" data-ch2>📚 2. bölüm (${S.kostasFound.length}/${KOSTAS.length})</button>` : ''}</div>
        <div class="pagebody">
          ${cur ? `<h3>${cur.title}</h3><p class="say">${cur.text}</p>` : ''}
          ${np ? `<p class="tip">🔎 Sıradaki sayfa: ${np.hint}${pr ? ` <b>(${pr.now}/${pr.of})</b>` : ''}</p>` : '<p class="tip">✨ Defter tamamlandı. Kütüphane artık senin karavanında yaşıyor.</p>'}
        </div>
      </div>
      <div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    p.querySelectorAll('[data-page]').forEach(b => b.onclick = () => bookPanel(S, b.dataset.page, back));
    p.querySelector('[data-ch2]')?.addEventListener('click', () => kostasPanel(S, back));
    wireTabs(p, S, back);
    p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
  }

  // Ayarlar: müzik, ses efektleri, kaydı sıfırlama (iki adımlı onay)
  function settingsPanel(set, S = null) {
    const row = (k, label) => `<div class="dcard"><div class="dicon">${k === 'music' ? '🎵' : k === 'hints' ? '🔍' : k === 'paint' ? '🖌️' : k === 'simple' ? '🎞️' : '🔔'}</div><div class="gname">${label}</div>
      <button class="btn sm toggle ${set[k] ? 'hl' : ''}" data-toggle="${k}">${set[k] ? 'Açık' : 'Kapalı'}</button></div>`;
    const p = openPanel(`
      <h2>⚙️ Ayarlar</h2>
      <div class="dgrid one">${row('music', 'Müzik')}${row('sfx', 'Ses efektleri ve yağmur')}${row('hints', 'Öneri ipuçları (cümledeki anahtar kelimeler)')}${row('paint', 'Boyanmış doku (kapatırsan telefon daha az yorulur)')}${row('simple', 'Basit görünüm (eski çizim; oyun yeniden açılır)')}</div>
      <h3>🔠 Yazı boyutu</h3><div class="swatches">${[[1, 'Normal'], [1.15, 'Büyük'], [1.3, 'Çok büyük']].map(([v, n]) => `<button class="swatch ${set.textScale === v ? 'is-on' : ''}" data-scale="${v}"><span style="font-size:${v}em">Aa</span><small>${n}</small></button>`).join('')}</div>
      ${S?.upgrades.includes('plak') ? `<h3>📻 Plak çalar</h3><div class="swatches">${Object.keys(THEMES).map(k => `<button class="swatch ${set.theme === k ? 'is-on' : ''}" data-theme="${k}"><span>${THEMES[k].name}</span><small>${set.theme === k ? '✓ çalıyor' : 'Çal'}</small></button>`).join('')}</div>` : ''}
      <h3>Kayıt</h3>
      <div class="dcard"><div class="dicon">🗑️</div><div><div class="gname">Baştan başla</div><div class="gmeta">Bütün ilerleme silinir, geri alınamaz.</div></div>
        <button class="btn sm" data-reset>Sıfırla</button></div>
      <p class="hint">Sahaf · müzik ve sesler oyunun içinde üretilir, hiçbir veri toplanmaz.</p>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`);
    p.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => act('toggle', b.dataset.toggle));
    p.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => act('theme', b.dataset.theme));
    p.querySelectorAll('[data-scale]').forEach(b => b.onclick = () => act('scale', +b.dataset.scale));
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
      ${bookTabs(S, 'album')}
      <p class="hint">Her pul kasaya ₺${STAMP_REWARD} bırakır.</p>
      <div class="album">${cards}</div>
      <div class="row end"><button class="btn hl" data-close>${back ? 'Geri' : 'Kapat'}</button></div>`, 'wide');
    wireTabs(p, S, back);
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

  return { hud, toast, speech, interiorPanel, coach, statsPanel, flyCoin, confetti, hapPanel, kostasPanel, kostasFoundPanel, mailPanel, paperPanel, bookPanel, albumPanel, finalePanel, settingsPanel, stockPanel, spotPanel, giftPanel, decorPanel, mapPanel, recPanel, summaryPanel, closePanel, isOpen };
}
