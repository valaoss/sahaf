// Müşterinin karşılığını seçer: uyum derecesi, kitabın konusu, konuşma üslubu. Tekrar bekçisinden geçer.
import { BOOK } from '../data/books.js';
import { REPLIES } from '../data/replies.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { pickFresh, remember } from './memory.js';

export function replyFor(S, c, res, bookId) {
  let pool;
  if (!bookId) pool = REPLIES.none;
  else if (res.grade === 'perfect') {
    const voice = c.arch ? ARCHETYPES[c.arch]?.voice : null;
    const tagLines = BOOK[bookId].tags.filter(t => c.ask.tags.includes(t)).flatMap(t => REPLIES.tag[t] || []);
    // tek havuz: konuya özel cümleler iki kat olası; tekrar bekçisi yakında söylenenleri eler
    pool = [...tagLines, ...tagLines, ...(REPLIES.voice[voice] || []), ...REPLIES.perfect];
  } else pool = REPLIES[res.grade] || REPLIES.miss;
  const line = pickFresh(S, 'reply', pool);
  remember(S, 'reply', line);
  return line.replace('{book}', bookId ? BOOK[bookId].title : '');
}
