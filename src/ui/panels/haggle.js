// Pazarlık şeridi: müşteri kitabı tezgâha getirdi. Ekranın altında portre, kitap, etiket fiyatı, müşterinin teklifi ve
// üç fiyat düğmesi (kabul · orta yol · fiyatım bu) ile vazgeç. Her hamlede müşterinin cümlesi ve yüzü değişir; bitince sonuç kısa görünür, şerit kapanır.
// Kurallar game/haggle.js ve game/shop.js haggleMove'da; burası yalnızca gösterir ve hamleyi iletir.
import { BOOK } from '../../data/books.js';
import { GENRES } from '../../data/genres.js';
import { REGULARS } from '../../data/regulars.js';
import { ARCHETYPES } from '../../data/archetypes.js';
import { COND_NAME } from '../../game/shop.js';
import { midOf } from '../../game/haggle.js';
import { personSVG, nameOf } from '../../render/people.js';
import { openPanel, closePanel, portraitBox, hearts } from '../kit.js';
import { T } from '../../i18n/i18n.js';

// yüz: müşterinin o anki hâli (Faz 2'de figürün kendi ifadeleri gelir)
const FACE = { open: '🙂', counter: '🤔', final: '😤', deal: '😊', happy: '😄', leave: '😕', angry: '😠' };

// move(m) → haggleMove sonucu ({ out, offer, line, res }); done(res) şerit kapanınca
export function hagglePanel(S, c, opening, move, done) {
  const d = c.deal, B = BOOK[d.id], R = c.reg && REGULARS[c.reg];
  const who = R ? `${R.name} <span class="hearts">${hearts(S.friends[c.reg] || 0)}</span>`
    : `${nameOf(c.look, ARCHETYPES[c.arch]?.names)}${c.arch ? ` <span class="arch">· ${ARCHETYPES[c.arch].name}</span>` : ''}`;
  const p = openPanel(`
    <div class="hg">
      <div class="hg-top">
        <div class="portrait sm"><svg viewBox="${portraitBox(c)}">${personSVG(c.look, c.style)}</svg><span class="face" data-face>${FACE.open}</span></div>
        <div class="hg-say"><div class="name">${who}</div><p class="say" data-say>“${opening}”</p></div>
      </div>
      <div class="hg-book" style="--c:${GENRES[B.genre].color}">
        <span class="spine"></span>
        <div class="hg-title"><b>${B.title}</b><small>${B.author} · ${COND_NAME[d.cp.cond]}${d.cp.rare ? ` · ✨ ${T`İlk baskı`}` : ''}</small></div>
        <span class="hg-tag" title="${T`Etiket fiyatı`}">🏷️ ₺${d.P}</span>
      </div>
      <div class="hg-moves" data-moves></div>
      <div class="hg-end" data-end></div>
    </div>`, 'haggle');
  const face = k => { p.querySelector('[data-face]').textContent = FACE[k] || FACE.open; };
  const say = text => { p.querySelector('[data-say]').textContent = '“' + text + '”'; };
  let busy = false;
  const moves = () => {
    const m = midOf(d), box = p.querySelector('[data-moves]');
    box.innerHTML = `
      <button class="btn hl" data-m="accept">✓ ${T`Kabul`} <b>₺${d.O}</b></button>
      ${m > d.O && m < d.P ? `<button class="btn" data-m="mid">🤝 ${T`Orta yol`} <b>₺${m}</b></button>` : ''}
      <button class="btn" data-m="hold">🏷️ ${T`Fiyatım bu`} <b>₺${d.P}</b></button>
      <button class="btn sm ghost" data-m="refuse">${T`Vazgeç`}</button>
      ${d.final ? `<p class="hint">${T`Son sözünü söyledi: daha fazlasını istersen gider.`}</p>` : ''}`;
    box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
      if (busy) return;
      busy = true;
      const o = move(b.dataset.m);
      say(o.line);
      face(o.out === 'deal' ? (o.happy ? 'happy' : 'deal') : o.out);
      if (o.res) return finish(o);
      // karşı teklif: kısa bir düşünme, sonra yeni düğmeler
      box.classList.add('think');
      setTimeout(() => { box.classList.remove('think'); busy = false; moves(); }, 450);
    });
  };
  // sonuç: bir an görünür, sonra şerit kapanır (dokununca hemen)
  const finish = o => {
    const r = o.res;
    p.querySelector('[data-moves]').innerHTML = '';
    p.querySelector('[data-end]').innerHTML = r.bought.length
      ? `<span class="chip gold">+₺${r.paid}</span> ${o.happy ? T`😊 Mutlu ayrıldı: adın iyi anılacak.` : T`Anlaştınız.`}`
      : `<span class="chip">${T`Anlaşamadınız`}</span> ${o.out === 'angry' || (!o.polite && o.impatient) ? T`Söylenerek gitti.` : T`Kitap rafa döndü.`}`;
    let closed = false;
    const close = () => { if (closed) return; closed = true; closePanel(); done(r); };
    setTimeout(close, 1400);
    // bu dokunuşun kendisi şeridi kapatmasın: dinleyici bir sonraki turda eklenir
    setTimeout(() => p.addEventListener('click', close, { once: true }), 0);
  };
  moves();
}
