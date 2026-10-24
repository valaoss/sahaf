// Çevrilen içeriğin kaynakları: yama dosyalarındaki (en/content/*.js) her ad, burada asıl veri nesnesine bağlanır.
import { BOOK, TAGS } from '../data/books.js';
import { BLURBS } from '../data/blurbs.js';
import { GENRES } from '../data/genres.js';
import { REGULARS } from '../data/regulars.js';
import { KEEPSAKES } from '../data/keepsakes.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { TOWNS } from '../data/towns.js';
import { SPOTS } from '../data/spots.js';
import { COUNTRIES, PAPER, PAPER_TOWN } from '../data/countries.js';
import { EVENTS, WEATHER, SEASON, SPECIAL, GOSSIP } from '../data/calendar.js';
import { DECOR, UPGRADES, PAINTS, SLOTS, SHELF_LEVELS, AWNINGS } from '../data/decor.js';
import { STAMPS } from '../data/stamps.js';
import { PAGES } from '../data/story.js';
import { VOYAGE, GRAND } from '../data/voyage.js';
import { KOSTAS } from '../data/kostas.js';
import { TUT_STEPS } from '../game/tutorial.js';
import { LETTERS } from '../data/letters.js';
import { HAPPENINGS } from '../data/happenings.js';
import { ROAD } from '../data/road.js';
import { VISITORS } from '../data/visitors.js';
import { REPLIES } from '../data/replies.js';
import { TALK } from '../data/talk.js';
import { GREET, CLOSE, CONTEXT, REQ_ONE, REQ_TWO, RARE_REQ } from '../data/asks.js';
import { LINES as HAGGLE_LINES, HINTS as HAGGLE_HINTS } from '../data/haggle.js';
import { REP_LEVELS } from '../game/bonds.js';
import { COND_NAME } from '../game/shop.js';
import { THEMES } from '../audio/compose.js';

export const TARGETS = {
  BOOK, BLURBS, TAGS, GENRES,
  REGULARS, KEEPSAKES, ARCHETYPES,
  TOWNS, SPOTS, COUNTRIES, PAPER, PAPER_TOWN, EVENTS, WEATHER, SEASON, SPECIAL, GOSSIP,
  DECOR, UPGRADES, PAINTS, AWNINGS, SLOTS, SHELF_LEVELS, STAMPS, PAGES, VOYAGE, GRAND, KOSTAS, TUT_STEPS,
  LETTERS, HAPPENINGS, ROAD, VISITORS, REPLIES, TALK, GREET, CLOSE, CONTEXT, REQ_ONE, REQ_TWO, RARE_REQ,
  REP_LEVELS, COND_NAME, THEMES, HAGGLE_LINES, HAGGLE_HINTS,
};

// Metin alanları (denetim için): bu adlı alanlar çevrilir; ötekiler (kimlik, etki, sayı, ikon) dokunulmaz
export const TEXT_FIELDS = ['name', 'title', 'text', 'desc', 'note', 'hello', 'thanks', 'story', 'giftNote', 'label', 'result', 'failResult',
  'how', 'piece', 'unit', 'mech', 'hint', 'say', 'blurb', 'greet', 'pages', 'perk'];
