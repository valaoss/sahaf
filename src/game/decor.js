// Süsler, raf yükseltmesi ve boya: satın alma, takma ve toplam etkiler.
import { DECOR, SHELF_LEVELS, PAINTS, UPGRADES, AWNINGS } from '../data/decor.js';

// Takılı süslerin toplam etkisi
export function effects(S) {
  const out = { demand: {}, traffic: 0, tip: 0, patience: 1 };
  for (const slot in S.decor.on) {
    const e = DECOR[S.decor.on[slot]]?.effect || {};
    for (const g in e.demand || {}) out.demand[g] = (out.demand[g] || 1) * e.demand[g];
    out.traffic += e.traffic || 0;
    out.tip += e.tip || 0;
    out.patience *= e.patience || 1;
  }
  if (S.upgrades?.includes('cay')) out.patience *= 1.3;
  return out;
}

const morningOnly = S => S.phase !== 'morning' ? 'Dükkân açıkken düzenleme yapılmaz.' : null;

// Sahip değilse satın alır, sonra yuvasına takar
export function equipDecor(S, key) {
  const d = DECOR[key];
  if (!d) return 'Böyle bir süs yok.';
  const why = morningOnly(S);
  if (why) return why;
  if (!S.decor.owned.includes(key)) {
    if (d.gift) return 'Bu bir hediye: bir müdavimle dost olunca gelir.';
    if (S.coins < d.price) return 'Paran yetmiyor.';
    S.coins -= d.price;
    S.totals.spent += d.price;
    S.decor.owned.push(key);
  }
  S.decor.on[d.slot] = key;
  return null;
}

// Karavan geliştirmeleri: çay köşesi, plak çalar
export function buyUpgrade(S, key) {
  const u = UPGRADES[key];
  if (!u) return 'Böyle bir geliştirme yok.';
  const why = morningOnly(S);
  if (why) return why;
  if (S.upgrades.includes(key)) return 'Bu zaten karavanında.';
  if (S.coins < u.price) return 'Paran yetmiyor.';
  S.coins -= u.price;
  S.totals.spent += u.price;
  S.upgrades.push(key);
  return null;
}

export const nextShelf = S => SHELF_LEVELS[S.shelfLv + 1] || null;

export function upgradeShelf(S) {
  const why = morningOnly(S);
  if (why) return why;
  const next = nextShelf(S);
  if (!next) return 'Raflar zaten en büyük hâlinde.';
  if (S.coins < next.price) return 'Paran yetmiyor.';
  S.coins -= next.price;
  S.totals.spent += next.price;
  S.shelfLv++;
  return null;
}

export function chooseAwning(S, key) {
  const a = AWNINGS[key];
  if (!a) return 'Böyle bir tente yok.';
  const why = morningOnly(S);
  if (why) return why;
  if (!S.awnings.includes(key)) {
    if (S.coins < a.price) return 'Paran yetmiyor.';
    S.coins -= a.price;
    S.totals.spent += a.price;
    S.awnings.push(key);
  }
  S.awning = key;
  return null;
}

export function choosePaint(S, key) {
  const p = PAINTS[key];
  if (!p) return 'Böyle bir renk yok.';
  const why = morningOnly(S);
  if (why) return why;
  if (!S.paints.includes(key)) {
    if (S.coins < p.price) return 'Paran yetmiyor.';
    S.coins -= p.price;
    S.totals.spent += p.price;
    S.paints.push(key);
  }
  S.paint = key;
  return null;
}
