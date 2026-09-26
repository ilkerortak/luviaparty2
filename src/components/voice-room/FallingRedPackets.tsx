import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Clock, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface FallingPacketItem {
  id: number;
  xPercent: number; // 4% to 86%
  delay: number; // seconds
  duration: number; // 2.6s to 4.0s
  size: number; // 70px - 88px
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
}

interface FallingRedPacketsProps {
  packet: {
    id: string;
    senderName: string;
    totalGold: number;
    remainingGold: number;
    count: number;
    claimedUsers?: string[];
    message: string;
    unlockAt?: number;
  };
  currentUserId: string;
  onFinished: (collectedCount: number, rewardGold: number) => void;
  onClose: () => void;
}

export const FallingRedPackets: React.FC<FallingRedPacketsProps> = ({
  packet,
  currentUserId,
  onFinished,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [collectedCount, setCollectedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalGold, setFinalGold] = useState(0);
  const [packets, setPackets] = useState<FallingPacketItem[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  const hasFinishedRef = useRef(false);
  const collectedSetRef = useRef<Set<number>>(new Set());
  const scoreCounterRef = useRef(0);

  // Generate falling packets (24 adet zengin ve eğlenceli zarf yağmuru)
  useEffect(() => {
    const list: FallingPacketItem[] = [];
    for (let i = 0; i < 24; i++) {
      list.push({
        id: i,
        xPercent: 5 + Math.floor(Math.random() * 82), // 5% - 87% (ekran sınırlarında geniş dağılım)
        delay: +(Math.random() * 2.8).toFixed(2), // 5 saniyelik tura uygun aralık (0s - 2.8s)
        duration: +(1.8 + Math.random() * 1.0).toFixed(2), // Hızlı ve pürüzsüz süzülüş (1.8s - 2.8s)
        size: 68 + Math.floor(Math.random() * 16), // 68px - 84px
      });
    }
    setPackets(list);
  }, []);

  // Countdown timer for game round (5 saniye)
  useEffect(() => {
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Ultra-responsive, zero-lag pointer handler (fires at 0ms touch-down)
  const handleCollect = (
    packetId: number,
    clientX: number,
    clientY: number,
    element: HTMLElement
  ) => {
    if (isGameOver || collectedSetRef.current.has(packetId)) return;
    collectedSetRef.current.add(packetId);

    // Instant sound feedback
    soundFX.playPop();

    // Instant DOM visual feedback (no React re-render delay)
    element.style.pointerEvents = 'none';
    element.style.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out';
    element.style.transform = 'scale(1.4)';
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.display = 'none';
    }, 160);

    // Spawn floating score indicator
    scoreCounterRef.current += 1;
    const scoreId = scoreCounterRef.current;
    setFloatingScores(prev => [...prev, { id: scoreId, x: clientX, y: clientY }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== scoreId));
    }, 800);

    setCollectedCount(c => c + 1);
  };

  const finishGame = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsGameOver(true);

    const baseShare = Math.max(15, Math.floor(packet.totalGold / Math.max(1, packet.count)));

    let earned = 5;
    if (collectedCount > 0) {
      if (collectedCount >= 12) {
        earned = Math.min(packet.totalGold, Math.floor(baseShare * 3.5));
      } else if (collectedCount >= 7) {
        earned = Math.min(packet.totalGold, Math.floor(baseShare * 2.5));
      } else if (collectedCount >= 3) {
        earned = Math.min(packet.totalGold, Math.floor(baseShare * 1.6));
      } else {
        earned = Math.max(10, Math.floor(baseShare * 1.0));
      }
    }

    setFinalGold(earned);
    soundFX.playGiftFanfare();
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ef4444', '#ffd700'],
    });

    onFinished(collectedCount, earned);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex flex-col items-center justify-between select-none"
      style={{ touchAction: 'none' }}
    >
      {/* 
        DÜZ FORMAT: DÖNME YOK, TİTREME YOK! 
        Zarflar tamamen düz ve dik süzülür.
      */}
      <style>{`
        @keyframes envelopeFallStraight {
          0% {
            transform: translate3d(0, -120px, 0);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 105vh, 0);
            opacity: 0.1;
          }
        }
        .animate-envelope-straight {
          animation-name: envelopeFallStraight;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        @keyframes floatScoreUp {
          0% {
            transform: translate3d(-50%, 0, 0) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate3d(-50%, -60px, 0) scale(1.3);
            opacity: 0;
          }
        }
        .animate-score-float {
          animation: floatScoreUp 0.8s ease-out forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Top Banner Info */}
      <div className="relative z-10 w-full max-w-md pt-4 px-4 flex flex-col items-center">
        <div className="bg-red-950/95 border-2 border-amber-500/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl animate-bounce filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
              🧧
            </span>
            <div>
              <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                <span>{packet.senderName}</span>
                <span className="text-[10px] text-red-300 font-normal">Kırmızı Zarf Yağmuru</span>
              </div>
              <div className="text-[11px] text-amber-100 font-semibold truncate max-w-[180px]">
                "{packet.message}"
              </div>
            </div>
          </div>

          {/* Timer & Collected pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1.5 rounded-xl border border-white/10 text-white font-mono font-black text-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className={timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-300'}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/25 px-2.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 font-black text-sm">
              <Zap className="w-3.5 h-3.5" />
              <span>{collectedCount}</span>
            </div>
          </div>
        </div>

        {/* Floating helper note */}
        {!isGameOver && (
          <div className="mt-2 text-[11px] font-bold text-amber-200/95 bg-red-900/80 px-3.5 py-1 rounded-full border border-red-500/40 shadow-lg animate-pulse flex items-center gap-1.5">
            <span>👆</span>
            <span>Düşen 🧧 zarflarına dokunarak hemen kap! (0 gecikme)</span>
          </div>
        )}
      </div>

      {/* Floating "+1 🪙" pop indicators on touch coordinates */}
      {floatingScores.map(score => (
        <div
          key={score.id}
          className="fixed pointer-events-none z-40 text-amber-300 font-black text-base filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] animate-score-float flex items-center gap-0.5"
          style={{ left: `${score.x}px`, top: `${score.y}px` }}
        >
          <span>+1</span>
          <span>🪙</span>
        </div>
      ))}

      {/* Falling Envelopes Arena — UPRIGHT, STRAIGHT DOWN, 🧧 EMOJI, ZERO-LAG TOUCH */}
      {!isGameOver && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {packets.map(item => (
            <div
              key={item.id}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCollect(item.id, e.clientX, e.clientY, e.currentTarget);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const touch = e.touches[0];
                if (touch) {
                  handleCollect(item.id, touch.clientX, touch.clientY, e.currentTarget);
                }
              }}
              className="absolute pointer-events-auto cursor-pointer animate-envelope-straight select-none flex flex-col items-center justify-center p-2"
              style={{
                left: `${item.xPercent}%`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
                width: `${item.size}px`,
                height: `${Math.round(item.size * 1.25)}px`,
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Büyütülmüş 🧧 Emoji ve Parıltılı KAP Etiketi (Hafif GPU dostu gölge) */}
              <div className="relative w-full h-full flex flex-col items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] pointer-events-none">
                <span
                  className="text-6xl sm:text-7xl leading-none select-none pointer-events-none transition-transform active:scale-125"
                  role="img"
                  aria-label="Kırmızı Zarf"
                >
                  🧧
                </span>
                <span className="mt-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-black shadow-md border border-white/80 pointer-events-none flex items-center gap-0.5 tracking-tight">
                  <Sparkles className="w-2.5 h-2.5 text-amber-900" />
                  <span>KAP</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Game Over / Results Modal */}
      {isGameOver && (
        <div className="relative z-30 my-auto w-full max-w-xs bg-gradient-to-b from-red-800 via-red-900 to-stone-950 border-2 border-amber-400/80 rounded-3xl p-6 text-white text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-900 flex items-center justify-center shadow-xl border-2 border-white">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-amber-300">ZARF YAĞMURU BİTTİ!</h3>
          <p className="text-xs text-red-200 mt-1">
            Toplam <span className="text-amber-300 font-bold">{collectedCount}</span> zarf topladın!
          </p>

          <div className="my-5 p-4 rounded-2xl bg-black/40 border border-amber-500/30 flex flex-col items-center justify-center">
            <span className="text-[11px] text-amber-200 font-bold">KAZANDIĞIN ÖDÜL</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-3xl font-black text-amber-400">+{finalGold}</span>
              <span className="text-xl">🪙</span>
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1">
              {collectedCount >= 4
                ? '🔥 Harika refleks! Ekstra şans bonusu kazandın!'
                : 'Tebrikler! Altınlar hesabına eklendi.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-stone-950 font-black text-sm shadow-xl active:scale-95 transition"
          >
            Harika! Odada Kal
          </button>
        </div>
      )}

      <div className="relative z-10 pb-6"></div>
    </div>
  );
};
