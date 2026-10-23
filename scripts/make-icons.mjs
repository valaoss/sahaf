// Uygulama simgesi ve açılış görseli: resources/icon.svg'den başsız Chrome ile PNG üretir (ek paket gerekmez).
// Çıktılar: resources/icon-1024.png (App Store / Xcode tek boy simge), resources/splash-2732.png (açılış ekranı),
// public/apple-touch-icon.png (web: ana ekrana ekle). Kullanım: npm run icons  (Chrome yolu: CHROME ortam değişkeni)
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const svg = readFileSync(new URL('../resources/icon.svg', import.meta.url), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const port = 9500 + Math.floor(Math.random() * 300);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.TEMP || '/tmp'}/sahaf-icons-${port}`, 'about:blank'], { stdio: 'ignore' });
let ws;
for (let i = 0; i < 60 && !ws; i++) { await sleep(250); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const p = l.find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} }
await new Promise(r => ws.onopen = r);
let id = 0; const wait = new Map(); ws.onmessage = m => { const d = JSON.parse(m.data); wait.get(d.id)?.(d); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

async function shot(file, size, html) {
  await send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') });
  await sleep(700);
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
  writeFileSync(new URL(file, import.meta.url), Buffer.from(r.result.data, 'base64'));
  console.log('yazıldı', file);
}
const page = (size, inner) => `<html><body style="margin:0;width:${size}px;height:${size}px;overflow:hidden">${inner}</body></html>`;
mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
await shot('../resources/icon-1024.png', 1024, page(1024, svg));
// açılış: krem zemin ortasında simge (iOS ekrana göre kırpar)
await shot('../resources/splash-2732.png', 2732, page(2732, `<div style="width:2732px;height:2732px;background:#fbeed7;display:flex;align-items:center;justify-content:center">
  <div style="width:720px;height:720px;border-radius:160px;overflow:hidden;box-shadow:0 30px 60px rgba(74,58,51,.18)">${svg.replace('width="1024" height="1024"', 'width="720" height="720"')}</div></div>`));
await shot('../public/apple-touch-icon.png', 180, page(180, svg.replace('width="1024" height="1024"', 'width="180" height="180"')));
ws.close(); chrome.kill(); process.exit(0);
