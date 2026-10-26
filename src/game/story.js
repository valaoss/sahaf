// Ana hikâye ilerlemesi: sayfalar sırayla açılır. Gün kapanınca (ve oyun başında) kontrol edilir.
import { PAGES, FINALE_REWARD } from '../data/story.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { BOOK } from '../data/books.js';
import { KOSTAS, KOSTAS_REWARD, KOSTAS_CHANCE } from '../data/kostas.js';
import { rnd, rndPick } from '../core/rng.js';
import { koyOn } from './koy.js';
import { BAL } from '../data/balance.js';

const CHECK = {
  start: () => true,
  towns: (S, n) => S.visited.length >= n,
  perfect: (S, n) => S.totals.perfect >= n,
  hearts: (S, n) => Object.values(S.friends).some(h => h >= n),
  festival: (S, n) => S.totals.festivals >= n,
  sold: (S, n) => S.totals.sold >= n,
  shelfLv: (S, n) => S.shelfLv >= n,
  finale: (S, n, T) => !!T && (koyOn() ? T.town === 'fener' : T.town === 'cunda' && T.spot === 'tepe'),
  // kitabı rafında taşıyarak o kasabada dükkân açmak (gün içinde satıldıysa da sayılır)
  carry: (S, n, T) => !!T && T.town === (koyOn() ? n.koy : n.town) && (S.shelf[n.book] > 0 || (T.soldIds || []).includes(n.book)),
};

export const nextPage = S => PAGES[S.pages.length] || null;
export const storyDone = S => S.pages.length >= PAGES.length;

// Hikâye ilerledikçe yeni kasabalar açılır; yeni açılanları döndürür
export function checkUnlocks(S) {
  const opened = [];
  for (const k of TOWN_KEYS) {
    const u = TOWNS[k].unlock;
    if (u && !S.unlocked.includes(k) && S.pages.length >= u.pages) { S.unlocked.push(k); opened.push(k); }
  }
  return opened;
}

// 2. bölüm: kütüphane bulunduysa, doğru kasabada doğru türden kolide Kostas'ın kitabı çıkabilir
export function kostasDrop(S, genre) {
  if (!storyDone(S)) return null;
  const cand = KOSTAS.filter(k => !S.kostasFound.includes(k.book) && k.town === S.town && BOOK[k.book].genre === genre);
  // koli doluysa bu sefer çıkmaz (sonraki kolilerde yine şansı var)
  if (!cand.length || (S.crate || []).length >= BAL.crateCap || rnd(S) >= KOSTAS_CHANCE) return null;
  const k = rndPick(S, cand);
  S.kostasFound.push(k.book);
  // kolinin içinden çıkar: diğer kitaplarla birlikte koliye
  (S.crate = S.crate || []).push({ id: k.book, rare: false });
  const done = S.kostasFound.length === KOSTAS.length;
  if (done) S.coins += KOSTAS_REWARD;
  return { book: k.book, note: k.note, done };
}

// Sıradaki sayfanın koşulu tuttuysa açar ve döndürür (günde en fazla bir sayfa)
export function checkStory(S, T = null) {
  const p = nextPage(S);
  if (!p) return null;
  const [kind, n] = Object.entries(p.need)[0];
  if (!CHECK[kind](S, n, T)) return null;
  S.pages.push(p.id);
  if (kind === 'finale') {
    if (!S.decor.owned.includes(FINALE_REWARD.decor)) S.decor.owned.push(FINALE_REWARD.decor);
    S.coins += FINALE_REWARD.coins;
  }
  return p.id;
}

// Defterde ilerleme göstergesi: "x / y" için mevcut değer
export function progressOf(S) {
  const p = nextPage(S);
  if (!p) return null;
  const [kind, n] = Object.entries(p.need)[0];
  const now = {
    towns: S.visited.length, perfect: S.totals.perfect, sold: S.totals.sold, festival: S.totals.festivals,
    hearts: Math.max(0, ...Object.values(S.friends)), shelfLv: S.shelfLv,
  }[kind];
  return now === undefined ? null : { now: Math.min(now, n), of: n };
}
