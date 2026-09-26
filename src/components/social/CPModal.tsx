import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import {
  X,
  Heart,
  Sparkles,
  Droplet,
  Calendar,
  Gift,
  Award,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CPModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
  onOpenVoiceRoom: () => void;
}

export const CPModal: React.FC<CPModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
  onOpenVoiceRoom,
}) => {
  const [intimacy, setIntimacy] = useState(840);
  const maxIntimacy = 1000;
  const [treeWaterCount, setTreeWaterCount] = useState(() => {
    return parseInt(localStorage.getItem('luvia_cp_tree_water') || '0', 10);
  });
  const [hasWateredToday, setHasWateredToday] = useState(() => {
    return localStorage.getItem('luvia_cp_watered_date') === new Date().toDateString();
  });

  const partnerName = currentUser.cpPartner?.name || 'Melisa_06';
  const cpLevel = currentUser.cpPartner?.intimacyLevel || 4;
  const [showWeddingCeremony, setShowWeddingCeremony] = useState(false);

  const handleWaterTree = () => {
    if (hasWateredToday) return;
    soundFX.playGiftFanfare();
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#f43f5e', '#ec4899', '#fb7185'],
    });

    const newWaterCount = treeWaterCount + 1;
    const newIntimacy = Math.min(maxIntimacy, intimacy + 50);
    setIntimacy(newIntimacy);
    setTreeWaterCount(newWaterCount);
    setHasWateredToday(true);
    localStorage.setItem('luvia_cp_tree_water', newWaterCount.toString());
    localStorage.setItem('luvia_cp_watered_date', new Date().toDateString());

    // Bonus reward
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + 300,
      exp: currentUser.exp + 50,
    });

    alert('💧 Aşk Ağacı sulandı!\n+50 Samimiyet Puanı ve +300 Altın kazandınız!');
  };

  const rings = [
    { id: '1', name: 'Gümüş Söz Yüzüğü', level: 1, unlocked: true, icon: '💍', desc: 'Birlikte ilk adım' },
    { id: '2', name: 'Platin Sonsuzluk Yüzüğü', level: 3, unlocked: true, icon: '💎', desc: 'Sonsuz sevginin sembolü' },
    { id: '3', name: 'Kraliyet Safir Yüzüğü', level: 6, unlocked: false, icon: '👑', desc: 'Lv.6 Samimiyet ile açılır' },
    { id: '4', name: 'Melek Kanatları Aşk Yüzüğü', level: 10, unlocked: false, icon: '💖', desc: 'Lv.10 Efsanevi Yüzük' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-rose-900 via-pink-900 to-purple-900 p-4 border-b border-rose-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse" />
              <div>
                <h3 className="text-base font-black text-white">CP Partnerim (Çift & Kanka)</h3>
                <span className="text-[11px] text-rose-200/80 font-medium">142 Gündür Birlikte ❤️</span>
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

          {/* Partner Avatar Presentation */}
          <div className="mt-4 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                  😎
                </div>
              </div>
              <span className="text-xs font-black text-white mt-1.5">{currentUser.username}</span>
              <span className="text-[10px] text-pink-300 font-bold">Ben</span>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <span className="text-2xl animate-bounce">💖</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-black border border-rose-500/40">
                Lv.{cpLevel} CP
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                  🥰
                </div>
              </div>
              <span className="text-xs font-black text-white mt-1.5">{partnerName}</span>
              <span className="text-[10px] text-rose-300 font-bold">Ruh İkizi</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Intimacy Progress */}
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-rose-200">Samimiyet Seviyesi</span>
              <span className="text-rose-400 font-black">{intimacy} / {maxIntimacy} XP</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(intimacy / maxIntimacy) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              Birlikte sesli odada kalınca ve oyun oynayınca samimiyet puanı artar!
            </div>
          </div>

          {/* Interactive Love Tree Minigame */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border border-pink-500/30 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
            <div className="text-4xl animate-pulse">🌳💕</div>
            <div>
              <h4 className="text-sm font-black text-pink-300">Aşk Ağacı</h4>
              <p className="text-[11px] text-slate-400">
                Ağacı her gün sulayarak tatlı meyveler ve altın ödülleri toplayın!
              </p>
            </div>

            <button
              onClick={handleWaterTree}
              disabled={hasWateredToday}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs flex items-center space-x-2 transition transform shadow-lg ${
                hasWateredToday
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white active:scale-95 shadow-pink-500/30'
              }`}
            >
              <Droplet className="w-4 h-4 fill-current" />
              <span>{hasWateredToday ? 'Bugün Sulandı ✓' : 'Ağacı Sula (+50 XP)'}</span>
            </button>
          </div>

          {/* Nikah Dairesi / Sanal Düğün Butonu */}
          <div
            onClick={() => {
              soundFX.playGiftFanfare();
              confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
              setShowWeddingCeremony(true);
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border-2 border-amber-400/50 flex items-center justify-between cursor-pointer hover:border-amber-300 transition shadow-lg active:scale-98"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-xl shadow-md text-amber-950 font-black">
                💍
              </div>
              <div>
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span>Nikah Dairesi & Düğün Töreni</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">CANLI</span>
                </div>
                <div className="text-[11px] text-slate-300">Yüzükleri takın ve sanal düğün salonunu açın!</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300" />
          </div>

          {/* CP Voice Room Button */}
          <div
            onClick={() => {
              soundFX.playPop();
              onClose();
              onOpenVoiceRoom();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-900/40 to-purple-900/40 border border-rose-500/30 flex items-center justify-between cursor-pointer hover:border-pink-400 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">
                🎙️
              </div>
              <div>
                <div className="text-xs font-black text-white">Çift Özel Sesli Odası</div>
                <div className="text-[11px] text-slate-400">Birlikte müzik dinleyin ve konuşun</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-400" />
          </div>

          {/* Ring Collection Showcase */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Yüzük Koleksiyonu
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {rings.map(r => (
                <div
                  key={r.id}
                  className={`p-3 rounded-2xl border flex flex-col space-y-1 ${
                    r.unlocked
                      ? 'bg-purple-950/30 border-rose-500/40'
                      : 'bg-slate-800/30 border-slate-700/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{r.icon}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      r.unlocked ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {r.unlocked ? 'Açık ✓' : `Lv.${r.level}`}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white">{r.name}</span>
                  <span className="text-[10px] text-slate-400">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ NİKAH DAİRESİ CANLI TÖREN POPUP ═══ */}
        {showWeddingCeremony && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-rose-950 via-[#1e0a1c] to-black rounded-3xl p-6 border-2 border-amber-400 max-w-sm w-full text-white text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="text-4xl animate-bounce">💒💍👰🤵</div>
              <div>
                <h3 className="text-lg font-black text-amber-300">Luvia Nikah Dairesi</h3>
                <p className="text-xs text-rose-200 mt-0.5">
                  {currentUser.username} & {partnerName} Sonsuz Aşk Yemini
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs text-pink-300 block font-bold">Ömür Boyu CP Ünvanı</span>
                <span className="text-base font-black text-amber-400">👑 Ebedi Aşıklar</span>
                <p className="text-[11px] text-slate-300">
                  Tebrikler! Düğününüz için tüm odaya özel kırmızı zarf ve havai fişekler dağıtıldı.
                </p>
              </div>

              <button
                onClick={() => {
                  soundFX.playGiftFanfare();
                  confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
                  setShowWeddingCeremony(false);
                  onClose();
                  onOpenVoiceRoom();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 text-amber-950 font-black text-xs active:scale-95 transition shadow-xl"
              >
                Düğün Ses Odasına Geç ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
