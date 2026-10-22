// Ana hikâye ilerlemesi: sayfalar sırayla açılır. Gün kapanınca (ve oyun başında) kontrol edilir.
import { PAGES, FINALE_REWARD } from '../data/story.js';

const CHECK = {
  start: () => true,
  towns: (S, n) => S.visited.length >= n,
  perfect: (S, n) => S.totals.perfect >= n,
  hearts: (S, n) => Object.values(S.friends).some(h => h >= n),
  festival: (S, n) => S.totals.festivals >= n,
  sold: (S, n) => S.totals.sold >= n,
  shelfLv: (S, n) => S.shelfLv >= n,
  finale: (S, n, T) => !!T && T.town === 'cunda' && T.spot === 'tepe',
};

export const nextPage = S => PAGES[S.pages.length] || null;

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
