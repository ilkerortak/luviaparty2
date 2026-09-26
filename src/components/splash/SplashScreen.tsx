import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, Flame } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface SplashScreenProps {
  onFinish: () => void;
}

// Cute WePlay Robot Mascot for Loading Screen
const MiniMascot: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Blue Ears/Bolts */}
    <rect x="2" y="14" width="3" height="6" rx="1.5" fill="#0284c7" />
    <rect x="31" y="14" width="3" height="6" rx="1.5" fill="#0284c7" />
    {/* Antenna */}
    <circle cx="18" cy="4" r="2" fill="#38bdf8" />
    <line x1="18" y1="5.5" x2="18" y2="9" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
    {/* White Head */}
    <rect x="6" y="9" width="24" height="15" rx="6" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
    {/* Visor Screen */}
    <rect x="9" y="12" width="18" height="8" rx="3" fill="#0369a1" />
    {/* Cyan glowing eyes */}
    <circle cx="14" cy="16" r="1.6" fill="#38bdf8" />
    <circle cx="22" cy="16" r="1.6" fill="#38bdf8" />
    {/* Cheeks */}
    <circle cx="11" cy="20.5" r="1.2" fill="#fda4af" />
    <circle cx="25" cy="20.5" r="1.2" fill="#fda4af" />
    {/* Body */}
    <rect x="11" y="24" width="14" height="8" rx="3.5" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
    <circle cx="18" cy="28" r="1.5" fill="#38bdf8" />
  </svg>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Dynamic warm loading messages based on progress
  const getLoadingMessage = (p: number) => {
    if (p < 25) return 'Parti dünyası hazırlanıyor... 🎈';
    if (p < 55) return 'Ses odaları ve arkadaşlar bağlanıyor... 🎧';
    if (p < 85) return 'Masa oyunları ve hediyeler yükleniyor... 🎲✨';
    return 'Her şey hazır, iyi eğlenceler! 💖';
  };

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2 saniyede pürüzsüz yüklenme

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      // Akıcı ve organik cubic-bezier ilerleme eğrisi
      const eased = 1 - Math.pow(1 - t, 2.2);
      const currentVal = Math.min(100, Math.round(eased * 100));
      setProgress(currentVal);

      if (t >= 1) {
        clearInterval(timer);
        setIsComplete(true);
        soundFX.playPop();

        // 100%'e ulaştıktan sonra yumuşak geçişle uygulamayı aç
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            onFinish();
          }, 350);
        }, 250);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-[#0b081e] via-[#120e2e] to-[#060414] select-none overflow-hidden p-6 transition-all duration-400 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* ═══ ARKAPLAN IŞIMA HALKALARI & PARÇACIKLAR ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-600/25 blur-[110px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-purple-600/30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-500/20 blur-[120px]" />
        
        {/* Subtle grid stars pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      {/* ═══ ÜST BAŞLIK ═══ */}
      <div className="relative z-10 pt-[max(calc(env(safe-area-inset-top,0px)+12px),18px)] flex items-center gap-2 opacity-75">
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span className="text-[11px] font-black tracking-widest text-slate-300 uppercase font-mono">
          Luvia Interactive • Party World
        </span>
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
      </div>

      {/* ═══ MERKEZİ LOGO VE MARKA ALANI ═══ */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto w-full max-w-xs">
        {/* Işıltılı Logo Kartı */}
        <div className="relative mb-6">
          {/* Neon Arka Işık Halesi */}
          <div className="absolute -inset-4 rounded-[42px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 blur-xl opacity-60 animate-pulse" />

          {/* Logo Çerçevesi */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[36px] overflow-hidden p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_16px_50px_rgba(236,72,153,0.45)] transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[32px] overflow-hidden bg-[#0d0924] flex items-center justify-center">
              <img
                src="/luvia-logo.png"
                alt="Luvia"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Marka Adı */}
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)]">
            Luvia
          </h1>
          <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500 fill-pink-500 animate-bounce drop-shadow-[0_0_14px_rgba(236,72,153,0.9)]" />
        </div>

        {/* Slogan */}
        <p className="mt-1 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 tracking-[0.25em] uppercase drop-shadow-xs">
          Play • Connect • Vibe
        </p>

        {/* ═══ SAMİMİ & UYUMLU CANLI YÜKLENME BARI ═══ */}
        <div className="w-full max-w-[260px] sm:max-w-[280px] mt-8 flex flex-col items-center">
          {/* İlerleme Çubuğunun Üstünde Gezen Sevimli Maskot */}
          <div className="w-full relative h-9 mb-1 overflow-visible">
            <div
              className="absolute top-0 flex flex-col items-center transition-all duration-75 ease-out"
              style={{
                left: `${progress}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="animate-bounce flex flex-col items-center">
                <MiniMascot className="w-7 h-7 drop-shadow-md" />
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 blur-[1px] -mt-0.5" />
              </div>
            </div>
          </div>

          {/* Parlak Kapsül Yüklenme Barı */}
          <div className="w-full h-3 rounded-full bg-white/10 p-0.5 border border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xs">
            {/* Dolum Barı */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 via-amber-400 to-cyan-400 transition-all duration-75 ease-out relative shadow-[0_0_12px_rgba(236,72,153,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Işık Dalgalanması Efekti */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
              
              {/* Uç Nokta Parlaması */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          {/* Yüzde ve Samimi Durum Mesajı */}
          <div className="w-full flex items-center justify-between mt-2.5 px-1">
            <span className="text-[11px] font-bold text-pink-300 transition-all duration-200">
              {getLoadingMessage(progress)}
            </span>
            <span className="text-xs font-black text-amber-300 font-mono tracking-tight shrink-0 drop-shadow-xs">
              %{progress}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ ALT BİLGİ ═══ */}
      <div className="relative z-10 flex flex-col items-center pb-[max(calc(env(safe-area-inset-bottom,0px)+8px),12px)] text-center">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">
          Sesli Sohbet & Parti Dünyası
        </span>
        <span className="text-[9px] text-slate-500 font-mono mt-0.5">
          v2.4.2 • 2026
        </span>
      </div>
    </div>
  );
};
