// Dil. Türkçe asıl dildir: veriler ve arayüz Türkçe yazılır.
// İngilizcede (1) içerik: açılışta veri nesnelerinin metin alanları aynı kimliklerle üstüne yazılır (applyContent, en/index.js);
// (2) arayüz: Türkçe metin anahtardır. T`Rafta ${n} kitap` → sözlükte "Rafta {0} kitap" aranır, bulunamazsa Türkçesi kalır.
// tw(s): tek bir hazır metni çevirir (kurallardan gelen uyarılar, mevsim adı gibi).
// Mantıkta kullanılan anahtarlar (mevsim 'İlkbahar', tür, etiket, kasaba kimlikleri) hiçbir zaman çevrilmez.
const KEY = 'sahaf.lang';

function detect() {
  try {
    const saved = globalThis.localStorage?.getItem(KEY);
    if (saved === 'tr' || saved === 'en') return saved;
  } catch (e) { /* depolama yok */ }
  const nav = globalThis.navigator?.language || 'tr';
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

export const LANG = detect();
export const isEn = () => LANG === 'en';

// Dil değişince oyun yeniden açılır (içerik açılışta yerleşir)
export function setLang(lang) {
  try { globalThis.localStorage?.setItem(KEY, lang); } catch (e) { /* yok */ }
}

const DICT = {};
const missing = new Set();
export function addDict(d) { Object.assign(DICT, d); }

const look = key => {
  if (LANG === 'tr') return key;
  const v = DICT[key];
  if (v === undefined && !missing.has(key)) { missing.add(key); if (globalThis.location?.search?.includes('sahne=')) console.warn('çeviri yok:', key); }
  return v ?? key;
};

// Etiketli şablon: T`… ${a} … ${b} …` → anahtar "… {0} … {1} …"
export function T(strings, ...vals) {
  let key = strings[0];
  for (let i = 0; i < vals.length; i++) key += `{${i}}` + strings[i + 1];
  return look(key).replace(/\{(\d+)\}/g, (m, i) => vals[+i] ?? '');
}
export const tw = s => typeof s === 'string' ? look(s) : s;
export const missingKeys = () => [...missing];

// İçerik yaması: hedef nesnenin metin alanları yamayla değişir.
// Nesne → alan alan; kimlikli nesne dizisi + nesne yaması → kimliğe göre; nesne dizisi + dizi yaması → sıraya göre;
// metin dizisi yaması → dizinin tamamı değişir (söyleyişlerin sayısı dilden dile farklı olabilir).
export function merge(target, patch) {
  if (Array.isArray(target)) {
    if (Array.isArray(patch)) {
      if (patch.every(p => typeof p === 'string')) { target.length = 0; target.push(...patch); return; }
      patch.forEach((p, i) => { if (p && typeof p === 'object' && target[i] && typeof target[i] === 'object') merge(target[i], p); else if (p != null) target[i] = p; });
      return;
    }
    for (const el of target) if (el && el.id !== undefined && patch[el.id]) merge(el, patch[el.id]);
    return;
  }
  for (const k in patch) {
    const v = patch[k];
    if (v && typeof v === 'object' && target[k] && typeof target[k] === 'object') merge(target[k], v);
    else target[k] = v;
  }
}
