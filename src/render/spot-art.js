// Mekân sahneleri: evlerin önüne (ya da yerine) çizilen arka plan katmanı.
// Sahil: kumsal, iskele, şemsiyeler · Çarşı: tezgâhlar ve flamalar · Tepe: kasabaya göre kale, değirmen ya da şapel.

const umbrella = (x, c1, c2) => `<g transform="translate(${x} 560)">
  <line x1="0" y1="0" x2="0" y2="-92" stroke="#8a6a4f" stroke-width="5"/>
  <path d="M-62 -84 Q0 -132 62 -84Z" fill="${c1}"/>
  <path d="M-62 -84 Q-30 -122 0 -128 Q-12 -100 -20 -84Z M20 -84 Q12 -100 0 -128 Q30 -122 62 -84Z" fill="${c2}"/>
  <path d="M-62 -84 q10 8 20 0 q10 8 20 0 q10 8 22 0 q10 8 20 0 q10 8 20 0 q10 8 22 0" fill="none" stroke="${c1}" stroke-width="4"/>
</g>`;

const stall = (x, c1, c2, fruit) => `<g transform="translate(${x} 560)">
  <rect x="-80" y="-70" width="160" height="70" rx="6" fill="#b98a5e"/><rect x="-80" y="-70" width="160" height="10" fill="#a07448"/>
  <g fill="${fruit[0]}"><circle cx="-56" cy="-74" r="11"/><circle cx="-38" cy="-76" r="11"/><circle cx="-47" cy="-88" r="11"/></g>
  <g fill="${fruit[1]}"><circle cx="-6" cy="-75" r="10"/><circle cx="12" cy="-75" r="10"/><circle cx="3" cy="-88" r="10"/></g>
  <g fill="${fruit[2]}"><circle cx="40" cy="-74" r="11"/><circle cx="58" cy="-76" r="11"/><circle cx="49" cy="-88" r="11"/></g>
  <line x1="-74" y1="-70" x2="-74" y2="-160" stroke="#7a4e33" stroke-width="6"/><line x1="74" y1="-70" x2="74" y2="-160" stroke="#7a4e33" stroke-width="6"/>
  <path d="M-92 -150 L92 -150 L80 -178 L-80 -178Z" fill="${c1}"/>
  <path d="M-92 -150 L-56 -150 L-48 -178 L-80 -178Z M-20 -150 L16 -150 L16 -178 L-16 -178Z M52 -150 L92 -150 L80 -178 L48 -178Z" fill="${c2}"/>
  <path d="M-92 -150 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 18 0 q9 12 20 0" fill="${c1}"/>
</g>`;

const windmill = (x, y, s, delay) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-34 0 L-24 -120 L24 -120 L34 0Z" fill="#fffaf2"/><path d="M-30 -120 Q0 -158 30 -120Z" fill="#c96f5a"/>
  <rect x="-10" y="-34" width="20" height="34" rx="9" fill="#5b8bd0"/><rect x="-8" y="-90" width="16" height="16" rx="7" fill="#9cc7e0"/>
  <g transform="translate(0 -128)"><g class="spin slow" style="animation-delay:${delay}s">
    <path d="M0 0 L-8 -96 L8 -96Z M0 0 L96 -8 L96 8Z M0 0 L8 96 L-8 96Z M0 0 L-96 8 L-96 -8Z" fill="#8a6a4f"/>
    <path d="M-6 -90 L-30 -86 L-28 -30 L-6 -24Z M90 -6 L86 -30 L30 -28 L24 -6Z M6 90 L30 86 L28 30 L6 24Z M-90 6 L-86 30 L-30 28 L-24 6Z" fill="#fff4e0" opacity=".9"/>
    <circle r="8" fill="#5a3d30"/></g></g>
</g>`;

const CASTLE = `<g transform="translate(1440 560) scale(.9 1)">
  <path d="M-420 0 L-420 -120 L-380 -120 L-380 -140 L-350 -140 L-350 -120 L-310 -120 L-310 -140 L-280 -140 L-280 -120 L-240 -120 L-240 -170 L-200 -170 L-200 -190 L-170 -190 L-170 -170 L-140 -170 L-140 -190 L-110 -190 L-110 -170 L-80 -170 L-80 -120 L20 -120 L20 -140 L50 -140 L50 -120 L90 -120 L90 -140 L120 -140 L120 -120 L160 -120 L160 0Z" fill="#e2cfa9"/>
  <path d="M-240 0 L-240 -170 L-80 -170 L-80 0Z" fill="#d6c094"/>
  <path d="M-180 0 L-180 -60 Q-160 -90 -140 -60 L-140 0Z" fill="#8a6a4f"/>
  <g fill="#c9b285"><rect x="-400" y="-90" width="26" height="12" rx="3"/><rect x="-330" y="-60" width="30" height="12" rx="3"/><rect x="40" y="-80" width="30" height="12" rx="3"/><rect x="110" y="-50" width="26" height="12" rx="3"/></g>
  <rect x="-170" y="-150" width="14" height="22" rx="7" fill="#6b4a3a"/><rect x="-130" y="-150" width="14" height="22" rx="7" fill="#6b4a3a"/>
  <g fill="#7fb36d"><circle cx="-420" cy="-10" r="22"/><circle cx="160" cy="-12" r="26"/><circle cx="-300" cy="-6" r="16"/></g>
  <path d="M-160 -190 L-160 -240" stroke="#7a4e33" stroke-width="4"/><path d="M-160 -240 L-120 -228 L-160 -216Z" fill="#e5546a"/>
</g>`;

const CHAPEL = `<g transform="translate(1240 560) scale(.85)">
  <rect x="-110" y="-150" width="220" height="150" fill="#fffaf2"/>
  <path d="M-70 -150 A70 70 0 0 1 70 -150Z" fill="#9cc7e0"/><rect x="-6" y="-246" width="12" height="30" fill="#c9a676"/><rect x="-16" y="-236" width="32" height="8" fill="#c9a676"/>
  <rect x="-24" y="-70" width="48" height="70" rx="24" fill="#5b8bd0"/>
  <rect x="-86" y="-120" width="26" height="40" rx="13" fill="#9cc7e0"/><rect x="60" y="-120" width="26" height="40" rx="13" fill="#9cc7e0"/>
  <rect x="150" y="-210" width="70" height="210" fill="#fffaf2"/><path d="M144 -210 L185 -260 L226 -210Z" fill="#9cc7e0"/>
  <circle cx="185" cy="-160" r="16" fill="#f2c45a"/>
</g>`;

function tepe(town) {
  const hill = `<path d="M0 470 C200 400 420 380 640 410 C860 440 1080 380 1300 390 C1440 396 1540 420 1600 440 L1600 562 L0 562Z" fill="#b9d58f"/>
    <path d="M0 520 C260 480 520 470 800 490 C1080 510 1340 470 1600 490 L1600 562 L0 562Z" fill="#a6c97c"/>`;
  if (town === 'foca' || town === 'bozcaada' || town === 'assos') return hill + CASTLE;
  if (town === 'kapadokya') return hill;
  if (town === 'alacati') return hill + windmill(320, 480, .75, -1.2) + windmill(1210, 450, 1, 0) + windmill(1450, 490, .7, -2.1);
  return hill + CHAPEL + windmill(330, 490, .65, -.6);
}

const BUNTING = (() => {
  const cols = ['#f08a7e', '#f2c45a', '#5b8bd0', '#8bc49a', '#b98ad6', '#f6a5c0'];
  let flags = '';
  for (let i = 0; i < 26; i++) {
    const x = 20 + i * 62, y = 250 + Math.sin(i / 25 * Math.PI) * 50;
    flags += `<path d="M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 26}Z" fill="${cols[i % cols.length]}"/>`;
  }
  return `<path d="M0 248 Q800 352 1600 248" fill="none" stroke="#7a5a48" stroke-width="2.5"/><g class="flutter-slow">${flags}</g>`;
})();

export function spotArt(scene, town) {
  if (scene === 'sahil') return `
    <rect x="0" y="470" width="1600" height="92" fill="url(#sea)"/>
    <g stroke="#e9fbf7" stroke-width="4" stroke-linecap="round"><line x1="900" y1="510" x2="940" y2="510" class="twinkle"/><line x1="1250" y1="530" x2="1280" y2="530" class="twinkle" style="animation-delay:1s"/></g>
    <g transform="translate(0 0)">
      <rect x="180" y="486" width="400" height="18" rx="4" fill="#b98a5e"/><rect x="180" y="486" width="400" height="5" fill="#d8b07c"/>
      <g fill="#8a6a4f"><rect x="200" y="500" width="10" height="60"/><rect x="300" y="500" width="10" height="60"/><rect x="400" y="500" width="10" height="60"/><rect x="500" y="500" width="10" height="60"/><rect x="566" y="470" width="12" height="90"/></g>
      <circle cx="572" cy="470" r="15" fill="none" stroke="#f08a7e" stroke-width="7" stroke-dasharray="11 6"/>
    </g>
    <g transform="translate(660 486)"><g class="bob">
      <path d="M0 0 L120 0 L100 30 L18 30Z" fill="#fff6e8"/><path d="M0 0 L120 0 L116 9 L4 9Z" fill="#e57f73"/>
      <rect x="44" y="-30" width="34" height="30" rx="5" fill="#fffaf2" stroke="#5b8bd0" stroke-width="3"/>
    </g></g>
    <rect x="0" y="556" width="1600" height="12" fill="#ecd3a4"/>
    ${umbrella(1170, '#f08a7e', '#fff6e8')}${umbrella(1470, '#5b8bd0', '#fff6e8')}`;
  if (scene === 'carsi') return `${BUNTING}
    ${stall(250, '#f08a7e', '#fff6e8', ['#e5546a', '#f2c45a', '#8bc49a'])}
    ${stall(1050, '#5b8bd0', '#fff6e8', ['#f09a5e', '#b98ad6', '#e5546a'])}
    ${stall(1400, '#8bc49a', '#fff6e8', ['#f2c45a', '#e57f73', '#7fb36d'])}`;
  return tepe(town);
}

// Zemin: sahilde kum, tepede çimen, çarşıda arnavut kaldırımı
export const GROUND = { sahil: 'url(#sand)', carsi: 'url(#cobble)', tepe: 'url(#grass)' };
export const SHOW_HOUSES = { sahil: false, carsi: true, tepe: false };
