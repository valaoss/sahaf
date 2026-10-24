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
    if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error' && !/favicon/.test(d.params.entry.url || '')) errs.push(d.params.entry.text);
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
  // Raf etkileşimi: gerçek fare olaylarıyla depodan rafa, raftan depoya sürükle; kitaba dokunup fiyat kartında + bas
  if (!ONLY || ONLY.includes('raf')) {
    errs.length = 0;
    const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
    const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'mouse' });
    const dragFrom = async (a, b) => { await mouse('mousePressed', a.x, a.y); for (let k = 1; k <= 12; k++) { await mouse('mouseMoved', a.x + (b.x - a.x) * k / 12, a.y + (b.y - a.y) * k / 12); await sleep(16); } await mouse('mouseReleased', b.x, b.y); await sleep(450); };
    const center = sel => ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect(); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const counts = () => ev(`({ crate: __sahaf.crate.length, shelf: Object.values(__sahaf.shelf).reduce((a, b) => a + b, 0) })`);
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${base}?sahne=1&panel=ic` });
    await sleep(2500);
    const steps = [];
    const c0 = await counts();
    const doors = await ev(`!document.querySelector('.st-doors')?.classList.contains('shut')`);
    steps.push(['raf kapakları açık', doors]);
    // depodaki ilk kapağın türünün bölümünde boş yuva (yoksa herhangi bir boş yuva)
    const slot = await center('.st-sec .st-slot');
    await dragFrom(await center('.stage-depot .cover'), slot);
    const c1 = await counts();
    steps.push(['depodan rafa', c1.crate === c0.crate - 1 && c1.shelf === c0.shelf + 1]);
    await dragFrom(await center('.st-sec .spine2'), await center('.stage-depot .dp-grid'));
    const c2 = await counts();
    steps.push(['raftan depoya', c2.crate === c1.crate + 1 && c2.shelf === c1.shelf - 1]);
    const sp = await center('.st-sec .spine2');
    await mouse('mousePressed', sp.x, sp.y); await mouse('mouseReleased', sp.x, sp.y); await sleep(300);
    const before = await ev(`document.querySelector('.st-pricecard b')?.textContent`);
    await ev(`document.querySelector('[data-tagp="1"]').click()`); await sleep(300);
    const own = await ev(`__sahaf.layout.sections.flatMap(s => s.books).some(e => e.own)`);
    steps.push(['fiyat kartı (' + before + ' → +1)', !!before && own]);
    for (const [name, ok] of steps) { checked++; if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} raf: ${name}`); }
    if (errs.length) { failed++; console.log('✗ raf: hata\n    ' + errs.join('\n    ')); }
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
