// Arayüz sözlüğü denetimi: kaynaklardaki T`…` şablonlarının ve tw('…') metinlerinin anahtarları src/i18n/en/ui/*.js'te var mı?
// Kullanım: node scripts/i18n-ui-check.mjs [dosya …]  (dosya verilmezse src/ altının tamamı). Eksik anahtarları yazar.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(dir + d.name + '/') : d.name.endsWith('.js') ? [dir + d.name] : []);
const files = process.argv.slice(2).length ? process.argv.slice(2) : walk(root).filter(f => !/[\\/]i18n[\\/]/.test(f));

// T`…` anahtarı: ${…} ifadeleri {0},{1}… olur (iç içe süslü parantez ve şablonlar atlanır)
function templateKeys(src) {
  const keys = [];
  for (let i = src.indexOf('T`'); i >= 0; i = src.indexOf('T`', i + 2)) {
    if (/[\w$.]/.test(src[i - 1] || '')) continue;
    let j = i + 2, key = '', n = 0, ok = true;
    while (j < src.length && src[j] !== '`') {
      if (src[j] === '\\') { const c = src[j + 1]; key += c === 'n' ? '\n' : c === 't' ? '\t' : c; j += 2; continue; }
      if (src[j] === '$' && src[j + 1] === '{') {
        let d = 1; j += 2;
        while (j < src.length && d) { if (src[j] === '{') d++; else if (src[j] === '}') d--; else if (src[j] === '`') { ok = false; } j++; }
        key += `{${n++}}`;
        continue;
      }
      key += src[j++];
    }
    if (ok) keys.push(key);
  }
  return keys;
}
const twKeys = src => [...src.matchAll(/\btw\((['"])((?:\\.|(?!\1).)*)\1\)/g)].map(m => m[2].replace(/\\'/g, "'").replace(/\\"/g, '"'));

const dictDir = new URL('../src/i18n/en/ui/', import.meta.url);
const dict = {};
for (const f of readdirSync(dictDir).filter(n => n.endsWith('.js'))) Object.assign(dict, (await import(new URL(f, dictDir))).default);

let miss = 0, total = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  for (const k of [...templateKeys(src), ...twKeys(src)]) {
    total++;
    if (!(k in dict)) { miss++; if (miss <= 40) console.log('EKSİK', file.replace(root, ''), JSON.stringify(k)); }
  }
}
console.log(miss ? `${miss}/${total} anahtar eksik` : `tamam: ${total} anahtar`);
process.exitCode = miss ? 1 : 0;
