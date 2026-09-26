import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { subscribeToGlobalHavadis, type GlobalHavadis } from '../../services/havadisService';
import { soundFX } from '../../utils/soundEffects';

interface GlobalHavadisBannerProps {
  onJoinRoom: (roomId: string) => void;
  currentRoomId?: string | null;
  isInGame?: boolean;
}

export const GlobalHavadisBanner: React.FC<GlobalHavadisBannerProps> = ({
  onJoinRoom,
  currentRoomId,
  isInGame = false,
}) => {
  const [announcement, setAnnouncement] = useState<GlobalHavadis | null>(null);
  const dismissTimerRef = useRef<any>(null);

  useEffect(() => {
    const unsub = subscribeToGlobalHavadis((newHavadis) => {
      soundFX.playGiftFanfare();
      setAnnouncement(newHavadis);

      // Kayma süresi bittiğinde havadis otomatik olarak ekrandan kalkar
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setAnnouncement(null);
      }, 14500);
    });

    return () => {
      unsub();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Hide when in any active game
  if (isInGame || !announcement) return null;

  const isAlreadyInRoom = Boolean(currentRoomId && currentRoomId === announcement.roomId);

  const displayRoomNumber = announcement.roomNumber || (announcement.roomId ? (announcement.roomId.startsWith('#') ? announcement.roomId : `#${announcement.roomId.replace(/^room-/, '')}`) : '#101');

  const renderMarqueeSpan = () => (
    <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide pr-8 flex items-center gap-1.5 shrink-0">
      <span className="px-1.5 py-0.2 rounded bg-cyan-500/25 text-cyan-300 font-mono font-black text-[10px] border border-cyan-400/30">
        Oda {displayRoomNumber}
      </span>
      <span className="text-amber-300 font-extrabold">{announcement.senderName}</span>
      <span className="text-amber-200">👑</span>
      <span className="text-slate-300">➔</span>
      {announcement.targetUserName && (
        <span className="text-pink-300 font-bold">{announcement.targetUserName}</span>
      )}
      <span className="text-yellow-200 font-black">
        {announcement.giftName || 'Hediye'}
      </span>
      <span className="text-slate-200">gönderdi:</span>
      <span className="text-pink-200 italic font-semibold bg-white/10 px-1.5 py-0.2 rounded border border-pink-400/20">
        "{announcement.message}"
      </span>
      <span className="text-amber-300 font-black flex items-center gap-0.5">
        <span>💎</span>
        <span>{announcement.totalGold.toLocaleString('tr-TR')} 🪙</span>
      </span>
    </span>
  );

  return (
    <div className="fixed top-[max(calc(env(safe-area-inset-top,0px)+6px),42px)] inset-x-2 sm:inset-x-4 z-[9999] max-w-lg mx-auto select-none pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300">
      <style>{`
        @keyframes smoothHavadisSinglePass {
          0% {
            transform: translate3d(100%, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        .havadis-smooth-ticker {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: smoothHavadisSinglePass 14s linear forwards;
        }
        .havadis-smooth-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ═══ İNCE YATAY KAYAN HAVADİS BOARDU ═══ */}
      <div 
        onClick={() => {
          if (!isAlreadyInRoom && announcement.roomId) {
            soundFX.playPop();
            onJoinRoom(announcement.roomId);
          }
        }}
        className="relative h-8 sm:h-9 rounded-full bg-gradient-to-r from-[#4d1663]/95 via-[#2d1266]/95 to-[#1c0f47]/95 border border-purple-400/50 shadow-[0_4px_20px_rgba(147,51,234,0.4)] backdrop-blur-md flex items-center justify-between px-2 cursor-pointer group active:scale-[0.99] transition overflow-hidden"
      >
        {/* Subtle Ambient Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Left Cute Sticker / Avatar with x1 badge matching WePlay */}
        <div className="relative flex items-center gap-1 shrink-0 z-10 mr-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 border border-white/60 flex items-center justify-center text-xs shadow-sm">
            🌸
          </div>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] leading-tight shadow-sm">
            x1
          </span>
        </div>

        {/* Center: AKICI YATAY KAYAN METİN (Kayma bittiğinde havadis kendiliğinden kapanır) */}
        <div className="flex-1 min-w-0 overflow-hidden relative h-full flex items-center">
          <div 
            className="havadis-smooth-ticker"
            onAnimationEnd={() => setAnnouncement(null)}
          >
            {renderMarqueeSpan()}
          </div>
        </div>

        {/* Right: KATIL BUTONU & Kapat */}
        <div className="shrink-0 z-10 pl-1.5 flex items-center gap-1.5">
          {isAlreadyInRoom ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-bold text-emerald-300 shrink-0">
              Odadasın
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playPop();
                if (announcement.roomId) {
                  onJoinRoom(announcement.roomId);
                }
              }}
              className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-[10px] shadow-sm shadow-pink-500/40 flex items-center gap-0.5 active:scale-90 transition shrink-0"
              title="Odaya Katıl"
            >
              <span>Katıl</span>
              <span className="text-[9px]">➔</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFX.playPop();
              setAnnouncement(null);
            }}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-90 shrink-0"
            title="Kapat"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
