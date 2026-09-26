import type { User, GameType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import {
  Trophy,
  ClipboardList,
  UserCheck,
  ChevronRight,
  BookOpen,
  Sparkles,
  Gamepad2,
  Users
} from 'lucide-react';

interface GameLobbyProps {
  currentUser: User;
  onLaunchGame: (gameId: GameType) => void;
  onOpenVoiceRoom: () => void;
  onNavigateToTab?: (tab: 'lobby' | 'voice_lobby' | 'moments' | 'messages' | 'profile') => void;
  onOpenFamily?: () => void;
  onOpenCP?: () => void;
  onOpenCheckIn?: () => void;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  currentUser,
  onLaunchGame,
  onOpenVoiceRoom,
  onNavigateToTab,
  onOpenFamily,
  onOpenCP,
  onOpenCheckIn,
  onOpenShop,
  onOpenLeaderboard,
}) => {
  // Canlı online oyuncular
  const onlinePlayers = [
    { name: 'Müboş ELY', gender: '♀', status: 'Uzay Kurtadamı oynuyor', avatar: '👩‍🦰' },
    { name: 'elobello', gender: '♀', subtext: 'Yaşlarınız birbirine yakın', status: 'Sohbet Odası oynuyor', avatar: '👧' },
    { name: 'irose', gender: '♀', subtext: 'Kullanıcı bulunamadı', status: 'Jackaroo oynuyor', avatar: '🧑' },
    { name: 'Ravza', gender: '♀', subtext: '🤍', status: 'Kızma Birader oynuyor', avatar: '👱‍♀️' },
    { name: 'Irmak', gender: '♀', subtext: 'Laçinim 🫶 Ranam', status: 'Çiz & Tahmin Et oynuyor', avatar: '👩' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f6f7fb] text-gray-800 select-none overflow-y-auto no-scrollbar pb-20">
      {/* ═══ 3 ANA YUVARLAK EYLEM BUTONU ═══ */}
      <div className="px-6 py-4 flex items-center justify-around bg-gradient-to-b from-white to-[#f6f7fb]">
        {/* Sıralama */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (onOpenLeaderboard) onOpenLeaderboard();
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
        >
          <div className="relative w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-400 flex items-center justify-center shadow-md">
            <span className="absolute -top-1.5 -left-1 text-sm">👑</span>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl">
              🏆
            </div>
          </div>
          <span className="text-xs font-bold text-gray-700">Sıralama</span>
        </div>

        {/* Görev */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (onOpenCheckIn) onOpenCheckIn();
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 flex items-center justify-center shadow-md text-white">
            <ClipboardList className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-gray-700">Görev</span>
        </div>

        {/* Çevrimiçi Arkadaşlar */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (onNavigateToTab) {
              onNavigateToTab('messages');
            }
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 flex items-center justify-center shadow-md text-white">
            <UserCheck className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-gray-700">Çevrimiçi Arkadaşlar</span>
        </div>
      </div>

      {/* ═══ OYUNLAR BAŞLIĞI & LUVIA BRANDING ═══ */}
      <div className="px-4 pt-1 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-pink-400/20">
            <img src="/luvia-logo.png" alt="Luvia" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none flex items-center gap-1">
              <span>Luvia</span>
              <span className="text-pink-500 text-sm">♥</span>
            </h2>
            <span className="text-[10px] font-extrabold text-pink-500 uppercase tracking-wider block">
              Play. Connect. Vibe.
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('jackaroo');
          }}
          className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
          <span>Masa Oyunu Odası</span>
        </button>
      </div>

      {/* ═══ GÜNÜN ÖNE ÇIKAN OYUNU: UZAY KURTADAMI ═══ */}
      <div className="px-4 mb-3">
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('werewolf');
          }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 p-4 text-white shadow-md border-2 border-amber-300 cursor-pointer active:scale-[0.99] transition"
        >
          <div className="absolute top-0 left-0 bg-amber-400 text-amber-950 font-black text-[9px] px-2.5 py-0.5 rounded-br-xl shadow uppercase tracking-wider">
            ⭐ Çok Oyunculu Popüler
          </div>
          <div className="flex items-center justify-between">
            <div className="pt-2">
              <h3 className="text-lg font-black tracking-tight drop-shadow-sm">Uzay Kurtadamı</h3>
              <p className="text-[11px] text-purple-200 font-medium">Gizli haini bul, uzaya fırlat veya ekibi gizlice avla!</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                <span>🎮 6 Kişilik Masa</span>
                <span>•</span>
                <span>Lobiye Gir ➔</span>
              </div>
            </div>
            <div className="text-4xl filter drop-shadow">
              🐺🚀
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2 SÜTUNLU ALTIN ÇERÇEVELİ BİZİM 6 GERÇEK OYUNUMUZ ═══ */}
      <div className="px-4 grid grid-cols-2 gap-2.5">
        {/* 1. Uzay Kurtadamı */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('werewolf');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-purple-200 uppercase tracking-widest block">6 Oyuncu</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Uzay Kurtadamı</h4>
            <span className="text-[10px] text-purple-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🐺🚀</span>
        </div>

        {/* 2. Jackaroo (2v2) */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('jackaroo');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-amber-100 uppercase tracking-widest block">2v2 Strateji</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Jackaroo</h4>
            <span className="text-[10px] text-amber-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🃏🎲</span>
        </div>

        {/* 3. Kızma Birader / Ludo */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('ludo');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-emerald-100 uppercase tracking-widest block">4 Oyuncu</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Kızma Birader</h4>
            <span className="text-[10px] text-emerald-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🎲🏁</span>
        </div>

        {/* 4. Çiz & Tahmin Et */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('draw_guess');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-pink-100 uppercase tracking-widest block">Kelimeyi Çiz</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Çiz & Tahmin Et</h4>
            <span className="text-[10px] text-pink-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🎨✏️</span>
        </div>

        {/* 5. Casus Kim? / Spy Game */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('spy');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-cyan-100 uppercase tracking-widest block">Ajanı Bul</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Casus Kim?</h4>
            <span className="text-[10px] text-cyan-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🕵️‍♂️🔍</span>
        </div>

        {/* 6. Şarkıyı Yakala / Mic Grab */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('mic_grab');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-indigo-100 uppercase tracking-widest block">Mikrofon Kap</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Şarkıyı Yakala</h4>
            <span className="text-[10px] text-indigo-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🎤🎵</span>
        </div>

        {/* 7. UNO Çılgınlığı */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('uno');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-red-100 uppercase tracking-widest block">Kart Oyunu</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">UNO Çılgınlığı</h4>
            <span className="text-[10px] text-red-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🔥🃏</span>
        </div>

        {/* 8. Bilgi Yarışması / Trivia */}
        <div
          onClick={() => {
            soundFX.playPop();
            onLaunchGame('trivia');
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 p-3 text-white border-2 border-amber-300 shadow-sm cursor-pointer active:scale-95 transition min-h-[95px] flex items-center justify-between"
        >
          <div className="z-10">
            <span className="text-[9px] font-black text-amber-100 uppercase tracking-widest block">Canlı Quiz</span>
            <h4 className="text-sm font-black leading-tight mt-0.5">Bilgi Yarışması</h4>
            <span className="text-[10px] text-amber-100 font-medium mt-1 block">Odaya Katıl ➔</span>
          </div>
          <span className="text-3xl filter drop-shadow">🧠🏆</span>
        </div>
      </div>

      {/* ═══ DİĞER OYUNLAR BUTONU ═══ */}
      <div className="px-4 my-3">
        <div
          onClick={() => {
            soundFX.playPop();
            if (onNavigateToTab) {
              onNavigateToTab('voice_lobby');
            } else {
              onOpenVoiceRoom();
            }
          }}
          className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
              🎙️
            </div>
            <div>
              <span className="text-xs font-black text-gray-800 block">Canlı Sesli Parti Odaları</span>
              <span className="text-[10px] text-gray-400">Oyun arkadaşı bul ve sohbet et</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-600 font-bold">
            <span>Odalara Git</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ═══ KEŞFET ÇEVRİMİÇİ LİSTESİ ═══ */}
      <div className="bg-white mx-4 rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">Keşfet</h3>
          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
            Konum iznini aç, yakındaki arkadaşları bul
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Oyuncu listesi */}
        <div className="space-y-3 pt-1">
          {onlinePlayers.map((player, idx) => (
            <div
              key={idx}
              onClick={() => {
                soundFX.playPop();
                if (onNavigateToTab) {
                  onNavigateToTab('voice_lobby');
                } else {
                  onOpenVoiceRoom();
                }
              }}
              className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-none cursor-pointer active:bg-gray-50 rounded-xl px-1"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-2xl shadow-inner">
                  {player.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-900">{player.name}</span>
                    <span className="text-xs text-pink-500 font-bold">{player.gender}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {player.subtext || 'Yakında çevrim içi'}
                  </p>
                </div>
              </div>

              {/* Status pill with audio bars */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                <span className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 bg-emerald-500 rounded-full animate-eq-1" />
                  <span className="w-0.5 bg-emerald-500 rounded-full animate-eq-2" />
                  <span className="w-0.5 bg-emerald-500 rounded-full animate-eq-3" />
                </span>
                <span>{player.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
