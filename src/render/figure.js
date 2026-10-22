// İnsan figürü: gerçekçi orantılar (yaklaşık 3.5 baş boy), yaş/boy/yapı çeşitliliği, eklemli kol ve bacaklar.
// Çizim ayakların yere bastığı noktaya göre (0,0) yapılır, sonra sahnede y=806'ya taşınır.
// Animasyon sınıfları (style.css): p-legL/R ve p-armL/R kalça ve omuzdan döner, p-upper yürürken yaylanır,
// p-head bakınır, p-eyes kırpar, p-book okurken görünür.
import { seeded } from '../core/rng.js';

const SKIN = ['#f6d2b4', '#eec09c', '#e2b08a', '#d9a07a', '#c48a62', '#a8714c'];
const HAIR = ['#2e2422', '#3d2b24', '#6a4434', '#8a5a3c', '#a0643c', '#c4572e', '#e2b56a', '#d9c49a'];
const GREY = ['#dcdcdc', '#c8c8c8', '#ececec', '#9a9a9a', '#b5b0a8'];
const TOPS = ['#f6c552', '#e57f73', '#8bc49a', '#6fb1d6', '#b98ad6', '#f09a5e', '#fff1d6', '#e9e2d4', '#5b8bd0', '#c96f5a', '#7f9c5a'];
const BOTTOMS = ['#4d5d82', '#5a4a42', '#6e7f5a', '#7d5f8a', '#3e4a5e', '#8a7468', '#c9a676'];
const SHOES = ['#5a3d30', '#3d2b24', '#2e2422', '#8a5a3c', '#e9e2d4'];
const HATS = ['#e57f73', '#5b8bd0', '#f2c45a', '#8bc49a', '#3d2b24', '#fff4e0'];
const BAGS = ['#c96f5a', '#f2c45a', '#8bc49a', '#e9d3ad', '#5b8bd0'];

const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

// Kişinin kalıcı özellikleri: görünüş tohumu + sabit stil (müdavimler, müşteri tipi)
export function figureTraits(look, o = {}) {
  const r = seeded(look), pick = a => a[Math.floor(r() * a.length)];
  const rolledAge = r();
  const isGrey = o.hair && GREY.includes(o.hair);
  const age = o.tall && o.tall < 0.9 ? 'child' : isGrey ? 'elder' : o.age || (rolledAge < 0.12 ? 'elder' : 'adult');
  const t = {
    age,
    skin: pick(SKIN),
    hair: age === 'elder' ? pick(GREY) : pick(HAIR),
    hairStyle: pick(['short', 'side', 'bob', 'long', 'pony', 'bun', 'curly', 'short']),
    top: pick(TOPS), shirt: pick(['#fffaf0', '#fff1d6', '#dfeaf2', '#f3e2bf']), bottom: pick(BOTTOMS), shoe: pick(SHOES),
    outfit: pick(['pants', 'pants', 'skirt', 'dress', 'jacket', 'shorts']),
    sleeves: r() < 0.45 ? 'short' : 'long',
    build: 0.88 + r() * 0.34,
    height: 0.94 + r() * 0.12,
    hat: r() < 0.62 ? 0 : 1 + Math.floor(r() * 3), hatC: pick(HATS),
    brows: Math.floor(r() * 3), mouth: Math.floor(r() * 3),
    glasses: r() < 0.16, beard: false,
    bag: r() < 0.3 ? pick(['tote', 'backpack']) : null, bagC: pick(BAGS),
    freckles: r() < 0.15,
  };
  // stil anahtarları: coat (üst), hair, skin, long (uzun saç), hat (0 yok, 1 bere, 2 hasır), hatC, glasses, beard, tall
  if (o.coat) t.top = o.coat;
  if (o.hair) t.hair = o.hair;
  if (o.skin) t.skin = o.skin;
  if (o.long === true && !['long', 'pony', 'bun', 'bob'].includes(t.hairStyle)) t.hairStyle = 'long';
  if (o.long === false && ['long', 'pony', 'bun', 'bob'].includes(t.hairStyle)) t.hairStyle = r() < 0.5 ? 'short' : 'side';
  if (o.hat !== undefined) t.hat = o.hat === 1 ? 1 : o.hat === 2 ? 2 : 0;
  if (o.hatC) t.hatC = o.hatC;
  if (o.glasses) t.glasses = true;
  if (o.beard) { t.beard = true; if (['long', 'pony', 'bun', 'bob'].includes(t.hairStyle)) t.hairStyle = 'short'; if (t.outfit === 'skirt' || t.outfit === 'dress') t.outfit = 'jacket'; }
  if (age === 'elder') { t.hairStyle = t.beard || r() < 0.4 ? pick(['bald', 'short']) : pick(['bun', 'bob', 'short']); t.cane = r() < 0.6; t.bag = null; }
  if (age === 'child') { t.bag = r() < 0.5 ? 'backpack' : null; t.glasses = false; t.beard = false; if (t.outfit === 'jacket') t.outfit = 'pants'; }
  return t;
}

// Ölçek ve başın yüksekliği (portre kırpması, konuşma balonu ve yürüme hızı için)
export function figureMeta(look, o = {}) {
  const t = figureTraits(look, o);
  const s = t.age === 'child' ? 0.7 : t.age === 'elder' ? 0.95 * t.height : t.height;
  return { scale: s, headTop: -232 * s, headY: -188 * s - (t.age === 'child' ? 12 : 0), speed: t.age === 'child' ? 1.25 : t.age === 'elder' ? 0.7 : 1, age: t.age };
}

function hairBack(t) {
  const h = t.hair;
  if (t.hairStyle === 'long') return `<path d="M-25 -34 C-30 -2 -28 22 -20 30 L20 30 C28 22 30 -2 25 -34Z" fill="${h}"/>`;
  if (t.hairStyle === 'bob') return `<path d="M-26 -34 C-30 -14 -28 -4 -22 -2 L22 -2 C28 -4 30 -14 26 -34Z" fill="${h}"/>`;
  if (t.hairStyle === 'pony') return `<path class="p-pony" d="M20 -40 C34 -36 36 -10 30 8 C26 -6 24 -20 18 -30Z" fill="${h}"/>`;
  return '';
}

function hairFront(t) {
  const h = t.hair;
  switch (t.hairStyle) {
    case 'bald': return `<path d="M-23 -26 C-25 -36 -21 -42 -17 -42 L-15 -30Z M23 -26 C25 -36 21 -42 17 -42 L15 -30Z" fill="${h}"/>`;
    case 'side': return `<path d="M-23 -28 C-26 -56 22 -62 24 -30 C18 -42 4 -48 -8 -44 C-14 -40 -18 -36 -23 -28Z" fill="${h}"/>`;
    case 'curly': return `<g fill="${h}">${[[-18, -42], [-6, -50], [7, -50], [18, -42], [-23, -30], [23, -30], [0, -46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10"/>`).join('')}</g>`;
    case 'bun': return `<path d="M-23 -30 C-24 -56 24 -56 23 -30 C14 -44 -14 -44 -23 -30Z" fill="${h}"/><circle cx="0" cy="-58" r="10" fill="${h}"/>`;
    case 'long': case 'bob': case 'pony':
      return `<path d="M-24 -28 C-27 -58 27 -58 24 -28 C18 -40 8 -38 2 -44 C-6 -36 -16 -40 -24 -28Z" fill="${h}"/>`;
    default: return `<path d="M-23 -30 C-25 -56 25 -58 23 -30 C15 -42 -12 -44 -23 -30Z" fill="${h}"/>`;
  }
}

function hatSVG(t) {
  if (t.hat === 1) return `<path d="M-26 -42 C-24 -64 24 -66 28 -44 C12 -50 -12 -50 -26 -42Z" fill="${t.hatC}"/><circle cx="3" cy="-62" r="4" fill="${shade(t.hatC, 0.8)}"/>`;
  if (t.hat === 2) return `<ellipse cx="0" cy="-44" rx="40" ry="8" fill="${t.hatC}"/><path d="M-20 -44 C-19 -66 19 -66 20 -44Z" fill="${t.hatC}"/><rect x="-20" y="-50" width="40" height="5" fill="${shade(t.hatC, 0.75)}"/>`;
  if (t.hat === 3) return `<path d="M-24 -42 C-23 -62 23 -62 24 -42Z" fill="${t.hatC}"/><path d="M-26 -42 L26 -42 L30 -38 L-10 -38Z" fill="${shade(t.hatC, 0.8)}"/>`;
  return '';
}

function face(t) {
  const sk = t.skin, dark = '#3d2b24', brow = shade(t.hair === '#ececec' || GREY.includes(t.hair) ? '#9a9a9a' : t.hair, 0.8);
  const brows = [
    `<path d="M-13 -38 L-4 -38 M4 -38 L13 -38"/>`,
    `<path d="M-13 -37 Q-8 -40 -4 -38 M4 -38 Q8 -40 13 -37"/>`,
    `<path d="M-13 -36 L-4 -39 M4 -39 L13 -36"/>`,
  ][t.brows];
  const mouth = [
    `<path d="M-6 -15 Q0 -10 6 -15" fill="none"/>`,
    `<path d="M-5 -14 Q0 -11 5 -14" fill="none"/>`,
    `<path d="M-7 -15 Q0 -8 7 -15 Q0 -12 -7 -15Z" fill="#b4574a"/>`,
  ][t.mouth];
  return `
    <ellipse cx="-22" cy="-27" rx="4" ry="6" fill="${shade(sk, 0.95)}"/><ellipse cx="22" cy="-27" rx="4" ry="6" fill="${shade(sk, 0.95)}"/>
    <path d="M-22 -30 C-22 -52 22 -52 22 -30 C22 -14 14 -2 0 -1 C-14 -2 -22 -14 -22 -30Z" fill="${sk}"/>
    <path d="M10 -6 C16 -10 20 -18 22 -28 L22 -24 C20 -12 14 -4 4 -1Z" fill="#000" opacity=".06"/>
    <g class="p-eyes"><ellipse cx="-8" cy="-29" rx="2.5" ry="3.2" fill="${dark}"/><ellipse cx="8" cy="-29" rx="2.5" ry="3.2" fill="${dark}"/>
      <circle cx="-7.2" cy="-30.2" r=".9" fill="#fff"/><circle cx="8.8" cy="-30.2" r=".9" fill="#fff"/></g>
    <g fill="none" stroke="${brow}" stroke-width="2" stroke-linecap="round">${brows}</g>
    <path d="M0 -26 Q2.5 -20 -1 -19" fill="none" stroke="${shade(sk, 0.78)}" stroke-width="1.8" stroke-linecap="round"/>
    <g stroke="#8a4a3c" stroke-width="2" stroke-linecap="round">${mouth}</g>
    <ellipse cx="-13" cy="-19" rx="4.5" ry="2.8" fill="#f08a7e" opacity=".3"/><ellipse cx="13" cy="-19" rx="4.5" ry="2.8" fill="#f08a7e" opacity=".3"/>
    ${t.freckles ? `<g fill="${shade(sk, 0.7)}"><circle cx="-12" cy="-23" r=".9"/><circle cx="-15" cy="-21" r=".9"/><circle cx="12" cy="-23" r=".9"/><circle cx="15" cy="-21" r=".9"/></g>` : ''}
    ${t.age === 'elder' ? `<path d="M-15 -44 Q-8 -46 -2 -44 M2 -44 Q8 -46 15 -44" fill="none" stroke="${shade(sk, 0.82)}" stroke-width="1.2"/>` : ''}
    ${t.beard ? `<path d="M-21 -26 C-22 -6 -12 6 0 7 C12 6 22 -6 21 -26 C16 -16 10 -12 0 -12 C-10 -12 -16 -16 -21 -26Z" fill="${t.hair}"/><path d="M-8 -17 Q0 -21 8 -17 Q0 -15 -8 -17Z" fill="${t.hair}"/>` : ''}
    ${t.glasses ? `<g fill="#fff" fill-opacity=".18" stroke="#4a3a33" stroke-width="1.8"><circle cx="-8" cy="-29" r="6.5"/><circle cx="8" cy="-29" r="6.5"/></g><path d="M-1.5 -29 L1.5 -29" stroke="#4a3a33" stroke-width="1.8"/>` : ''}`;
}

// Elde taşınanlar (kolun yerel koordinatında; el 68'de). Şemsiye başın üstünde açılır, fener elden sarkar.
const UMB = ['#f08a7e', '#5b8bd0', '#f2c45a', '#8bc49a', '#b98ad6', '#e57f73'];
function umbrellaSVG(t, hx) {
  const c = UMB[t.seed % UMB.length], cy = -112;
  return `<g class="p-umb"><path d="M${hx} 70 L${hx} ${cy}" stroke="#5a4636" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${hx} 70 q0 10 -7 10" fill="none" stroke="#5a4636" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${hx - 66} ${cy + 26} C${hx - 60} ${cy - 22} ${hx + 60} ${cy - 22} ${hx + 66} ${cy + 26} Q${hx + 44} ${cy + 16} ${hx + 22} ${cy + 26} Q${hx} ${cy + 16} ${hx - 22} ${cy + 26} Q${hx - 44} ${cy + 16} ${hx - 66} ${cy + 26}Z" fill="${c}"/>
    <path d="M${hx} ${cy - 10} C${hx - 14} ${cy} ${hx - 22} ${cy + 14} ${hx - 22} ${cy + 26} M${hx} ${cy - 10} C${hx + 14} ${cy} ${hx + 22} ${cy + 14} ${hx + 22} ${cy + 26}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <path d="M${hx - 50} ${cy + 4} C${hx - 36} ${cy - 12} ${hx - 18} ${cy - 14} ${hx - 8} ${cy - 12}" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${hx}" cy="${cy - 13}" r="3" fill="#5a4636"/></g>`;
}
function lanternSVG(hx) {
  return `<g class="p-lantern" transform="translate(${hx} 70) scale(1.55) translate(${-hx} -70)"><g class="lantern-glow"><circle cx="${hx}" cy="97" r="34" fill="#ffd56b" opacity=".22"/><circle cx="${hx}" cy="97" r="20" fill="#ffe7a0" opacity=".45"/></g>
    <path d="M${hx} 70 L${hx} 82" stroke="#4a3a33" stroke-width="2"/><path d="M${hx - 7} 82 L${hx + 7} 82 L${hx + 5} 86 L${hx - 5} 86Z" fill="#4a3a33"/>
    <rect x="${hx - 8}" y="86" width="16" height="22" rx="4" fill="#ffd56b" stroke="#4a3a33" stroke-width="2.4"/>
    <path d="M${hx} 88 L${hx} 106" stroke="#4a3a33" stroke-width="1.4" opacity=".5"/><circle cx="${hx}" cy="98" r="3.4" fill="#fff6c2" class="twinkle"/>
    <path d="M${hx - 6} 108 L${hx + 6} 108 L${hx + 3} 112 L${hx - 3} 112Z" fill="#4a3a33"/></g>`;
}

export function personSVG(look, o = {}, carry = {}) {
  const t = figureTraits(look, o), m = figureMeta(look, o);
  t.seed = Math.abs(look | 0);
  t.umbrella = !!carry.umbrella; t.lantern = !!carry.lantern;
  const w = t.build, sw = 21 * w, hw = 17 * w;                       // omuz ve kalça yarı genişliği
  const top = t.top, topD = shade(top, 0.82), bot = t.bottom;
  const skirt = t.outfit === 'skirt' || t.outfit === 'dress', dress = t.outfit === 'dress', shorts = t.outfit === 'shorts';
  const legC = skirt ? t.skin : bot;
  const sleeveLong = t.sleeves === 'long' || t.outfit === 'jacket';
  const childHead = t.age === 'child' ? 'scale(1.22)' : '';

  const leg = side => `<g transform="translate(${side * 8 * w} -82)"><g class="p-leg${side < 0 ? 'L' : 'R'}">
      <path d="M-7 0 L7 0 L6 74 L-6 74Z" fill="${legC}"/>
      ${shorts ? `<path d="M-8 0 L8 0 L8 30 L-8 30Z" fill="${bot}"/><path d="M-6 30 L6 30 L6 74 L-6 74Z" fill="${t.skin}"/>` : ''}
      ${!skirt && !shorts ? `<path d="M1 4 L6 4 L5 72 L1 72Z" fill="#000" opacity=".08"/>` : ''}
      <ellipse cx="${side * 2}" cy="77" rx="10" ry="5.5" fill="${t.shoe}"/>
    </g></g>`;

  const arm = side => `<g transform="translate(${side * (sw - 3)} -146)"><g class="p-arm${side < 0 ? 'L' : 'R'}">
      <path d="M0 0 L${side * 4} 36" stroke="${sleeveLong || dress ? top : top}" stroke-width="12" stroke-linecap="round"/>
      <path d="M${side * 4} 36 L${side * 6} 64" stroke="${sleeveLong ? top : t.skin}" stroke-width="${sleeveLong ? 11 : 9}" stroke-linecap="round"/>
      <circle cx="${side * 6}" cy="68" r="5.5" fill="${t.skin}"/>
      ${side > 0 ? `<g class="p-book"><rect x="-4" y="58" width="18" height="24" rx="2" fill="#5b8bd0" transform="rotate(-12 5 70)"/><rect x="-1" y="61" width="12" height="3" rx="1" fill="#fff" opacity=".6" transform="rotate(-12 5 70)"/></g>` : ''}
      ${side > 0 && t.cane ? `<path d="M${side * 6} 66 L${side * 10} 146" stroke="#7a4e33" stroke-width="4" stroke-linecap="round"/>` : ''}
      ${side > 0 && t.umbrella ? umbrellaSVG(t, 6) : ''}${side < 0 && t.lantern ? lanternSVG(-6) : ''}
    </g></g>`;

  // gövde: gömlek + (ceket ya da üst) + (etek ya da elbise)
  const torso = `
    <path d="M-${sw} -150 Q-${sw + 3} -118 -${hw} -80 L${hw} -80 Q${sw + 3} -118 ${sw} -150 Q0 -158 -${sw} -150Z" fill="${t.outfit === 'jacket' ? t.shirt : top}"/>
    ${t.outfit === 'jacket' ? `<path d="M-${sw} -150 Q-${sw + 3} -118 -${hw} -80 L-3 -80 L-4 -136 L-8 -153Z" fill="${top}"/><path d="M${sw} -150 Q${sw + 3} -118 ${hw} -80 L3 -80 L4 -136 L8 -153Z" fill="${top}"/>
      <circle cx="-6" cy="-112" r="1.8" fill="${topD}"/><circle cx="-6" cy="-96" r="1.8" fill="${topD}"/>` : `<path d="M-7 -153 L0 -142 L7 -153" fill="none" stroke="${topD}" stroke-width="2.5"/>`}
    <path d="M${sw * 0.35} -152 Q${sw + 3} -118 ${hw} -80 L${hw * 0.4} -80Z" fill="#000" opacity=".07"/>
    ${skirt ? `<path class="p-skirt" d="M-${hw + 1} -${dress ? 92 : 84} L-${hw + 11} -32 Q0 -26 ${hw + 11} -32 L${hw + 1} -${dress ? 92 : 84}Z" fill="${dress ? top : bot}"/>
      <path d="M-${hw + 11} -32 Q0 -26 ${hw + 11} -32 L${hw + 10} -36 Q0 -30 -${hw + 10} -36Z" fill="#000" opacity=".1"/>` : `<rect x="-${hw}" y="-86" width="${hw * 2}" height="6" fill="${shade(bot, 0.85)}"/>`}
    ${t.outfit === 'jacket' || !skirt ? '' : ''}`;

  const bag = t.bag === 'tote'
    ? `<path d="M-${sw - 6} -150 L${hw + 4} -92" stroke="${shade(t.bagC, 0.8)}" stroke-width="3"/><rect x="${hw - 2}" y="-96" width="20" height="24" rx="3" fill="${t.bagC}"/>`
    : t.bag === 'backpack' ? `<path d="M-${sw - 7} -150 L-${sw - 8} -104 M${sw - 7} -150 L${sw - 8} -104" stroke="${shade(t.bagC, 0.75)}" stroke-width="4"/>` : '';

  const hunch = t.age === 'elder' ? 'rotate(4 0 -82)' : '';
  return `
    <ellipse cx="0" cy="806" rx="${30 * w * m.scale + 6}" ry="7" fill="#7a5a3c" opacity=".22"/>
    ${sideView(t, m)}
    <g class="p-front" transform="translate(0 806) scale(${m.scale.toFixed(3)})">
      ${leg(-1)}${leg(1)}
      <g class="p-upper"><g transform="${hunch}">
        ${t.bag === 'backpack' ? `<rect x="-${sw - 2}" y="-148" width="${(sw - 2) * 2}" height="52" rx="10" fill="${shade(t.bagC, 0.85)}"/>` : ''}
        ${arm(-1)}
        ${torso}
        ${bag}
        <rect x="-5" y="-162" width="10" height="14" fill="${shade(t.skin, 0.9)}"/>
        <g transform="translate(0 -160)"><g class="p-head"><g transform="${childHead}">
          ${hairBack(t)}
          ${face(t)}
          ${hairFront(t)}
          ${hatSVG(t)}
        </g></g></g>
        ${arm(1)}
      </g></g>
    </g>`;
}

// Yan görünüş (sağa bakar): yürürken gösterilir. Bacak ve kollar ileri-geri sallanır; arkadakiler daha koyu.
function sideView(t, m) {
  const w = t.build, top = t.top, bot = t.bottom, sk = t.skin;
  const skirt = t.outfit === 'skirt' || t.outfit === 'dress', dress = t.outfit === 'dress', shorts = t.outfit === 'shorts';
  const legC = skirt ? sk : bot, sleeveLong = t.sleeves === 'long' || t.outfit === 'jacket';
  const bw = 12 * w;                                             // gövdenin yarı derinliği
  const leg = (cls, dark) => `<g transform="translate(0 -82)"><g class="${cls}">
      <path d="M-6 0 L7 0 L6 74 L-5 74Z" fill="${dark ? shade(legC === sk ? sk : legC, 0.82) : legC}"/>
      ${shorts ? `<path d="M-7 0 L8 0 L8 30 L-7 30Z" fill="${dark ? shade(bot, 0.82) : bot}"/><path d="M-5 30 L6 30 L6 74 L-5 74Z" fill="${dark ? shade(sk, 0.85) : sk}"/>` : ''}
      <path d="M-6 72 L12 72 Q16 76 14 80 L-6 80Z" fill="${dark ? shade(t.shoe, 0.8) : t.shoe}"/>
    </g></g>`;
  const arm = (cls, dark) => `<g transform="translate(0 -146)"><g class="${cls}">
      <path d="M0 0 L1 36" stroke="${dark ? shade(top, 0.8) : top}" stroke-width="12" stroke-linecap="round"/>
      <path d="M1 36 L3 64" stroke="${sleeveLong ? (dark ? shade(top, 0.8) : top) : (dark ? shade(sk, 0.85) : sk)}" stroke-width="${sleeveLong ? 11 : 9}" stroke-linecap="round"/>
      <circle cx="3" cy="68" r="5.5" fill="${dark ? shade(sk, 0.85) : sk}"/>
      ${!dark && t.cane ? '<path d="M3 66 L14 146" stroke="#7a4e33" stroke-width="4" stroke-linecap="round"/>' : ''}
      ${!dark && t.umbrella ? umbrellaSVG(t, 3) : ''}${dark && t.lantern ? lanternSVG(3) : ''}
    </g></g>`;
  // profil baş: yüz sağa, burun çıkıntısı, tek göz, kulak; saç arkada
  const hairSide = {
    long: `<path d="M-22 -50 C-4 -62 18 -56 20 -40 C8 -44 -6 -42 -12 -34 C-16 -10 -18 18 -26 28 C-30 0 -30 -30 -22 -50Z" fill="${t.hair}"/>`,
    bob: `<path d="M-22 -50 C-4 -62 18 -56 20 -40 C6 -44 -6 -42 -10 -32 C-12 -18 -14 -8 -22 -4 C-28 -20 -28 -38 -22 -50Z" fill="${t.hair}"/>`,
    pony: `<path d="M-20 -50 C-2 -62 18 -56 20 -40 C6 -44 -8 -42 -14 -36 C-20 -40 -22 -46 -20 -50Z" fill="${t.hair}"/><path class="p-pony" d="M-18 -44 C-34 -40 -36 -16 -30 2 C-26 -12 -24 -28 -16 -38Z" fill="${t.hair}"/>`,
    bun: `<path d="M-20 -48 C-4 -60 18 -56 20 -40 C6 -44 -8 -42 -16 -34 C-22 -38 -22 -44 -20 -48Z" fill="${t.hair}"/><circle cx="-16" cy="-52" r="10" fill="${t.hair}"/>`,
    curly: `<g fill="${t.hair}">${[[-16, -46], [-4, -52], [9, -50], [-22, -34], [-18, -22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10"/>`).join('')}</g>`,
    bald: `<path d="M-20 -30 C-22 -36 -18 -40 -12 -40 L-10 -28Z" fill="${t.hair}"/>`,
  }[t.hairStyle] || `<path d="M-20 -48 C-4 -60 18 -56 20 -40 C6 -44 -8 -42 -14 -34 C-20 -34 -22 -42 -20 -48Z" fill="${t.hair}"/>`;
  const hatSide = t.hat === 1 ? `<path d="M-22 -42 C-20 -64 22 -64 26 -46 C10 -50 -8 -48 -22 -42Z" fill="${t.hatC}"/>`
    : t.hat === 2 ? `<ellipse cx="2" cy="-44" rx="36" ry="6" fill="${t.hatC}"/><path d="M-16 -44 C-14 -64 18 -64 20 -44Z" fill="${t.hatC}"/>`
    : t.hat === 3 ? `<path d="M-20 -42 C-19 -62 20 -62 21 -42Z" fill="${t.hatC}"/><path d="M18 -44 L36 -40 L18 -38Z" fill="${shade(t.hatC, 0.8)}"/>` : '';
  const head = `<g transform="translate(2 -160)"><g class="p-head"><g transform="${t.age === 'child' ? 'scale(1.22)' : ''}">
      ${['long', 'bob'].includes(t.hairStyle) ? '' : ''}
      <path d="M-18 -30 C-18 -52 18 -54 20 -34 L22 -26 L19 -23 C20 -14 14 -2 2 -1 C-12 -2 -18 -14 -18 -30Z" fill="${sk}"/>
      <ellipse cx="-4" cy="-27" rx="4.5" ry="6" fill="${shade(sk, 0.92)}"/>
      <g class="p-eyes"><ellipse cx="11" cy="-30" rx="2.3" ry="3.1" fill="#3d2b24"/></g>
      <path d="M7 -38 L15 -37" stroke="${shade(GREY.includes(t.hair) ? '#9a9a9a' : t.hair, 0.8)}" stroke-width="2" stroke-linecap="round"/>
      <path d="M13 -15 Q16 -13 18 -15" fill="none" stroke="#8a4a3c" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="11" cy="-20" rx="4" ry="2.6" fill="#f08a7e" opacity=".3"/>
      ${t.beard ? `<path d="M-6 -22 C-4 -4 6 6 16 2 C22 -2 22 -12 20 -16 C12 -12 2 -14 -6 -22Z" fill="${t.hair}"/>` : ''}
      ${t.glasses ? '<g fill="none" stroke="#4a3a33" stroke-width="1.8"><circle cx="12" cy="-29" r="6"/><path d="M6 -30 L-4 -30"/></g>' : ''}
      ${hairSide}
      ${hatSide}
    </g></g></g>`;
  const hunch = t.age === 'elder' ? 'rotate(8 0 -82)' : '';
  return `<g class="p-side" transform="translate(0 806) scale(${m.scale.toFixed(3)})">
    ${leg('p-legB', true)}
    ${arm('p-armB', true)}
    ${leg('p-legF', false)}
    <g class="p-upper"><g transform="${hunch}">
      ${t.bag === 'backpack' ? `<rect x="-${bw + 12}" y="-150" width="16" height="52" rx="6" fill="${shade(t.bagC, 0.85)}"/>` : ''}
      <path d="M-${bw} -150 Q-${bw + 2} -116 -${bw - 2} -80 L${bw - 1} -80 Q${bw + 4} -118 ${bw} -150 Q0 -156 -${bw} -150Z" fill="${top}"/>
      <path d="M${bw * 0.2} -152 Q${bw + 4} -118 ${bw - 1} -80 L${bw * 0.2} -80Z" fill="#000" opacity=".06"/>
      ${skirt ? `<path class="p-skirt" d="M-${bw} -${dress ? 92 : 84} L-${bw + 8} -32 Q0 -27 ${bw + 10} -32 L${bw} -${dress ? 92 : 84}Z" fill="${dress ? top : bot}"/>` : `<rect x="-${bw - 1}" y="-86" width="${bw * 2 - 1}" height="6" fill="${shade(bot, 0.85)}"/>`}
      ${t.bag === 'tote' ? `<path d="M-4 -150 L-${bw + 2} -96" stroke="${shade(t.bagC, 0.8)}" stroke-width="3"/><rect x="-${bw + 12}" y="-100" width="16" height="22" rx="3" fill="${t.bagC}"/>` : ''}
      <rect x="-4" y="-162" width="10" height="14" fill="${shade(sk, 0.9)}"/>
      ${head}
      ${arm('p-armF', false)}
    </g></g>
  </g>`;
}
