import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Trophy, Shuffle, RefreshCw, Volume2, VolumeX, HelpCircle, Minimize2, Zap, Check } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import type { User } from '../../types';

interface BingoModalProps {
  onClose: () => void;
  onAnnounce: (msg: string) => void;
  onAwardCoins: (coins: number) => void;
  currentUser?: User;
}

// Standard 5x5 Bingo board generator (1-75)
// B: 1-15, I: 16-30, N: 31-45 (center FREE/mascot), G: 46-60, O: 61-75
function generateBingoCard(): number[][] {
  const card: number[][] = [];
  const ranges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
  ];

  for (let c = 0; c < 5; c++) {
    const [min, max] = ranges[c];
    const pool: number[] = [];
    for (let n = min; n <= max; n++) pool.push(n);
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    card.push(pool.slice(0, 5));
  }

  // Transpose to rows: card[row][col]
  const rows: number[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: number[] = [];
    for (let c = 0; c < 5; c++) {
      if (r === 2 && c === 2) {
        row.push(0); // Center free/mascot tile
      } else {
        row.push(card[c][r]);
      }
    }
    rows.push(row);
  }
  return rows;
}

export const BingoModal: React.FC<BingoModalProps> = ({
  onClose,
  onAnnounce,
  onAwardCoins,
  currentUser,
}) => {
  // Mode: 'buy' = Ön seçim / Kart Satın Alma (media_1790339151594.jpg)
  // 'playing' = Canlı Çekiliş ve Kart İşaretleme (media_1790339183395.jpg)
  const [gameMode, setGameMode] = useState<'buy' | 'playing'>('buy');

  // Preview Cards (4 cards)
  const [previewCards, setPreviewCards] = useState<number[][][]>(() => [
    generateBingoCard(),
    generateBingoCard(),
    generateBingoCard(),
    generateBingoCard(),
  ]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);

  // Active playing cards (up to 2 cards shown stacked in playing mode)
  const [activeCards, setActiveCards] = useState<number[][][]>([]);
  const [markedCards, setMarkedCards] = useState<boolean[][][]>([]);

  // Ball caller state
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<{ letter: string; num: number; color: string } | null>(null);
  const [isTurbo, setIsTurbo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [remainingBingos, setRemainingBingos] = useState(55);
  const [bingoCount, setBingoCount] = useState(0);
  const [hasWonFirstPrize, setHasWonFirstPrize] = useState(false);

  // Initial draw interval ref
  const drawTimerRef = useRef<any>(null);

  // Check lines for Bingo (rows, columns, 2 diagonals)
  const checkCardLines = (m: boolean[][]): number => {
    let lines = 0;
    // Rows
    for (let r = 0; r < 5; r++) {
      if (m[r].every(v => v)) lines++;
    }
    // Columns
    for (let c = 0; c < 5; c++) {
      if ([0, 1, 2, 3, 4].every(r => m[r][c])) lines++;
    }
    // Diagonals
    if ([0, 1, 2, 3, 4].every(i => m[i][i])) lines++;
    if ([0, 1, 2, 3, 4].every(i => m[i][4 - i])) lines++;

    return lines;
  };

  const getBallInfo = (num: number) => {
    if (num <= 15) return { letter: 'B', num, color: 'from-rose-500 to-red-600 text-white' };
    if (num <= 30) return { letter: 'I', num, color: 'from-cyan-400 to-blue-500 text-white' };
    if (num <= 45) return { letter: 'N', num, color: 'from-purple-500 to-indigo-600 text-white' };
    if (num <= 60) return { letter: 'G', num, color: 'from-amber-400 to-orange-500 text-white' };
    return { letter: 'O', num, color: 'from-emerald-400 to-green-600 text-white' };
  };

  // Draw next ball
  const drawNextNumber = () => {
    if (drawnNumbers.length >= 75) return;
    const remaining: number[] = [];
    for (let n = 1; n <= 75; n++) {
      if (!drawnNumbers.includes(n)) remaining.push(n);
    }
    if (remaining.length === 0) return;
    const picked = remaining[Math.floor(Math.random() * remaining.length)];
    const ballInfo = getBallInfo(picked);

    if (soundEnabled) soundFX.playPop();
    setCurrentBall(ballInfo);
    setDrawnNumbers(prev => [...prev, picked]);

    // Auto-mark matched cells on active cards
    setMarkedCards(prevMarked => {
      return prevMarked.map((mCard, cIdx) => {
        const board = activeCards[cIdx];
        if (!board) return mCard;
        const newM = mCard.map((row, r) =>
          row.map((cell, c) => {
            if (board[r][c] === picked) return true;
            return cell;
          })
        );
        return newM;
      });
    });
  };

  // Re-roll cards in buy mode (Değiştir 🟡 10)
  const handleRerollCards = () => {
    soundFX.playPop();
    setPreviewCards([
      generateBingoCard(),
      generateBingoCard(),
      generateBingoCard(),
      generateBingoCard(),
    ]);
  };

  // Buy card and start game (Satın al 🟡 20)
  const handleBuyAndStart = () => {
    soundFX.playSuccess();
    // Use the 2 preview cards starting at selectedCardIdx
    const card1 = previewCards[selectedCardIdx];
    const card2 = previewCards[(selectedCardIdx + 1) % previewCards.length];
    const chosenCards = [card1, card2];
    setActiveCards(chosenCards);

    // Initial markings (center free is marked)
    const m1 = Array(5).fill(null).map(() => Array(5).fill(false));
    m1[2][2] = true;
    const m2 = Array(5).fill(null).map(() => Array(5).fill(false));
    m2[2][2] = true;
    setMarkedCards([m1, m2]);

    setDrawnNumbers([]);
    setCurrentBall(null);
    setBingoCount(0);
    setHasWonFirstPrize(false);
    setGameMode('playing');

    onAnnounce('🔔 Sistem: Bingo oyunu başladı! Bol şanslar!');
  };

  // Auto-draw loop in playing mode
  useEffect(() => {
    if (gameMode !== 'playing') return;
    const intervalTime = isTurbo ? 1800 : 3000;
    drawTimerRef.current = setInterval(() => {
      drawNextNumber();
    }, intervalTime);

    return () => {
      if (drawTimerRef.current) clearInterval(drawTimerRef.current);
    };
  }, [gameMode, isTurbo, drawnNumbers]);

  // Check for BINGO when markedCards updates
  useEffect(() => {
    if (gameMode !== 'playing' || markedCards.length === 0) return;

    let totalCompleted = 0;
    markedCards.forEach(m => {
      totalCompleted += checkCardLines(m);
    });

    if (totalCompleted > bingoCount) {
      setBingoCount(totalCompleted);
      soundFX.playGiftFanfare();
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#ff4d4d', '#ffcc00', '#00e5ff', '#b347ff'],
      });

      if (!hasWonFirstPrize && totalCompleted >= 1) {
        setHasWonFirstPrize(true);
        const reward = 2700;
        onAwardCoins(reward);
        onAnnounce(`👑 BİNGO! ${currentUser?.username || 'Oyuncu'} 1. olarak ${reward.toLocaleString('tr-TR')} Altın ödül kazandı! 🏆🎉`);
        setRemainingBingos(prev => Math.max(0, prev - 1));
      } else {
        const bonusReward = 350;
        onAwardCoins(bonusReward);
        onAnnounce(`🎱 BİNGO! ${currentUser?.username || 'Oyuncu'} yeni bir sıra tamamlayarak +${bonusReward} Altın kazandı! ✨`);
        setRemainingBingos(prev => Math.max(0, prev - 1));
      }
    }
  }, [markedCards, gameMode, bingoCount, hasWonFirstPrize]);

  // Mock participants matching media_1790339151594.jpg
  const mockParticipants = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-200">
      {/* ═══ SCREEN A: KART SEÇİMİ & SATIN ALMA (media_1790339151594.jpg) ═══ */}
      {gameMode === 'buy' ? (
        <div className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#2b186b] via-[#210d54] to-[#120536] border-2 border-[#6d3ee8]/60 shadow-[0_12px_45px_rgba(79,28,179,0.5)] p-4 text-white flex flex-col items-center overflow-hidden">
          {/* Top Bar: Lv 3 Badge & Icons */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3d1a87]/90 border border-[#7f4efc]/50 shadow-md">
              <span className="text-sm">🎁</span>
              <span className="text-xs font-black text-white">Lv 3</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-rose-300" />}
              </button>
              <button
                onClick={() => alert('BİNGO KURALLARI:\n\n1. Her kart 5x5 kareden oluşur.\n2. Çekilen numaralar kartınızla eşleştiğinde 🧩 parçası yerleşir.\n3. Yatay, dikey veya çapraz 5 kareyi tamamlayan ilk oyuncu 1.lik ödülü olan 2.7K altın kazanır!')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                title="Nasıl Oynanır?"
              >
                <HelpCircle className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                title="Kapat"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* B - I - N - G - O 3D Glowing Spheres Header */}
          <div className="flex items-center justify-center gap-2 mt-4 mb-2">
            {[
              { l: 'B', bg: 'from-rose-500 via-red-500 to-rose-700', shadow: 'rgba(239,68,68,0.6)' },
              { l: 'I', bg: 'from-cyan-400 via-sky-500 to-blue-600', shadow: 'rgba(14,165,233,0.6)' },
              { l: 'N', bg: 'from-purple-400 via-indigo-500 to-purple-800', shadow: 'rgba(168,85,247,0.6)' },
              { l: 'G', bg: 'from-amber-300 via-yellow-500 to-amber-600', shadow: 'rgba(245,158,11,0.6)' },
              { l: 'O', bg: 'from-emerald-400 via-green-500 to-teal-700', shadow: 'rgba(16,185,129,0.6)' },
            ].map(ball => (
              <div
                key={ball.l}
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${ball.bg} flex items-center justify-center font-black text-xl text-white shadow-lg border border-white/50 relative overflow-hidden transform hover:scale-105 transition`}
                style={{ boxShadow: `0 4px 15px ${ball.shadow}` }}
              >
                <div className="absolute top-1 left-2 w-3.5 h-2 bg-white/60 rounded-full blur-[1px] transform -rotate-25 pointer-events-none" />
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{ball.l}</span>
              </div>
            ))}
          </div>

          {/* Participant Avatars & Count Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/10 my-1">
            <div className="flex -space-x-2">
              {mockParticipants.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Oyuncu"
                  className="w-6 h-6 rounded-full border border-purple-400 object-cover"
                />
              ))}
            </div>
            <span className="text-xs font-black text-purple-200">23</span>
          </div>

          {/* Subtitle / Disclaimer */}
          <p className="text-[10px] text-purple-200/80 text-center mt-1 leading-snug px-3">
            Sadece eğlence amaçlıdır, nakit veya başka maddi kazanç sağlanamaz.
          </p>
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mt-0.5">
            <span>🟡</span>
            <span>20 / kart</span>
          </div>

          {/* 4 Preview Bingo Cards (Scrollable or Grid) */}
          <div className="grid grid-cols-4 gap-1.5 w-full my-3 px-1">
            {previewCards.map((card, cIdx) => {
              const isSelected = selectedCardIdx === cIdx;
              return (
                <div
                  key={cIdx}
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedCardIdx(cIdx);
                  }}
                  className={`relative p-1 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-900/90 border-2 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105'
                      : 'bg-indigo-950/60 border border-white/10 hover:border-purple-400/50'
                  }`}
                >
                  {/* B I N G O Header Row */}
                  <div className="grid grid-cols-5 text-[7px] font-black text-center text-purple-300 mb-0.5">
                    <span>B</span>
                    <span>I</span>
                    <span>N</span>
                    <span>G</span>
                    <span>O</span>
                  </div>

                  {/* 5x5 Mini Numbers */}
                  <div className="grid grid-cols-5 gap-0.5 text-[6px] font-mono text-center text-slate-300">
                    {card.map((row, r) =>
                      row.map((num, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`h-2.5 flex items-center justify-center rounded-sm ${
                            r === 2 && c === 2
                              ? 'bg-amber-400 text-stone-900 font-bold'
                              : 'bg-white/5'
                          }`}
                        >
                          {r === 2 && c === 2 ? '★' : num}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Selected Purple Checkmark Pill at bottom */}
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-600 border border-amber-300 flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons: Değiştir 🟡 10 & Satın al 🟡 20 */}
          <div className="w-full space-y-2 mt-2">
            <button
              onClick={handleRerollCards}
              className="w-full py-2 rounded-2xl bg-[#4b229f]/90 hover:bg-[#5b2cbd] border border-[#834aff]/60 text-white font-black text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>Değiştir</span>
              <span>🟡 10</span>
            </button>

            <button
              onClick={handleBuyAndStart}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-stone-950 font-black text-sm shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>Satın al</span>
              <span>🟡 20</span>
            </button>
          </div>
        </div>
      ) : (
        /* ═══ SCREEN B: CANLI ÇEKİLİŞ & KART OYUNU (media_1790339183395.jpg) ═══ */
        <div className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#241359] via-[#1a0a40] to-[#0d0324] border-2 border-[#6833e8]/70 shadow-[0_12px_50px_rgba(79,28,179,0.6)] p-3.5 text-white flex flex-col items-center overflow-hidden">
          {/* Header: Lv 3, User Dropdown, Controls */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3d1a87] border border-[#7f4efc]/50 text-xs font-black">
                <span>🎁</span>
                <span>Lv 3</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5" />
              </div>

              {/* User Dropdown Pill */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-slate-200">
                <span className="text-xs">🛸</span>
                <span className="truncate max-w-[65px]">{currentUser?.username || 'Gü...'}</span>
                <span className="text-[9px] text-slate-400">▾</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-rose-300" />}
              </button>
              <button
                onClick={() => alert('BİNGO: Çekilen toplar kartınızdaki numaralarla eşleştikçe 🧩 parçaları dolar. Sırayı ilk tamamlayan ödülü kapar!')}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <Minimize2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Top Active Caller & Lightning Boost */}
          <div className="w-full flex items-center justify-between my-2.5 px-2">
            {/* Drawn Ball */}
            <div className="flex items-center gap-2">
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border-2 border-white shadow-[0_0_20px_rgba(6,182,212,0.7)] flex flex-col items-center justify-center animate-bounce">
                <div className="absolute top-1 left-2 w-4 h-2 bg-white/60 rounded-full blur-[1px] transform -rotate-25" />
                <span className="text-[11px] font-black text-cyan-100 leading-tight">
                  {currentBall?.letter || 'B'}
                </span>
                <span className="text-xl font-black text-white leading-none">
                  {currentBall?.num ?? '—'}
                </span>
              </div>
              <div className="text-[11px] text-purple-200">
                <span className="font-bold block">Çekilen Top</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {drawnNumbers.length}/75
                </span>
              </div>
            </div>

            {/* Lightning Turbo Button */}
            <button
              onClick={() => {
                soundFX.playPop();
                setIsTurbo(!isTurbo);
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-lg transition active:scale-90 ${
                isTurbo
                  ? 'bg-amber-400 border-white text-stone-950 shadow-amber-400/50 animate-pulse'
                  : 'bg-white/10 border-white/20 text-purple-300 hover:text-white'
              }`}
              title={isTurbo ? 'Hızlı Mod Açık (1.8s)' : 'Normal Hız (3.0s)'}
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>

          {/* Main Board Layout: Left Awards Sidebar & Right/Center Stacked Cards */}
          <div className="w-full flex gap-2">
            {/* Left Awards Sidebar */}
            <div className="w-20 flex flex-col justify-between shrink-0 space-y-2">
              {/* 1st Place Card */}
              <div className="p-2 rounded-2xl bg-[#39187e]/80 border border-amber-400/50 flex flex-col items-center text-center shadow-md">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-900 flex items-center justify-center font-black text-xs shadow">
                  👑 1
                </div>
                <span className="text-[9px] text-slate-300 font-bold mt-1">Ödül</span>
                <div className="flex items-center gap-0.5 text-xs font-black text-amber-300 mt-0.5">
                  <span>🅱️</span>
                  <span>2.7K</span>
                </div>
              </div>

              {/* 2 - 55 Place Card */}
              <div className="p-2 rounded-2xl bg-[#280e5b]/80 border border-white/10 flex flex-col items-center text-center shadow">
                <span className="text-[9px] text-purple-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded-full">
                  🛡️ 2 - 55
                </span>
                <div className="flex items-center gap-0.5 text-[11px] font-black text-cyan-300 mt-1">
                  <span>🅱️</span>
                  <span>33.4K</span>
                </div>
              </div>

              {/* Bingo Count Indicator */}
              <div className="p-1.5 rounded-xl bg-black/40 border border-white/10 text-center">
                <span className="text-[8px] text-slate-400 block font-bold">Tamamlanan</span>
                <span className="text-xs font-black text-emerald-400">{bingoCount} Sıra</span>
              </div>
            </div>

            {/* Right/Center: Stacked 5x5 Bingo Cards */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Remaining Bingos Tag */}
              <div className="flex items-center justify-end px-1">
                <span className="text-[10px] text-purple-200 font-bold">
                  Kalan Bingo sayısı <span className="text-amber-300 font-black">{remainingBingos}</span>
                </span>
              </div>

              {/* Render up to 2 active cards */}
              {activeCards.map((card, cIdx) => (
                <div
                  key={cIdx}
                  className="rounded-2xl bg-[#1c0d45]/90 border border-[#6b3ee8]/50 p-1.5 shadow-inner"
                >
                  {/* B I N G O Header Row */}
                  <div className="grid grid-cols-5 text-[10px] font-black text-center mb-1">
                    <span className="text-rose-400">B</span>
                    <span className="text-cyan-400">I</span>
                    <span className="text-purple-300">N</span>
                    <span className="text-amber-400">G</span>
                    <span className="text-emerald-400">O</span>
                  </div>

                  {/* 5x5 Cells with Puzzle Stamp 🧩 on Marked Cells */}
                  <div className="grid grid-cols-5 gap-1 text-center font-bold text-xs">
                    {card.map((row, r) =>
                      row.map((val, c) => {
                        const isCenter = r === 2 && c === 2;
                        const isMarked = markedCards[cIdx]?.[r]?.[c];

                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`h-7 rounded-lg flex items-center justify-center transition relative ${
                              isCenter
                                ? 'bg-amber-400/20 border border-amber-400/60 text-amber-300 text-sm'
                                : isMarked
                                ? 'bg-[#1e3a8a] border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                : 'bg-[#291361]/80 text-slate-300 border border-white/5'
                            }`}
                          >
                            {isCenter ? (
                              <span className="text-base select-none">🐶</span>
                            ) : isMarked ? (
                              <span className="text-base select-none animate-in zoom-in-50 duration-150">
                                🧩
                              </span>
                            ) : (
                              val
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Manual Trigger or Finish */}
          <div className="w-full flex items-center justify-between gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={drawNextNumber}
              className="flex-1 py-2 rounded-xl bg-purple-700/80 hover:bg-purple-600 text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Hemen Top Çek</span>
            </button>
            <button
              onClick={() => {
                soundFX.playPop();
                setGameMode('buy');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95"
            >
              Yeni Kart Al
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
