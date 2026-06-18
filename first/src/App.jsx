import './App.css'

function Jaguar() {
  return (
    <svg
      viewBox="0 0 300 360"
      width="280"
      height="336"
      fill="none"
      stroke="#111"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Cute jaguar</title>

      {/* Head - broad and round */}
      <circle cx="150" cy="128" r="80" />

      {/* Left ear - short, rounded */}
      <path d="M88,85 L72,42 L120,68" />
      <path d="M93,82 L80,50 L115,70" />

      {/* Right ear */}
      <path d="M212,85 L228,42 L180,68" />
      <path d="M207,82 L220,50 L185,70" />

      {/* Muzzle - prominent jaguar jowl */}
      <ellipse cx="150" cy="160" rx="33" ry="21" />

      {/* Left eye */}
      <circle cx="120" cy="116" r="18" />
      <ellipse cx="120" cy="118" rx="10" ry="12" fill="#111" stroke="none" />
      <circle cx="114" cy="111" r="4.5" fill="white" stroke="none" />

      {/* Right eye */}
      <circle cx="180" cy="116" r="18" />
      <ellipse cx="180" cy="118" rx="10" ry="12" fill="#111" stroke="none" />
      <circle cx="174" cy="111" r="4.5" fill="white" stroke="none" />

      {/* Nose - wide */}
      <path d="M142,153 L150,161 L158,153 Q150,145 142,153Z" fill="#111" stroke="none" />

      {/* Mouth */}
      <path d="M140,162 Q150,171 160,162" />

      {/* Jaguar tear streak marks */}
      <path d="M124,132 Q121,147 117,162" />
      <path d="M176,132 Q179,147 183,162" />

      {/* Forehead rosette spots */}
      <ellipse cx="150" cy="88" rx="9" ry="6" />
      <circle cx="150" cy="88" r="2.5" fill="#111" stroke="none" />
      <ellipse cx="130" cy="98" rx="6" ry="5" />
      <ellipse cx="170" cy="98" rx="6" ry="5" />

      {/* Left whiskers */}
      <line x1="18" y1="151" x2="117" y2="157" />
      <line x1="16" y1="163" x2="117" y2="163" />
      <line x1="18" y1="175" x2="117" y2="169" />

      {/* Right whiskers */}
      <line x1="282" y1="151" x2="183" y2="157" />
      <line x1="284" y1="163" x2="183" y2="163" />
      <line x1="282" y1="175" x2="183" y2="169" />

      {/* Body - muscular */}
      <ellipse cx="150" cy="272" rx="68" ry="58" />

      {/* Body rosette 1 */}
      <circle cx="133" cy="252" r="15" />
      <circle cx="133" cy="252" r="5" fill="#111" stroke="none" />

      {/* Body rosette 2 */}
      <circle cx="168" cy="258" r="13" />
      <circle cx="168" cy="258" r="4" fill="#111" stroke="none" />

      {/* Body rosette 3 */}
      <circle cx="150" cy="286" r="11" />
      <circle cx="150" cy="286" r="3.5" fill="#111" stroke="none" />

      {/* Shoulder spots */}
      <ellipse cx="116" cy="237" rx="9" ry="7" />
      <circle cx="116" cy="237" r="2.5" fill="#111" stroke="none" />
      <ellipse cx="184" cy="237" rx="9" ry="7" />
      <circle cx="184" cy="237" r="2.5" fill="#111" stroke="none" />

      {/* Tail - long with spot */}
      <path d="M216,258 Q262,215 257,162 Q252,124 228,114" />
      <ellipse cx="254" cy="175" rx="7" ry="5" />
      <circle cx="254" cy="175" r="2" fill="#111" stroke="none" />

      {/* Left paw */}
      <ellipse cx="118" cy="320" rx="26" ry="11" />
      <path d="M104,317 Q111,327 118,328 Q125,327 132,317" />

      {/* Right paw */}
      <ellipse cx="182" cy="320" rx="26" ry="11" />
      <path d="M168,317 Q175,327 182,328 Q189,327 196,317" />
    </svg>
  )
}

function App() {
  return (
    <section id="center">
      <Jaguar />
      <h1>jaguar</h1>
    </section>
  )
}

export default App
