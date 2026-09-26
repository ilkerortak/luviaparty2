import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ArrowLeft, X, Check, Eye, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VisitorBookModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

interface VisitorItem {
  id: string;
  name: string;
  avatar: string;
  gender: 'female' | 'male';
  flag: string;
  country: string;
  bio?: string;
  timeAgo: string;
}

export const VisitorBookModal: React.FC<VisitorBookModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('luvia_visitor_book_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'1month' | '3month' | '3days'>('3month');

  // ═══ ZİYARETÇİLER LİSTESİ (media_1790342350243.jpg) ═══
  const [visitors, setVisitors] = useState<VisitorItem[]>([
    {
      id: 'v-1',
      name: 'MIA 🇮🇹',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gender: 'female',
      flag: '🇹🇷',
      country: 'Türkiye',
      bio: 'Siz sevmeyin diye varım',
      timeAgo: '1 gün önce',
    },
    {
      id: 'v-2',
      name: '¥·LAYLA⁶⁵🌊🇹🇷',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      gender: 'female',
      flag: '🇵🇸',
      country: 'Filistin',
      bio: '☘️ Dost Yüzüğü',
      timeAgo: '1 gün önce',
    },
    {
      id: 'v-3',
      name: 'Baki',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      gender: 'male',
      flag: '🇹🇷',
      country: 'Türkiye',
      bio: '🚬',
      timeAgo: '1 gün önce',
    },
    {
      id: 'v-4',
      name: 'şapo 🥷',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      gender: 'male',
      flag: '🇮🇪',
      country: 'İrlanda',
      timeAgo: '5 gün önce',
    },
    {
      id: 'v-5',
      name: 'SU',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      gender: 'female',
      flag: '🇹🇷',
      country: 'Türkiye',
      bio: '“Dostluk bitti, merak kaldı.”',
      timeAgo: '6 gün önce',
    },
    {
      id: 'v-6',
      name: '🔥 Rumeysa',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      gender: 'female',
      flag: '🇹🇷',
      country: 'Türkiye',
      bio: 'Güzel şeyler, güzel bir kalple başlar.',
      timeAgo: '6 gün önce',
    },
    {
      id: 'v-7',
      name: 'SU',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      gender: 'female',
      flag: '🇹🇷',
      country: 'Türkiye',
      bio: '“Dostluk bitti, merak kaldı.”',
      timeAgo: '8 gün önce',
    },
    {
      id: 'v-8',
      name: 'CAN PROXY',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
      gender: 'male',
      flag: '🇹🇷',
      country: 'Türkiye',
      timeAgo: '12 gün önce',
    },
  ]);

  const handlePurchase = () => {
    const cost = 1600;
    if (currentUser.coins < cost) {
      soundFX.playPop();
      alert(`Yetersiz altın! Gerekli: 1.600 🪙, Bakiyeniz: ${currentUser.coins.toLocaleString('tr-TR')} 🪙`);
      return;
    }

    soundFX.playSuccess();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins - cost,
    });

    try {
      localStorage.setItem('luvia_visitor_book_unlocked', 'true');
    } catch {}

    setIsUnlocked(true);
    setShowPurchaseDialog(false);
  };

  const handleClearAll = () => {
    soundFX.playPop();
    if (window.confirm('Tüm ziyaretçi kayıtlarını temizlemek istediğinize emin misiniz?')) {
      setVisitors([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-gray-900 flex flex-col font-sans select-none overflow-hidden animate-in slide-in-from-right duration-200">
      {/* ════════════════════════════════════════════════════════════════════
          DURUM A: KİLİTLİ GÖRÜNÜM (media_1790342350195.jpg)
         ════════════════════════════════════════════════════════════════════ */}
      {!isUnlocked ? (
        <div className="h-full flex flex-col justify-between bg-gradient-to-b from-[#f5eeff] via-[#f9f5ff] to-[#ffffff]">
          {/* Header */}
          <div className="pt-[max(calc(env(safe-area-inset-top,0px)+8px),12px)] pb-3 px-4 flex items-center justify-between border-b border-purple-100/50">
            <button
              onClick={() => {
                soundFX.playPop();
                onClose();
              }}
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 active:scale-90 transition"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h1 className="text-base font-bold text-gray-800">
              Beni kim ziyaret etti
            </h1>
            <div className="w-6" />
          </div>

          {/* Center Teaser Card */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Merhaba Başlığı */}
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              Merhaba,{currentUser.username}👑
            </h2>

            {/* 3 Örtüşen Ziyaretçi Avatarı */}
            <div className="flex items-center justify-center -space-x-4 mb-8">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="Visitor 1"
                className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md z-10"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
                alt="Visitor 2"
                className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md z-20 scale-105"
              />
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150"
                alt="Visitor 3"
                className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md z-10"
              />
            </div>

            {/* İstatistik Metinleri */}
            <div className="space-y-1.5 text-sm text-gray-600 font-medium">
              <p>
                Toplam <span className="text-cyan-500 font-bold text-base">1619</span> ziyaretçiniz var
              </p>
              <p>
                <span className="text-amber-500 font-bold">3</span> kişi yakın zamanda sizi ziyaret etti
              </p>
              <p>
                Ziyaretçilerin arasında <span className="text-amber-500 font-bold">2 kadın</span> var
              </p>
            </div>
          </div>

          {/* Alt Cyan Buton */}
          <div className="p-6 pb-[max(calc(env(safe-area-inset-bottom,0px)+16px),24px)]">
            <button
              onClick={() => {
                soundFX.playPop();
                setShowPurchaseDialog(true);
              }}
              className="w-full py-3.5 rounded-full bg-[#00cbf0] hover:bg-[#00b8db] text-white font-bold text-sm shadow-lg shadow-cyan-400/30 active:scale-95 transition flex items-center justify-center"
            >
              Ziyaretçi Defteri al, Ziyaretçi Bilgileri'ni aç
            </button>
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════════
            DURUM B: KİLİDİ AÇILMIŞ ZİYARETÇİ LİSTESİ (media_1790342350243.jpg)
           ════════════════════════════════════════════════════════════════════ */
        <div className="h-full flex flex-col bg-white">
          {/* Top Bar */}
          <div className="pt-[max(calc(env(safe-area-inset-top,0px)+8px),12px)] pb-3 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <button
              onClick={() => {
                soundFX.playPop();
                onClose();
              }}
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 active:scale-90 transition"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>

            <h1 className="text-base font-bold text-gray-800">
              Beni kim ziyaret etti
            </h1>

            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
            >
              Hepsini temizle
            </button>
          </div>

          {/* Ziyaretçi İstatistik Şeridi */}
          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center gap-4 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-500">👁️</span>
              <span>Yeni Ziyaretçi <span className="font-bold text-gray-900">0</span></span>
            </div>
            <span>|</span>
            <div>
              Toplam ziyaretçi <span className="font-bold text-gray-900">1619</span>
            </div>
          </div>

          {/* Ziyaretçi Kartları Listesi */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
            {visitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-4xl mb-2">👀</span>
                <p className="text-sm">Henüz ziyaretçi kaydı yok</p>
              </div>
            ) : (
              visitors.map(visitor => (
                <div key={visitor.id} className="px-4 py-3.5 flex items-start justify-between hover:bg-gray-50/60 transition">
                  <div className="flex items-start gap-3">
                    <img
                      src={visitor.avatar}
                      alt={visitor.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 mt-0.5"
                    />
                    <div className="space-y-0.5">
                      {/* İsim */}
                      <div className="text-sm font-bold text-gray-900">
                        {visitor.name}
                      </div>

                      {/* Cinsiyet & Ülke */}
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <span className={visitor.gender === 'female' ? 'text-pink-500 font-bold' : 'text-blue-500 font-bold'}>
                          {visitor.gender === 'female' ? '♀' : '♂'}
                        </span>
                        <span>{visitor.flag}</span>
                        <span>{visitor.country}</span>
                      </div>

                      {/* Bio / İmza */}
                      {visitor.bio && (
                        <p className="text-xs text-gray-500 italic mt-0.5">
                          {visitor.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 font-medium shrink-0 pt-0.5">
                    {visitor.timeAgo}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SATIN ALMA MODALI (media_1790342350200.jpg)
         ════════════════════════════════════════════════════════════════════ */}
      {showPurchaseDialog && (
        <div
          onClick={() => setShowPurchaseDialog(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-left shadow-2xl relative animate-in zoom-in-95 duration-150"
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setShowPurchaseDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sol Üst Tag */}
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
              İşlevler
            </span>

            {/* Defter İllüstrasyonu */}
            <div className="w-24 h-24 mx-auto my-3 rounded-2xl bg-amber-100/70 flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex flex-col p-2 space-y-1.5 border border-amber-200">
                <div className="w-full h-2 rounded-full bg-amber-400/40" />
                <div className="w-3/4 h-2 rounded-full bg-gray-200" />
                <div className="w-full h-2 rounded-full bg-gray-200" />
                <div className="w-1/2 h-2 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Ürün İsmi & Fiyat */}
            <div className="flex items-center justify-between my-2">
              <h3 className="text-base font-bold text-gray-900">
                Ziyaretçi Kayıt Defteri
              </h3>
              <div className="flex items-center gap-1 text-amber-500 font-extrabold font-mono text-base">
                <span>🪙</span>
                <span>1600</span>
              </div>
            </div>

            {/* Süre Seçimi */}
            <p className="text-xs text-gray-500 mb-2">
              Ne kadar süreyle satın alacağınızı seçin
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: '1month', label: '1 Aylık' },
                { id: '3month', label: '3 Aylık' },
                { id: '3days', label: '3 Günlük' },
              ].map(opt => {
                const isSel = selectedDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundFX.playPop();
                      setSelectedDuration(opt.id as any);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition relative border ${
                      isSel
                        ? 'border-[#00cbf0] text-[#00cbf0] bg-cyan-50/50'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSel && (
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#00cbf0] rounded-bl-lg flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ürün Açıklaması */}
            <div className="border-t border-gray-100 pt-3 mb-5">
              <h4 className="text-xs font-bold text-gray-800 mb-1">
                Ürün Açıklaması
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Satın aldıktan sonra, "Kim beni görmüş"e gidebilirsiniz ve en son ziyaretçi kayıtlarını görebilirsiniz.
              </p>
            </div>

            {/* Satın Al Butonu */}
            <button
              onClick={handlePurchase}
              className="w-full py-3 rounded-full bg-[#00cbf0] hover:bg-[#00b8db] text-white font-bold text-sm shadow-md shadow-cyan-400/30 active:scale-95 transition"
            >
              Satın al
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
