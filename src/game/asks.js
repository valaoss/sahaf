// Müşteri cümlesi kurar: [selam] [bağlam] [istek] [kapanış]. Aynı cümle yakın zamanda söylendiyse yeniden dener.
import { rnd, rndPick } from '../core/rng.js';
import { TAGS } from '../data/books.js';
import { BAL } from '../data/balance.js';
import { GREET, CLOSE, CONTEXT, REQ_ONE, REQ_TWO, RARE_REQ } from '../data/asks.js';
import { remember, seenRecently } from './memory.js';

const cap = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
const fill = (tpl, says) => tpl.replace('{A}', cap(says[0])).replace('{a}', says[0]).replace('{b}', says[1] || says[0]);

// ctx: { voice, arch, weather, season, scene, rare, bare } — bare: yalnızca istek cümlesi (müdavimler için)
export function buildAsk(S, tags, ctx = {}) {
  const voice = GREET[ctx.voice] ? ctx.voice : 'samimi';
  const pick = arr => rndPick(S, arr);
  let text = '';
  for (let tries = 0; tries < 6; tries++) {
    const parts = [];
    if (!ctx.bare && rnd(S) < 0.55) parts.push(pick(GREET[voice]));
    if (!ctx.bare && rnd(S) < 0.6) {
      const pool = [
        ...(CONTEXT.arch[ctx.arch] || []), ...(CONTEXT.arch[ctx.arch] || []),   // kendi hikâyesi iki kat olası
        ...(CONTEXT.weather[ctx.weather] || []), ...(CONTEXT.season[ctx.season] || []), ...(CONTEXT.scene[ctx.scene] || []),
      ];
      if (pool.length) parts.push(pick(pool));
    }
    // dolaylı söyleyiş: etiketin adı değil bir imgesi ("martı sesleri duyulan"); oyun ilerledikçe daha sık
    const indirect = Math.min(BAL.indirectMax, BAL.indirectBase + (S.totals?.days || 0) * BAL.indirectPerDay);
    const says = tags.map(t => pick(TAGS[t].hint && rnd(S) < indirect ? TAGS[t].hint : TAGS[t].say));
    const table = tags.length > 1 ? REQ_TWO : REQ_ONE;
    parts.push(fill(pick(ctx.rare ? RARE_REQ : [...table.any, ...(table[voice] || [])]), says));
    if (!ctx.bare && rnd(S) < 0.35) parts.push(pick(CLOSE[voice]));
    text = parts.join(' ');
    // yabancı ülkede çoğu zaman o dilde selamla başlar (Kalimera! …)
    if (ctx.greet && !ctx.bare && rnd(S) < 0.6) text = ctx.greet + (ctx.greet.endsWith('!') ? ' ' : '! ') + text;
    if (!seenRecently(S, 'text', text)) break;
  }
  remember(S, 'text', text);
  return text;
}

// Eski düz kalıp (ilk söyleyiş): testler ve basit kullanım için
export function askText(tags, pickFn) {
  const says = tags.map(t => TAGS[t].say[0]);
  const table = tags.length > 1 ? REQ_TWO : REQ_ONE;
  return fill(pickFn(table.any), says);
}
