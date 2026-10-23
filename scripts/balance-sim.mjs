// Denge simülasyonu: farklı oyun tarzlarıyla 30 gün oynar, kasanın nasıl büyüdüğünü yazdırır.
// Öneri isteyenlere raftaki en uygun kitap verilir (dikkatli oyuncu). Kullanım: npm run sim
import { GENRE_KEYS } from '../src/data/genres.js';
import { TOWN_KEYS } from '../src/data/towns.js';
import { SHELF_LEVELS } from '../src/data/decor.js';
import { newGame, genreCount, shelfCount, shelfCap } from '../src/game/state.js';
import { BAL } from '../src/data/balance.js';
import { buyBox, travel, rescue, demandOf } from '../src/game/shop.js';
import { placeAll } from '../src/game/shelving.js';
import { equipDecor, upgradeShelf } from '../src/game/decor.js';
import { simulateDay } from '../src/game/day.js';
import { eventOf } from '../src/game/calendar.js';
import { EVENTS } from '../src/data/calendar.js';

const DAYS = 30, RUNS = 40;

// İyi oyuncu gibi: rafta yer varken koli al ve hemen diz (kolide bekleyen kitap satılmaz)
function buyShelved(S, g) {
  if (shelfCount(S) + BAL.boxSize > shelfCap(S)) return 'dolu';
  const why = buyBox(S, g);
  placeAll(S);
  return why;
}

// Rafları kasabanın zevkine göre doldurur: en çok aranıp rafta en az olan türü alır
function stockSmart(S) {
  const d = demandOf(S);
  for (;;) {
    const g = GENRE_KEYS.slice().sort((a, b) => genreCount(S, a) / d[a] - genreCount(S, b) / d[b])[0];
    if (buyShelved(S, g)) break;
  }
}
// Hep aynı türü alır
function stockLazy(S) { while (!buyShelved(S, 'roman')); }

// Kenara para ayırıp sırayla raf, ziyaretçi süsü ve masa süsü alır
function invest(S) {
  const next = SHELF_LEVELS[S.shelfLv + 1];
  if (next && S.coins > next.price + 60) upgradeShelf(S);
  if (S.coins > 140) equipDecor(S, 'bayrak');
  if (S.coins > 160) equipDecor(S, 'lamba');
  if (S.coins > 160) equipDecor(S, 'mum');
}

const STYLES = {
  'hiç koli almaz': () => {},
  'hep roman': stockLazy,
  'akıllı, tek kasaba': stockSmart,
  'akıllı, her gün gezer': (S, day) => { travel(S, S.unlocked[(day + 1) % S.unlocked.length]); stockSmart(S); },
  'akıllı, 3 günde bir gezer': (S, day) => { if (day % 3 === 2) travel(S, S.unlocked[(day / 3 + 1) % S.unlocked.length | 0]); stockSmart(S); },
  'akıllı + yatırım': (S) => { invest(S); stockSmart(S); },
  'yatırım + festival peşinde': (S) => { const e = eventOf(S.day); if (e) travel(S, EVENTS[e].town); invest(S); stockSmart(S); },
};

for (const [name, play] of Object.entries(STYLES)) {
  const curve = Array(DAYS).fill(0);
  let sold = 0, missed = 0, perfect = 0, tips = 0;
  for (let r = 0; r < RUNS; r++) {
    const S = newGame(1000 + r);
    for (let d = 0; d < DAYS; d++) {
      rescue(S);
      play(S, d);
      const T = simulateDay(S);
      sold += T.soldCount;
      missed += Object.values(T.missed).reduce((a, b) => a + b, 0);
      perfect += T.recs.perfect;
      tips += T.tips;
      curve[d] += S.coins / RUNS;
    }
  }
  const pts = [1, 7, 14, 30].map(d => `${d}.g ₺${Math.round(curve[d - 1])}`).join(' · ');
  const per = x => (x / RUNS / DAYS).toFixed(1);
  console.log(`${name.padEnd(26)} ${pts} | günde ${per(sold)} satış, ${per(missed)} kaçan, ${per(perfect)} tam öneri, ₺${per(tips)} bahşiş`);
}
