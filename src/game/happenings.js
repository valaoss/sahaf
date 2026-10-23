// Gün içi olaylar: dükkân açılırken günün olayları (0–2) planlanır; saat gelince kart açılır, seçime göre etki uygulanır.
import { BAL } from '../data/balance.js';
import { BOOK, BOOKS } from '../data/books.js';
import { REGULARS } from '../data/regulars.js';
import { HAPPENINGS } from '../data/happenings.js';
import { rnd, rndPick, weighted } from '../core/rng.js';
import { shelfCount, shelfCap, takeBook, seasonOf } from './state.js';
import { spotOf, plainCopies, addHeart } from './shop.js';
import { dayMods, weatherOf } from './calendar.js';
import { pickFresh, remember } from './memory.js';

export const HAP = Object.fromEntries(HAPPENINGS.map(h => [h.id, h]));

export function eligible(S, h) {
  const w = h.when || {};
  if ((h.once || w.once) && S.hapDone.includes(h.id)) return false;
  const last = S.hapLast[h.id];
  if (last && S.day - last < (h.cooldown || 6)) return false;
  if (w.scene && spotOf(S).scene !== w.scene) return false;
  if (w.season && seasonOf(S.day) !== w.season) return false;
  if (w.weather && weatherOf(S.day) !== w.weather) return false;
  if (w.minDay && S.day < w.minDay) return false;
  if (w.event && !dayMods(S.day, S.town).event) return false;
  if (w.shelf && shelfCount(S) < w.shelf) return false;
  if (w.friends && !w.friends.every(id => (S.friends[id] || 0) >= 3)) return false;
  return true;
}

// Dükkân açılırken: bugün hangi olaylar, saat kaçta
export function scheduleHappenings(S) {
  const len = BAL.dayEnd - BAL.dayStart;
  const n = rnd(S) < BAL.hapChance ? (rnd(S) < 0.25 ? 2 : 1) : 0;
  let pool = HAPPENINGS.filter(h => eligible(S, h));
  S.haps = [];
  for (let i = 0; i < n && pool.length; i++) {
    const h = pickFresh(S, 'hap', pool, x => x.id);
    pool = pool.filter(x => x !== h);
    remember(S, 'hap', h.id);
    S.haps.push({ id: h.id, t: Math.round(BAL.dayStart + 80 + rnd(S) * (len - 200)) });
  }
  S.haps.sort((a, b) => a.t - b.t);
}

// Saati gelmiş bir olay varsa onu sıradan çıkarıp döndürür
export function dueHappening(S) {
  if (S.phase !== 'open' || !S.haps.length || S.haps[0].t > S.clock) return null;
  return S.haps.shift().id;
}

// --- etkiler ---
function addArrivals(S, n) {
  const from = Math.min(S.clock + 5, BAL.dayEnd - 30);
  for (let i = 0; i < n; i++) S.arrivals.push(Math.round(from + rnd(S) * (BAL.dayEnd - 20 - from)));
  S.arrivals.sort((a, b) => a - b);
}

function loseBooks(S, n) {
  const lost = [];
  for (let i = 0; i < n; i++) {
    const w = {};
    for (const id in S.shelf) if (plainCopies(S, id) > 0) w[id] = plainCopies(S, id);
    if (!Object.keys(w).length) break;
    const id = weighted(S, w);
    takeBook(S, id);
    lost.push(id);
  }
  return lost;
}

function gainBooks(S, n, tag = null) {
  const got = [];
  for (let i = 0; i < n && shelfCount(S) < shelfCap(S); i++) {
    const b = rndPick(S, tag ? BOOKS.filter(x => x.tags.includes(tag)) : BOOKS);
    S.shelf[b.id] = (S.shelf[b.id] || 0) + 1;
    got.push(b.id);
  }
  return got;
}

// İlk baskı: yer varsa yeni kitap, yoksa raftaki normal bir kopya ilk baskıya döner
function gainRare(S) {
  let id;
  if (shelfCount(S) < shelfCap(S)) { id = rndPick(S, BOOKS).id; S.shelf[id] = (S.shelf[id] || 0) + 1; }
  else {
    const plain = Object.keys(S.shelf).filter(x => plainCopies(S, x) > 0);
    if (!plain.length) return null;
    id = rndPick(S, plain.sort());
  }
  S.rare[id] = (S.rare[id] || 0) + 1;
  return id;
}

function heartForSomeone(S) {
  const here = S.met.filter(id => REGULARS[id].town === S.town);
  const pool = (here.length ? here : S.met).filter(id => (S.friends[id] || 0) < 5).sort();
  if (!pool.length) return null;
  const id = rndPick(S, pool);
  return addHeart(S, id);
}

// Seçimi uygular; sonuç metni ve oyuncuya gösterilecek kısa etiketler döner
export function chooseHappening(S, id, idx) {
  const h = HAP[id], ch = h.choices[idx] || h.choices[0];
  let fx = ch.fx || {}, text = ch.result;
  if (fx.chance !== undefined) {
    const ok = rnd(S) < fx.chance;
    if (!ok) { fx = fx.fail || {}; text = ch.failResult || text; }
  }
  const out = { text, tags: [], friend: null, rare: null };
  if (fx.coins) { S.coins = Math.max(0, S.coins + fx.coins); out.tags.push((fx.coins > 0 ? '+' : '') + '₺' + fx.coins); if (S.today) S.today.hapCoins = (S.today.hapCoins || 0) + fx.coins; }
  if (fx.crowd > 0) { addArrivals(S, fx.crowd); out.tags.push(`👣 +${fx.crowd}`); }
  if (fx.crowd < 0) { S.arrivals.splice(0, -fx.crowd); out.tags.push(`👣 ${fx.crowd}`); }
  if (fx.lose) { const l = loseBooks(S, fx.lose); if (l.length) out.tags.push(`📚 −${l.length}`); }
  if (fx.gain) { const g = gainBooks(S, fx.gain); if (g.length) out.tags.push(`📚 +${g.length}`); }
  if (fx.gainTag) { const g = gainBooks(S, 1, fx.gainTag); if (g.length) out.tags.push(`📚 ${BOOK[g[0]].title}`); }
  if (fx.rare) { const r = gainRare(S); if (r) { out.rare = r; out.tags.push(`✨ ${BOOK[r].title}`); } }
  if (fx.friends) for (const fid of fx.friends) { const fr = addHeart(S, fid); if (fr) { out.friend = out.friend?.gift || out.friend?.coins ? out.friend : fr; out.tags.push(`💛 ${REGULARS[fid].name}`); } }
  if (fx.heart) { const f = heartForSomeone(S); if (f) { out.friend = f; out.tags.push(`💛 ${REGULARS[f.id].name}`); } }
  if (fx.buff) { S.buffs.push({ day: S.day + 1, traffic: fx.buff }); out.tags.push('📣 yarın kalabalık'); }
  if (!S.hapDone.includes(id)) S.hapDone.push(id);
  S.hapLast[id] = S.day;
  if (S.today) (S.today.haps = S.today.haps || []).push(id);
  return out;
}

// Bugün geçerli kalabalık çarpanı (dünkü olaylardan) ve eski kayıtların temizliği
export function buffFor(S) {
  S.buffs = S.buffs.filter(b => b.day >= S.day);
  // town yazılı etkiler yalnız o kasabada geçerli (fiyat ünü)
  return S.buffs.filter(b => b.day === S.day && (!b.town || b.town === S.town)).reduce((m, b) => m * b.traffic, 1);
}
