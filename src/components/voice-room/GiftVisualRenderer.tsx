import React from 'react';

interface GiftVisualRendererProps {
  giftName: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  animated?: boolean;
}

export const GiftVisualRenderer: React.FC<GiftVisualRendererProps> = ({
  giftName,
  size = 'hero',
  animated = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    hero: 'w-36 h-36 sm:w-44 sm:h-44',
  };

  const currentSize = sizeMap[size];

  // Helper for dynamic tier-based ambient lighting & sparkle rays
  const renderSparkleAura = (tier: 'low' | 'mid' | 'high' | 'mythic', color: string) => {
    if (!animated) return null;

    if (tier === 'mythic') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute -inset-4 bg-gradient-to-tr from-pink-500/20 via-amber-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
          <div
            className="absolute -inset-6 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent rounded-full blur-md animate-spin"
            style={{ animationDuration: '10s' }}
          />
          <div className="absolute -top-1 -right-1 text-amber-300 text-sm animate-pulse">✨</div>
          <div className="absolute -bottom-1 -left-1 text-pink-300 text-sm animate-bounce">🌸</div>
        </div>
      );
    }

    if (tier === 'high') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute -inset-3 bg-gradient-to-tr from-amber-500/20 via-red-500/15 to-yellow-400/15 rounded-full blur-lg animate-pulse" />
          <div
            className="absolute -inset-4 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent rounded-full blur-sm animate-spin"
            style={{ animationDuration: '8s' }}
          />
          <div className="absolute -top-1 -right-1 text-amber-300 text-xs animate-pulse">✨</div>
        </div>
      );
    }

    if (tier === 'mid') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute -inset-2 bg-gradient-to-tr from-purple-500/20 to-cyan-400/15 rounded-full blur-md animate-pulse" />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute -inset-2 bg-amber-400/15 rounded-full blur-sm animate-pulse" />
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  // 1. AŞK MEKTUBU (Love Letter - 50 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Aşk Mektubu' || giftName === 'Mektup') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('low', '#f43f5e')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_4px_16px_rgba(244,63,94,0.7)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff1f2" />
              <stop offset="50%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
            <linearGradient id="waxSeal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          {/* Angel Wings */}
          <path d="M 45 75 Q 15 50 10 25 Q 35 35 48 55" fill="url(#wingGrad)" opacity="0.85" />
          <path d="M 48 65 Q 25 75 18 95 Q 40 85 52 75" fill="url(#wingGrad)" opacity="0.75" />
          <path d="M 115 75 Q 145 50 150 25 Q 125 35 112 55" fill="url(#wingGrad)" opacity="0.85" />
          <path d="M 112 65 Q 135 75 142 95 Q 120 85 108 75" fill="url(#wingGrad)" opacity="0.75" />
          {/* Envelope Body */}
          <rect x="36" y="55" width="88" height="60" rx="8" fill="url(#envGrad)" stroke="#f472b6" strokeWidth="2" />
          {/* Envelope Fold Lines */}
          <path d="M 36 55 L 80 88 L 124 55" stroke="#f472b6" strokeWidth="2" fill="#fff1f2" opacity="0.9" />
          <path d="M 36 115 L 68 85" stroke="#f472b6" strokeWidth="1.5" strokeOpacity="0.5" />
          <path d="M 124 115 L 92 85" stroke="#f472b6" strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Wax Heart Seal */}
          <circle cx="80" cy="88" r="14" fill="url(#waxSeal)" filter="drop-shadow(0 2px 6px rgba(225,29,72,0.6))" />
          <path d="M 80 84 C 80 80 74 78 74 84 C 74 88 80 93 80 93 C 80 93 86 88 86 84 C 86 78 80 80 80 84 Z" fill="#fef08a" />
          {/* Floating mini hearts */}
          <path d="M 40 40 C 40 37 36 35 36 39 C 36 42 40 45 40 45 C 40 45 44 42 44 39 C 44 35 40 37 40 40 Z" fill="#fb7185" />
          <path d="M 122 38 C 122 35 118 33 118 37 C 118 40 122 43 122 43 C 122 43 126 40 126 37 C 126 33 122 35 122 38 Z" fill="#fb7185" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 2. ALTIN GÜL (Golden Rose - 100 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Altın Gül' || giftName === 'Gül') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('low', '#fbbf24')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.8)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="roseStem" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#052e16" />
            </linearGradient>
          </defs>
          <path d="M 80 85 Q 85 115 75 145" stroke="url(#roseStem)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 77 105 Q 55 100 48 112 Q 62 120 77 110" fill="#16a34a" stroke="#4ade80" strokeWidth="1" />
          <path d="M 81 120 Q 102 115 108 126 Q 96 134 80 125" fill="#16a34a" stroke="#4ade80" strokeWidth="1" />
          <path d="M 80 40 Q 60 45 60 65 Q 60 85 80 90 Q 100 85 100 65 Q 100 45 80 40 Z" fill="url(#roseGold)" />
          <path d="M 72 45 Q 65 58 75 75 Q 85 85 92 68 Q 95 52 82 46 Z" fill="#fde047" opacity="0.9" />
          <circle cx="80" cy="58" r="8" fill="#ca8a04" />
          <path d="M 76 56 Q 80 50 84 56 Q 80 62 76 56 Z" fill="#fef9c3" />
          <circle cx="68" cy="48" r="1.5" fill="#ffffff" />
          <circle cx="94" cy="54" r="1.5" fill="#ffffff" />
          <circle cx="80" cy="38" r="2" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 3. SİHİRLİ AYICIK (Magic Teddy Bear - 150 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Sihirli Ayıcık' || giftName === 'Ayıcık') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('low', '#fb7185')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_4px_16px_rgba(244,114,182,0.8)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bearFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="30%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="bearHeart" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          {/* Bear Ears */}
          <circle cx="56" cy="46" r="14" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1.5" />
          <circle cx="56" cy="46" r="8" fill="#fde68a" />
          <circle cx="104" cy="46" r="14" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1.5" />
          <circle cx="104" cy="46" r="8" fill="#fde68a" />
          {/* Bear Body */}
          <ellipse cx="80" cy="105" rx="36" ry="32" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1.5" />
          {/* Bear Paws / Feet */}
          <circle cx="52" cy="132" r="13" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1" />
          <circle cx="52" cy="132" r="7" fill="#fde68a" />
          <circle cx="108" cy="132" r="13" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1" />
          <circle cx="108" cy="132" r="7" fill="#fde68a" />
          {/* Big Glowing Heart in Arms */}
          <path
            d="M 80 82 C 80 68 62 62 62 80 C 62 98 80 114 80 114 C 80 114 98 98 98 80 C 98 62 80 68 80 82 Z"
            fill="url(#bearHeart)"
            stroke="#fef2f2"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 10px rgba(244,63,94,0.9))"
          />
          {/* Bear Arms Hugging Heart */}
          <ellipse cx="54" cy="92" rx="12" ry="9" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1.5" transform="rotate(-25 54 92)" />
          <ellipse cx="106" cy="92" rx="12" ry="9" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1.5" transform="rotate(25 106 92)" />
          {/* Bear Head */}
          <circle cx="80" cy="62" r="28" fill="url(#bearFur)" stroke="#92400e" strokeWidth="1.5" />
          {/* Snout */}
          <ellipse cx="80" cy="70" rx="13" ry="10" fill="#fef08a" />
          <ellipse cx="80" cy="67" rx="5" ry="3.5" fill="#451a03" />
          <path d="M 80 70.5 L 80 74 M 76 74 Q 80 77 84 74" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="70" cy="58" r="3.5" fill="#1e1b4b" />
          <circle cx="71" cy="57" r="1" fill="#ffffff" />
          <circle cx="90" cy="58" r="3.5" fill="#1e1b4b" />
          <circle cx="91" cy="57" r="1" fill="#ffffff" />
          {/* Blushing Cheeks */}
          <circle cx="63" cy="68" r="4" fill="#fb7185" opacity="0.6" />
          <circle cx="97" cy="68" r="4" fill="#fb7185" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 4. ALTIN ANAHTAR (Golden Key - 200 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Altın Anahtar' || giftName === 'Anahtar') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('low', '#a855f7')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_4px_18px_rgba(234,179,8,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldKey" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="gemAmethyst" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>
          <rect x="75" y="60" width="10" height="75" rx="3" fill="url(#goldKey)" stroke="#fde047" strokeWidth="1" />
          <rect x="85" y="112" width="16" height="6" rx="2" fill="url(#goldKey)" />
          <rect x="85" y="124" width="12" height="6" rx="2" fill="url(#goldKey)" />
          <circle cx="80" cy="48" r="24" fill="none" stroke="url(#goldKey)" strokeWidth="6" />
          <circle cx="80" cy="48" r="16" fill="url(#gemAmethyst)" stroke="#fde047" strokeWidth="2" filter="drop-shadow(0 0 8px #c084fc)" />
          <polygon points="80,38 88,46 80,58 72,46" fill="#f5d0fe" opacity="0.8" />
          <polygon points="74,24 80,18 86,24 80,22" fill="#fde047" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 5. PIRLANTA YÜZÜK (Diamond Ring - 300 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Pırlanta Yüzük' || giftName === 'Yüzük' || giftName === 'Tektaş') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#38bdf8')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_4px_20px_rgba(56,189,248,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#e0f2fe" />
              <stop offset="70%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          {/* Ring Platinum/Gold Band */}
          <ellipse cx="80" cy="108" rx="42" ry="32" fill="none" stroke="url(#ringGold)" strokeWidth="10" />
          <ellipse cx="80" cy="108" rx="42" ry="32" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 14" opacity="0.8" />
          {/* Prongs */}
          <path d="M 68 62 L 72 45 M 92 62 L 88 45" stroke="url(#ringGold)" strokeWidth="4" strokeLinecap="round" />
          {/* Giant Faceted Diamond */}
          <polygon points="80,24 105,44 80,72 55,44" fill="url(#diamondGrad)" stroke="#ffffff" strokeWidth="1.5" />
          <polygon points="66,44 94,44 80,72" fill="#bae6fd" opacity="0.7" />
          <polygon points="80,24 66,44 94,44" fill="#ffffff" opacity="0.9" />
          <polygon points="55,44 66,44 80,72" fill="#38bdf8" opacity="0.8" />
          <polygon points="105,44 94,44 80,72" fill="#0284c7" opacity="0.7" />
          {/* Prismatic Star Sparkles */}
          <polygon points="80,14 83,22 91,22 84,26 87,34 80,28 73,34 76,26 69,22 77,22" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
          <circle cx="56" cy="36" r="2.5" fill="#ffffff" />
          <circle cx="106" cy="38" r="2" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 6. GÜL BUKETİ (Rose Bouquet - 500 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Gül Buketi' || giftName === 'Buket') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#e11d48')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_6px_22px_rgba(225,29,72,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="roseRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="40%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="wrapCone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
          {/* Luxury Paper Cone Wrapping */}
          <polygon points="80,146 50,86 110,86" fill="url(#wrapCone)" stroke="url(#goldRibbon)" strokeWidth="2" />
          {/* Bouquet Leaves Background */}
          <circle cx="58" cy="62" r="16" fill="#15803d" />
          <circle cx="102" cy="62" r="16" fill="#15803d" />
          <circle cx="80" cy="44" r="16" fill="#166534" />
          {/* Cluster of 7 Roses */}
          {[
            { cx: 80, cy: 46, r: 16 },
            { cx: 62, cy: 58, r: 15 },
            { cx: 98, cy: 58, r: 15 },
            { cx: 70, cy: 75, r: 15 },
            { cx: 90, cy: 75, r: 15 },
            { cx: 50, cy: 76, r: 13 },
            { cx: 110, cy: 76, r: 13 },
          ].map((r, i) => (
            <g key={i}>
              <circle cx={r.cx} cy={r.cy} r={r.r} fill="url(#roseRed)" stroke="#fecdd3" strokeWidth="1" />
              <path d={`M ${r.cx - 5} ${r.cy - 2} Q ${r.cx} ${r.cy - 7} ${r.cx + 5} ${r.cy - 2} Q ${r.cx} ${r.cy + 5} ${r.cx - 5} ${r.cy - 2}`} fill="#fda4af" opacity="0.8" />
              <circle cx={r.cx} cy={r.cy} r={r.r * 0.3} fill="#4c0519" />
            </g>
          ))}
          {/* Golden Ribbon Bow & Tails */}
          <ellipse cx="80" cy="88" rx="8" ry="6" fill="url(#goldRibbon)" />
          <path d="M 80 88 Q 65 78 56 86 Q 66 94 80 88" fill="url(#goldRibbon)" />
          <path d="M 80 88 Q 95 78 104 86 Q 94 94 80 88" fill="url(#goldRibbon)" />
          <path d="M 78 92 L 68 116 M 82 92 L 92 116" stroke="url(#goldRibbon)" strokeWidth="3" strokeLinecap="round" />
          {/* Sparkles */}
          <circle cx="42" cy="48" r="2" fill="#fde047" />
          <circle cx="118" cy="46" r="2" fill="#fde047" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 7. GECE PARFÜMÜ (Night Fragrance - 200 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Gece Parfümü' || giftName === 'Parfüm') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('low', '#c084fc')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_6px_20px_rgba(192,132,252,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="potionLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="goldCap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="30" r="12" fill="#e879f9" opacity="0.3" filter="blur(4px)" />
          <circle cx="80" cy="20" r="6" fill="#f0abfc" opacity="0.5" filter="blur(2px)" />
          <circle cx="80" cy="46" r="6" fill="url(#goldCap)" />
          <rect x="76" y="52" width="8" height="12" rx="2" fill="url(#goldCap)" stroke="#fde047" strokeWidth="1" />
          <path d="M 60 70 L 100 70 L 115 110 Q 115 135 80 135 Q 45 135 45 110 Z" fill="url(#potionLiquid)" stroke="#e9d5ff" strokeWidth="2" />
          <path d="M 55 85 Q 52 105 56 120" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <circle cx="80" cy="100" r="10" fill="#f5d0fe" opacity="0.3" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 8. ALTIN KUPA (Golden Trophy - 400 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Altın Kupa' || giftName === 'Kupa') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#eab308')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_6px_22px_rgba(234,179,8,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Base Pedestal */}
          <rect x="52" y="132" width="56" height="16" rx="4" fill="url(#pedestalGrad)" stroke="url(#trophyGold)" strokeWidth="1.5" />
          <rect x="62" y="122" width="36" height="10" rx="2" fill="url(#trophyGold)" />
          {/* Trophy Stem */}
          <path d="M 75 102 L 75 122 L 85 122 L 85 102 Z" fill="url(#trophyGold)" />
          <ellipse cx="80" cy="102" rx="14" ry="4" fill="url(#trophyGold)" />
          {/* Handles */}
          <path d="M 54 48 C 30 48 30 84 54 84" fill="none" stroke="url(#trophyGold)" strokeWidth="5" strokeLinecap="round" />
          <path d="M 106 48 C 130 48 130 84 106 84" fill="none" stroke="url(#trophyGold)" strokeWidth="5" strokeLinecap="round" />
          {/* Trophy Chalice Cup Body */}
          <path d="M 52 38 L 108 38 L 104 76 Q 100 102 80 102 Q 60 102 56 76 Z" fill="url(#trophyGold)" stroke="#fef08a" strokeWidth="2" />
          <ellipse cx="80" cy="38" rx="28" ry="6" fill="#fef08a" />
          {/* Number 1 Star Medallion */}
          <circle cx="80" cy="66" r="14" fill="#ca8a04" stroke="#fef08a" strokeWidth="1.5" />
          <text x="80" y="72" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="sans-serif">1</text>
          {/* Laurel Wreath Accents */}
          <path d="M 64 68 Q 66 78 72 82 M 96 68 Q 94 78 88 82" stroke="#fef08a" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Sparkles */}
          <polygon points="80,22 83,28 89,28 84,32 86,38 80,34 74,38 76,32 71,28 77,28" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 9. PİYANO MELODİLERİ (Piano Melodies - 600 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Piyano Melodileri' || giftName === 'Piyano') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#eab308')}
        <svg viewBox="0 0 180 160" className="w-full h-full filter drop-shadow-[0_8px_24px_rgba(245,158,11,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pianoBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
          <path d="M 35 45 Q 90 15 145 35" stroke="url(#goldTrim)" strokeWidth="2.5" strokeDasharray="4 4" opacity="0.8" />
          <text x="38" y="42" fill="#fde047" fontSize="16" fontWeight="bold">♪</text>
          <text x="85" y="28" fill="#fde047" fontSize="20" fontWeight="bold">♫</text>
          <text x="135" y="38" fill="#fde047" fontSize="18" fontWeight="bold">♬</text>
          <path d="M 40 70 L 140 70 Q 145 95 130 115 L 45 115 Q 38 95 40 70 Z" fill="url(#pianoBody)" stroke="url(#goldTrim)" strokeWidth="2.5" />
          <polygon points="40,70 115,40 135,70" fill="#312e81" stroke="#fde047" strokeWidth="1.5" opacity="0.9" />
          <rect x="48" y="95" width="78" height="15" rx="2" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          {[55, 62, 75, 82, 89, 102, 109, 116].map((x, i) => (
            <rect key={i} x={x} y="95" width="4" height="9" fill="#0f172a" />
          ))}
          <rect x="46" y="115" width="5" height="24" rx="2" fill="url(#goldTrim)" />
          <rect x="122" y="115" width="5" height="24" rx="2" fill="url(#goldTrim)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 10. HAVAİ FİŞEK (Fireworks Show - 800 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Havai Fişek') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#06b6d4')}
        <svg viewBox="0 0 180 180" className="w-full h-full filter drop-shadow-[0_8px_28px_rgba(6,182,212,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Burst Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 90 + Math.cos(rad) * 22;
            const y1 = 80 + Math.sin(rad) * 22;
            const x2 = 90 + Math.cos(rad) * 65;
            const y2 = 80 + Math.sin(rad) * 65;
            const colors = ['#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'];
            const strokeColor = colors[i % colors.length];
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
                <circle cx={x2} cy={y2} r="3" fill={strokeColor} filter="drop-shadow(0 0 4px #ffffff)" />
              </g>
            );
          })}
          {/* Inner Sparkle Flash */}
          <circle cx="90" cy="80" r="14" fill="#ffffff" filter="drop-shadow(0 0 12px #facc15)" />
          {/* Rocket Soaring Upward */}
          <polygon points="90,115 84,138 96,138" fill="url(#rocketGrad)" />
          <polygon points="90,110 82,120 98,120" fill="#f43f5e" />
          <path d="M 90 138 Q 88 155 90 168" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 3" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 11. KAR KÜRESİ (Snow Globe - 1200 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Kar Küresi') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#38bdf8')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_8px_26px_rgba(56,189,248,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="globeBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="60%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0700" />
            </linearGradient>
            <linearGradient id="glassSphere" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Base Stand */}
          <ellipse cx="80" cy="138" rx="42" ry="12" fill="url(#globeBase)" stroke="#eab308" strokeWidth="2" />
          <path d="M 44 126 L 38 138 L 122 138 L 116 126 Z" fill="url(#globeBase)" />
          <ellipse cx="80" cy="126" rx="36" ry="6" fill="#ca8a04" />
          {/* Glass Orb Body */}
          <circle cx="80" cy="74" r="50" fill="url(#glassSphere)" stroke="#bae6fd" strokeWidth="2.5" />
          {/* Inner Snow Ground */}
          <path d="M 38 98 Q 80 108 122 98 Q 115 118 80 122 Q 45 118 38 98 Z" fill="#f8fafc" />
          {/* Fairytale Ice Castle Inside */}
          <rect x="74" y="62" width="12" height="38" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="80,48 72,62 88,62" fill="#38bdf8" />
          <rect x="62" y="74" width="10" height="26" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="67,64 60,74 74,74" fill="#38bdf8" />
          <rect x="88" y="74" width="10" height="26" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="93,64 86,74 100,74" fill="#38bdf8" />
          {/* Castle Windows */}
          <rect x="78" y="74" width="4" height="6" rx="2" fill="#fef08a" />
          {/* Swirling Snowflakes */}
          {[
            { cx: 55, cy: 50, r: 2 },
            { cx: 105, cy: 54, r: 2.5 },
            { cx: 95, cy: 40, r: 1.5 },
            { cx: 62, cy: 72, r: 1.5 },
            { cx: 98, cy: 82, r: 2 },
            { cx: 50, cy: 92, r: 2 },
            { cx: 110, cy: 94, r: 2.5 },
          ].map((s, idx) => (
            <circle key={idx} cx={s.cx} cy={s.cy} r={s.r} fill="#ffffff" opacity="0.9" />
          ))}
          {/* Specular Glint Reflection */}
          <path d="M 52 45 A 40 40 0 0 1 85 36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 12. MİSTİK ZÜMRÜT (Mystic Emerald - 1500 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Mistik Zümrüt' || giftName === 'Zümrüt') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#10b981')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_8px_30px_rgba(16,185,129,0.95)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="emeraldFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="emeraldFacet2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          {/* Outer Mystical Rune Ring */}
          <circle cx="80" cy="80" r="62" stroke="#34d399" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.7" />
          <circle cx="80" cy="80" r="56" stroke="#6ee7b7" strokeWidth="0.8" opacity="0.4" />
          {/* Emerald Outer Octagon Base */}
          <polygon points="56,38 104,38 132,66 132,104 104,132 56,132 28,104 28,66" fill="url(#emeraldFacet2)" stroke="#a7f3d0" strokeWidth="2.5" />
          {/* Inner Table Octagon */}
          <polygon points="62,54 98,54 116,72 116,98 98,116 62,116 44,98 44,72" fill="url(#emeraldFacet1)" stroke="#d1fae5" strokeWidth="1.5" />
          {/* Facet Diagonal Connectors */}
          <line x1="56" y1="38" x2="62" y2="54" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="104" y1="38" x2="98" y2="54" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="132" y1="66" x2="116" y2="72" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="132" y1="104" x2="116" y2="98" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="104" y1="132" x2="98" y2="116" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="56" y1="132" x2="62" y2="116" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="28" y1="104" x2="44" y2="98" stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="28" y1="66" x2="44" y2="72" stroke="#d1fae5" strokeWidth="1.5" />
          {/* Brilliant Center Core Flash */}
          <polygon points="80,66 94,80 80,94 66,80" fill="#ecfdf5" opacity="0.8" />
          <polygon points="80,50 83,58 91,58 84,62 86,70 80,65 74,70 76,62 69,58 77,58" fill="#ffffff" filter="drop-shadow(0 0 8px #6ee7b7)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 13. LÜKS ÇANTA (Luxury Bag - 1888 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Lüks Çanta' || giftName === 'Çanta') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mid', '#f59e0b')}
        <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_8px_25px_rgba(217,119,6,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="leatherBag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0700" />
            </linearGradient>
            <linearGradient id="goldChain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          <path d="M 55 70 Q 80 20 105 70" stroke="url(#goldChain)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 45 70 L 115 70 L 125 125 Q 125 135 115 135 L 45 135 Q 35 135 35 125 Z" fill="url(#leatherBag)" stroke="url(#goldChain)" strokeWidth="2" />
          <path d="M 40 85 L 120 85 M 40 100 L 120 100 M 40 115 L 120 115" stroke="#92400e" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 45 70 L 115 70 L 105 100 L 55 100 Z" fill="#92400e" stroke="url(#goldChain)" strokeWidth="1.5" />
          <circle cx="80" cy="100" r="7" fill="url(#goldChain)" />
          <polygon points="80,94 85,99 80,105 75,99" fill="#e0f2fe" filter="drop-shadow(0 0 4px #38bdf8)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 14. SERVET SANDIĞI (Wealth Box - 2500 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Servet Sandığı' || giftName === 'Hazine Sandığı') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#eab308')}
        <svg viewBox="0 0 180 160" className="w-full h-full filter drop-shadow-[0_10px_30px_rgba(234,179,8,1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="imperialGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <linearGradient id="rubyGem" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          <rect x="40" y="85" width="100" height="50" rx="6" fill="#451a03" stroke="url(#imperialGold)" strokeWidth="3" />
          <rect x="36" y="80" width="108" height="12" rx="3" fill="url(#imperialGold)" />
          {[50, 65, 80, 95, 110, 125].map((cx, i) => (
            <circle key={i} cx={cx} cy={78} r="8" fill="url(#imperialGold)" stroke="#fef08a" strokeWidth="1" />
          ))}
          <path
            d="M 50 65 L 56 30 L 70 48 L 90 20 L 110 48 L 124 30 L 130 65 Z"
            fill="url(#imperialGold)"
            stroke="#fef08a"
            strokeWidth="2"
            filter="drop-shadow(0 0 10px #facc15)"
          />
          <circle cx="90" cy="20" r="4.5" fill="url(#rubyGem)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="56" cy="30" r="3.5" fill="#38bdf8" />
          <circle cx="124" cy="30" r="3.5" fill="#38bdf8" />
          <circle cx="90" cy="52" r="5" fill="url(#rubyGem)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 15. KRALİYET TACI (Royal Crown - 3500 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Kraliyet Tacı' || giftName === 'Kral Tacı' || giftName === 'Taç') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#fbbf24')}
        <svg viewBox="0 0 180 160" className="w-full h-full filter drop-shadow-[0_10px_32px_rgba(251,191,36,1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="crownVelvet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="60%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
            <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="gemRuby" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
          </defs>
          {/* Inner Purple Imperial Velvet Cap */}
          <path d="M 46 95 Q 40 45 90 42 Q 140 45 134 95 Z" fill="url(#crownVelvet)" stroke="#eab308" strokeWidth="1" />
          {/* White Ermine Fur Rim at Bottom */}
          <rect x="36" y="98" width="108" height="18" rx="9" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {[48, 62, 76, 90, 104, 118, 132].map((x, idx) => (
            <circle key={idx} cx={x} cy={107} r="2.5" fill="#0f172a" />
          ))}
          {/* Crown Solid Gold Headband */}
          <rect x="38" y="86" width="104" height="15" rx="3" fill="url(#crownGold)" stroke="#fef08a" strokeWidth="1.5" />
          {/* Embedded Rubies and Sapphires in Headband */}
          {[48, 69, 90, 111, 132].map((x, i) => (
            <circle key={i} cx={x} cy={93.5} r={i % 2 === 0 ? 4 : 3.5} fill={i % 2 === 0 ? "url(#gemRuby)" : "#0284c7"} stroke="#ffffff" strokeWidth="0.8" />
          ))}
          {/* Arched Fleur-de-lis Spikes */}
          <path d="M 42 86 L 48 56 L 62 74 L 90 46 L 118 74 L 132 56 L 138 86 Z" fill="url(#crownGold)" stroke="#fef08a" strokeWidth="2" />
          {/* Top Cross Orb */}
          <circle cx="90" cy="38" r="6" fill="url(#crownGold)" stroke="#fef08a" strokeWidth="1" />
          <path d="M 90 26 L 90 34 M 86 30 L 94 30" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sparkles */}
          <circle cx="48" cy="54" r="3" fill="url(#gemRuby)" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="132" cy="54" r="3" fill="url(#gemRuby)" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 16. ALTIN HELİKOPTER (Golden Helicopter - 5000 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Altın Helikopter' || giftName === 'Helikopter') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#facc15')}
        <svg viewBox="0 0 200 140" className="w-full h-full filter drop-shadow-[0_10px_32px_rgba(250,204,21,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heliGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="heliGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Spinning Main Rotor Blades (Blurred Motion Arc) */}
          <line x1="20" y1="28" x2="175" y2="28" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="98" cy="28" rx="80" ry="6" fill="#fef08a" opacity="0.25" />
          {/* Rotor Mast */}
          <rect x="94" y="28" width="8" height="16" fill="url(#heliGold)" />
          {/* Tail Boom & Tail Fin */}
          <path d="M 98 62 L 175 48 L 180 54 L 105 72 Z" fill="url(#heliGold)" stroke="#ca8a04" strokeWidth="1" />
          <polygon points="175,48 185,32 188,34 182,54" fill="url(#heliGold)" />
          {/* Small Tail Rotor */}
          <line x1="184" y1="25" x2="184" y2="52" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Main Fuselage Body */}
          <path d="M 50 82 Q 40 52 75 44 L 115 44 Q 135 55 125 82 Q 105 92 65 90 Z" fill="url(#heliGold)" stroke="#fef08a" strokeWidth="2" />
          {/* VIP Panoramic Cockpit Glass */}
          <path d="M 48 76 Q 44 58 66 50 L 88 50 L 85 78 Z" fill="url(#heliGlass)" stroke="#ffffff" strokeWidth="1.5" />
          {/* Landing Skids */}
          <line x1="50" y1="112" x2="125" y2="112" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <line x1="68" y1="88" x2="65" y2="112" stroke="#94a3b8" strokeWidth="3" />
          <line x1="108" y1="88" x2="105" y2="112" stroke="#94a3b8" strokeWidth="3" />
          {/* VIP Star Crest */}
          <circle cx="106" cy="66" r="6" fill="#ca8a04" />
          <polygon points="106,62 108,65 111,65 108,67 109,70 106,68 103,70 104,67 101,65 104,65" fill="#fef08a" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 17. LÜKS YAT (Luxury Yacht - 7500 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Lüks Yat' || giftName === 'Yat') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#06b6d4')}
        <svg viewBox="0 0 220 140" className="w-full h-full filter drop-shadow-[0_10px_32px_rgba(6,182,212,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="yachtHull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="seaWaves" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <linearGradient id="yachtGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          {/* Azure Ocean Wake and Waves */}
          <path d="M 15 116 Q 50 110 90 118 Q 140 108 195 118 L 205 128 L 10 128 Z" fill="url(#seaWaves)" opacity="0.9" />
          <path d="M 25 120 Q 60 115 100 122 Q 150 114 200 122" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          {/* Yacht Main Hull */}
          <path d="M 32 94 L 180 94 L 202 82 L 182 112 L 40 112 Z" fill="url(#yachtHull)" stroke="#e2e8f0" strokeWidth="1.5" />
          {/* Gold Hull Stripe */}
          <line x1="38" y1="104" x2="186" y2="104" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          {/* Main Deck Cabin */}
          <path d="M 55 94 L 160 94 L 152 74 L 68 74 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          {/* Panorama Windows */}
          <rect x="75" y="78" width="70" height="11" rx="3" fill="url(#yachtGlass)" stroke="#38bdf8" strokeWidth="1" />
          {/* Upper Flybridge Deck */}
          <path d="M 75 74 L 138 74 L 132 58 L 92 58 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="96" y="62" width="30" height="8" rx="2" fill="url(#yachtGlass)" />
          {/* Radar Arch & Satellite Dome */}
          <path d="M 108 58 L 112 48" stroke="#64748b" strokeWidth="2" />
          <circle cx="112" cy="46" r="4.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          {/* Stern Flagpole */}
          <line x1="36" y1="94" x2="32" y2="76" stroke="#ca8a04" strokeWidth="1.5" />
          <polygon points="32,76 22,81 32,86" fill="#ef4444" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 18. LAMBORGHINI RED (Supercar - 9999 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Lamborghini Red' || giftName === 'Kırmızı Lamborghini' || giftName === 'Spor Araba') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#ef4444')}
        {animated && (
          <div className="absolute -left-6 bottom-8 flex items-center gap-1 opacity-90 animate-pulse">
            <div className="w-8 h-3 bg-gradient-to-r from-transparent via-cyan-400 to-blue-500 rounded-full blur-[1px]" />
            <div className="w-12 h-4 bg-gradient-to-r from-blue-400 via-orange-400 to-yellow-300 rounded-full blur-[2px] animate-ping" />
          </div>
        )}
        <svg viewBox="0 0 240 120" className="w-full h-full drop-shadow-[0_12px_28px_rgba(239,68,68,0.9)] filter" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lamboRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="80%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="lamboGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line x1="30" y1="96" x2="210" y2="96" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" opacity="0.9" filter="blur(2px)" />
          <path
            d="M 22 80 Q 28 62 55 58 L 82 56 Q 112 30 152 30 L 182 36 Q 208 48 222 68 L 226 84 Q 215 88 190 88 L 175 88 Q 170 70 155 70 Q 140 70 135 88 L 85 88 Q 80 70 65 70 Q 50 70 45 88 L 22 85 Z"
            fill="url(#lamboRed)"
            stroke="#fca5a5"
            strokeWidth="2"
          />
          <path d="M 95 54 Q 120 36 152 36 L 176 40 Q 166 54 146 54 Z" fill="url(#lamboGlass)" stroke="#bae6fd" strokeWidth="1.5" />
          <polygon points="214,66 228,72 218,76" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
          <circle cx="65" cy="85" r="16" fill="#09090b" stroke="#71717a" strokeWidth="2" />
          <circle cx="65" cy="85" r="9" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
          <circle cx="155" cy="85" r="16" fill="#09090b" stroke="#71717a" strokeWidth="2" />
          <circle cx="155" cy="85" r="9" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 19. BEYAZ SAFKAN AT (White Celestial Horse - 9999 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Beyaz Safkan At' || giftName === 'Beyaz At' || giftName === 'Pegasus') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#38bdf8')}
        <svg viewBox="0 0 200 180" className="w-full h-full filter drop-shadow-[0_12px_32px_rgba(56,189,248,0.95)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pegasusWhite" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            <linearGradient id="celestialMane" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <path
            d="M 95 75 Q 60 20 20 35 Q 40 70 70 85 Q 50 110 85 105 Z"
            fill="url(#celestialMane)"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.85"
            filter="drop-shadow(0 0 10px #38bdf8)"
          />
          <path
            d="M 115 75 Q 145 20 185 35 Q 165 70 135 85 Q 155 110 120 105 Z"
            fill="url(#celestialMane)"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.85"
            filter="drop-shadow(0 0 10px #38bdf8)"
          />
          <path
            d="M 75 125 Q 70 95 85 80 Q 95 65 95 45 Q 105 35 115 45 Q 115 65 125 80 Q 140 95 135 125 Q 105 135 75 125 Z"
            fill="url(#pegasusWhite)"
            stroke="#e0f2fe"
            strokeWidth="2"
          />
          <polygon points="98,35 103,42 95,45" fill="#f8fafc" />
          <polygon points="112,35 107,42 115,45" fill="#f8fafc" />
          <path d="M 98 42 Q 105 25 107 42 Q 107 55 100 50 Z" fill="url(#celestialMane)" />
          <circle cx="80" cy="140" r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 4px #facc15)" />
          <circle cx="130" cy="140" r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 4px #facc15)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 20. SİBER EJDERHA (Cyber Dragon - 12000 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Siber Ejderha' || giftName === 'Ejderha' || giftName === 'Alev Ejderi') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('high', '#06b6d4')}
        <svg viewBox="0 0 200 180" className="w-full h-full filter drop-shadow-[0_12px_36px_rgba(6,182,212,1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyberArmor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="cyberCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="cyberViolet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          {/* Cybernetic Energy Wings */}
          <polygon points="100,85 40,30 65,80 20,60 55,100" fill="url(#cyberViolet)" opacity="0.85" filter="drop-shadow(0 0 8px #c084fc)" />
          <polygon points="100,85 160,30 135,80 180,60 145,100" fill="url(#cyberViolet)" opacity="0.85" filter="drop-shadow(0 0 8px #c084fc)" />
          {/* Dragon Neck & Armored Plates */}
          <path d="M 75 140 Q 80 95 100 85 Q 120 95 125 140 Z" fill="url(#cyberArmor)" stroke="url(#cyberCyan)" strokeWidth="2" />
          {/* Cyber Neck Circuit Ribs */}
          <line x1="82" y1="108" x2="118" y2="108" stroke="#22d3ee" strokeWidth="2" />
          <line x1="79" y1="122" x2="121" y2="122" stroke="#22d3ee" strokeWidth="2" />
          {/* Dragon Head */}
          <polygon points="100,45 128,68 122,96 100,102 78,96 72,68" fill="url(#cyberArmor)" stroke="url(#cyberCyan)" strokeWidth="2" />
          {/* Cyber Horns */}
          <polygon points="80,62 52,24 74,48" fill="url(#cyberCyan)" filter="drop-shadow(0 0 8px #06b6d4)" />
          <polygon points="120,62 148,24 126,48" fill="url(#cyberCyan)" filter="drop-shadow(0 0 8px #06b6d4)" />
          {/* Piercing Glowing Eyes */}
          <polygon points="86,72 96,75 88,77" fill="#22d3ee" filter="drop-shadow(0 0 6px #22d3ee)" />
          <polygon points="114,72 104,75 112,77" fill="#22d3ee" filter="drop-shadow(0 0 6px #22d3ee)" />
          {/* Jaw / Snout / Teeth */}
          <polygon points="94,92 100,100 106,92" fill="#22d3ee" />
          {/* Plasma Fire Breath Spark */}
          <circle cx="100" cy="106" r="5" fill="#f43f5e" filter="drop-shadow(0 0 10px #f43f5e)" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 21. ÇİÇEK TANRIÇASI (Flower Goddess - 15000 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Çiçek Tanrıçası' || giftName === 'Çiçek Perisi') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mythic', '#f43f5e')}
        <svg viewBox="0 0 280 280" className="w-full h-full filter drop-shadow-[0_15px_40px_rgba(244,63,94,1)] animate-in zoom-in-75 duration-700" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="flowerPetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="45%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="goldSwingRope" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="silkDress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fff1f2" />
              <stop offset="100%" stopColor="#fecdd3" />
            </linearGradient>
          </defs>
          <circle cx="140" cy="130" r="95" stroke="#15803d" strokeWidth="5" fill="none" opacity="0.6" />
          {[
            { cx: 70, cy: 75, r: 16 },
            { cx: 105, cy: 45, r: 18 },
            { cx: 140, cy: 36, r: 20 },
            { cx: 175, cy: 45, r: 18 },
            { cx: 210, cy: 75, r: 16 },
            { cx: 230, cy: 115, r: 17 },
            { cx: 232, cy: 155, r: 18 },
            { cx: 215, cy: 195, r: 16 },
            { cx: 180, cy: 220, r: 19 },
            { cx: 140, cy: 225, r: 21 },
            { cx: 100, cy: 220, r: 19 },
            { cx: 65, cy: 195, r: 16 },
            { cx: 48, cy: 155, r: 18 },
            { cx: 50, cy: 115, r: 17 },
          ].map((fl, idx) => (
            <g key={idx}>
              <circle cx={fl.cx} cy={fl.cy} r={fl.r} fill="url(#flowerPetal)" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={fl.cx} cy={fl.cy} r={fl.r * 0.45} fill="#fde047" opacity="0.9" />
            </g>
          ))}
          <line x1="105" y1="45" x2="115" y2="165" stroke="url(#goldSwingRope)" strokeWidth="3" strokeLinecap="round" />
          <line x1="175" y1="45" x2="165" y2="165" stroke="url(#goldSwingRope)" strokeWidth="3" strokeLinecap="round" />
          <rect x="108" y="165" width="64" height="6" rx="3" fill="#78350f" stroke="#fde047" strokeWidth="1" />
          <path d="M 115 168 Q 90 200 65 240 Q 110 230 120 170" fill="url(#silkDress)" opacity="0.75" />
          <path d="M 165 168 Q 190 200 215 240 Q 170 230 160 170" fill="url(#silkDress)" opacity="0.75" />
          <path d="M 140 85 Q 110 95 112 145 Q 140 160 168 145 Q 170 95 140 85 Z" fill="#fda4af" stroke="#fb7185" strokeWidth="1.5" />
          <circle cx="140" cy="100" r="16" fill="#fde68a" stroke="#fbcfe8" strokeWidth="1" />
          <ellipse cx="134" cy="100" rx="2" ry="3" fill="#1e1b4b" />
          <ellipse cx="146" cy="100" rx="2" ry="3" fill="#1e1b4b" />
          <path d="M 137 106 Q 140 110 143 106" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="132,87 140,80 148,87 140,84" fill="#fde047" stroke="#ffffff" strokeWidth="1" />
          <path d="M 130 116 L 150 116 L 158 160 Q 140 165 122 160 Z" fill="url(#silkDress)" stroke="#fbcfe8" strokeWidth="1" />
          <path d="M 135 158 Q 132 185 130 200" stroke="#fde68a" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 145 158 Q 148 185 152 195" stroke="#fde68a" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="130" cy="202" r="3.5" fill="#facc15" />
          <circle cx="153" cy="197" r="3.5" fill="#facc15" />
          <g transform="translate(62, 95) scale(0.9)">
            <path d="M 0 0 Q -8 -12 2 -12 Q 10 -6 0 0" fill="#fde047" />
            <path d="M 0 0 Q 8 -12 -2 -12 Q -10 -6 0 0" fill="#fde047" />
          </g>
          <g transform="translate(208, 90) scale(0.9)">
            <path d="M 0 0 Q -8 -12 2 -12 Q 10 -6 0 0" fill="#fde047" />
            <path d="M 0 0 Q 8 -12 -2 -12 Q -10 -6 0 0" fill="#fde047" />
          </g>
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 22. ANKA KUŞU (Golden Phoenix - 18000 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Anka Kuşu' || giftName === 'Anka' || giftName === 'Phoenix') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mythic', '#f97316')}
        <svg viewBox="0 0 220 200" className="w-full h-full filter drop-shadow-[0_12px_40px_rgba(249,115,22,1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="phoenixFire" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="phoenixTail" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          {/* Majestic Blazing Left Wing */}
          <path
            d="M 105 100 Q 60 40 18 45 Q 45 80 65 105 Q 40 115 80 130 Z"
            fill="url(#phoenixFire)"
            stroke="#fef08a"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 12px #f97316)"
          />
          {/* Majestic Blazing Right Wing */}
          <path
            d="M 115 100 Q 160 40 202 45 Q 175 80 155 105 Q 180 115 140 130 Z"
            fill="url(#phoenixFire)"
            stroke="#fef08a"
            strokeWidth="1.5"
            filter="drop-shadow(0 0 12px #f97316)"
          />
          {/* Long Flowing Flaming Tail Plumes */}
          <path d="M 106 135 Q 90 165 72 195 Q 100 175 110 142" fill="url(#phoenixTail)" opacity="0.9" />
          <path d="M 114 135 Q 130 165 148 195 Q 120 175 110 142" fill="url(#phoenixTail)" opacity="0.9" />
          <path d="M 110 138 Q 110 175 110 198 Q 112 175 110 138" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          {/* Phoenix Body */}
          <ellipse cx="110" cy="115" rx="14" ry="24" fill="url(#phoenixFire)" stroke="#fef08a" strokeWidth="1.5" />
          {/* Phoenix Head and Beak */}
          <circle cx="110" cy="80" r="11" fill="#fef08a" stroke="#ea580c" strokeWidth="1.5" />
          <polygon points="110,83 124,80 110,77" fill="#ea580c" />
          {/* Head Plume Crest */}
          <path d="M 106 72 Q 95 48 108 52 Q 114 62 108 72" fill="#facc15" />
          <path d="M 110 70 Q 115 42 122 48 Q 118 60 112 70" fill="#f97316" />
          {/* Fiery Embers Floating */}
          <circle cx="55" cy="55" r="2.5" fill="#fef08a" />
          <circle cx="165" cy="55" r="2.5" fill="#fef08a" />
          <circle cx="70" cy="165" r="2" fill="#facc15" />
          <circle cx="150" cy="165" r="2" fill="#facc15" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 23. GÖKKUŞAĞI GALAKSİSİ (Cosmic Galaxy - 25000 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Gökkuşağı Galaksisi' || giftName === 'Galaksi' || giftName === 'Galaksi UFO') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mythic', '#a855f7')}
        <svg viewBox="0 0 220 200" className="w-full h-full filter drop-shadow-[0_12px_44px_rgba(168,85,247,1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cosmicSpiral" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="35%" stopColor="#8b5cf6" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id="corePulsar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          {/* Deep Space Background Aura */}
          <circle cx="110" cy="100" r="75" fill="#3b0764" opacity="0.4" filter="blur(16px)" />
          {/* Grand Cosmic Orbit Rings */}
          <ellipse cx="110" cy="100" rx="95" ry="34" stroke="url(#cosmicSpiral)" strokeWidth="6" strokeDasharray="18 8" transform="rotate(-25 110 100)" filter="drop-shadow(0 0 8px #c084fc)" />
          <ellipse cx="110" cy="100" rx="82" ry="24" stroke="#ffffff" strokeWidth="1.5" transform="rotate(-25 110 100)" opacity="0.8" />
          {/* Swirling Nebula Galaxy Arm 1 */}
          <path d="M 110 100 Q 60 70 42 110 Q 50 145 90 142 Q 130 140 145 110" stroke="url(#cosmicSpiral)" strokeWidth="8" strokeLinecap="round" opacity="0.85" filter="blur(1px)" />
          {/* Swirling Nebula Galaxy Arm 2 */}
          <path d="M 110 100 Q 160 130 178 90 Q 170 55 130 58 Q 90 60 75 90" stroke="url(#cosmicSpiral)" strokeWidth="8" strokeLinecap="round" opacity="0.85" filter="blur(1px)" />
          {/* Core Pulsar Sun */}
          <circle cx="110" cy="100" r="18" fill="url(#corePulsar)" filter="drop-shadow(0 0 16px #ffffff)" />
          <circle cx="110" cy="100" r="10" fill="#ffffff" />
          {/* Orbiting Satellite Planets */}
          <circle cx="48" cy="80" r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
          <circle cx="178" cy="116" r="7" fill="#f43f5e" stroke="#fde047" strokeWidth="1" />
          <circle cx="140" cy="52" r="4.5" fill="#eab308" />
          {/* Twinkling Stars */}
          <polygon points="110,65 112,71 118,71 113,74 115,80 110,76 105,80 107,74 102,71 108,71" fill="#ffffff" />
          <circle cx="32" cy="130" r="2" fill="#ffffff" />
          <circle cx="188" cy="70" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // 24. KRİSTAL ŞATO (Crystal Castle - 30000 Gold)
  // ═════════════════════════════════════════════════════════════════════
  if (giftName === 'Kristal Şato' || giftName === 'Şato' || giftName === 'Buz Şatosu') {
    return (
      <div className={`relative flex items-center justify-center ${currentSize}`}>
        {renderSparkleAura('mythic', '#38bdf8')}
        <svg viewBox="0 0 220 220" className="w-full h-full filter drop-shadow-[0_16px_48px_rgba(56,189,248,1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="crystalIce" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#cffafe" />
              <stop offset="75%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="crystalAurora" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          {/* Aurora Borealis Arch in Sky */}
          <path d="M 25 150 Q 110 30 195 150" stroke="url(#crystalAurora)" strokeWidth="14" strokeLinecap="round" opacity="0.35" filter="blur(6px)" />
          {/* Floating Celestial Cloud Base */}
          <path d="M 40 185 Q 70 170 100 180 Q 130 168 160 180 Q 185 185 170 200 Q 110 208 40 185 Z" fill="#f8fafc" opacity="0.85" filter="drop-shadow(0 4px 12px #bae6fd)" />
          {/* Main Central Tower */}
          <polygon points="110,40 92,105 128,105" fill="url(#crystalIce)" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="94" y="105" width="32" height="75" fill="url(#crystalIce)" stroke="#ffffff" strokeWidth="1.5" />
          <polygon points="110,25 106,40 114,40" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
          {/* Left Wing Tower */}
          <polygon points="70,72 58,118 82,118" fill="url(#crystalIce)" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="60" y="118" width="20" height="62" fill="url(#crystalIce)" stroke="#ffffff" strokeWidth="1" />
          {/* Right Wing Tower */}
          <polygon points="150,72 138,118 162,118" fill="url(#crystalIce)" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="140" y="118" width="20" height="62" fill="url(#crystalIce)" stroke="#ffffff" strokeWidth="1" />
          {/* Crystal Arched Flying Buttresses & Bridges */}
          <path d="M 70 135 Q 94 125 94 150" stroke="#bae6fd" strokeWidth="3" fill="none" />
          <path d="M 150 135 Q 126 125 126 150" stroke="#bae6fd" strokeWidth="3" fill="none" />
          {/* Grand Palace Arch Portal */}
          <path d="M 100 180 L 100 152 Q 110 144 120 152 L 120 180 Z" fill="#1e1b4b" stroke="#fef08a" strokeWidth="1.5" />
          {/* Castle Stained-Glass Window */}
          <ellipse cx="110" cy="125" rx="5" ry="9" fill="#fde047" stroke="#ffffff" strokeWidth="1" filter="drop-shadow(0 0 6px #facc15)" />
          {/* Prismatic Star Glints */}
          <polygon points="110,18 112,23 117,23 113,26 115,31 110,28 105,31 107,26 103,23 108,23" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
          <circle cx="70" cy="68" r="2.5" fill="#ffffff" />
          <circle cx="150" cy="68" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // Fallback for any other gift name
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className={`relative flex items-center justify-center ${currentSize}`}>
      <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
      <span className="text-4xl filter drop-shadow">🎁</span>
    </div>
  );
};
