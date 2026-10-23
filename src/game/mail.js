// Sabah postası: geçmiş önerilere dönen mektuplar ve gazetedeki ilanlar (çok günlük küçük görevler).
import { BAL } from '../data/balance.js';
import { BOOK, BOOKS, TAGS, booksOf } from '../data/books.js';
import { GENRES } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { SPOTS } from '../data/spots.js';
import { REGULARS } from '../data/regulars.js';
import { ARCHETYPES, nameOf } from '../data/archetypes.js';
import { LETTERS } from '../data/letters.js';
import { VISITORS } from '../data/visitors.js';
import { rnd, rndInt, rndPick } from '../core/rng.js';
import { takeBook } from './state.js';
import { plainCopies } from './shop.js';
import { pickFresh, remember } from './memory.js';
import { learnAll } from './knowledge.js';
import { EVENTS } from '../data/calendar.js';
import { eventOf } from './calendar.js';
import { T, tw, isEn } from '../i18n/i18n.js';

// metin dili: küçük harfe çevirirken Türkçede İ→i, I→ı; İngilizcede olağan kural
const LOC = () => isEn() ? 'en' : 'tr';
const ago = d => d <= 7 ? tw('Geçen hafta') : d <= 14 ? tw('İki hafta önce') : d <= 21 ? tw('Üç hafta önce') : tw('Geçen ay');

// --- mektuplar ---
export function writeLetter(S, r) {
  const b = BOOK[r.book];
  const tpls = LETTERS.filter(l => !l.tag || b.tags.includes(l.tag));
  const tpl = pickFresh(S, 'letter', tpls, l => l.id);
  remember(S, 'letter', tpl.id);
  const when = ago(S.day - r.day);
  const where = `${TOWNS[r.town].name}, ${SPOTS[r.town]?.[r.spot]?.name || ''}`.replace(/, $/, '');
  // zaman ifadesi cümle başındaysa büyük, ortadaysa küçük harfle
  const text = tpl.text.replace('{book}', b.title).replace('{where}', where)
    .replace(/(^|[.!?] ){ago}/, (m, p) => p + when).replace('{ago}', when.toLocaleLowerCase(LOC()));
  const from = r.reg ? REGULARS[r.reg].name : nameOf(r.look || 0, ARCHETYPES[r.arch]?.names);
  return { id: tpl.id, from, text, book: r.book, day: S.day, recDay: r.day, recTown: r.town };
}

// Her sabah: arada bir, en az 5 gün önce tam isabet önerilmiş birinden mektup gelir
export function morningLetter(S) {
  if (rnd(S) > BAL.letterChance) return null;
  const cand = S.recHistory.filter(r => !r.sent && S.day - r.day >= 5);
  if (!cand.length) return null;
  const r = rndPick(S, cand);
  r.sent = true;
  const L = writeLetter(S, r);
  // okurun mektubu kitabı anlatır: bütün etiketleri öğrenilir
  L.learned = learnAll(S, r.book);
  if (rnd(S) < 0.35) { L.coins = 10 + rndInt(S, 16); S.coins += L.coins; }
  S.letters.push(L);
  S.lettersTotal = (S.lettersTotal || 0) + 1;
  if (S.letters.length > 60) S.letters.shift();
  return L;
}

// --- ilanlar ---
const lower = s => s.toLocaleLowerCase(LOC());

// üretilen ilanların metni (müdavim ve festival ilanları)
const GEN_TEXT = {
  reg: q => T`${REGULARS[q.reg].name} arkadaşlarıyla bir okuma akşamı yapacak: {days} gün içinde {town} kasabasında {n} tane {tag} kitap istiyor.`,
  fest: q => T`${EVENTS[q.ev].name} için {town} belediyesi bir kitap köşesi kuruyor: festival gününe kadar {n} {genre} kitabı, teslim o gün orada.`,
};
export function questText(q) {
  const V = GEN_TEXT[q.vid] ? { text: GEN_TEXT[q.vid](q) } : VISITORS.find(v => v.id === q.vid);
  return V.text.replace('{book}', q.book ? BOOK[q.book].title : '').replace('{tag}', q.tag ? TAGS[q.tag].name : '')
    .replace('{genre}', q.genre ? lower(GENRES[q.genre].name) : '').replace(/\{n\}/g, q.n || '')
    .replace('{town}', q.town ? TOWNS[q.town].name : '').replace('{days}', q.deadline - q.from + 1);
}

// Sabah: aktif ilan yoksa ve şans tutarsa yeni ilan çıkar
export function offerQuest(S) {
  if (S.quest || S.day < 3 || rnd(S) > BAL.questChance) return null;
  // yarısı üretilir: tanıştığın bir müdavimin zevkinden ya da önümüzdeki günlerdeki bir festivalden
  if (rnd(S) < 0.5) { const g = generatedQuest(S); if (g) { S.quest = g; return g; } }
  const V = pickFresh(S, 'quest', VISITORS.filter(v => !S.questsSeen.includes(v.id) || S.questsSeen.length >= VISITORS.length), v => v.id);
  remember(S, 'quest', V.id);
  if (!S.questsSeen.includes(V.id)) S.questsSeen.push(V.id);
  const q = { vid: V.id, kind: V.kind, n: V.n || 1, from: S.day, deadline: S.day + V.days - 1, coins: V.coins, rare: !!V.rare };
  if (V.town) q.town = rndPick(S, S.unlocked);
  if (V.kind === 'book') {
    const pool = V.pool.tag ? BOOKS.filter(b => b.tags.includes(V.pool.tag)) : booksOf(V.pool.genre);
    q.book = pickFresh(S, 'book', pool, b => b.id).id;
  }
  if (V.kind === 'tag') q.tag = V.tag;
  if (V.kind === 'genre') q.genre = V.genre;
  S.quest = q;
  return q;
}

function generatedQuest(S) {
  const regs = S.met.filter(id => REGULARS[id] && S.unlocked.includes(REGULARS[id].town)).sort();
  const fests = [2, 3, 4, 5].map(k => ({ day: S.day + k, ev: eventOf(S.day + k) })).filter(x => x.ev && S.unlocked.includes(EVENTS[x.ev].town));
  if (fests.length && (rnd(S) < 0.5 || !regs.length)) {
    const x = fests[0], town = EVENTS[x.ev].town, d = TOWNS[town].demand;
    const genre = Object.keys(d).sort((a, b) => d[b] - d[a])[rndInt(S, 2)];
    return { vid: 'fest', ev: x.ev, kind: 'genre', genre, n: 3, town, from: S.day, deadline: x.day, coins: 60, rare: false };
  }
  if (!regs.length) return null;
  const id = rndPick(S, regs), R = REGULARS[id];
  return { vid: 'reg', reg: id, kind: 'tag', tag: rndPick(S, R.likes), n: 2 + rndInt(S, 2), town: R.town, from: S.day, deadline: S.day + 4, coins: 45, rare: false };
}

// Raftaki uygun, normal satışa açık kopyalar
function matching(S, q) {
  const ok = id => q.kind === 'book' ? id === q.book : q.kind === 'tag' ? BOOK[id].tags.includes(q.tag) : BOOK[id].genre === q.genre;
  const out = [];
  for (const id of Object.keys(S.shelf).sort()) for (let i = 0; i < plainCopies(S, id) && ok(id); i++) out.push(id);
  return out;
}

export const questProgress = (S, q = S.quest) => q ? { have: Math.min(matching(S, q).length, q.n), n: q.n } : null;

// Gün sonu: doğru kasabadaysan ve kitaplar raftaysa teslim; süre dolduysa ilan kalkar
export function settleQuest(S, T) {
  const q = S.quest;
  if (!q) return null;
  const here = !q.town || q.town === T.town;
  const have = matching(S, q);
  if (here && have.length >= q.n) {
    for (const id of have.slice(0, q.n)) takeBook(S, id);
    S.coins += q.coins;
    let rare = null;
    // teşekkür hediyesi: bir ilk baskı (raf kapasitesini aşabilir, hediye geri çevrilmez)
    if (q.rare) { rare = rndPick(S, BOOKS).id; S.shelf[rare] = (S.shelf[rare] || 0) + 1; S.rare[rare] = (S.rare[rare] || 0) + 1; }
    S.quest = null;
    S.questsDone++;
    return { done: true, vid: q.vid, coins: q.coins, rare };
  }
  if (S.day >= q.deadline) { S.quest = null; return { done: false, vid: q.vid }; }
  return null;
}
