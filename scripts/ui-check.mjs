// Arayüz duman testi: kendi Vite sunucusunu açar, bütün önizleme panellerini (?sahne=1&panel=…) başsız Chrome'da
// Türkçe ve İngilizce açar. Her panelde sayfa hatası, boş panel ve (İngilizcede) "çeviri yok" uyarısı aranır.
// Kullanım: npm run ui-check · Chrome yolu: CHROME ortam değişkeni ya da bilinen yerler (Windows, Linux, macOS)
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

const PANELS = ['', 'stock', 'spot', 'decor', 'oneri', 'konus', 'ic', 'istatistik', 'harita&acik', 'pasaport', 'olay', 'posta', 'kostas',
  'album', 'finale', 'book', 'musteriler', 'rec&kim=hasan&rica', 'bag', 'bag&ac=stockPanel', 'bag&ac=decorPanel', 'bag&ac=paperPanel',
  'gift&hatira', 'akdeniz&ulke=it', 'akdeniz&ulke=fr', 'akdeniz&ulke=es', 'akdeniz&ulke=eg', 'akdeniz&ulke=gr&ac=voyagePanel', 'toren',
  'settings', 'koleksiyoncu', 'pazarlik', 'pazarlik&kim=koleksiyoncu', 'pazarlik&kim=emekli&tanidik', 'atolye', 'stock&mezat', 'decor&gelistir=3'];
const LANGS = process.env.UI_LANGS?.split(',') || ['tr', 'en'];
const ONLY = process.env.UI_PANELS?.split(',');
const WAIT = +(process.env.UI_WAIT || 800);

const CHROMES = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const chromePath = CHROMES.find(p => existsSync(p));
if (!chromePath) { console.error('Chrome bulunamadı; CHROME ortam değişkeniyle yolunu ver.'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const server = await createServer({ logLevel: 'error', server: { port: 5390, strictPort: false, host: '127.0.0.1' } });
await server.listen();
const base = `http://127.0.0.1:${server.httpServer.address().port}/`;

const profile = mkdtempSync(join(tmpdir(), 'sahaf-ui-'));
// Chrome açılışı CI makinesinde bazen yavaş: her denemede 45 sn beklenir, en fazla üç kez yeniden başlatılır
let chrome = null;
async function launch() {
  for (let attempt = 0; attempt < 3; attempt++) {
    const port = 9300 + Math.floor(Math.random() * 400);
    chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--mute-audio',
      `--remote-debugging-port=${port}`, `--user-data-dir=${join(profile, "a" + attempt)}`, 'about:blank'], { stdio: 'ignore' });
    for (let i = 0; i < 180; i++) {
      await sleep(250);
      try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) return new WebSocket(p.webSocketDebuggerUrl); } catch {}
    }
    console.log(`Chrome ${attempt + 1}. denemede açılmadı, yeniden başlatılıyor`);
    chrome.kill();
  }
  return null;
}
let failed = 0, checked = 0;
try {
  const ws = await launch();
  if (!ws) throw new Error('Chrome hata ayıklama bağlantısı açılmadı');
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
  let id = 0;
  const wait = new Map(), errs = [], warns = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] || d.params.exceptionDetails.text);
    if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') errs.push(d.params.entry.text);
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'warning' && d.params.args[0]?.value === 'çeviri yok:') warns.push(d.params.args[1]?.value);
    wait.get(d.id)?.(d);
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  for (const lang of LANGS) {
    await send('Page.navigate', { url: base });
    await sleep(WAIT);
    await send('Runtime.evaluate', { expression: `localStorage.setItem('sahaf.lang', '${lang}')` });
    for (const p of PANELS.filter(x => !ONLY || ONLY.includes(x))) {
      errs.length = 0; warns.length = 0;
      await send('Page.navigate', { url: `${base}?sahne=1${p ? '&panel=' + p : ''}` });
      // panel metni belirene kadar bekle (İngilizce sözlük açılışta yüklenir), sonra geç gelen hatalar için biraz daha
      let text = '';
      for (let t = 0; t < 40 && !text; t++) {
        await sleep(250);
        const r = await send('Runtime.evaluate', { returnByValue: true, expression:
          `(document.querySelector('.veil.open .panel')?.textContent || document.querySelector('.stage-shelf')?.textContent || document.getElementById('bottom')?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60)` });
        text = r.result?.result?.value || '';
      }
      await sleep(WAIT);
      const problems = [...errs.map(e => 'hata: ' + e), ...(text ? [] : ['boş panel']), ...[...new Set(warns)].map(k => 'çeviri yok: ' + k)];
      checked++;
      if (problems.length) failed++;
      console.log(`${problems.length ? '✗' : '✓'} ${lang} ${p || '(ana)'} | ${text}${problems.length ? '\n    ' + problems.join('\n    ') : ''}`);
    }
  }
  ws.close();
} catch (e) {
  console.error(e);
  failed++;
} finally {
  chrome?.kill();
  await server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
console.log(failed ? `${failed} panel sorunlu` : `arayüz temiz: ${checked} panel`);
process.exit(failed ? 1 : 0);
