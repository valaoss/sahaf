// Denge simülasyonu: farklı oyun tarzlarıyla 30 gün oynar, kasanın nasıl büyüdüğünü yazdırır.
// Kullanım: npm run sim
import { BAL } from '../src/data/balance.js';
import { GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS, TOWN_KEYS } from '../src/data/towns.js';
import { newGame, shelfCount } from '../src/game/state.js';
import { buyBox, travel, rescue } from '../src/game/shop.js';
import { simulateDay } from '../src/game/day.js';

const DAYS = 30, RUNS = 40;

// Rafları kasabanın zevkine göre doldurur: en çok aranıp rafta en az olan türü alır
function stockSmart(S) {
  const d = TOWNS[S.town].demand;
  for (;;) {
    const g = GENRE_KEYS.slice().sort((a, b) => S.stock[a] / d[a] - S.stock[b] / d[b])[0];
    if (buyBox(S, g)) break;
  }
}
// Hep aynı türü alır
function stockLazy(S) { while (!buyBox(S, 'roman')); }

const STYLES = {
  'hiç koli almaz': () => {},
  'hep roman': stockLazy,
  'akıllı, tek kasaba': stockSmart,
  'akıllı, her gün gezer': (S, day) => { travel(S, TOWN_KEYS[day % TOWN_KEYS.length]); stockSmart(S); },
};

for (const [name, play] of Object.entries(STYLES)) {
  const curve = Array(DAYS).fill(0);
  let sold = 0, missed = 0;
  for (let r = 0; r < RUNS; r++) {
    const S = newGame(1000 + r);
    for (let d = 0; d < DAYS; d++) {
      rescue(S);
      play(S, d);
      const T = simulateDay(S);
      sold += T.soldCount;
      missed += Object.values(T.missed).reduce((a, b) => a + b, 0);
      curve[d] += S.coins / RUNS;
    }
  }
  const pts = [1, 3, 7, 14, 30].map(d => `${d}. gün ₺${Math.round(curve[d - 1])}`).join(' · ');
  console.log(`${name.padEnd(24)} ${pts} | günde ${(sold / RUNS / DAYS).toFixed(1)} satış, ${(missed / RUNS / DAYS).toFixed(1)} kaçan`);
}
console.log(`\nraf kapasitesi ${BAL.shelfCap}, koli ${BAL.boxSize} kitap, başlangıç ₺${BAL.startCoins}`);
