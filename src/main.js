// Oyunun yapıştırıcısı: durum + sahne + kalabalık + arayüz. Sabah ve akşam kaydeder.
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './style.css';
import { BAL } from './data/balance.js';
import { TOWNS } from './data/towns.js';
import { COUNTRIES } from './data/countries.js';
import { GENRES } from './data/genres.js';
import { BOOK } from './data/books.js';
import { DECOR, PAINTS, UPGRADES, SHELF_LEVELS } from './data/decor.js';
import { newGame, shelfCount, shelfCap, seasonOf } from './game/state.js';
import { buyBox, travel, resolveCustomer, recommend, rescue, chooseSpot, spotOf, makeRegular, makeCustomer, toggleFeature, buyStall, talkHint, teaLine, refillShelves, donate, sponsor, haggleMove, openingLine, abandonDeal } from './game/shop.js';
import { REGULARS, HEARTS_MAX } from './data/regulars.js';
import { effects, equipDecor, upgradeShelf, choosePaint, buyUpgrade } from './game/decor.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning, afterFerry } from './game/day.js';
import { loadGame, loadProblem, saveGame as persistGame, clearGame, restoreBackup } from './core/save.js';
import { unlock, sfx, settings, applySettings, setSeason, setRain, setMood, setAmbience } from './audio/audio.js';
import { SPOTS } from './data/spots.js';
import { weatherOf, dayMods, eventOf } from './game/calendar.js';
import { checkStory, checkUnlocks } from './game/story.js';
import { checkCountries } from './game/travel.js';
import { roadEvent, chooseRoad, ROAD_BY_ID } from './game/road.js';
import { placeAll, shelve, unshelve, moveBook, setLabel, setPrice, syncLayout, setBookPrice } from './game/shelving.js';
import { replyFor } from './game/replies.js';
import { tutorialStep, tutorialEvent } from './game/tutorial.js';
import { HAP, dueHappening, chooseHappening } from './game/happenings.js';
import { morningLetter, writeLetter, offerQuest } from './game/mail.js';
import { checkStamps } from './game/stamps.js';
import { STAMPS } from './data/stamps.js';
import { PAGES } from './data/story.js';
import { tap } from './core/native.js';
import { T, setLang } from './i18n/i18n.js';
import { readBook, learnAll } from './game/knowledge.js';
import { orderBook, favorOpen, makeFavor } from './game/bonds.js';
import { auctionLot, rentBq, fillBq, buyRoses, restoreCopy } from './game/voyage.js';
import { deliverFavor } from './game/shop.js';
import { TAGS } from './data/books.js';
import { buildScene } from './render/scene.js';
import { buildScene2 } from './render2/scene2.js';
import { createCrowd, personSVG, figureMeta } from './render/people.js';
import { ARCHETYPES } from './data/archetypes.js';
import { createAmbient } from './render/ambient.js';
import { createUI } from './ui/ui.js';
import { unlockGenre, buyLot, setApprentice, apprenticeTakes } from './game/progress.js';
import { FEATURES } from './data/features.js';
import { WEATHER, EVENTS } from './data/calendar.js';

const MIN_PER_SEC = (BAL.dayEnd - BAL.dayStart) / 120;   // normal hızda bir gün ≈ 2 dakika
const FAST = 3;

const S = loadGame() || newGame();
// geliştirme: ?sahne=foca/kale ile kayda dokunmadan bir mekânı aç (ekran görüntüleri için)
const PREVIEW = import.meta.env.DEV && new URLSearchParams(location.search).get('sahne');
if (PREVIEW) {
  const [town, spot] = PREVIEW.split('/');
  if (SPOTS[town]?.[spot]) Object.assign(S, { town, spot, phase: 'morning' });
  const day = +new URLSearchParams(location.search).get('gun');
  if (day > 0) S.day = day;
}
const saveGame = PREVIEW ? () => {} : persistGame;
// çizim motoru: varsayılan yeni canvas motoru; ⚙️ "Basit görünüm" ya da ?motor=1 eski SVG motorunu seçer
const MOTOR_Q = new URLSearchParams(location.search).get('motor');
const MOTOR2 = MOTOR_Q ? MOTOR_Q === '2' : !settings.simple;
const scene = (MOTOR2 ? buildScene2 : buildScene)(document.getElementById('scene'));
let speed = 1;

// sahne koordinatını (1600×900) çerçeve içi orana çevirir; sahne kırpılsa da (dikey ekran) doğru yeri verir
function toFrame(x, y) {
  const sp = scene.toClient(x, y), fr = document.getElementById('frame').getBoundingClientRect();
  return { xf: (sp.x - fr.left) / fr.width, yf: (sp.y - fr.top) / fr.height };
}

const crowd = createCrowd(scene.crowdView(), {
  browse(c) {
    const r = resolveCustomer(S, c);
    if (r.bought.length) { scene.setStock(S); tap(); sale(); }
    return r;
  },
  // öneri isteyene ya da tezgâhta pazarlık bekleyene dokunuldu: panel açılır, saat durur
  ask(c) {
    if (c.deal) return openHaggle(c);
    sfx('page');
    ui.recPanel(S, c, (id, opts = {}) => {
      const r = recommend(S, c, id, opts);
      tutorialEvent(S, 'rec');
      // önerilen kitap etiket fiyatına göre pahalı geldi: kitap elinde, pazarlık şeridi açılır
      if (r.deal) { scene.setStock(S); return openHaggle(c); }
      afterRec(c, r, id);
    }, settings.hints !== false, { onTalk: () => talkHint(S, c), tea: S.upgrades.includes('cay'), teaLine: () => teaLine(S),
      // müdavimin ricası: kitap raftaysa doğrudan verilir
      favor: c.reg && favorOpen(S, c.reg) ? S.favors[c.reg].book : null,
      onFavor: () => {
        const d = deliverFavor(S, c.reg);
        if (d.why) return ui.toast(d.why);
        scene.setStock(S); tap('MEDIUM'); sfx('heart'); ui.confetti();
        crowd.answer(c, { bought: [d.book], paid: d.coins, tip: 0, happy: true, grade: 'perfect' });
        if (d.friend?.gift || d.friend?.keepsake) return ui.giftPanel(d.friend);
        const a = crowd.anchor(c);
        ui.speech(c, T`«${BOOK[d.book].title}»! Bunu nereden buldun? Yıllardır arıyordum.`, 'perfect', `+₺${d.coins}${d.friend ? ` · 💛 ${d.friend.hearts}/${HEARTS_MAX}` : ''}`, a && toFrame(a.x, a.y));
      } });
  },
  // müşteri bir kitapla tezgâha geldi: başka panel açık değilse pazarlık şeridi hemen açılır, değilse 🏷️ balonuyla bekler
  offer(c) {
    // çırak: eşiğin üstündeki teklifi senin yerine kabul eder
    if (apprenticeTakes(S, c.deal)) {
      const o = haggleMove(S, c, 'accept');
      crowd.answer(c, o.res); scene.setStock(S); sfx('coin');
      return ui.toast(T`🧒 Çırak sattı: «${BOOK[o.res.bought[0]].title}» ₺${o.res.paid}`);
    }
    if (!ui.isOpen() && S.phase === 'open') { crowd.engage(c); openHaggle(c); }
  },
  timeout: c => c.deal ? abandonDeal(S, c) : recommend(S, c, null),
  paid: x => { const at = toFrame(x, 540); ui.flyCoin(at.xf, at.yf); },
});

// Satış sesi: kitap raftan kalkar, tezgâhta kâğıda sarılır (render2/crowd-view.js bookFly), para kasaya düşer
function sale() { sfx('lift'); setTimeout(() => sfx('wrap'), 320); setTimeout(() => sfx('till'), 640); }

// Önerinin sonucu: müşterinin karşılığı (konuşma kartı), kalp, hediye, rica
function afterRec(c, r, id = r.bought[0] || null) {
  if (r.bought.length) { scene.setStock(S); tap(r.grade === 'perfect' ? 'MEDIUM' : 'LIGHT'); }
  crowd.answer(c, r);
  sfx(r.grade === 'perfect' || r.friend ? 'heart' : r.bought.length ? 'coin' : 'sad');
  if (r.friend?.gift || r.friend?.coins || r.friend?.keepsake) { saveGame(S); ui.confetti(); ui.giftPanel(r.friend); }
  if (r.friend?.favor) setTimeout(() => ui.toast(T`🎁 ${REGULARS[c.reg].name} senden bir ricada bulundu: «${BOOK[r.friend.favor].title}». Bir dahaki gelişinde rafında olsun.`), 1800);
  // müşterinin karşılığı: konuşma kartı (kalp ya da bahşiş bilgisiyle); bütçesini aştıysa yalnız üzgün yüz
  if (r.tooDear) return ui.toast(T`Kitabı çok beğendi ama etiket fiyatı bütçesini fazlasıyla aşıyordu.`);
  const line = c.reg && r.grade === 'perfect' ? REGULARS[c.reg].thanks : replyFor(S, c, r.discounted ? { grade: 'good' } : r, id);
  const base = r.waiting ? T`🎁 Ricasını bekliyor` : r.friend && !r.friend.gift && !r.friend.coins ? `💛 ${r.friend.hearts}/${HEARTS_MAX}` : r.discounted ? T`İndirimle ₺${r.paid}` : r.haggled ? `₺${r.paid}` : r.grade !== 'miss' ? T`Bahşiş ₺${r.tip}` : '';
  // öneriden öğrenilen etiket: kart bir sonraki sefer onu gösterir
  const note = [base, (r.learned || []).length ? '📚 ' + r.learned.map(t => TAGS[t].icon + ' ' + TAGS[t].name).join(', ') : ''].filter(Boolean).join(' · ');
  const a = crowd.anchor(c);
  if (!(r.friend?.gift || r.friend?.coins || r.friend?.keepsake)) ui.speech(c, line, r.grade, note, a && toFrame(a.x, a.y));
}

// Pazarlık: müşteri tezgâhta, kitap elinde. Şerit açılır, saat durur; her hamlede müşterinin cevabı gelir (game/shop.js haggleMove)
function openHaggle(c) {
  if (!c.deal) return;
  sfx('page');
  ui.hagglePanel(S, c, openingLine(S, c), m => {
    const o = haggleMove(S, c, m);
    if (!o.res) sfx('tap');
    else if (o.res.bought.length) { scene.setStock(S); tap(o.happy ? 'MEDIUM' : 'LIGHT'); sale(); if (o.happy) setTimeout(() => sfx('heart'), 700); }
    else { scene.setStock(S); sfx('sad'); }
    if (o.res && tutorialEvent(S, 'haggle')) saveGame(S);
    return o;
  }, r => {
    // şerit kapandı: öneriyle gelen ve aldıysa önerinin karşılığı, değilse yalnız sonuç (para uçar, yüz değişir)
    if (c.ask && r.bought.length) afterRec(c, r); else crowd.answer(c, r);
    // sırada bekleyen başka pazarlıkçı varsa onun şeridi açılır
    setTimeout(nextDeal, 500);
  });
}
function nextDeal() {
  if (ui.isOpen() || S.phase !== 'open') return;
  const c = crowd.firstDeal();
  if (c) { crowd.engage(c); openHaggle(c); }
}
// canlı arka plan: yeni motorda sahnenin içinde
const ambient = MOTOR2 ? null : createAmbient(scene.ambientBack, scene.ambientFront);
// karavana dokununca içi açılır
scene.setOpen(S.phase === 'open');
scene.onCart(() => { if (!ui.isOpen()) { sfx('page'); ui.interiorPanel(S); } });

// sabah alışverişinden sonra pul kontrolü
function stampCheck() {
  if (!FEATURES.pul) return;
  const won = checkStamps(S);
  if (!won.length) return;
  saveGame(S);
  sfx('heart');
  const st = STAMPS.find(x => x.id === won[0]);
  ui.confetti();
  setTimeout(() => ui.toast(T`🏅 Yeni pul: ${st.icon} ${st.name}`), 600);
}

let openWarned = false;
// Ortak kalıp: kural bir uyarı döndürürse göster; döndürmezse başarı adımlarını çalıştır; her durumda paneli tazele
const attempt = (why, ok, refresh) => { if (why) ui.toast(why); else ok(); refresh?.(); };
// Akdeniz'in işleri: müzayede, bukinist kutusu, gül, onarım (onarım raf katmanından gelir, ötekiler mekân panelinden)
const voyageCmd = (run, done, sound = 'page', panel = () => ui.spotPanel(S)) => arg => attempt(run(arg), () => { tap(); sfx(sound); saveGame(S); scene.setStock(S); ui.toast(done()); }, panel);

// Komut tablosu: arayüzün her eylemi (act(ad, arg)) burada tek bir işleve karşılık gelir.
// Kurallar game/*'ta; buradaki işlevler kuralı çağırır, sesi, kaydı ve paneli yönetir.
const COMMANDS = {
  stock: () => ui.stockPanel(S),
  inside: () => ui.interiorPanel(S),
  feature: id => attempt(toggleFeature(S, id), () => { tap(); sfx('tap'); saveGame(S); }, () => ui.interiorPanel(S)),
  // raf düzenleyiciden gelen hamle: diz, taşı, koliye geri al, vitrine koy, etiket as
  shelf: o => {
    let why = null;
    if (o.op === 'auto') { if (!placeAll(S)) why = T`Rafta boş yer yok.`; else { sfx('page'); tutorialEvent(S, 'shelve'); } }
    else if (o.op === 'label') why = setLabel(S, o.sec, o.g);
    else if (o.op === 'price') why = setPrice(S, o.sec, o.tag);
    else if (o.op === 'tag') { const [, x, y] = o.from.split(':').map(Number); why = setBookPrice(S, x, y, o.price); }
    else if (o.op === 'drop') {
      const [k, x, y] = o.from.split(':').map((v, i) => i ? +v : v);
      if (o.to === 'vit') {
        const id = k === 's' ? S.layout.sections[x]?.books[y]?.id : null;
        why = !id ? T`Önce rafa koy, sonra vitrine.` : S.featured.includes(id) ? null : toggleFeature(S, id);
      } else if (o.to === 'crate') why = k === 'c' ? null : unshelve(S, x, y);
      else if (o.to === 'sec') {
        why = k === 'c' ? shelve(S, x, o.sec, o.pos) : moveBook(S, x, y, o.sec, o.pos);
        if (!why && k === 'c') tutorialEvent(S, 'shelve');
      }
    }
    attempt(why, () => { tap(); sfx(o.op === 'drop' || o.op === 'auto' ? 'place' : 'tap'); saveGame(S); scene.setStock(S); }, () => ui.interiorPanel(S));
  },
  decor: () => { if (tutorialEvent(S, 'decor')) saveGame(S); ui.decorPanel(S); },
  paper: () => { sfx('page'); ui.paperPanel(S); },
  book: () => { sfx('page'); if (tutorialEvent(S, 'book')) saveGame(S); ui.bookPanel(S); },
  settings: () => ui.settingsPanel(settings, S),
  scale: v => { settings.textScale = v; applySettings(); applyScale(); ui.settingsPanel(settings, S); },
  tutskip: () => { tutorialEvent(S, 'skip'); saveGame(S); },
  theme: v => { settings.theme = v; applySettings(); ui.settingsPanel(settings, S); },
  // dil değişince oyun yeniden açılır: içerik açılışta yerleşir (i18n/en)
  lang: v => { setLang(v); location.reload(); },
  upgrade: key => attempt(buyUpgrade(S, key), () => {
    tap('MEDIUM'); sfx('box'); scene.setUpgrades(upgradeView()); scene.setPaintFx(settings.paint !== false); saveGame(S); ui.confetti();
    ui.toast(T`${UPGRADES[key].icon} ${UPGRADES[key].name} karavana eklendi`); stampCheck();
  }, () => ui.decorPanel(S)),
  toggle: key => {
    if (key === 'simple') { settings.simple = !settings.simple; Promise.resolve(applySettings()).then(() => location.reload()); return; }
    settings[key] = !settings[key]; applySettings(); scene.setPaintFx(settings.paint !== false); ui.settingsPanel(settings, S);
  },
  reset: () => clearGame().then(() => location.reload()),
  'restore-bak': () => restoreBackup().then(ok => ok ? location.reload() : ui.toast(T`Yedek kayıt yok.`)),
  spot: key => {
    if (!key) { if (tutorialEvent(S, 'spot')) saveGame(S); return ui.spotPanel(S); }
    const why = chooseSpot(S, key);
    if (why) return ui.toast(why);
    saveGame(S);
    changeTown(() => { ui.closePanel(); ui.toast(T`📍 Karavan kuruldu: ${spotOf(S).name}`); });
  },
  map: () => ui.mapPanel(S),
  stall: i => attempt(buyStall(S, i), () => { tap(); sfx('page'); saveGame(S); ui.toast(T`🧺 Kitap koliye kondu`); }, () => ui.stockPanel(S)),
  auction: voyageCmd(id => auctionLot(S, id), () => T`🔨 Kitap müzayedede: akşam açık artırmada satılacak.`),
  'bq-rent': voyageCmd(() => rentBq(S), () => T`📦 Bukinist kutusu senin: koliden kitap koy, her gece satsın.`),
  'bq-fill': voyageCmd(() => fillBq(S) ? null : T`Koliye konacak kitap yok ya da kutu dolu.`, () => T`📦 Kitaplar kutuya kondu.`),
  roses: voyageCmd(n => buyRoses(S, n), () => T`🌹 Güller kovada: her satışın yanına bir gül.`, 'tap'),
  restore: voyageCmd(from => restoreCopy(S, from), () => T`🪶 Usta kopyayı onardı: artık temiz.`, 'page', () => ui.interiorPanel(S)),
  order: id => attempt(orderBook(S, id), () => { sfx('letter'); saveGame(S); ui.toast(T`📮 «${BOOK[id].title}» sipariş edildi: yarın sabah kolide.`); }, () => ui.stockPanel(S)),
  // okuma köşesi: kitabın bütün etiketleri açılır
  read: id => attempt(readBook(S, id), () => { sfx('page'); saveGame(S); ui.toast(`📖 ${BOOK[id].title}: ${BOOK[id].tags.map(t => TAGS[t].icon + ' ' + TAGS[t].name).join(', ')}`); }, () => ui.interiorPanel(S)),
  // rafı tamamla: etiketli bölümlerin boşluklarını kendi türünden kolilerle doldurup dizer
  refill: () => {
    const got = refillShelves(S);
    if (!got.length) ui.toast(T`Tamamlanacak boşluk yok ya da paran yetmiyor (etiketli bölümlere bak).`);
    else {
      tap(); sfx('box'); tutorialEvent(S, 'buy'); tutorialEvent(S, 'shelve'); scene.setStock(S); saveGame(S);
      ui.toast(T`🔁 ${got.length} koli alındı ve dizildi: ${got.map(g => GENRES[g].icon).join(' ')}`);
    }
    ui.stockPanel(S);
  },
  donate: () => attempt(donate(S), () => { sfx('heart'); ui.confetti(); saveGame(S); ui.toast(T`📖 ${TOWNS[S.town].name} meydanına bir okuma köşesi kuruldu!`); stampCheck(); }, () => ui.spotPanel(S)),
  sponsor: day => attempt(sponsor(S, day), () => { sfx('bell'); saveGame(S); ui.toast(T`🎪 Sponsor oldun: o gün orada dükkân açarsan kalabalık daha büyük olur.`); }, () => ui.paperPanel(S)),
  buy: g => {
    const why = buyBox(S, g);
    if (why) ui.toast(why);
    else {
      tap(); sfx('box'); tutorialEvent(S, 'buy'); scene.setStock(S); saveGame(S);
      const rare = S.lastBox.rare;
      if (S.lastBox.kostas) { sfx('letter'); ui.confetti(); ui.kostasFoundPanel(S.lastBox.kostas); return; }
      if (rare.length) { sfx('heart'); ui.toast(T`✨ Kolide bir ilk baskı çıktı: ${BOOK[rare[0]].title}! Koleksiyoncuya sakla.`); }
      else ui.toast(T`${GENRES[g].icon} ${BAL.boxSize} kitap koliye kondu — 📚 Raflar'dan diz`);
    }
    ui.stockPanel(S);
  },
  'decor-on': key => attempt(equipDecor(S, key), () => {
    tap(); scene.setDecor(S.decor.on); scene.setUpgrades(upgradeView()); saveGame(S); ui.toast(T`${DECOR[key].icon} ${DECOR[key].name} yerine kondu`); stampCheck();
  }, () => ui.decorPanel(S)),
  // yeni araba basamağı: karavanda görünür (koli yığını, çatı bagajı, yan kanat), konfeti
  'shelf-up': () => attempt(upgradeShelf(S), () => {
    tap('MEDIUM'); sfx('heart'); scene.setStock(S); scene.setUpgrades(upgradeView()); saveGame(S); ui.confetti();
    ui.toast(T`${SHELF_LEVELS[S.shelfLv].icon} Yeni araban: ${SHELF_LEVELS[S.shelfLv].name}! Raflara ${shelfCap(S)} kitap sığar.`); stampCheck();
  }, () => ui.decorPanel(S)),
  unlock: g => attempt(unlockGenre(S, g), () => { tap('MEDIUM'); sfx('heart'); saveGame(S); ui.toast(T`${GENRES[g].icon} ${GENRES[g].name} açıldı: artık kolisini alabilirsin.`); }, () => ui.stockPanel(S)),
  lot: i => attempt(buyLot(S, i), () => { tap(); sfx('page'); saveGame(S); ui.toast(T`📜 İlk baskı koliye kondu: rafa diz, koleksiyoncuyu bekle.`); }, () => ui.stockPanel(S)),
  apprentice: v => attempt(setApprentice(S, v), () => { tap(); saveGame(S); }, () => ui.decorPanel(S)),
  paint: key => attempt(choosePaint(S, key), () => { tap(); scene.setPaint(S.paint); saveGame(S); stampCheck(); }, () => ui.decorPanel(S)),
  travel: key => {
    const why = travel(S, key);
    if (why) return ui.toast(why);
    // yolda arada bir küçük bir karşılaşma (varınca kartı açılır); feribotta değil
    const trip = S.lastTrip || {}, road = trip.abroad ? null : roadEvent(S);
    if (trip.abroad) { const gift = afterFerry(S); if (gift) setTimeout(() => ui.toast(T`Belediyeden ₺${gift} destek: kasa boştu, bir koli alabilirsin.`), 2600); }
    saveGame(S);
    sfx('whoosh');
    changeTown(() => {
      ui.closePanel();
      if (trip.abroad) {
        // denizde geçen günün ertesi sabahı: yeni gazete, mektup ve ilan
        const C = COUNTRIES[TOWNS[S.town].country];
        ui.toast(trip.stamp ? T`⛴️ Bir gün süren yolculuktan sonra: ${C.greet}, ${TOWNS[S.town].name}! 🛂 Pasaportuna ${C.name} damgası basıldı.` : T`⛴️ Feribot yanaştı: ${C.greet}, ${TOWNS[S.town].name}!`);
        if (trip.stamp) { sfx('letter'); ui.confetti(); }
        refreshDay();
        setTimeout(() => { if (!ui.isOpen()) { if (S.post?.letter) sfx('letter'); ui.paperPanel(S); } }, 1400);
      } else ui.toast(T`Hoş geldin: ${TOWNS[S.town].name}!`);
      if (road) setTimeout(() => { sfx('hap'); ui.hapPanel(ROAD_BY_ID[road], i => {
        const r = chooseRoad(S, road, i);
        saveGame(S); scene.setStock(S);
        if (r.friend?.gift || r.friend?.coins || r.friend?.keepsake) r.after = () => ui.giftPanel(r.friend);
        return r;
      }); }, 700);
    });
  },
  open: () => {
    // kolide kitap varken ilk dokunuş uyarır: dizilmeyen kitap satılmaz
    if (S.crate.length && !openWarned) { openWarned = true; return ui.toast(T`📦 Kolide ${S.crate.length} kitap var, rafa dizilmeyen satılmaz. Yine de açmak için tekrar dokun.`); }
    openWarned = false;
    const why = openShop(S);
    if (why) return ui.toast(why);
    tap('MEDIUM');
    sfx('bell');
    tutorialEvent(S, 'open');
    scene.setOpen(true);
    if (!shelfCount(S)) ui.toast(T`Raflar boş! Müşteriler eli boş dönecek.`);
    else if (S.day === 1) ui.toast(T`Müşteriler kitap seçip tezgâha gelir: pazarlık et! ❓ balonlu müşteri senden öneri ister.`);
  },
  speed: () => { speed = speed > 1 ? 1 : FAST; },
  next: () => {
    // hikâye bittiyse önce kapanış ekranı
    if (S.pages.length >= PAGES.length && !S.finaleShown) {
      S.finaleShown = true;
      saveGame(S);
      sfx('heart');
      return ui.finalePanel(S, () => act('next'));
    }
    nextMorning(S);
    tutorialEvent(S, 'next');
    const gift = rescue(S);
    if (gift) ui.toast(T`Belediyeden ₺${gift} destek: kasa boştu, bir koli alabilirsin.`);
    speed = 1;
    scene.setDaylight(0);
    refreshDay();
    saveGame(S);
    if (S.post?.letter) sfx('letter');
    morningNote();
  },
};

// Sabah: gazete yerine tek satır (hava, buradaki etkinlik, gelen sipariş). Gazete kenara alındı (data/features.js)
function morningNote() {
  if (FEATURES.gazete) return ui.paperPanel(S);
  const w = WEATHER[weatherOf(S.day)], ev = eventOf(S.day), orders = S.post?.orders || [];
  const parts = [`${w.icon} ${w.name}`];
  if (ev && EVENTS[ev].town === S.town) parts.push(`🎉 ${EVENTS[ev].name}`);
  if (orders.length) parts.push(T`📦 Siparişin koliye geldi: ${orders.map(b => '«' + BOOK[b].title + '»').join(', ')}`);
  ui.toast(parts.join(' · '));
}
const act = (a, arg) => COMMANDS[a]?.(arg);
const ui = createUI(document.getElementById('ui'), act);
// yeni motorda raflar karavanın kendisinde dizilir
if (MOTOR2) ui.useStage(() => scene.screenMap());

// karavanda görünenler: satış araçları ve araba basamağı (render/scene.js setUpgrades)
function upgradeView() { return [...S.upgrades, 'lv' + S.shelfLv]; }

function refreshDay() {
  const m = dayMods(S.day, S.town);
  scene.setSeason(seasonOf(S.day));
  scene.setWeather(weatherOf(S.day));
  setSeason(seasonOf(S.day));
  setRain(weatherOf(S.day) === 'yagmurlu');
  setAmbience({ scene: spotOf(S).scene, weather: weatherOf(S.day), night: false });
  crowd.setContext({ rain: weatherOf(S.day) === 'yagmurlu', dark: false });
  setMood({ town: S.town, lively: !!(m.event || m.special), night: false });
  scene.setFestival(!!(m.event || m.special));
}

function changeTown(done) {
  const fade = document.getElementById('fade');
  fade.classList.add('on');
  setTimeout(() => {
    scene.setTown(S.town);
    scene.setSpot(spotOf(S).scene, S.town);
    setAmbience({ scene: spotOf(S).scene });
    refreshDay();
    done && done();
    fade.classList.remove('on');
  }, 500);
}

scene.setTown(S.town);
scene.setSpot(spotOf(S).scene, S.town);
refreshDay();
scene.setDaylight(0);
scene.setStock(S);
scene.setDecor(S.decor.on);
scene.setUpgrades(upgradeView());
scene.setPaint(PAINTS[S.paint] ? S.paint : 'nane');
// açılış: krem perde yazı tipi ve sahne hazır olunca kalkar
if (PREVIEW) {
  document.getElementById('fade').style.display = 'none';
  // ?susler=zeytin,kabuk,fok · ?panel=spot|decor|gift
  const q = new URLSearchParams(location.search);
  for (const k of (q.get('susler') || '').split(',')) if (DECOR[k]) S.decor.on[DECOR[k].slot] = k;
  scene.setDecor(S.decor.on);
  const panel = q.get('panel');
  if (panel === 'spot') ui.spotPanel(S);
  if (panel === 'paper') ui.paperPanel(S);
  if (panel === 'settings') ui.settingsPanel(settings);
  if (panel === 'stock') { S.coins = 120; ui.stockPanel(S); }
  if (panel === 'oneri') { S.upgrades = ['cay']; let c; do c = makeCustomer(S); while (!c.ask); ui.recPanel(S, c, () => {}, true, { onTalk: () => talkHint(S, c), tea: true, teaLine: () => teaLine(S) }); if (q.has('konustur')) setTimeout(() => { document.querySelector('[data-talk]')?.click(); document.querySelector('[data-tea]')?.click(); }, 300); }
  if (panel === 'konus') { const c = makeCustomer(S); c.arch = 'balikci'; c.style = ARCHETYPES.balikci.style; c.ask = { tags: ['deniz'] }; ui.speech(c, replyFor(S, c, { grade: 'perfect' }, 'yasliadam'), 'perfect', 'Bahşiş ₺5', toFrame(1210, 470)); }
  if (panel === 'ic') { S.coins = 999; S.shelfLv = 1; S.genres = Object.keys(GENRES); buyBox(S, 'roman'); placeAll(S); buyBox(S, 'siir'); buyBox(S, 'fantastik'); S.featured = Object.keys(S.shelf).slice(2, 4); ui.interiorPanel(S); }
  // ?insanlar: farklı tiplerden on kişilik dizi (yürüyen, okuyan, sevinen)
  if (q.has('insanlar')) {
    const kinds = ['ogrenci', 'emekli', 'balikci', 'turist', 'anne', 'cocuk', 'sevgili', 'yazar', 'teyze', 'sorfcu'];
    const seed = +q.get('insanlar') || 1;
    const tasi = q.get('tasi') || '';
    crowd.setContext({ rain: tasi.includes('semsiye'), dark: tasi.includes('fener') });
    crowd.preview(kinds.map((k, i) => ({ c: { look: i * 7919 + seed, style: ARCHETYPES[k].style }, x: 110 + i * 152, state: ['walking', 'reading', '', 'cheer'][i % 4] })));
  }
  if (panel === 'istatistik') {
    Object.assign(S.soldBooks, { kurk: 9, hobbit: 7, garip: 6, defne: 5, nutuk: 4, yasliadam: 3 });
    Object.assign(S.totals, { days: 12, sold: 34, revenue: 412, perfect: 18, bestDay: 61, bestDayNo: 9, rareSold: 2 });
    S.townDays = { ayvalik: 7, foca: 5 };
    ui.statsPanel(S);
  }
  if (q.has('gelistir')) { S.upgrades = ['cay', 'plak', 'paket', 'fener', 'cirak']; S.shelfLv = +q.get('gelistir') || 3; scene.setUpgrades(upgradeView()); scene.setStock(S); }
  // ?panel=atolye: dolu bir atölye · ?panel=stock&mezat: mezat günü
  if (panel === 'atolye') { S.coins = 900; S.upgrades = ['cirak', 'paket']; ui.decorPanel(S); }
  if (q.has('mezat')) { while (S.day % BAL.mezatEvery !== BAL.mezatOn) S.day++; S.coins = 300; ui.stockPanel(S); }
  if (panel === 'harita') { if (q.has('acik')) { S.unlocked = Object.keys(TOWNS); S.countries = Object.keys(COUNTRIES); } ui.mapPanel(S); }
  if (panel === 'pasaport') { S.countries = ['tr', 'gr']; S.passport = { tr: 1, gr: 12 }; ui.bookPanel(S); document.querySelector('[data-tab="passport"]')?.click(); }
  if (panel === 'kostas') { S.pages = PAGES.map(p => p.id); S.unlocked.push('bozcaada'); S.kostasFound = ['yasliadam', 'odysseia', 'korfez']; ui.kostasPanel(S); }
  if (q.has('hava')) scene.setWeather(q.get('hava'));
  if (q.has('aksam')) setTimeout(() => scene.setDaylight(+q.get('aksam') || 0.95), 100);
  if (panel === 'olay') ui.hapPanel(HAP[q.get('olay') || 'eskici'], i => chooseHappening(S, q.get('olay') || 'eskici', i));
  if (panel === 'posta') {
    S.recHistory.push({ day: 1, town: 'ayvalik', spot: 'iskele', book: 'yasliadam', arch: 'balikci', look: 3 });
    S.day = 9;
    S.post = { letter: morningLetter(Object.assign(S, { day: 9 })) || writeLetter(S, S.recHistory[0]), quest: offerQuest(S) || offerQuest(S) || offerQuest(S) };
    ui.paperPanel(S);
  }
  if (q.has('nadir')) { const ids = Object.keys(S.shelf); S.rare = { [ids[0]]: 1, [ids[7]]: 1 }; scene.setStock(S); }
  if (panel === 'pazarlik') {
    openShop(S);
    const arch = q.get('kim') || 'ogrenci';
    for (let k = 0; k < 60; k++) {
      const c = makeCustomer(S);
      Object.assign(c, { arch, style: ARCHETYPES[arch].style, ask: null, wants: Object.keys(S.shelf).map(id => BOOK[id].genre)[0] });
      c.tr = { ...c.tr, budget: 13, greed: 0.25, patience: 3, care: 'tavsiye' };
      for (const id in S.shelf) learnAll(S, id);
      syncLayout(S).sections.forEach(sec => sec.books.forEach(e => { e.cond = 'temiz'; }));
      if (q.has('tanidik')) { S.patrons.p1 = { arch, look: c.look, style: c.style, town: S.town, tr: c.tr, visits: 2, since: 1, last: { book: Object.keys(S.shelf)[1], price: 12, sticker: 14, day: 1 }, seen: { budget: 13, patience: false, care: false } }; c.pat = 'p1'; }
      if (resolveCustomer(S, c).deal) { openHaggle(c); break; }
    }
  }
  if (panel === 'koleksiyoncu') { let c; do c = makeCustomer(S); while (!(c.ask && c.ask.rare)); ui.recPanel(S, c, () => {}); }
  if (panel === 'album') { S.stamps = ['ilkgun', 'isabet', 'elli', 'ege', 'festival', 'yagmur', 'dost']; S.totals.sold = 120; ui.albumPanel(S); }
  if (panel === 'finale') { Object.assign(S.totals, { days: 34, sold: 512, perfect: 61 }); S.friends = { hasan: 5, ela: 4 }; S.stamps = STAMPS.slice(0, 14).map(s => s.id); ui.finalePanel(S, () => {}); }
  if (panel === 'book') { S.pages = ['miras', 'dostlar', 'liste']; S.visited = ['ayvalik', 'cunda']; ui.bookPanel(S); }
  if (panel === 'musteriler') { S.met = ['hasan', 'melis', 'ruya']; S.friends = { hasan: 3, melis: 5, ruya: 1 }; S.keepsakes = ['melis'];
    S.patrons = { p1: { arch: 'ogrenci', look: 4242, style: ARCHETYPES.ogrenci.style, town: 'ayvalik', tr: { budget: 18, patience: 2, care: 'ucuzluk' }, visits: 3, since: 1, last: { book: 'yasliadam', price: 11, sticker: 14, day: 2 }, seen: { budget: 16, patience: true, care: false } },
      p2: { arch: 'koleksiyoncu', look: 777, style: ARCHETYPES.koleksiyoncu.style, town: 'foca', tr: { budget: 120, patience: 1, care: 'nadirlik' }, visits: 1, since: 3, last: { book: 'hobbit', price: null, sticker: null, day: 3 }, seen: { budget: null, patience: false, care: true } } }; ui.bookPanel(S); document.querySelector('[data-tab="people"]')?.click(); }
  if (panel === 'decor') ui.decorPanel(S);
  // ?panel=rec&kim=hasan&rica: 3 kalpli müdavim, ricası rafta
  if (panel === 'rec') {
    const kim = q.get('kim') || 'hasan';
    if (q.has('rica')) { S.friends[kim] = 3; S.met.push(kim); const fv = makeFavor(S, kim); S.shelf[fv.book] = 1; }
    ui.recPanel(S, makeRegular(S, kim), () => {}, true, { favor: S.favors[kim]?.book, onFavor: () => {} });
  }
  // ?panel=bag&ac=spotPanel|stockPanel|decorPanel|paperPanel: itibar, rica, sipariş ve hatıralar dolu bir oyun
  if (panel === 'bag') {
    S.rep.ayvalik = 11; S.friends = { hasan: 3, melis: 5 }; S.met = ['hasan', 'melis']; S.keepsakes = ['melis', 'selim', 'ela'];
    makeFavor(S, 'hasan'); S.coins = 300;
    ui[q.get('ac') || 'spotPanel'](S);
  }
  // ?panel=akdeniz&ulke=it: o ülkenin şehrinde, işi dolu (müzayede için ilk baskı, kutu, gül); ?panel=tore: açılış töreni
  if (panel === 'akdeniz') {
    const town = { gr: 'atina', it: 'roma', fr: 'marsilya', es: 'barselona', eg: 'kahire' }[q.get('ulke') || 'it'];
    Object.assign(S, { town, spot: Object.keys(SPOTS[town])[0], countries: Object.keys(COUNTRIES), coins: 300 });
    S.unlocked = Object.keys(TOWNS); S.shelf.hobbit = 2; S.rare.hobbit = 1; S.voyage.pages = { gr: 3, it: 1, fr: 2, es: 1 }; S.voyage.stats = { islandDays: 3, auctions: 0, bqSold: 7 };
    S.voyage.roses = 4; S.crate = [{ id: 'garip', rare: false, cond: 'yipranmis' }];
    scene.setTown(town); scene.setSpot(spotOf(S).scene, town);
    ui[q.get('ac') || 'spotPanel'](S);
  }
  if (panel === 'toren') { S.voyage.pages = { gr: 3, it: 3, fr: 3, es: 3, eg: 3 }; S.grandDone = true; S.friends = { hasan: 5, melis: 5 }; ui.grandPanel(S); }
  if (panel === 'gift') ui.giftPanel(q.has('hatira') ? { id: 'melis', hearts: 5, keepsake: 'melis' } : { id: 'hasan', hearts: 5, gift: 'zeytin' });
}
// perde: yazı tipleri ve (yeni motorda) ilk pişirme hazır olunca kalkar.
// Pişirme başarısız olursa (ör. tarayıcı SVG'yi çözemezse) basit görünüme geçilir; perde ne olursa olsun en geç 6 sn'de kalkar.
const lift = () => document.getElementById('fade').classList.remove('boot');
Promise.all([document.fonts.ready, scene.ready]).then(([, baked]) => {
  if (baked === false && MOTOR2 && !MOTOR_Q && !PREVIEW) { settings.simple = true; Promise.resolve(applySettings()).then(() => location.reload()); }
  else setTimeout(lift, 50);
}, () => setTimeout(lift, 50));
setTimeout(lift, 6000);
if (S.phase === 'evening' && S.lastDay) { scene.setDaylight(1); ui.summaryPanel(S, S.lastDay); }
// hikâyenin ilk sayfası (teyzenin mektubu) oyunun başında açılır. Akşam açılışında sayfa verilmez:
// özet panelinin yerine geçip "ertesi sabah" düğmesini kaybettirirdi (sayfalar zaten gün kapanırken kontrol edilir).
// v3: oyun defter açık başlamaz; teyzenin mektubu Defter'de bekler
if (!PREVIEW && S.phase === 'morning' && checkStory(S)) {
  checkUnlocks(S); if (FEATURES.akdeniz) checkCountries(S); saveGame(S);
  setTimeout(() => ui.toast(T`💌 Teyzenden bir mektup var: sağ üstteki 📜 Defter'de.`), 900);
}
if (loadProblem) setTimeout(() => ui.toast(loadProblem === 'yeni'
  ? T`Bu kayıt oyunun daha yeni bir sürümünden; yeni oyun başladı. Eski kaydın yedeği Ayarlar'da saklı.`
  : T`Kayıt okunamadı; yeni oyun başladı. Eski kaydın yedeği Ayarlar'da saklı.`), 1500);

// tarayıcı sese ancak ilk dokunuştan sonra izin verir
// iOS Safari sesi yalnızca gerçek bir dokunuş sonunda açar: pointerdown yetmezse touchend/click de dener
for (const ev of ['pointerdown', 'touchend', 'click']) document.addEventListener(ev, unlock, { capture: true });
// iOS uygulamayı arka plana atınca ya da sayfa kapanırken kaydet (dükkân açıkken saveGame yazmaz: gün o sabaha döner)
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(S); });
addEventListener('pagehide', () => saveGame(S));
document.addEventListener('click', e => { if (e.target.closest('.btn, .tab, .ptab, .swatch, [data-town]')) sfx('tap'); }, { capture: true });

// yazı boyutu ayarı: bütün arayüz em ile ölçeklenir
function applyScale() { document.getElementById('frame').style.setProperty('--ts', settings.textScale || 1); }
applyScale();

ui.hud(S, speed);
let last = performance.now(), lastFocus = null, idle = 0;
const panelEl = document.getElementById('panel');
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  // gün içi olay: saati geldiyse kart açılır (panel açıkken zaman durur)
  if (S.phase === 'open' && !ui.isOpen()) {
    const h = dueHappening(S);
    if (h) {
      sfx('hap');
      ui.hapPanel(HAP[h], idx => {
        const r = chooseHappening(S, h, idx);
        scene.setStock(S);
        sfx(r.tags.some(t => t.startsWith('+₺') || t.startsWith('✨') || t.startsWith('💛')) ? 'heart' : 'tap');
        if (r.friend?.gift || r.friend?.coins || r.friend?.keepsake) r.after = () => ui.giftPanel(r.friend);
        return r;
      });
    }
  }
  // panel açıkken (öneri seçerken) zaman durur
  if (S.phase === 'open' && !ui.isOpen()) {
    for (const c of advanceClock(S, dt * MIN_PER_SEC * speed)) crowd.add(c);
    crowd.update(dt, speed, BAL.patience * effects(S).patience);
    const dayT = (S.clock - BAL.dayStart) / (BAL.dayEnd - BAL.dayStart);
    scene.setDaylight(dayT);
    crowd.setContext({ dark: dayT > 0.74 });
    setAmbience({ crowd: crowd.busy, night: dayT > 0.85 });
    setMood({ night: dayT > 0.82 });
    if (closingTime(S) && crowd.busy === 0) {
      const D = closeShop(S);
      scene.setOpen(false);
      saveGame(S);
      sfx(D.page ? 'heart' : 'bell');
      if (D.page || (D.stamps || []).length || D.quest?.done) ui.confetti();
      ui.summaryPanel(S, D);
    }
  }
  ambient?.update(dt, { season: seasonOf(S.day), weather: weatherOf(S.day) });
  // raflar açıkken kamera karavana yaklaşır
  const fc = ui.stageOn() ? 'shelf' : ui.isOpen() && panelEl.classList.contains('shelf2') ? 'cart' : null;
  if (fc !== lastFocus) { scene.focus(fc); if (PREVIEW) scene.snap(); lastFocus = fc; }
  // panel sahneyi örterken (raf katmanı hariç) sahne saniyede 15 kez çizilir, tam ekran haritanın arkasında hiç çizilmez
  idle += dt;
  const covered = ui.isOpen() && !ui.stageOn() && fc !== 'cart';
  if (!covered || (idle >= 1 / 15 && !panelEl.classList.contains('mapfull'))) { scene.tick?.(Math.min(idle, 0.1)); idle = 0; }
  // raf katmanı kameranın bu karedeki yerine oturur
  ui.stageTick();
  ui.hud(S, speed);
  const st = tutorialStep(S);
  ui.coach(st && st.on === S.phase && !(ui.isOpen() && st.on !== 'evening') ? st : null);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// geliştirme sırasında konsoldan bakmak için
window.__sahaf = S;
if (import.meta.env.DEV) Object.assign(window, { __scene: scene, __crowd: crowd });
