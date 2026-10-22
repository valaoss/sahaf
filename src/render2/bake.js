// Pişirme: SVG çizimini bir kez bitmap'e çevirir. Canvas motoru her karede yalnızca bu resimleri çizer.
// Bir bant (ör. bandG) pişirilirken içindeki hareketli parçalar (bulut, kuyruk, değirmen…) ayıklanır,
// ayrı bir atlasa pişirilir ve konumları (sahneye göre dönüşüm matrisi + kendi kutusu) kaydedilir.
import f700 from '@fontsource/fredoka/files/fredoka-latin-700-normal.woff2?url';

const NS = 'http://www.w3.org/2000/svg';
const XS = new XMLSerializer();

// canvas'ta canlandırılan sınıflar (style.css'teki karşılıkları render2/anim.js'de)
export const ANIM_SEL = '.drift,.twinkle,.bob,.sway,.tail,.zzz,.breathe,.spin,.flutter,.flutter-slow,.flicker,.steam,.awning';

// SVG resim olarak yüklenince belgenin yazı tiplerini göremez: Fredoka gömülür
let fontCss = '';
export async function loadFonts() {
  if (fontCss) return;
  try {
    const buf = await (await fetch(f700)).arrayBuffer();
    let bin = '';
    const u = new Uint8Array(buf);
    for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    fontCss = `@font-face{font-family:Fredoka;font-weight:700;src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2')}`;
  } catch (e) { fontCss = ' '; }
}

// SVG metni → piksel tuvali (w×h sahne birimi, scale piksel/birim)
export async function rasterize(inner, box, scale, defs = '') {
  const pw = Math.max(1, Math.ceil(box.w * scale)), ph = Math.max(1, Math.ceil(box.h * scale));
  const svg = `<svg xmlns="${NS}" width="${pw}" height="${ph}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" style="font-family:Fredoka,sans-serif">`
    + `<style>${fontCss}</style>${defs}${inner}</svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = pw; c.height = ph;
    c.getContext('2d').drawImage(img, 0, 0, pw, ph);
    return c;
  } finally { URL.revokeObjectURL(url); }
}

// bir öğenin, kendi kullanıcı uzayından sahne (kök svg) uzayına dönüşümü
function relMatrix(root, node) {
  const m = root.getScreenCTM().inverse().multiply(node.getScreenCTM());
  return [m.a, m.b, m.c, m.d, m.e, m.f];
}

// atası da hareketliyse içteki ayrıca ayıklanmaz (dıştakiyle birlikte döner)
const outermost = (list, band) => list.filter(e => { for (let a = e.parentElement; a && a !== band; a = a.parentElement) if (a.matches(ANIM_SEL)) return false; return true; });

// kalıtılan boya özellikleri: parça kendi başına çizilince üst gruptan gelen renk kaybolmasın
const INHERIT = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'font-size', 'font-weight', 'text-anchor'];

function asStandalone(node) {
  const cs = getComputedStyle(node), copy = node.cloneNode(true);
  for (const k of ['transform', 'class', 'style']) copy.removeAttribute(k);
  for (const k of INHERIT) if (!node.hasAttribute(k)) { const v = cs.getPropertyValue(k); if (v) copy.setAttribute(k, v); }
  return copy;
}

// Bant anlık görüntüsü. fix(clone) kopyada CSS'e bağlı görünüşleri sabitler (pencere rengi, filtre…).
// Dönüş: { img, box, anims: [{ cls, delay, m, bb, sx, sy, sw, sh, img }] }
export async function snapshotBand(root, bandId, box, scale, fix) {
  const band = root.querySelector('#' + bandId);
  const live = outermost([...band.querySelectorAll(ANIM_SEL)], band).filter(e => getComputedStyle(e).display !== 'none' && e.closest('[style*="display: none"]') === null);
  const anims = live.map(e => ({
    cls: [...e.classList],
    delay: parseFloat(e.style.animationDelay) || 0,
    m: relMatrix(root, e),
    bb: e.getBBox(),
    node: asStandalone(e),
  })).filter(a => a.bb.width > 0 && a.bb.height > 0);

  // statik kısım: bandın kopyası, hareketliler çıkarılmış
  const clone = band.cloneNode(true);
  const all = [...band.querySelectorAll('*')], cl = [...clone.querySelectorAll('*')];
  const drop = new Set(live.map(e => cl[all.indexOf(e)]));
  for (const n of drop) n?.remove();
  fix?.(clone);
  const defs = root.querySelector('defs').outerHTML;
  const img = await rasterize(XS.serializeToString(clone), box, scale, defs);

  // hareketlilerin atlası: yan yana hücreler, her biri kendi kutusuyla
  let atlas = null;
  if (anims.length) {
    const pad = 6, maxW = 2400;
    let x = 0, y = 0, rowH = 0, W = 0, cells = '';
    for (const a of anims) {
      const k = Math.hypot(a.m[0], a.m[1]);                 // sahnedeki ölçek (ör. süs yuvası ×1.3)
      a.k = k;
      const w = a.bb.width + pad * 2, h = a.bb.height + pad * 2;
      if (x + w > maxW) { x = 0; y += rowH; rowH = 0; }
      a.cell = { x, y, w, h, pad };
      cells += `<g transform="translate(${x - a.bb.x + pad} ${y - a.bb.y + pad})">${XS.serializeToString(a.node)}</g>`;
      x += w; rowH = Math.max(rowH, h); W = Math.max(W, x);
    }
    const H = y + rowH, ks = scale * Math.min(3, Math.max(1, ...anims.map(a => a.k)));
    atlas = await rasterize(cells, { x: 0, y: 0, w: W, h: H }, ks, defs);
    for (const a of anims) {
      a.img = atlas;
      a.sx = a.cell.x * ks; a.sy = a.cell.y * ks; a.sw = a.cell.w * ks; a.sh = a.cell.h * ks;
      delete a.node;
    }
  }
  return { img, box, anims };
}
