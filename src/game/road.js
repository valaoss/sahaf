// Yolculuk karşılaşmaları: kasaba değiştirince arada bir yolda küçük bir an (data/road.js).
// Tekrar bekçisinden geçer; sonucu gün içi olaylarla aynı biçimde döner ({ text, tags, friend }).
import { ROAD } from '../data/road.js';
import { BAL } from '../data/balance.js';
import { homeOf } from './koy.js';
import { BOOK, BOOKS } from '../data/books.js';
import { rnd, rndPick } from '../core/rng.js';
import { pickFresh, remember } from './memory.js';
import { crateAdd } from './shelving.js';
import { plainCopies, addHeart } from './shop.js';
import { takeBook } from './state.js';
import { T, tw } from '../i18n/i18n.js';
import { REGULARS, REGULAR_KEYS, HEARTS_MAX } from '../data/regulars.js';

export const ROAD_CHANCE = 0.5;
export const ROAD_BY_ID = Object.fromEntries(ROAD.map(r => [r.id, r]));

// yola çıkınca: karşılaşma var mı, varsa hangisi
export function roadEvent(S) {
  if (rnd(S) >= ROAD_CHANCE) return null;
  const r = pickFresh(S, 'road', ROAD, x => x.id);
  remember(S, 'road', r.id);
  return r.id;
}

export function chooseRoad(S, id, idx) {
  const ch = ROAD_BY_ID[id].choices[idx] || ROAD_BY_ID[id].choices[0], fx = ch.fx || {};
  const out = { text: ch.result, tags: [], friend: null };
  if (fx.cost) {
    if (S.coins < fx.cost) return { text: tw('Cebinde o kadar para yok; teşekkür edip yoluna devam ettin.'), tags: [], friend: null };
    S.coins -= fx.cost; S.totals.spent += fx.cost; out.tags.push('−₺' + fx.cost);
  }
  if (fx.coins) { S.coins = Math.max(0, S.coins + fx.coins); out.tags.push((fx.coins > 0 ? '+' : '') + '₺' + fx.coins); }
  if (fx.crate) {
    for (let i = 0; i < fx.crate.n; i++) crateAdd(S, rndPick(S, BOOKS).id, !!fx.crate.rare, fx.crate.cond || 'iyi');
    out.tags.push(`📦 +${fx.crate.n}${fx.crate.rare ? ' ✨' : ''}`);
  }
  if (fx.swap) {
    let n = 0;
    for (let i = 0; i < fx.swap; i++) {
      const ids = Object.keys(S.shelf).filter(x => plainCopies(S, x) > 0);
      if (!ids.length) break;
      takeBook(S, rndPick(S, ids));
      crateAdd(S, rndPick(S, BOOKS).id, rnd(S) < 0.25, rnd(S) < 0.5 ? 'yipranmis' : 'iyi');
      n++;
    }
    if (n) out.tags.push(T`🔄 ${n} kitap`);
  }
  if (fx.late) { S.buffs.push({ day: S.day, traffic: fx.late }); out.tags.push(tw('⏰ geç açılış')); }
  if (fx.heart) {
    const cand = REGULAR_KEYS.filter(r => homeOf(r) === S.town && (S.friends[r] || 0) < HEARTS_MAX);
    if (cand.length) { const fr = addHeart(S, rndPick(S, cand)); if (fr) { out.friend = fr; out.tags.push(`💛 ${REGULARS[fr.id].name}`); } }
  }
  return out;
}
