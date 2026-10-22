// Ses motoru: Web Audio ile sentezlenen müzik, efektler ve yağmur. Hiç ses dosyası yok.
// Tarayıcılar ilk dokunuştan önce ses çalmaya izin vermez: unlock() ilk etkileşimde çağrılır.
import { composeBar, midiToHz, TEMPO, BEATS_PER_BAR, THEMES } from './compose.js';
import { persist, SAVE_KEYS } from '../core/native.js';

const SET_KEY = SAVE_KEYS[1];
export const settings = Object.assign({ music: true, sfx: true, theme: 'akustik' }, (() => {
  try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; } catch (e) { return {}; }
})());
export function saveSettings() {
  const j = JSON.stringify(settings);
  try { localStorage.setItem(SET_KEY, j); } catch (e) { /* yok */ }
  persist(SET_KEY, j);
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
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
}

export function applySettings() {
  saveSettings();
  if (!ctx) return;
  const t = ctx.currentTime;
  musicBus.gain.setTargetAtTime(settings.music ? 0.55 : 0, t, 0.3);
  sfxBus.gain.setTargetAtTime(settings.sfx ? 0.9 : 0, t, 0.05);
  ambBus.gain.setTargetAtTime(settings.sfx ? 0.5 : 0, t, 0.3);
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

export const audioReady = () => !!ctx;
export const stopAudio = () => { clearInterval(timer); ctx?.close(); ctx = null; };
