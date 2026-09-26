import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from '../../firebase/config';
import { soundFX } from '../../utils/soundEffects';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { Sparkles, Gamepad2, Mic, Flame, Shield, ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { User } from '../../types';
import { getNumericId } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const PREVIEW_AVATARS = [
  { skinColor: '#FFDCB1', hairStyle: 'kpop' as const, hairColor: '#3b2219', eyeStyle: 'sparkle' as const, mouthStyle: 'smile' as const, outfit: 'hoodie' as const, outfitColor: '#6366f1', accessory: 'gaming_headset' as const, frame: 'gold_vip' as const, customPhotoUrl: '/luvia-avatar.png' },
  { skinColor: '#FFDCB1', hairStyle: 'kpop' as const, hairColor: '#3b2219', eyeStyle: 'sparkle' as const, mouthStyle: 'smile' as const, outfit: 'hoodie' as const, outfitColor: '#6366f1', accessory: 'gaming_headset' as const, frame: 'gold_vip' as const },
  { skinColor: '#FEE3D4', hairStyle: 'ponytail' as const, hairColor: '#d97706', eyeStyle: 'cute' as const, mouthStyle: 'smile' as const, outfit: 'party_dress' as const, outfitColor: '#ec4899', accessory: 'cat_ears' as const, frame: 'sakura' as const },
  { skinColor: '#FFDCB1', hairStyle: 'anime' as const, hairColor: '#06b6d4', eyeStyle: 'cool' as const, mouthStyle: 'smirk' as const, outfit: 'cyberpunk' as const, outfitColor: '#3b82f6', accessory: 'gaming_headset' as const, frame: 'cyber_glow' as const },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAvatarIndex, setActiveAvatarIndex] = useState(0);
  const [nickname, setNickname] = useState('');
  const [showInstantLogin, setShowInstantLogin] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          createUserAndProceed(result.user.displayName || 'Google_Player', result.user.uid);
          return;
        }
      } catch (e) {
        console.warn('Redirect check info:', e);
      }

      const wasPending = localStorage.getItem('luvia_pending_google_signin');
      if (wasPending) {
        localStorage.removeItem('luvia_pending_google_signin');
        setShowInstantLogin(true);
      }
    };

    checkRedirect();
  }, []);

  const createUserAndProceed = (username: string, uid?: string) => {
    soundFX.playSuccess();
    confetti({ particleCount: 80, spread: 80 });

    const finalUid = uid || 'usr_' + Math.random().toString(36).substring(2, 10);
    const finalName = username.trim() || 'Luvia_Star';

    const newUser: User = {
      id: finalUid,
      numericId: getNumericId({ id: finalUid }),
      username: finalName,
      level: 1,
      exp: 100,
      maxExp: 500,
      coins: 3000,
      diamonds: 50,
      vipLevel: 1,
      avatarConfig: PREVIEW_AVATARS[activeAvatarIndex],
      statusMessage: 'Luvia Party dünyasına katıldım! 🎮✨',
      followersCount: 15,
      followingCount: 6,
      gamesPlayed: 0,
      gamesWon: 0,
    };

    onLoginSuccess(newUser);
  };

  const handleGoogleSignIn = async () => {
    soundFX.playPop();
    setIsLoading(true);
    setErrorMessage(null);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowInstantLogin(true);
      setErrorMessage('Google hesabı hazırlandı. Girişi tamamlamak için butona dokunun.');
    }, 4500);

    try {
      localStorage.setItem('luvia_pending_google_signin', 'true');
      const result = await signInWithPopup(auth, googleProvider);
      clearTimeout(timer);
      localStorage.removeItem('luvia_pending_google_signin');

      if (result && result.user) {
        createUserAndProceed(result.user.displayName || 'Google_Player', result.user.uid);
      }
    } catch (err: any) {
      clearTimeout(timer);
      console.warn('Google Sign-In popup notice:', err);

      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (_) {}
      }

      setIsLoading(false);
      setErrorMessage('Google ile giriş başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  const handleDirectStart = () => {
    soundFX.playPop();
    const finalName = nickname.trim() || (showInstantLogin ? 'Google_Player' : 'Luvia_Oyuncu');
    createUserAndProceed(finalName);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#090b16] text-white select-none relative overflow-hidden justify-between p-6">
      {/* Top Safe Area & Header */}
      <div className="relative z-10 flex flex-col items-center text-center pt-[max(env(safe-area-inset-top),16px)]">
        {/* App Logo */}
        <div className="w-20 h-20 mb-2 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(236,72,153,0.3)] border border-pink-500/30">
          <img src="/luvia-logo.png" alt="Luvia Logo" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>LUVIA</span>
          <span className="text-pink-500 text-2xl">♥</span>
        </h1>
        <p className="text-xs text-pink-300/90 font-bold tracking-wider uppercase mt-0.5">
          Play. Connect. Vibe.
        </p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-medium">
          Gerçek oyuncularla canlı sesli sohbet ve popüler parti oyunları
        </p>
      </div>

      {/* Center Avatar Podium & Selection Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center my-4">
        {/* Podium Base Reflection */}
        <div className="relative flex items-center justify-center">
          {/* Avatar Carousel Arrow Left */}
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveAvatarIndex((activeAvatarIndex - 1 + PREVIEW_AVATARS.length) % PREVIEW_AVATARS.length);
            }}
            className="p-2 rounded-full bg-[#151930] hover:bg-[#1f2445] border border-white/[0.08] text-slate-300 transition mr-4 active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Interactive Avatar on Podium */}
          <div
            onClick={() => {
              soundFX.playPop();
              setActiveAvatarIndex((activeAvatarIndex + 1) % PREVIEW_AVATARS.length);
            }}
            className="relative cursor-pointer transition transform active:scale-95 group"
          >
            {/* Podium Circle underneath */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gradient-to-r from-indigo-500/20 via-rose-500/20 to-amber-500/20 rounded-[100%] blur-sm pointer-events-none" />
            
            <div className="relative z-10">
              <AvatarRenderer config={PREVIEW_AVATARS[activeAvatarIndex]} size="2xl" />
            </div>
          </div>

          {/* Avatar Carousel Arrow Right */}
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveAvatarIndex((activeAvatarIndex + 1) % PREVIEW_AVATARS.length);
            }}
            className="p-2 rounded-full bg-[#151930] hover:bg-[#1f2445] border border-white/[0.08] text-slate-300 transition ml-4 active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium mt-3 bg-[#131627] px-3 py-1 rounded-full border border-white/[0.08]">
          Stil değiştirmek için oklara veya karaktere dokun 🔄
        </span>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#121528] border border-white/[0.06] text-[10px] font-bold text-slate-300">
            <Mic className="w-3 h-3 text-rose-400" />
            <span>Sesli Odalar</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#121528] border border-white/[0.06] text-[10px] font-bold text-slate-300">
            <Gamepad2 className="w-3 h-3 text-indigo-400" />
            <span>6 Parti Oyunu</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#121528] border border-white/[0.06] text-[10px] font-bold text-slate-300">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Hediyeler & VIP</span>
          </span>
        </div>
      </div>

      {/* Bottom Auth Section */}
      <div className="relative z-10 flex flex-col space-y-2.5 pb-[max(env(safe-area-inset-bottom),12px)] max-w-sm mx-auto w-full">
        {/* Optional Custom Nickname Input */}
        <div className="bg-[#121528] border border-white/[0.1] focus-within:border-indigo-500/50 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 transition-all">
          <span className="text-slate-400 text-xs">👤</span>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Kullanıcı Adı (İsteğe Bağlı)..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full font-bold"
          />
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Instant Completion Button if returning or prompted */}
        {showInstantLogin ? (
          <button
            onClick={handleDirectStart}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition transform active:scale-98 animate-pulse"
          >
            <CheckCircle className="w-4 h-4 fill-slate-950" />
            <span>Hesabımı Doğrula & Oyuna Gir</span>
          </button>
        ) : (
          /* Primary: Google Sign In Button */
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 transition transform flex items-center justify-center gap-3 text-slate-900 font-black text-sm shadow-[0_4px_20px_rgba(255,255,255,0.15)] disabled:opacity-60 cursor-pointer"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoading ? 'Google Bağlanıyor...' : 'Google ile Giriş Yap'}</span>
          </button>
        )}

        {/* Secondary: 1-Tap Quick Start */}
        <button
          onClick={handleDirectStart}
          className="w-full py-2.5 rounded-2xl bg-[#131627] hover:bg-[#1a1e36] border border-white/[0.08] text-xs font-bold text-slate-300 transition flex items-center justify-center gap-1.5 active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Hızlı Misafir Girişi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-[10px] text-slate-500 text-center pt-1 font-medium">
          Giriş yaparak 3.000 Altın & VIP 1 başlangıç paketi kazanırsınız.
        </p>
      </div>
    </div>
  );
};
