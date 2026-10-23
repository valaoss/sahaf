// Kitap bilgisi: oyuncu bir kitabın etiketlerini (deniz, hüzün…) başta bilmez; tanıtımını okuyarak sezer.
// Etiketler öğrenildikçe kartlarda görünür: satınca biri, önerince isteğe uyanlar, okuyunca ve mektup gelince hepsi.
// Teyzenin karavanda bıraktığı başlangıç kitaplarının etiketleri baştan bilinir (notları rafta).
import { BOOK } from '../data/books.js';
import { BAL } from '../data/balance.js';
import { rndPick } from '../core/rng.js';

export const knownTags = (S, id) => S.known[id] || [];
export const knowsAll = (S, id) => !!BOOK[id] && knownTags(S, id).length >= BOOK[id].tags.length;

// Etiketleri öğren (yalnız kitapta gerçekten olanlar). Dönüş: yeni öğrenilenler
export function learn(S, id, tags) {
  if (!BOOK[id]) return [];
  const have = S.known[id] || (S.known[id] = []);
  const fresh = tags.filter(t => BOOK[id].tags.includes(t) && !have.includes(t));
  have.push(...fresh);
  return fresh;
}
export const learnAll = (S, id) => learn(S, id, BOOK[id]?.tags || []);
// satışta: müşteri giderken kitaptan bir şey söyler, bilinmeyen bir etiket açılır
export function learnOne(S, id) {
  const rest = (BOOK[id]?.tags || []).filter(t => !knownTags(S, id).includes(t));
  return rest.length ? learn(S, id, [rndPick(S, rest)]) : [];
}

// Okuma köşesi: sabahları raftaki bir kitabı oku, bütün etiketleri açılır (günde readsPerDay; okuma koltuğuyla bir fazla)
export const readsPerDay = S => BAL.readsPerDay + (S.upgrades.includes('koltuk') ? 1 : 0);
export const readsLeft = S => Math.max(0, readsPerDay(S) - (S.readsToday || 0));
export function readBook(S, id) {
  if (S.phase !== 'morning') return 'Okumak için sabahı bekle.';
  if (!S.shelf[id] && !S.crate.some(e => e.id === id)) return 'Bu kitap karavanda yok.';
  if (knowsAll(S, id)) return 'Bu kitabı zaten iyi tanıyorsun.';
  if (!readsLeft(S)) return 'Bugünlük okuma vaktin bitti; yarın sabah yine.';
  S.readsToday = (S.readsToday || 0) + 1;
  learnAll(S, id);
  return null;
}

// Defterde: bütün etiketleri bilinen kitap sayısı
export const knownCount = S => Object.keys(S.known).filter(id => knowsAll(S, id)).length;

// Bilgiyle öneri (denge simülasyonu ve testler): istenen etiketlerden en çoğunu bildiğin kitabı ver; hiç bilmiyorsan
// istenen türden rastgele bir kitap (tanıtımı okumayan bir oyuncu gibi). Gerçek oyuncu tanıtımı da okur, bu bir alt sınırdır.
export function knownBest(S, ask, wants) {
  let best = null, score = -1;
  for (const id of Object.keys(S.shelf).sort()) {
    const s = ask.tags.filter(t => knownTags(S, id).includes(t)).length * 2 + (BOOK[id].genre === wants ? 1 : 0);
    if (s > score) { best = id; score = s; }
  }
  return best;
}
