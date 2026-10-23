// İngilizce içerik denetimi: src/i18n/en/content/*.js yamalarında Türkçe verideki her metin alanının karşılığı var mı?
// Kullanım: node scripts/i18n-check.mjs [BOOK TAGS …]  (ad verilmezse hepsi). Eksik ve fazla yolları yazar.
import { readdirSync } from 'node:fs';
import { TARGETS, TEXT_FIELDS } from '../src/i18n/registry.js';

const dir = new URL('../src/i18n/en/content/', import.meta.url);
const patch = {};
for (const f of readdirSync(dir).filter(n => n.endsWith('.js')).sort()) Object.assign(patch, (await import(new URL(f, dir))).default);

// metin değil: kimlikler, ikonlar, renkler, sahne/kasaba/tür anahtarları, kişi adı listeleri, yazar adları
const SKIP = new Set(['id', 'icon', 'color', 'flag', 'scene', 'town', 'book', 'tag', 'genre', 'slot', 'gift', 'kind', 'vid', 'on', 'done',
  'target', 'voice', 'stat', 'cond', 'names', 'author', 'likes', 'tags', 'land', 'body', 'edge', 'band', 'shine', 'hatC', 'coat', 'hair']);
const human = s => /\s/.test(s) || /[^\x00-\x7f]/.test(s) || /^[A-ZÇĞİÖŞÜ]/.test(s);
const isText = (k, v) => typeof v === 'string' && (TEXT_FIELDS.includes(k) || (!SKIP.has(k) && human(v) && !/^[#\[]/.test(v)));
const strArr = v => Array.isArray(v) && v.length && v.every(x => typeof x === 'string');
const hasText = v => typeof v === 'string' ? human(v) : Array.isArray(v) ? v.some(hasText) : v && typeof v === 'object' ? Object.entries(v).some(([k, x]) => !SKIP.has(k) && (isText(k, x) || (typeof x === 'object' && hasText(x)))) : false;

function walk(tr, en, path, out) {
  if (typeof tr === 'string') { if (tr && (typeof en !== 'string' || !en.trim())) out.push(path); return; }
  if (strArr(tr)) { if (!strArr(en)) out.push(path); return; }
  if (Array.isArray(tr)) {
    const keyed = tr.every(x => x && typeof x === 'object' && x.id !== undefined) && en && !Array.isArray(en);
    tr.forEach((el, i) => { if (hasText(el)) walk(el, keyed ? en[el.id] : en?.[i], `${path}${keyed ? '.' + el.id : `[${i}]`}`, out); });
    return;
  }
  for (const k in tr) {
    const v = tr[k];
    if (SKIP.has(k) && !TEXT_FIELDS.includes(k)) continue;
    if (isText(k, v) || (strArr(v) && (TEXT_FIELDS.includes(k) || v.some(human)))) walk(v, en?.[k], `${path}.${k}`, out);
    else if (v && typeof v === 'object' && hasText(v)) walk(v, en?.[k], `${path}.${k}`, out);
  }
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TARGETS);
let bad = 0;
for (const n of names) {
  if (!TARGETS[n]) { console.log('BİLİNMEYEN AD', n); bad++; continue; }
  if (!patch[n]) { console.log('YAMA YOK', n); bad++; continue; }
  const out = [];
  walk(TARGETS[n], patch[n], n, out);
  for (const p of out.slice(0, 15)) console.log('EKSİK', p);
  if (out.length > 15) console.log(`… ${n}: toplam ${out.length} eksik`);
  bad += out.length;
}
for (const n in patch) if (!TARGETS[n]) { console.log('FAZLA AD', n); bad++; }
console.log(bad ? `${bad} sorun` : `tamam: ${names.length} ad`);
process.exitCode = bad ? 1 : 0;
