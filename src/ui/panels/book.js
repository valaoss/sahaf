// Defter ve sekmeleri: hikâye, pul albümü, mektuplar, istatistik, pasaport, kitap bilgim, Akdeniz defteri, kapanış ve tören.
// Ortak durum ve yardımcılar ui/kit.js'te; ana arayüzün işlevlerine (raf, konfeti, konuşma) K.ui üzerinden ulaşılır.
import { BAL } from '../../data/balance.js';
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
import { K, openPanel, closePanel, chips, hearts, bookTags, BOOKS_N, blurbOf, portraitBox } from '../kit.js';
import { T, tw } from '../../i18n/i18n.js';
import { FEATURES } from '../../data/features.js';

// mevsim ve günü: "İlkbahar, 3. gün" (mevsim adı mantık anahtarıdır, yalnızca gösterirken çevrilir)
const dayLabel = d => T`${tw(seasonOf(d))}, ${dayOfSeason(d)}. gün`;
const closeLabel = back => back ? T`Geri` : T`Kapat`;

// Defter sekmeleri: hikâye, pul albümü, mektuplar
export function bookTabs(S, on) {
  const t = (k, label) => `<button class="tab ${on === k ? 'is-on' : ''}" data-tab="${k}">${label}</button>`;
  // v3: Hikâye ve Müşteriler; kenara alınan sekmeler (pul, mektup, istatistik, pasaport, Akdeniz) yalnız bayrakları açıkken
  return `<div class="tabs head">${t('book', `📜 ${T`Hikâye`}`)}${t('people', `👥 ${T`Müşteriler`} (${S.met.length + Object.keys(S.patrons).length})`)}${FEATURES.pul ? t('album', `🏅 ${T`Pul albümü`} (${S.stamps.length}/${STAMPS.length})`) : ''}${FEATURES.mektup ? t('mail', `💌 ${T`Mektuplar`} (${S.letters.length})`) : ''}${FEATURES.akdeniz ? t('passport', `🛂 ${T`Pasaport`} (${Object.keys(S.passport).length})`) : ''}${FEATURES.akdeniz && S.countries.length > 1 ? t('voy', `🧭 ${T`Akdeniz defteri`} (${VOYAGE_KEYS.reduce((n, c) => n + voyagePages(S, c), 0)}/15)`) : ''}</div>`;
}
export function wireTabs(p, S, back) {
  p.querySelectorAll('[data-tab]').forEach(b => b.onclick = () =>
    b.dataset.tab === 'book' ? bookPanel(S, null, back) : b.dataset.tab === 'people' ? peoplePanel(S, back) : b.dataset.tab === 'album' ? albumPanel(S, back)
      : b.dataset.tab === 'stats' ? statsPanel(S, back) : b.dataset.tab === 'passport' ? passportPanel(S, back)
      : b.dataset.tab === 'know' ? knowPanel(S, back) : b.dataset.tab === 'voy' ? voyagePanel(S, back) : mailPanel(S, back));
}
// Akdeniz defteri: ülke ülke yan hikâyeler; açılmayan sayfaların yerinde nasıl açılacağı
// Müşteriler: tanıştığın müdavimler; kasabası, kalpleri, ricası, hatırası
export function peoplePanel(S, back = null) {
  const cards = REGULAR_KEYS.filter(id => S.met.includes(id)).map(id => {
    const R = REGULARS[id], h = S.friends[id] || 0, fv = S.favors[id];
    const favor = !fv ? '' : fv.done ? ` · 🎁 ${T`rica ✓`}` : ` · 🎁 ${T`rica:`} «${BOOK[fv.book].title}»`;
    const gift = S.keepsakes.includes(id) && KEEPSAKES[id] ? ` · ${KEEPSAKES[id].icon} ${KEEPSAKES[id].name}` : '';
    return `<div class="dcard"><div class="portrait sm"><svg viewBox="${portraitBox(R)}">${personSVG(R.look, R.style)}</svg></div>
      <div><div class="gname">${R.name} <b class="hearts">${hearts(h)}</b></div>
      <div class="gmeta">📍 ${TOWNS[R.town].name} · ${GENRES[R.genre].icon} ${GENRES[R.genre].name} · ${R.likes.map(t => TAGS[t].icon + ' ' + TAGS[t].name).join(', ')}${favor}${gift}</div></div></div>`;
  }).join('');
  // tanıdıklar: kartını bırakanlar; pazarlıkta gözlediğin özellikler (bilinmeyen ?)
  const CARE = { konu: T`konusu`, kondisyon: T`kitabın durumu`, nadirlik: T`nadirliği`, ucuzluk: T`fiyatı`, hediye: T`hediyelik olması`, tavsiye: T`senin tavsiyen` };
  const pats = Object.entries(S.patrons).sort((a, b) => b[1].visits - a[1].visits).map(([id, P]) => {
    const name = nameOf(P.look, ARCHETYPES[P.arch]?.names), L = P.last;
    const know = [
      `👛 ${T`Bütçe`}: ${P.seen.budget ? '~₺' + P.seen.budget : '?'}`,
      `⌚ ${T`Sabır`}: ${P.seen.patience ? '★'.repeat(P.tr.patience) : '?'}`,
      `💭 ${T`Derdi`}: ${P.seen.care ? CARE[P.tr.care] : '?'}`,
    ].join(' · ');
    return `<div class="dcard"><div class="portrait sm"><svg viewBox="${portraitBox(P)}">${personSVG(P.look, P.style)}</svg></div>
      <div><div class="gname">${name} <span class="hint">· ${ARCHETYPES[P.arch].name}</span></div>
      <div class="gmeta">📍 ${TOWNS[P.town].name} · ${T`${P.visits} kez uğradı`}${L && BOOK[L.book] ? ` · ${T`son aldığı`} «${BOOK[L.book].title}»${L.price ? ` ₺${L.price}` : ''}` : ''}</div>
      <div class="gmeta">${know}</div></div></div>`;
  }).join('');
  const p = openPanel(`${bookTabs(S, 'people')}
    <h3>${T`Müdavimler`}</h3>
    ${cards ? `<div class="dgrid one">${cards}</div>` : `<p class="hint">${T`Henüz bir müdavimle tanışmadın. 💌 balonuyla gelenler kasabanın müdavimleridir.`}</p>`}
    <h3>${T`Tanıdıklar`}</h3>
    ${pats ? `<div class="dgrid one">${pats}</div>` : `<p class="hint">${T`İyi bir alışverişten memnun ayrılan müşteri bazen kartını bırakır; sonra yine uğrar ve geçen seferi hatırlar.`}</p>`}
    <p class="hint">${T`Pazarlıkta gözlediklerin kartlarında birikir: son sözü bütçesini, gidişi sabrını, tutan bir söz derdini gösterir.`}</p>
    <p class="hint">${T`Müdavimlerin zevkine tam uyan her öneri bir kalp getirir; 3 kalpte senden bir kitap rica ederler, 5 kalpte hediye bırakırlar.`}</p>
    <div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

export function voyagePanel(S, back = null) {
  const parts = VOYAGE_KEYS.map(c => {
    const V = VOYAGE[c], n = voyagePages(S, c), open = S.countries.includes(c);
    const pages = V.pages.map((pg, i) => i < n ? `<div class="vpage"><b>${pg.title}</b><p class="say">${pg.text}</p></div>`
      : `<div class="vpage locked">${i === n && open ? (i === 0 ? T`${COUNTRIES[c].name}'nda ilk dükkânı aç.` : T`${V.need[i]} ${V.unit} (şimdi ${vstat(S, V.stat)})`) : '???'}</div>`).join('');
    return `<h3>${flagSVG(COUNTRIES[c].flag)} ${V.icon} ${V.title} <span class="hint">· ${V.mech} · ${n}/${V.pages.length}${n >= V.pages.length ? ` · 🧩 ${V.piece}` : ''}</span></h3>${open ? `<p class="hint">${V.how}</p>` : `<p class="hint">${T`🔒 Bu ülkenin yolu henüz kapalı.`}</p>`}<div class="vpages">${pages}</div>`;
  }).join('');
  const p = openPanel(`
    ${bookTabs(S, 'voy')}
    <p class="hint">${T`Her ülkenin kendine özgü bir işi ve üç sayfalık bir hikâyesi var. Beşi bitince kütüphanenin parçaları karavanında toplanır`}${S.grandDone ? T` ve kütüphane açıldı 🏛️.` : T`; sonra Cunda'da, Ada tepesinde dükkân aç: açılış töreni.`}</p>
    ${parts}
    <div class="row end">${S.grandDone ? `<button class="btn" data-grand>🏛️ ${T`Tören`}</button>` : ''}<button class="btn hl" data-close>${T`Kapat`}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-grand]')?.addEventListener('click', () => grandPanel(S, () => voyagePanel(S, back)));
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// Açılış töreni: kütüphanenin beş parçası, dostlar, oyunun özeti; sonrası serbest oyun
export function grandPanel(S, onContinue = null) {
  const friends = Object.entries(S.friends).filter(([, h]) => h >= HEARTS_MAX).map(([id]) => REGULARS[id].name);
  const p = openPanel(`
    <div class="finale">
      <div class="big-icon">🏛️📚🌊</div>
      <h2>${GRAND.title}</h2>
      <p class="say">${GRAND.text}</p>
      <div class="chips">${VOYAGE_KEYS.map(c => `<span class="chip">${VOYAGE[c].icon} ${VOYAGE[c].piece}</span>`).join('')}</div>
      <div class="stats">
        <div><span>${T`Gün`}</span><b>${S.totals.days}</b></div>
        <div><span>${T`Satılan kitap`}</span><b>${S.totals.sold}</b></div>
        <div><span>${T`Ülke`}</span><b>${S.countries.length}</b></div>
        <div><span>${T`Pul`}</span><b>${S.stamps.length}/${STAMPS.length}</b></div>
      </div>
      ${friends.length ? `<p class="hint">${T`Törene gelen dostların: ${friends.join(', ')}`}</p>` : ''}
      <p class="hint">${T`Kütüphane açık; karavan yine yolda. Kalan pulları, dostlukları ve kasabaları dilediğin gibi gez.`}</p>
    </div>
    <div class="row end"><button class="btn hl" data-go>☀️ ${T`Yola devam`}</button></div>`, 'wide');
  p.querySelector('[data-go]').onclick = () => onContinue ? onContinue() : closePanel();
}

// Kitap bilgim: karşılaşılan kitaplar, tanıtımları ve bilinen etiketleri (türe göre)
export function knowPanel(S, back = null) {
  const met = id => S.known[id] || S.shelf[id] || S.soldBooks[id] || S.crate.some(e => e.id === id);
  const sections = GENRE_KEYS.map(g => {
    const list = booksOf(g).filter(b => met(b.id));
    if (!list.length) return '';
    return `<h3>${GENRES[g].icon} ${GENRES[g].name} <span class="hint">· ${list.filter(b => knowsAll(S, b.id)).length}/${booksOf(g).length}</span></h3>
      <div class="klist">${list.map(b => `<div class="kcard ${knowsAll(S, b.id) ? 'full' : ''}" style="--c:${GENRES[g].color}">
        <b>${b.title}</b> <small>${b.author}</small>${blurbOf(b)}<span class="btags">${bookTags(S, b)}</span></div>`).join('')}</div>`;
  }).join('');
  const p = openPanel(`
    ${bookTabs(S, 'know')}
    <p class="hint">${T`Bir kitabın etiketlerini <b>satınca</b> (biri), <b>önerince</b> (isteğe uyanlar), sabahları karavanda <b>okuyunca</b> ve <b>mektup gelince</b> (hepsi) öğrenirsin.`}
      ${T`Bilmediğin kitapta tanıtımı oku: ipucu orada. · <b>${knownCount(S)}</b>/${BOOKS_N} kitabı iyi tanıyorsun.`}</p>
    ${sections || `<p class="hint">${T`Henüz kitap tanımıyorsun.`}</p>`}
    <div class="row end"><button class="btn hl" data-close>${T`Kapat`}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// Pasaport: ülke damgaları (ilk girilen gün), kapalı ülkelerin ipucu
export function passportPanel(S, back = null) {
  const cards = COUNTRY_KEYS.map(c => {
    const C = COUNTRIES[c], d = S.passport[c];
    return `<div class="visa ${d ? 'got' : ''}">${flagSVG(C.flag)}<b>${C.name}</b>
      ${d ? `<span class="vstamp">${C.greet}!<small>${dayLabel(d)}</small></span>` : `<small class="hint">${S.countries.includes(c) ? T`Feribot seni bekliyor.` : C.hint}</small>`}</div>`;
  }).join('');
  const p = openPanel(`${bookTabs(S, 'passport')}<div class="passport">${cards}</div>
    <div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}
export function mailPanel(S, back = null) {
  const list = S.letters.slice().reverse().map(L => `<div class="letterbox"><div class="kicker">${L.from} · ${dayLabel(L.day)}</div><p>“${L.text}”</p></div>`).join('')
    || `<p class="hint">${T`Henüz mektup yok. Tam isabetli öneriler bir gün kapını çalar.`}</p>`;
  const p = openPanel(`${bookTabs(S, 'mail')}<div class="maillist">${list}</div>
    <div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// 2. bölüm: Kostas'ın dağıttığı kitaplar; bulunanların notu, kalanların ipucu
export function kostasPanel(S, back = null) {
  const cards = KOSTAS.map(k => {
    const got = S.kostasFound.includes(k.book), B = BOOK[k.book];
    const where = S.unlocked.includes(k.town) ? TOWNS[k.town].name : '???';
    return got ? `<div class="letterbox"><div class="kicker">🔖 ${B.title} · ${TOWNS[k.town].name}</div><p>“${k.note}”</p></div>`
      : `<div class="letterbox locked"><div class="kicker">${T`❔ ${where} · ${GENRES[B.genre].icon} ${GENRES[B.genre].name} kolisinde`}</div></div>`;
  }).join('');
  const p = openPanel(`${bookTabs(S, 'book')}<p class="hint">${T`Kostas Efendi kitaplarını kasabalara dağıtmış. Doğru kasabada doğru türden koli alınca arada bir içinden çıkarlar. Hepsini bulana ₺300.`}</p>
    <div class="maillist">${cards}</div><div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// Kostas'ın kitabı koliden çıktı
export function kostasFoundPanel(found) {
  const B = BOOK[found.book];
  const p = openPanel(`<div class="hap"><div class="big-icon">🔖</div><h2>${T`Kolinin dibinde: ${B.title}`}</h2>
    <p class="hint">${T`Kitabın arasından Kostas Efendi'nin el yazısıyla bir not çıktı:`}</p><p class="say">“${found.note}”</p>
    ${found.done ? `<p class="tip page">${T`✨ On iki kitabın hepsi bulundu! Kostas Efendi'nin rafı tamamlandı: +₺300`}</p>` : ''}</div>
    <div class="row center"><button class="btn hl" data-close>${T`Rafa koy`}</button></div>`);
  p.querySelector('[data-close]').onclick = closePanel;
}

// İstatistik: oyunun özeti
export function statsPanel(S, back = null) {
  const st = statsOf(S), max = Math.max(1, ...Object.values(st.byGenre));
  const bars = GENRE_KEYS.map(g => `<div class="sbar"><span>${GENRES[g].icon} ${GENRES[g].name}</span><i style="--w:${(st.byGenre[g] / max * 100).toFixed(0)}%;--c:${GENRES[g].color}"></i><b>${st.byGenre[g]}</b></div>`).join('');
  const top = st.topBooks.map((b, i) => `<li>${['🥇', '🥈', '🥉', '4.', '5.'][i]} ${b.title} <b>×${b.n}</b></li>`).join('') || `<li class="hint">${T`Henüz satış yok.`}</li>`;
  const best = st.bestDayNo ? T`${st.bestDayNo}. gün, ₺${st.bestDay}` : '—';
  const p = openPanel(`${bookTabs(S, 'stats')}
    <div class="stats">
      <div><span>${T`Gün`}</span><b>${st.days}</b></div><div><span>${T`Satılan`}</span><b>${st.sold}</b></div>
      <div><span>${T`Kazanç`}</span><b class="gold">₺${st.revenue}</b></div><div><span>${T`Tam isabet`}</span><b>${st.perfect}</b></div>
    </div>
    <div class="news"><div><h3>${T`Türlere göre satış`}</h3>${bars}</div>
      <div class="col2"><h3>${T`En çok satanlar`}</h3><ul class="toplist">${top}</ul>
        <p class="hint">${T`En iyi gün: ${best} · En sevilen kasaba: ${st.topTownName} · İlk baskı: ${st.rareSold} · Can dostlar: ${st.friends}`}</p></div></div>
    <div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// Kostas Efendi'nin defteri: bulunan sayfalar, seçili sayfanın metni, sıradaki ipucu
export function bookPanel(S, open = null, back = null) {
  const found = PAGES.filter(p => S.pages.includes(p.id));
  const cur = PAGES.find(p => p.id === (open || S.pages[S.pages.length - 1])) || found[0];
  const np = nextPage(S), pr = progressOf(S);
  const list = PAGES.map((p, i) => S.pages.includes(p.id)
    ? `<button class="ptab ${cur && p.id === cur.id ? 'is-on' : ''}" data-page="${p.id}">${i + 1}. ${p.title}</button>`
    : `<span class="ptab locked">${i + 1}. ???</span>`).join('');
  const p = openPanel(`
    ${bookTabs(S, 'book')}
    <div class="book">
      <div class="ptabs">${list}${S.pages.length >= PAGES.length ? `<button class="ptab ch2" data-ch2>📚 ${T`2. bölüm`} (${S.kostasFound.length}/${KOSTAS.length})</button>` : ''}</div>
      <div class="pagebody">
        ${cur ? `<h3>${cur.title}</h3><p class="say">${cur.text}</p>` : ''}
        ${np ? `<p class="tip">${T`🔎 Sıradaki sayfa: ${np.hint}`}${pr ? ` <b>(${pr.now}/${pr.of})</b>` : ''}</p>` : `<p class="tip">${T`✨ Defter tamamlandı. Kütüphane artık senin karavanında yaşıyor.`}</p>`}
      </div>
    </div>
    <div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  p.querySelectorAll('[data-page]').forEach(b => b.onclick = () => bookPanel(S, b.dataset.page, back));
  p.querySelector('[data-ch2]')?.addEventListener('click', () => kostasPanel(S, back));
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// Pul albümü: kazanılanlar renkli, kalanlar soluk ve ilerlemesiyle
export function albumPanel(S, back = null) {
  const cards = STAMPS.map(st => {
    const got = S.stamps.includes(st.id), pr = stampProgress(S, st);
    return `<div class="stamp ${got ? 'got' : ''}" style="--s:${st.color}">
      <div class="sface"><span class="sicon">${got ? st.icon : '❔'}</span><span class="sname">${got ? st.name : '???'}</span></div>
      <div class="sdesc">${st.desc}${got ? '' : ` <b>${pr.now}/${pr.of}</b>`}</div></div>`;
  }).join('');
  const p = openPanel(`
    ${bookTabs(S, 'album')}
    <p class="hint">${T`Her pul kasaya ₺${STAMP_REWARD} bırakır.`}</p>
    <div class="album">${cards}</div>
    <div class="row end"><button class="btn hl" data-close>${closeLabel(back)}</button></div>`, 'wide');
  wireTabs(p, S, back);
  p.querySelector('[data-close]').onclick = () => back ? back() : closePanel();
}

// Hikâye bitti: kısa bir kapanış ve oyuna devam
export function finalePanel(S, onContinue) {
  const best = Object.entries(S.friends).sort((a, b) => b[1] - a[1])[0];
  const p = openPanel(`
    <div class="finale">
      <div class="big-icon">🏛️✨</div>
      <h2>${T`Kayıp kütüphane bulundu`}</h2>
      <p class="say">${T`Nermin Teyzenin karavanı, Kostas Efendi'nin kitaplarıyla yeniden yollarda. Ege'nin kasabaları onları sabırsızlıkla bekliyor.`}</p>
      <div class="stats">
        <div><span>${T`Gün`}</span><b>${S.totals.days}</b></div>
        <div><span>${T`Satılan kitap`}</span><b>${S.totals.sold}</b></div>
        <div><span>${T`Tam isabet`}</span><b>${S.totals.perfect}</b></div>
        <div><span>${T`Pul`}</span><b>${S.stamps.length}/${STAMPS.length}</b></div>
      </div>
      ${best ? `<p class="hint">${T`En yakın dostun: <b>${REGULARS[best[0]].name}</b> <span class="hearts">${hearts(best[1])}</span>`}</p>` : ''}
      <p class="hint">${T`Oyun burada bitmiyor: kalan pulları topla, müdavimlerinle dostluğunu sürdür.`}</p>
    </div>
    <div class="row end"><button class="btn hl" data-go>☀️ ${T`Yola devam`}</button></div>`, 'wide');
  p.querySelector('[data-go]').onclick = () => { closePanel(); onContinue(); };
}
