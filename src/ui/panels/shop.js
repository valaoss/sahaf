// Sabah panelleri: toptancı (koliler, tezgâh, sipariş), mekân (itibar, ülkenin işi, bağış), süsle, hediye.
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
import { K, act, openPanel, closePanel, chips, hearts, SCENE_ICON, level, bookTags, blurbOf } from '../kit.js';


export function stockPanel(S) {
  const hot = topDemand(S.town).map(g => `${GENRES[g].icon} ${GENRES[g].name}`).join(', ');
  const missed = S.lastDay && S.lastDay.town === S.town && Object.keys(S.lastDay.missed).length
    ? `<p class="hint">${T`Dün burada aranıp bulunamayan:`} ${chips(S.lastDay.missed, 'sm')}</p>` : '';
  const cards = GENRE_KEYS.map(g => {
    const G = GENRES[g], why = canBuyBox(S, g);
    return `<div class="gcard" style="--c:${G.color}">
      <div class="gicon">${G.icon}</div>
      <div class="gname">${G.name}</div>
      <div class="gmeta">${T`Rafta <b>${genreCount(S, g)}</b> · Satış ₺${G.price}`}</div>
      ${satFactor(S, g) < 0.75 ? `<div class="gmeta sat">📉 ${T`burada çok satıldı, ilgi düştü`}</div>` : ''}
      <button class="btn sm ${why ? 'off' : ''}" data-buy="${g}" title="${why ? tw(why) : ''}">+ ${T`Koli`} (${BAL.boxSize}) · ₺${boxCost(g)}</button>
    </div>`;
  }).join('');
  const stall = stallOf(S).map(x => {
    const b = BOOK[x.id], G = GENRES[b.genre];
    return `<div class="scard2 ${x.sold ? 'sold' : ''} c-${x.cond}" style="--c:${G.color}">
      <div class="st-title">${G.icon} ${b.title}</div><div class="st-author">${b.author}</div>
      ${blurbOf(b)}<div class="btags">${bookTags(S, b)}</div>
      <div class="st-foot"><span class="cond2">${COND_NAME[x.cond]}</span>${x.rare ? `<span class="rarebadge">✨ ${T`İlk baskı`}</span>` : ''}
        <button class="btn sm" data-stall="${x.i}" ${x.sold ? 'disabled' : ''}>${x.sold ? T`Alındı` : '₺' + x.cost}</button></div></div>`;
  }).join('');
  const fee = parkFee(S) ? '₺' + parkFee(S) : T`ücretsiz`;
  const p = openPanel(`
    <h2>📦 ${T`Toptancı`} <button class="btn sm" data-inside>📚 ${T`Raflar`}${S.crate.length ? ` · 📦 ${S.crate.length}` : ''}</button></h2>
    <p class="hint">${T`Bu kasabada çok aranan:`} <b>${hot}</b> · ${T`Akşam ödenecek: 🅿️ park ${fee} · 🪴 bakım ₺${upkeepOf(S)}`}</p>${missed}
    ${S.quest ? `<p class="hint">📌 ${T`İlan:`} ${questText(S.quest)} <b>(${questProgress(S).have}/${questProgress(S).n})</b></p>` : ''}
    <div class="gridline"><span>🪙 <b>${S.coins}</b></span><span>📚 ${T`Raflar`} <b>${shelfCount(S)}/${shelfCap(S)}</b></span>
      <button class="btn sm hl2" data-refill title="${T`Etiketli bölümlerdeki boşlukları kendi türünden kolilerle doldurur ve dizer`}">🔁 ${T`Rafı tamamla`}</button></div>
    <div class="ggrid">${cards}</div>
    ${orderRows(S)}
    <h3>🧺 ${T`Bugün pazar tezgâhında`} <span class="hint">· ${T`tek tek seç; yıpranmış ucuz ama ucuza satılır, temiz pahalı ama iyi kazandırır`}</span></h3>
    <div class="stall2">${stall}</div>
    <div class="row end"><button class="btn hl" data-close>${T`Tamam`}</button></div>`, 'wide');
  p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => act('buy', b.dataset.buy));
  p.querySelector('[data-refill]').onclick = () => act('refill');
  p.querySelectorAll('[data-order]').forEach(b => b.onclick = () => act('order', b.dataset.order));
  p.querySelectorAll('[data-stall]').forEach(b => b.onclick = () => act('stall', +b.dataset.stall));
  p.querySelector('[data-inside]').onclick = () => K.ui.interiorPanel(S);
  p.querySelector('[data-close]').onclick = closePanel;
}

// Bu ülkenin işi (Yunanistan ada günü, İtalya müzayede, Fransa bukinist, İspanya gül, Mısır onarım) ve yan hikâyesinin durumu
export function voyageCard(S) {
  const c = TOWNS[S.town].country || 'tr', V = VOYAGE[c];
  if (!V) return '';
  const n = voyagePages(S, c), next = n < V.pages.length && n > 0 ? ` · ${T`sonraki sayfa: ${V.need[n]} ${V.unit} (şimdi ${vstat(S, V.stat)})`}` : n >= V.pages.length ? ` · ${T`hikâye tamam ✓`}` : '';
  let body = '';
  if (c === 'it') {
    const lot = S.voyage.auction, rares = Object.keys(S.rare).filter(id => S.rare[id] > 0 && S.shelf[id] > 0);
    body = lot ? `<p class="hint">🔨 ${T`Bu akşam müzayedede:`} <b>«${BOOK[lot.book].title}»</b></p>`
      : rares.length ? `<div class="chips">${rares.map(id => `<button class="btn sm" data-auction="${id}">🔨 «${BOOK[id].title}»</button>`).join('')}</div>`
      : `<p class="hint">${T`Rafında ilk baskı yok. Kolilerden ve tezgâhtan ✨ ilk baskılar çıkar.`}</p>`;
  } else if (c === 'fr') {
    const bq = S.voyage.bq;
    body = !bq ? `<button class="btn sm ${S.coins < BAL.bqRent ? 'off' : ''}" data-bq-rent>₺${BAL.bqRent} · ${T`${BAL.bqDays} günlüğüne kirala`}</button>`
      : `<p class="hint">📦 ${T`Kutuda <b>${bq.books.length}/${BAL.bqCap}</b> kitap · ${bq.until - S.day + 1} gün kaldı`}</p>${S.crate.length && bq.books.length < BAL.bqCap ? `<button class="btn sm" data-bq-fill>${T`Koliden kutuya koy (${S.crate.length})`}</button>` : ''}`;
  } else if (c === 'es') {
    body = `<p class="hint">🌹 ${T`Kovada <b>${S.voyage.roses}</b> gül`}${roseDay(S) ? ` · <b>${T`bugün Gül ve Kitap Günü!`}</b>` : ` · ${T`Gül ve Kitap Günü: ${7 - (S.day % 7)} gün sonra`}`}</p>
      <div class="chips">${[5, 10].map(k => `<button class="btn sm" data-roses="${k}">${T`+${k} gül · ₺${k * BAL.rosePrice}`}</button>`).join('')}</div>`;
  } else if (c === 'eg') body = `<p class="hint">🪶 ${T`Bugün ustanın onarabileceği: <b>${BAL.restorePerDay - S.voyage.restoredToday}</b> · kopya başı ₺${BAL.restoreCost}`}</p>`;
  else if (c === 'gr') body = `<p class="hint">⛵ ${T`Ada günleri:`} <b>${vstat(S, 'islandDays')}</b></p>`;
  return `<h3>${V.icon} ${V.mech} <span class="hint">· ${V.title} ${n}/${V.pages.length}${next}</span></h3><div class="vcard"><p class="hint">${V.how}</p>${body}</div>`;
}

// Sipariş: ricası bekleyen ya da hikâyenin istediği, karavanda olmayan kitaplar (ertesi sabah kolide)
export function orderRows(S) {
  const want = [];
  for (const id in S.favors) if (favorOpen(S, id)) want.push({ book: S.favors[id].book, why: T`${REGULARS[id].name} ricası` });
  const np = nextPage(S);
  if (np?.need.carry) want.push({ book: np.need.carry.book, why: T`defterdeki iz` });
  const rows = want.filter(w => !S.shelf[w.book] && !S.crate.some(e => e.id === w.book)).map(w => `<div class="dcard"><div class="dicon">📮</div>
    <div><div class="gname">«${BOOK[w.book].title}»</div><div class="gmeta">${w.why} · ${T`ertesi sabah kolide`}</div></div>
    ${ordered(S, w.book) ? `<span class="on">✓ ${T`Yolda`}</span>` : `<button class="btn sm ${S.coins < orderCost(w.book) ? 'off' : ''}" data-order="${w.book}">₺${orderCost(w.book)} · ${T`Sipariş`}</button>`}</div>`).join('');
  return rows ? `<h3>📮 ${T`Sipariş`}</h3><div class="dgrid">${rows}</div>` : '';
}

export function spotPanel(S) {
  const spots = SPOTS[S.town];
  const cards = Object.keys(spots).map(k => {
    const sp = spots[k], here = S.spot === k;
    const hot = Object.keys(sp.demand).map(g => GENRES[g].icon).join(' ');
    return `<div class="dcard spot ${here ? 'is-on' : ''}"><div class="dicon">${SCENE_ICON[sp.scene]}</div>
      <div><div class="gname">${sp.name}</div><div class="gmeta">${sp.desc}</div>
      <div class="gmeta">👣 ${T`Kalabalık:`} <b>${level(sp.traffic, .9, 1.2)}</b> · 💬 ${T`Öneri:`} <b>${level(sp.ask, .9, 1.3)}</b> · 🅿️ ${parkFee(S, k) ? '₺' + parkFee(S, k) : T`ücretsiz`} · ${T`Sevilen:`} ${hot}</div></div>
      ${here ? `<span class="on">✓ ${T`Buradasın`}</span>` : `<button class="btn sm" data-spot="${k}">${T`Burada kur`}</button>`}</div>`;
  }).join('');
  const regs = REGULAR_KEYS.filter(id => REGULARS[id].town === S.town).map(id => {
    const met = S.met.includes(id), fv = S.favors[id];
    const favor = fv ? (fv.done ? ` · 🎁 ${T`rica ✓`}` : ` · 🎁 ${T`rica:`} «${BOOK[fv.book].title}»${plainCopies(S, fv.book) > 0 ? ` (${T`rafta`})` : ordered(S, fv.book) ? ` (${T`yolda`})` : ''}`) : '';
    return `<span class="chip reg">${met ? REGULARS[id].name : `❔ ${T`Henüz tanışmadın`}`} <b class="hearts">${hearts(S.friends[id] || 0)}</b>${favor}</span>`;
  }).join('');
  // itibar: bu kasabadaki kademe, bir sonrakine ne kaldı
  const lv = repLevel(S), L = REP_LEVELS[lv], nx = REP_LEVELS[lv + 1], rp = repOf(S);
  const rep = `<div class="rep2"><b>${L.icon} ${L.name}</b>${nx ? `<span class="repbar"><i style="width:${Math.round(100 * (rp - L.min) / (nx.min - L.min))}%"></i></span><small>${nx.icon} ${nx.name}: ${nx.perk}</small>` : `<small>${T`En yüksek itibar`}</small>`}</div>
    <p class="hint">${T`İtibar: burada dükkân açtığın her gün, müdavimlerine her tam isabet ve getirdiğin her rica artırır.`}${REP_LEVELS.slice(1, lv + 1).map(x => ` ${x.icon} ${x.perk}.`).join('')}</p>`;
  const p = openPanel(`
    <h2>📍 ${T`Karavanı nereye kuralım?`}</h2>
    <p class="hint">${T`${TOWNS[S.town].name} içinde yer değiştirmek ücretsiz. Kalabalık yerde satış, sakin yerde sohbet ve öneri çok olur.`}</p>
    <div class="dgrid one">${cards}</div>
    ${voyageCard(S)}
    <h3>${T`İtibarın`}</h3>${rep}
    ${FEATURES.bagis ? `<h3>${T`Kasabaya katkı`}</h3>
    <div class="dcard ${S.donated.includes(S.town) ? 'is-on' : ''}"><div class="dicon">📖</div><div><div class="gname">${T`Okuma köşesi`}</div>
      <div class="gmeta">${T`Meydana kitaplık ve bank: burada park ücretsiz, kalabalık kalıcı olarak +%${Math.round((BAL.donateTraffic - 1) * 100)}.`}</div></div>
      ${S.donated.includes(S.town) ? `<span class="on">✓ ${T`Var`}</span>` : `<button class="btn sm ${S.coins < BAL.donateCost ? 'off' : ''}" data-donate>₺${BAL.donateCost} · ${T`Bağışla`}</button>`}</div>` : ''}
    <h3>${T`Bu kasabanın müdavimleri`}</h3><div class="chips">${regs}</div>
    <p class="hint">${T`Müdavimler 💌 balonuyla gelir. Zevklerine tam uyan her öneri bir kalp; 5 kalpte bir hediye bırakırlar.`}</p>
    <div class="row end"><button class="btn hl" data-close>${T`Tamam`}</button></div>`, 'wide');
  p.querySelectorAll('[data-spot]').forEach(b => b.onclick = () => act('spot', b.dataset.spot));
  p.querySelector('[data-donate]')?.addEventListener('click', () => act('donate'));
  p.querySelectorAll('[data-auction]').forEach(b => b.onclick = () => act('auction', b.dataset.auction));
  p.querySelector('[data-bq-rent]')?.addEventListener('click', () => act('bq-rent'));
  p.querySelector('[data-bq-fill]')?.addEventListener('click', () => act('bq-fill'));
  p.querySelectorAll('[data-roses]').forEach(b => b.onclick = () => act('roses', +b.dataset.roses));
  p.querySelector('[data-close]').onclick = closePanel;
}

// Müdavimin hediyesi: küçük bir mektup
export function giftPanel(f) {
  const R = REGULARS[f.id], d = f.gift && DECOR[f.gift];
  const p = openPanel(`
    <div class="letter">
      <h2>💌 ${T`Bir not var`} · ${R.name}</h2>
      <p class="say">“${f.keepsake && KEEPSAKES[f.id] ? KEEPSAKES[f.id].note : R.giftNote}”</p>
      ${f.keepsake && KEEPSAKES[f.id] ? `<div class="dcard is-on"><div class="dicon">${KEEPSAKES[f.id].icon}</div><div><div class="gname">${KEEPSAKES[f.id].name}</div><div class="gmeta">${T`Hatıra · her gün +${BAL.keepsakeTraffic} ziyaretçi (${TOWNS[R.town].name})`}</div></div></div><p class="hint">🪴 ${T`Süsle panelinde Hatıralar rafında.`}</p>` : ''}
      ${d ? `<div class="dcard is-on"><div class="dicon">${d.icon}</div><div><div class="gname">${d.name}</div><div class="gmeta">${d.desc}</div></div></div>
        <p class="hint">🪴 ${T`Süsle panelinden takabilirsin.`}</p>` : f.coins ? `<p class="gold big">+₺${f.coins}</p>` : ''}
    </div>
    <div class="row end"><button class="btn hl" data-close>${T`Teşekkürler!`}</button></div>`);
  p.querySelector('[data-close]').onclick = closePanel;
}

export function decorPanel(S) {
  const slots = Object.keys(SLOTS).map(slot => {
    const items = Object.keys(DECOR).filter(k => DECOR[k].slot === slot).map(k => {
      const d = DECOR[k], on = S.decor.on[slot] === k, owned = S.decor.owned.includes(k);
      if (d.gift && !owned) {
        return `<div class="dcard locked"><div class="dicon">🎁</div>
          <div><div class="gname">${T`Gizli hediye`}</div><div class="gmeta">${d.gift === 'story' ? T`Kayıp kütüphaneyi bul.` : T`Bir müdavimle dost ol (${TOWNS[REGULARS[d.gift].town].name}).`}</div></div></div>`;
      }
      const btn = on ? `<span class="on">✓ ${T`Takılı`}</span>`
        : `<button class="btn sm ${!owned && S.coins < d.price ? 'off' : ''}" data-decor="${k}">${owned ? T`Tak` : `₺${d.price} · ${T`Al`}`}</button>`;
      return `<div class="dcard ${on ? 'is-on' : ''}"><div class="dicon">${d.icon}</div>
        <div><div class="gname">${d.name}</div><div class="gmeta">${d.desc}${d.price > 0 ? ` · 🪴 ${T`bakım ₺${Math.ceil(d.price / BAL.upkeepPer)}/gün`}` : ''}</div></div>${btn}</div>`;
    }).join('');
    return `<h3>${SLOTS[slot].name}</h3><div class="dgrid">${items}</div>`;
  }).join('');
  const ns = nextShelf(S);
  const shelfCard = ns
    ? `<div class="dcard"><div class="dicon">📚</div><div><div class="gname">${T`Raf genişletme`}</div>
        <div class="gmeta">${T`${shelfCap(S)} → ${ns.cap} kitap`}</div></div>
        <button class="btn sm ${S.coins < ns.price ? 'off' : ''}" data-shelf>₺${ns.price} · ${T`Yap`}</button></div>`
    : `<div class="dcard is-on"><div class="dicon">📚</div><div><div class="gname">${T`Raflar`}</div><div class="gmeta">${T`En büyük hâlinde (${shelfCap(S)} kitap)`}</div></div><span class="on">✓</span></div>`;
  const paints = Object.keys(PAINTS).map(k => {
    const p = PAINTS[k], on = S.paint === k, owned = S.paints.includes(k);
    return `<button class="swatch ${on ? 'is-on' : ''}" data-paint="${k}" style="--b:${p.body};--e:${p.edge}">
      <i></i><span>${p.name}</span><small>${on ? '✓' : owned ? T`Seç` : '₺' + p.price}</small></button>`;
  }).join('');
  const p = openPanel(`
    <h2>🪴 ${T`Süsle ve geliştir`}</h2>
    <p class="hint">${T`Süsler müşterileri etkiler; her yuvaya bir tane takılır. Aldığın süs sende kalır.`} 🪙 <b>${S.coins}</b></p>
    ${slots}
    <h3>${T`Atölye`}</h3><div class="dgrid">${shelfCard}${Object.keys(UPGRADES).map(k => {
      const u = UPGRADES[k], has = S.upgrades.includes(k);
      return `<div class="dcard ${has ? 'is-on' : ''}"><div class="dicon">${u.icon}</div><div><div class="gname">${u.name}</div><div class="gmeta">${u.desc}${u.upkeep ? ` · 🪴 ${T`gider ₺${u.upkeep}/gün`}` : ''}</div></div>${has ? '<span class="on">✓</span>' : `<button class="btn sm ${S.coins < u.price ? 'off' : ''}" data-upgrade="${k}">₺${u.price} · ${T`Al`}</button>`}</div>`;
    }).join('')}</div>
    <h3>${T`Karavan boyası`}</h3><div class="swatches">${paints}</div>
    <h3>🎁 ${T`Hatıralar`} <span class="hint">· ${T`dost müdavimlerin bıraktıkları; her biri kendi kasabasında +${BAL.keepsakeTraffic} ziyaretçi`}</span></h3>
    ${S.keepsakes.length ? `<div class="dgrid">${S.keepsakes.filter(id => KEEPSAKES[id]).map(id => `<div class="dcard is-on"><div class="dicon">${KEEPSAKES[id].icon}</div><div><div class="gname">${KEEPSAKES[id].name}</div><div class="gmeta">${REGULARS[id].name} · ${TOWNS[REGULARS[id].town].name}</div></div></div>`).join('')}</div>` : `<p class="hint">${T`Bir müdavimle beş kalbe ulaşınca ilk hatıran gelir.`}</p>`}
    <div class="row end"><button class="btn hl" data-close>${T`Tamam`}</button></div>`, 'wide');
  p.querySelectorAll('[data-decor]').forEach(b => b.onclick = () => act('decor-on', b.dataset.decor));
  p.querySelectorAll('[data-paint]').forEach(b => b.onclick = () => act('paint', b.dataset.paint));
  p.querySelector('[data-shelf]')?.addEventListener('click', () => act('shelf-up'));
  p.querySelectorAll('[data-upgrade]').forEach(b => b.onclick = () => act('upgrade', b.dataset.upgrade));
  p.querySelector('[data-close]').onclick = closePanel;
  return p;
}
