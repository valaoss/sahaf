// İstatistik özeti: Defter'deki "İstatistik" sekmesi için. Durumu değiştirmez.
import { BOOK } from '../data/books.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';

export function statsOf(S) {
  const byGenre = Object.fromEntries(GENRE_KEYS.map(g => [g, 0]));
  for (const id in S.soldBooks) byGenre[BOOK[id].genre] += S.soldBooks[id];
  const topBooks = Object.entries(S.soldBooks).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 5)
    .map(([id, n]) => ({ id, title: BOOK[id].title, n }));
  const topGenre = GENRE_KEYS.slice().sort((a, b) => byGenre[b] - byGenre[a])[0];
  const topTown = Object.keys(S.townDays).sort((a, b) => S.townDays[b] - S.townDays[a])[0] || null;
  return {
    days: S.totals.days, sold: S.totals.sold, revenue: S.totals.revenue, perfect: S.totals.perfect,
    rareSold: S.totals.rareSold, bestDay: S.totals.bestDay, bestDayNo: S.totals.bestDayNo,
    byGenre, topBooks, topGenre: S.totals.sold ? topGenre : null, topTown,
    topGenreName: S.totals.sold ? GENRES[topGenre].name : '—', topTownName: topTown ? TOWNS[topTown].name : '—',
    friends: Object.values(S.friends).filter(h => h >= 5).length,
  };
}
