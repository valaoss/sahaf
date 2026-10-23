// Pul albümü: koşulları tutan pulları verir. Gün kapanınca ve sabah alışverişlerinden sonra kontrol edilir.
import { STAMPS, STAMP_REWARD } from '../data/stamps.js';
import { repLevel } from './bonds.js';
import { voyagePages } from './voyage.js';
import { VOYAGE, VOYAGE_KEYS } from '../data/voyage.js';
import { PAGES } from '../data/story.js';

const VALUE = {
  days: S => S.totals.days,
  sold: S => S.totals.sold,
  perfect: S => S.totals.perfect,
  towns: S => S.visited.length,
  spots: S => S.spotsSeen.length,
  donated: S => (S.donated || []).length,
  voyage: S => VOYAGE_KEYS.filter(c => voyagePages(S, c) >= VOYAGE[c].pages.length).length,
  grand: S => S.grandDone ? 1 : 0,
  repTop: S => Object.keys(S.rep || {}).filter(t => repLevel(S, t) >= 3).length,
  festivals: S => S.totals.festivals,
  festKinds: S => S.festKinds.length,
  rain: S => S.weathersSeen.includes('yagmurlu') ? 1 : 0,
  hearts: S => Math.max(0, ...Object.values(S.friends)),
  gifts: S => S.gifts.length,
  decor: S => S.decor.owned.length,
  shelfLv: S => S.shelfLv,
  paints: S => S.paints.length,
  coins: S => S.coins,
  rareSold: S => S.totals.rareSold,
  letters: S => S.lettersTotal || S.letters.length,
  quests: S => S.questsDone,
  haps: S => S.hapDone.length,
  kostas: S => S.kostasFound.length,
  unlocked: S => S.unlocked.length,
  story: S => S.pages.length >= PAGES.length ? 1 : 0,
};

export function stampProgress(S, st) {
  const [kind, n] = Object.entries(st.need)[0];
  return { now: Math.min(VALUE[kind](S), n), of: n };
}

// Yeni kazanılan pulları ekler, ödülü verir, kimliklerini döndürür
export function checkStamps(S) {
  const won = [];
  for (const st of STAMPS) {
    if (S.stamps.includes(st.id)) continue;
    const p = stampProgress(S, st);
    if (p.now >= p.of) { S.stamps.push(st.id); S.coins += STAMP_REWARD; won.push(st.id); }
  }
  return won;
}
