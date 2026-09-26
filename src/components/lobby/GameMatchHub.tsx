import React, { useState } from 'react';
import type { User, GameType } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Users,
  Play,
  UserPlus,
  Bot,
  Copy,
  Check,
  Crown,
  Share2,
  Sparkles,
  Shield,
  HelpCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
export type { GameType };

interface GameMatchHubProps {
  gameId: GameType;
  currentUser: User;
  onStartGame: () => void;
  onClose: () => void;
}

interface PlayerSlot {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  isBot: boolean;
  avatarConfig: any;
}

const GAME_INFO: Record<GameType, {
  title: string;
  subtitle: string;
  maxPlayers: number;
  bgGradient: string;
  badgeColor: string;
  rules: string[];
  bannerEmoji: string;
}> = {
  werewolf: {
    title: 'Uzay Kurtadamı',
    subtitle: 'Hainleri sorgula, görevleri yap veya ekibi gizlice avla!',
    maxPlayers: 6,
    bgGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    rules: [
      'Oyunculara gizli roller atanır (Köylü, Kurtadam, Doktor, Dedektif).',
      'Gece olduğunda kurtlar avlanır, doktor korur, dedektif inceler.',
      'Gündüz oylamasında haini bulup uzaya fırlatın!',
    ],
    bannerEmoji: '🐺🚀',
  },
  draw_guess: {
    title: 'Çiz & Tahmin Et',
    subtitle: 'Tuvale çiz, kelimeyi ilk bilen puanları toplasın!',
    maxPlayers: 5,
    bgGradient: 'from-pink-900 via-rose-950 to-slate-950',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    rules: [
      'Sırası gelen oyuncu verilen kelimeyi çizer.',
      'Diğer oyuncular sohbete tahminlerini yazar.',
      'En hızlı doğru bilen ve çizen en çok puanı alır!',
    ],
    bannerEmoji: '🎨✨',
  },
  spy: {
    title: 'Casus Kim?',
    subtitle: 'Aramızdaki gizli ajanı sorularla tespit et!',
    maxPlayers: 5,
    bgGradient: 'from-cyan-900 via-teal-950 to-slate-950',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    rules: [
      'Bir oyuncu hariç herkes aynı gizli kelimeyi alır.',
      'Casus kelimeyi bilmez, çaktırmadan konuşmalıdır.',
      'Soru-cevap turu sonunda casusu oylayın!',
    ],
    bannerEmoji: '🕵️‍♂️🔍',
  },
  ludo: {
    title: 'Kızma Birader',
    subtitle: 'Klasik zar turnuvası, tüm piyonları yuvaya ulaştır!',
    maxPlayers: 4,
    bgGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rules: [
      '6 atan oyuncu piyonunu sahaya çıkarır.',
      'Rakiplerin piyonlarının üzerine basarak onları başlangıca gönderin.',
      '4 piyonunu ilk hedefe sokan oyunu kazanır!',
    ],
    bannerEmoji: '🎲🏆',
  },
  mic_grab: {
    title: 'Şarkıyı Yakala',
    subtitle: 'Mikrofonu kap, şarkının devamını doğru söyle!',
    maxPlayers: 4,
    bgGradient: 'from-indigo-900 via-blue-950 to-slate-950',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    rules: [
      'Şarkı çalar ve aniden durur.',
      'Mikrofona ilk basan yarışmacı şarkının sözlerini tamamlar.',
      'Doğru söyleyen puanı kapar!',
    ],
    bannerEmoji: '🎤🎵',
  },
  jackaroo: {
    title: 'Jackaroo (2v2)',
    subtitle: '52 kartlı efsanevi masa ve strateji turnuvası!',
    maxPlayers: 4,
    bgGradient: 'from-amber-900 via-orange-950 to-slate-950',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    rules: [
      'Karşılıklı oturan oyuncular ortaktır (2v2).',
      'Kartları oynayarak bilyelerinizi güvenlik bölgesine taşıyın.',
      'Takım olarak tüm bilyeleri ilk bitiren kazanır!',
    ],
    bannerEmoji: '🃏👑',
  },
  uno: {
    title: 'UNO Çılgınlığı',
    subtitle: 'Rakamları ve renkleri eşleştir, son karta kalırken UNO de!',
    maxPlayers: 4,
    bgGradient: 'from-red-900 via-rose-950 to-slate-950',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    rules: [
      'Yerdeki kartla aynı renk veya aynı rakamdaki kartı at.',
      '+2, +4, Yön Değiştir ve Pas kartlarıyla rakipleri şaşırt.',
      'Elinizde tek kart kaldığında UNO demeyi unutmayın!',
    ],
    bannerEmoji: '🔥🃏',
  },
  trivia: {
    title: 'Bilgi Yarışması',
    subtitle: 'Zamana karşı yarış, genel kültür sorularını bilerek lider ol!',
    maxPlayers: 4,
    bgGradient: 'from-amber-900 via-yellow-950 to-slate-950',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    rules: [
      'Her soru için 10 saniyeniz var, hızlı cevaplayan daha çok puan alır.',
      'Zorlandığınızda %50 Eleme jokerinizi kullanın.',
      'En yüksek puanı toplayan yarışmanın şampiyonu olur!',
    ],
    bannerEmoji: '🧠🏆',
  },
};

const DEMO_FRIENDS = [
  {
    id: 'f1',
    name: 'Melisa_06',
    avatarConfig: { skinColor: '#FEE3D4', hairStyle: 'ponytail', hairColor: '#d97706', eyeStyle: 'cute', mouthStyle: 'smile', outfit: 'party_dress', outfitColor: '#ec4899', accessory: 'cat_ears', frame: 'sakura' }
  },
  {
    id: 'f2',
    name: 'Ege_Gamer',
    avatarConfig: { skinColor: '#FFDCB1', hairStyle: 'anime', hairColor: '#06b6d4', eyeStyle: 'cool', mouthStyle: 'smirk', outfit: 'cyberpunk', outfitColor: '#3b82f6', accessory: 'gaming_headset', frame: 'cyber_glow' }
  },
  {
    id: 'f3',
    name: 'Canan_K',
    avatarConfig: { skinColor: '#E8B688', hairStyle: 'curly', hairColor: '#3b2219', eyeStyle: 'sparkle', mouthStyle: 'laugh', outfit: 'streetwear', outfitColor: '#10b981', accessory: 'glasses', frame: 'none' }
  },
  {
    id: 'f4',
    name: 'RIGBY',
    avatarConfig: { skinColor: '#FEE3D4', hairStyle: 'messy', hairColor: '#451a03', eyeStyle: 'cool', mouthStyle: 'smirk', outfit: 'hoodie', outfitColor: '#0284c7', accessory: 'none', frame: 'none' }
  }
];

export const GameMatchHub: React.FC<GameMatchHubProps> = ({
  gameId,
  currentUser,
  onStartGame,
  onClose,
}) => {
  const game = GAME_INFO[gameId];
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [roomCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  // Player slots in this room
  const [slots, setSlots] = useState<Array<PlayerSlot | null>>(() => {
    const arr: Array<PlayerSlot | null> = Array(game.maxPlayers).fill(null);
    arr[0] = {
      id: currentUser.id,
      name: currentUser.username,
      isReady: true,
      isHost: true,
      isBot: false,
      avatarConfig: currentUser.avatarConfig,
    };
    return arr;
  });

  const handleCopyCode = () => {
    soundFX.playPop();
    navigator.clipboard?.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Add friend to empty slot
  const handleInviteFriend = (friend: typeof DEMO_FRIENDS[0]) => {
    soundFX.playSuccess();
    const emptyIndex = slots.findIndex(s => s === null);
    if (emptyIndex === -1) return;

    const newSlots = [...slots];
    newSlots[emptyIndex] = {
      id: friend.id,
      name: friend.name,
      isReady: true,
      isHost: false,
      isBot: false,
      avatarConfig: friend.avatarConfig,
    };
    setSlots(newSlots);
    setShowInviteModal(false);
  };

  // Fill remaining empty slots with bots
  const handleFillWithBots = () => {
    soundFX.playPop();
    const botNames = ['Zeki_Bot', 'Usta_Oyuncu', 'Hızlı_Tavşan', 'Gizli_Gölge', 'Şanslı_7'];
    const newSlots = [...slots];
    let botIdx = 0;

    for (let i = 0; i < newSlots.length; i++) {
      if (newSlots[i] === null) {
        newSlots[i] = {
          id: `bot-${i}`,
          name: botNames[botIdx % botNames.length],
          isReady: true,
          isHost: false,
          isBot: true,
          avatarConfig: {
            skinColor: '#FFDCB1',
            hairStyle: 'kpop' as const,
            hairColor: '#3b2219',
            eyeStyle: 'cool' as const,
            mouthStyle: 'smile' as const,
            outfit: 'hoodie' as const,
            outfitColor: '#ec4899',
            accessory: 'none' as const,
            frame: 'none' as const,
          } as any,
        };
        botIdx++;
      }
    }
    setSlots(newSlots);
  };

  // Kick / Remove slot
  const handleRemoveSlot = (index: number) => {
    if (index === 0) return; // Can't kick host
    soundFX.playPop();
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  };

  const handleStart = () => {
    soundFX.playSuccess();
    confetti({ particleCount: 70, spread: 80 });
    onStartGame();
  };

  const filledCount = slots.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#080d1e] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${game.bgGradient} opacity-70 pointer-events-none`} />

      {/* ═══ TOP BAR ═══ */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/30 backdrop-blur-md flex-shrink-0">
        <button
          onClick={() => {
            soundFX.playPop();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black text-white flex items-center justify-center gap-1.5">
            <span>{game.title}</span>
            <span>{game.bannerEmoji}</span>
          </h2>
          <span className="text-[10px] text-cyan-300 font-mono">
            Oda Kodu: #{roomCode}
          </span>
        </div>

        <button
          onClick={() => {
            soundFX.playPop();
            setShowRulesModal(true);
          }}
          className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white"
          title="Oyun Kuralları"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* ═══ OYUN BİLGİ KARTI ═══ */}
      <div className="relative z-10 p-4">
        <div className="p-3.5 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
              {game.bannerEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">{game.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${game.badgeColor}`}>
                  {filledCount}/{game.maxPlayers} Kişi
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5 max-w-[200px] truncate">
                {game.subtitle}
              </p>
            </div>
          </div>

          {/* Oda Kodu Kopyala */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold active:scale-95 transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* ═══ OYUNCU SLOTLARI / KOLTUKLAR ═══ */}
      <div className="relative z-10 flex-1 px-4 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Masa Koltukları ({filledCount}/{game.maxPlayers})
          </span>

          <div className="flex items-center gap-2">
            {/* Botlarla Doldur */}
            <button
              onClick={handleFillWithBots}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold active:scale-95 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Botları Doldur</span>
            </button>

            {/* Arkadaş Çağır */}
            <button
              onClick={() => {
                soundFX.playPop();
                setShowInviteModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold active:scale-95 transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Arkadaş Çağır</span>
            </button>
          </div>
        </div>

        {/* Koltuk Grid */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {slots.map((slot, index) => {
            if (slot) {
              return (
                <div
                  key={index}
                  className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between shadow-md relative"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-cyan-400 flex items-center justify-center shrink-0">
                        <AvatarRenderer config={slot.avatarConfig} className="w-full h-full" />
                      </div>
                      {slot.isHost && (
                        <div className="absolute -top-1.5 -right-1 bg-amber-400 text-amber-950 rounded-full p-0.5 shadow">
                          <Crown className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white truncate max-w-[80px]">
                          {slot.name}
                        </span>
                        {slot.isBot && (
                          <span className="px-1 py-[1px] rounded bg-purple-500/30 text-purple-200 text-[8px] font-black">
                            BOT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Hazır</span>
                      </span>
                    </div>
                  </div>

                  {!slot.isHost && (
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="p-1 rounded-full text-slate-400 hover:text-red-400 transition"
                      title="Çıkar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            }

            // Boş Koltuk
            return (
              <div
                key={index}
                onClick={() => {
                  soundFX.playPop();
                  setShowInviteModal(true);
                }}
                className="p-3 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-400/60 bg-white/5 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition min-h-[72px]"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-300 block">Koltuk {index + 1}</span>
                  <span className="text-[10px] text-cyan-400 font-medium">Davet Et +</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ BOTTOM START ACTION BAR ═══ */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-sm active:scale-95 transition"
          >
            Vazgeç
          </button>

          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Oyunu Başlat ({filledCount}/{game.maxPlayers})</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ARKADAŞ ÇAĞIR MODALI
         ════════════════════════════════════════════════════════════════════ */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12162a] rounded-3xl p-5 w-full max-w-sm border border-slate-700/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-white">Arkadaşları Lobiye Çağır</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {DEMO_FRIENDS.map(f => (
                <div key={f.id} className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
                      <AvatarRenderer config={f.avatarConfig as any} className="w-full h-full" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{f.name}</span>
                      <span className="text-[10px] text-emerald-400">● Çevrim İçi</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInviteFriend(f)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-sm active:scale-95 transition"
                  >
                    Masaya Çağır
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Oda Kodu: #{roomCode}</span>
              <button
                onClick={handleCopyCode}
                className="text-cyan-400 font-bold hover:underline"
              >
                Kodu Paylaş
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          KURALLAR MODALI
         ════════════════════════════════════════════════════════════════════ */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12162a] rounded-3xl p-5 w-full max-w-sm border border-slate-700/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{game.bannerEmoji}</span>
                <h3 className="text-sm font-black text-white">{game.title} Kuralları</h3>
              </div>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {game.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-xs"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
