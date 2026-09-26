import React, { useState, useEffect, useRef } from 'react';
import type { User, AvatarConfig } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ArrowLeft, Dices, Trophy, Crown, Sparkles, Volume2, VolumeX, Mic, MicOff, MessageSquare, Smile, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateLeaderboard } from '../../services/leaderboardService';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface LudoGameProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

interface Token {
  id: string;
  player: PlayerColor;
  relativePos: number; // -1: base, 0-50: track, 51-55: home lane, 56: finished
}

const START_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

const PLAYER_INFO: Record<PlayerColor, { name: string; plateColor: string; textColor: string }> = {
  red: {
    name: 'FARKETMEZ',
    plateColor: 'from-[#c23354] via-[#e11d48] to-[#9f1239]',
    textColor: 'text-rose-400',
  },
  green: {
    name: 'Elif Şahin',
    plateColor: 'from-[#059669] via-[#10b981] to-[#047857]',
    textColor: 'text-emerald-400',
  },
  yellow: {
    name: 'Zeki Aydın',
    plateColor: 'from-[#d97706] via-[#f59e0b] to-[#b45309]',
    textColor: 'text-amber-400',
  },
  blue: {
    name: 'Fatma Öztürk',
    plateColor: 'from-[#0284c7] via-[#0ea5e9] to-[#0369a1]',
    textColor: 'text-sky-400',
  }
};

// Start coordinates relative to board center (for the 3-somersault rolling dice)
const PLAYER_DICE_ORIGINS: Record<PlayerColor, { x: number; y: number }> = {
  red: { x: -110, y: 150 },    // Bottom-Left (User)
  blue: { x: 110, y: 150 },     // Bottom-Right
  green: { x: -110, y: -150 },  // Top-Left
  yellow: { x: 110, y: -150 },  // Top-Right
};

// 15x15 Ludo Track Coordinates
const BOARD_COORDS: Record<number, { x: number; y: number }> = {
  0: { x: 1, y: 6 }, 1: { x: 2, y: 6 }, 2: { x: 3, y: 6 }, 3: { x: 4, y: 6 }, 4: { x: 5, y: 6 },
  5: { x: 6, y: 5 }, 6: { x: 6, y: 4 }, 7: { x: 6, y: 3 }, 8: { x: 6, y: 2 }, 9: { x: 6, y: 1 }, 10: { x: 6, y: 0 },
  11: { x: 7, y: 0 }, 12: { x: 8, y: 0 },
  13: { x: 8, y: 1 }, 14: { x: 8, y: 2 }, 15: { x: 8, y: 3 }, 16: { x: 8, y: 4 }, 17: { x: 8, y: 5 },
  18: { x: 9, y: 6 }, 19: { x: 10, y: 6 }, 20: { x: 11, y: 6 }, 21: { x: 12, y: 6 }, 22: { x: 13, y: 6 }, 23: { x: 14, y: 6 },
  24: { x: 14, y: 7 }, 25: { x: 14, y: 8 },
  26: { x: 13, y: 8 }, 27: { x: 12, y: 8 }, 28: { x: 11, y: 8 }, 29: { x: 10, y: 8 }, 30: { x: 9, y: 8 },
  31: { x: 8, y: 9 }, 32: { x: 8, y: 10 }, 33: { x: 8, y: 11 }, 34: { x: 8, y: 12 }, 35: { x: 8, y: 13 }, 36: { x: 8, y: 14 },
  37: { x: 7, y: 14 }, 38: { x: 6, y: 14 },
  39: { x: 6, y: 13 }, 40: { x: 6, y: 12 }, 41: { x: 6, y: 11 }, 42: { x: 6, y: 10 }, 43: { x: 6, y: 9 },
  44: { x: 5, y: 8 }, 45: { x: 4, y: 8 }, 46: { x: 3, y: 8 }, 47: { x: 2, y: 8 }, 48: { x: 1, y: 8 }, 49: { x: 0, y: 8 },
  50: { x: 0, y: 7 }, 51: { x: 0, y: 6 }
};

const HOME_COORDS: Record<PlayerColor, Record<number, { x: number; y: number }>> = {
  red: { 51: { x: 1, y: 7 }, 52: { x: 2, y: 7 }, 53: { x: 3, y: 7 }, 54: { x: 4, y: 7 }, 55: { x: 5, y: 7 } },
  green: { 51: { x: 7, y: 1 }, 52: { x: 7, y: 2 }, 53: { x: 7, y: 3 }, 54: { x: 7, y: 4 }, 55: { x: 7, y: 5 } },
  yellow: { 51: { x: 13, y: 7 }, 52: { x: 12, y: 7 }, 53: { x: 11, y: 7 }, 54: { x: 10, y: 7 }, 55: { x: 9, y: 7 } },
  blue: { 51: { x: 7, y: 13 }, 52: { x: 7, y: 12 }, 53: { x: 7, y: 11 }, 54: { x: 7, y: 10 }, 55: { x: 7, y: 9 } },
};

const BASE_COORDS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [{ x: 1.8, y: 10.2 }, { x: 3.8, y: 10.2 }, { x: 1.8, y: 12.2 }, { x: 3.8, y: 12.2 }],
  green: [{ x: 1.8, y: 1.8 }, { x: 3.8, y: 1.8 }, { x: 1.8, y: 3.8 }, { x: 3.8, y: 3.8 }],
  yellow: [{ x: 10.2, y: 1.8 }, { x: 12.2, y: 1.8 }, { x: 10.2, y: 3.8 }, { x: 12.2, y: 3.8 }],
  blue: [{ x: 10.2, y: 10.2 }, { x: 12.2, y: 10.2 }, { x: 10.2, y: 12.2 }, { x: 12.2, y: 12.2 }]
};

const initialTokens: Token[] = [];
(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).forEach((color) => {
  for (let i = 0; i < 4; i++) {
    initialTokens.push({ id: `${color}-${i}`, player: color, relativePos: -1 });
  }
});

// Cute Emoji Stickers matching media_1790344676622.jpg
const LUDO_STICKERS = [
  { id: '1', name: 'Dil Çıkarma', icon: '😛' },
  { id: '2', name: 'Büyük Ağlama', icon: '😭' },
  { id: '3', name: 'Öpücük', icon: '😘' },
  { id: '4', name: 'Sinirli', icon: '😡' },
  { id: '5', name: 'Teşekkür', icon: '🙏' },
  { id: '6', name: 'Sevgi Oku', icon: '🏹' },
  { id: '7', name: 'El Salla', icon: '👋' },
  { id: '8', name: 'Şok Olma', icon: '😱' },
  { id: '9', name: 'Kafası Karışık', icon: '🤔' },
  { id: '10', name: 'Alay Etmek', icon: '😜' },
  { id: '11', name: 'Tezahürat', icon: '🎉' },
  { id: '12', name: 'DJ', icon: '🎧' },
];

export const LudoGame: React.FC<LudoGameProps> = ({ currentUser, onUpdateUser, onExitGame, roomId }) => {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>('red');
  const [diceValue, setDiceValue] = useState<number>(4);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [turnTimer, setTurnTimer] = useState<number>(15);

  // 3 Takla Yuvarlanan Zar Animasyonu Durumları
  const [rollingPlayer, setRollingPlayer] = useState<PlayerColor>('red');
  const [diceRollProgress, setDiceRollProgress] = useState<number>(1); // 0: start at player, 1: center

  // Ses & Sohbet & Sticker Kontrolleri
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const [activeFloatingEmoji, setActiveFloatingEmoji] = useState<{ icon: string; x: number; y: number } | null>(null);

  // Oyuncuların son attığı zarlar
  const [playerLastRolls, setPlayerLastRolls] = useState<Partial<Record<PlayerColor, number>>>({
    red: 4,
    green: 1,
  });

  const { isMultiplayer, players: rtdbPlayers, isHost: isRoomHost, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const playerColors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  const mySlotIndex = isMultiplayer && rtdbPlayers.length > 0
    ? Math.max(0, rtdbPlayers.findIndex(p => p.userId === currentUser.id))
    : 0;
  const myColor: PlayerColor = playerColors[mySlotIndex] || 'red';
  const isMyTurn = currentTurn === myColor;

  const getPlayerDisplay = (color: PlayerColor) => {
    const cIdx = playerColors.indexOf(color);
    if (color === 'red') {
      return {
        name: currentUser.username,
        avatarConfig: currentUser.avatarConfig,
        customAvatarUrl: currentUser.customAvatarUrl,
        isMe: true,
      };
    }
    if (isMultiplayer && rtdbPlayers[cIdx]) {
      const p = rtdbPlayers[cIdx];
      return {
        name: p.username,
        avatarConfig: p.avatarConfig,
        customAvatarUrl: undefined,
        isMe: p.userId === currentUser.id,
      };
    }
    // Default WePlay Bot / Opponent Profiles matching screenshots
    const botProfiles: Record<PlayerColor, { name: string; avatar: string }> = {
      red: { name: currentUser.username, avatar: '' },
      green: { name: 'Elif Şahin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      yellow: { name: 'Zeki Aydın', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      blue: { name: 'Fatma Öztürk', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100' },
    };
    return {
      name: botProfiles[color].name,
      avatarConfig: undefined,
      customAvatarUrl: botProfiles[color].avatar,
      isMe: false,
    };
  };

  // Turn Timer Loop
  useEffect(() => {
    if (gameState === 'gameover') return;
    setTurnTimer(15);
    const interval = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTurn, hasRolled, gameState]);

  const handleTimeExpiry = () => {
    if (isMyTurn) {
      if (!hasRolled) performRoll(myColor);
      else {
        const moves = getValidMoves(myColor, diceValue, tokens);
        if (moves.length > 0) moveToken(moves[0].id);
        else passTurn();
      }
    }
  };

  // Bot Turn Runner
  useEffect(() => {
    if (isMyTurn || hasRolled || isRolling || gameState === 'gameover') return;

    const timer = setTimeout(() => {
      performRoll(currentTurn);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentTurn, hasRolled, isRolling, isMyTurn]);

  // Bot Move Runner
  useEffect(() => {
    if (isMyTurn || !hasRolled || gameState === 'gameover') return;

    const timer = setTimeout(() => {
      const moves = getValidMoves(currentTurn, diceValue, tokens);
      if (moves.length === 0) {
        passTurn();
      } else {
        // Priority: capture > exit base > closest to home
        const captureMove = moves.find(m => {
          if (m.relativePos === -1) return false;
          const nextAbs = (m.relativePos + diceValue + START_OFFSETS[currentTurn]) % 52;
          return tokens.some(t => t.player !== currentTurn && t.relativePos >= 0 && ((t.relativePos + START_OFFSETS[t.player]) % 52) === nextAbs);
        });
        const baseMove = moves.find(m => m.relativePos === -1);
        const chosen = captureMove || baseMove || moves[0];
        moveToken(chosen.id);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasRolled, currentTurn, diceValue, isMyTurn]);

  // ═══ 3 TAKLA İLE OYUNCUDAN MERKEZE YUVARLANAN ZAR MEKANİZMASI ═══
  const performRoll = (roller: PlayerColor) => {
    soundFX.playDiceRoll();
    setIsRolling(true);
    setRollingPlayer(roller);
    setDiceRollProgress(0); // Başlangıç noktası: atan oyuncunun masadaki konumu

    // 0ms -> 700ms boyunca oyuncudan merkeze 3 takla (1080 deg) atarak gelir
    const startTime = Date.now();
    const rollDuration = 750;

    const rollAnim = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / rollDuration);
      setDiceRollProgress(progress);
      setDiceValue(Math.floor(Math.random() * 6) + 1);

      if (progress >= 1) {
        clearInterval(rollAnim);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        setHasRolled(true);

        setPlayerLastRolls(prev => ({
          ...prev,
          [roller]: finalRoll,
        }));

        if (finalRoll === 6) {
          soundFX.playSuccess();
        }

        // Otomatik hamle kontrolü (eğer hamle yoksa turu geçir)
        const validMoves = getValidMoves(roller, finalRoll, tokens);
        if (validMoves.length === 0) {
          setTimeout(() => passTurn(), 1200);
        } else if (roller === myColor && validMoves.length === 1) {
          // Kullanıcı için tek geçerli hamle varsa otomatik oyna
          setTimeout(() => moveToken(validMoves[0].id), 800);
        }
      }
    }, 50);
  };

  const getValidMoves = (player: PlayerColor, roll: number, currentTokens: Token[]) => {
    const playerTokens = currentTokens.filter(t => t.player === player);
    return playerTokens.filter(t => {
      if (t.relativePos === 56) return false;
      if (t.relativePos === -1) return roll === 6;
      return t.relativePos + roll <= 56;
    });
  };

  const passTurn = () => {
    setHasRolled(false);
    const nextIdx = (playerColors.indexOf(currentTurn) + 1) % playerColors.length;
    setCurrentTurn(playerColors[nextIdx]);
  };

  const moveToken = (tokenId: string) => {
    if (!hasRolled || gameState === 'gameover') return;

    let extraTurn = false;
    let nextTokens = [...tokens];
    const token = nextTokens.find(t => t.id === tokenId);
    if (!token) return;

    if (token.relativePos === -1 && diceValue === 6) {
      token.relativePos = 0;
      soundFX.playPawnHop();
      extraTurn = true;
    } else {
      token.relativePos += diceValue;
      soundFX.playPawnHop();

      // Kesme / Kırma kontrolü
      if (token.relativePos >= 0 && token.relativePos <= 50) {
        const absPos = (token.relativePos + START_OFFSETS[token.player]) % 52;
        if (!SAFE_SQUARES.includes(absPos)) {
          const opponentsOnSquare = nextTokens.filter(t => 
            t.player !== token.player && 
            t.relativePos >= 0 && t.relativePos <= 50 &&
            ((t.relativePos + START_OFFSETS[t.player]) % 52) === absPos
          );
          if (opponentsOnSquare.length > 0) {
            opponentsOnSquare.forEach(t => { t.relativePos = -1; });
            soundFX.playStampSlam();
            extraTurn = true;
          }
        }
      }

      if (token.relativePos === 56) {
        soundFX.playSuccess();
        extraTurn = true;
      }
    }

    if (diceValue === 6) extraTurn = true;

    setTokens(nextTokens);
    setHasRolled(false);

    // Kazanma Kontrolü
    const hasWon = nextTokens.filter(t => t.player === token.player && t.relativePos === 56).length === 4;
    if (hasWon) {
      setWinner(token.player);
      setGameState('gameover');
      handleGameOver(token.player);
      return;
    }

    if (!extraTurn) {
      const nextIdx = (playerColors.indexOf(currentTurn) + 1) % playerColors.length;
      setCurrentTurn(playerColors[nextIdx]);
    }
  };

  const handleGameOver = (winColor: PlayerColor) => {
    if (winColor === myColor) {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 150, spread: 90 });
      onUpdateUser({
        ...currentUser,
        coins: currentUser.coins + 250,
        exp: currentUser.exp + 180,
      });
      updateLeaderboard('ludo', currentUser.id, currentUser.username, 250).catch(console.warn);
    }
  };

  const getTokenCoords = (token: Token, tokenIndex: number) => {
    if (token.relativePos === -1) {
      return BASE_COORDS[token.player][tokenIndex];
    }
    if (token.relativePos >= 0 && token.relativePos <= 50) {
      const absPos = (token.relativePos + START_OFFSETS[token.player]) % 52;
      return BOARD_COORDS[absPos];
    }
    if (token.relativePos >= 51 && token.relativePos <= 55) {
      return HOME_COORDS[token.player][token.relativePos];
    }
    return { x: 7, y: 7 }; // center
  };

  const validMoves = hasRolled ? getValidMoves(currentTurn, diceValue, tokens) : [];

  // Zarın 3 takla pozisyonu hesaplama
  const origin = PLAYER_DICE_ORIGINS[rollingPlayer];
  const currentX = origin.x * (1 - diceRollProgress);
  const currentY = origin.y * (1 - diceRollProgress);
  const rollRotation = diceRollProgress * 1080; // 3 Tam Takla (3x360=1080 derece)
  const diceScale = 0.45 + diceRollProgress * 0.75; // 0.45'ten büyüyerek 1.20 boyutuna gelir

  return (
    <div className="fixed inset-0 z-50 bg-[#2b1810] flex flex-col justify-between font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ═══ ÜST VİNTAGE ODA & PENCERE ARKA PLANI (media_1790344676616.jpg) ═══ */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#8a4b38] via-[#e5d4be] to-[#d8c2a7]">
        {/* Vintage Bay Window & Curtains Sheer */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#4a2618]/80 via-transparent to-transparent opacity-80" />
      </div>

      {/* ═══ TOP BAR (☰ Menü, Altın Sayacı, Geri) ═══ */}
      <div className="relative pt-[max(calc(env(safe-area-inset-top,0px)+8px),10px)] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playPop();
              onExitGame();
            }}
            className="w-9 h-9 rounded-2xl bg-black/30 hover:bg-black/40 border border-white/20 flex items-center justify-center text-white active:scale-90 transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Altın Yığını */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-400/30 text-xs font-black text-amber-300 font-mono shadow-sm">
            <span>🪙</span>
            <span>{currentUser.coins.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Süre Rozeti */}
          <div className="px-2.5 py-1 rounded-full bg-black/30 border border-white/20 text-xs font-black text-amber-300 font-mono">
            ⏱️ {turnTimer}s
          </div>
        </div>
      </div>

      {/* ═══ OYUN ALANI & MASA (MASA ÖRTÜSÜ & OYUNCU TABAKLARI) ═══ */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-2 z-10 my-auto">
        {/* ═══ ÜST 2 OYUNCU (Elif Şahin - Yeşil & Zeki Aydın - Sarı) ═══ */}
        <div className="w-full max-w-[340px] flex items-center justify-between px-2 mb-2">
          {/* Elif Şahin (Yeşil) */}
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-400 overflow-hidden shadow-md bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Elif Şahin"
                  className="w-full h-full object-cover"
                />
              </div>
              {currentTurn === 'green' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-300 text-sm font-black animate-bounce">
                  ▼
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-[11px] border border-emerald-300 shadow-sm">
                Elif Şahin
              </div>
              {playerLastRolls.green && (
                <span className="inline-block px-1.5 py-0.2 rounded bg-white text-stone-900 font-black text-[9px] font-mono shadow-xs border">
                  🎲 {playerLastRolls.green}
                </span>
              )}
            </div>
          </div>

          {/* Zeki Aydın (Sarı) + Kurabiye Tabağı */}
          <div className="relative flex items-center gap-2">
            <div className="space-y-0.5 text-right">
              <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black text-[11px] border border-amber-300 shadow-sm">
                Zeki Aydın
              </div>
              {playerLastRolls.yellow && (
                <span className="inline-block px-1.5 py-0.2 rounded bg-white text-stone-900 font-black text-[9px] font-mono shadow-xs border">
                  🎲 {playerLastRolls.yellow}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="Zeki Aydın"
                  className="w-full h-full object-cover"
                />
              </div>
              {currentTurn === 'yellow' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-300 text-sm font-black animate-bounce">
                  ▼
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ AHŞAP LUDO TAHTASI (media_1790344676616.jpg) ═══ */}
        <div className="relative w-[320px] h-[320px] sm:w-[340px] sm:h-[340px] rounded-3xl bg-[#d4a373] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 border-[#8c532b]">
          {/* Tahta Çerçeve Kaplaması */}
          <div className="w-full h-full bg-[#fefae0] rounded-2xl border-2 border-[#b07d52] grid grid-cols-15 grid-rows-15 gap-[1px] p-0.5 shadow-inner relative overflow-hidden">
            {Array.from({ length: 15 * 15 }).map((_, i) => {
              const x = i % 15;
              const y = Math.floor(i / 15);

              let cellClass = 'bg-[#faedcd]/90';
              let icon = null;

              // 4 Köşe Avluları (Bases)
              if (x < 6 && y < 6) cellClass = 'bg-[#6aa84f] border border-[#38761d]'; // Yeşil (Sol Üst)
              else if (x > 8 && y < 6) cellClass = 'bg-[#f1c232] border border-[#bf9000]'; // Sarı (Sağ Üst)
              else if (x < 6 && y > 8) cellClass = 'bg-[#cc0000] border border-[#990000]'; // Kırmızı (Sol Alt)
              else if (x > 8 && y > 8) cellClass = 'bg-[#3d85c6] border border-[#0b5394]'; // Mavi (Sağ Alt)
              // Merkez Hedef (Center Goal)
              else if (x >= 6 && x <= 8 && y >= 6 && y <= 8) {
                cellClass = 'bg-gradient-to-tr from-[#d4a373] to-[#faedcd]';
                if (x === 7 && y === 7) icon = '👑';
              } else {
                // Hedef Yolları
                if (x === 7 && y > 0 && y < 6) cellClass = 'bg-[#6aa84f] text-white';
                if (y === 7 && x > 8 && x < 14) cellClass = 'bg-[#f1c232] text-white';
                if (y === 7 && x > 0 && x < 6) cellClass = 'bg-[#cc0000] text-white';
                if (x === 7 && y > 8 && y < 14) cellClass = 'bg-[#3d85c6] text-white';

                // Başlangıç Okları
                if (x === 8 && y === 1) { cellClass = 'bg-[#6aa84f] text-white'; icon = '↓'; }
                if (x === 13 && y === 8) { cellClass = 'bg-[#f1c232] text-white'; icon = '←'; }
                if (x === 1 && y === 6) { cellClass = 'bg-[#cc0000] text-white'; icon = '→'; }
                if (x === 6 && y === 13) { cellClass = 'bg-[#3d85c6] text-white'; icon = '↑'; }

                // Güvenli Yıldızlar
                if ((x === 6 && y === 2) || (x === 12 && y === 6) || (x === 2 && y === 8) || (x === 8 && y === 12)) {
                  icon = '★';
                }
              }

              return (
                <div key={i} className={`flex items-center justify-center text-[8px] font-black select-none ${cellClass}`}>
                  {icon}
                </div>
              );
            })}

            {/* Piyonlar (Ornate 3D Chess-like Pawns) */}
            {tokens.map((t) => {
              const tokenIndex = parseInt(t.id.split('-')[1]);
              const coords = getTokenCoords(t, tokenIndex);
              if (t.relativePos === 56) return null;

              const isSelectable = isMyTurn && t.player === myColor && hasRolled && validMoves.some(m => m.id === t.id);

              const pawnGradients: Record<PlayerColor, string> = {
                red: 'from-rose-500 to-red-700 border-rose-200 ring-rose-500/70',
                green: 'from-emerald-400 to-green-700 border-emerald-200 ring-emerald-500/70',
                yellow: 'from-amber-300 to-yellow-600 border-amber-200 ring-amber-500/70',
                blue: 'from-sky-400 to-blue-700 border-sky-200 ring-sky-500/70',
              };

              return (
                <div
                  key={t.id}
                  onClick={() => isSelectable && moveToken(t.id)}
                  className={`absolute w-[6.6%] h-[6.6%] rounded-full border-2 bg-gradient-to-b ${
                    pawnGradients[t.player]
                  } flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${
                    isSelectable
                      ? 'ring-4 ring-yellow-300 scale-125 z-40 animate-bounce'
                      : 'hover:scale-110 z-30'
                  }`}
                  style={{
                    left: `${(coords.x / 15) * 100}%`,
                    top: `${(coords.y / 15) * 100}%`,
                    transform: 'translate(4%, 4%)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs" />
                </div>
              );
            })}
          </div>

          {/* ═══ MERKEZİ 3 TAKLA İLE YUVARLANARAK GELEN BÜYÜK 3D ZAR (media_1790344676616.jpg) ═══ */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-transform ease-out"
            style={{
              transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${diceScale})`,
            }}
          >
            {/* Büyük 3D Küp Zar */}
            <div
              className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#cbd5e1] border-2 border-white shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center p-2"
              style={{
                transform: `rotate(${rollRotation}deg)`,
                transition: 'transform 0.05s linear',
              }}
            >
              {/* ZAR NOKTALARI (1-6) */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1 relative z-10">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const dotsConfig: Record<number, number[]> = {
                    1: [4],
                    2: [0, 8],
                    3: [0, 4, 8],
                    4: [0, 2, 6, 8],
                    5: [0, 2, 4, 6, 8],
                    6: [0, 2, 3, 5, 6, 8],
                  };
                  const activeDots = dotsConfig[diceValue] || [4];
                  const hasDot = activeDots.includes(idx);
                  return (
                    <div key={idx} className="flex items-center justify-center">
                      {hasDot && (
                        <div
                          className={`rounded-full shadow-inner ${
                            diceValue === 1
                              ? 'w-4 h-4 bg-gradient-to-b from-red-500 to-red-700 shadow-red-950/80 ring-1 ring-red-300'
                              : 'w-3.5 h-3.5 bg-gradient-to-b from-stone-800 to-stone-950 shadow-black'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ "SIRA SENDE" ALTIN BANNERI (media_1790344676622.jpg) ═══ */}
        {isMyTurn && !hasRolled && !isRolling && (
          <div className="absolute top-[48%] -translate-y-1/2 z-50 pointer-events-none animate-in zoom-in-95 duration-200">
            <div className="px-8 py-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white shadow-[0_0_25px_rgba(245,158,11,0.8)] text-stone-950 font-black text-sm tracking-wider uppercase">
              Sıra sende
            </div>
          </div>
        )}

        {/* ═══ ALT 2 OYUNCU (FARKETMEZ - Kırmızı & Fatma Öztürk - Mavi) ═══ */}
        <div className="w-full max-w-[340px] flex items-center justify-between px-2 mt-2">
          {/* FARKETMEZ (Kullanıcı / Kırmızı) + Kurabiye Tabağı */}
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-rose-500 overflow-hidden shadow-md bg-stone-800">
                {currentUser.avatarConfig ? (
                  <AvatarRenderer config={currentUser.avatarConfig} size="full" className="w-full h-full" />
                ) : (
                  <img
                    src={currentUser.customAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {currentTurn === 'red' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-300 text-sm font-black animate-bounce">
                  ▼
                </div>
              )}
            </div>
            <div className="space-y-0.5">
              <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-700 text-white font-black text-[11px] border border-rose-300 shadow-sm">
                {currentUser.username}
              </div>
              {playerLastRolls.red && (
                <span className="inline-block px-1.5 py-0.2 rounded bg-white text-stone-900 font-black text-[9px] font-mono shadow-xs border">
                  🎲 {playerLastRolls.red}
                </span>
              )}
            </div>
          </div>

          {/* Fatma Öztürk (Mavi) */}
          <div className="relative flex items-center gap-2">
            <div className="space-y-0.5 text-right">
              <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-black text-[11px] border border-sky-300 shadow-sm">
                Fatma Öztürk
              </div>
              {playerLastRolls.blue && (
                <span className="inline-block px-1.5 py-0.2 rounded bg-white text-stone-900 font-black text-[9px] font-mono shadow-xs border">
                  🎲 {playerLastRolls.blue}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-sky-400 overflow-hidden shadow-md bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100"
                  alt="Fatma Öztürk"
                  className="w-full h-full object-cover"
                />
              </div>
              {currentTurn === 'blue' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-300 text-sm font-black animate-bounce">
                  ▼
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ALT KONTROL PANELİ & 3D ZAR ATMA BUTONU (media_1790344676616.jpg) ═══ */}
      <div className="relative bg-[#1c120c] border-t border-[#8c532b]/40 px-4 py-3 pb-[max(calc(env(safe-area-inset-bottom,0px)+12px),18px)] flex items-center justify-between z-20">
        {/* Sol: Ses & Mikrofon Butonları */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAudioMuted(prev => !prev)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-amber-200 active:scale-90 transition"
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMicMuted(prev => !prev)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-amber-200 active:scale-90 transition"
          >
            {isMicMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* ═══ ORTADAKİ DEV ZAR ATMA BUTONU (media_1790344676622.jpg) ═══ */}
        <div className="relative -mt-8">
          <button
            disabled={!isMyTurn || isRolling || hasRolled}
            onClick={() => performRoll(myColor)}
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-2 shadow-2xl transition active:scale-90 ${
              isMyTurn && !hasRolled
                ? 'bg-gradient-to-tr from-[#f59e0b] via-[#fde68a] to-[#d97706] border-4 border-white shadow-[0_0_30px_rgba(245,158,11,0.8)] scale-105'
                : 'bg-stone-700/80 border-2 border-stone-600 opacity-60'
            }`}
          >
            {/* Buton İçindeki 3D Zar İkonu */}
            <div className="w-12 h-12 rounded-xl bg-white shadow-inner flex items-center justify-center text-2xl">
              🎲
            </div>

            {/* El İşareti Pointer (media_1790344676622.jpg) */}
            {isMyTurn && !hasRolled && (
              <div className="absolute -bottom-2 -right-1 text-2xl animate-bounce">
                👆
              </div>
            )}
          </button>
        </div>

        {/* Sağ: Emoji & Sohbet Butonları */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiDrawer(prev => !prev)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-amber-200 active:scale-90 transition"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={() => alert('Oda içi oyun sohbeti açık!')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-amber-200 active:scale-90 transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ═══ SEVİMLİ STICKER & EMOJİ ÇEKMECESİ (media_1790344676622.jpg) ═══ */}
      {showEmojiDrawer && (
        <div
          onClick={() => setShowEmojiDrawer(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-fadeIn"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#241710] border-t-2 border-amber-600/40 rounded-t-3xl p-4 w-full max-w-md mx-auto shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-amber-300">Oyun İçi Stickerlar</h3>
              <button onClick={() => setShowEmojiDrawer(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5 max-h-52 overflow-y-auto no-scrollbar">
              {LUDO_STICKERS.map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    soundFX.playPop();
                    setShowEmojiDrawer(false);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex flex-col items-center gap-1 active:scale-90 transition"
                >
                  <span className="text-2xl">{st.icon}</span>
                  <span className="text-[9px] font-bold text-slate-300 truncate max-w-full">
                    {st.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ OYUN BİTTİ EKRANI ═══ */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1f140e] border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-5xl animate-bounce">🏆</div>
            <h2 className="text-xl font-black text-amber-300">
              {winner === myColor ? 'TEBRİKLER KAZANDIN!' : `${winner?.toUpperCase()} KAZANDI!`}
            </h2>
            <p className="text-xs text-slate-300">
              {winner === myColor ? '+250 Altın ve +180 XP kazandın!' : 'Bir dahaki sefere daha iyi şanslar!'}
            </p>
            <button
              onClick={onExitGame}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-400/30 active:scale-95 transition"
            >
              Lobiye Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
