import React, { useState, useEffect, useRef } from 'react';
import { ref as dbRef, push, onChildAdded, remove, off } from 'firebase/database';
import { rtdb } from '../../firebase/config';
import { soundFX } from '../../utils/soundEffects';
import { Heart, Sparkles, Flame, ThumbsUp, PartyPopper } from 'lucide-react';

interface FloatingReaction {
  id: string;
  emoji: string;
  xOffset: number; // percentage across the container (0-100)
  speed: number;
  scale: number;
  rotation: number;
}

interface FloatingReactionsProps {
  roomId: string;
  currentUserId: string;
}

const REACTION_EMOJIS = ['❤️', '🔥', '👏', '🎉', '✨', '💖', '⭐', '🌸'];

export const FloatingReactions: React.FC<FloatingReactionsProps> = ({ roomId, currentUserId }) => {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const paletteTimerRef = useRef<any>(null);

  // RTDB Listener for live floating reactions from other room members
  useEffect(() => {
    const reactionsRef = dbRef(rtdb, `voice_rooms/${roomId}/live_reactions`);
    const seenIds = new Set<string>();

    const unsub = onChildAdded(reactionsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;
      const id = snapshot.key || val.id;
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const now = Date.now();
      // Only show reactions sent within the last 6 seconds
      if (Math.abs(now - (val.timestamp || 0)) < 6000) {
        addReactionVisual(val.emoji || '❤️');
      }

      // Auto clean older reactions
      if (now - (val.timestamp || 0) > 10000) {
        remove(snapshot.ref).catch(() => {});
      }
    });

    return () => {
      off(reactionsRef);
    };
  }, [roomId]);

  const addReactionVisual = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emoji,
      xOffset: Math.floor(10 + Math.random() * 80), // 10% to 90%
      speed: 2.5 + Math.random() * 1.5, // 2.5s to 4s
      scale: 0.8 + Math.random() * 0.6,
      rotation: -25 + Math.random() * 50,
    };

    setReactions((prev) => [...prev.slice(-25), newReaction]);

    // Remove reaction after animation ends
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3800);
  };

  const handleSendReaction = (emoji: string) => {
    soundFX.playHeartPop();
    addReactionVisual(emoji);

    // Push to RTDB for other room members
    try {
      const reactionsRef = dbRef(rtdb, `voice_rooms/${roomId}/live_reactions`);
      push(reactionsRef, {
        emoji,
        senderId: currentUserId,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Failed to push live reaction:', e);
    }
  };

  const togglePalette = () => {
    soundFX.playPop();
    setShowPalette((prev) => !prev);
    if (paletteTimerRef.current) clearTimeout(paletteTimerRef.current);
    if (!showPalette) {
      paletteTimerRef.current = setTimeout(() => setShowPalette(false), 5000);
    }
  };

  return (
    <>
      {/* ═══ FLOATING PARTICLES CANVAS AREA (Pointer events none) ═══ */}
      <div className="fixed right-3 bottom-24 w-32 h-72 pointer-events-none z-30 overflow-hidden flex flex-col justify-end">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-0 select-none animate-float-up pointer-events-none drop-shadow-md text-2xl"
            style={{
              left: `${r.xOffset}%`,
              animationDuration: `${r.speed}s`,
              transform: `scale(${r.scale}) rotate(${r.rotation}deg)`,
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* ═══ REACTION LAUNCHER CONTROLS ═══ */}
      <div className="relative">
        {/* Expanded Emoji Palette Popup */}
        {showPalette && (
          <div className="absolute bottom-12 right-0 mb-2 p-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-1.5 z-40 animate-in zoom-in-90 fade-in duration-150">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 active:scale-125 transition flex items-center justify-center text-lg shadow-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Quick Tap Heart Button */}
        <button
          onClick={() => handleSendReaction('❤️')}
          onContextMenu={(e) => {
            e.preventDefault();
            togglePalette();
          }}
          className="relative group p-2.5 rounded-full bg-gradient-to-tr from-pink-500/80 to-rose-400/80 text-white shadow-lg shadow-pink-500/30 active:scale-90 transition border border-white/30 backdrop-blur-md"
          title="Tepki Gönder (Basılı tut veya sağ tık: Emojiler)"
        >
          <Heart className="w-5 h-5 fill-white text-white drop-shadow animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-400" />
          </span>
        </button>
      </div>
    </>
  );
};
