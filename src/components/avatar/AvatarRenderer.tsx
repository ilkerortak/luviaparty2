import React from 'react';
import type { AvatarConfig } from '../../types';

interface AvatarRendererProps {
  config?: AvatarConfig;
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  isSpeaking?: boolean;
  micLevel?: number;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'w-8 h-8',
  sm: 'w-11 h-11',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-36 h-36',
  '2xl': 'w-48 h-48',
  full: 'w-full h-full',
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  photoUrl,
  size = 'md',
  isSpeaking = false,
  micLevel = 0,
  className = '',
  onClick,
}) => {
  let effectivePhotoUrl = photoUrl || config?.customPhotoUrl;
  if (effectivePhotoUrl === '/luvia-logo.png') {
    effectivePhotoUrl = '/luvia-avatar.png';
  }

  const {
    skinColor = '#FFDCB1',
    hairStyle = 'kpop',
    hairColor = '#3b2219',
    eyeStyle = 'sparkle',
    mouthStyle = 'smile',
    outfit = 'hoodie',
    outfitColor = '#6366f1',
    accessory = 'none',
    frame = 'none',
  } = config || {} as AvatarConfig;

  // Frame styles
  let frameBorder = '';
  if (frame === 'gold_vip') {
    frameBorder = 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]';
  } else if (frame === 'neon_fire') {
    frameBorder = 'ring-4 ring-pink-500 shadow-[0_0_18px_rgba(236,72,153,0.7)]';
  } else if (frame === 'sakura') {
    frameBorder = 'ring-4 ring-rose-300 shadow-[0_0_15px_rgba(253,164,175,0.6)]';
  } else if (frame === 'cyber_glow') {
    frameBorder = 'ring-4 ring-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]';
  }

  // Speaking indicator scale
  const speakScale = isSpeaking ? 1 + (micLevel / 150) : 1;

  const hasCustomSize = className.includes('w-') || className.includes('h-');
  const sizeClass = hasCustomSize ? '' : (size === 'full' ? 'w-full h-full' : (sizeMap[size] || sizeMap.md));

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none cursor-pointer transition-transform ${sizeClass} ${className}`}
      style={{ transform: `scale(${speakScale})` }}
    >
      {/* Speaking pulsating rings */}
      {isSpeaking && (
        <div
          className="absolute -inset-2 rounded-full border-2 border-emerald-400 opacity-80 animate-ping pointer-events-none"
          style={{ animationDuration: `${Math.max(0.4, 1.2 - micLevel / 100)}s` }}
        />
      )}
      {isSpeaking && (
        <div className="absolute -inset-1 rounded-full border-2 border-emerald-300 opacity-90 shadow-[0_0_12px_#34d399] pointer-events-none" />
      )}

      {/* Frame / Avatar Container */}
      <div className={`w-full h-full rounded-full overflow-hidden bg-slate-900 shadow-md ${frameBorder} relative flex items-center justify-center shrink-0`}>
        {effectivePhotoUrl ? (
          <img
            src={effectivePhotoUrl}
            alt="Profil Resmi"
            className="w-full h-full object-cover object-center block select-none pointer-events-none"
            onError={(e) => {
              // Fallback to luvia avatar if broken link
              (e.currentTarget as HTMLImageElement).src = '/luvia-avatar.png';
            }}
          />
        ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full block shrink-0"
          style={{ backgroundColor: '#1e2238' }}
        >
          <defs>
            <radialGradient id={`bgGrad-${skinColor}`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#31395f" />
              <stop offset="100%" stopColor="#141829" />
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={outfitColor} />
              <stop offset="100%" stopColor="#111827" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle cx="50" cy="50" r="50" fill={`url(#bgGrad-${skinColor})`} />

          {/* Angel Wings Accessory Behind */}
          {accessory === 'angel_wings' && (
            <g fill="#f8fafc" opacity="0.9">
              <path d="M 25 55 C 5 45, 0 25, 20 25 C 25 35, 30 45, 35 55 Z" />
              <path d="M 75 55 C 95 45, 100 25, 80 25 C 75 35, 70 45, 65 55 Z" />
            </g>
          )}

          {/* Body / Outfit */}
          <g id="outfit">
            {outfit === 'hoodie' && (
              <path
                d="M 20 100 C 20 70, 32 68, 50 68 C 68 68, 80 70, 80 100 Z"
                fill={outfitColor}
              />
            )}
            {outfit === 'suit' && (
              <>
                <path d="M 20 100 C 20 70, 32 68, 50 68 C 68 68, 80 100, 80 100 Z" fill="#1f2937" />
                <path d="M 42 68 L 50 82 L 58 68 Z" fill="#ffffff" />
                <polygon points="48,74 52,74 50,86" fill="#ef4444" />
              </>
            )}
            {outfit === 'cyberpunk' && (
              <>
                <path d="M 20 100 C 20 70, 32 68, 50 68 C 68 68, 80 100, 80 100 Z" fill="#090d16" />
                <path d="M 28 85 L 50 72 L 72 85" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
                <circle cx="50" cy="88" r="4" fill="#ec4899" />
              </>
            )}
            {outfit === 'space_suit' && (
              <>
                <path d="M 18 100 C 18 68, 30 65, 50 65 C 70 65, 82 68, 82 100 Z" fill="#e2e8f0" />
                <circle cx="50" cy="85" r="7" fill="#3b82f6" />
                <rect x="36" y="76" width="28" height="4" rx="2" fill="#94a3b8" />
              </>
            )}
            {outfit === 'streetwear' && (
              <>
                <path d="M 20 100 C 20 72, 30 68, 50 68 C 70 68, 80 72, 80 100 Z" fill={outfitColor} />
                <text x="50" y="88" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" opacity="0.9">WP</text>
              </>
            )}
            {outfit === 'party_dress' && (
              <path d="M 22 100 C 26 76, 36 72, 50 72 C 64 72, 74 76, 78 100 Z" fill={outfitColor} />
            )}
          </g>

          {/* Neck */}
          <rect x="44" y="60" width="12" height="12" rx="3" fill={skinColor} filter="brightness(0.9)" />

          {/* Head Base */}
          <ellipse cx="50" cy="46" rx="22" ry="24" fill={skinColor} />

          {/* Cute Ears */}
          <ellipse cx="28" cy="46" rx="4" ry="7" fill={skinColor} />
          <ellipse cx="72" cy="46" rx="4" ry="7" fill={skinColor} />

          {/* Blush */}
          <ellipse cx="37" cy="50" rx="4" ry="2" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="63" cy="50" rx="4" ry="2" fill="#f43f5e" opacity="0.4" />

          {/* Eyes */}
          <g id="eyes">
            {eyeStyle === 'sparkle' && (
              <>
                <circle cx="41" cy="44" r="5" fill="#1e1b4b" />
                <circle cx="42" cy="42" r="2" fill="#ffffff" />
                <circle cx="40" cy="46" r="1" fill="#ffffff" />

                <circle cx="59" cy="44" r="5" fill="#1e1b4b" />
                <circle cx="60" cy="42" r="2" fill="#ffffff" />
                <circle cx="58" cy="46" r="1" fill="#ffffff" />
              </>
            )}
            {eyeStyle === 'cool' && (
              <>
                {/* Sunglasses */}
                <rect x="32" y="38" width="16" height="10" rx="3" fill="#18181b" />
                <rect x="52" y="38" width="16" height="10" rx="3" fill="#18181b" />
                <line x1="48" y1="42" x2="52" y2="42" stroke="#18181b" strokeWidth="2" />
                <line x1="34" y1="40" x2="42" y2="46" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
                <line x1="54" y1="40" x2="62" y2="46" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
              </>
            )}
            {eyeStyle === 'wink' && (
              <>
                <circle cx="41" cy="44" r="5" fill="#1e1b4b" />
                <circle cx="42" cy="42" r="2" fill="#ffffff" />
                <path d="M 54 44 Q 59 39 64 44" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            {eyeStyle === 'cute' && (
              <>
                <ellipse cx="41" cy="44" rx="4" ry="5.5" fill="#312e81" />
                <circle cx="41" cy="42" r="2.2" fill="#ffffff" />
                <ellipse cx="59" cy="44" rx="4" ry="5.5" fill="#312e81" />
                <circle cx="59" cy="42" r="2.2" fill="#ffffff" />
              </>
            )}
            {eyeStyle === 'determined' && (
              <>
                <path d="M 36 39 L 46 42" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="41" cy="45" r="4" fill="#1e1b4b" />
                <circle cx="42" cy="43" r="1.5" fill="#ffffff" />

                <path d="M 64 39 L 54 42" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="59" cy="45" r="4" fill="#1e1b4b" />
                <circle cx="60" cy="43" r="1.5" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Mouth */}
          <g id="mouth">
            {mouthStyle === 'smile' && (
              <path d="M 45 54 Q 50 60 55 54" stroke="#881337" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}
            {mouthStyle === 'laugh' && (
              <path d="M 44 53 Q 50 64 56 53 Z" fill="#e11d48" stroke="#881337" strokeWidth="1" />
            )}
            {mouthStyle === 'smirk' && (
              <path d="M 46 56 Q 52 57 56 53" stroke="#881337" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}
            {mouthStyle === 'neutral' && (
              <line x1="46" y1="56" x2="54" y2="56" stroke="#881337" strokeWidth="2" strokeLinecap="round" />
            )}
            {mouthStyle === 'bubblegum' && (
              <>
                <circle cx="50" cy="56" r="6.5" fill="#f43f5e" opacity="0.9" />
                <circle cx="48" cy="54" r="2" fill="#ffffff" opacity="0.7" />
              </>
            )}
          </g>

          {/* Hair */}
          <g id="hair" fill={hairColor}>
            {hairStyle === 'kpop' && (
              <>
                <path d="M 28 42 C 28 22, 72 22, 72 42 C 68 32, 60 28, 50 28 C 40 28, 32 32, 28 42 Z" />
                <path d="M 30 35 C 38 32, 45 38, 48 42 C 42 38, 36 39, 30 44 Z" />
                <path d="M 70 35 C 62 32, 55 38, 52 42 C 58 38, 64 39, 70 44 Z" />
              </>
            )}
            {hairStyle === 'messy' && (
              <path d="M 26 44 C 20 28, 32 18, 50 18 C 68 18, 80 28, 74 44 C 70 32, 62 26, 50 26 C 38 26, 30 32, 26 44 Z M 36 22 L 42 14 L 46 22 M 54 22 L 60 14 L 64 22" />
            )}
            {hairStyle === 'curly' && (
              <g>
                <circle cx="34" cy="28" r="8" />
                <circle cx="46" cy="24" r="9" />
                <circle cx="58" cy="24" r="9" />
                <circle cx="68" cy="30" r="8" />
                <circle cx="28" cy="38" r="6" />
                <circle cx="72" cy="38" r="6" />
              </g>
            )}
            {hairStyle === 'ponytail' && (
              <>
                <path d="M 28 40 C 28 24, 72 24, 72 40 C 66 30, 50 28, 28 40 Z" />
                <path d="M 70 32 C 85 28, 90 45, 82 55 C 78 50, 75 42, 70 36 Z" />
              </>
            )}
            {hairStyle === 'short' && (
              <path d="M 28 40 C 28 25, 72 25, 72 40 C 66 32, 50 30, 28 40 Z" />
            )}
            {hairStyle === 'anime' && (
              <path d="M 24 45 L 30 25 L 42 16 L 50 24 L 58 16 L 70 25 L 76 45 L 68 36 L 58 40 L 50 34 L 42 40 L 32 36 Z" />
            )}
          </g>

          {/* Accessories On Top */}
          <g id="accessories">
            {accessory === 'cat_ears' && (
              <g fill="#ec4899">
                <polygon points="30,28 20,12 40,20" />
                <polygon points="30,26 23,15 37,21" fill="#fbcfe8" />
                <polygon points="70,28 80,12 60,20" />
                <polygon points="70,26 77,15 63,21" fill="#fbcfe8" />
              </g>
            )}
            {accessory === 'crown' && (
              <g fill="#facc15" stroke="#ca8a04" strokeWidth="1">
                <polygon points="35,22 40,10 50,18 60,10 65,22" />
                <circle cx="40" cy="10" r="1.5" fill="#ef4444" />
                <circle cx="50" cy="18" r="1.5" fill="#3b82f6" />
                <circle cx="60" cy="10" r="1.5" fill="#ef4444" />
              </g>
            )}
            {accessory === 'gaming_headset' && (
              <g>
                <path d="M 25 45 A 26 26 0 0 1 75 45" fill="none" stroke="#6366f1" strokeWidth="4" />
                <rect x="22" y="38" width="6" height="14" rx="3" fill="#4f46e5" />
                <rect x="72" y="38" width="6" height="14" rx="3" fill="#4f46e5" />
                {/* Mic arm */}
                <path d="M 25 48 Q 28 62 40 58" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
                <circle cx="41" cy="58" r="2" fill="#ec4899" />
              </g>
            )}
            {accessory === 'glasses' && eyeStyle !== 'cool' && (
              <g stroke="#e2e8f0" strokeWidth="1.8" fill="none">
                <circle cx="41" cy="44" r="7" />
                <circle cx="59" cy="44" r="7" />
                <line x1="48" y1="44" x2="52" y2="44" />
              </g>
            )}
          </g>
        </svg>
        )}
      </div>

      {/* VIP Crown Mini Badge */}
      {frame === 'gold_vip' && (
        <span className="absolute -top-2 -right-1 text-xs select-none">👑</span>
      )}
    </div>
  );
};
