// İnsan iskeleti: personSVG çıktısı eklem gruplarına ayrılır (bacak, kol, baş, gövde parçaları), her biri
// bir atlasa pişirilir. Çizimde parçalar kendi eklem noktasında döndürülür; özgün çizim sırası korunur.
import { personSVG, figureMeta } from '../render/figure.js';
import { rasterize } from './bake.js';

const NS = 'http://www.w3.org/2000/svg';
const XS = new XMLSerializer();
const LIMB = /^p-(leg|arm)[LRFB]$/;

let lab = null;
function labRoot() {
  if (lab) return lab;
  lab = document.createElementNS(NS, 'svg');
  lab.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden');
  document.body.appendChild(lab);
  return lab;
}

const translateOf = s => { const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(s || ''); return m ? [+m[1], +m[2]] : [0, 0]; };
const rotateOf = s => { const m = /rotate\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/.exec(s || ''); return m ? [+m[1], +m[2], +m[3]] : null; };

// birleşik kutu (aynı koordinat sistemindeki kardeşler)
function unionBox(nodes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of nodes) {
    if (!n.getBBox) continue;
    const b = n.getBBox();
    if (!b.width && !b.height) continue;
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  return x0 === Infinity ? null : { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

// Görünüşü (p-front / p-side) çizim listesine çevir: limb | head | seg | up (gövde grubu aç) | down (kapat)
function walk(view, cells) {
  const items = [];
  const addCell = (name, html, bb) => { cells.push({ name, html, bb }); return name; };
  function visit(parent, prefix) {
    let seg = [];
    const flush = () => {
      if (!seg.length) return;
      const bb = unionBox(seg);
      if (bb) items.push({ type: 'seg', cell: addCell(`${prefix}seg${items.length}`, seg.map(n => XS.serializeToString(n)).join(''), bb) });
      seg = [];
    };
    for (const ch of [...parent.children]) {
      const inner = ch.firstElementChild;
      const cls = inner && inner.getAttribute('class');
      if (cls && LIMB.test(cls)) {
        flush();
        const name = cls.slice(2);
        const book = inner.querySelector('.p-book');
        let bookCell = null;
        if (book) {
          bookCell = addCell(prefix + 'book', XS.serializeToString(book), book.getBBox());
          book.remove();
        }
        items.push({ type: 'limb', name, pivot: translateOf(ch.getAttribute('transform')), cell: addCell(prefix + name, inner.innerHTML, inner.getBBox()), book: bookCell });
      } else if (cls === 'p-head') {
        flush();
        const eyes = inner.querySelector('.p-eyes');
        const open = inner.innerHTML;
        const bb = inner.getBBox();
        // kapalı göz: göz grubunun yerine iki kısa çizgi
        const shut = eyes ? (() => {
          const e = eyes.getBBox(), cy = e.y + e.height / 2;
          const d = e.width > 12 ? `M${e.x} ${cy} L${e.x + 5} ${cy} M${e.x + e.width - 5} ${cy} L${e.x + e.width} ${cy}` : `M${e.x - 1} ${cy} L${e.x + e.width + 1} ${cy}`;
          const keep = eyes.outerHTML;
          const html = inner.innerHTML.replace(keep, `<path d="${d}" stroke="#3d2b24" stroke-width="2" stroke-linecap="round"/>`);
          return html === open ? null : html;
        })() : null;
        items.push({ type: 'head', pivot: translateOf(ch.getAttribute('transform')), cell: addCell(prefix + 'head', open, bb), blink: shut ? addCell(prefix + 'blink', shut, bb) : null });
      } else if (ch.getAttribute('class') === 'p-upper') {
        flush();
        const hunchG = ch.firstElementChild;
        items.push({ type: 'up', hunch: rotateOf(hunchG && hunchG.getAttribute('transform')) });
        visit(hunchG, prefix + 'u');
        items.push({ type: 'down' });
      } else seg.push(ch);
    }
    flush();
  }
  visit(view, view.getAttribute('class') === 'p-side' ? 's' : 'f');
  return items;
}

const cache = new Map();

// Kişinin iskeletini kur (önbellekli). scale: piksel/sahne birimi.
export async function buildRig(look, style, carry, scale) {
  const key = `${look}|${JSON.stringify(style || {})}|${carry.umbrella ? 1 : 0}${carry.lantern ? 1 : 0}|${scale.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  const job = (async () => {
    const meta = figureMeta(look, style);
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = personSVG(look, style, carry);
    labRoot().appendChild(g);
    const shadow = g.querySelector('ellipse');
    const cells = [];
    const front = walk(g.querySelector('.p-front'), cells);
    const side = walk(g.querySelector('.p-side'), cells);
    g.remove();
    // atlas: hücreler yan yana
    const pad = 4, ks = scale * meta.scale, maxW = 1400;
    let x = 0, y = 0, rowH = 0, W = 0, html = '';
    const at = {};
    for (const c of cells) {
      const w = c.bb.width + pad * 2, h = c.bb.height + pad * 2;
      if (x + w > maxW) { x = 0; y += rowH; rowH = 0; }
      at[c.name] = { x, y, w, h, bx: c.bb.x - pad, by: c.bb.y - pad };
      html += `<g transform="translate(${x - c.bb.x + pad} ${y - c.bb.y + pad})">${c.html}</g>`;
      x += w; rowH = Math.max(rowH, h); W = Math.max(W, x);
    }
    const img = await rasterize(html, { x: 0, y: 0, w: W, h: y + rowH }, Math.min(3, ks));
    const k = Math.min(3, ks);
    for (const n in at) { const a = at[n]; a.sx = a.x * k; a.sy = a.y * k; a.sw = a.w * k; a.sh = a.h * k; }
    return { meta, img, at, front, side, shadowRx: +(shadow?.getAttribute('rx') || 30) };
  })();
  cache.set(key, job);
  if (cache.size > 40) cache.delete(cache.keys().next().value);
  return job;
}

export function drawCell(ctx, rig, name) {
  const a = rig.at[name];
  if (a) ctx.drawImage(rig.img, a.sx, a.sy, a.sw, a.sh, a.bx, a.by, a.w, a.h);
}
