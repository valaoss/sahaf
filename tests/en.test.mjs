// İngilizce testleri (ayrı süreç: içerik yaması veri nesnelerini değiştirir). Kullanım: node tests/en.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { merge } from '../src/i18n/i18n.js';
import { TARGETS } from '../src/i18n/registry.js';
import books from '../src/i18n/en/content/books.js';
import people from '../src/i18n/en/content/people.js';
import world from '../src/i18n/en/content/world.js';
import talk from '../src/i18n/en/content/talk.js';
import game from '../src/i18n/en/content/game.js';
import { BOOKS, TAGS } from '../src/data/books.js';
import { HAPPENINGS } from '../src/data/happenings.js';
import { EVENTS, SEASON } from '../src/data/calendar.js';
import { TOWNS } from '../src/data/towns.js';
import { newGame } from '../src/game/state.js';
import { buildAsk } from '../src/game/asks.js';
import { makeCustomer, talkHint, buyBox, rescue } from '../src/game/shop.js';
import { placeAll } from '../src/game/shelving.js';
import { simulateDay } from '../src/game/day.js';
import { questText, writeLetter } from '../src/game/mail.js';
import { replyFor } from '../src/game/replies.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓ ' + name); };
const root = fileURLToPath(new URL('..', import.meta.url));
const run = script => execFileSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });

// mantıkta kullanılan yerler yamadan önce
const logic = JSON.stringify({ fx: HAPPENINGS.map(h => [h.when, h.choices.map(c => c.fx)]), ev: Object.values(EVENTS).map(e => e.town), seasons: Object.keys(SEASON), tags: BOOKS.map(b => b.tags) });
for (const patch of [books, people, world, talk, game]) for (const name in patch) merge(TARGETS[name], patch[name]);

test('içerik: Türkçedeki her metnin İngilizcesi var (scripts/i18n-check.mjs)', () => {
  assert.match(run('scripts/i18n-check.mjs'), /tamam/);
});

test('arayüz: kaynaklardaki her T`…` ve tw() anahtarının İngilizcesi var (scripts/i18n-ui-check.mjs)', () => {
  assert.match(run('scripts/i18n-ui-check.mjs'), /tamam/);
});

test('yama mantığa dokunmaz: olay etkileri, festival kasabaları, mevsim anahtarları, kitap etiketleri aynı', () => {
  const after = JSON.stringify({ fx: HAPPENINGS.map(h => [h.when, h.choices.map(c => c.fx)]), ev: Object.values(EVENTS).map(e => e.town), seasons: Object.keys(SEASON), tags: BOOKS.map(b => b.tags) });
  assert.equal(after, logic);
  assert.equal(TOWNS.atina.name, 'Athens');
});

test('müşteri istekleri İngilizce: yer tutucu kalmaz, etiket söyleyişi cümlede geçer', () => {
  const S = newGame(3);
  for (let d of [0, 40]) {
    S.totals.days = d;
    for (let i = 0; i < 200; i++) {
      const tags = [Object.keys(TAGS)[i % 19], Object.keys(TAGS)[(i * 7 + 3) % 19]].filter((t, k, a) => a.indexOf(t) === k).slice(0, 1 + (i % 2));
      const text = buildAsk(S, tags, { voice: ['resmi', 'samimi', 'genc', 'cocuk', 'turist'][i % 5], arch: 'ogrenci', weather: 'yagmurlu', season: 'Yaz', scene: 'sahil' });
      assert.ok(!/[{}]/.test(text), text);
      const low = text.toLowerCase();
      for (const t of tags) assert.ok([...TAGS[t].say, ...TAGS[t].hint].some(p => low.includes(p.toLowerCase())), `${t}: ${text}`);
    }
  }
});

test('İngilizce oyun: on gün oynanır; mektup, ilan, karşılık ve sohbet metinlerinde yer tutucu kalmaz', () => {
  const S = newGame(11);
  for (let d = 0; d < 10; d++) { rescue(S); buyBox(S, 'roman'); placeAll(S); simulateDay(S); }
  const texts = [];
  for (let i = 0; i < 30; i++) {
    const c = makeCustomer(S);
    texts.push(talkHint(S, c)?.text || '');
    if (c.ask) texts.push(c.ask.text, replyFor(S, c, { grade: ['perfect', 'good', 'miss'][i % 3] }, 'kurk'));
  }
  texts.push(writeLetter(S, { day: 1, town: 'ayvalik', spot: 'iskele', book: 'yasliadam', arch: 'balikci', look: 3 }).text);
  if (S.quest) texts.push(questText(S.quest));
  for (const t of texts) assert.ok(!/\{[a-z]+\}/i.test(t), t);
});

console.log(`\n${passed} test geçti`);
