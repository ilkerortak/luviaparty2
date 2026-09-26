import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ArrowLeft, HelpCircle, Star, Sparkles, ChevronRight, X, Heart, Shield } from 'lucide-react';
import { AvatarRenderer } from '../avatar/AvatarRenderer';

interface GiftWallModalProps {
  currentUser: User;
  onClose: () => void;
}

interface WallGiftItem {
  id: string;
  name: string;
  count: number;
  stars: number; // 1 to 3
  senderAvatar: string;
  senderName: string;
  icon: string;
  category: string;
  charm: number;
  description: string;
}

interface RecentGiftItem {
  id: string;
  senderName: string;
  senderAvatar: string;
  timestamp: string;
  giftName: string;
  count: number;
  icon: string;
}

export const GiftWallModal: React.FC<GiftWallModalProps> = ({ currentUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'wall' | 'badges' | 'recent'>('wall');
  const [selectedGiftDetail, setSelectedGiftDetail] = useState<WallGiftItem | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // ═══ 1. HEDİYE DUVARI ÖĞELERİ (media_1790342350194.jpg) ═══
  const wallGifts: WallGiftItem[] = [
    {
      id: 'wg-1',
      name: 'Havai Fişek',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      senderName: 'Melisa_06',
      icon: '🎆',
      category: 'Etkinlik',
      charm: 150,
      description: 'Gökyüzünü aydınlatan kutlama havai fişeği.',
    },
    {
      id: 'wg-2',
      name: 'Mor Alev',
      count: 2,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      senderName: 'Baron_TR',
      icon: '🟣',
      category: 'Özel',
      charm: 320,
      description: 'Mistik mor alevler ve büyülü ruh.',
    },
    {
      id: 'wg-3',
      name: 'Ebedi Alev',
      count: 2,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      senderName: 'Canan_K',
      icon: '🔥',
      category: 'VIP',
      charm: 500,
      description: 'Sönmeyen ebedi dostluk ve tutku ateşi.',
    },
    {
      id: 'wg-4',
      name: 'Kirazlı Dondurma',
      count: 7,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
      senderName: 'FARKETMEZ',
      icon: '🍨',
      category: 'Popüler',
      charm: 70,
      description: 'Tatlı kiraz soslu serinletici dondurma kadehi.',
    },
    {
      id: 'wg-5',
      name: 'Çay Fincanı',
      count: 3,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100',
      senderName: 'Berat',
      icon: '☕',
      category: 'Popüler',
      charm: 60,
      description: 'Altın yaldızlı kraliyet çay porseleni.',
    },
    {
      id: 'wg-6',
      name: 'Çıtır Patates',
      count: 2,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
      senderName: 'elobello',
      icon: '🍟',
      category: 'Popüler',
      charm: 40,
      description: 'Sıcak ve çıtır atıştırmalık kutusu.',
    },
    {
      id: 'wg-7',
      name: 'Doğum Günü Pastası',
      count: 2,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
      senderName: 'RIGBY',
      icon: '🎂',
      category: 'Etkinlik',
      charm: 250,
      description: 'Mumları yanan özel kutlama doğum günü pastası.',
    },
    {
      id: 'wg-8',
      name: 'Tuz?',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderName: 'Ege_Gamer',
      icon: '🧂',
      category: 'Eğlenceli',
      charm: 30,
      description: 'Şakacı robot ve tuz serpiştirmece!',
    },
    {
      id: 'wg-9',
      name: 'Wiska Altın Adam',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      senderName: 'Melisa_06',
      icon: '🏆',
      category: 'VIP',
      charm: 600,
      description: 'Saf altından ödül ve zafer heykeli.',
    },
    {
      id: 'wg-10',
      name: 'Tiramisu',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      senderName: 'Canan_K',
      icon: '🍮',
      category: 'Popüler',
      charm: 80,
      description: 'İtalyan usulü enfes kahveli tiramisu.',
    },
    {
      id: 'wg-11',
      name: 'Ayı Kolyesi',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      senderName: 'Baron_TR',
      icon: '🐻',
      category: 'Özel',
      charm: 450,
      description: 'Korumacı altın ayı madalyonu ve kolyesi.',
    },
    {
      id: 'wg-12',
      name: 'Telsiz',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      senderName: 'Ege_Gamer',
      icon: '📻',
      category: 'Eğlenceli',
      charm: 50,
      description: 'Gizli ajanlar için kesintisiz iletişim telsizi.',
    },
    {
      id: 'wg-13',
      name: 'Beyaz Kedi',
      count: 2,
      stars: 2,
      senderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
      senderName: 'elobello',
      icon: '🐱',
      category: 'Özel',
      charm: 380,
      description: 'Zümrüt gözlü sevimli beyaz kedi.',
    },
    {
      id: 'wg-14',
      name: 'Balonlar',
      count: 5,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100',
      senderName: 'Berat',
      icon: '🎈',
      category: 'Popüler',
      charm: 45,
      description: 'Rengarenk uçan festival balonları.',
    },
    {
      id: 'wg-15',
      name: 'Yıldız Asası',
      count: 3,
      stars: 2,
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      senderName: 'Melisa_06',
      icon: '🪄',
      category: 'Özel',
      charm: 750,
      description: 'Dilekleri gerçeğe dönüştüren peri asası.',
    },
    {
      id: 'wg-16',
      name: 'Kokteyl',
      count: 4,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      senderName: 'Canan_K',
      icon: '🍸',
      category: 'Popüler',
      charm: 90,
      description: 'Ferahlatıcı meyve kokteyli kadehi.',
    },
    {
      id: 'wg-17',
      name: 'Altın Gül',
      count: 12,
      stars: 3,
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      senderName: 'Baron_TR',
      icon: '🌹',
      category: 'VIP',
      charm: 1200,
      description: '24K saf altından ebedi dostluk ve sevgi gülü.',
    },
    {
      id: 'wg-18',
      name: 'Gece Parfümü',
      count: 3,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
      senderName: 'FARKETMEZ',
      icon: '✨',
      category: 'Özel',
      charm: 200,
      description: 'Büyülü lavanta esansı ve yıldız tozu iksiri.',
    },
    {
      id: 'wg-19',
      name: 'Piyano Melodileri',
      count: 1,
      stars: 2,
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      senderName: 'Melisa_06',
      icon: '🎹',
      category: 'VIP',
      charm: 600,
      description: 'Gökyüzüne yükselen altın notalar.',
    },
    {
      id: 'wg-20',
      name: 'Lüks Çanta',
      count: 1,
      stars: 1,
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      senderName: 'Canan_K',
      icon: '👜',
      category: 'Lüks',
      charm: 1888,
      description: 'Elmas işlemeli haute couture özel çanta.',
    },
    {
      id: 'wg-21',
      name: 'Çiçek Tanrıçası',
      count: 1,
      stars: 3,
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      senderName: 'Baron_TR',
      icon: '🌸',
      category: 'Mitolojik',
      charm: 7999,
      description: 'Çiçek salıncağında süzülen bahar ve doğa perisi.',
    },
  ];

  // ═══ 2. SON HEDİYELER LİSTESİ (media_1790342350215.jpg) ═══
  const recentGifts: RecentGiftItem[] = [
    {
      id: 'rg-1',
      senderName: 'FARKETMEZ',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      timestamp: '25/09 15:03',
      giftName: 'Gül',
      count: 1,
      icon: '🌹',
    },
    {
      id: 'rg-2',
      senderName: 'FARKETMEZ',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      timestamp: '25/09 15:03',
      giftName: 'Gül',
      count: 1,
      icon: '🌹',
    },
    {
      id: 'rg-3',
      senderName: 'FARKETMEZ',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      timestamp: '25/09 15:03',
      giftName: 'Gül',
      count: 1,
      icon: '🌹',
    },
    {
      id: 'rg-4',
      senderName: 'FARKETMEZ',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      timestamp: '25/09 15:03',
      giftName: 'Hap',
      count: 1,
      icon: '💊',
    },
    {
      id: 'rg-5',
      senderName: 'FARKETMEZ',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      timestamp: '25/09 15:03',
      giftName: 'Hap',
      count: 1,
      icon: '💊',
    },
    {
      id: 'rg-6',
      senderName: 'FARKETMEZ',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      timestamp: '25/09 15:03',
      giftName: 'Gül',
      count: 10,
      icon: '🌹',
    },
    {
      id: 'rg-7',
      senderName: 'Baron_TR',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      timestamp: '25/09 14:12',
      giftName: 'Çiçek Tanrıçası',
      count: 1,
      icon: '🌸',
    },
    {
      id: 'rg-8',
      senderName: 'Melisa_06',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      timestamp: '24/09 21:40',
      giftName: 'Piyano Melodileri',
      count: 1,
      icon: '🎹',
    },
  ];

  // ═══ 3. HEDİYE ROZETLERİ (Kazanılan ve Kilitli Rozetler) ═══
  const charmBadges = [
    {
      level: 1,
      name: 'Yıldız Çırağı',
      req: 3000,
      unlocked: true,
      icon: '⭐',
      desc: '3.000 cazibe puanına ulaşarak ilk rozetini aldın.',
    },
    {
      level: 2,
      name: 'Yıldız Koleksiyoncusu',
      req: 12000,
      unlocked: true,
      current: 7743,
      icon: '🌟',
      desc: '12.000 cazibe puanı ile profilinde parıldayan Seviye 2 rozeti.',
    },
    {
      level: 3,
      name: 'Cazibe Hükümdarı',
      req: 35000,
      unlocked: false,
      icon: '👑',
      desc: '35.000 cazibe ile özel altın profil çerçevesi ve giriş efekti.',
    },
    {
      level: 4,
      name: 'Efsanevi Cazibe',
      req: 80000,
      unlocked: false,
      icon: '💎',
      desc: '80.000 cazibe ile odaya girişte tüm sunucuda duyuru efekti.',
    },
    {
      level: 5,
      name: 'Mitolojik İlah',
      req: 200000,
      unlocked: false,
      icon: '🌸',
      desc: '200.000 cazibe ile 3D taç ve mitolojik rozet.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#090b14] text-white flex flex-col font-sans select-none overflow-hidden animate-in slide-in-from-right duration-200">
      {/* ═══ TOP NAVBAR ═══ */}
      <div className="pt-[max(calc(env(safe-area-inset-top,0px)+8px),12px)] pb-3 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0c0e1a]/95 backdrop-blur-md shrink-0">
        <button
          onClick={() => {
            soundFX.playPop();
            onClose();
          }}
          className="p-1 -ml-1 text-slate-200 hover:text-white active:scale-90 transition"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-extrabold text-white tracking-wide">
          Hediye
        </h1>

        <button
          onClick={() => {
            soundFX.playPop();
            setShowHelpModal(true);
          }}
          className="p-1 -mr-1 text-slate-300 hover:text-white active:scale-90 transition"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar pb-10">
        {/* Kullanıcı Profili ve Hediye Kaydı Butonu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full border-2 border-pink-500/60 overflow-hidden shadow-md bg-stone-800">
              <AvatarRenderer
                config={currentUser.avatarConfig}
                photoUrl={currentUser.customAvatarUrl || currentUser.avatarConfig?.customPhotoUrl}
                size="sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-wide">
                  {currentUser.username}
                </span>
                <span className="text-amber-300 text-xs">👑</span>
              </div>
              <span className="text-[10px] text-slate-400">Cazibe Seviyesi 2</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab('recent');
            }}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-bold text-slate-200 hover:text-white transition active:scale-95 shadow-sm"
          >
            Hediye kaydı
          </button>
        </div>

        {/* ═══ CAZİBE & YILDIZ KARTI (media_1790342350194.jpg) ═══ */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#1c223d]/90 via-[#151930]/90 to-[#0e1224]/90 border border-white/10 p-4 shadow-xl overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-8 sm:gap-12">
              <div>
                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                  <span>64</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 116</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Hediye</div>
              </div>

              <div>
                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                  <span>79</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 281</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Yıldız</div>
              </div>
            </div>

            {/* Sağ Yıldız Rozet Kalkanı (Seviye 2) */}
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-16 rounded-xl bg-gradient-to-b from-[#2a3154] via-[#1c223d] to-[#12162a] border border-amber-400/40 shadow-lg flex flex-col items-center justify-center p-1 relative">
                <Star className="w-6 h-6 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="text-xs font-black text-amber-200 mt-0.5">2</span>
              </div>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1.5 font-mono">
              <span>7743 / 12000</span>
              <span className="text-[11px] text-pink-300 font-normal">%64.5</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 shadow-[0_0_8px_rgba(236,72,153,0.5)]"
                style={{ width: '64.5%' }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-2">
              Yükseltmek için <span className="text-pink-400 font-bold">4257</span> cazibe değeri eksik
            </div>
          </div>
        </div>

        {/* ═══ TABS (Hediye Duvarı, Hediye Rozeti, Son Hediye) ═══ */}
        <div className="flex items-center gap-7 border-b border-white/[0.08] pb-1 pt-1">
          {[
            { id: 'wall', label: 'Hediye Duvarı' },
            { id: 'badges', label: 'Hediye Rozeti' },
            { id: 'recent', label: 'Son Hediye' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playPop();
                  setActiveTab(tab.id as any);
                }}
                className={`relative pb-2 text-sm font-bold transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: HEDİYE DUVARI (4 Sütunlu Kart Izgarası)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'wall' && (
          <div className="grid grid-cols-4 gap-2.5 pt-1 animate-fadeIn">
            {wallGifts.map(gift => (
              <div
                key={gift.id}
                onClick={() => {
                  soundFX.playPop();
                  setSelectedGiftDetail(gift);
                }}
                className="relative rounded-2xl bg-gradient-to-b from-[#181d33] to-[#101426] border border-white/[0.07] hover:border-pink-500/40 p-2 flex flex-col items-center justify-between aspect-[3/4] cursor-pointer group active:scale-95 transition shadow-sm"
              >
                {/* Sağ Üst Gönderen Arkadaş Mini Avartarı */}
                <div className="absolute top-1.5 right-1.5 z-10">
                  <img
                    src={gift.senderAvatar}
                    alt={gift.senderName}
                    className="w-4 h-4 rounded-full border border-white/60 object-cover shadow-sm"
                  />
                </div>

                {/* Hediye İkonu / Çizimi */}
                <div className="w-11 h-11 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform my-auto">
                  {gift.icon}
                </div>

                {/* İsim & Miktar */}
                <div className="w-full text-center mt-1">
                  <div className="text-[10.5px] font-bold text-white truncate px-0.5">
                    {gift.name}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono font-medium">
                    x{gift.count}
                  </div>
                </div>

                {/* 3 Yıldız Göstergesi (⭐☆☆) */}
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      className={`w-2.5 h-2.5 ${
                        s <= gift.stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600 fill-slate-700/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: HEDİYE ROZETİ (Cazibe Kademeleri & Kazanımlar)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'badges' && (
          <div className="space-y-3 pt-1 animate-fadeIn">
            {charmBadges.map(badge => (
              <div
                key={badge.level}
                className={`p-3.5 rounded-2xl border transition ${
                  badge.unlocked
                    ? 'bg-gradient-to-r from-purple-900/30 to-[#14182e] border-purple-500/40'
                    : 'bg-[#12162a]/60 border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-sm">
                      {badge.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{badge.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Sv. {badge.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {badge.unlocked ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        Kazanıldı ✓
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">
                        {badge.req.toLocaleString('tr-TR')} 🪙
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3: SON HEDİYE (media_1790342350215.jpg)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'recent' && (
          <div className="space-y-2.5 pt-1 animate-fadeIn">
            {recentGifts.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#12162a]/80 border border-white/[0.06] hover:bg-[#161a33] transition"
              >
                {/* Sol: Gönderen Avatar + İsim + Tarih */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.senderAvatar}
                    alt={item.senderName}
                    className="w-10 h-10 rounded-full border border-white/20 object-cover shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {item.senderName}
                      </span>
                      <span className="text-amber-300 text-[10px]">👑</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {/* Sağ: Hediye İkonu + İsim ve Adet */}
                <div className="flex items-center gap-2 text-right">
                  <div className="text-right">
                    <span className="text-xs font-bold text-pink-300 block">
                      {item.giftName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      x{item.count}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ DETAY MODALI (Tıklanan Hediye Bilgisi) ═══ */}
      {selectedGiftDetail && (
        <div
          onClick={() => setSelectedGiftDetail(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-gradient-to-b from-[#1b2038] to-[#101426] border border-white/15 rounded-3xl p-5 max-w-xs w-full text-center text-white shadow-2xl relative animate-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => setSelectedGiftDetail(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto my-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl shadow-md">
              {selectedGiftDetail.icon}
            </div>

            <h3 className="text-base font-black text-white mt-2">
              {selectedGiftDetail.name}
            </h3>
            <span className="text-xs text-pink-300 font-bold block mt-0.5">
              {selectedGiftDetail.category} Koleksiyonu
            </span>

            <p className="text-xs text-slate-300 mt-2 italic px-2">
              "{selectedGiftDetail.description}"
            </p>

            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <span className="text-[10px] text-slate-400 block">Koleksiyon</span>
                <span className="text-sm font-black text-white">x{selectedGiftDetail.count} Adet</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <span className="text-[10px] text-slate-400 block">Cazibe Değeri</span>
                <span className="text-sm font-black text-amber-300">+{selectedGiftDetail.charm}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedGiftDetail(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-500/30 active:scale-95 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* ═══ YARDIM MODALI (?) ═══ */}
      {showHelpModal && (
        <div
          onClick={() => setShowHelpModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#15192e] border border-white/15 rounded-3xl p-5 max-w-xs w-full text-white shadow-2xl relative animate-in zoom-in-95 duration-150 text-left space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-black text-white">Hediye & Cazibe Kuralları</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                🌸 <strong className="text-white">Hediye Duvarı:</strong> Sesli odalarda ve etkinliklerde aldığınız tüm hediyeler burada sergilenir.
              </p>
              <p>
                ⭐ <strong className="text-white">Yıldız Seviyeleri:</strong> Aynı hediyeden daha fazla aldıkça o hediyenin yıldız seviyesi yükselir (Maksimum 3 yıldız).
              </p>
              <p>
                👑 <strong className="text-white">Cazibe Değeri:</strong> Her hediye profilinize cazibe puanı katar ve seviye atlamanızı sağlar.
              </p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
