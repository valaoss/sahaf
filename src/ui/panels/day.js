// Gün sonu özeti ve teşhisi, sabah gazetesi.
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
import { K, act, openPanel, closePanel, chips, hearts } from '../kit.js';
import { voyagePanel, grandPanel, bookPanel } from './book.js';
import { goalBar } from './shop.js';
import { affordable } from '../../game/progress.js';
import { T, tw } from '../../i18n/i18n.js';

// D: gün sonu raporu (closeShop'un döndürdüğü)
export function summaryPanel(S, D) {
  const profitNote = D.soldCount ? T`Bugün <b>${D.soldCount}</b> kitap sattın.` : T`Bugün hiç kitap satılmadı.`;
  const R = D.recs, asked = R.perfect + R.good + R.miss;
  const tipsPart = D.tips ? T` · bahşiş <b class="gold">₺${D.tips}</b>` : '';
  const recLine = asked
    ? `<p class="recline">${T`Öneriler: 🤩 <b>${R.perfect}</b> tam isabet · 🙂 <b>${R.good}</b> idare eder · 😕 <b>${R.miss}</b> olmadı`}${tipsPart}</p>` : '';
  let tip = '';
  const missedTop = Object.keys(D.missed).sort((a, b) => D.missed[b] - D.missed[a])[0];
  if (R.miss > R.perfect && asked > 1) tip = T`Öneri isteyenlerin cümlesine dikkat: kitap kartlarındaki etiketler ipucu verir.`;
  else if (missedTop) tip = T`${GENRES[missedTop].icon} ${GENRES[missedTop].name} arayan ${D.missed[missedTop]} kişi eli boş döndü. Yarın bir koli almayı düşün.`;
  else if ((D.priceLost || 0) > 3) tip = T`Fiyatı görüp vazgeçen çok oldu. Öğrenci, anne ve teyzelerin sevdiği türlerde (çocuk, şiir) etiketi ucuza çevirmeyi dene.`;
  else if ((D.saturated || []).length) { const names = D.saturated.map(g => GENRES[g].name).join(T` ve `); tip = T`${names} burada doydu: birkaç gün başka türe ağırlık ver ya da başka kasabaya git.`; }
  else if (shelfCount(S) < 8) tip = T`Raflar neredeyse boş. Sabah toptancıya uğra.`;
  else tip = T`Herkes aradığını buldu. Böyle devam!`;
  const questLine = !D.quest ? '' : !D.quest.done ? T`📌 İlanın süresi doldu; bir dahaki sefere.`
    : D.quest.rare ? T`📌 İlan teslim edildi: +₺${D.quest.coins} ve bir ilk baskı (${BOOK[D.quest.rare].title})` : T`📌 İlan teslim edildi: +₺${D.quest.coins}`;
  const regList = (D.regulars || []).map(r => `${REGULARS[r.id].name} ${r.grade === 'perfect' ? '💛' : r.grade === 'good' ? '🙂' : '😕'} <span class="hearts">${hearts(S.friends[r.id] || 0)}</span>`).join(' · ');
  const stampList = (D.stamps || []).map(id => { const st = STAMPS.find(x => x.id === id); return `${st.icon} <b>${st.name}</b>`; }).join(', ');
  const p = openPanel(`
    <h2>${T`🌙 ${S.day}. gün kapandı · ${TOWNS[D.town].name}`}</h2>
    ${D.weather ? `<p class="hint">${WEATHER[D.weather].icon} ${WEATHER[D.weather].name}${D.event ? ` · 🎉 ${EVENTS[D.event].name}` : ''}</p>` : ''}
    <div class="stats">
      <div><span>${T`Ziyaretçi`}</span><b>${D.visitors}</b></div>
      <div><span>${T`Satılan`}</span><b>${D.soldCount}</b></div>
      <div><span>${D.costs ? T`Net` : T`Kasa`}</span><b class="gold">${(D.net ?? D.revenue) >= 0 ? '+' : '−'}₺${Math.abs(D.net ?? D.revenue)}</b></div>
      <div><span>${T`Toplam`}</span><b>🪙 ${S.coins}</b></div>
    </div>
    ${D.costs ? `<div class="ledger"><span>${T`Satış`} <b>+₺${D.revenue}</b></span><span>🏪 ${T`Tezgâh kirası`} <b>−₺${D.costs.paid ?? D.costs.park + D.costs.upkeep}</b></span><span class="net">${T`Net`} <b>${D.net >= 0 ? '+' : '−'}₺${Math.abs(D.net)}</b></span></div>` : ''}
    ${goalBar(S)}${affordable(S).length ? `<p class="hint">🛍️ ${T`Kasadaki parayla alabileceklerin:`} ${affordable(S).map(x => `${x.icon} ${x.name} (₺${x.price})`).join(' · ')}</p>` : ''}
    <p>${profitNote}${D.newTown ? T` Yeni kasabada karavanı merak edenler de uğradı.` : ''}</p>
    ${D.secSold && S.layout ? `<div class="heat">${S.layout.sections.map((sec, i) => `<span style="--c:${sec.label ? GENRES[sec.label].color : '#c9b49a'};--a:${Math.min(1, D.secSold[i] / Math.max(1, ...D.secSold)).toFixed(2)}"><i>${sec.label ? GENRES[sec.label].icon : '🏷️'}</i><b>${D.secSold[i]}</b><small>${{ ucuz: '₺↓', normal: '₺', pahali: '₺↑' }[sec.price]}</small></span>`).join('')}</div>` : ''}
    ${diagnose(S, D)}
    ${(D.countries || []).length ? `<p class="tip page">${T`🌍 Yeni bir ülke açıldı: <b>${D.countries.map(c => COUNTRIES[c].name).join(', ')}</b>! Haritadan feribotla gidebilirsin.`}</p>` : ''}
    ${(D.unlocked || []).length ? `<p class="tip page">${T`🧭 Yeni bir yol açıldı: <b>${D.unlocked.map(k => TOWNS[k].name).join(', ')}</b> artık haritada!`}</p>` : ''}
    ${D.tea ? `<p class="hint">${T`🫖 Çay köşesinden ${D.tea} çay satıldı.`}</p>` : ''}
    ${D.learned ? `<p class="hint">${T`📚 Satarken ${D.learned} kitap hakkında yeni bir şey öğrendin (📚 Kitap bilgim).`}</p>` : ''}
    ${(D.haps || []).length ? `<p class="recline">${T`Bugün yaşananlar: ${D.haps.map(id => HAP[id].icon + ' ' + HAP[id].title).join(' · ')}`}</p>` : ''}
    ${D.quest ? `<p class="tip page">${questLine}</p>` : ''}
    ${(D.regulars || []).length ? `<p class="recline">${T`Uğrayan müdavimler: ${regList}`}</p>` : ''}
    ${D.soldCount ? `<div class="chips">${chips(D.sold)}</div>` : ''}
    ${recLine}
    ${D.deals?.n ? `<p class="recline">${T`🤝 Pazarlık: <b>${D.deals.n}</b> · anlaşılan <b>${D.deals.won}</b> · etiketin ortalama <b>%${Math.round(100 * D.deals.paid / Math.max(1, D.deals.sticker))}</b>'i alındı`}</p>` : ''}
    ${Object.keys(D.missed).length ? `<p class="hint">${T`Aranıp bulunamayan:`}</p><div class="chips">${chips(D.missed, 'miss')}</div>` : ''}
    ${(D.stamps || []).length ? `<p class="tip page">${T`🏅 Yeni pul: ${stampList} (+₺${D.stamps.length * STAMP_REWARD})`}</p>` : ''}
    ${D.auction ? `<p class="tip page">${T`🔨 Müzayede: «${BOOK[D.auction.book].title}» <b class="gold">₺${D.auction.price}</b>'ye satıldı.`}</p>` : ''}
    ${D.roses || D.rosesLeft ? `<p class="hint">${T`🌹 Gülle ${D.roses || 0} kitap sattın (+₺${(D.roses || 0) * BAL.roseTip})`}${D.rosesLeft ? T` · ${D.rosesLeft} gül soldu` : ''}.</p>` : ''}
    ${(D.voyage || []).map(v => `<p class="tip page">${T`${VOYAGE[v.c].icon} Akdeniz defterine yeni sayfa: <b>${VOYAGE[v.c].pages[v.i].title}</b>`}</p>`).join('')}
    ${D.grand ? `<p class="tip page">${T`🏛️ <b>${GRAND.title}!</b> Kütüphane Cunda tepesinde yeniden açıldı (+₺${GRAND.coins}).`}</p>` : ''}
    ${D.page ? `<p class="tip page">${T`📜 Defterden yeni bir sayfa bulundu: <b>${PAGES.find(p => p.id === D.page).title}</b>`}</p>` : ''}
    <p class="tip">💡 ${tip}</p>
    <div class="row end">${D.grand ? `<button class="btn hl2" data-grand>🏛️ ${T`Tören`}</button>` : ''}${(D.voyage || []).length ? `<button class="btn" data-voy>🧭 ${T`Oku`}</button>` : ''}${D.page ? `<button class="btn" data-book>📜 ${T`Oku`}</button>` : ''}<button class="btn hl" data-next>☀️ ${T`Ertesi sabah`}</button></div>`);
  p.querySelector('[data-grand]')?.addEventListener('click', () => grandPanel(S, () => summaryPanel(S, D)));
  p.querySelector('[data-voy]')?.addEventListener('click', () => voyagePanel(S, () => summaryPanel(S, D)));
  p.querySelector('[data-next]').onclick = () => { closePanel(); act('next'); };
  p.querySelector('[data-book]')?.addEventListener('click', () => bookPanel(S, D.page, () => summaryPanel(S, D)));
}

// Gazetenin haftalık festival takvimi: önümüzdeki yedi gün (yolu kapalı kasabalar ???)
export function weekFests(S) {
  const out = [];
  let far = 0;
  for (let k = 1; k <= 7; k++) {
    const e = eventOf(S.day + k);
    if (!e) continue;
    if (!S.unlocked.includes(EVENTS[e].town)) { far++; continue; }
    out.push(`<b>${k === 1 ? T`yarın` : T`${k} gün sonra`}</b>: ${EVENTS[e].name} (${TOWNS[EVENTS[e].town].name})`);
  }
  if (far) out.push(T`yolunu henüz bilmediğin kasabalarda ${far} şenlik daha`);
  return out.join(' · ') || T`Bu hafta festival yok.`;
}

// Gün sonu teşhisi: fiyat etiketinin etkisi (ve ağızdan ağıza), doymuş türler, sponsorluk
export function diagnose(S, D) {
  const out = [];
  if (D.newPatrons) out.push(T`🤝 <b>${D.newPatrons}</b> müşteri kartını bıraktı: artık tanıdığın (📜 Defter › Müşteriler).`);
  if (D.happyDeals) out.push(T`😊 <b>${D.happyDeals}</b> müşteri ucuza aldığını düşünüyor; yarın anlatırlar.`);
  if (D.priceLost) out.push(T`🏷️ <b>${D.priceLost}</b> kişi fiyat yüzünden vazgeçti ya da pazarlıktan kızgın ayrıldı` + (D.word < 1 ? T` — konuşacaklar: yarın burada kalabalık %${Math.round((1 - D.word) * 100)} az` : '') + '.');
  if (D.priceWon) out.push(T`🏷️ Ucuz etiket <b>${D.priceWon}</b> kişiyi ikna etti` + (D.word > 1 ? T` — yarın burada kalabalık %${Math.round((D.word - 1) * 100)} fazla` : '') + '.');
  if ((D.saturated || []).length) out.push(T`📉 ${D.saturated.map(g => GENRES[g].icon + ' ' + GENRES[g].name).join(', ')} bu kasabada çok satıldı; ilgi düştü, birkaç günde toparlanır.`);
  if (D.sponsored) out.push(T`🎪 Sponsor olduğun festival: kalabalık ×${BAL.sponsorTraffic}.`);
  if (D.repGain && TOWNS[D.town]?.koy) out.push(T`💛 ${TOWNS[D.town].name} sana ısındı (+${D.repGain} güven).`);
  if (D.repUp) out.push(T`🏘️ ${TOWNS[D.town].name} · artık <b>${REP_LEVELS[D.repUp].icon} ${tw(REP_LEVELS[D.repUp].name)}</b>: ${tw(REP_LEVELS[D.repUp].perk)}.`);
  if (D.favors) out.push(T`🎁 Bugün ${D.favors} rica getirdin.`);
  return out.length ? `<div class="diag">${out.map(x => `<p>${x}</p>`).join('')}</div>` : '';
}

// Sabah gazetesi: hava, bugünün ve yarının etkinliği, kasabadan bir haber
export function paperPanel(S) {
  const w = WEATHER[weatherOf(S.day)], wt = WEATHER[weatherOf(S.day + 1)];
  const ev = eventOf(S.day), evT = eventOf(S.day + 1);
  const sp = specialOf(S.day);
  const season = tw(seasonOf(S.day));
  const special = sp ? `<div class="kicker">${T`Bugün · bütün kasabalarda`}</div><div class="headline">${sp.icon} ${sp.name}</div><p>${sp.note}</p>` : '';
  const today = ev && !S.unlocked.includes(EVENTS[ev].town)
    ? `<div class="kicker">${T`Bugün · ???`}</div><div class="headline">${T`🎉 Uzak bir kasabada şenlik`}</div><p>${T`Haritada henüz olmayan bir yerden müzik sesleri geliyor. Kim bilir, belki bir gün yolun düşer.`}</p>`
    : ev
    ? `<div class="kicker">${T`Bugün · ${TOWNS[EVENTS[ev].town].name}`}</div><div class="headline">🎉 ${EVENTS[ev].name}</div><p>${EVENTS[ev].note}</p>
       <p class="hint">${EVENTS[ev].town === S.town ? T`Tam da buradasın, kaçırma!` : T`Haritadan yola çıkabilirsin.`}</p>`
    : sp ? '' : `<div class="kicker">${T`Bugün`}</div><div class="headline">${T`Sakin bir gün`}</div><p>${T`Kasabalarda özel bir etkinlik yok. Raflara özen göstermek için iyi bir gün.`}</p>`;
  // bu sabahın mektubu (varsa) ve ilan panosu
  const L = S.post?.letter;
  const letter = L ? `<div class="letterbox"><div class="kicker">${T`📮 Sana bir mektup var · ${L.from}`}</div><p class="say">“${L.text}”</p>${L.coins ? `<p class="hint">${T`Zarfın içinden ₺${L.coins} çıktı: “bir sonraki kitap benden”.`}</p>` : ''}${(L.learned || []).length ? `<p class="hint">${T`📚 Mektuptan öğrendin: <b>${BOOK[L.book].title}</b> · ${L.learned.map(t => TAGS[t].icon + ' ' + TAGS[t].name).join(', ')}`}</p>` : ''}</div>` : '';
  const q = S.quest, qp = questProgress(S);
  const due = q ? (q.deadline - S.day === 0 ? T`bugün` : T`${q.deadline - S.day} gün sonra`) : '';
  const ad = q ? `<div class="kicker">📌 ${T`İlan`}${S.post?.quest ? T` · yeni` : ''}</div><p>${questText(q)}</p>
    <p class="hint">${T`Rafta ${qp.have}/${qp.n} · son gün: ${due} · ödül ₺${q.coins}`}${q.rare ? T` + sürpriz` : ''}</p>` : '';
  const bq = S.post?.bq;
  const orders = (S.post?.orders || []).map(b => '«' + BOOK[b].title + '»').join(', ');
  const p = openPanel(`
    <div class="paper">
      <div class="masthead"><h2>📰 ${paperName(S.town, TOWNS[S.town].country || 'tr')}</h2><small>${T`${season}, ${dayOfSeason(S.day)}. gün · fiyatı bir gülümseme`}</small></div>
      ${letter}${bq?.sold ? `<p class="hint">${T`📦 Bukinist kutun gece ${bq.sold} kitap sattı (+₺${bq.coins})`}${bq.ended ? T`; kira bitti, kalanlar koliye döndü` : ''}.</p>` : ''}${roseDay(S) ? `<p class="hint">${T`🌹 Bugün Gül ve Kitap Günü: sevgililer kitap ve gül arıyor, sokaklar kalabalık.`}</p>` : ''}${orders ? `<p class="hint">${T`📦 Siparişin geldi, koliye kondu: ${orders}`}</p>` : ''}
      <div class="news">
        <div>${special}${today}${ad}</div>
        <div class="col2">
          <div class="kicker">${T`Hava`}</div><div class="headline">${w.icon} ${w.name}</div><p>${w.note}</p>
          <div class="kicker">${T`Yarın`}</div><p>${wt.icon} ${wt.name}${evT ? ` · 🎉 ${EVENTS[evT].name} (${TOWNS[EVENTS[evT].town].name})` : ''}</p>
          <div class="kicker">🗓️ ${T`Bu hafta`}</div><p>${weekFests(S)}</p>
          <div class="kicker">${T`Mevsim`}</div><p>${season}: ${SEASON[seasonOf(S.day)].note}</p>
          <div class="kicker">${T`Kasabadan`}</div><p>${gossipOf(S.day)}</p>
        </div>
      </div>
    </div>
    ${S.phase === 'morning' ? sponsorable(S).map(x => {
      const mine = S.sponsor && S.sponsor.day === x.day && S.sponsor.town === x.town;
      const when = x.day === S.day ? T`bugün` : T`yarın`;
      return `<div class="sponsor2"><span>${T`🎪 <b>${EVENTS[x.ev].name}</b> · ${TOWNS[x.town].name}, ${when} — sponsor olursan o gün orada dükkân açınca kalabalık ×${BAL.sponsorTraffic}`}</span>
        ${mine ? `<span class="on">✓ ${T`Sponsorsun`}</span>` : `<button class="btn sm ${S.coins < BAL.sponsorCost ? 'off' : ''}" data-sponsor="${x.day}">₺${BAL.sponsorCost} · ${T`Sponsor ol`}</button>`}</div>`;
    }).join('') : ''}
    <div class="row end">${ev && EVENTS[ev].town !== S.town && S.phase === 'morning' ? `<button class="btn" data-go>🗺️ ${T`Haritayı aç`}</button>` : ''}<button class="btn hl" data-close>${T`Günaydın!`}</button></div>`, 'wide');
  p.querySelector('[data-close]').onclick = closePanel;
  p.querySelectorAll('[data-sponsor]').forEach(b => b.onclick = () => act('sponsor', +b.dataset.sponsor));
  p.querySelector('[data-go]')?.addEventListener('click', () => act('map'));
}
