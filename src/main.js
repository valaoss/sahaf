// Oyunun yapıştırıcısı: durum + sahne + kalabalık + arayüz. Sabah ve akşam kaydeder.
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './style.css';
import { BAL } from './data/balance.js';
import { TOWNS } from './data/towns.js';
import { GENRES } from './data/genres.js';
import { DECOR, PAINTS } from './data/decor.js';
import { newGame, shelfCount, shelfCap } from './game/state.js';
import { buyBox, travel, resolveCustomer, recommend, rescue, chooseSpot, spotOf, makeRegular } from './game/shop.js';
import { REGULARS, HEARTS_MAX } from './data/regulars.js';
import { effects, equipDecor, upgradeShelf, choosePaint } from './game/decor.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning } from './game/day.js';
import { loadGame, saveGame as persistGame } from './core/save.js';
import { SPOTS } from './data/spots.js';
import { tap } from './core/native.js';
import { buildScene } from './render/scene.js';
import { createCrowd } from './render/people.js';
import { createUI } from './ui/ui.js';

const MIN_PER_SEC = (BAL.dayEnd - BAL.dayStart) / 120;   // normal hızda bir gün ≈ 2 dakika
const FAST = 3;

const S = loadGame() || newGame();
// geliştirme: ?sahne=foca/kale ile kayda dokunmadan bir mekânı aç (ekran görüntüleri için)
const PREVIEW = import.meta.env.DEV && new URLSearchParams(location.search).get('sahne');
if (PREVIEW) {
  const [town, spot] = PREVIEW.split('/');
  if (SPOTS[town]?.[spot]) Object.assign(S, { town, spot, phase: 'morning' });
}
const saveGame = PREVIEW ? () => {} : persistGame;
const scene = buildScene(document.getElementById('scene'));
let speed = 1;

const crowd = createCrowd(scene.people, scene.fx, {
  browse(c) {
    const r = resolveCustomer(S, c);
    if (r.bought.length) { scene.setStock(S); tap(); }
    return r;
  },
  // öneri isteyene dokunuldu: panel açılır, saat durur
  ask(c) {
    ui.recPanel(S, c, id => {
      const r = recommend(S, c, id);
      if (r.bought.length) { scene.setStock(S); tap(r.grade === 'perfect' ? 'MEDIUM' : 'LIGHT'); }
      crowd.answer(c, r);
      if (r.friend?.gift || r.friend?.coins) { saveGame(S); ui.giftPanel(r.friend); }
      else if (r.friend) ui.toast(`💛 ${REGULARS[c.reg].name} ile aranız ısınıyor (${r.friend.hearts}/${HEARTS_MAX})`);
      else if (r.grade === 'perfect') ui.toast(`Tam isabet! Bahşiş ₺${r.tip}`);
      else if (r.grade === 'good') ui.toast('Fena değil, ama tam aradığı bu değildi.');
      else ui.toast(id ? 'Bu kitap ona hiç uymadı…' : 'Bir dahaki sefere belki.');
    });
  },
  timeout: c => recommend(S, c, null),
});

const ui = createUI(document.getElementById('ui'), (a, arg) => {
  if (a === 'stock') ui.stockPanel(S);
  else if (a === 'spot') {
    if (!arg) return ui.spotPanel(S);
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
    else { tap(); scene.setStock(S); saveGame(S); ui.toast(`${GENRES[arg].icon} ${BAL.boxSize} kitap raflara dizildi`); }
    ui.stockPanel(S);
  } else if (a === 'decor-on') {
    const why = equipDecor(S, arg);
    if (why) ui.toast(why);
    else { tap(); scene.setDecor(S.decor.on); saveGame(S); ui.toast(`${DECOR[arg].icon} ${DECOR[arg].name} yerine kondu`); }
    ui.decorPanel(S);
  } else if (a === 'shelf') {
    const why = upgradeShelf(S);
    if (why) ui.toast(why);
    else { tap('MEDIUM'); scene.setStock(S); saveGame(S); ui.toast(`Raflar büyüdü: ${shelfCap(S)} kitap`); }
    ui.decorPanel(S);
  } else if (a === 'paint') {
    const why = choosePaint(S, arg);
    if (why) ui.toast(why);
    else { tap(); scene.setPaint(S.paint); saveGame(S); }
    ui.decorPanel(S);
  } else if (a === 'travel') {
    const why = travel(S, arg);
    if (why) return ui.toast(why);
    saveGame(S);
    changeTown(() => { ui.closePanel(); ui.toast(`Hoş geldin: ${TOWNS[S.town].name}!`); });
  } else if (a === 'open') {
    const why = openShop(S);
    if (why) return ui.toast(why);
    tap('MEDIUM');
    if (!shelfCount(S)) ui.toast('Raflar boş! Müşteriler eli boş dönecek.');
    else if (S.day === 1) ui.toast('❓ balonlu müşteriye dokun: senden kitap önerisi istiyor.');
  } else if (a === 'speed') speed = speed > 1 ? 1 : FAST;
  else if (a === 'next') {
    nextMorning(S);
    const gift = rescue(S);
    if (gift) ui.toast(`Belediyeden ₺${gift} destek: kasa boştu, bir koli alabilirsin.`);
    speed = 1;
    scene.setDusk(0);
    saveGame(S);
  }
});

function changeTown(done) {
  const fade = document.getElementById('fade');
  fade.classList.add('on');
  setTimeout(() => {
    scene.setTown(S.town);
    scene.setSpot(spotOf(S).scene, S.town);
    done && done();
    fade.classList.remove('on');
  }, 500);
}

scene.setTown(S.town);
scene.setSpot(spotOf(S).scene, S.town);
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
  if (panel === 'decor') ui.decorPanel(S);
  if (panel === 'rec') ui.recPanel(S, makeRegular(S, q.get('kim') || 'hasan'), () => {});
  if (panel === 'gift') ui.giftPanel({ id: 'hasan', hearts: 5, gift: 'zeytin' });
}
document.fonts.ready.then(() => setTimeout(() => document.getElementById('fade').classList.remove('boot'), 50));
if (S.phase === 'evening' && S.lastDay) { scene.setDusk(1); ui.summaryPanel(S, S.lastDay); }
if (S.totals.days === 0 && S.phase === 'morning') {
  setTimeout(() => ui.toast('Sabah toptancıdan koli al, istersen haritadan kasaba seç, sonra dükkânı aç.'), 700);
}

ui.hud(S, speed);
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  // panel açıkken (öneri seçerken) zaman durur
  if (S.phase === 'open' && !ui.isOpen()) {
    for (const c of advanceClock(S, dt * MIN_PER_SEC * speed)) crowd.add(c);
    crowd.update(dt, speed, BAL.patience * effects(S).patience);
    scene.setDusk(Math.max(0, (S.clock - (BAL.dayEnd - 120)) / 120));
    if (closingTime(S) && crowd.busy === 0) {
      const T = closeShop(S);
      saveGame(S);
      ui.summaryPanel(S, T);
    }
  }
  ui.hud(S, speed);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// geliştirme sırasında konsoldan bakmak için
window.__sahaf = S;
