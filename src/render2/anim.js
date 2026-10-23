// style.css'teki sahne animasyonlarının canvas karşılıkları. Her biri, parçanın kendi kutusu (bb) içinde
// bir dönüşüm ve saydamlık verir; çizim sırasında sahne matrisinin (m) üstüne uygulanır.
const TAU = Math.PI * 2;
const wave = f => 0.5 - 0.5 * Math.cos(TAU * f);          // 0→1→0, yumuşak (ease-in-out benzeri)
const frac = x => x - Math.floor(x);
const deg = d => d * Math.PI / 180;

// dönüş/ölçek merkezi: kutunun oransal noktası (CSS transform-origin karşılığı)
const at = (bb, fx, fy) => [bb.x + bb.width * fx, bb.y + bb.height * fy];

// opts: { windy, lit }. Dönüş: { tx, ty, rot, sx, sy, kx, o: [ox, oy], alpha, x } — x: tam ekran kayması (drift)
export function pose(a, t, opts) {
  const has = c => a.cls.includes(c);
  const d = a.delay, bb = a.bb;
  const P = { tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, kx: 0, o: at(bb, .5, .5), alpha: 1 };
  if (has('drift')) {
    const dur = opts.windy ? 18 : has('slow') ? 95 : 60;
    P.tx = -300 + 2200 * frac((t - d) / dur);
  } else if (has('twinkle')) {
    P.alpha = .15 + .85 * wave((t - d) / 2.4);
  } else if (has('bob') || has('flutter-slow')) {
    const f = wave((t - d) / (has('flutter-slow') ? 5 : 3.2));
    P.ty = -6 * f; P.rot = deg(-2 + 4 * f);
  } else if (has('sway') || has('flutter')) {
    const f = wave((t - d) / (has('flutter') ? 2.2 : opts.windy ? 1.6 : 4));
    P.rot = deg(-2 + 4 * f);
    P.o = has('flutter') ? at(bb, 1, 0) : at(bb, .5, 1);
  } else if (has('tail')) {
    P.rot = deg(-8 + 22 * wave((t - d) / 2.6));
    P.o = at(bb, 0, 1);
  } else if (has('zzz')) {
    const start = has('d2') ? 1 : has('d3') ? 2 : 0;
    if (t < start) { P.alpha = 0; return P; }
    const f = frac((t - start) / 3), e = f * f;                // ease-in
    P.alpha = f < .3 ? f / .3 : 1 - (f - .3) / .7;
    P.tx = 18 * e; P.ty = -50 * e; P.sx = P.sy = .6 + .5 * e;
  } else if (has('breathe')) {
    P.sy = 1 + .04 * wave((t - d) / 3.5);
    P.o = at(bb, .5, 1);
  } else if (has('spin')) {
    P.rot = TAU * frac((t - d) / (has('slow') ? 9 : 3));
  } else if (has('flicker')) {
    const f = Math.abs(frac((t - d) / 1.8) * 2 - 1);           // .9 sn ileri, .9 sn geri
    P.sx = 1 - .1 * f; P.sy = 1 + .12 * f;
    P.o = at(bb, .5, 1);
  } else if (has('steam')) {
    const f = frac((t - d) / 2.4);
    P.alpha = f < .4 ? .7 * f / .4 : .7 * (1 - (f - .4) / .6);
    P.ty = 4 - 18 * f;
  } else if (has('awning')) {
    // rüzgârda tente dalgalanır, sakin havada durur; dükkân kapalıyken sarılı (opts.awn)
    P.o = at(bb, .5, 0);
    const awn = opts.awn ?? 1;
    P.sy = .14 + .86 * awn;
    if (opts.windy) {
      const f = frac(t / 2.6), g = f < .5 ? f * 2 : 2 - f * 2;
      P.kx = deg(g < .4 ? -3 * g / .4 : -3 + 5 * (g - .4) / .6);
      P.sy *= g < .4 ? 1 - .06 * g / .4 : .94 + .09 * (g - .4) / .6;
    }
  }
  return P;
}

// parçayı çiz: sahne matrisi → hareket → kutu
export function drawAnim(ctx, a, t, opts) {
  const P = pose(a, t, opts);
  if (P.alpha <= 0.01) return;
  const m = a.m, c = a.cell;
  ctx.save();
  if (P.tx && a.cls.includes('drift')) ctx.translate(P.tx, 0);
  ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  const [ox, oy] = P.o;
  ctx.translate(ox + (a.cls.includes('drift') ? 0 : P.tx), oy + P.ty);
  if (P.rot) ctx.rotate(P.rot);
  if (P.kx) ctx.transform(1, 0, Math.tan(P.kx), 1, 0, 0);
  if (P.sx !== 1 || P.sy !== 1) ctx.scale(P.sx, P.sy);
  ctx.translate(-ox, -oy);
  if (P.alpha < 1) ctx.globalAlpha *= P.alpha;
  ctx.drawImage(a.img, a.sx, a.sy, a.sw, a.sh, a.bb.x - c.pad, a.bb.y - c.pad, c.w, c.h);
  ctx.restore();
}
