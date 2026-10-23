// İngilizce: açılışta (boot.js) içerik yamaları veri nesnelerinin üstüne yazılır, arayüz sözlüğü yüklenir.
import { merge, addDict } from '../i18n.js';
import { TARGETS } from '../registry.js';
import books from './content/books.js';
import people from './content/people.js';
import world from './content/world.js';
import talk from './content/talk.js';
import game from './content/game.js';

const dicts = import.meta.glob('./ui/*.js', { eager: true });

export function applyEnglish() {
  for (const patch of [books, people, world, talk, game]) for (const name in patch) if (TARGETS[name]) merge(TARGETS[name], patch[name]);
  for (const m of Object.values(dicts)) addDict(m.default);
}
