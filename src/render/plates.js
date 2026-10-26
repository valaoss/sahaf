// Boyalı görseller (GPT ile üretilir, docs/gorsel-promptlari.md): public/art/sahne/<sahne>.png ve public/art/harita.png.
// Hangi dosyaların olduğunu Vite söyler (vite.config.js artList): olmayan görsel hiç istenmez, konsolda 404 çıkmaz.
// Görsel yoksa sahne ve harita kodla çizilmiş hâlleriyle kalır.
import { SCENES, MAP } from 'virtual:art';

const BASE = import.meta.env.BASE_URL;
export const plateUrl = scene => SCENES.includes(scene) ? `${BASE}art/sahne/${scene}.png` : null;
export const mapPlateUrl = () => MAP ? `${BASE}art/harita.png` : null;

const pending = new Map(), loaded = new Map();
// yüklenmiş görsel (yoksa ya da henüz yüklenmediyse null): aynı mekâna dönünce kodla çizilmiş hâl bir an bile görünmesin
export const plateNow = scene => loaded.get(plateUrl(scene)) || null;
// görseli bir kez yükler; dosya çözülemezse null
export function loadPlate(scene) {
  const url = plateUrl(scene);
  if (!url) return Promise.resolve(null);
  if (!pending.has(url)) pending.set(url, new Promise(res => {
    const img = new Image();
    img.onload = () => { loaded.set(url, img); res(img); };
    img.onerror = () => res(null);
    img.src = url;
  }));
  return pending.get(url);
}

// görselin sahneye (1600×900) düşen parçası: ortadan 16:9 kırpılır (1536×1024 üretilse de sığar)
export function plateCrop(img) {
  const iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(1600 / iw, 900 / ih), w = 1600 / s, h = 900 / s;
  return [(iw - w) / 2, (ih - h) / 2, w, h];
}
