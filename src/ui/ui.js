// Arayüz: üst bilgi, alt düğmeler ve paneller (toptancı, harita, gün sonu).
// Durumu değiştirmez; eylemleri main.js'e `act` üzerinden iletir.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { shelfCount, seasonOf, dayOfSeason } from '../game/state.js';
import { boxCost, canBuyBox, canTravel, topDemand } from '../game/shop.js';

const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const chips = (obj, cls = '') => Object.keys(obj).sort((a, b) => obj[b] - obj[a])
  .map(g => `<span class="chip ${cls}" style="--c:${GENRES[g].color}">${GENRES[g].icon} ${GENRES[g].name} <b>×${obj[g]}</b></span>`).join('');

export function createUI(root, act) {
  root.innerHTML = `
    <div class="top">
      <div class="col">
        <span class="pill" id="where"></span>
        <span class="pill clock"><span id="time"></span><span class="bar"><i id="bar"></i></span></span>
      </div>
      <div class="col right">
        <span class="pill coins">🪙 <b id="coins"></b></span>
        <span class="pill shelf">📚 <span id="shelf"></span></span>
      </div>
    </div>
    <div class="bottom" id="bottom"></div>
    <div class="toast" id="toast"></div>
    <div class="veil" id="veil"><div class="panel" id="panel"></div></div>`;
  const $ = id => root.querySelector('#' + id);
  let toastTimer = 0;

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function openPanel(html, wide) {
    $('panel').innerHTML = html;
    $('panel').classList.toggle('wide', !!wide);
    $('veil').classList.add('open');
    return $('panel');
  }
  const closePanel = () => $('veil').classList.remove('open');
  const isOpen = () => $('veil').classList.contains('open');

  function hud(S, speed) {
    $('where').textContent = `☀️ ${TOWNS[S.town].name} · ${seasonOf(S.day)}, ${dayOfSeason(S.day)}. gün`;
    $('time').textContent = hhmm(Math.round(S.clock));
    $('bar').style.width = ((S.clock - BAL.dayStart) / (BAL.dayEnd - BAL.dayStart) * 100).toFixed(1) + '%';
    $('coins').textContent = S.coins;
    $('shelf').textContent = `${shelfCount(S)}/${BAL.shelfCap}`;
    const b = $('bottom');
    const want = S.phase + speed;
    if (b.dataset.k === want) return;
    b.dataset.k = want;
    if (S.phase === 'morning') {
      b.innerHTML = `<button class="btn" data-a="stock">📦 Toptancı</button>
        <button class="btn" data-a="map">🗺️ Harita</button>
        <button class="btn hl" data-a="open">🔔 Dükkânı aç</button>`;
    } else if (S.phase === 'open') {
      b.innerHTML = `<button class="btn ${speed > 1 ? 'hl' : ''}" data-a="speed">${speed > 1 ? '⏩ Hızlı' : '▶️ Normal'}</button>`;
    } else b.innerHTML = '';
  }
  $('bottom').addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (a) act(a.dataset.a); });

  function stockPanel(S) {
        const hot = topDemand(S.town).map(g => `${GENRES[g].icon} ${GENRES[g].name}`).join(', ');
    const missed = S.lastDay && S.lastDay.town === S.town && Object.keys(S.lastDay.missed).length
      ? `<p class="hint">Dün burada aranıp bulunamayan: ${chips(S.lastDay.missed, 'sm')}</p>` : '';
    const cards = GENRE_KEYS.map(g => {
      const G = GENRES[g], why = canBuyBox(S, g);
      return `<div class="gcard" style="--c:${G.color}">
        <div class="gicon">${G.icon}</div>
        <div class="gname">${G.name}</div>
        <div class="gmeta">Rafta <b>${S.stock[g]}</b> · Satış ₺${G.price}</div>
        <button class="btn sm ${why ? 'off' : ''}" data-buy="${g}" title="${why || ''}">+ Koli (${BAL.boxSize}) · ₺${boxCost(g)}</button>
      </div>`;
    }).join('');
    const p = openPanel(`
      <h2>📦 Toptancı</h2>
      <p class="hint">Bu kasabada çok aranan: <b>${hot}</b></p>${missed}
      <div class="gridline"><span>🪙 <b>${S.coins}</b></span><span>📚 Raflar <b>${shelfCount(S)}/${BAL.shelfCap}</b></span></div>
      <div class="ggrid">${cards}</div>
      <div class="row end"><button class="btn hl" data-close>Tamam</button></div>`, true);
    p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => act('buy', b.dataset.buy));
    p.querySelector('[data-close]').onclick = closePanel;
  }

  function mapPanel(S) {
    const pins = TOWN_KEYS.map(k => {
      const t = TOWNS[k], here = k === S.town;
      const icons = topDemand(k).map(g => GENRES[g].icon).join(' ');
      return `<g class="town ${here ? 'here' : ''}" data-town="${k}" transform="translate(${t.map.x} ${t.map.y})">
        <g class="pin"><path d="M0 0 C-18 -24 -26 -36 -26 -50 A26 26 0 1 1 26 -50 C26 -36 18 -24 0 0Z" fill="${here ? '#5ea592' : '#f08a7e'}" stroke="#fff6e8" stroke-width="5"/>
        <circle cy="-50" r="10" fill="#fff6e8"/></g>
        <text y="40" text-anchor="middle" font-size="32" font-weight="600" fill="#4a3a33">${t.name}</text>
        <text y="78" text-anchor="middle" font-size="26">${icons}</text>
      </g>`;
    }).join('');
    const here = TOWNS[S.town].map;
    const p = openPanel(`
      <h2>🗺️ Nereye gidelim?</h2>
      <p class="hint">Yol ₺${BAL.travelCost} · günde bir kez, sabahları. Simgeler o kasabada en çok aranan türler.</p>
      <svg class="map" viewBox="0 0 1600 900">
        <rect width="1600" height="900" rx="40" fill="#a9dcd8"/>
        <g stroke="#c6ebe7" stroke-width="4" stroke-linecap="round" fill="none">
          <path d="M120 200 q20 -10 40 0 q20 10 40 0"/><path d="M260 620 q20 -10 40 0 q20 10 40 0"/><path d="M180 460 q20 -10 40 0 q20 10 40 0"/>
        </g>
        <path d="M560 0 L1600 0 L1600 900 L700 900 C640 840 700 780 640 740 C560 690 520 640 580 590 C640 540 560 500 600 450 C640 400 720 420 700 360 C680 300 560 300 580 240 C600 180 700 190 680 120 C670 70 590 60 560 0Z" fill="#f3e2bf" stroke="#e6cd9f" stroke-width="10"/>
        <path d="M330 300 C380 260 460 280 450 330 C440 380 360 390 330 360 C310 340 310 316 330 300Z" fill="#f3e2bf" stroke="#e6cd9f" stroke-width="8"/>
        <g fill="#c4dc9b"><ellipse cx="1150" cy="250" rx="140" ry="60"/><ellipse cx="1300" cy="600" rx="160" ry="70"/><ellipse cx="1200" cy="800" rx="120" ry="50"/></g>
        <g fill="#9cb67f"><circle cx="1110" cy="230" r="18"/><circle cx="1150" cy="216" r="22"/><circle cx="1190" cy="234" r="16"/><circle cx="1280" cy="580" r="20"/><circle cx="1320" cy="570" r="24"/></g>
        <path d="M760 170 C880 260 820 360 790 520 C770 640 860 720 900 790" fill="none" stroke="#d8b886" stroke-width="10" stroke-dasharray="4 20" stroke-linecap="round"/>
        <path d="M770 280 C640 300 520 310 400 320" fill="none" stroke="#7fb8c4" stroke-width="6" stroke-dasharray="2 16" stroke-linecap="round"/>
        <g transform="translate(1460 760)"><circle r="60" fill="#fff6e8" stroke="#e2c29c" stroke-width="5"/><path d="M0 -44 L12 0 L0 44 L-12 0Z" fill="#f08a7e"/><path d="M0 0 L12 0 L0 44 L-12 0Z" fill="#c7b6a4"/><text y="-64" text-anchor="middle" font-size="22" font-weight="700" fill="#4a3a33">K</text></g>
        ${pins}
        <g id="van" transform="translate(${here.x} ${here.y - 110})"><g transform="translate(-32 -30)">
          <rect x="0" y="8" width="64" height="40" rx="12" fill="#9fd8c4" stroke="#5ea592" stroke-width="4"/>
          <rect x="10" y="16" width="30" height="16" rx="4" fill="#6b4a3a"/><path d="M8 16 L42 16 L40 22 L10 22Z" fill="#f08a7e"/>
          <circle cx="16" cy="50" r="8" fill="#5b4636"/><circle cx="48" cy="50" r="8" fill="#5b4636"/>
        </g></g>
      </svg>
      <p class="hint" id="blurb">${TOWNS[S.town].blurb}</p>
      <div class="row end"><button class="btn" data-close>Kapat</button></div>`, true);
    p.querySelector('[data-close]').onclick = closePanel;
    p.querySelectorAll('[data-town]').forEach(g => {
      g.onmouseenter = () => { p.querySelector('#blurb').textContent = TOWNS[g.dataset.town].blurb; };
      g.onclick = () => {
        const k = g.dataset.town, why = canTravel(S, k);
        if (why) { toast(why); p.querySelector('#blurb').textContent = TOWNS[k].blurb; return; }
        driveVan(p.querySelector('#van'), TOWNS[S.town].map, TOWNS[k].map, () => act('travel', k));
      };
    });
  }

  function driveVan(van, a, b, done) {
    const start = performance.now(), dur = 1300;
    (function step(now) {
      const k = Math.min((now - start) / dur, 1), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e - 110 - Math.sin(k * Math.PI) * 30;
      van.setAttribute('transform', `translate(${x} ${y})`);
      if (k < 1) requestAnimationFrame(step); else setTimeout(done, 200);
    })(start);
  }

  function summaryPanel(S, T) {
    const profitNote = T.soldCount ? `Bugün <b>${T.soldCount}</b> kitap sattın.` : 'Bugün hiç kitap satılmadı.';
    let tip = '';
    const missedTop = Object.keys(T.missed).sort((a, b) => T.missed[b] - T.missed[a])[0];
    if (missedTop) tip = `${GENRES[missedTop].icon} ${GENRES[missedTop].name} arayan ${T.missed[missedTop]} kişi eli boş döndü. Yarın bir koli almayı düşün.`;
    else if (shelfCount(S) < 8) tip = 'Raflar neredeyse boş. Sabah toptancıya uğra.';
    else tip = 'Herkes aradığını buldu. Böyle devam!';
    const p = openPanel(`
      <h2>🌙 ${S.day}. gün kapandı · ${TOWNS[T.town].name}</h2>
      <div class="stats">
        <div><span>Ziyaretçi</span><b>${T.visitors}</b></div>
        <div><span>Satılan</span><b>${T.soldCount}</b></div>
        <div><span>Kasa</span><b class="gold">+₺${T.revenue}</b></div>
        <div><span>Toplam</span><b>🪙 ${S.coins}</b></div>
      </div>
      <p>${profitNote}</p>
      ${T.soldCount ? `<div class="chips">${chips(T.sold)}</div>` : ''}
      ${Object.keys(T.missed).length ? `<p class="hint">Aranıp bulunamayan:</p><div class="chips">${chips(T.missed, 'miss')}</div>` : ''}
      <p class="tip">💡 ${tip}</p>
      <div class="row end"><button class="btn hl" data-next>☀️ Ertesi sabah</button></div>`);
    p.querySelector('[data-next]').onclick = () => { closePanel(); act('next'); };
  }

  return { hud, toast, stockPanel, mapPanel, summaryPanel, closePanel, isOpen };
}
