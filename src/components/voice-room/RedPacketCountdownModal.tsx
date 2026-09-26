import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import type { User } from '../../types';

interface RedPacketCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  packet: {
    id: string;
    senderName: string;
    totalGold: number;
    remainingGold: number;
    count: number;
    claimedUsers: string[];
    message: string;
    unlockAt?: number;
  };
  countdown: number;
  currentUser: User;
  onClaim: (amount: number) => void;
}

export const RedPacketCountdownModal: React.FC<RedPacketCountdownModalProps> = ({
  isOpen,
  onClose,
  packet,
  countdown,
  currentUser,
  onClaim,
}) => {
  const [hasOpened, setHasOpened] = useState(false);
  const [wonGold, setWonGold] = useState(0);

  if (!isOpen) return null;

  const isAlreadyClaimed = packet.claimedUsers.includes(currentUser.id);

  const handleOpen = () => {
    if (countdown > 0) return;
    if (hasOpened || isAlreadyClaimed) return;

    soundFX.playGiftFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff4d4d', '#ffffff', '#ff9900'],
    });

    // Calculate dynamic reward between 45 and 180 coins
    const share = Math.floor(Math.random() * 120) + 48;
    setWonGold(share);
    setHasOpened(true);
    onClaim(share);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200">
      {/* ═══ RED PACKET ENVELOPE CARD matching media_1790339116035.jpg & media_1790339116044.jpg ═══ */}
      <div 
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[280px] sm:max-w-[300px] h-[390px] sm:h-[420px] rounded-[32px] bg-gradient-to-b from-[#ff5b36] via-[#f54224] to-[#e42e12] shadow-[0_16px_50px_rgba(228,46,18,0.5)] border-2 border-[#ff7b5a] flex flex-col justify-between overflow-hidden p-6 text-white"
      >
        {/* Subtle Envelope Texture / Curved Highlights */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        {/* Top Section */}
        {!hasOpened ? (
          <div className="relative z-10 flex flex-col items-center text-center mt-6">
            {/* Sender Avatar with Gold Border */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-300 shadow-md bg-stone-900 mb-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                alt={packet.senderName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Sender Name with Flower Badge matching media_1790339116035.jpg */}
            <div className="flex items-center justify-center gap-1.5 text-sm font-black text-white tracking-wide">
              <span className="text-amber-300 text-xs">💮</span>
              <span>{packet.senderName || 'PATRON'}</span>
            </div>

            {/* Red Packet Amount Subtitle */}
            <h3 className="text-sm font-bold text-amber-100/90 mt-1">
              {packet.totalGold ? packet.totalGold.toLocaleString('tr-TR') : '10000'} altın Kırmızı Zarf
            </h3>

            {/* Message if present */}
            {packet.message && (
              <p className="text-[11px] text-amber-200/80 italic mt-2 max-w-[220px] truncate">
                "{packet.message}"
              </p>
            )}
          </div>
        ) : (
          /* Opened State matching media_1790339116044.jpg */
          <div className="relative z-10 flex flex-col items-center text-center mt-12 animate-in zoom-in-95 duration-200">
            <span className="text-base font-bold text-white/95 tracking-wide">
              Tebrikler
            </span>

            {/* Gold Reward Amount */}
            <div className="flex items-baseline justify-center gap-1.5 mt-3">
              <span className="text-5xl font-black text-[#fde047] drop-shadow-[0_2px_10px_rgba(253,224,71,0.5)]">
                {wonGold}
              </span>
              <span className="text-sm font-bold text-[#fef08a]">
                Altın para
              </span>
            </div>

            <span className="text-[11px] text-amber-100/80 font-medium mt-3">
              Altınlar cüzdanınıza başarıyla yüklendi! 🪙
            </span>
          </div>
        )}

        {/* Lower Curved Golden Seam Line & Central Action Button */}
        <div className="relative z-10 w-full mb-6">
          {/* Golden Curved Seam SVG */}
          <div className="absolute inset-x-0 -top-8 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 300 60"
              className="w-full h-14 overflow-visible"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 10 Q 150 55 300 10"
                fill="none"
                stroke="#fed777"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              />
            </svg>
          </div>

          {/* Central Circular Button on Seam matching media_1790339116035.jpg */}
          <div className="relative flex justify-center">
            {!hasOpened ? (
              countdown > 0 ? (
                /* Countdown State: e.g. "30s" or "54s" */
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#fce4aa] border-2 border-[#fff3d4] shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center text-[#785122] font-black text-lg sm:text-xl tracking-tight select-none">
                  {countdown}s
                </div>
              ) : (
                /* Ready to Open: "AÇ" pulsing button */
                <button
                  onClick={handleOpen}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border-2 border-white shadow-[0_0_25px_rgba(251,191,36,0.8)] flex items-center justify-center text-[#5c3a0e] font-black text-xl tracking-wider active:scale-95 transition animate-pulse hover:scale-105 cursor-pointer"
                >
                  AÇ
                </button>
              )
            ) : (
              <div className="h-10" />
            )}
          </div>
        </div>
      </div>

      {/* ═══ CIRCULAR CLOSE BUTTON BELOW ENVELOPE matching media_1790339116035.jpg & media_1790339116044.jpg ═══ */}
      <button
        onClick={onClose}
        className="mt-6 w-11 h-11 rounded-full bg-black/80 border-2 border-amber-300/80 shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-amber-200 hover:text-white hover:border-amber-200 transition active:scale-90"
        title="Kapat"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
