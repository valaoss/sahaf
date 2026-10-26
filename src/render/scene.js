// Kasaba sahnesi: tek SVG (1600×900). Statik parçalar burada, değişenler (evler, raflar, renkler) fonksiyonlarla.
// Derinlik bantları (bandSky, bandF, bandH, bandG): canvas motoru (render2) bunları ayrı ayrı resme pişirir.
import { el } from '../core/svg.js';
import { seeded } from '../core/rng.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { booksOf, BOOK } from '../data/books.js';
import { PAINTS, AWNINGS } from '../data/decor.js';
import { shelfCap, genreCounts } from '../game/state.js';
import { syncLayout, sectionCap } from '../game/shelving.js';
import { DECOR_ART } from './decor-art.js';
import { spotArt, GROUND, SHOW_HOUSES, baseScene } from './spot-art.js';
import { landmarkArt, ARCH } from './landmarks.js';
import { svgView, personSVG } from './people.js';
import { cartArt } from './cart-art.js';

// Çay köşesi: tabure, demlik, iki ince belli bardak, buhar
const TEA_ART = `<ellipse cx="0" cy="4" rx="34" ry="7" fill="#c9a676" opacity=".6"/>
  <rect x="-24" y="-30" width="48" height="8" rx="3" fill="#a8704a"/><rect x="-20" y="-22" width="6" height="26" rx="2" fill="#7a4e33"/><rect x="14" y="-22" width="6" height="26" rx="2" fill="#7a4e33"/>
  <path d="M-18 -30 C-22 -46 -12 -52 -6 -52 C0 -52 6 -46 2 -30Z" fill="#e57f73"/><path d="M-14 -52 C-14 -60 -2 -60 -2 -52Z" fill="#f2c45a"/>
  <path d="M2 -42 C10 -44 12 -48 14 -52" fill="none" stroke="#e57f73" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 -30 L18 -30 L19 -44 L7 -44Z" fill="#d6563a" opacity=".85"/><path d="M-30 -30 L-22 -30 L-21 -42 L-31 -42Z" fill="#d6563a" opacity=".85"/>
  <path class="steam" d="M13 -48 C9 -54 17 -58 13 -66" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;

// Paket köşesi: kâğıt rulosu, sicim, sarılı paket
const WRAP_ART = `<rect x="-4" y="-16" width="44" height="16" rx="3" fill="#e8d3b0" stroke="#b9956a" stroke-width="2"/>
  <ellipse cx="-4" cy="-8" rx="5" ry="8" fill="#d8bf95" stroke="#b9956a" stroke-width="2"/>
  <rect x="48" y="-22" width="30" height="22" rx="3" fill="#f6a5c0"/><path d="M63 -22 L63 0 M48 -11 L78 -11" stroke="#fff4e0" stroke-width="3"/>
  <path d="M58 -26 Q63 -20 68 -26 Q63 -30 58 -26Z" fill="#fff4e0"/>`;
// Akşam feneri: direk ve fener (akşam yanar)
const LANTERN_ART = `<rect x="-3" y="-150" width="6" height="150" rx="3" fill="#5b4636"/><path d="M-3 -150 L26 -150" stroke="#5b4636" stroke-width="5" stroke-linecap="round"/>
  <path d="M26 -150 L26 -138" stroke="#5b4636" stroke-width="2"/><g class="lantern-glow"><circle cx="26" cy="-118" r="30" fill="#ffd56b" opacity=".22"/></g>
  <rect x="16" y="-138" width="20" height="28" rx="5" fill="#ffd56b" stroke="#5b4636" stroke-width="3"/><circle cx="26" cy="-124" r="4" fill="#fff6c2" class="twinkle"/>
  <ellipse cx="0" cy="0" rx="18" ry="4" fill="#c9a676" opacity=".6"/>`;
// Araba basamakları: kitap arabasında koli yığını, büyük arabada yan kanat raf, karavanda bayrak dizisi
const CRATES_ART = `<ellipse cx="34" cy="2" rx="50" ry="7" fill="#c9a676" opacity=".6"/>
  <rect x="0" y="-40" width="44" height="40" rx="3" fill="#c48a5f" stroke="#8a5a3c" stroke-width="3"/><rect x="40" y="-30" width="34" height="30" rx="3" fill="#b07a50" stroke="#8a5a3c" stroke-width="3"/>
  <g><rect x="6" y="-52" width="8" height="14" fill="#e57f73"/><rect x="16" y="-55" width="7" height="17" fill="#5b8bd0"/><rect x="25" y="-51" width="9" height="13" fill="#f2c45a"/><rect x="46" y="-40" width="8" height="12" fill="#8bc49a"/><rect x="56" y="-42" width="7" height="14" fill="#b98ad6"/></g>`;
// karavanda çatı kenarı boyunca bayrak dizisi (ikinci dereceden eğri üstünde üçgenler)
const BUNTING_ART = (() => {
  const C = ['#f08a7e', '#f2c45a', '#8bc49a', '#5b8bd0', '#b98ad6', '#f6a5c0'], at = t => [(1 - t) ** 2 * 6 + 2 * (1 - t) * t * 225 + t * t * 446, (1 - t) ** 2 * 26 + 2 * (1 - t) * t * 66 + t * t * 34];
  let out = '<path d="M6 26 Q225 66 446 34" fill="none" stroke="#7a4e33" stroke-width="2.5"/>';
  for (let i = 0; i < 14; i++) { const [x1, y1] = at(i / 14 + 0.01), [x2, y2] = at((i + 1) / 14 - 0.01); out += '<path d="M' + x1.toFixed(0) + ' ' + y1.toFixed(0) + ' L' + x2.toFixed(0) + ' ' + y2.toFixed(0) + ' L' + ((x1 + x2) / 2).toFixed(0) + ' ' + ((y1 + y2) / 2 + 17).toFixed(0) + 'Z" fill="' + C[i % C.length] + '"/>'; }
  return out;
})();
const WING_ART = `<path d="M0 0 L70 0 L70 12 L0 12Z" fill="#a8704a"/><path d="M62 12 L62 120" stroke="#7a4e33" stroke-width="6"/>
  <rect x="0" y="-62" width="70" height="62" rx="4" fill="#6b4a3a"/><path d="M0 -31 L70 -31" stroke="#5a3d30" stroke-width="4"/>
  <g><rect x="6" y="-58" width="8" height="25" fill="#e57f73"/><rect x="15" y="-56" width="7" height="23" fill="#f6a5c0"/><rect x="23" y="-58" width="9" height="25" fill="#8bc49a"/><rect x="34" y="-55" width="7" height="22" fill="#5b8bd0"/><rect x="43" y="-58" width="9" height="25" fill="#f2c45a"/>
  <rect x="8" y="-27" width="9" height="25" fill="#b98ad6"/><rect x="18" y="-25" width="8" height="23" fill="#e57f73"/><rect x="28" y="-27" width="8" height="25" fill="#5b8bd0"/><rect x="38" y="-24" width="9" height="22" fill="#c48a5f"/></g>`;

// Okuma koltuğu: kadife koltuk, üstünde açık kitap
const CHAIR_ART = `<ellipse cx="0" cy="2" rx="50" ry="7" fill="#c9a676" opacity=".6"/>
  <path d="M-30 -4 L-34 4 M30 -4 L34 4" stroke="#7a4e33" stroke-width="5" stroke-linecap="round"/>
  <path d="M-30 -32 L-30 -80 Q-30 -94 -16 -94 L16 -94 Q30 -94 30 -80 L30 -32Z" fill="#e08a6e"/>
  <path d="M-18 -84 Q0 -76 18 -84" fill="none" stroke="#f2b8a6" stroke-width="3" stroke-linecap="round"/>
  <rect x="-34" y="-34" width="68" height="30" rx="9" fill="#c96f5a"/>
  <rect x="-46" y="-54" width="18" height="50" rx="9" fill="#d47a62"/><rect x="28" y="-54" width="18" height="50" rx="9" fill="#d47a62"/>
  <path d="M-14 -36 Q-7 -42 0 -36 Q7 -42 14 -36 L14 -30 Q7 -35 0 -30 Q-7 -35 -14 -30Z" fill="#fff6e8" stroke="#b9956a" stroke-width="1.5"/>`;

// Plak çalar: dönen plak ve boru
const GRAMO_ART = `<rect x="-26" y="-14" width="52" height="16" rx="3" fill="#8a5a3c"/>
  <g transform="translate(-4 -16)"><g class="spin slow"><ellipse rx="22" ry="5" fill="#2e2422"/><ellipse rx="6" ry="1.6" fill="#e57f73"/></g></g>
  <path d="M14 -18 L22 -40" stroke="#c9a676" stroke-width="4" stroke-linecap="round"/>
  <path d="M22 -40 C26 -64 52 -70 58 -58 C48 -56 34 -48 26 -36Z" fill="#f2c45a" stroke="#d1a73c" stroke-width="2"/>
  <text x="44" y="-74" font-size="16" class="twinkle">♪</text>`;

// Mevsim görünümleri: a/b ağaç yaprakları, bits uçuşan parçacık renkleri, tint serin/ılık ton
export const SEASON_LOOK = {
  'İlkbahar': { a: '#9cb67f', b: '#b5cb94', bits: ['#f6a5c0', '#fbd0dc', '#fff'] },
  'Yaz':      { a: '#86b85f', b: '#a9d27e' },
  'Sonbahar': { a: '#d39a52', b: '#e6b86c', bits: ['#e08a3c', '#c96f3a', '#e8b04a'] },
  'Kış':      { a: '#8ea596', b: '#a9bcae', tint: '#6f8fc0' },
};

const cloud = (delay, slow, cy, s) => `
  <g class="drift${slow ? ' slow' : ''}" style="animation-delay:${delay}s">
    <g fill="#fff8ee" opacity=".92" transform="translate(0 ${cy}) scale(${s})">
      <ellipse cx="0" cy="0" rx="70" ry="30"/><ellipse cx="45" cy="-20" rx="50" ry="38"/><ellipse cx="95" cy="2" rx="60" ry="26"/>
    </g>
  </g>`;

const MARKUP = `
<svg class="scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" id="skyTop"/><stop offset="1" id="skyBot"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" id="seaTop"/><stop offset="1" id="seaBot"/></linearGradient>
    <radialGradient id="sunGlow"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".6"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
    <pattern id="cobble" width="70" height="40" patternUnits="userSpaceOnUse">
      <rect width="70" height="40" fill="#f1dcb5"/>
      <rect x="4" y="5" width="28" height="13" rx="6" fill="#ead0a3"/><rect x="38" y="5" width="28" height="13" rx="6" fill="#edd5ab"/>
      <rect x="-14" y="23" width="28" height="13" rx="6" fill="#edd5ab"/><rect x="20" y="23" width="28" height="13" rx="6" fill="#ead0a3"/>
      <rect x="56" y="23" width="28" height="13" rx="6" fill="#ead0a3"/>
    </pattern>
    <pattern id="sand" width="60" height="40" patternUnits="userSpaceOnUse">
      <rect width="60" height="40" fill="#f3e0b8"/>
      <circle cx="10" cy="8" r="2" fill="#e6cc9a"/><circle cx="40" cy="20" r="2.5" fill="#e6cc9a"/><circle cx="24" cy="32" r="1.8" fill="#ead3a8"/><circle cx="52" cy="5" r="1.5" fill="#ead3a8"/>
    </pattern>
    <pattern id="grass" width="70" height="44" patternUnits="userSpaceOnUse">
      <rect width="70" height="44" fill="#dfe3ae"/>
      <path d="M10 30 l3 -8 l3 8 M44 14 l3 -8 l3 8 M58 38 l2 -6 l2 6" fill="none" stroke="#b9c983" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="30" cy="8" r="2.5" fill="#fff6e8"/><circle cx="64" cy="22" r="2" fill="#f6a5c0"/>
    </pattern>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6ea" stop-opacity="0"/><stop offset="1" stop-color="#fff6ea" stop-opacity=".35"/></linearGradient>
    <linearGradient id="groundDepth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8ec" stop-opacity=".35"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#5a3d30" stop-opacity=".14"/></linearGradient>
    <linearGradient id="cartVol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d2b24" stop-opacity=".16"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
    <pattern id="clothStripe" width="28" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="#f08a7e"/><rect x="14" width="14" height="10" fill="#fff4e0"/></pattern>
    <radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3d2b24" stop-opacity=".16"/></radialGradient>
    <!-- boyanmış görünüm: kâğıt lifi, fırça lekesi, suluboya kenarı -->
    <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .32  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .09 0"/>
    </filter>
    <filter id="wash" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".0035 .006" numOctaves="3" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 .92  0 0 0 0 .82  0 0 0 .22 -.05"/>
    </filter>
    <filter id="watercolor" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>

  <g id="bandSky">
  <rect width="1600" height="900" fill="url(#sky)"/>
  <rect class="paintfx" width="1600" height="560" filter="url(#wash)"/>
  <circle cx="1290" cy="170" r="190" fill="url(#sunGlow)"/>
  <circle cx="1290" cy="170" r="62" fill="#fff0bd"/>
  ${cloud(-20, false, 120, 1)}${cloud(-60, true, 220, 1.2)}${cloud(-45, false, 80, .7)}
  </g>
  <g id="bandF">
  <!-- uzak tepe + deniz feneri -->
  <path class="paintable" d="M1080 360 C1200 270 1320 250 1420 265 C1500 278 1560 300 1600 320 L1600 380 L1080 380Z" fill="#c4dc9b"/>
  <path d="M1180 360 C1260 310 1360 300 1450 312 C1520 322 1570 340 1600 352 L1600 380 L1180 380Z" fill="#acd08a"/>
  <g id="lighthouse" transform="translate(1440 190)">
    <path d="M10 0 L40 0 L46 90 L4 90Z" fill="#fffaf2"/>
    <path d="M8 22 L42 22 L43 40 L7 40Z M6 58 L44 58 L45 74 L5 74Z" fill="#f08a7e"/>
    <rect x="6" y="-22" width="38" height="24" rx="6" fill="#ffe9a6"/>
    <path d="M2 -22 L25 -46 L48 -22Z" fill="#f08a7e"/>
    <circle cx="25" cy="-10" r="30" fill="#fff3b0" opacity=".35" class="twinkle"/>
  </g>
  <path class="paintable" d="M0 330 C80 280 170 270 260 300 C330 320 380 335 420 345 L420 380 L0 380Z" fill="#d6cfe4" opacity=".8"/>

  <!-- deniz -->
  <rect x="0" y="340" width="1600" height="160" fill="url(#sea)"/>
  <g stroke="#e9fbf7" stroke-width="4" stroke-linecap="round">
    <line x1="160" y1="380" x2="190" y2="380" class="twinkle"/>
    <line x1="520" y1="400" x2="560" y2="400" class="twinkle" style="animation-delay:.8s"/>
    <line x1="880" y1="372" x2="905" y2="372" class="twinkle" style="animation-delay:1.3s"/>
    <line x1="1120" y1="410" x2="1160" y2="410" class="twinkle" style="animation-delay:.4s"/>
    <line x1="1340" y1="390" x2="1365" y2="390" class="twinkle" style="animation-delay:1.8s"/>
    <line x1="700" y1="430" x2="730" y2="430" class="twinkle" style="animation-delay:2.1s"/>
  </g>
  <g transform="translate(330 365)"><g class="bob">
    <path d="M0 20 L90 20 L74 42 L14 42Z" fill="#fffaf2"/><path d="M0 20 L90 20 L86 28 L4 28Z" fill="#4a7fb5"/>
    <line x1="45" y1="20" x2="45" y2="-38" stroke="#8a5a3c" stroke-width="4"/>
    <path d="M48 -34 L84 14 L48 14Z" fill="#fff4e0"/><path d="M42 -26 L14 14 L42 14Z" fill="#f08a7e"/>
  </g></g>
  </g>

  <g id="bandH">
  <g id="landmark" class="paintable"></g>
  <g id="houses" class="paintable"></g>
  <g id="spotBack"></g>
  <rect x="0" y="330" width="1600" height="232" fill="url(#haze)" pointer-events="none"/>
  <g id="festival"></g>
  <g id="ambientBack"></g>
  </g>

  <g id="bandG">
  <!-- zemin -->
  <rect id="ground" x="0" y="560" width="1600" height="340" fill="url(#cobble)"/>
  <rect id="curb" x="0" y="556" width="1600" height="10" fill="#e3c597"/>
  <rect x="0" y="560" width="1600" height="340" fill="url(#groundDepth)" pointer-events="none"/>

  <!-- zeytin ağacı -->
  <ellipse cx="160" cy="642" rx="80" ry="12" fill="#d9bb8b" opacity=".7"/>
  <g transform="translate(150 640)"><g class="sway">
    <path d="M-8 0 C-6 -50 -16 -80 -4 -120 L8 -120 C2 -80 12 -50 10 0Z" fill="#8a6a4f"/>
    <g id="treeA" fill="#9cb67f"><circle cx="-40" cy="-140" r="46"/><circle cx="20" cy="-170" r="52"/><circle cx="58" cy="-128" r="40"/><circle cx="-6" cy="-112" r="40"/></g>
    <g id="treeB" fill="#b5cb94"><circle cx="-30" cy="-158" r="22"/><circle cx="30" cy="-190" r="24"/></g>
    <g fill="#5d6e45"><circle cx="-10" cy="-150" r="5"/><circle cx="38" cy="-140" r="5"/><circle cx="-44" cy="-120" r="5"/><circle cx="16" cy="-184" r="5"/></g>
  </g></g>

  <!-- sergi masası -->
  <g transform="translate(390 610)">
    <ellipse cx="100" cy="150" rx="120" ry="14" fill="#d2b183" opacity=".7"/>
    <rect x="20" y="70" width="12" height="80" rx="4" fill="#7a4e33"/><rect x="168" y="70" width="12" height="80" rx="4" fill="#7a4e33"/>
    <rect x="0" y="54" width="200" height="22" rx="8" fill="#a8704a"/><rect x="0" y="54" width="200" height="8" rx="4" fill="#c48a5f"/>
    <path d="M6 72 L194 72 L188 104 C170 112 150 100 130 108 C110 116 90 102 70 110 C50 118 30 104 12 108Z" fill="url(#clothStripe)"/>
    <path d="M6 72 L194 72 L192 80 L8 80Z" fill="#c96f5a" opacity=".45"/>
    <g id="tableBooks"></g>
    <g id="slotTable" transform="translate(170 54)"></g>
    <g id="slotWrap" transform="translate(10 54)"></g>
  </g>

  <ellipse cx="830" cy="808" rx="310" ry="24" fill="#c9a676" opacity=".55"/>

  <!-- yazı tahtası: ayaklı kara tahta, tebeşirle kitap, çay ve kalp -->
  <g transform="translate(300 806)">
    <ellipse cx="0" cy="2" rx="42" ry="6" fill="#c9a676" opacity=".6"/>
    <path d="M-24 0 L-3 -98 L3 -98 L24 0" fill="none" stroke="#7a4e33" stroke-width="6" stroke-linecap="round"/>
    <path d="M-36 -4 L-13 -96 L13 -96 L36 -4Z" fill="#a8704a" stroke="#7a4e33" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-28 -12 L-9 -88 L9 -88 L28 -12Z" fill="#3f4a44"/>
    <g fill="none" stroke="#f3efe4" stroke-width="2" stroke-linecap="round" opacity=".9">
      <path d="M-12 -62 Q-6 -66 0 -62 Q6 -66 12 -62 L12 -50 Q6 -54 0 -50 Q-6 -54 -12 -50Z M0 -62 L0 -50"/>
      <path d="M-17 -38 L17 -38 M-20 -28 Q-10 -31 0 -28 T20 -28"/>
      <path d="M-14 -24 L-13 -16 L-7 -16 L-6 -24 M-6 -22 Q-2 -21 -6 -18"/>
    </g>
    <path d="M10 -76 C6 -80 1 -76 4 -72 L10 -67 L16 -72 C19 -76 14 -80 10 -76Z" fill="#f08a7e"/>
    <circle cx="-10" cy="-76" r="2.4" fill="#f2c45a"/><circle cx="12" cy="-20" r="2" fill="#f2c45a"/>
    <rect x="-32" y="-14" width="64" height="4" rx="2" fill="#7a4e33"/>
  </g>

  <!-- kitap arabası (render/cart-art.js): gövde rafların arkasında, çerçeve-tezgâh-tekerler önünde -->
  <g transform="translate(610 420)">
    <g id="cartBack"></g>
    <g id="shelves"></g>
    <rect x="50" y="130" width="350" height="26" fill="#000" opacity=".16" pointer-events="none"/>
    <g id="cartFront"></g>
    <g id="awning" class="awning"></g>
    <g id="slotRack"></g>
    <g id="slotRoof" transform="translate(392 18)"></g>
    <g id="slotGramo" transform="translate(86 18)"></g>
    <g id="slotWing" transform="translate(452 210)"></g>
    <rect id="cartHit" x="-70" y="-50" width="540" height="440" fill="transparent" style="cursor:pointer"/>
    <g id="lights"></g>
  </g>

  <!-- kedi: kasanın üstünde uyur -->
  <g transform="translate(1098 792)">
    <ellipse cx="46" cy="2" rx="62" ry="7" fill="#c9a676" opacity=".6"/>
    <rect x="0" y="-58" width="92" height="58" rx="4" fill="#c48a5f" stroke="#8a5a3c" stroke-width="3"/>
    <path d="M2 -39 L90 -39 M2 -20 L90 -20" stroke="#a8704a" stroke-width="3"/><path d="M12 -58 L12 0 M80 -58 L80 0" stroke="#8a5a3c" stroke-width="4"/>
    <rect x="26" y="-50" width="40" height="9" rx="2" fill="#e8d3b0"/>
  </g>
  <g transform="translate(1112 688)">
    <ellipse cx="40" cy="44" rx="44" ry="6" fill="#8a5a3c" opacity=".35"/>
    <path class="tail" d="M70 30 C110 30 116 0 100 -6" fill="none" stroke="#f0a35a" stroke-width="13" stroke-linecap="round"/>
    <g class="breathe"><ellipse cx="40" cy="22" rx="46" ry="26" fill="#f4b064"/>
      <path d="M10 22 C14 6 26 2 34 8" fill="none" stroke="#e08d3e" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 6 C50 2 60 4 64 10" fill="none" stroke="#e08d3e" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(-6 8)">
        <path d="M-8 -14 L-2 -30 L10 -18Z M18 -18 L28 -30 L32 -12Z" fill="#f4b064"/>
        <path d="M-4 -18 L-1 -25 L5 -19Z M21 -19 L26 -25 L28 -16Z" fill="#f7c9b8"/>
        <circle cx="12" cy="0" r="22" fill="#f4b064"/>
        <path d="M2 2 Q6 6 10 2 M16 2 Q20 6 24 2" fill="none" stroke="#5a3d30" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="1" cy="9" r="4" fill="#f59a8e" opacity=".6"/><circle cx="25" cy="9" r="4" fill="#f59a8e" opacity=".6"/>
        <path d="M11 9 L13 9 L12 11Z" fill="#c76b5e"/>
      </g>
    </g>
    <text x="10" y="-30" class="zzz" font-size="20" font-weight="700" fill="#8a7468">z</text>
    <text x="16" y="-30" class="zzz d2" font-size="16" font-weight="700" fill="#8a7468">z</text>
    <text x="22" y="-30" class="zzz d3" font-size="13" font-weight="700" fill="#8a7468">z</text>
  </g>

  <g id="slotGround" transform="translate(1510 780)"></g>
  <g id="slotChair" transform="translate(1428 812)"></g>
  <g id="slotCrates" transform="translate(1215 778)"></g>
  <g id="slotLantern" transform="translate(1330 772)"></g>
  <g id="slotHelper" transform="translate(522 810) scale(.62) translate(0 -806)"></g>
  <g id="ambientFront"></g>
  <g id="slotTea" transform="translate(64 660) scale(1.3)"></g>
  </g>

</svg>
<div id="sprites"></div>
<svg class="layer people-layer" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <g id="people"></g>
  <g id="fx"></g>
</svg>
<svg class="layer front-layer" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <g id="seasonFx"></g>
  <g id="weather"></g>
  <rect width="1600" height="900" fill="url(#vignette)"/>
  <rect class="paintfx" width="1600" height="900" filter="url(#paperGrain)" style="mix-blend-mode:multiply"/>
  <rect id="dusk" width="1600" height="900" fill="#3b2a5a" opacity="0"/>
</svg>`;

const WALLS = ['#fffaf0', '#fdf1e0', '#fbe6dc', '#eef3f7'];
const DOORS = ['#4a7fb5', '#5aa3a3', '#e57f73', '#7f9c5a'];
const ROOFS = ['#e07a5f', '#d9694f', '#e8906e'];
const BLOOM = ['#f06fa4', '#f58bb6', '#e9579a'];

// Evler ülkenin mimarisinde (render/landmarks.js ARCH): beşik çatı, düz dam (+ mavi kubbe), mansart; Mısır'da palmiye
function drawHouses(g, seed, country = 'tr') {
  g.innerHTML = '';
  const A = ARCH[country] || ARCH.tr;
  const r = seeded(seed), pick = a => a[Math.floor(r() * a.length)];
  let x = -40;
  while (x < 1640) {
    const w = 120 + r() * 90, h = 110 + r() * 70, base = 562, hg = el('g', {}, g);
    el('rect', { x, y: base - h, width: w, height: h, fill: pick(A.walls) }, hg);
    el('rect', { x, y: base - h, width: w, height: 6, fill: '#000', opacity: .05 }, hg);
    const rc = pick(A.roofs), top = base - h;
    if (A.roof === 'gable') el('path', { d: `M${x - 10} ${top} L${x + w / 2} ${top - 46} L${x + w + 10} ${top}Z`, fill: rc }, hg);
    else if (A.roof === 'mansard') el('path', { d: `M${x - 6} ${top} L${x + 14} ${top - 34} L${x + w - 14} ${top - 34} L${x + w + 6} ${top}Z`, fill: rc }, hg);
    else {
      el('rect', { x: x - 4, y: top - 8, width: w + 8, height: 10, rx: 2, fill: shade(A.walls[0], .96) }, hg);
      if (r() < A.dome) el('path', { d: `M${x + w / 2 - 34} ${top - 8} A34 34 0 0 1 ${x + w / 2 + 34} ${top - 8}Z`, fill: rc }, hg);
    }
    if (A.palm && r() < .5) {
      const px = x + w + 4;
      el('path', { d: `M${px} ${base} C${px + 4} ${base - 60} ${px - 4} ${base - 120} ${px + 6} ${base - 170}`, fill: 'none', stroke: '#8a6a4f', 'stroke-width': 7 }, hg);
      for (const a of [-60, -20, 20, 60, 100]) el('ellipse', { cx: px + 6 + Math.cos(a * Math.PI / 180) * 30, cy: base - 170 + Math.sin(a * Math.PI / 180) * 14, rx: 34, ry: 9, fill: '#7f9c5a', transform: `rotate(${a} ${px + 6} ${base - 170})` }, hg);
    }
    const dc = pick(A.doors);
    el('rect', { x: x + w / 2 - 15, y: base - 54, width: 30, height: 54, rx: 14, fill: dc }, hg);
    for (const wx of [x + 18, x + w - 44]) {
      el('rect', { x: wx, y: base - h + 26, width: 26, height: 30, rx: 12, fill: '#9cc7e0', class: 'win' }, hg);
      el('rect', { x: wx - 4, y: base - h + 56, width: 34, height: 6, rx: 3, fill: dc }, hg);
    }
    if (A.bloom && r() > .45) { // begonvil
      const bx = x + (r() > .5 ? 8 : w - 30);
      for (let i = 0; i < 9; i++) el('circle', { cx: bx + r() * 34, cy: base - h + 10 + r() * 60, r: 9 + r() * 8, fill: pick(BLOOM) }, hg);
      for (let i = 0; i < 4; i++) el('circle', { cx: bx + r() * 34, cy: base - h + 30 + r() * 50, r: 5, fill: '#7fb36d' }, hg);
    }
    x += w + 6 + r() * 30;
  }
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// Kitaba özgü sabit ton: aynı kitap her zaman aynı renkte görünür
const hash = str => [...str].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

// Raflar: her kitap bir sırt. Stok azaldıkça raflar gözle görülür boşalır.
const SHELF_Y = [178, 232, 284];
function drawShelves(g, S) {
  g.innerHTML = '';
  // oyuncunun dizdiği gibi: her rafta iki bölüm, kitaplar sırasıyla
  const L = syncLayout(S), per = sectionCap(S), unit = Math.min(28, 290 / (per * 2));
  const r = seeded(4242);
  SHELF_Y.forEach((sy, row) => {
    for (let half = 0; half < 2; half++) {
    let bx = 64 + half * (per * unit + 8);
    const sec = L.sections[row * 2 + half];
    for (let i = 0; i < per; i++) {
      const bw = unit * (.78 + r() * .14), bh = 36 + r() * 12, e = sec.books[i], b = e && { ...BOOK[e.id], isRare: e.rare };
      if (b) {
        const h = hash(b.id), col = shade(GENRES[b.genre].color, .86 + (h % 28) / 100);
        el('rect', { x: bx, y: sy - bh, width: bw, height: bh, rx: 3, fill: b.isRare ? '#e7b84a' : col, stroke: b.isRare ? '#fff3b0' : 'none', 'stroke-width': 1.5 }, g);
        if (b.isRare) el('circle', { cx: bx + bw / 2, cy: sy - bh - 6, r: 4, fill: '#fff6c2', class: 'twinkle' }, g);
        el('rect', { x: bx + 2.5, y: sy - bh + 7, width: bw - 5, height: 3.5, rx: 1.5, fill: '#fff', opacity: .6 }, g);
        if (h % 2) el('rect', { x: bx + 2.5, y: sy - 12, width: bw - 5, height: 3, rx: 1.5, fill: '#000', opacity: .15 }, g);
      }
      bx += unit;
    }
    }
    el('rect', { x: 54, y: sy, width: 342, height: 8, rx: 3, fill: '#a8704a' }, g);
  });
  // rafın ucunda küçük bir saksı
  el('rect', { x: 366, y: 160, width: 22, height: 18, rx: 4, fill: '#e0805f' }, g);
  el('circle', { cx: 377, cy: 154, r: 11, fill: '#7fb36d' }, g);
}

function drawTableBooks(g, counts) {
  // sergi masasında en kalabalık iki tür
  g.innerHTML = '';
  const top = GENRE_KEYS.filter(k => counts[k] > 0).sort((a, b) => counts[b] - counts[a]).slice(0, 2);
  top.forEach((k, i) => {
    const x = 8 + i * 72, n = Math.min(4, Math.ceil(counts[k] / 2));
    for (let j = 0; j < n; j++) {
      el('rect', { x: x + (j % 2) * 4, y: 40 - j * 13, width: 54 - (j % 2) * 6, height: 13, rx: 3, fill: shade(GENRES[k].color, .9 + j * .06) }, g);
    }
    el('text', { x: x + 27, y: 38 - n * 13, 'text-anchor': 'middle', 'font-size': 22 }, g).textContent = GENRES[k].icon;
  });
}

const AWNING = { top: 64, front: 100, x0: 44, x1: 406, f0: 16, f1: 434 };
function drawAwning(g, C = AWNINGS.mercan) {
  g.innerHTML = '';
  const A = AWNING, n = 10, col = i => i % 2 ? C.b : C.a;
  const tx = t => A.x0 + (A.x1 - A.x0) * t, fx = t => A.f0 + (A.f1 - A.f0) * t, sw = (A.f1 - A.f0) / n;
  for (let i = 0; i < n; i++) {
    const a = i / n, b = (i + 1) / n, x = A.f0 + i * sw;
    el('path', { d: `M${tx(a)} ${A.top} L${tx(b) + .5} ${A.top} L${fx(b) + .5} ${A.front} L${fx(a)} ${A.front}Z`, fill: col(i) }, g);
    // etek: düz şerit ve yarım daire uç
    el('rect', { x, y: A.front, width: sw + .5, height: 10, fill: col(i) }, g);
    el('path', { d: `M${x} ${A.front + 10} A${sw / 2} 9 0 0 0 ${x + sw} ${A.front + 10}Z`, fill: col(i) }, g);
  }
  el('path', { d: `M${A.x0} ${A.top} L${A.x1} ${A.top} L${A.f1} ${A.front} L${A.f0} ${A.front}Z`, fill: '#5a3d30', opacity: .08 }, g);
  el('rect', { x: A.x0 - 6, y: A.top - 6, width: A.x1 - A.x0 + 12, height: 9, rx: 4.5, fill: C.edge }, g);
  el('rect', { x: A.f0 - 2, y: A.front - 2, width: A.f1 - A.f0 + 4, height: 4, rx: 2, fill: C.edge, opacity: .7 }, g);
}

// iki renk arası karışım (k: 0..1)
function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// karavanın ışık zinciri: tentenin altındaki sarkık ipte 11 ampul (karavan koordinatında)
export const LIGHT_COLORS = ['#ffd56b', '#ff9e8a', '#9fe0d0', '#fff1b8'];
const LIGHT_Y = 116;
export function lightPoints() {
  const pts = [];
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    pts.push({ x: 20 + 410 * t, y: LIGHT_Y + 28 * t * (1 - t) * 2 + 6, c: LIGHT_COLORS[i % 4], delay: (i * .37) % 1.8 });
  }
  return pts;
}
function drawLights(g) {
  el('path', { d: `M20 ${LIGHT_Y} Q225 ${LIGHT_Y + 28} 430 ${LIGHT_Y}`, fill: 'none', stroke: '#5a3d30', 'stroke-width': 2.5 }, g);
  for (const p of lightPoints()) {
    el('circle', { cx: p.x, cy: p.y, r: 20, fill: p.c, class: 'glow' }, g);
    el('circle', { cx: p.x, cy: p.y, r: 7, fill: p.c, class: 'bulb', style: `animation-delay:${p.delay}s` }, g);
  }
}

export function buildScene(host) {
  host.innerHTML = MARKUP;
  const $ = id => host.querySelector('#' + id);
  drawAwning($('awning'));
  let lastDay = -1, lastWin = '', lastGlow = '';
  // sprite kabını sahnenin "slice" eşlemesiyle hizala (svg ile aynı ölçek ve kaydırma)
  const sprites = $('sprites');
  const fit = () => {
    const W = host.clientWidth, H = host.clientHeight, k = Math.max(W / 1600, H / 900);
    sprites.style.transform = `translate(${((W - 1600 * k) / 2).toFixed(1)}px, ${((H - 900 * k) / 2).toFixed(1)}px) scale(${k.toFixed(4)})`;
  };
  new ResizeObserver(fit).observe(host);
  fit();
  drawLights($('lights'));
  const svg = host.querySelector('svg');
  let cartLv = -1, cartPaint = 'nane', cartLamp = null;
  const drawCart = (lv, paint) => {
    if (lv === cartLv && paint === cartPaint) return;
    cartLv = lv; cartPaint = paint;
    const a = cartArt(lv, PAINTS[paint] || PAINTS.nane);
    cartLamp = a.lamp;
    $('cartBack').innerHTML = a.back;
    $('cartFront').innerHTML = a.front;
    for (const [id, k] of [['slotRoof', 'roof'], ['slotGramo', 'gramo'], ['slotWing', 'wing']]) $(id).setAttribute('transform', `translate(${a[k][0]} ${a[k][1]})`);
  };
  drawCart(0, 'nane');
  return {
    svg,
    // sahne koordinatı (1600×900) → ekran pikseli
    toClient(x, y) { const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const s = pt.matrixTransform(svg.getScreenCTM()); return { x: s.x, y: s.y }; },
    onCart(fn) { $('cartHit').addEventListener('click', fn); },
    setOpen() {},
    focus() {},
    snap() {},
    screenMap() { const m = svg.getScreenCTM(); return { left: m.e, top: m.f, s: m.a }; },
    // insanlar için görünüm (render/people.js svgView)
    crowdView() { return svgView(sprites, $('fx')); },
    people: $('people'),
    sprites,
    ambientBack: $('ambientBack'),
    ambientFront: $('ambientFront'),
    fx: $('fx'),
    setTown(key) {
      const t = TOWNS[key];
      $('skyTop').setAttribute('stop-color', t.sky[0]);
      $('skyBot').setAttribute('stop-color', t.sky[1]);
      $('seaTop').setAttribute('stop-color', t.sea[0]);
      $('seaBot').setAttribute('stop-color', t.sea[1]);
      drawHouses($('houses'), 7 + TOWN_KEYS.indexOf(key) * 101, t.country || 'tr');
      // iç bölgede deniz feneri olmaz
      $('lighthouse').style.display = t.inland ? 'none' : '';
    },
    // kasaba içindeki mekân: arka plan, zemin, evlerin görünürlüğü
    setSpot(scene, town) {
      scene = baseScene(scene);
      $('spotBack').innerHTML = spotArt(scene, town);
      $('landmark').innerHTML = landmarkArt(town);
      $('ground').setAttribute('fill', TOWNS[town]?.country === 'eg' && scene === 'tepe' ? 'url(#sand)' : GROUND[scene]);
      $('curb').setAttribute('fill', scene === 'sahil' ? '#ecd3a4' : scene === 'tepe' ? '#c9d38f' : '#e3c597');
      $('houses').style.display = SHOW_HOUSES[scene] ? '' : 'none';
    },
    // hava: yağmur çizgileri, bulut gölgesi, rüzgârda hızlanan bulutlar
    setWeather(key) {
      host.classList.toggle('windy', key === 'ruzgarli');
      let html = '';
      if (key === 'yagmurlu' || key === 'bulutlu') html += `<rect width="1600" height="900" fill="#5a6b80" opacity="${key === 'yagmurlu' ? .22 : .1}"/>`;
      if (key === 'yagmurlu') {
        const r = seeded(99);
        let lines = '';
        for (let i = 0; i < 90; i++) {
          const x = r() * 1700, y = r() * 1800 - 900;
          lines += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 10).toFixed(0)}" y2="${(y + 34).toFixed(0)}"/>`;
        }
        html += `<g class="rain" stroke="#e8f1fb" stroke-width="3" stroke-linecap="round" opacity=".75">${lines}</g>`;
      }
      $('weather').innerHTML = html;
    },
    // festival günü: karavanın yanında balonlar
    setFestival(on) {
      const cols = ['#f08a7e', '#f2c45a', '#5b8bd0', '#8bc49a', '#b98ad6'];
      $('festival').innerHTML = !on ? '' : cols.map((c, i) => {
        const x = 520 + (i % 3) * 34 - 30, y = 300 + (i % 2) * 40 + Math.floor(i / 3) * 30;
        return `<g class="bob" style="animation-delay:-${i * .6}s"><path d="M${x} ${y + 34} Q${x + 10} ${y + 120} 500 610" fill="none" stroke="#8a7468" stroke-width="2"/>
          <ellipse cx="${x}" cy="${y}" rx="24" ry="30" fill="${c}"/><ellipse cx="${x - 8}" cy="${y - 10}" rx="6" ry="9" fill="#fff" opacity=".45"/>
          <path d="M${x - 5} ${y + 30} L${x + 5} ${y + 30} L${x} ${y + 37}Z" fill="${c}"/></g>`;
      }).join('');
    },
    // mevsim: ağaç rengi, uçuşan yaprak/çiçek, kışın serin ton
    setSeason(name) {
      const P = SEASON_LOOK[name] || SEASON_LOOK['İlkbahar'];
      $('treeA').setAttribute('fill', P.a);
      $('treeB').setAttribute('fill', P.b);
      let html = P.tint ? `<rect width="1600" height="900" fill="${P.tint}" opacity=".1"/>` : '';
      if (P.bits) {
        const r = seeded(7);
        for (let i = 0; i < 16; i++) {
          const x = 100 + r() * 1700, d = (r() * 9).toFixed(1), dur = (7 + r() * 5).toFixed(1), c = P.bits[i % P.bits.length];
          html += `<g class="petal" style="animation-delay:-${d}s;animation-duration:${dur}s"><g transform="translate(${x.toFixed(0)} -40) scale(1.6)"><path class="tumble" style="animation-delay:-${d}s" d="M0 0 C8 -8 16 0 8 10 C0 14 -8 8 0 0Z" fill="${c}"/></g></g>`;
        }
      }
      $('seasonFx').innerHTML = html;
    },
    setStock(S) {
      drawShelves($('shelves'), S);
      drawTableBooks($('tableBooks'), genreCounts(S));
    },
    setDecor(on) {
      $('slotRoof').innerHTML = DECOR_ART[on.roof] || '';
      $('slotTable').innerHTML = DECOR_ART[on.table] || '';
      $('slotGround').innerHTML = DECOR_ART[on.ground] || '';
    },
    // karavan geliştirmeleri: çay köşesi (kaldırımda), plak çalar (çatıda), paket köşesi (sergi masasında), fener, çırak, okuma koltuğu;
    // araba basamağı 'lv0'..'lv3': araç değişir (render/cart-art.js); kitap arabasında koli yığını, büyük arabada yan kanat raf, karavanda bayrak dizisi
    setUpgrades(list) {
      $('slotTea').innerHTML = list.includes('cay') ? TEA_ART : '';
      $('slotChair').innerHTML = list.includes('koltuk') ? CHAIR_ART : '';
      $('slotGramo').innerHTML = list.includes('plak') ? GRAMO_ART : '';
      $('slotWrap').innerHTML = list.includes('paket') ? WRAP_ART : '';
      $('slotLantern').innerHTML = list.includes('fener') ? LANTERN_ART : '';
      $('slotHelper').innerHTML = list.includes('cirak') ? personSVG(424242, { age: 'child', hat: 1, hatC: '#f08a7e', coat: '#f2c45a' }) : '';
      const lv = Math.max(0, ...list.filter(x => /^lv\d$/.test(x)).map(x => +x[2]));
      $('slotCrates').innerHTML = lv >= 1 ? CRATES_ART : '';
      $('slotWing').innerHTML = lv >= 2 ? WING_ART : '';
      $('slotRack').innerHTML = lv >= 3 ? BUNTING_ART : '';
      drawCart(lv, cartPaint);
    },
    setPaint(key) { drawCart(Math.max(0, cartLv), key); },
    // arabanın fenerinin yeri (karavan koordinatı) ya da null
    lamp: () => cartLamp,
    setAwning(key) { drawAwning($('awning'), AWNINGS[key] || AWNINGS.mercan); },
    // yeni araba basamağı alınınca (canvas motorunda toz ve parıltı; burada yok)
    build() {},
    // akşam alacası: 0 gündüz, 1 kapanış
    // boyanmış doku açık/kapalı (telefonda performans için kapatılabilir)
    setPaintFx(on) { host.classList.toggle('nopaint', !on); },
    setDusk(k) { $('dusk').setAttribute('opacity', (k * .28).toFixed(3)); },
    // gün ışığı: sabah pembe, öğleden sonra altın, akşam mor; akşam pencereler ve ışık zinciri yanar
    setDaylight(t) {
      t = Math.round(t * 200) / 200;
      if (t === lastDay) return;
      lastDay = t;
      const d = $('dusk'), svg = host.querySelector('svg');
      let color = '#3b2a5a', op = 0;
      if (t < 0.15) { color = '#ff9fb8'; op = 0.07 * (1 - t / 0.15); }
      else if (t > 0.55 && t <= 0.82) { color = '#ffb347'; op = 0.12 * (t - 0.55) / 0.27; }
      else if (t > 0.82) { const k = (t - 0.82) / 0.18; color = mix('#ffb347', '#3b2a5a', k); op = 0.12 + 0.18 * k; }
      d.setAttribute('fill', color);
      d.setAttribute('opacity', op.toFixed(3));
      const night = Math.max(0, (t - 0.78) / 0.22);
      const win = night > 0.3 ? '#ffe08a' : '#9cc7e0', glow = (0.05 + night * 0.45).toFixed(2);
      if (win !== lastWin) { svg.style.setProperty('--win', win); lastWin = win; host.classList.toggle('lit', night > 0.3); }
      if (glow !== lastGlow) { svg.style.setProperty('--glow', glow); lastGlow = glow; }
    },
  };
}
