import type { User } from '../types';

export interface LevelInfo {
  level: number;
  currentExp: number;
  maxExp: number;
  progressPercent: number;
  neededExp: number;
  totalScore: number;
}

/**
 * Calculates user account Level, current in-level EXP, and max EXP needed for the next level.
 * Both activity EXP (from playing games, check-in, etc.) and Charm (cazibe from gifts)
 * contribute proportionally to player level progression.
 *
 * Formula:
 * - Each level L requires: req(L) = 150 + L * 50 EXP (Lv1: 200, Lv2: 250, Lv3: 300, Lv4: 350...)
 * - Charm contributes to overall progression at ~0.8 weight (1 charm ≈ 0.8 EXP)
 * - Total Score = totalExp + Math.floor(charm * 0.8)
 */
export function calculateLevelInfo(totalExp: number = 0, charm: number = 0): LevelInfo {
  const safeExp = Math.max(0, totalExp || 0);
  const safeCharm = Math.max(0, charm || 0);
  const charmContribution = Math.floor(safeCharm * 0.8);
  const totalScore = safeExp + charmContribution;

  let lvl = 1;
  let remaining = totalScore;

  while (true) {
    const requiredForNext = 150 + lvl * 50;
    if (remaining < requiredForNext) {
      return {
        level: lvl,
        currentExp: remaining,
        maxExp: requiredForNext,
        progressPercent: Math.min(100, Math.max(0, Math.round((remaining / requiredForNext) * 100))),
        neededExp: requiredForNext - remaining,
        totalScore,
      };
    }
    remaining -= requiredForNext;
    lvl++;
  }
}

/**
 * Synchronizes user object with the calculated level, current exp, and maxExp.
 * Detects incremental EXP gains from games or components, increments total cumulative EXP,
 * and updates level and in-level EXP accordingly.
 */
export function syncUserLevel(user: User, prevUser?: User | null): { user: User; didLevelUp: boolean } {
  const prevExp = prevUser ? (prevUser.exp || 0) : 0;
  const currentTotalExp = user.totalExp !== undefined
    ? user.totalExp
    : Math.max(user.exp || 0, prevUser?.totalExp || 0);

  // If user.exp increased (e.g. game awarded +180 EXP), add difference to totalExp
  let newTotalExp = currentTotalExp;
  if (prevUser && user.exp > prevExp) {
    const diff = user.exp - prevExp;
    newTotalExp += diff;
  } else if (!prevUser && user.totalExp === undefined) {
    newTotalExp = Math.max(0, user.exp || 0);
  }

  const charm = user.charm ?? 7668;
  const levelInfo = calculateLevelInfo(newTotalExp, charm);
  const didLevelUp = Boolean(prevUser && levelInfo.level > (prevUser.level || 1));

  const updatedUser: User = {
    ...user,
    level: levelInfo.level,
    exp: levelInfo.currentExp,
    maxExp: levelInfo.maxExp,
    totalExp: newTotalExp,
    charm,
  };

  return { user: updatedUser, didLevelUp };
}
