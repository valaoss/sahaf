// İlerleme (v3 Faz 3): tür kilitleri, haftalık sahaf mezatı, çırak ve sıradaki hedef.
// Araba basamakları ve satış araçları game/decor.js'te (upgradeShelf, buyUpgrade); veriler data/decor.js ve data/genres.js'te.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { BOOKS } from '../data/books.js';
import { TOWNS } from '../data/towns.js';
import { SHELF_LEVELS, UPGRADES } from '../data/decor.js';
import { seeded } from '../core/rng.js';

const morningOnly = S => S.phase !== 'morning' ? 'Bu iş sabah yapılır.' : null;

// --- Tür kilitleri: başta üç tür; ötekiler toptancıda bir kez ödenerek açılır ---
export const genreOpen = (S, g) => S.genres.includes(g);
export function unlockGenre(S, g) {
  const why = morningOnly(S);
  if (why) return why;
  if (!GENRES[g]) return 'Böyle bir tür yok.';
  if (genreOpen(S, g)) return 'Bu tür zaten açık.';
  if (S.coins < GENRES[g].unlock) return 'Paran yetmiyor.';
  S.coins -= GENRES[g].unlock;
  S.totals.spent += GENRES[g].unlock;
  S.genres.push(g);
  // aynı etiketi taşıyan ikinci bölüm yeni türe ayrılır (boşsa); oyuncu raf modunda istediği gibi değiştirebilir
  const secs = S.layout?.sections || [], seen = new Set();
  const twin = secs.find(sec => { const dup = seen.has(sec.label); seen.add(sec.label); return dup && !sec.books.length; });
  if (twin) twin.label = g;
  return null;
}

// --- Sahaf mezatı: her hafta bir sabah, birkaç ilk baskı satışa çıkar. Koleksiyoncu gelirse kat kat kazandırır, gelmezse rafta bekler. ---
export const isMezatDay = S => S.day % BAL.mezatEvery === BAL.mezatOn;
export const daysToMezat = S => (BAL.mezatOn - S.day % BAL.mezatEvery + BAL.mezatEvery) % BAL.mezatEvery;
// Bugünün lotları: gün ve kasabadan sabit üretilir (oyunun zarını harcamaz); alınanlar S.mezat.sold'da
export function mezatOf(S) {
  if (!isMezatDay(S)) return [];
  const key = S.day + '/' + S.town;
  if (!S.mezat || S.mezat.key !== key) S.mezat = { key, sold: [] };
  const r = seeded(S.day * 4243 + Object.keys(TOWNS).indexOf(S.town) * 977 + 5);
  const pool = BOOKS.filter(b => genreOpen(S, b.genre)), used = new Set(), lots = [];
  for (let i = 0; i < BAL.mezatLots && pool.length; i++) {
    let b;
    do b = pool[Math.floor(r() * pool.length)]; while (used.has(b.id) && used.size < pool.length);
    used.add(b.id);
    const cond = r() < 0.5 ? 'temiz' : 'iyi';
    const price = Math.round(GENRES[b.genre].price * BAL.rareMul * BAL.conds[cond].sell * (BAL.mezatMin + r() * BAL.mezatSpread));
    lots.push({ i, id: b.id, cond, price, sold: S.mezat.sold.includes(i) });
  }
  return lots;
}
export function buyLot(S, i) {
  const why = morningOnly(S);
  if (why) return why;
  const lot = mezatOf(S)[i];
  if (!lot) return 'Bugün mezat yok.';
  if (lot.sold) return 'Bu kitap satıldı.';
  if (S.crate.length >= BAL.crateCap) return 'Koli dolu.';
  if (S.coins < lot.price) return 'Paran yetmiyor.';
  S.coins -= lot.price;
  S.totals.spent += lot.price;
  S.mezat.sold.push(i);
  S.crate.push({ id: lot.id, rare: true, cond: lot.cond });
  return null;
}

// --- Çırak: eşiğin (etiketin yüzdesi) üstündeki teklifleri senin yerine kabul eder; öneriyle gelenlere sen bakarsın ---
export const APPRENTICE_STEPS = [0.8, 0.9, 0];   // 0: kapalı
export const apprenticeTakes = (S, d) => S.upgrades.includes('cirak') && S.apprentice > 0 && !d.rec && d.O >= Math.ceil(d.P * S.apprentice);
export function setApprentice(S, v) {
  if (!APPRENTICE_STEPS.includes(v)) return 'Böyle bir ayar yok.';
  S.apprentice = v;
  return null;
}

// --- Sıradaki büyük hedef: bir sonraki araba basamağı; o bitince alınmamış satış aracı, sonra kilitli tür ---
export function goalOf(S) {
  const n = SHELF_LEVELS[S.shelfLv + 1];
  if (n) return { kind: 'cart', icon: n.icon, name: n.name, price: n.price };
  const u = ['paket', 'cay', 'fener', 'cirak'].find(k => !S.upgrades.includes(k));
  if (u) return { kind: 'tool', icon: UPGRADES[u].icon, name: UPGRADES[u].name, price: UPGRADES[u].price };
  const g = GENRE_KEYS.find(k => !genreOpen(S, k));
  if (g) return { kind: 'genre', icon: GENRES[g].icon, name: GENRES[g].name, price: GENRES[g].unlock };
  return null;
}
// Bugün alınabilecek küçük şeyler (akşam kartında): açılmamış türler ve satış araçları, kasadaki parayla
export function affordable(S) {
  const out = [];
  for (const g of GENRE_KEYS) if (!genreOpen(S, g) && S.coins >= GENRES[g].unlock) out.push({ icon: GENRES[g].icon, name: GENRES[g].name, price: GENRES[g].unlock });
  for (const k in UPGRADES) if (!S.upgrades.includes(k) && S.coins >= UPGRADES[k].price) out.push({ icon: UPGRADES[k].icon, name: UPGRADES[k].name, price: UPGRADES[k].price });
  return out.sort((a, b) => a.price - b.price).slice(0, 3);
}
