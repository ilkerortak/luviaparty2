import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ChevronLeft, Coins, Sparkles, Check, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

interface GoldPackage {
  id: string;
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  priceText: string;
  badge: string;
  hasFreeLiveTag?: boolean;
}

const GOLD_PACKAGES: GoldPackage[] = [
  {
    id: 'pack_600',
    baseAmount: 600,
    bonusAmount: 120,
    totalAmount: 720,
    priceText: '₺49.99',
    badge: '120 Ekstra Altın',
  },
  {
    id: 'pack_1800',
    baseAmount: 1800,
    bonusAmount: 360,
    totalAmount: 2160,
    priceText: '₺149.99',
    badge: '360 Ekstra Altın',
  },
  {
    id: 'pack_3000',
    baseAmount: 3000,
    bonusAmount: 600,
    totalAmount: 3600,
    priceText: '₺249.99',
    badge: '600 Ekstra Altın',
  },
  {
    id: 'pack_10000',
    baseAmount: 10000,
    bonusAmount: 2000,
    totalAmount: 12000,
    priceText: '₺699.99',
    badge: '2000 Ekstra Altın',
  },
  {
    id: 'pack_50000',
    baseAmount: 50000,
    bonusAmount: 10000,
    totalAmount: 60000,
    priceText: '₺3099.99',
    badge: '10000 Ekstra Altın',
    hasFreeLiveTag: true,
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleBuy = (pack: GoldPackage) => {
    soundFX.playPop();
    setPurchasingId(pack.id);

    // Simulate instant secure purchase
    setTimeout(() => {
      soundFX.playGiftFanfare();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#ffd700'],
      });

      onUpdateUser({
        ...currentUser,
        coins: currentUser.coins + pack.totalAmount,
      });

      setPurchasingId(null);
      setSuccessMessage(`Tebrikler! ${pack.totalAmount.toLocaleString('tr-TR')} Altın Para hesabınıza yüklendi.`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 select-none">
      <div className="bg-white text-gray-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md h-[95vh] sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
        
        {/* ═══ TOP BAR (media_1790211368820) ═══ */}
        <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 active:scale-90 transition"
            title="Geri"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
            Altın Para Mağazası
          </h2>

          <div className="w-6" /> {/* Spacer for centered title */}
        </div>

        {/* ═══ SCROLLABLE CONTENT ═══ */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          
          {/* Hesap Bakiyesi Şeridi */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-bold text-gray-800">
              Hesap Bakiyesi:
            </span>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-xs">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-amber-900 font-black text-xs shadow-xs">
                🪙
              </div>
              <span className="text-sm font-black text-gray-900 tabular-nums">
                {currentUser.coins.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in zoom-in-95">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ═══ 3-COLUMN PACKAGES GRID (media_1790211368820) ═══ */}
          <div className="grid grid-cols-3 gap-2.5">
            {GOLD_PACKAGES.map((pack) => (
              <div
                key={pack.id}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#ff6b6b] via-[#ff5252] to-[#ff416c] text-white p-2.5 flex flex-col items-center justify-between shadow-md border border-red-400/40 min-h-[175px] transition-transform active:scale-[0.98]"
              >
                {/* Top Badge: e.g. "120 Ekstra Altın" */}
                <div className="w-full text-center">
                  <span className="inline-block bg-[#fffae6] text-[#b45309] text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs max-w-full truncate border border-amber-200">
                    {pack.badge}
                  </span>
                </div>

                {/* Center Coin / Chest Icon */}
                <div className="my-auto py-1 flex flex-col items-center justify-center relative">
                  {pack.hasFreeLiveTag ? (
                    <div className="relative flex flex-col items-center">
                      <span className="absolute -top-1 -left-1 text-[8px] bg-white text-purple-700 font-extrabold px-1.5 py-0.2 rounded border border-purple-200 shadow-xs z-10 whitespace-nowrap">
                        Ücretsiz yayın
                      </span>
                      <span className="text-4xl filter drop-shadow mt-1">
                        🎁
                      </span>
                    </div>
                  ) : pack.baseAmount >= 10000 ? (
                    <div className="relative flex items-center justify-center">
                      <span className="text-4xl filter drop-shadow">
                        💰
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <span className="text-3xl filter drop-shadow">
                        🪙
                      </span>
                      <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
                    </div>
                  )}

                  {/* Gold Amount Label: "600 Altın" */}
                  <span className="text-xs font-black text-white mt-1 tracking-tight drop-shadow-sm">
                    {pack.baseAmount.toLocaleString('tr-TR')} Altın
                  </span>
                </div>

                {/* Price Button: e.g. "₺49.99" */}
                <button
                  onClick={() => handleBuy(pack)}
                  disabled={purchasingId === pack.id}
                  className="w-full py-1.5 rounded-full bg-white text-[#e11d48] font-black text-xs shadow-md hover:bg-rose-50 active:scale-95 transition flex items-center justify-center gap-1"
                >
                  {purchasingId === pack.id ? (
                    <span className="text-[10px] text-gray-500 animate-pulse">Yükleniyor...</span>
                  ) : (
                    <span>{pack.priceText}</span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* ═══ FOOTER NOTICE (Birebir Screenshot Metni) ═══ */}
          <div className="pt-2 pb-6 space-y-2 text-[11px] leading-relaxed text-gray-400 font-normal">
            <p>
              1. Altın paraların hemen gelmemesi gibi yükleme sorunlarıyla karşılaşırsanız lütfen müşteri hizmetleriyle iletişime geçin.
            </p>
            <p>
              2. Özel olarak altın satın almak veya resmi olmayan kanallardan yükleme mülkiyet kaybına neden olabilir, ihlal durumunda hesabınız yasaklanır.
            </p>
            <p>
              3. Eğer 18 yaşın altındaysanız, satın alma işlemi yapmadan önce lütfen yasal vasinizin (örneğin anne veya babanızın) onayını alın. Lütfen onların rehberliğinde sorumlu şekilde harcama yapın ve aşırı harcamadan kaçının.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopModal;
