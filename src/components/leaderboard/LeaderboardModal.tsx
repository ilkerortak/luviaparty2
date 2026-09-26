import React, { useEffect, useState } from 'react';
import { getTopPlayers } from '../../services/leaderboardService';
import { X, Trophy } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAMES = [
  { id: 'werewolf', label: 'Uzay Kurtadamı' },
  { id: 'uno', label: 'UNO Çılgınlığı' },
  { id: 'trivia', label: 'Bilgi Yarışması' },
  { id: 'draw_guess', label: 'Çiz & Tahmin Et' },
  { id: 'spy', label: 'Casus Kim?' },
  { id: 'ludo', label: 'Kızma Birader' },
  { id: 'mic_grab', label: 'Şarkıyı Yakala' },
  { id: 'jackaroo', label: 'Jackaroo' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<any>('werewolf');
  const [players, setPlayers] = useState<Array<{ userId: string; username: string; score: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getTopPlayers(activeTab, 10);
        setPlayers(data);
      } catch (err) {
        console.warn('Leaderboard fetch failed', err);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121528] rounded-3xl w-full max-w-md flex flex-col max-h-[80vh] border border-amber-500/30 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
          <div className="flex items-center gap-2 relative z-10">
            <Trophy className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-lg font-black text-white shadow-sm drop-shadow-md tracking-wide">
                Liderlik & Kupa Ligi
              </h2>
              <span className="text-[10px] text-amber-100 font-bold block">Sezon 1: Haftalık Kupa Sıralaması</span>
            </div>
          </div>
          <button onClick={() => { soundFX.playPop(); onClose(); }} className="relative z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ranked League Tiers Banner */}
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-amber-300">
            <span>🛡️ Senin Ligin:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">Altın Lig II</span>
          </div>
          <span className="text-slate-400">Ödül: +1.000 Altın + VIP</span>
        </div>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto no-scrollbar bg-[#0f1224] p-2 gap-2 border-b border-white/[0.08]">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => { soundFX.playPop(); setActiveTab(game.id); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeTab === game.id 
                ? 'bg-amber-500 text-slate-900 shadow-md' 
                : 'bg-[#1b1f3b] text-slate-400 hover:text-white'
              }`}
            >
              {game.label}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : players.length === 0 ? (
            <div className="text-center text-slate-500 py-10 text-sm font-bold">
              Henüz kimse sıralamaya girmedi.
            </div>
          ) : (
            players.map((p, idx) => {
              let medal = null;
              if (idx === 0) medal = '🥇';
              else if (idx === 1) medal = '🥈';
              else if (idx === 2) medal = '🥉';

              return (
                <div key={p.userId} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center font-black text-lg">
                      {medal ? medal : <span className="text-slate-500 text-sm">{idx + 1}</span>}
                    </div>
                    <div className="font-bold text-sm text-slate-200">{p.username}</div>
                  </div>
                  <div className="font-black text-amber-400 font-mono text-sm tracking-tight">
                    {p.score.toLocaleString()} <span className="text-[10px] text-amber-600">XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
