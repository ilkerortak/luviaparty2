import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import {
  X,
  Sparkles,
  Gift,
  Coins,
  Gem,
  Crown,
  CheckCircle2,
  Calendar,
  Lock,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyCheckInProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

interface StreakDay {
  day: number;
  rewardType: 'coins' | 'vip' | 'crown';
  rewardAmount: number;
  label: string;
  icon: string;
}

const STREAK_DAYS: StreakDay[] = [
  { day: 1, rewardType: 'coins', rewardAmount: 500, label: '500 Altın', icon: '🪙' },
  { day: 2, rewardType: 'coins', rewardAmount: 1000, label: '1.000 Altın', icon: '🪙' },
  { day: 3, rewardType: 'coins', rewardAmount: 1200, label: '1.200 Altın', icon: '🪙' },
  { day: 4, rewardType: 'coins', rewardAmount: 1500, label: '1.500 Altın + VIP 1 Gün', icon: '👑' },
  { day: 5, rewardType: 'coins', rewardAmount: 2500, label: '2.500 Altın', icon: '🪙' },
  { day: 6, rewardType: 'coins', rewardAmount: 3000, label: '3.000 Altın', icon: '🪙' },
  { day: 7, rewardType: 'crown', rewardAmount: 5000, label: '5.000 Altın + Kraliyet Tacı', icon: '✨' },
];

/** Format a date into local YYYY-MM-DD */
const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DailyCheckInModal: React.FC<DailyCheckInProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  // Compute initial streak and check-in state
  const [claimedDays, setClaimedDays] = useState<number>(() => {
    const todayStr = getLocalDateString();
    const lastDate = localStorage.getItem('luvia_last_checkin_date');
    const legacyLast = localStorage.getItem('luvia_last_checkin');
    const storedClaimed = localStorage.getItem('luvia_checkin_claimed_days');
    const legacyStreak = localStorage.getItem('luvia_checkin_streak');

    // Check if legacy date matches today
    const isTodayChecked =
      lastDate === todayStr ||
      (legacyLast && legacyLast === new Date().toDateString());

    if (storedClaimed !== null) {
      const parsed = parseInt(storedClaimed, 10);
      if (isTodayChecked) return Math.min(7, Math.max(1, parsed));

      // Check if last check-in was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      if (lastDate === yesterdayStr) {
        // Streak is continuous: if 7 was completed, reset to 0 for a new week
        return parsed >= 7 ? 0 : parsed;
      } else {
        // Missed one or more days: reset streak to 0
        return 0;
      }
    }

    // Fallback for legacy users
    if (legacyStreak) {
      const parsed = parseInt(legacyStreak, 10);
      if (isTodayChecked) return Math.min(7, Math.max(1, parsed));
      return 0;
    }

    return 0;
  });

  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    const todayStr = getLocalDateString();
    const lastDate = localStorage.getItem('luvia_last_checkin_date');
    const legacyLast = localStorage.getItem('luvia_last_checkin');
    return Boolean(lastDate === todayStr || (legacyLast && legacyLast === new Date().toDateString()));
  });

  // Countdown timer until next midnight
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilTomorrow(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today's claimable day (1 to 7)
  const todayClaimDay = hasCheckedInToday
    ? claimedDays
    : Math.min(7, claimedDays + 1);

  const handleClaim = () => {
    if (hasCheckedInToday) return;

    const dayToClaim = claimedDays + 1;
    if (dayToClaim < 1 || dayToClaim > 7) return;

    const todayReward = STREAK_DAYS[dayToClaim - 1];
    soundFX.playGiftFanfare();
    confetti({
      particleCount: dayToClaim === 7 ? 120 : 60,
      spread: 80,
    });

    let updatedCoins = currentUser.coins;
    let updatedVip = currentUser.vipLevel;
    let updatedAvatar = { ...currentUser.avatarConfig };

    if (todayReward.rewardType === 'coins') {
      updatedCoins += todayReward.rewardAmount;
    } else if (todayReward.rewardType === 'vip') {
      updatedCoins += todayReward.rewardAmount;
      updatedVip = Math.max(1, updatedVip);
    } else if (todayReward.rewardType === 'crown') {
      updatedCoins += todayReward.rewardAmount;
      updatedAvatar.accessory = 'crown';
    }

    onUpdateUser({
      ...currentUser,
      coins: updatedCoins,
      vipLevel: updatedVip,
      avatarConfig: updatedAvatar,
    });

    const newClaimedDays = dayToClaim;
    const todayStr = getLocalDateString();

    setClaimedDays(newClaimedDays);
    setHasCheckedInToday(true);

    // Save accurate state to localStorage
    localStorage.setItem('luvia_checkin_claimed_days', newClaimedDays.toString());
    localStorage.setItem('luvia_last_checkin_date', todayStr);
    // Legacy support
    localStorage.setItem('luvia_checkin_streak', newClaimedDays.toString());
    localStorage.setItem('luvia_last_checkin', new Date().toDateString());

    alert(`🎉 ${dayToClaim}. Gün Giriş Ödülü Alındı!\n${todayReward.label} hesabınıza yüklendi.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-yellow-500/30 rounded-3xl w-full max-w-sm max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 p-4 border-b border-yellow-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-yellow-200" />
              <div>
                <h3 className="text-base font-black text-white">7 Günlük Giriş Takvimi</h3>
                <span className="text-[11px] text-yellow-100 font-medium">
                  {hasCheckedInToday
                    ? `Bugünün ödülü (${claimedDays}. Gün) alındı ✓`
                    : `${todayClaimDay}. Gün ödülü seni bekliyor!`}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundFX.playPop();
                onClose();
              }}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 transition active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 7-Day Grid */}
        <div className="p-4 space-y-3 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-3 gap-2.5">
            {STREAK_DAYS.slice(0, 6).map(item => {
              const isClaimed = item.day <= claimedDays;
              const isTodayToClaim = item.day === claimedDays + 1 && !hasCheckedInToday;
              const isNextUnlock = item.day === claimedDays + 1 && hasCheckedInToday;
              const isFutureLocked = item.day > claimedDays + 1;

              return (
                <div
                  key={item.day}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center relative transition-all duration-200 ${
                    isTodayToClaim
                      ? 'bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.25)] animate-pulse scale-[1.02]'
                      : isClaimed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : isNextUnlock
                      ? 'bg-slate-800/80 border-amber-500/40 opacity-90'
                      : 'bg-slate-800/40 border-slate-700/50 opacity-60'
                  }`}
                >
                  {/* Status Indicator Badges */}
                  {isClaimed && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  {(isNextUnlock || isFutureLocked) && (
                    <div className="absolute top-1.5 right-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}

                  <span className={`text-[10px] font-black ${
                    isClaimed ? 'text-emerald-400' : isTodayToClaim ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                    GÜN {item.day}
                  </span>
                  <span className="text-2xl my-1 select-none">{item.icon}</span>
                  <span className="text-[11px] font-black text-white">{item.label}</span>

                  {/* Micro state caption */}
                  <span className={`text-[9px] mt-1 font-bold ${
                    isClaimed 
                      ? 'text-emerald-400' 
                      : isTodayToClaim 
                      ? 'text-yellow-300 font-black' 
                      : isNextUnlock 
                      ? 'text-amber-400' 
                      : 'text-slate-500'
                  }`}>
                    {isClaimed 
                      ? 'Alındı ✓' 
                      : isTodayToClaim 
                      ? 'Hemen Al 🎁' 
                      : isNextUnlock 
                      ? 'Yarın Açılır' 
                      : 'Kilitli 🔒'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day 7 Big Grand Reward */}
          {(() => {
            const day7 = STREAK_DAYS[6];
            const isClaimed = claimedDays >= 7;
            const isTodayToClaim = claimedDays === 6 && !hasCheckedInToday;
            const isNextUnlock = claimedDays === 6 && hasCheckedInToday;

            return (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isTodayToClaim
                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-yellow-400 ring-2 ring-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.3)] animate-pulse'
                    : isClaimed
                    ? 'bg-emerald-950/25 border-emerald-500/50 text-emerald-200'
                    : 'bg-gradient-to-r from-purple-900/40 to-yellow-900/40 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl select-none">👑</div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">
                        Büyük Ödül • GÜN 7
                      </span>
                      {isClaimed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {!isClaimed && !isTodayToClaim && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <span className="text-xs font-black text-white block">{day7.label}</span>
                    <span className="text-[10px] font-bold text-yellow-300/80">
                      {isClaimed
                        ? 'Alındı ✓'
                        : isTodayToClaim
                        ? 'Bugün Açık! 🎁'
                        : isNextUnlock
                        ? 'Yarın Açılacak'
                        : '7. Gün Kapanışı'}
                    </span>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
            );
          })()}

          {/* Countdown Info if already checked in today */}
          {hasCheckedInToday && (
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sonraki ödülün açılmasına:</span>
              <span className="font-mono font-bold text-amber-300">{timeUntilTomorrow}</span>
            </div>
          )}

          {/* Claim Button */}
          <div className="pt-1">
            <button
              onClick={handleClaim}
              disabled={hasCheckedInToday}
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
                hasCheckedInToday
                  ? 'bg-slate-800/90 text-slate-400 border border-slate-700/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 text-slate-950 shadow-yellow-500/30 active:scale-95'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>
                {hasCheckedInToday
                  ? 'Bugünün Ödülü Alındı ✓ (Yarın tekrar gel)'
                  : `${todayClaimDay}. Gün Ödülünü Al!`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
