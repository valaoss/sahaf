// Canvas sahne motoru (Faz 1). SVG sahnesi (render/scene.js) gizli kaynak olarak durur: oyun durumu oraya yazılır,
// motor değişen derinlik bantlarını bitmap'e pişirir ve her karede yalnızca resimleri ve hareketli parçaları çizer.
// Arayüzü buildScene ile aynıdır (setTown, setSpot, setStock…); ek olarak tick(dt), toClient, onCart, crowdView.
import { buildScene, SEASON_LOOK, lightPoints } from '../render/scene.js';
import { loadFonts, snapshotBand } from './bake.js';
import { drawAnim } from './anim.js';
import { canvasCrowdView } from './crowd-view.js';
import { createLife } from './life.js';
import { createAtmos } from './atmos.js';
import { TOWNS } from '../data/towns.js';

// bantlar (sahne birimi): üstten alta; her biri bir resim + hareketli parçaları
const BANDS = {
  bandSky: { x: 0, y: 0, w: 1600, h: 562, maxScale: 1 },
  bandF: { x: 0, y: 118, w: 1600, h: 392 },
  bandH: { x: 0, y: 150, w: 1600, h: 472 },
  bandG: { x: 0, y: 330, w: 1600, h: 570 },
};
const CART = { x: 620, y: 420, w: 430, h: 350 };     // karavana dokunma alanı (sahne birimi)
// raftaki ve masadaki kitaplar ayrı, küçük bir bantta: her satışta yalnız bu bant yeniden pişer (zemin bandı değil)
const STOCK = { x: 370, y: 500, w: 660, h: 230 };
// dikey ekran: sahnenin bu genişliği (masa, karavan, kedi) ekrana sığar; (TALL_CX, TALL_CY) ekranın ortasına gelir
const TALL_W = 820, TALL_CX = 800, TALL_CY = 600;
// zemin uzantısı: sahnenin altındaki bu şerit aynalanarak aşağı döşenir
const STRIP = 70;

function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// kâğıt lifi: bir kez üretilen gürültü dokusu
function grainTile() {
  const c = document.createElement('canvas'); c.width = c.height = 192;
  const g = c.getContext('2d'), d = g.createImageData(192, 192);
  for (let i = 0; i < d.data.length; i += 4) { d.data[i] = 82; d.data[i + 1] = 64; d.data[i + 2] = 51; d.data[i + 3] = Math.random() * 22; }
  g.putImageData(d, 0, 0);
  return c;
}

export function buildScene2(host) {
  const base = buildScene(host);
  host.classList.add('motor2');
  host.parentElement?.classList.add('m2');
  const svg = base.svg;
  // stok bandı: raftaki kitaplar (ve üstlerindeki gölge) ile masadaki kitaplar, karavan ve masanın konumlarıyla birlikte
  // ayrı bir gruba taşınır. SVG motor2'de görünmez; yalnız pişirme kaynağıdır.
  {
    const NS = 'http://www.w3.org/2000/svg', shelves = svg.querySelector('#shelves'), table = svg.querySelector('#tableBooks');
    const shade = shelves.nextElementSibling;
    const g = document.createElementNS(NS, 'g'); g.id = 'bandStock';
    const a = document.createElementNS(NS, 'g'); a.setAttribute('transform', 'translate(610 420)'); a.append(shelves, shade);
    const b = document.createElementNS(NS, 'g'); b.setAttribute('transform', 'translate(390 610)'); b.append(table);
    g.append(a, b);
    svg.querySelector('#bandG').after(g);
  }
  const canvas = document.createElement('canvas');
  canvas.className = 'stage2';
  host.prepend(canvas);
  const ctx = canvas.getContext('2d');
  // tam ekran örtüler canvas dışında, GPU'nun birleştirdiği sabit katmanlar: her karede boyanmazlar
  const over = document.createElement('div');
  over.className = 'over2';
  over.innerHTML = '<i class="tint" data-k="season"></i><i class="tint" data-k="weather"></i><i class="vig"></i><i class="grain"></i><i class="tint" data-k="dusk"></i>';
  const glowCanvas = document.createElement('canvas');
  glowCanvas.className = 'stage2 glow2';
  host.append(over, glowCanvas);
  const gctx = glowCanvas.getContext('2d');
  const tints = {};
  over.querySelectorAll('[data-k]').forEach(n => { tints[n.dataset.k] = { n, v: '' }; });
  const tint = (key, color, op) => {
    const T = tints[key], v = op > 0.004 ? color + op.toFixed(3) : '';
    if (T.v === v) return;
    T.v = v;
    T.n.style.background = color;
    T.n.style.opacity = v ? op.toFixed(3) : '0';
  };
  let glowOn = false;

  // ekran eşlemesi: svg'deki "xMidYMid slice" ile aynı
  let W = 1, H = 1, dpr = 1, k = 1, ox = 0, oy = 0, bakeScale = 1, tall = false;
  const BOX = { ...BANDS, bandStock: STOCK };
  const bands = {}, dirty = new Set(Object.keys(BOX));
  let baking = false, ready = null, t = 0;
  const st = { windy: false, weather: 'gunesli', season: 'İlkbahar', day: 0, paint: true, festival: false, town: 'ayvalik', scene: 'sahil', open: false, openAt: -9 };
  // kamera: z yakınlık, (fx, fy) odak; hedefe doğru yumuşakça akar
  const cam = { z: 1, fx: 830, fy: 600, tz: 1, tfx: 830, tfy: 600 };
  const view = () => { const s = k * cam.z; return { s, tx: ox + (1 - cam.z) * cam.fx * k, ty: oy + (1 - cam.z) * cam.fy * k }; };
  const toScene = (cx, cy) => { const r = canvas.getBoundingClientRect(), v = view(); return { x: (cx - r.left - v.tx) / v.s, y: (cy - r.top - v.ty) / v.s }; };
  const atmos = createAtmos();
  const crowd = canvasCrowdView(() => bakeScale);
  const life = createLife();
  const grainEl = over.querySelector('.grain');
  grainEl.style.backgroundImage = `url(${grainTile().toDataURL()})`;
  const lights = lightPoints();

  function aim(kind) {
    cam.kind = kind;
    if (kind === 'shelf') {
      // dikeyde: raf penceresi, ön tezgâh ve altındaki koli sığar. Yatayda koli karavanın sağında durur (ui/shelf-stage.js .side),
      // bu yüzden kamera daha çok yaklaşır: pencere + tezgâh (546–756) ve yanındaki koli (1032–1228)
      const z = tall ? Math.max(1.02, Math.min(2.3, (W / k) / 370))
        : Math.max(1.02, Math.min(2.6, (W / k) / 640, (H / k) / 290));
      const cx = tall ? 835 : 945, cy = tall ? 720 : 640;
      // yakınlaşma noktası p öyle seçilir ki C ekranın ortasına gelsin: c0 = p + (C - p)·z → p = (c0 - C·z) / (1 - z)
      // c0: yakınlaşmasız kamerada ekranın ortasındaki sahne noktası
      const c0x = (W / 2 - ox) / k, c0y = (H / 2 - oy) / k;
      Object.assign(cam, { tz: z, tfx: (c0x - cx * z) / (1 - z), tfy: (c0y - cy * z) / (1 - z) });
    } else if (kind === 'cart') Object.assign(cam, { tz: 1.32, tfx: 835, tfy: 560 });
    else Object.assign(cam, { tz: 1, tfx: 830, tfy: 600 });
  }

  function fit() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = glowCanvas.width = Math.round(W * dpr); canvas.height = glowCanvas.height = Math.round(H * dpr);
    tall = H > W;
    if (tall) {
      // dikey: sahne genişliğe göre ölçeklenir; gök yukarı, zemin aşağı uzar (frame() uzantıları çizer)
      k = W / TALL_W; ox = W / 2 - TALL_CX * k; oy = H / 2 - TALL_CY * k;
      // ipucu ve konuşmalar karavanın önündeki zeminin altına yerleşir (style.css --sb)
      host.parentElement?.style.setProperty('--sb', (oy + 830 * k).toFixed(0) + 'px');
    } else {
      // yatay: ekranı kaplar; geniş ekranda fazlası gökten kırpılır (karavan ve müşteriler düğmelerin üstünde kalsın)
      k = Math.max(W / 1600, H / 900); ox = (W - 1600 * k) / 2;
      const spare = H - 900 * k;
      oy = spare < 0 ? spare : spare / 2;
      host.parentElement?.style.removeProperty('--sb');
    }
    grainEl.style.backgroundSize = `${(192 * k).toFixed(1)}px`;
    const s = Math.min(2, dpr * k);
    if (Math.abs(s - bakeScale) / bakeScale > .12) { bakeScale = s; for (const b in BOX) dirty.add(b); schedule(); }
    // ekran boyutu değişince odak yeniden hesaplanır (dikeyde raf modu sahneyi büyütür)
    if (cam.kind) { const snapped = Math.abs(cam.z - cam.tz) < 1e-3; aim(cam.kind); if (snapped) Object.assign(cam, { z: cam.tz, fx: cam.tfx, fy: cam.tfy }); }
  }

  // kopyada CSS'e bağlı görünüşleri sabitle
  const fixer = night => clone => {
    clone.querySelectorAll('.win').forEach(n => n.setAttribute('fill', night ? '#ffe08a' : '#9cc7e0'));
    clone.querySelectorAll('.paintable').forEach(n => { if (st.paint) n.setAttribute('filter', 'url(#watercolor)'); });
    if (!st.paint) clone.querySelectorAll('.paintfx').forEach(n => n.remove());
    clone.querySelectorAll('#lights, #cartHit, #ambientBack, #ambientFront').forEach(n => n.remove());
    clone.querySelectorAll('[fill="url(#sky)"], [fill="url(#sunGlow)"], circle[fill="#fff0bd"]').forEach(n => n.remove());
  };

  async function bakeAll() {
    if (baking) return;
    baking = true;
    await loadFonts();
    try {
      while (dirty.size) {
        const id = [...dirty][0];
        dirty.delete(id);
        const box = BOX[id], sc = Math.min(bakeScale, box.maxScale || 9);
        const day = await snapshotBand(svg, id, box, sc, fixer(false));
        // evler görünüyorsa akşam için pencereleri yanık ikinci bir kopya
        const housesOn = id === 'bandH' && svg.querySelector('#houses').style.display !== 'none';
        day.night = housesOn ? (await snapshotBand(svg, id, box, sc, fixer(true))).img : null;
        bands[id] = day;
      }
    } finally { baking = false; }
  }
  function schedule() {
    if (baking) { setTimeout(schedule, 30); return; }
    // ready: pişirme bitince true, başarısız olursa false (main.js basit görünüme geçer); hiçbir zaman askıda kalmaz
    ready = new Promise(res => setTimeout(() => bakeAll().then(() => res(true), e => { console.error('pişirme', e); res(false); }), 0));
  }

  // dokunma: önce öneri bekleyen kişi, sonra karavan
  let cartFn = null;
  canvas.addEventListener('click', e => {
    const { x, y } = toScene(e.clientX, e.clientY);
    const tap = crowd.hit(x, y);
    if (tap) return tap();
    if (cartFn && x > CART.x && x < CART.x + CART.w && y > CART.y && y < CART.y + CART.h) cartFn(e);
  });
  canvas.addEventListener('pointermove', e => {
    const { x, y } = toScene(e.clientX, e.clientY);
    canvas.style.cursor = crowd.hit(x, y) || (x > CART.x && x < CART.x + CART.w && y > CART.y && y < CART.y + CART.h) ? 'pointer' : '';
  });

  new ResizeObserver(fit).observe(host);
  fit();
  schedule();

  const drawBand = (id, opts) => {
    const b = bands[id];
    if (!b) return;
    ctx.drawImage(b.img, b.box.x, b.box.y, b.box.w, b.box.h);
    if (b.night && opts.night > 0) { ctx.globalAlpha = opts.night; ctx.drawImage(b.night, b.box.x, b.box.y, b.box.w, b.box.h); ctx.globalAlpha = 1; }
    for (const a of b.anims) drawAnim(ctx, a, t, opts);
  };

  // gün ışığı (render/scene.js setDaylight ile aynı eğri)
  function light(dt) {
    let color = '#3b2a5a', op = 0;
    if (dt < 0.15) { color = '#ff9fb8'; op = 0.07 * (1 - dt / 0.15); }
    else if (dt > 0.55 && dt <= 0.82) { color = '#ffb347'; op = 0.12 * (dt - 0.55) / 0.27; }
    else if (dt > 0.82) { const q = (dt - 0.82) / 0.18; color = mix('#ffb347', '#3b2a5a', q); op = 0.12 + 0.18 * q; }
    const night = Math.max(0, (dt - 0.78) / 0.22);
    return { color, op, night };
  }

  function frame(dt) {
    t += dt;
    life.update(dt, st);
    const L = light(st.day);
    // tente: dükkân açılınca yaylanarak açılır, kapanınca sarılır (0 sarılı, 1 açık)
    const since = t - st.openAt, spring = u => 1 - Math.exp(-6 * u) * Math.cos(9 * u);
    const awn = st.open ? Math.min(1, Math.max(0, spring(Math.max(0, since)))) : Math.max(0, 1 - since / .6);
    const opts = { windy: st.windy, night: Math.min(1, Math.max(0, (L.night - .2) / .25)), awn };
    const ease = Math.min(1, dt * 3);
    cam.z += (cam.tz - cam.z) * ease; cam.fx += (cam.tfx - cam.fx) * ease; cam.fy += (cam.tfy - cam.fy) * ease;
    const v = view();
    ctx.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.tx, dpr * v.ty);

    const rainy = st.weather === 'yagmurlu';
    atmos.sky(ctx, TOWNS[st.town], st.day, L.night, t);
    if (L.night < .95 && !rainy) atmos.sun(ctx, st.day);
    if (L.night > .4) atmos.moon(ctx, L.night);
    drawBand('bandSky', opts);
    drawBand('bandF', opts);
    atmos.seaFar(ctx, t, L.night);
    life.drawBack(ctx, t);
    drawBand('bandH', opts);
    if (st.scene === 'sahil') atmos.seaNear(ctx, t);
    // zemin: önce durağan resim, sonra raf ve masa kitapları, en üstte zeminin hareketlileri (tente, süsler)
    const G = bands.bandG;
    if (G) {
      ctx.drawImage(G.img, G.box.x, G.box.y, G.box.w, G.box.h);
      // dikey ekranda sahnenin altı: zeminin son şeridi aynalanarak döşenir (dikiş görünmez)
      const bottom = (H - v.ty) / v.s;
      if (bottom > 900) {
        const sy = (900 - STRIP - G.box.y) / G.box.h * G.img.height, sh = STRIP / G.box.h * G.img.height;
        for (let y = 900, i = 0; y < bottom; y += STRIP, i++) {
          if (i % 2) ctx.drawImage(G.img, 0, sy, G.img.width, sh, G.box.x, y, G.box.w, STRIP);
          else { ctx.save(); ctx.translate(0, 2 * y + STRIP); ctx.scale(1, -1); ctx.drawImage(G.img, 0, sy, G.img.width, sh, G.box.x, y, G.box.w, STRIP); ctx.restore(); }
        }
      }
    }
    drawBand('bandStock', opts);
    if (G) for (const a of G.anims) drawAnim(ctx, a, t, opts);
    if (!rainy) atmos.cloudShadows(ctx, t, st.windy);
    if (rainy) atmos.rainGround(ctx, t);
    // karavanın ışık zinciri: gündüz sönük, akşam yanıp söner
    ctx.save(); ctx.translate(610, 420);
    for (const p of lights) {
      // kapalıyken sönük; açılınca soldan sağa sırayla yanar
      const on = st.open ? Math.min(1, Math.max(0, (since - .3 - p.x / 600) * 5)) : Math.max(0, 1 - since * 2);
      ctx.globalAlpha = .18 + on * (opts.night > .3 ? .85 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (t - p.delay) / 1.8)) : .4);
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    life.drawFront(ctx, t);
    crowd.draw(ctx, t, dt, { lean: x => rainy ? 0 : atmos.shadowLean(x, st.day) });

    // yaprak ve yağmur canvas'ta; renk tonları, vinyet, kâğıt ve akşam örtülerde
    const P = SEASON_LOOK[st.season] || SEASON_LOOK['İlkbahar'];
    life.drawPetals(ctx, t, P.bits);
    if (st.windy) atmos.windLeaves(ctx, t);
    if (st.weather === 'yagmurlu') life.drawRain(ctx, t);
    tint('season', P.tint || '#000', P.tint ? .1 : 0);
    tint('weather', '#5a6b80', st.weather === 'yagmurlu' ? .22 : st.weather === 'bulutlu' ? .1 : 0);
    tint('dusk', L.color, L.op);
    grainEl.style.display = st.paint ? '' : 'none';
    // akşam ışıkları karartmanın üstünde parlar (ayrı canvas, yalnız akşam çizilir)
    if (L.night > 0) {
      glowOn = true;
      gctx.setTransform(1, 0, 0, 1, 0, 0);
      gctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
      gctx.setTransform(dpr * v.s, 0, 0, dpr * v.s, dpr * v.tx, dpr * v.ty);
      gctx.globalCompositeOperation = 'lighter';
      atmos.lightPools(gctx, L.night, crowd.lamps());
      gctx.translate(610, 420);
      const glow = 0.05 + L.night * 0.45;
      for (const p of lights) {
        const g = gctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26);
        g.addColorStop(0, p.c); g.addColorStop(1, 'rgba(0,0,0,0)');
        gctx.globalAlpha = glow; gctx.fillStyle = g; gctx.beginPath(); gctx.arc(p.x, p.y, 26, 0, Math.PI * 2); gctx.fill();
      }
    } else if (glowOn) {
      glowOn = false;
      gctx.setTransform(1, 0, 0, 1, 0, 0);
      gctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
    }
  }

  const rebake = (...ids) => { for (const id of ids) dirty.add(id); schedule(); };

  return {
    ...base,
    get ready() { return ready; },
    tick: frame,
    toClient(x, y) { const r = canvas.getBoundingClientRect(), v = view(); return { x: r.left + v.tx + x * v.s, y: r.top + v.ty + y * v.s }; },
    // dükkân açık/kapalı: tente ve ışıklar canlanır; ilk çağrıda (yükleme) animasyonsuz
    setOpen(open) {
      if (open === st.open) return;
      st.open = open; st.openAt = t > .5 ? t : -9;
      if (open && t > .5) { cam.z = 1.05; cam.tz = 1; }
    },
    // kamera odağı: 'cart' karavana yakınlaşır (raflar açıkken), null geri döner
    // kamera odağı: 'cart' karavana yakınlaşır (raf paneli), 'shelf' raf penceresine iner (karavanda dizme), null geri döner
    focus(kind) { aim(kind); },
    // kamerayı hedefine hemen oturt (önizleme ekran görüntüleri için)
    snap() { Object.assign(cam, { z: cam.tz, fx: cam.tfx, fy: cam.tfy }); },
    // sahne koordinatının ekrandaki yeri ve ölçeği (sahne üstü HTML katmanları için)
    screenMap() { const r = canvas.getBoundingClientRect(), v = view(); return { left: r.left + v.tx, top: r.top + v.ty, s: v.s }; },
    onCart(fn) { cartFn = fn; },
    crowdView: () => crowd,
    setTown(key) { base.setTown(key); st.town = key; rebake('bandSky', 'bandF', 'bandH'); },
    setSpot(scene, town) { base.setSpot(scene, town); st.scene = scene; rebake('bandH', 'bandG'); },
    setStock(S) { base.setStock(S); rebake('bandStock'); },
    setDecor(on) { base.setDecor(on); rebake('bandG'); },
    setUpgrades(list) { base.setUpgrades(list); rebake('bandG'); },
    setPaint(key) { base.setPaint(key); rebake('bandG'); },
    setSeason(name) { base.setSeason(name); st.season = name; rebake('bandG'); },
    setFestival(on) { base.setFestival(on); if (on !== st.festival) { st.festival = on; rebake('bandH'); } },
    setWeather(key) { base.setWeather(key); st.weather = key; st.windy = key === 'ruzgarli'; },
    setPaintFx(on) { base.setPaintFx(on); if (on !== st.paint) { st.paint = on; rebake('bandSky', 'bandF', 'bandH', 'bandG'); } },
    setDaylight(d) { st.day = d; },
    setDusk() {},
  };
}
