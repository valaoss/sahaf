// Süs eşyalarının çizimleri. Her biri yuvasının dip-orta noktasına (0,0) göre çizilir.
export const DECOR_ART = {
  // --- çatı ---
  kaktus: `<g class="sway">
    <path d="M-20 0 L20 0 L14 -32 L-14 -32Z" fill="#e0805f"/><rect x="-23" y="-38" width="46" height="9" rx="4" fill="#ea9677"/>
    <rect x="-8" y="-86" width="16" height="50" rx="8" fill="#7fb36d"/>
    <path d="M-8 -58 L-20 -58 C-24 -58 -24 -72 -20 -72 L-14 -72" fill="none" stroke="#7fb36d" stroke-width="9" stroke-linecap="round"/>
    <path d="M8 -66 L18 -66 C22 -66 22 -80 18 -80" fill="none" stroke="#7fb36d" stroke-width="9" stroke-linecap="round"/>
    <circle cx="0" cy="-90" r="7" fill="#f6a5c0"/></g>`,
  bayrak: `<line x1="0" y1="0" x2="0" y2="-96" stroke="#7a4e33" stroke-width="5" stroke-linecap="round"/>
    <circle cx="0" cy="-98" r="5" fill="#f2c45a"/>
    <path d="M0 -92 Q-40 -66 -84 -52" fill="none" stroke="#5a3d30" stroke-width="2.5"/>
    <g class="flutter">
      <path d="M-10 -86 L-2 -86 L-8 -70Z" fill="#f08a7e"/><path d="M-26 -78 L-17 -80 L-20 -63Z" fill="#f2c45a"/>
      <path d="M-43 -71 L-34 -73 L-37 -56Z" fill="#5b8bd0"/><path d="M-60 -64 L-51 -66 L-54 -50Z" fill="#8bc49a"/>
      <path d="M-77 -57 L-68 -59 L-71 -43Z" fill="#b98ad6"/>
    </g>`,
  firildak: `<line x1="0" y1="0" x2="0" y2="-80" stroke="#7a4e33" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(0 -84)"><g class="spin">
      <path d="M0 0 L0 -30 L20 -16Z" fill="#f08a7e"/><path d="M0 0 L30 0 L16 20Z" fill="#f2c45a"/>
      <path d="M0 0 L0 30 L-20 16Z" fill="#5b8bd0"/><path d="M0 0 L-30 0 L-16 -20Z" fill="#8bc49a"/>
      <circle r="5" fill="#fff6e8"/></g></g>`,

  // --- sergi masası ---
  bos: '',
  ayicik: `<g transform="translate(0 -2)">
    <ellipse cx="0" cy="-18" rx="17" ry="17" fill="#c98b56"/><ellipse cx="0" cy="-14" rx="9" ry="9" fill="#e9b98b"/>
    <circle cx="-15" cy="-6" r="7" fill="#c98b56"/><circle cx="15" cy="-6" r="7" fill="#c98b56"/>
    <circle cx="-13" cy="-52" r="7" fill="#c98b56"/><circle cx="13" cy="-52" r="7" fill="#c98b56"/>
    <circle cx="0" cy="-42" r="15" fill="#c98b56"/><ellipse cx="0" cy="-37" rx="7" ry="5" fill="#e9b98b"/>
    <circle cx="-5" cy="-45" r="2" fill="#3d2b24"/><circle cx="5" cy="-45" r="2" fill="#3d2b24"/><circle cx="0" cy="-38" r="2" fill="#3d2b24"/>
    <path d="M-10 -28 L10 -28 L6 -22 L-6 -22Z" fill="#f08a7e"/></g>`,
  buyutec: `<path d="M-26 -4 C-26 -26 -4 -34 8 -30 C22 -26 26 -14 24 -4Z" fill="#a98a62"/>
    <path d="M-30 -4 L30 -4 L28 0 L-28 0Z" fill="#8d7150"/><path d="M-12 -30 L-4 -38 L4 -30" fill="none" stroke="#8d7150" stroke-width="4"/>
    <g transform="translate(22 -14) rotate(-30)"><circle r="12" fill="#cfe8f2" stroke="#7a4e33" stroke-width="4"/><rect x="-3" y="12" width="6" height="18" rx="3" fill="#7a4e33"/></g>`,
  ejderha: `<ellipse cx="0" cy="-4" rx="22" ry="5" fill="#a8704a"/>
    <path d="M-14 -6 C-18 -26 -6 -36 4 -32 C14 -28 16 -16 12 -6Z" fill="#7fc49a"/>
    <path d="M10 -14 C24 -14 26 -2 18 -2" fill="none" stroke="#7fc49a" stroke-width="6" stroke-linecap="round"/>
    <circle cx="-2" cy="-40" r="11" fill="#7fc49a"/><circle cx="2" cy="-42" r="2.2" fill="#3d2b24"/>
    <path d="M-8 -48 L-12 -58 L-3 -50Z M2 -50 L4 -60 L8 -49Z" fill="#f2c45a"/>
    <path d="M-4 -26 C-22 -40 -30 -28 -26 -18 C-20 -24 -14 -22 -8 -18Z" fill="#a7dcb8"/>
    <path d="M12 -38 Q20 -42 22 -36" fill="none" stroke="#f08a7e" stroke-width="3" stroke-linecap="round"/>`,
  harita: `<g transform="rotate(-6)">
    <rect x="-28" y="-40" width="56" height="38" rx="3" fill="#f3e2bf" stroke="#c9a676" stroke-width="2"/>
    <path d="M-20 -30 C-10 -36 0 -22 10 -30 S 20 -18 22 -14" fill="none" stroke="#c96f5a" stroke-width="2.5" stroke-dasharray="4 4"/>
    <path d="M14 -18 l6 6 m0 -6 l-6 6" stroke="#c96f5a" stroke-width="2.5"/>
    <circle cx="-16" cy="-14" r="5" fill="#8bc49a"/>
    <rect x="-32" y="-44" width="8" height="46" rx="4" fill="#d8b886"/><rect x="24" y="-44" width="8" height="46" rx="4" fill="#d8b886"/></g>`,
  mum: `<rect x="-26" y="-34" width="14" height="34" rx="3" fill="#fff6e8" stroke="#e9cfae" stroke-width="2"/>
    <path class="flicker" d="M-19 -36 C-24 -44 -19 -52 -19 -54 C-15 -48 -13 -42 -19 -36Z" fill="#ffc76b"/>
    <circle cx="-19" cy="-44" r="12" fill="#fff3b0" opacity=".35" class="twinkle"/>
    <path d="M8 0 L24 0 L22 -22 L10 -22Z" fill="#9cc7e0" opacity=".8"/>
    <line x1="16" y1="-22" x2="16" y2="-44" stroke="#7fb36d" stroke-width="3"/>
    <ellipse cx="22" cy="-34" rx="6" ry="3" fill="#7fb36d" transform="rotate(-30 22 -34)"/>
    <circle cx="16" cy="-48" r="8" fill="#e5546a"/><path d="M12 -50 Q16 -44 20 -50" fill="none" stroke="#b83a52" stroke-width="2"/>`,
  demlik: `<path d="M-30 0 L-6 0 L-4 -6 L-32 -6Z" fill="#c9a676"/>
    <path d="M-28 -6 C-34 -22 -26 -30 -18 -30 C-10 -30 -2 -22 -8 -6Z" fill="#e57f73"/>
    <path d="M-26 -30 C-26 -44 -10 -44 -10 -30Z" fill="#f2c45a"/><circle cx="-18" cy="-46" r="3" fill="#f2c45a"/>
    <path d="M-8 -18 C2 -20 4 -28 6 -32" fill="none" stroke="#e57f73" stroke-width="4" stroke-linecap="round"/>
    <path d="M10 0 L24 0 L26 -24 L8 -24Z" fill="#d6563a" opacity=".85"/><path d="M8 -24 L26 -24" stroke="#fff6e8" stroke-width="2"/>
    <path d="M12 -10 C14 -6 20 -6 22 -10" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>
    <path class="steam" d="M17 -30 C13 -36 21 -40 17 -48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,

  // --- kaldırım ---
  saksi: `<g transform="translate(-30 -90)"><g class="sway">
    <path d="M0 40 L60 40 L52 90 L8 90Z" fill="#e0805f"/><rect x="-4" y="34" width="68" height="12" rx="6" fill="#ea9677"/>
    <g fill="#7fb36d"><ellipse cx="14" cy="16" rx="10" ry="26" transform="rotate(-20 14 16)"/><ellipse cx="30" cy="6" rx="10" ry="30"/><ellipse cx="46" cy="16" rx="10" ry="26" transform="rotate(20 46 16)"/></g>
    <g fill="#fff2a8"><circle cx="12" cy="-6" r="9"/><circle cx="30" cy="-22" r="10"/><circle cx="50" cy="-4" r="9"/></g>
    <g fill="#f2a64a"><circle cx="12" cy="-6" r="4"/><circle cx="30" cy="-22" r="4"/><circle cx="50" cy="-4" r="4"/></g>
  </g></g>`,
  askida: `<ellipse cx="0" cy="2" rx="40" ry="8" fill="#c9a676" opacity=".6"/>
    <rect x="-6" y="-70" width="12" height="72" rx="4" fill="#7a4e33"/>
    <rect x="-38" y="-140" width="76" height="74" rx="8" fill="#e57f73" stroke="#c45e52" stroke-width="5"/>
    <path d="M-44 -140 L0 -168 L44 -140Z" fill="#c45e52"/>
    <rect x="-28" y="-128" width="56" height="50" rx="4" fill="#fff6e8"/>
    <rect x="-24" y="-112" width="10" height="32" rx="2" fill="#5b8bd0"/><rect x="-12" y="-108" width="9" height="28" rx="2" fill="#f2c45a"/>
    <rect x="-1" y="-114" width="11" height="34" rx="2" fill="#8bc49a"/><rect x="12" y="-110" width="10" height="30" rx="2" fill="#b98ad6"/>
    <text x="0" y="-150" text-anchor="middle" font-size="13" font-weight="700" fill="#fff6e8">ASKIDA</text>`,
  lamba: `<ellipse cx="0" cy="2" rx="34" ry="7" fill="#c9a676" opacity=".6"/>
    <rect x="-16" y="-14" width="32" height="16" rx="5" fill="#4f5b66"/>
    <rect x="-5" y="-250" width="10" height="240" rx="5" fill="#4f5b66"/>
    <path d="M0 -246 C0 -270 40 -272 44 -250" fill="none" stroke="#4f5b66" stroke-width="7" stroke-linecap="round"/>
    <circle cx="44" cy="-212" r="46" fill="#fff3b0" opacity=".3" class="twinkle"/>
    <path d="M30 -250 L58 -250 L64 -230 L24 -230Z" fill="#4f5b66"/>
    <rect x="28" y="-230" width="32" height="34" rx="4" fill="#ffe08a" stroke="#4f5b66" stroke-width="4"/>
    <path d="M24 -196 L64 -196 L58 -188 L30 -188Z" fill="#4f5b66"/>`,
};
