// Full Logo SVG Component
export function KarmastatLogoFull({ width = 400, height = 100 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="karmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0F766E' }} />
          <stop offset="50%" style={{ stopColor: '#14B8A6' }} />
          <stop offset="100%" style={{ stopColor: '#0F766E' }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Karma Infinity Symbol with Statistical Points */}
      <g transform="translate(10, 20)">
        <path
          d="M25 30 C25 10, 45 10, 55 30 C65 50, 85 50, 85 30 C85 10, 65 10, 55 30 C45 50, 25 50, 25 30"
          fill="none"
          stroke="url(#karmaGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* Data points representing statistical precision */}
        <circle cx="25" cy="30" r="5" fill="#F59E0B" />
        <circle cx="55" cy="30" r="6" fill="#14B8A6" />
        <circle cx="85" cy="30" r="5" fill="#F59E0B" />
        {/* Statistical curve hint */}
        <path d="M35 22 Q45 15, 55 22 Q65 29, 75 22" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.5" />
      </g>

      {/* KARMASTAT Typography */}
      <text x="120" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="36" fontWeight="800" fill="#134E4A" letterSpacing="3">KARMA</text>
      <text x="120" y="80" fontFamily="Inter, system-ui, sans-serif" fontSize="36" fontWeight="300" fill="#0F766E" letterSpacing="3">STAT</text>

      {/* Version Badge */}
      <rect x="305" y="28" width="45" height="22" rx="11" fill="#F59E0B" />
      <text x="327" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="white" textAnchor="middle">2.0</text>
    </svg>
  );
}

// Icon Logo SVG Component
export function KarmastatLogoIcon({ size = 66, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 33 C13 18, 24 18, 33 33 C42 48, 53 48, 53 33 C53 18, 42 18, 33 33 C24 48, 13 48, 13 33"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="13" cy="33" r="4" fill="#FCD34D" />
      <circle cx="33" cy="33" r="5" fill={color} />
      <circle cx="53" cy="33" r="4" fill="#FCD34D" />
      <path d="M20 27 Q27 21, 33 27 Q40 33, 46 27" stroke="#FCD34D" strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  );
}

// Small Icon for Header/Footer
export function KarmastatLogoSmall({ size = 40, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 20 C6 11, 13 11, 20 20 C27 29, 34 29, 34 20 C34 11, 27 11, 20 20 C13 29, 6 29, 6 20"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="6" cy="20" r="2.5" fill="#FCD34D" />
      <circle cx="20" cy="20" r="3" fill={color} />
      <circle cx="34" cy="20" r="2.5" fill="#FCD34D" />
    </svg>
  );
}

// Footer Logo
export function KarmastatLogoFooter({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 25 C8 13, 16 13, 25 25 C34 37, 42 37, 42 25 C42 13, 34 13, 25 25 C16 37, 8 37, 8 25"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="25" r="3" fill="#FCD34D" />
      <circle cx="25" cy="25" r="4" fill="white" />
      <circle cx="42" cy="25" r="3" fill="#FCD34D" />
    </svg>
  );
}

// Favicon SVG
export function KarmastatFavicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0F766E" />
      <path
        d="M6 16 C6 10, 11 10, 16 16 C21 22, 26 22, 26 16 C26 10, 21 10, 16 16 C11 22, 6 22, 6 16"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="6" cy="16" r="2" fill="#FCD34D" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
      <circle cx="26" cy="16" r="2" fill="#FCD34D" />
    </svg>
  );
}

export default KarmastatLogoFull;
