import React from 'react';

export interface CharmTier {
  level: number;
  threshold: number;
  label: string; // e.g. '1000', '4000', '12k', '30k', '1m', '360m'
  type: 'star' | 'diamond' | 'crown_gold' | 'crown_red' | 'crown_purple' | 'crest_fire' | 'crest_grand';
}

export const CHARM_TIERS: CharmTier[] = [
  { level: 1,  threshold: 1000,      label: '1000', type: 'star' },
  { level: 2,  threshold: 4000,      label: '4000', type: 'star' },
  { level: 3,  threshold: 12000,     label: '12k',  type: 'star' },
  { level: 4,  threshold: 30000,     label: '30k',  type: 'diamond' },
  { level: 5,  threshold: 80000,     label: '80k',  type: 'diamond' },
  { level: 6,  threshold: 160000,    label: '160k', type: 'diamond' },
  { level: 7,  threshold: 300000,    label: '300k', type: 'crown_gold' },
  { level: 8,  threshold: 500000,    label: '500k', type: 'crown_gold' },
  { level: 9,  threshold: 1000000,   label: '1m',   type: 'crown_gold' },
  { level: 10, threshold: 2000000,   label: '2m',   type: 'crown_red' },
  { level: 11, threshold: 3500000,   label: '3.5m', type: 'crown_red' },
  { level: 12, threshold: 6000000,   label: '6m',   type: 'crown_red' },
  { level: 13, threshold: 8500000,   label: '8.5m', type: 'crown_purple' },
  { level: 14, threshold: 12000000,  label: '12m',  type: 'crown_purple' },
  { level: 15, threshold: 16000000,  label: '16m',  type: 'crown_purple' },
  { level: 16, threshold: 26000000,  label: '26m',  type: 'crest_fire' },
  { level: 17, threshold: 48000000,  label: '48m',  type: 'crest_fire' },
  { level: 18, threshold: 86000000,  label: '86m',  type: 'crest_fire' },
  { level: 19, threshold: 120000000, label: '120m', type: 'crest_grand' },
  { level: 20, threshold: 240000000, label: '240m', type: 'crest_grand' },
  { level: 21, threshold: 360000000, label: '360m', type: 'crest_grand' },
];

export interface CharmInfo {
  level: number;
  currentCharm: number;
  nextLevel: number | null;
  nextThreshold: number | null;
  neededForNext: number;
  progressPercent: number;
  tier: CharmTier | null;
  badgeType: CharmTier['type'] | 'none';
}

export function getCharmInfo(charmValue?: number): CharmInfo {
  const currentCharm = Math.max(0, charmValue || 0);

  let currentTier: CharmTier | null = null;
  for (let i = CHARM_TIERS.length - 1; i >= 0; i--) {
    if (currentCharm >= CHARM_TIERS[i].threshold) {
      currentTier = CHARM_TIERS[i];
      break;
    }
  }

  const level = currentTier ? currentTier.level : 0;
  const nextTier = CHARM_TIERS.find(t => t.level === level + 1) || null;

  const nextThreshold = nextTier ? nextTier.threshold : null;
  const neededForNext = nextThreshold ? Math.max(0, nextThreshold - currentCharm) : 0;

  const prevThreshold = currentTier ? currentTier.threshold : 0;
  let progressPercent = 100;
  if (nextThreshold) {
    const range = nextThreshold - prevThreshold;
    const progress = currentCharm - prevThreshold;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  return {
    level,
    currentCharm,
    nextLevel: nextTier ? nextTier.level : null,
    nextThreshold,
    neededForNext,
    progressPercent,
    tier: currentTier,
    badgeType: currentTier ? currentTier.type : 'none',
  };
}

/**
 * WePlay Pixel-faithful Charm Badge
 */
export const CharmBadge: React.FC<{
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}> = ({ level, size = 'sm' }) => {
  if (level <= 0) return null;

  const tier = CHARM_TIERS.find(t => t.level === level) || CHARM_TIERS[0];

  const getIconAndStyle = () => {
    switch (tier.type) {
      case 'star':
        return {
          icon: '⭐',
          color: 'text-amber-500',
          numColor: 'text-amber-600',
        };
      case 'diamond':
        return {
          icon: '💎',
          color: 'text-cyan-500',
          numColor: 'text-cyan-600',
        };
      case 'crown_gold':
        return {
          icon: '👑',
          color: 'text-yellow-500',
          numColor: 'text-yellow-600',
        };
      case 'crown_red':
        return {
          icon: '👑',
          color: 'text-rose-500',
          numColor: 'text-rose-600',
        };
      case 'crown_purple':
        return {
          icon: '👑',
          color: 'text-purple-600',
          numColor: 'text-purple-700',
        };
      case 'crest_fire':
        return {
          icon: '🌟',
          color: 'text-orange-500',
          numColor: 'text-orange-600',
        };
      case 'crest_grand':
        return {
          icon: '🎖️',
          color: 'text-rose-600',
          numColor: 'text-rose-700',
        };
      default:
        return {
          icon: '⭐',
          color: 'text-amber-500',
          numColor: 'text-amber-600',
        };
    }
  };

  const { icon, numColor } = getIconAndStyle();

  const sizeClasses = {
    xs: 'text-[10px] gap-0.5',
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-0.5',
    lg: 'text-base gap-1',
  }[size];

  const numberSizeClasses = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  return (
    <span className={`inline-flex items-center font-black select-none ${sizeClasses} drop-shadow-sm`}>
      <span className="leading-none">{icon}</span>
      <span className={`font-mono font-black italic leading-none ${numColor} ${numberSizeClasses}`}>
        {level}
      </span>
    </span>
  );
};
