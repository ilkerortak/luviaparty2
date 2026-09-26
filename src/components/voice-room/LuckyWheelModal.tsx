import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { X, HelpCircle, RotateCcw, Undo2, BarChart2, Sparkles, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendRoomChatMessage } from '../../services/onlineService';

interface LuckyWheelModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
  roomId?: string;
}

export interface WheelFood {
  id: string;
  name: string;
  multiplier: number;
  multiplierText: string;
  icon: string;
  type: 'fruit' | 'meat';
  angle: number; // deg (0 at top, clockwise)
  weight: number;
}

export const WHEEL_FOODS: WheelFood[] = [
  { id: 'watermelon', name: 'Karpuz', multiplier: 5, multiplierText: '5 katı kadar yendi', icon: '🍉', type: 'fruit', angle: 0, weight: 20 },
  { id: 'orange', name: 'Portakal', multiplier: 5, multiplierText: '5 katı kadar yendi', icon: '🍊', type: 'fruit', angle: 45, weight: 20 },
  { id: 'apple', name: 'Elma', multiplier: 5, multiplierText: '5 katı kadar yendi', icon: '🍎', type: 'fruit', angle: 90, weight: 20 },
  { id: 'cabbage', name: 'Lahana', multiplier: 5, multiplierText: '5 katı kadar yendi', icon: '🥬', type: 'fruit', angle: 135, weight: 20 },
  { id: 'fish', name: 'Balık', multiplier: 10, multiplierText: '10 katı kadar yendi', icon: '🐟', type: 'meat', angle: 180, weight: 10 },
  { id: 'burger', name: 'Hamburger', multiplier: 15, multiplierText: '15 katı kadar yendi', icon: '🍔', type: 'meat', angle: 225, weight: 6 },
  { id: 'shrimp', name: 'Karides', multiplier: 25, multiplierText: '25 katı kadar yendi', icon: '🦐', type: 'meat', angle: 270, weight: 3 },
  { id: 'chicken', name: 'Tavuk', multiplier: 45, multiplierText: '45 katı kadar yendi', icon: '🍗', type: 'meat', angle: 315, weight: 1 },
];

const CYCLE_DURATION = 20000; // 20 saniyelik sürekli sunucu döngüsü
const BETTING_DURATION = 15000; // 15 saniye bahis süresi, 5 saniye çevirme & çekiliş

// Deterministik ama dinamik tur sonucu hesaplayıcı (tüm odalar ve oyuncular için aynı anda aynı sonuç)
function getRoundWinner(roundNumber: number): WheelFood {
  const seed = (roundNumber * 9301 + 49297) % 233280;
  const rand = seed / 233280; // 0 to 1
  const totalWeight = WHEEL_FOODS.reduce((acc, f) => acc + f.weight, 0);
  let threshold = rand * totalWeight;

  for (const food of WHEEL_FOODS) {
    if (threshold < food.weight) return food;
    threshold -= food.weight;
  }
  return WHEEL_FOODS[0];
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
  roomId,
}) => {
  const [selectedChip, setSelectedChip] = useState<number>(20);
  const [userBets, setUserBets] = useState<Record<string, number>>({});
  const [previousBets, setPreviousBets] = useState<Record<string, number>>({});

  // 20 saniyelik sürekli zaman döngüsü
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const wheelRotationRef = useRef<number>(0);
  const [betHistory, setBetHistory] = useState<Array<{ targetId: string; amount: number }>>([]);
  const [activeWinningFood, setActiveWinningFood] = useState<WheelFood | null>(null);
  const [showWinBanner, setShowWinBanner] = useState<{ amount: number; foodName: string; multiplier: number } | null>(null);

  // Önceki sonuçlar geçmişi (çıkan semboller)
  const [resultsHistory, setResultsHistory] = useState<WheelFood[]>(() => {
    try {
      const saved = localStorage.getItem('luvia_wheel_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Varsayılan önceki sonuçlar
    return [
      WHEEL_FOODS[0], // Karpuz 5x
      WHEEL_FOODS[2], // Elma 5x
      WHEEL_FOODS[4], // Balık 10x
      WHEEL_FOODS[1], // Portakal 5x
      WHEEL_FOODS[7], // Tavuk 45x
      WHEEL_FOODS[5], // Hamburger 15x
    ];
  });

  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showRankModal, setShowRankModal] = useState<boolean>(false);

  const betsRef = useRef(userBets);
  betsRef.current = userBets;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const currentSpinRoundRef = useRef<number>(-1);
  const currentWinningFoodRef = useRef<WheelFood | null>(null);
  const lastProcessedRoundRef = useRef<number>(-1);

  // ═══ 20 SANİYELİK OTOMATİK DÖNGÜ (Oyuncu olmasa bile sürekli döner) ═══
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const currentRound = Math.floor(now / CYCLE_DURATION);
      const elapsed = now % CYCLE_DURATION;

      if (elapsed < BETTING_DURATION) {
        // Bahis Zamanı (15s'den 0s'ye sayar)
        setIsSpinning(false);
        const rem = Math.ceil((BETTING_DURATION - elapsed) / 1000);
        setTimeRemaining(rem);
      } else {
        // Çevirme & Çekiliş Zamanı (Son 5s)
        setIsSpinning(true);
        const spinRem = Math.ceil((CYCLE_DURATION - elapsed) / 1000);
        setTimeRemaining(spinRem);

        // Çevirme animasyonu hesapla (Tamamen Rastgele Seçim - Döngü ve Tekrar Yok)
        if (currentSpinRoundRef.current !== currentRound) {
          currentSpinRoundRef.current = currentRound;
          // 8 sembolden tamamen rastgele biri seçilir
          const randomWinner = WHEEL_FOODS[Math.floor(Math.random() * WHEEL_FOODS.length)];
          currentWinningFoodRef.current = randomWinner;
          setActiveWinningFood(randomWinner);

          // Her halükarda en az 3 tam tur (1080 deg) dönecek şekilde kümülatif açı hesapla
          const targetAngle = (360 - randomWinner.angle) % 360;
          const currentAngle = wheelRotationRef.current % 360;
          let diff = (targetAngle - currentAngle + 360) % 360;
          if (diff < 90) diff += 360; // Hedef çok yakınsa 1 tur daha ekle ki ani duruş olmasın
          const nextRotation = wheelRotationRef.current + 3 * 360 + diff; // Her halükarda en az 3 tam tur (1080 derece) + hedef
          wheelRotationRef.current = nextRotation;
          setWheelRotation(nextRotation);
        }

        // Tur sonuçlanması (sadece bu tur için bir kere tetikle)
        if (lastProcessedRoundRef.current !== currentRound && elapsed > 18500) {
          lastProcessedRoundRef.current = currentRound;
          if (currentWinningFoodRef.current) {
            handleRoundCompletion(currentWinningFoodRef.current);
          }
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleRoundCompletion = (winner: WheelFood) => {
    // 1. Önceki sonuçlara ekle
    setResultsHistory(prev => {
      const updated = [winner, ...prev.slice(0, 15)];
      try {
        localStorage.setItem('luvia_wheel_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Bahis kazancı hesapla
    const activeBets = betsRef.current;
    let totalWin = 0;

    // Doğrudan yemeğe bahis kazancı
    if (activeBets[winner.id]) {
      totalWin += activeBets[winner.id] * winner.multiplier;
    }

    // Et Tabağı Kombosu (Tavuk, Karides, Hamburger, Balık çıkarsa 3x öder)
    if (winner.type === 'meat' && activeBets['meat_platter']) {
      totalWin += activeBets['meat_platter'] * 3;
    }

    // Meyve Salatası Kombosu (Karpuz, Portakal, Elma, Lahana çıkarsa 2x öder)
    if (winner.type === 'fruit' && activeBets['fruit_salad']) {
      totalWin += activeBets['fruit_salad'] * 2;
    }

    if (totalWin > 0) {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setShowWinBanner({
        amount: totalWin,
        foodName: winner.name,
        multiplier: winner.multiplier,
      });

      // Kazanana yazdığı kadar ödeme yap
      const u = currentUserRef.current;
      onUpdateUser({
        ...u,
        coins: u.coins + totalWin,
        exp: u.exp + Math.floor(totalWin / 10),
      });

      if (roomId && totalWin >= 100) {
        sendRoomChatMessage(roomId, {
          sender: 'Büyük Kazanan 🎰',
          text: `🎉 ${u.username}, Büyük Kazanan oyununda ${winner.name} (${winner.multiplier}x) ile +${totalWin.toLocaleString('tr-TR')} Altın kazandı! 🏆`,
          isSystem: true,
        }).catch(() => {});
      }

      setTimeout(() => setShowWinBanner(null), 4500);
    }

    // Bahisleri kaydet ve sıfırla
    setPreviousBets(activeBets);
    setUserBets({});
    setBetHistory([]);
  };

  // Bahis koyma fonksiyonu
  const handlePlaceBet = (targetId: string) => {
    if (isSpinning) {
      soundFX.playPop();
      return;
    }

    // 🔒 Et tabağı seçen sebze tabağı seçemez, sebze tabağı seçen et tabağı seçemez!
    if (targetId === 'fruit_salad' && (userBets['meat_platter'] || 0) > 0) {
      soundFX.playPop();
      alert('⚠️ Et tabağı seçilmişken Sebze tabağı seçemezsiniz!');
      return;
    }
    if (targetId === 'meat_platter' && (userBets['fruit_salad'] || 0) > 0) {
      soundFX.playPop();
      alert('⚠️ Sebze tabağı seçilmişken Et tabağı seçemezsiniz!');
      return;
    }

    if (currentUser.coins < selectedChip) {
      soundFX.playPop();
      alert(`Yetersiz altın! Gerekli: ${selectedChip} 🪙, Bakiyeniz: ${currentUser.coins} 🪙`);
      return;
    }

    soundFX.playPop();

    // Altın düş
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins - selectedChip,
    });

    setUserBets(prev => ({
      ...prev,
      [targetId]: (prev[targetId] || 0) + selectedChip,
    }));
    setBetHistory(prev => [...prev, { targetId, amount: selectedChip }]);
  };

  // ↩️ Reverse / Geri Al Butonu (Yanlış basımlarda bahsi geri alma)
  const handleUndoLastBet = () => {
    if (isSpinning) {
      soundFX.playPop();
      return;
    }
    if (betHistory.length === 0) {
      soundFX.playPop();
      alert('Geri alınacak bir bahis bulunmuyor.');
      return;
    }

    const lastBet = betHistory[betHistory.length - 1];
    const nextHistory = betHistory.slice(0, -1);
    setBetHistory(nextHistory);

    // Altını kullanıcıya anında iade et
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + lastBet.amount,
    });

    // userBets tablosundan düş
    setUserBets(prev => {
      const updated = { ...prev };
      const currentVal = updated[lastBet.targetId] || 0;
      const nextVal = currentVal - lastBet.amount;
      if (nextVal <= 0) {
        delete updated[lastBet.targetId];
      } else {
        updated[lastBet.targetId] = nextVal;
      }
      return updated;
    });

    soundFX.playPop();
  };

  // Tekrar Bahis Yap Butonu (🔄 Tekrar)
  const handleRepeatBets = () => {
    if (isSpinning) return;
    const prevKeys = Object.keys(previousBets);
    if (prevKeys.length === 0) {
      soundFX.playPop();
      alert('Önceki turda oynanmış bir bahis bulunmuyor.');
      return;
    }

    // Çelişen kombo bahsi varsa temizle
    const sanitizedBets = { ...previousBets };
    if (sanitizedBets['meat_platter'] && sanitizedBets['fruit_salad']) {
      delete sanitizedBets['fruit_salad'];
    }

    const totalPrevCost = Object.values(sanitizedBets).reduce((a, b) => a + b, 0);
    if (currentUser.coins < totalPrevCost) {
      soundFX.playPop();
      alert(`Yetersiz altın! Gerekli: ${totalPrevCost} 🪙, Bakiyeniz: ${currentUser.coins} 🪙`);
      return;
    }

    soundFX.playSuccess();
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins - totalPrevCost,
    });

    setUserBets(sanitizedBets);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b1a]/95 backdrop-blur-md flex flex-col justify-between font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ═══ TOP BAR (✕, Bakiye 🪙, Sıralama 📊, Kurallar ?) ═══ */}
      <div className="pt-[max(calc(env(safe-area-inset-top,0px)+8px),10px)] px-4 flex items-center justify-between z-20">
        <button
          onClick={() => {
            soundFX.playPop();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-90"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Bakiye Göstergesi */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-400/40 shadow-sm">
          <span className="text-amber-400 text-sm">🪙</span>
          <span className="text-xs font-black text-amber-300 font-mono">
            {currentUser.coins.toLocaleString('tr-TR')}
          </span>
          <span className="text-amber-400 font-bold text-xs ml-0.5">+</span>
        </div>

        {/* Sağ Butonlar (Sıralama, Kurallar) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playPop();
              setShowRankModal(true);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-90"
            title="Sıralama"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              soundFX.playPop();
              setShowRulesModal(true);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-90"
            title="Kurallar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══ MERKEZİ DÖNME DOLAP (FERRIS WHEEL) ═══ */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-auto">
        {/* Arka Plan Yıldız ve Işık Efekti */}
        <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Dönme Dolap Ayakları (A-Frame Stand) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-56 pointer-events-none opacity-40">
          <div className="absolute inset-0 border-l-[12px] border-r-[12px] border-amber-800/80 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
        </div>

        {/* ÇARK CONTAINER (DÖNEN PARÇA) */}
        <div
          className="relative w-[310px] h-[310px] sm:w-[340px] sm:h-[340px] flex items-center justify-center transition-transform duration-[4000ms] ease-out"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
          }}
        >
          {/* Dış Altın Halka (Golden Rim) */}
          <div className="absolute inset-0 rounded-full border-[6px] border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center pointer-events-none">
            {/* Tekerlek Parmaklıkları (Spokes) */}
            {[0, 45, 90, 135].map(deg => (
              <div
                key={deg}
                className="absolute w-full h-[2px] bg-gradient-to-r from-amber-400/60 via-amber-200/90 to-amber-400/60"
                style={{ transform: `rotate(${deg}deg)` }}
              />
            ))}
          </div>

          {/* 8 ADET GONDOL / YEMEK KAPSÜLÜ */}
          {WHEEL_FOODS.map((food, idx) => {
            const rad = (food.angle - 90) * (Math.PI / 180);
            const radius = 125; // merkezden uzaklık
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            const hasBet = Boolean(userBets[food.id]);
            const isWinnerHighlight = isSpinning && activeWinningFood?.id === food.id;

            return (
              <div
                key={food.id}
                onClick={e => {
                  e.stopPropagation();
                  handlePlaceBet(food.id);
                }}
                className="absolute z-10 cursor-pointer active:scale-95 transition"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${-wheelRotation}deg)`, // Gondola dik kalsın
                }}
              >
                {/* Gondol / Kapsül Kartı (media_1790342900322.jpg) */}
                <div
                  className={`relative w-16 h-14 sm:w-18 sm:h-16 rounded-2xl flex flex-col items-center justify-between p-1 shadow-lg transition-all ${
                    isWinnerHighlight
                      ? 'border-2 border-rose-500 bg-rose-500/30 scale-110 shadow-[0_0_20px_rgba(244,63,94,0.8)]'
                      : hasBet
                      ? 'border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                      : 'border border-amber-300/40 bg-gradient-to-b from-[#3a2210]/95 via-[#23140a]/95 to-[#150a04]/95 hover:border-amber-400/80'
                  }`}
                >
                  {/* Üst Asma Klipsi */}
                  <div className="absolute -top-2 w-3 h-2 rounded-t bg-amber-400 shadow-sm" />

                  {/* 3D Yemek Görseli */}
                  <div className="text-2xl sm:text-3xl my-auto drop-shadow-md">
                    {food.icon}
                  </div>

                  {/* Bahis Çipi / Miktar Rozeti */}
                  {hasBet && (
                    <div className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] shadow-md border border-white font-mono animate-bounce">
                      {userBets[food.id]}
                    </div>
                  )}

                  {/* Alt Katı Kadar Yendi Metni */}
                  <span className="text-[7.5px] sm:text-[8px] font-bold text-amber-200/90 whitespace-nowrap leading-none mt-auto">
                    {food.multiplier} katı kadar
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ SABİT MERKEZ GÖBEĞİ ("Lütfen seç 29s") ═══ */}
        <div className="absolute z-20 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#b45309] border-4 border-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center text-center p-2">
            <span className="text-[10px] sm:text-[11px] font-black text-amber-950 uppercase tracking-tight">
              {isSpinning ? 'Çekiliyor' : 'Lütfen seç'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-950 font-mono tracking-tight leading-none mt-0.5">
              {timeRemaining}s
            </div>
          </div>
        </div>

        {/* ═══ KANAT KOMBO BUTONLARI (Et Tabağı & Sebze Tabağı) ═══ */}
        {/* Sol: Et Tabağı */}
        <div
          onClick={() => handlePlaceBet('meat_platter')}
          className={`absolute bottom-3 left-4 sm:left-10 z-20 flex flex-col items-center transition ${
            (userBets['fruit_salad'] || 0) > 0
              ? 'opacity-40 grayscale cursor-not-allowed'
              : 'cursor-pointer active:scale-95'
          } ${userBets['meat_platter'] ? 'scale-105' : ''}`}
        >
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-orange-500 border-2 border-amber-300/80 p-1 flex items-center justify-center shadow-lg text-2xl">
            🍗
            {userBets['meat_platter'] && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] shadow border border-white font-mono">
                {userBets['meat_platter']}
              </span>
            )}
            {(userBets['fruit_salad'] || 0) > 0 && (
              <span className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-xs">
                🔒
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-amber-200 bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-amber-400/30">
            {(userBets['fruit_salad'] || 0) > 0 ? 'Kilitli 🔒' : 'Et tabağı (3x)'}
          </span>
        </div>

        {/* Sağ: Sebze Tabağı */}
        <div
          onClick={() => handlePlaceBet('fruit_salad')}
          className={`absolute bottom-3 right-4 sm:right-10 z-20 flex flex-col items-center transition ${
            (userBets['meat_platter'] || 0) > 0
              ? 'opacity-40 grayscale cursor-not-allowed'
              : 'cursor-pointer active:scale-95'
          } ${userBets['fruit_salad'] ? 'scale-105' : ''}`}
        >
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 to-green-500 border-2 border-green-300/80 p-1 flex items-center justify-center shadow-lg text-2xl">
            🥗
            {userBets['fruit_salad'] && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] shadow border border-white font-mono">
                {userBets['fruit_salad']}
              </span>
            )}
            {(userBets['meat_platter'] || 0) > 0 && (
              <span className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-xs">
                🔒
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-green-200 bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-green-400/30">
            {(userBets['meat_platter'] || 0) > 0 ? 'Kilitli 🔒' : 'Sebze tabağı (2x)'}
          </span>
        </div>
      </div>

      {/* ═══ KAZANÇ KUTLAMA BANNERI ═══ */}
      {showWinBanner && (
        <div className="fixed top-16 inset-x-4 z-50 max-w-sm mx-auto bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 rounded-2xl p-3 shadow-2xl flex items-center justify-between border-2 border-white animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎉</span>
            <div>
              <h4 className="text-xs font-black uppercase">Tebrikler Kazandın!</h4>
              <p className="text-[11px] font-bold">
                {showWinBanner.foodName} ({showWinBanner.multiplier}x) ile kazandın!
              </p>
            </div>
          </div>
          <div className="font-mono font-black text-lg text-stone-950">
            +{showWinBanner.amount.toLocaleString('tr-TR')} 🪙
          </div>
        </div>
      )}

      {/* ═══ ALT KONTROL & BAHİS ÇİPLERİ PANELİ ═══ */}
      <div className="bg-[#0b1026] border-t border-white/10 p-3 pb-[max(calc(env(safe-area-inset-bottom,0px)+10px),16px)] z-20 space-y-2.5">
        {/* Kılavuz İpucu: Bilet Seç ➔ Yemek Seç */}
        <div className="text-center text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
          <span>Bilet Seç</span>
          <span className="text-amber-400">➔</span>
          <span>Yemek Seç</span>
        </div>

        {/* Bahis Çipleri (20, 100, 1000, 5000, Geri Al, Tekrar) */}
        <div className="grid grid-cols-6 gap-1.5">
          {[20, 100, 1000, 5000].map(chip => {
            const isSelected = selectedChip === chip;
            return (
              <button
                key={chip}
                onClick={() => {
                  soundFX.playPop();
                  setSelectedChip(chip);
                }}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-0.5 font-mono font-black text-xs transition active:scale-95 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 border-white shadow-md shadow-amber-400/40 scale-105'
                    : 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
                }`}
              >
                <span className="text-[10px]">🪙</span>
                <span className="text-[11px]">{chip >= 1000 ? `${chip / 1000}k` : chip}</span>
              </button>
            );
          })}

          {/* ↩️ Geri Al / Reverse Butonu */}
          <button
            onClick={handleUndoLastBet}
            disabled={betHistory.length === 0 || isSpinning}
            className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center active:scale-95 transition ${
              betHistory.length > 0 && !isSpinning
                ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-400/40 text-rose-300 shadow-sm'
                : 'bg-white/5 border-white/5 text-slate-500 opacity-40 cursor-not-allowed'
            }`}
            title="Yanlış basılan bahsi geri al"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="text-[9px] mt-0.5">Geri Al</span>
          </button>

          {/* 🔄 Tekrar Butonu */}
          <button
            onClick={handleRepeatBets}
            className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-bold text-xs flex flex-col items-center justify-center active:scale-95 transition"
            title="Önceki bahsi tekrarla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[9px] mt-0.5">Tekrar</span>
          </button>
        </div>

        {/* ═══ ÖNCEKİ SONUÇLAR (ÇIKAN SEMBOLLER) ═══ */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
              Önceki sonuçlar:
            </span>
          </div>

          {/* Yatay Kayan / Akan Sembol Listesi */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {resultsHistory.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1 shrink-0 text-xs shadow-sm"
              >
                <span>{item.icon}</span>
                <span className="text-[10px] font-black font-mono text-amber-300">
                  {item.multiplier}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ OYUN KURALLARI MODALI ═══ */}
      {showRulesModal && (
        <div
          onClick={() => setShowRulesModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#12162a] border border-amber-400/40 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-black text-amber-300">🎡 Büyük Kazanan Kuralları</h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p>
                ⏱️ <strong>Sürekli Çekiliş:</strong> Oyun her <strong>20 saniyede bir</strong> otomatik olarak çekilir.
              </p>
              <p>
                🎯 <strong>Bilet Seçimi:</strong> 20, 100, 1000 veya 5000 altınlık bilet seçip çark üzerindeki dilediğiniz yemeklere yerleştirin.
              </p>
              <p>
                💰 <strong>Kazanç Oranları:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li>🍉 Karpuz, 🍊 Portakal, 🍎 Elma, 🥬 Lahana: <strong>5 Katı</strong></li>
                <li>🐟 Balık: <strong>10 Katı</strong></li>
                <li>🍔 Hamburger: <strong>15 Katı</strong></li>
                <li>🦐 Karides: <strong>25 Katı</strong></li>
                <li>🍗 Tavuk: <strong>45 Katı</strong></li>
                <li>🍖 Et Tabağı (Et Kombo): <strong>3 Katı</strong></li>
                <li>🥗 Sebze Tabağı (Sebze Kombo): <strong>2 Katı</strong> <em>(Et tabağı ile aynı anda seçilemez)</em></li>
              </ul>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-stone-950 font-black text-xs"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* ═══ SIRALAMA MODALI ═══ */}
      {showRankModal && (
        <div
          onClick={() => setShowRankModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#12162a] border border-amber-400/40 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-black text-amber-300">🏆 Günlük En Çok Kazananlar</h3>
              <button onClick={() => setShowRankModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'Baron_TR', win: '45.000 🪙', food: '🍗 45x' },
                { rank: 2, name: 'Melisa_06', win: '25.000 🪙', food: '🦐 25x' },
                { rank: 3, name: 'FARKETMEZ', win: '15.000 🪙', food: '🍔 15x' },
                { rank: 4, name: 'Canan_K', win: '10.000 🪙', food: '🐟 10x' },
                { rank: 5, name: 'Ege_Gamer', win: '5.000 🪙', food: '🍉 5x' },
              ].map(item => (
                <div key={item.rank} className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400">#{item.rank}</span>
                    <span className="font-bold text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-slate-400">{item.food}</span>
                    <span className="text-amber-300 font-bold">{item.win}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRankModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-stone-950 font-black text-xs"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
