// Pazarlık şeridi: müşteri kitabı tezgâha getirdi. Ekranın altında portre (yüz ifadesiyle), beden dili ipuçları, kitap, etiket fiyatı,
// müşterinin teklifi, üç fiyat düğmesi (kabul · orta yol · fiyatım bu), söz kartları ve vazgeç. Her hamlede müşterinin cümlesi ve yüzü değişir;
// bitince sonuç kısa görünür, şerit kapanır. Kurallar game/haggle.js ve game/shop.js haggleMove'da; burası gösterir ve hamleyi iletir.
import { BOOK, TAGS } from '../../data/books.js';
import { GENRES } from '../../data/genres.js';
import { REGULARS } from '../../data/regulars.js';
import { ARCHETYPES } from '../../data/archetypes.js';
import { COND_NAME } from '../../game/shop.js';
import { midOf, sozOptions, traitsOf } from '../../game/haggle.js';
import { patronOf } from '../../game/patrons.js';
import { personSVG, nameOf } from '../../render/people.js';
import { openPanel, closePanel, portraitBox, hearts } from '../kit.js';
import { T } from '../../i18n/i18n.js';

// durumdan yüz ifadesi (render/figure.js MOODS)
const MOOD = { counter: 'thinking', final: 'bored', deal: 'curious', happy: 'happy', leave: 'bored', angry: 'angry', sozYes: 'surprised', sozNo: 'bored' };

// söz kartının etiketi ve oyuncunun söylediği cümle
export function sozCard(s) {
  if (s.kind === 'konu') { const G = TAGS[s.tag], t = T`${G.say[0]} bir kitap bu.`; return { label: `${G.icon} ${G.name}`, say: t.charAt(0).toLocaleUpperCase('tr') + t.slice(1) }; }
  if (s.kind === 'kisisel') return { label: `📖 ${T`Ben de okudum`}`, say: T`Bunu ben de okudum; son sayfası uzun süre aklımdan çıkmadı.` };
  if (s.kind === 'kondisyon') return { label: `✨ ${T`Tertemiz`}`, say: T`Sayfaları tertemiz, sırtı hiç kırılmamış.` };
  if (s.kind === 'nadirlik') return { label: `📜 ${T`İlk baskı`}`, say: T`Bu bir ilk baskı; baskı sayfasına bakın isterseniz.` };
  return { label: `💭 «${BOOK[s.book].title}»`, say: T`Geçen sefer aldığın «${BOOK[s.book].title}» hoşuna gittiyse bunu da seversin.` };
}

// beden dili: sabrı, cebi ve huyu kendini belli eder (en fazla iki ipucu)
function cues(c, d) {
  const t = traitsOf(c), out = [];
  if (d.final) out.push(`😤 ${T`Kollarını kavuşturdu`}`);
  else if (t.quirk === 'sabirsiz' || d.pat <= 1) out.push(`⌚ ${T`Saatine bakıyor`}`);
  if (!d.habit && d.rounds === 0) out.push(`👛 ${T`Cüzdanını yokluyor`}`);
  if (d.habit && d.rounds === 0) out.push(`😏 ${T`Pazarlıktan keyif alıyor`}`);
  if (t.quirk === 'supheci') out.push(`🤨 ${T`Kitabı evirip çeviriyor`}`);
  if (t.quirk === 'comert') out.push(`😌 ${T`Keyfi yerinde`}`);
  if (t.quirk === 'geveze') out.push(`💬 ${T`Lafı uzatıyor`}`);
  return out.slice(0, 2);
}

// move(m) → haggleMove sonucu ({ out, offer, line, res }); done(res) şerit kapanınca
export function hagglePanel(S, c, opening, move, done) {
  const d = c.deal, B = BOOK[d.id], R = c.reg && REGULARS[c.reg], P = patronOf(S, c);
  const who = R ? `${R.name} <span class="hearts">${hearts(S.friends[c.reg] || 0)}</span>`
    : `${nameOf(c.look, ARCHETYPES[c.arch]?.names)}${c.arch ? ` <span class="arch">· ${ARCHETYPES[c.arch].name}</span>` : ''}${P ? ` <span class="pat">🤝 ${T`Tanıdık`} · ${T`${P.visits + 1}. gelişi`}</span>` : ''}`;
  const portrait = mood => `<svg viewBox="${portraitBox(c)}">${personSVG(c.look, c.style, {}, mood)}</svg>`;
  const p = openPanel(`
    <div class="hg">
      <div class="hg-top">
        <div class="portrait sm" data-face>${portrait(d.habit ? 'curious' : 'thinking')}</div>
        <div class="hg-say"><div class="name">${who}</div><p class="say" data-say>“${opening}”</p><div class="cues" data-cues></div></div>
      </div>
      <div class="hg-book" style="--c:${GENRES[B.genre].color}">
        <span class="spine"></span>
        <div class="hg-title"><b>${B.title}</b><small>${B.author} · ${COND_NAME[d.cp.cond]}${d.cp.rare ? ` · ✨ ${T`İlk baskı`}` : ''}</small></div>
        <span class="hg-tag" title="${T`Etiket fiyatı`}">🏷️ ₺${d.P}</span>
      </div>
      <p class="hg-me" data-me hidden></p>
      <div class="hg-moves" data-moves></div>
      <div class="hg-end" data-end></div>
    </div>`, 'haggle');
  const face = mood => { p.querySelector('[data-face]').innerHTML = portrait(mood); };
  const say = text => { p.querySelector('[data-say]').textContent = '“' + text + '”'; };
  const me = text => { const n = p.querySelector('[data-me]'); n.hidden = !text; n.textContent = text ? T`Sen:` + ' “' + text + '”' : ''; };
  let busy = false;
  const render = () => {
    const m = midOf(d), box = p.querySelector('[data-moves]'), soz = d.soz ? [] : sozOptions(S, c, d);
    p.querySelector('[data-cues]').innerHTML = cues(c, d).map(x => `<span class="cue">${x}</span>`).join('');
    box.innerHTML = `
      <button class="btn hl" data-m="accept">✓ ${T`Kabul`} <b>₺${d.O}</b></button>
      ${m > d.O && m < d.P ? `<button class="btn" data-m="mid">🤝 ${T`Orta yol`} <b>₺${m}</b></button>` : ''}
      <button class="btn" data-m="hold">🏷️ ${T`Fiyatım bu`} <b>₺${d.P}</b></button>
      <button class="btn sm ghost" data-m="refuse">${T`Vazgeç`}</button>
      ${soz.length ? `<div class="hg-soz"><span class="hint">💬 ${T`Bir söz söyle:`}</span>${soz.map(s => `<button class="btn sm soz" data-m="soz:${s.kind}">${sozCard(s).label}</button>`).join('')}</div>` : ''}
      ${d.final ? `<p class="hint">${T`Son sözünü söyledi: daha fazlasını istersen gider.`}</p>` : ''}`;
    box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
      if (busy) return;
      busy = true;
      const m = b.dataset.m;
      if (m.startsWith('soz:')) { const s = sozOptions(S, c, d).find(o => 'soz:' + o.kind === m); me(s && sozCard(s).say); } else me('');
      const o = move(m);
      say(o.line);
      face(o.out === 'deal' ? (o.happy ? 'happy' : 'curious') : MOOD[o.out] || 'thinking');
      if (o.res) return finish(o);
      // karşı teklif: kısa bir düşünme, sonra yeni düğmeler
      box.classList.add('think');
      setTimeout(() => { box.classList.remove('think'); busy = false; render(); }, 450);
    });
  };
  // sonuç: bir an görünür, sonra şerit kapanır (dokununca hemen)
  const finish = o => {
    const r = o.res;
    p.querySelector('[data-moves]').innerHTML = '';
    p.querySelector('[data-cues]').innerHTML = '';
    p.querySelector('[data-end]').innerHTML = r.bought.length
      ? `<span class="chip gold">+₺${r.paid}</span> ${o.happy ? T`😊 Mutlu ayrıldı: adın iyi anılacak.` : T`Anlaştınız.`}${r.patron ? ` <span class="chip">🤝 ${T`Kartını bıraktı: artık tanıdığın.`}</span>` : ''}`
      : `<span class="chip">${T`Anlaşamadınız`}</span> ${o.out === 'angry' || (!o.polite && o.impatient) ? T`Söylenerek gitti.` : T`Kitap rafa döndü.`}`;
    let closed = false;
    const close = () => { if (closed) return; closed = true; closePanel(); done(r); };
    setTimeout(close, r.patron ? 2200 : 1400);
    // bu dokunuşun kendisi şeridi kapatmasın: dinleyici bir sonraki turda eklenir
    setTimeout(() => p.addEventListener('click', close, { once: true }), 0);
  };
  render();
}
