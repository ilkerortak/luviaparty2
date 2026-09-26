import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { X, Swords, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PKBattleModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

export const PKBattleModal: React.FC<PKBattleModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [teamAScore, setTeamAScore] = useState(1200);
  const [teamBScore, setTeamBScore] = useState(1150);
  const [isBattleActive, setIsBattleActive] = useState(true);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);

  // Timer loop
  useEffect(() => {
    if (!isBattleActive) return;
    if (timeLeft <= 0) {
      handleBattleEnd();
      return;
    }

    const t = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      // Random bot cheering/gifts during PK
      if (Math.random() < 0.4) {
        if (Math.random() < 0.5) setTeamAScore(prev => prev + Math.floor(Math.random() * 50) + 10);
        else setTeamBScore(prev => prev + Math.floor(Math.random() * 50) + 10);
      }
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft, isBattleActive]);

  const handleBattleEnd = () => {
    setIsBattleActive(false);
    const wonTeam = teamAScore >= teamBScore ? 'A' : 'B';
    setWinner(wonTeam);

    if (wonTeam === 'A') {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      onUpdateUser({
        ...currentUser,
        coins: currentUser.coins + 200,
        exp: currentUser.exp + 150,
      });
    } else {
      soundFX.playPop();
    }
  };

  const handleCheerTeamA = () => {
    soundFX.playPop();
    setTeamAScore(prev => prev + 100);
  };

  const totalPoints = teamAScore + teamBScore;
  const teamAPercent = totalPoints > 0 ? (teamAScore / totalPoints) * 100 : 50;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121626] rounded-3xl p-5 border border-rose-500/40 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">⚔️</span>
            <div className="text-left">
              <h3 className="text-sm font-black text-rose-300">Canlı Koltuk PK Karşılaşması</h3>
              <p className="text-[10px] text-slate-400">Sol Koltuklar vs Sağ Koltuklar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Box */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
          <span>Kalan Süre:</span>
          <span>{timeLeft}s</span>
        </div>

        {/* PK Progress Bar & Score Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-blue-400">Takım A: {teamAScore} P</span>
            <span className="text-rose-400">Takım B: {teamBScore} P</span>
          </div>

          <div className="w-full h-4 rounded-full bg-slate-900 border border-white/10 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${teamAPercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-300"
              style={{ width: `${100 - teamAPercent}%` }}
            />
          </div>
        </div>

        {/* Teams Visual Avatars */}
        <div className="grid grid-cols-2 gap-4 py-2">
          {/* Team A */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center space-y-1">
            <span className="text-2xl">🦁</span>
            <span className="text-xs font-black text-blue-300">Aslanlar</span>
            <span className="text-[10px] text-slate-400">1-4. Koltuklar</span>
            <button
              onClick={handleCheerTeamA}
              className="mt-2 w-full py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black active:scale-95 transition"
            >
              Destekle (+100)
            </button>
          </div>

          {/* Team B */}
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col items-center space-y-1">
            <span className="text-2xl">🦅</span>
            <span className="text-xs font-black text-rose-300">Kartallar</span>
            <span className="text-[10px] text-slate-400">5-8. Koltuklar</span>
            <button
              onClick={() => {
                soundFX.playPop();
                setTeamBScore(prev => prev + 100);
              }}
              className="mt-2 w-full py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black active:scale-95 transition"
            >
              Destekle (+100)
            </button>
          </div>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 animate-in zoom-in">
            <span className="text-xs font-bold block">🎉 PK KAZANANI:</span>
            <span className="text-base font-black text-amber-300">
              {winner === 'A' ? '🦁 Takım A (Aslanlar) Kazandı!' : '🦅 Takım B (Kartallar) Kazandı!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
