// Oyunun yapıştırıcısı: durum + sahne + kalabalık + arayüz. Sabah ve akşam kaydeder.
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './style.css';
import { BAL } from './data/balance.js';
import { TOWNS } from './data/towns.js';
import { GENRES } from './data/genres.js';
import { BOOK } from './data/books.js';
import { DECOR, PAINTS, UPGRADES } from './data/decor.js';
import { newGame, shelfCount, shelfCap, seasonOf } from './game/state.js';
import { buyBox, travel, resolveCustomer, recommend, rescue, chooseSpot, spotOf, makeRegular, makeCustomer, toggleFeature } from './game/shop.js';
import { REGULARS, HEARTS_MAX } from './data/regulars.js';
import { effects, equipDecor, upgradeShelf, choosePaint, buyUpgrade } from './game/decor.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning } from './game/day.js';
import { loadGame, saveGame as persistGame, clearGame } from './core/save.js';
import { unlock, sfx, settings, applySettings, setSeason, setRain, setMood } from './audio/audio.js';
import { SPOTS } from './data/spots.js';
import { weatherOf, dayMods } from './game/calendar.js';
import { checkStory } from './game/story.js';
import { replyFor } from './game/replies.js';
import { tutorialStep, tutorialEvent } from './game/tutorial.js';
import { HAP, dueHappening, chooseHappening } from './game/happenings.js';
import { morningLetter, writeLetter, offerQuest } from './game/mail.js';
import { checkStamps } from './game/stamps.js';
import { STAMPS } from './data/stamps.js';
import { PAGES } from './data/story.js';
import { tap } from './core/native.js';
import { buildScene } from './render/scene.js';
import { createCrowd, personSVG, figureMeta } from './render/people.js';
import { ARCHETYPES } from './data/archetypes.js';
import { createAmbient } from './render/ambient.js';
import { createUI } from './ui/ui.js';

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
const scene = buildScene(document.getElementById('scene'));
let speed = 1;

const crowd = createCrowd(scene.people, scene.fx, {
  browse(c) {
    const r = resolveCustomer(S, c);
    if (r.bought.length) { scene.setStock(S); tap(); sfx('coin'); }
    return r;
  },
  // öneri isteyene dokunuldu: panel açılır, saat durur
  ask(c) {
    sfx('page');
    ui.recPanel(S, c, id => {
      const r = recommend(S, c, id);
      tutorialEvent(S, 'rec');
      if (r.bought.length) { scene.setStock(S); tap(r.grade === 'perfect' ? 'MEDIUM' : 'LIGHT'); }
      crowd.answer(c, r);
      sfx(r.grade === 'perfect' || r.friend ? 'heart' : r.grade === 'good' ? 'coin' : 'sad');
      if (r.friend?.gift || r.friend?.coins) { saveGame(S); ui.confetti(); ui.giftPanel(r.friend); }
      // müşterinin karşılığı: konuşma kartı (kalp ya da bahşiş bilgisiyle)
      const line = c.reg && r.grade === 'perfect' ? REGULARS[c.reg].thanks : replyFor(S, c, r, id);
      const note = r.friend && !r.friend.gift && !r.friend.coins ? `💛 ${r.friend.hearts}/${HEARTS_MAX}` : r.grade === 'perfect' ? `Bahşiş ₺${r.tip}` : r.grade === 'good' ? `Bahşiş ₺${r.tip}` : '';
      if (!(r.friend?.gift || r.friend?.coins)) ui.speech(c, line, r.grade, note);
    }, settings.hints !== false);
  },
  timeout: c => recommend(S, c, null),
  paid: x => ui.flyCoin(x / 1600, 0.6),
});
const ambient = createAmbient(scene.ambientBack, scene.ambientFront);
// karavana dokununca içi açılır
scene.svg.querySelector('#cartHit').addEventListener('click', () => { if (!ui.isOpen()) { sfx('page'); ui.interiorPanel(S); } });

// sabah alışverişinden sonra pul kontrolü
function stampCheck() {
  const won = checkStamps(S);
  if (!won.length) return;
  saveGame(S);
  sfx('heart');
  const st = STAMPS.find(x => x.id === won[0]);
  ui.confetti();
  setTimeout(() => ui.toast(`🏅 Yeni pul: ${st.icon} ${st.name}`), 600);
}

const act = (a, arg) => {
  if (a === 'stock') ui.stockPanel(S);
  else if (a === 'inside') ui.interiorPanel(S);
  else if (a === 'feature') {
    const why = toggleFeature(S, arg);
    if (why) ui.toast(why); else { tap(); sfx('tap'); saveGame(S); }
    ui.interiorPanel(S);
  }
  else if (a === 'decor' && tutorialEvent(S, 'decor')) { saveGame(S); ui.decorPanel(S); }
  else if (a === 'paper') { sfx('page'); ui.paperPanel(S); }
  else if (a === 'book') { sfx('page'); if (tutorialEvent(S, 'book')) saveGame(S); ui.bookPanel(S); }
  else if (a === 'settings') ui.settingsPanel(settings, S);
  else if (a === 'scale') { settings.textScale = arg; applySettings(); applyScale(); ui.settingsPanel(settings, S); }
  else if (a === 'tutskip') { tutorialEvent(S, 'skip'); saveGame(S); }
  else if (a === 'theme') { settings.theme = arg; applySettings(); ui.settingsPanel(settings, S); }
  else if (a === 'upgrade') {
    const why = buyUpgrade(S, arg);
    if (why) ui.toast(why);
    else { tap('MEDIUM'); sfx('box'); scene.setUpgrades(S.upgrades);
scene.setPaintFx(settings.paint !== false); saveGame(S); ui.toast(`${UPGRADES[arg].icon} ${UPGRADES[arg].name} karavana eklendi`); stampCheck(); }
    ui.decorPanel(S);
  }
  else if (a === 'toggle') { settings[arg] = !settings[arg]; applySettings(); scene.setPaintFx(settings.paint !== false); ui.settingsPanel(settings, S); }
  else if (a === 'reset') { clearGame(); location.reload(); }
  else if (a === 'spot') {
    if (!arg) { if (tutorialEvent(S, 'spot')) saveGame(S); return ui.spotPanel(S); }
    const why = chooseSpot(S, arg);
    if (why) return ui.toast(why);
    saveGame(S);
    changeTown(() => { ui.closePanel(); ui.toast(`📍 Karavan kuruldu: ${spotOf(S).name}`); });
  }
  else if (a === 'decor') ui.decorPanel(S);
  else if (a === 'map') ui.mapPanel(S);
  else if (a === 'buy') {
    const why = buyBox(S, arg);
    if (why) ui.toast(why);
    else {
      tap(); sfx('box'); tutorialEvent(S, 'buy'); scene.setStock(S); saveGame(S);
      const rare = S.lastBox.rare;
      if (S.lastBox.kostas) { sfx('letter'); ui.confetti(); ui.kostasFoundPanel(S.lastBox.kostas); return; }
      if (rare.length) { sfx('heart'); ui.toast(`✨ Kolide bir ilk baskı çıktı: ${BOOK[rare[0]].title}! Koleksiyoncuya sakla.`); }
      else ui.toast(`${GENRES[arg].icon} ${BAL.boxSize} kitap raflara dizildi`);
    }
    ui.stockPanel(S);
  } else if (a === 'decor-on') {
    const why = equipDecor(S, arg);
    if (why) ui.toast(why);
    else { tap(); scene.setDecor(S.decor.on);
scene.setUpgrades(S.upgrades); saveGame(S); ui.toast(`${DECOR[arg].icon} ${DECOR[arg].name} yerine kondu`); stampCheck(); }
    ui.decorPanel(S);
  } else if (a === 'shelf') {
    const why = upgradeShelf(S);
    if (why) ui.toast(why);
    else { tap('MEDIUM'); sfx('box'); scene.setStock(S); saveGame(S); ui.toast(`Raflar büyüdü: ${shelfCap(S)} kitap`); stampCheck(); }
    ui.decorPanel(S);
  } else if (a === 'paint') {
    const why = choosePaint(S, arg);
    if (why) ui.toast(why);
    else { tap(); scene.setPaint(S.paint); saveGame(S); stampCheck(); }
    ui.decorPanel(S);
  } else if (a === 'travel') {
    const why = travel(S, arg);
    if (why) return ui.toast(why);
    saveGame(S);
    sfx('whoosh');
    changeTown(() => { ui.closePanel(); ui.toast(`Hoş geldin: ${TOWNS[S.town].name}!`); });
  } else if (a === 'open') {
    const why = openShop(S);
    if (why) return ui.toast(why);
    tap('MEDIUM');
    sfx('bell');
    tutorialEvent(S, 'open');
    if (!shelfCount(S)) ui.toast('Raflar boş! Müşteriler eli boş dönecek.');
    else if (S.day === 1) ui.toast('❓ balonlu müşteriye dokun: senden kitap önerisi istiyor.');
  } else if (a === 'speed') speed = speed > 1 ? 1 : FAST;
  else if (a === 'next') {
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
    if (gift) ui.toast(`Belediyeden ₺${gift} destek: kasa boştu, bir koli alabilirsin.`);
    speed = 1;
    scene.setDaylight(0);
    refreshDay();
    saveGame(S);
    if (S.post?.letter) sfx('letter');
    ui.paperPanel(S);
  }
};
const ui = createUI(document.getElementById('ui'), act);

function refreshDay() {
  const m = dayMods(S.day, S.town);
  scene.setSeason(seasonOf(S.day));
  scene.setWeather(weatherOf(S.day));
  setSeason(seasonOf(S.day));
  setRain(weatherOf(S.day) === 'yagmurlu');
  setMood({ town: S.town, lively: !!(m.event || m.special), night: false });
  scene.setFestival(!!(m.event || m.special));
}

function changeTown(done) {
  const fade = document.getElementById('fade');
  fade.classList.add('on');
  setTimeout(() => {
    scene.setTown(S.town);
    scene.setSpot(spotOf(S).scene, S.town);
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
  if (panel === 'konus') { const c = makeCustomer(S); c.arch = 'balikci'; c.style = ARCHETYPES.balikci.style; c.ask = { tags: ['deniz'] }; ui.speech(c, replyFor(S, c, { grade: 'perfect' }, 'yasliadam'), 'perfect', 'Bahşiş ₺5'); }
  if (panel === 'ic') { S.coins = 999; ['roman','siir','fantastik'].forEach(g => buyBox(S, g)); S.featured = Object.keys(S.shelf).slice(2, 4); S.rare[Object.keys(S.shelf)[6]] = 1; ui.interiorPanel(S); }
  // ?insanlar: farklı tiplerden on kişilik dizi (yürüyen, okuyan, sevinen)
  if (q.has('insanlar')) {
    const kinds = ['ogrenci', 'emekli', 'balikci', 'turist', 'anne', 'cocuk', 'sevgili', 'yazar', 'teyze', 'sorfcu'];
    const seed = +q.get('insanlar') || 1;
    kinds.forEach((k, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const st = ['walking', 'reading', '', 'cheer'][i % 4];
      g.setAttribute('class', 'age-' + figureMeta(i * 7919 + seed, ARCHETYPES[k].style).age + (st ? ' ' + st : ''));
      g.setAttribute('transform', `translate(${110 + i * 152} 0)`);
      g.innerHTML = personSVG(i * 7919 + seed, ARCHETYPES[k].style);
      scene.people.appendChild(g);
    });
  }
  if (panel === 'istatistik') {
    Object.assign(S.soldBooks, { kurk: 9, hobbit: 7, garip: 6, defne: 5, nutuk: 4, yasliadam: 3 });
    Object.assign(S.totals, { days: 12, sold: 34, revenue: 412, perfect: 18, bestDay: 61, bestDayNo: 9, rareSold: 2 });
    S.townDays = { ayvalik: 7, foca: 5 };
    ui.statsPanel(S);
  }
  if (q.has('gelistir')) { S.upgrades = ['cay', 'plak']; scene.setUpgrades(S.upgrades); }
  if (panel === 'harita') ui.mapPanel(S);
  if (panel === 'kostas') { S.pages = PAGES.map(p => p.id); S.unlocked.push('bozcaada'); S.kostasFound = ['yasliadam', 'odysseia', 'korfez']; ui.kostasPanel(S); }
  if (q.has('aksam')) setTimeout(() => scene.setDaylight(+q.get('aksam') || 0.95), 100);
  if (panel === 'olay') ui.hapPanel(HAP[q.get('olay') || 'eskici'], i => chooseHappening(S, q.get('olay') || 'eskici', i));
  if (panel === 'posta') {
    S.recHistory.push({ day: 1, town: 'ayvalik', spot: 'iskele', book: 'yasliadam', arch: 'balikci', look: 3 });
    S.day = 9;
    S.post = { letter: morningLetter(Object.assign(S, { day: 9 })) || writeLetter(S, S.recHistory[0]), quest: offerQuest(S) || offerQuest(S) || offerQuest(S) };
    ui.paperPanel(S);
  }
  if (q.has('nadir')) { const ids = Object.keys(S.shelf); S.rare = { [ids[0]]: 1, [ids[7]]: 1 }; scene.setStock(S); }
  if (panel === 'koleksiyoncu') { let c; do c = makeCustomer(S); while (!(c.ask && c.ask.rare)); ui.recPanel(S, c, () => {}); }
  if (panel === 'album') { S.stamps = ['ilkgun', 'isabet', 'elli', 'ege', 'festival', 'yagmur', 'dost']; S.totals.sold = 120; ui.albumPanel(S); }
  if (panel === 'finale') { Object.assign(S.totals, { days: 34, sold: 512, perfect: 61 }); S.friends = { hasan: 5, ela: 4 }; S.stamps = STAMPS.slice(0, 14).map(s => s.id); ui.finalePanel(S, () => {}); }
  if (panel === 'book') { S.pages = ['miras', 'dostlar', 'liste']; S.visited = ['ayvalik', 'cunda']; ui.bookPanel(S); }
  if (panel === 'decor') ui.decorPanel(S);
  if (panel === 'rec') ui.recPanel(S, makeRegular(S, q.get('kim') || 'hasan'), () => {});
  if (panel === 'gift') ui.giftPanel({ id: 'hasan', hearts: 5, gift: 'zeytin' });
}
document.fonts.ready.then(() => setTimeout(() => document.getElementById('fade').classList.remove('boot'), 50));
if (S.phase === 'evening' && S.lastDay) { scene.setDaylight(1); ui.summaryPanel(S, S.lastDay); }
// hikâyenin ilk sayfası (teyzenin mektubu) oyunun başında açılır
if (!PREVIEW && checkStory(S)) { saveGame(S); ui.bookPanel(S); }
if (S.totals.days === 0 && S.phase === 'morning') {
  setTimeout(() => ui.toast('Sabah toptancıdan koli al, istersen haritadan kasaba seç, sonra dükkânı aç.'), 700);
}

// tarayıcı sese ancak ilk dokunuştan sonra izin verir
document.addEventListener('pointerdown', unlock, { capture: true });
document.addEventListener('click', e => { if (e.target.closest('.btn, .tab, .ptab, .swatch, [data-town]')) sfx('tap'); }, { capture: true });

// yazı boyutu ayarı: bütün arayüz em ile ölçeklenir
function applyScale() { document.getElementById('frame').style.setProperty('--ts', settings.textScale || 1); }
applyScale();

ui.hud(S, speed);
let last = performance.now();
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
        if (r.friend?.gift || r.friend?.coins) r.after = () => ui.giftPanel(r.friend);
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
    setMood({ night: dayT > 0.82 });
    if (closingTime(S) && crowd.busy === 0) {
      const T = closeShop(S);
      saveGame(S);
      sfx(T.page ? 'heart' : 'bell');
      if (T.page || (T.stamps || []).length || T.quest?.done) ui.confetti();
      ui.summaryPanel(S, T);
    }
  }
  ambient.update(dt, { season: seasonOf(S.day), weather: weatherOf(S.day) });
  ui.hud(S, speed);
  const st = tutorialStep(S);
  ui.coach(st && st.on === S.phase && !(ui.isOpen() && st.on !== 'evening') ? st : null);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// geliştirme sırasında konsoldan bakmak için
window.__sahaf = S;
