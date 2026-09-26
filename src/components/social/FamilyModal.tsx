import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import {
  X,
  Users,
  Shield,
  Trophy,
  Gift,
  Sparkles,
  MessageCircle,
  Coins,
  ChevronRight,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FamilyModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
  onOpenVoiceRoom: () => void;
}

interface ClanMember {
  id: string;
  name: string;
  role: 'Lider' | 'Kıdemli' | 'Üye';
  level: number;
  contribution: number;
  isOnline: boolean;
  avatarIcon: string;
}

export const FamilyModal: React.FC<FamilyModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
  onOpenVoiceRoom,
}) => {
  const [hasClaimedDailyChest, setHasClaimedDailyChest] = useState(() => {
    return localStorage.getItem('luvia_family_chest') === new Date().toDateString();
  });
  const [clanExp, setClanExp] = useState(14850);
  const maxClanExp = 20000;
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'ranking'>('info');

  const members: ClanMember[] = [
    { id: currentUser.id, name: currentUser.username, role: 'Kıdemli', level: currentUser.level, contribution: 2450, isOnline: true, avatarIcon: '👑' },
    { id: '2', name: 'Baron_Kurt', role: 'Lider', level: 18, contribution: 8900, isOnline: true, avatarIcon: '🐺' },
    { id: '3', name: 'Melisa_06', role: 'Kıdemli', level: 12, contribution: 3100, isOnline: true, avatarIcon: '💖' },
    { id: '4', name: 'Ege_Gamer', role: 'Üye', level: 9, contribution: 1200, isOnline: false, avatarIcon: '⚡' },
    { id: '5', name: 'Canan_K', role: 'Üye', level: 7, contribution: 850, isOnline: true, avatarIcon: '🌸' },
  ];

  const handleClaimChest = () => {
    if (hasClaimedDailyChest) return;
    soundFX.playGiftFanfare();
    confetti({ particleCount: 60, spread: 70 });
    const rewardCoins = 1000;
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + rewardCoins,
    });
    setClanExp(prev => Math.min(maxClanExp, prev + 150));
    setHasClaimedDailyChest(true);
    localStorage.setItem('luvia_family_chest', new Date().toDateString());
    alert(`🎉 Aile Sandığı Açıldı!\n+${rewardCoins} Altın kazandınız!`);
  };

  const handleDonate = () => {
    if (currentUser.coins < 500) {
      alert('Bağış yapmak için en az 500 altınınız olmalı!');
      return;
    }
    soundFX.playSuccess();
    confetti({ particleCount: 40, spread: 50 });
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins - 500,
      exp: currentUser.exp + 100,
    });
    setClanExp(prev => Math.min(maxClanExp, prev + 500));
    alert('⚜️ Aile Fonuna 500 Altın bağışlandı! +100 Kişisel XP ve +500 Klan Deneyimi kazanıldı.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 p-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-lg">
                ⚜️
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-base font-black text-white">Kraliyet Elitleri</h3>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px]">
                    Lv.5
                  </span>
                </div>
                <div className="text-[11px] text-purple-200/80 font-medium">
                  ID: #77490 • 38/50 Üye
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundFX.playPop();
                onClose();
              }}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clan Notice */}
          <div className="mt-3 p-2.5 rounded-xl bg-black/30 backdrop-blur border border-white/10 text-xs text-purple-100 flex items-start space-x-2">
            <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              📢 <strong>Aile Duyurusu:</strong> Her akşam saat 21:00'da Klan Odasında Kurtadam & Jackaroo turnuvası vardır. Herkes davetlidir!
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-black">
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab('info');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'info'
                ? 'border-pink-500 text-pink-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Aile Bilgisi
          </button>
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab('members');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'members'
                ? 'border-pink-500 text-pink-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Üyeler ({members.length})
          </button>
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab('ranking');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'ranking'
                ? 'border-pink-500 text-pink-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Klan Sıralaması
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'info' && (
            <>
              {/* Daily Chest */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl animate-bounce">🎁</div>
                  <div>
                    <div className="text-xs font-black text-yellow-300">Günlük Aile Sandığı</div>
                    <div className="text-[11px] text-slate-300">Günde 1 kez ücretsiz altın al!</div>
                  </div>
                </div>
                <button
                  onClick={handleClaimChest}
                  disabled={hasClaimedDailyChest}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${
                    hasClaimedDailyChest
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 text-slate-950 shadow-lg active:scale-95'
                  }`}
                >
                  {hasClaimedDailyChest ? 'Alındı ✓' : 'Aç'}
                </button>
              </div>

              {/* Clan Voice Room Quick Action */}
              <div
                onClick={() => {
                  soundFX.playPop();
                  onClose();
                  onOpenVoiceRoom();
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-pink-500/30 flex items-center justify-between cursor-pointer hover:border-pink-400 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl">
                    🎙️
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center space-x-1.5">
                      <span>Aile Sesli Sohbet Odası</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-400">Şu anda 6 klan üyesi sohbette!</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-pink-400" />
              </div>

              {/* Clan Level Progress */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Klan Seviyesi Gelişimi</span>
                  <span className="text-yellow-400 font-black">{clanExp} / {maxClanExp} XP</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(clanExp / maxClanExp) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                  <span className="text-[11px] text-slate-400">Seviye atlamak için bağış yap</span>
                  <button
                    onClick={handleDonate}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition flex items-center space-x-1 active:scale-95"
                  >
                    <Coins className="w-3.5 h-3.5 text-yellow-300" />
                    <span>500 Altın Bağışla</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2">
              {members.map(m => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-purple-600/30 flex items-center justify-center text-lg">
                        {m.avatarIcon}
                      </div>
                      {m.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-white">{m.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-bold">
                          {m.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Lv.{m.level} • Katkı: {m.contribution} Puan
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold ${m.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {m.isOnline ? 'Çevrim içi' : 'Çevrim dışı'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-2">
              {[
                { rank: 1, name: 'Kurtlar Vadisi', level: 10, power: '1.2M', icon: '🐺', crown: '🥇' },
                { rank: 2, name: 'Kraliyet Elitleri (Bizim Klan)', level: 5, power: '850K', icon: '⚜️', crown: '🥈' },
                { rank: 3, name: 'Gece Kuşları', level: 4, power: '620K', icon: '🌙', crown: '🥉' },
                { rank: 4, name: 'Anadolu Aslanları', level: 3, power: '410K', icon: '🦁', crown: '4.' },
              ].map(r => (
                <div
                  key={r.rank}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    r.rank === 2
                      ? 'bg-purple-900/30 border-purple-500/50'
                      : 'bg-slate-800/40 border-slate-700/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-black text-yellow-400 w-5">{r.crown}</span>
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <span className="text-xs font-black text-white block">{r.name}</span>
                      <span className="text-[10px] text-slate-400">Seviye {r.level} • Güç: {r.power}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
