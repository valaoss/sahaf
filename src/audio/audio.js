// Ses motoru: Web Audio ile sentezlenen müzik, efektler, yağmur ve ortam sesleri (dalga, martı, rüzgâr, kalabalık). Hiç ses dosyası yok.
// Tarayıcılar ilk dokunuştan önce ses çalmaya izin vermez: unlock() ilk etkileşimde çağrılır.
import { composeBar, midiToHz, TEMPO, BEATS_PER_BAR, THEMES } from './compose.js';
import { persist, SAVE_KEYS } from '../core/native.js';

const SET_KEY = SAVE_KEYS[1];
export const settings = Object.assign({ music: true, sfx: true, theme: 'akustik', hints: true, textScale: 1, paint: true }, (() => {
  try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; } catch (e) { return {}; }
})());
export function saveSettings() {
  const j = JSON.stringify(settings);
  try { localStorage.setItem(SET_KEY, j); } catch (e) { /* yok */ }
  return persist(SET_KEY, j);
}

let ctx = null, master, musicBus, sfxBus, ambBus, noiseBuf, verb;
let season = 'İlkbahar', rainOn = false, rainNode = null;
let mood = { town: null, lively: false, night: false };
let nextBarTime = 0, bar = 0, timer = 0;

function makeNoise() {
  const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// kısa, yumuşak yankı (oda hissi)
function makeVerb() {
  const len = ctx.sampleRate * 1.6, b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const conv = ctx.createConvolver();
  conv.buffer = b;
  const wet = ctx.createGain(); wet.gain.value = 0.22;
  conv.connect(wet).connect(master);
  return conv;
}

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended' || ctx.state === 'interrupted') ctx.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
  verb = makeVerb();
  musicBus = ctx.createGain(); musicBus.gain.value = settings.music ? 0.55 : 0; musicBus.connect(master); musicBus.connect(verb);
  sfxBus = ctx.createGain(); sfxBus.gain.value = settings.sfx ? 0.9 : 0; sfxBus.connect(master); sfxBus.connect(verb);
  ambBus = ctx.createGain(); ambBus.gain.value = settings.sfx ? 0.5 : 0; ambBus.connect(master);
  noiseBuf = makeNoise();
  nextBarTime = ctx.currentTime + 0.2;
  timer = setInterval(schedule, 120);
  if (rainOn) startRain();
  startBeds();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ctx.suspend(); else ctx.resume().catch(() => {});
  });
}

export function applySettings() {
  const saved = saveSettings();
  if (!ctx) return saved;
  const t = ctx.currentTime;
  musicBus.gain.setTargetAtTime(settings.music ? 0.55 : 0, t, 0.3);
  sfxBus.gain.setTargetAtTime(settings.sfx ? 0.9 : 0, t, 0.05);
  ambBus.gain.setTargetAtTime(settings.sfx ? 0.5 : 0, t, 0.3);
  return saved;
}

export function setSeason(s) { season = s; }
// kasaba motifi, festival canlılığı, akşam yumuşaklığı
export function setMood(m) { Object.assign(mood, m); }

// --- çalgılar ---
function env(g, t, a, peak, d, end = 0.0001) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(end, t + a + d);
}

function pluck(bus, hz, t, dur, vel) {
  const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = 'triangle'; o.frequency.value = hz;
  o2.type = 'sine'; o2.frequency.value = hz * 2.001;
  f.type = 'lowpass'; f.frequency.setValueAtTime(hz * 6, t); f.frequency.exponentialRampToValueAtTime(hz * 1.5, t + dur);
  const g2 = ctx.createGain(); g2.gain.value = 0.25;
  o.connect(f); o2.connect(g2).connect(f); f.connect(g).connect(bus);
  env(g, t, 0.005, 0.22 * vel, dur);
  o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}

function bass(bus, hz, t, dur, vel) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = hz;
  o.connect(g).connect(bus);
  env(g, t, 0.02, 0.32 * vel, dur * 0.9);
  o.start(t); o.stop(t + dur + 0.05);
}

function pad(bus, hz, t, dur, vel) {
  const f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = 'lowpass'; f.frequency.value = 900;
  for (const det of [-6, 6]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = hz; o.detune.value = det;
    o.connect(f); o.start(t); o.stop(t + dur + 0.1);
  }
  f.connect(g).connect(bus);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.035 * vel, t + dur * 0.35);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
}

function bell(bus, hz, t, dur, vel) {
  for (const [mul, v] of [[1, 1], [2.76, 0.3], [5.4, 0.12]]) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = hz * mul;
    o.connect(g).connect(bus);
    env(g, t, 0.004, 0.12 * vel * v, dur * (1.6 / mul));
    o.start(t); o.stop(t + dur * 1.7);
  }
}

const INST = { pluck, bass, pad, bell };

// Müzik zamanlayıcı: yarım saniye ileriyi planlar
function schedule() {
  if (!ctx || ctx.state !== 'running') return;
  const beat = 60 / (TEMPO[season] + (THEMES[settings.theme]?.tempo || 0) + (mood.lively ? 6 : 0) - (mood.night ? 4 : 0));
  while (nextBarTime < ctx.currentTime + 0.5) {
    ambTick();
    if (settings.music) {
      for (const n of composeBar(bar, season, { ...mood, theme: settings.theme })) INST[n.inst](musicBus, midiToHz(n.midi), nextBarTime + n.t * beat, n.dur * beat, n.vel);
    }
    nextBarTime += BEATS_PER_BAR * beat;
    bar++;
  }
}

// --- efektler ---
function noiseBurst(bus, t, dur, freq, q, vol) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf;
  f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  s.connect(f).connect(g).connect(bus);
  env(g, t, 0.01, vol, dur);
  s.start(t, Math.random()); s.stop(t + dur + 0.05);
  return f;
}

const SFX = {
  tap: t => pluck(sfxBus, midiToHz(84), t, 0.12, 0.5),
  coin: t => { bell(sfxBus, midiToHz(88), t, 0.5, 0.9); bell(sfxBus, midiToHz(95), t + 0.07, 0.6, 0.8); },
  heart: t => [76, 79, 83, 88].forEach((m, i) => bell(sfxBus, midiToHz(m), t + i * 0.09, 0.9, 0.8)),
  sad: t => { pluck(sfxBus, midiToHz(64), t, 0.4, 0.6); pluck(sfxBus, midiToHz(61), t + 0.16, 0.5, 0.5); },
  page: t => { const f = noiseBurst(sfxBus, t, 0.28, 2500, 0.8, 0.25); f.frequency.exponentialRampToValueAtTime(5000, t + 0.25); },
  box: t => { noiseBurst(sfxBus, t, 0.12, 300, 1.2, 0.5); bass(sfxBus, 70, t, 0.15, 0.8); },
  bell: t => [79, 84].forEach((m, i) => bell(sfxBus, midiToHz(m), t + i * 0.18, 1.4, 1)),
  letter: t => [72, 76, 79, 84, 88].forEach((m, i) => bell(sfxBus, midiToHz(m), t + i * 0.08, 1.1, 0.7)),
  hap: t => { pluck(sfxBus, midiToHz(79), t, 0.3, 0.7); pluck(sfxBus, midiToHz(86), t + 0.12, 0.5, 0.7); },
  whoosh: t => { const f = noiseBurst(sfxBus, t, 0.7, 400, 0.6, 0.35); f.frequency.exponentialRampToValueAtTime(1800, t + 0.6); },
};

export function sfx(name) {
  if (!ctx || !settings.sfx || ctx.state !== 'running' || !SFX[name]) return;
  SFX[name](ctx.currentTime + 0.01);
}

// --- ortam: yağmur ---
function startRain() {
  if (rainNode || !ctx) return;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true;
  f.type = 'lowpass'; f.frequency.value = 1400;
  g.gain.value = 0;
  s.connect(f).connect(g).connect(ambBus);
  s.start();
  g.gain.setTargetAtTime(0.18, ctx.currentTime, 1.2);
  rainNode = { s, g };
}

function stopRain() {
  if (!rainNode) return;
  const { s, g } = rainNode;
  g.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
  s.stop(ctx.currentTime + 4);
  rainNode = null;
}

export function setRain(on) {
  rainOn = on;
  if (!ctx) return;
  on ? startRain() : stopRain();
}

// --- ortam: sürekli katmanlar + ara sıra olaylar ---
// scene: sahil | carsi | tepe · weather: gunesli | bulutlu | yagmurlu | ruzgarli · crowd: sahnedeki kişi sayısı · night: akşam
const amb = { scene: 'sahil', weather: 'gunesli', crowd: 0, night: false };
let beds = null, ambNext = 0;

// döngüdeki gürültüyü süzgeçten geçirip bir kazanca bağlar; lfo verilirse kazanç yavaşça kabarıp iner
function bed(type, freq, q, lfoHz = 0, lfoDepth = 0) {
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), out = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = 0.5 + Math.random() * 0.2;
  fl.type = type; fl.frequency.value = freq; fl.Q.value = q;
  g.gain.value = 0; out.gain.value = 0;
  s.connect(fl).connect(g).connect(out).connect(ambBus);
  if (lfoHz) {
    const lfo = ctx.createOscillator(), d = ctx.createGain();
    lfo.frequency.value = lfoHz; d.gain.value = lfoDepth;
    lfo.connect(d).connect(g.gain); lfo.start();
  }
  s.start(0, Math.random() * 1.5);
  return { fl, g, out };
}

function startBeds() {
  if (beds || !ctx) return;
  beds = {
    waves: bed('lowpass', 520, 0.7, 0.085, 0.5),    // dalga: yavaş kabaran alçak uğultu
    wind: bed('bandpass', 700, 0.8, 0.13, 0.5),     // rüzgâr: ıslığa yakın, dalgalanan
    murmur: bed('bandpass', 420, 1.6, 0.6, 0.35),   // kalabalık mırıltısı: konuşma bandı
  };
  for (const b of Object.values(beds)) b.g.gain.value = 0.5;
  applyAmbience();
}

function applyAmbience() {
  if (!beds) return;
  const t = ctx.currentTime, sea = amb.scene === 'sahil', windy = amb.weather === 'ruzgarli';
  beds.waves.out.gain.setTargetAtTime(sea ? 0.32 : amb.scene === 'tepe' ? 0 : 0.06, t, 1.5);
  beds.wind.out.gain.setTargetAtTime(windy ? 0.3 : amb.scene === 'tepe' ? 0.09 : 0.03, t, 1.5);
  // kalabalık: kişi sayısıyla artar, çarşıda daha yüksek
  const n = Math.min(amb.crowd, 6) / 6;
  beds.murmur.out.gain.setTargetAtTime(n * (amb.scene === 'carsi' ? 0.22 : 0.13), t, 0.8);
}

// martı: testere dalgası + bant süzgeç, perdesi yükselip kırılarak düşer
function gull(t) {
  const calls = 1 + Math.floor(Math.random() * 3), base = 1500 + Math.random() * 500;
  for (let i = 0; i < calls; i++) {
    const s = t + i * (0.22 + Math.random() * 0.08), o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(base * 0.8, s);
    o.frequency.linearRampToValueAtTime(base * 1.15, s + 0.05);
    o.frequency.exponentialRampToValueAtTime(base * 0.62, s + 0.2);
    fl.type = 'bandpass'; fl.frequency.value = base * 1.3; fl.Q.value = 2.5;
    o.connect(fl).connect(g).connect(ambBus);
    env(g, s, 0.02, 0.05, 0.2);
    o.start(s); o.stop(s + 0.3);
  }
}

// küçük kuş cıvıltısı (tepede ve çarşıda)
function chirp(t) {
  const n = 2 + Math.floor(Math.random() * 4), hz = 3000 + Math.random() * 1500;
  for (let i = 0; i < n; i++) {
    const s = t + i * 0.09, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(hz, s); o.frequency.exponentialRampToValueAtTime(hz * 1.35, s + 0.05);
    o.connect(g).connect(ambBus);
    env(g, s, 0.005, 0.03, 0.06);
    o.start(s); o.stop(s + 0.1);
  }
}

// cırcır böceği (akşam): hızlı titreşen yüksek ton
function cricket(t) {
  for (let i = 0; i < 3; i++) {
    const s = t + i * 0.11, o = ctx.createOscillator(), am = ctx.createOscillator(), ag = ctx.createGain(), g = ctx.createGain();
    o.frequency.value = 4400 + Math.random() * 200; am.frequency.value = 55; ag.gain.value = 0.5;
    am.connect(ag).connect(g.gain);
    o.connect(g).connect(ambBus);
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.012, s + 0.01); g.gain.linearRampToValueAtTime(0, s + 0.07);
    o.start(s); am.start(s); o.stop(s + 0.08); am.stop(s + 0.08);
  }
}

// zamanlayıcıdan çağrılır: ara sıra tek seferlik ortam sesleri
function ambTick() {
  if (!beds || !settings.sfx) return;
  const t = ctx.currentTime;
  if (t < ambNext) return;
  ambNext = t + 2.5 + Math.random() * 5;
  const rainy = amb.weather === 'yagmurlu';
  if (amb.night) { if (Math.random() < 0.8) cricket(t); return; }
  if (amb.scene === 'sahil' && !rainy && Math.random() < 0.55) gull(t);
  else if (amb.scene !== 'sahil' && !rainy && Math.random() < 0.6) chirp(t);
}

export function setAmbience(o) {
  let changed = false;
  for (const k in o) if (amb[k] !== o[k]) { amb[k] = o[k]; changed = true; }
  if (changed && ctx) applyAmbience();
}

export const audioReady = () => !!ctx;
export const stopAudio = () => { clearInterval(timer); ctx?.close(); ctx = null; };
