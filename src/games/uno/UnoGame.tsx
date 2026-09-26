import React, { useState, useEffect, useRef } from 'react';
import type { User, AvatarConfig } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Trophy,
  RotateCcw,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  MessageSquare,
  Menu,
  Clock,
  X,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateLeaderboard } from '../../services/leaderboardService';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface UnoGameProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
type CardValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2'
  | 'wild' | 'wild4';

interface UnoCard {
  id: string;
  color: CardColor;
  value: CardValue;
  tilt?: number;
}

interface Player {
  id: string;
  name: string;
  isBot: boolean;
  avatarConfig?: any;
  avatarUrl?: string;
  hand: UnoCard[];
  calledUno: boolean;
}

const COLORS: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];

const createDeck = (): UnoCard[] => {
  const deck: UnoCard[] = [];
  let id = 1;

  for (const color of COLORS) {
    deck.push({ id: `c-${id++}`, color, value: '0' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `c-${id++}`, color, value: `${i}` as CardValue });
      deck.push({ id: `c-${id++}`, color, value: `${i}` as CardValue });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ id: `c-${id++}`, color, value: 'skip' });
      deck.push({ id: `c-${id++}`, color, value: 'reverse' });
      deck.push({ id: `c-${id++}`, color, value: 'draw2' });
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${id++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `c-${id++}`, color: 'wild', value: 'wild4' });
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

// Cute WePlay Robot Mascot (from media_1790344676633.jpg)
const RobotMascot: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Blue Ears/Bolts */}
    <rect x="2" y="14" width="3" height="6" rx="1.5" fill="#0284c7" />
    <rect x="31" y="14" width="3" height="6" rx="1.5" fill="#0284c7" />
    {/* Antenna */}
    <circle cx="18" cy="4" r="2" fill="#38bdf8" />
    <line x1="18" y1="5.5" x2="18" y2="9" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
    {/* White Head */}
    <rect x="6" y="9" width="24" height="15" rx="6" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
    {/* Visor Screen */}
    <rect x="9" y="12" width="18" height="8" rx="3" fill="#0369a1" />
    {/* Cyan glowing eyes */}
    <circle cx="14" cy="16" r="1.6" fill="#38bdf8" />
    <circle cx="22" cy="16" r="1.6" fill="#38bdf8" />
    {/* Cheeks */}
    <circle cx="11" cy="20.5" r="1.2" fill="#fda4af" />
    <circle cx="25" cy="20.5" r="1.2" fill="#fda4af" />
    {/* Body */}
    <rect x="11" y="24" width="14" height="8" rx="3.5" fill="#ffffff" stroke="#bae6fd" strokeWidth="1" />
    <circle cx="18" cy="28" r="1.5" fill="#38bdf8" />
  </svg>
);

// Sunshine Yellow Card Back with Robot Face (media_1790344676633.jpg)
const CardBackView: React.FC<{ size?: 'sm' | 'md'; rotation?: number }> = ({
  size = 'md',
  rotation = 0,
}) => {
  const sizeClasses = size === 'sm' ? 'w-7 h-10 rounded-md' : 'w-10 h-14 rounded-lg';
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`relative select-none flex-shrink-0 p-0.5 bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] border-2 border-white shadow-[0_4px_8px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center overflow-hidden ${sizeClasses}`}
    >
      <div className="w-[84%] h-[80%] rounded-md bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] border border-white/60 flex items-center justify-center shadow-inner">
        <div className="w-5 h-5 rounded-full bg-white/90 border border-amber-300 flex items-center justify-center shadow-xs">
          <RobotMascot className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

// Realistic Playable Card View with Mascot and 3D Bevel (media_1790344676633.jpg)
const UnoCardView: React.FC<{
  card: UnoCard;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  rotation?: number;
}> = ({ card, isPlayable = false, onClick, size = 'md', rotation = 0 }) => {
  const sizeClasses = {
    sm: 'w-10 h-15 text-[10px] rounded-xl',
    md: 'w-13 h-19 text-xs rounded-2xl',
    lg: 'w-18 h-26 text-sm rounded-2xl',
  }[size];

  const colorStyles: Record<CardColor, { bg: string; text: string; glow: string }> = {
    red: {
      bg: 'bg-gradient-to-b from-[#f43f5e] via-[#e11d48] to-[#be123c]',
      text: 'text-rose-600',
      glow: 'shadow-rose-500/50',
    },
    blue: {
      bg: 'bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1]',
      text: 'text-sky-600',
      glow: 'shadow-sky-500/50',
    },
    green: {
      bg: 'bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f]',
      text: 'text-lime-700',
      glow: 'shadow-lime-500/50',
    },
    yellow: {
      bg: 'bg-gradient-to-b from-[#fde047] via-[#eab308] to-[#ca8a04]',
      text: 'text-amber-700',
      glow: 'shadow-amber-500/50',
    },
    wild: {
      bg: 'bg-gradient-to-tr from-rose-500 via-amber-400 via-lime-500 to-sky-500',
      text: 'text-purple-700',
      glow: 'shadow-purple-500/50',
    },
  };

  const getSymbol = (val: CardValue) => {
    switch (val) {
      case 'skip': return '⊘';
      case 'reverse': return '🔄';
      case 'draw2': return '+2';
      case 'wild': return '★';
      case 'wild4': return '+4';
      default: return val;
    }
  };

  const symbol = getSymbol(card.value);
  const st = colorStyles[card.color];

  return (
    <div
      onClick={onClick}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`relative select-none flex-shrink-0 cursor-pointer p-1 transition-all duration-200 border-2 border-white flex flex-col justify-between ${sizeClasses} ${st.bg} ${
        isPlayable
          ? `ring-4 ring-yellow-300 -translate-y-4 hover:-translate-y-6 hover:scale-105 z-30 shadow-[0_12px_20px_rgba(0,0,0,0.45)] ${st.glow}`
          : 'opacity-95 shadow-[0_6px_12px_rgba(0,0,0,0.35)]'
      }`}
    >
      {/* 3D Gloss Sheen Stripe */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Top Left Corner */}
      <div className="font-black text-white leading-none drop-shadow relative z-10 text-[11px] font-mono">
        {card.value === 'wild' ? 'W' : card.value === 'wild4' ? '+4' : card.value}
      </div>

      {/* Center Mascot & Big Stylized Number */}
      <div className="mx-auto w-[82%] h-[64%] rounded-xl bg-white/95 flex items-center justify-center relative shadow-inner overflow-hidden border border-black/5">
        <div className="flex items-center justify-center gap-0.5">
          <span className={`font-black italic drop-shadow-sm text-lg sm:text-xl ${st.text}`}>
            {symbol}
          </span>
          {/* Cute Robot Mascot standing next to the number */}
          <RobotMascot className="w-4 h-4 shrink-0" />
        </div>
      </div>

      {/* Bottom Right Corner */}
      <div className="font-black text-white text-right leading-none drop-shadow rotate-180 relative z-10 text-[11px] font-mono">
        {card.value === 'wild' ? 'W' : card.value === 'wild4' ? '+4' : card.value}
      </div>
    </div>
  );
};

// Scalloped Lace Picnic Cloth (Table Mat from media_1790344676633.jpg)
const ScallopedPicnicMat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 48 scallops around radius 186 in 400x400 SVG
  const scallops = Array.from({ length: 48 }, (_, i) => {
    const angle = (i * 360) / 48;
    const rad = (angle * Math.PI) / 180;
    const cx = 200 + 182 * Math.cos(rad);
    const cy = 200 + 182 * Math.sin(rad);
    return <circle key={i} cx={cx} cy={cy} r="10" fill="#fdfcf5" />;
  });

  return (
    <div className="relative w-[min(88vw,42vh,330px)] h-[min(88vw,42vh,330px)] mx-auto flex items-center justify-center">
      {/* Background SVG Mat with Lace Scallops */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="matLawn" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="70%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </radialGradient>
        </defs>
        {/* Scallop lace petals */}
        {scallops}
        {/* Cream lace cloth body */}
        <circle cx="200" cy="200" r="180" fill="#fdfcf5" />
        {/* Inner green lawn mat */}
        <circle cx="200" cy="200" r="164" fill="url(#matLawn)" stroke="#a3e635" strokeWidth="2.5" />
        {/* Inner dashed ring */}
        <circle cx="200" cy="200" r="148" fill="none" stroke="#bef264" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        <circle cx="200" cy="200" r="92" fill="none" stroke="#d9f99d" strokeWidth="1.5" opacity="0.4" />
      </svg>

      {/* Interactive Content (Cards, Arrows) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// 4 Luminous Curved Sky-Blue Rotation Arrows (media_1790344676633.jpg)
const CurvedTurnArrows: React.FC<{ direction: 1 | -1 }> = ({ direction }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-700 ${
        direction === 1 ? 'rotate-0' : 'scale-x-[-1]'
      }`}
    >
      <svg viewBox="0 0 280 280" className="w-[min(68vw,260px)] h-[min(68vw,260px)] animate-[spin_24s_linear_infinite]">
        <defs>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 4 Identical Curved Arrows Rotated by 90deg */}
        {[0, 90, 180, 270].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 140 140)`} filter="url(#cyanGlow)">
            {/* Curved Arc: R=92, from -24deg to 32deg */}
            <path
              d="M 224 102 A 92 92 0 0 1 217 188"
              fill="none"
              stroke="white"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <path
              d="M 224 102 A 92 92 0 0 1 217 188"
              fill="none"
              stroke="#0284c7"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Arrowhead at tip */}
            <polygon
              points="208,186 226,204 232,176"
              fill="#0284c7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const UnoGame: React.FC<UnoGameProps> = ({ currentUser, onUpdateUser, onExitGame, roomId }) => {
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [activeColor, setActiveColor] = useState<CardColor>('blue');
  const [players, setPlayers] = useState<Player[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [pendingWildCard, setPendingWildCard] = useState<UnoCard | null>(null);
  const [unoBanner, setUnoBanner] = useState<string | null>(null);
  const [matchSeconds, setMatchSeconds] = useState<number>(291); // 04:51 in seconds (media_1790344676633.jpg)
  const [turnTimer, setTurnTimer] = useState<number>(15);

  // Sound and Chat States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [floatingChat, setFloatingChat] = useState<{ sender: string; text: string } | null>(null);

  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } =
    useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const myIndex = isMultiplayer && rtdbPlayers.length > 0
    ? Math.max(0, rtdbPlayers.findIndex(p => p.userId === currentUser.id))
    : 0;

  // Match Countdown Timer (04:51)
  useEffect(() => {
    if (gameState === 'game_over') return;
    const t = setInterval(() => {
      setMatchSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  // Turn Timer Loop (15 seconds per turn)
  useEffect(() => {
    if (gameState === 'game_over') return;
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
  }, [turnIndex, gameState]);

  const handleTimeExpiry = () => {
    if (turnIndex === myIndex && gameState === 'playing') {
      handleUserDrawCard();
    }
  };

  useEffect(() => {
    initGame();
  }, [rtdbPlayers.length]);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.deck) setDeck(remoteState.deck);
    if (remoteState.discardPile) setDiscardPile(remoteState.discardPile);
    if (remoteState.activeColor) setActiveColor(remoteState.activeColor);
    if (remoteState.players) setPlayers(remoteState.players);
    if (remoteState.turnIndex !== undefined) setTurnIndex(remoteState.turnIndex);
    if (remoteState.direction !== undefined) setDirection(remoteState.direction);
    if (remoteState.unoBanner !== undefined) setUnoBanner(remoteState.unoBanner);
    if (remoteState.gameState) setGameState(remoteState.gameState);
    if (remoteState.winner) setWinner(remoteState.winner);
  }, [remoteState, isMultiplayer]);

  const initGame = () => {
    if (isMultiplayer && !isRoomHost) return;

    const newDeck = createDeck();
    const p1Hand = newDeck.splice(0, 7);
    const p2Hand = newDeck.splice(0, 7);
    const p3Hand = newDeck.splice(0, 7);
    const p4Hand = newDeck.splice(0, 7);

    // Initial discard card (blue 9 matching media_1790344676633.jpg)
    let firstCard: UnoCard = { id: 'c-init', color: 'blue', value: '9', tilt: 0 };
    const validFirst = newDeck.find(c => c.color !== 'wild' && c.value !== 'skip' && c.value !== 'reverse' && c.value !== 'draw2');
    if (validFirst) {
      firstCard = { ...validFirst, tilt: 0 };
    }

    const initialPlayers: Player[] = [];

    if (isMultiplayer && rtdbPlayers.length > 0) {
      rtdbPlayers.forEach((rp, i) => {
        initialPlayers.push({
          id: rp.userId,
          name: rp.userId === currentUser.id ? `${rp.username} (Sen)` : rp.username,
          isBot: false,
          avatarConfig: rp.avatarConfig,
          hand: newDeck.splice(0, 7),
          calledUno: false,
        });
      });
      // Fill up to 4 with cute bots if fewer than 4 players
      const botNames = ['osi 🐻', 'Melodi Rüy...', '...C.E.'];
      while (initialPlayers.length < 4) {
        const bIdx = initialPlayers.length;
        initialPlayers.push({
          id: `bot-${bIdx}`,
          name: botNames[bIdx - 1] || `Oyuncu ${bIdx + 1}`,
          isBot: true,
          avatarUrl: bIdx === 1 ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          hand: newDeck.splice(0, 7),
          calledUno: false,
        });
      }
    } else {
      // 4 Players matching media_1790344676633.jpg
      initialPlayers.push(
        {
          id: currentUser.id,
          name: currentUser.username || 'FARKETMEZ',
          isBot: false,
          avatarConfig: currentUser.avatarConfig,
          hand: p1Hand,
          calledUno: false,
        },
        {
          id: 'player-left',
          name: '...C.E.',
          isBot: true,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          hand: p2Hand,
          calledUno: false,
        },
        {
          id: 'player-top',
          name: 'osi 🐻',
          isBot: true,
          avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
          hand: p3Hand,
          calledUno: false,
        },
        {
          id: 'player-right',
          name: 'Melodi Rüy...',
          isBot: true,
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          hand: p4Hand,
          calledUno: false,
        }
      );
    }

    setDeck(newDeck);
    setDiscardPile([firstCard]);
    setActiveColor(firstCard.color);
    setPlayers(initialPlayers);
    setTurnIndex(0);
    setDirection(1);
    setGameState('playing');
    setWinner(null);
    setUnoBanner(null);

    if (isMultiplayer && isRoomHost) {
      pushState({
        deck: newDeck,
        discardPile: [firstCard],
        activeColor: firstCard.color,
        players: initialPlayers,
        turnIndex: 0,
        direction: 1,
        gameState: 'playing',
        actionSeq: 1,
      }).catch(console.warn);
    }
  };

  const topCard = discardPile[discardPile.length - 1];

  const canPlayCard = (card: UnoCard): boolean => {
    if (!topCard) return true;
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  const nextTurn = (step = 1, currentDir = direction) => {
    setTurnIndex(prev => {
      const total = Math.max(1, players.length);
      return (prev + step * currentDir + total * 10) % total;
    });
  };

  const drawCards = (count: number): UnoCard[] => {
    let currentDeck = [...deck];
    let currentDiscard = [...discardPile];
    const drawn: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length <= 1) break;
        const top = currentDiscard.pop()!;
        currentDeck = [...currentDiscard].sort(() => Math.random() - 0.5);
        currentDiscard = [top];
      }
      if (currentDeck.length > 0) {
        drawn.push(currentDeck.pop()!);
      }
    }

    setDeck(currentDeck);
    setDiscardPile(currentDiscard);
    return drawn;
  };

  const isMyTurn = turnIndex === myIndex;

  // Bot Turn Automation
  useEffect(() => {
    if (gameState !== 'playing') return;
    const currentP = players[turnIndex];
    if (!currentP || !currentP.isBot) return;

    const timer = setTimeout(() => {
      botPlayTurn(turnIndex);
    }, 1200);

    return () => clearTimeout(timer);
  }, [turnIndex, gameState, players.length]);

  const botPlayTurn = (botIdx: number) => {
    const bot = players[botIdx];
    if (!bot) return;

    // Find playable cards
    const playable = bot.hand.filter(canPlayCard);

    if (playable.length > 0) {
      // Pick card: prefer action or matching color
      const chosen = playable.find(c => c.value === 'draw2' || c.value === 'skip' || c.value === 'reverse') || playable[0];

      let chosenCol: CardColor = chosen.color;
      if (chosen.color === 'wild') {
        const counts: Record<CardColor, number> = { red: 0, blue: 0, green: 0, yellow: 0, wild: 0 };
        bot.hand.forEach(c => { counts[c.color]++; });
        const best = (['red', 'blue', 'green', 'yellow'] as CardColor[]).reduce((a, b) => counts[a] >= counts[b] ? a : b);
        chosenCol = best;
      }

      // Bot calls UNO if 1 card will remain
      if (bot.hand.length === 2) {
        soundFX.playGiftFanfare();
        setUnoBanner(`🔥 ${bot.name}: "ONE!"`);
        setTimeout(() => setUnoBanner(null), 2500);
      }

      executePlayCard(botIdx, chosen, chosenCol);
    } else {
      // Bot draws a card
      soundFX.playCardFlip();
      const drawn = drawCards(1);
      if (drawn.length === 0) {
        nextTurn(1);
        return;
      }

      const updated = [...players];
      updated[botIdx].hand.push(...drawn);
      setPlayers(updated);

      const drawnCard = drawn[0];
      if (canPlayCard(drawnCard)) {
        setTimeout(() => {
          let chosenCol: CardColor = drawnCard.color;
          if (drawnCard.color === 'wild') chosenCol = 'blue';
          executePlayCard(botIdx, drawnCard, chosenCol);
        }, 600);
      } else {
        nextTurn(1);
      }
    }
  };

  const handleUserPlayCard = (card: UnoCard) => {
    if (!isMyTurn || gameState !== 'playing') return;
    if (!canPlayCard(card)) {
      soundFX.playPop();
      return;
    }

    if (card.color === 'wild') {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    executePlayCard(myIndex, card, card.color);
  };

  const executePlayCard = (playerIdx: number, card: UnoCard, chosenColor: CardColor) => {
    soundFX.playPop();
    const player = players[playerIdx];
    if (!player) return;

    const nextHand = player.hand.filter(c => c.id !== card.id);
    const updatedPlayers = [...players];
    updatedPlayers[playerIdx] = {
      ...player,
      hand: nextHand,
      calledUno: nextHand.length === 1 ? player.calledUno : false,
    };
    setPlayers(updatedPlayers);

    // Random tilt for discard pile effect
    const cardWithTilt = { ...card, color: chosenColor === 'wild' ? activeColor : card.color, tilt: (Math.random() - 0.5) * 14 };
    const nextDiscard = [...discardPile, cardWithTilt];
    setDiscardPile(nextDiscard);
    setActiveColor(chosenColor);
    soundFX.playCardFlip();

    if (nextHand.length === 0) {
      handleGameOver(player);
      if (isMultiplayer) {
        pushState({
          discardPile: nextDiscard,
          activeColor: chosenColor,
          players: updatedPlayers,
          gameState: 'game_over',
          winner: player,
          actionSeq: Date.now(),
        }).catch(console.warn);
      }
      return;
    }

    let banner: string | null = null;
    if (nextHand.length === 1) {
      banner = `🔥 ${player.name}: "ONE!"`;
      setUnoBanner(banner);
      soundFX.playGiftFanfare();
      setTimeout(() => setUnoBanner(null), 2500);
    }

    // Apply special card effects
    let step = 1;
    let newDir = direction;
    const total = Math.max(1, players.length);

    if (card.value === 'reverse') {
      newDir = (direction * -1) as 1 | -1;
      setDirection(newDir);
      soundFX.playSuccess();
    } else if (card.value === 'skip') {
      step = 2;
      soundFX.playError();
    } else if (card.value === 'draw2') {
      const targetIdx = (playerIdx + direction + total * 10) % total;
      const penaltyCards = drawCards(2);
      if (updatedPlayers[targetIdx]) {
        updatedPlayers[targetIdx].hand.push(...penaltyCards);
      }
      setPlayers([...updatedPlayers]);
      step = 2;
      soundFX.playError();
    } else if (card.value === 'wild4') {
      const targetIdx = (playerIdx + direction + total * 10) % total;
      const penaltyCards = drawCards(4);
      if (updatedPlayers[targetIdx]) {
        updatedPlayers[targetIdx].hand.push(...penaltyCards);
      }
      setPlayers([...updatedPlayers]);
      step = 2;
      soundFX.playError();
    }

    const nextTurnIdx = (playerIdx + step * newDir + total * 10) % total;
    nextTurn(step, newDir);

    if (isMultiplayer) {
      pushState({
        deck,
        discardPile: nextDiscard,
        activeColor: chosenColor,
        players: updatedPlayers,
        turnIndex: nextTurnIdx,
        direction: newDir,
        gameState: 'playing',
        unoBanner: banner,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const handleUserDrawCard = () => {
    if (!isMyTurn || gameState !== 'playing') return;
    soundFX.playCardFlip();
    const drawn = drawCards(1);
    if (drawn.length === 0) return;

    const updated = [...players];
    updated[myIndex].hand.push(...drawn);
    setPlayers(updated);

    const drawnCard = drawn[0];
    const total = Math.max(1, players.length);

    if (canPlayCard(drawnCard)) {
      // Auto play drawn card if playable or keep in hand
      setTimeout(() => {
        executePlayCard(myIndex, drawnCard, drawnCard.color === 'wild' ? 'blue' : drawnCard.color);
      }, 500);
    } else {
      const nextTurnIdx = (turnIndex + 1 * direction + total * 10) % total;
      setTimeout(() => {
        nextTurn(1);
      }, 700);
    }
  };

  const handleCallUno = () => {
    soundFX.playGiftFanfare();
    const banner = `🔥 ${currentUser.username}: "ONE!"`;
    setUnoBanner(banner);
    const updated = [...players];
    if (updated[myIndex]) {
      updated[myIndex].calledUno = true;
    }
    setPlayers(updated);
    setTimeout(() => setUnoBanner(null), 2500);

    if (isMultiplayer) {
      pushState({
        players: updated,
        unoBanner: banner,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const handleGameOver = (winningPlayer: Player) => {
    setGameState('game_over');
    setWinner(winningPlayer);
    soundFX.playSuccess();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

    const isUserWin = winningPlayer.id === currentUser.id;
    const coinsReward = isUserWin ? 250 : 60;
    const expReward = isUserWin ? 200 : 100;

    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + coinsReward,
      exp: currentUser.exp + expReward,
      gamesPlayed: currentUser.gamesPlayed + 1,
      gamesWon: currentUser.gamesWon + (isUserWin ? 1 : 0),
    });

    updateLeaderboard('uno', currentUser.id, currentUser.username, isUserWin ? 250 : 60);

    if (isMultiplayer) {
      rewardWinner(currentUser.id).catch(console.warn);
    }
  };

  // 4 Player Positions (media_1790344676633.jpg)
  const userPlayer = players[0];
  const leftPlayer = players[1];
  const topPlayer = players[2];
  const rightPlayer = players[3];

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#407220] flex flex-col justify-between font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ═══ LUSH GARDEN PICNIC SCENERY BACKGROUND (media_1790344676633.jpg) ═══ */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,#6ba432_0%,#548b26_50%,#3d6f1a_100%)]">
        {/* Subtle grass texture & leaves overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top-Left: Straw Sun Hat with Pink Ribbon & Snail (media_1790344676633.jpg) */}
        <div className="absolute -top-6 -left-8 w-44 h-44 pointer-events-none drop-shadow-xl rotate-12">
          {/* Hat Brim */}
          <div className="w-full h-full rounded-full bg-[#fde047] border-4 border-[#eab308] shadow-inner flex items-center justify-center relative overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-[#eab308] border-2 border-[#ca8a04] shadow-md flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#fef08a]" />
            </div>
            {/* Pink Ribbon & Bow */}
            <div className="absolute inset-x-4 top-20 h-4 bg-[#f43f5e] rounded-full shadow-sm" />
            <div className="absolute top-18 left-8 w-8 h-8 rounded-full bg-[#fb7185] border-2 border-[#f43f5e] shadow-sm flex items-center justify-center text-xs">
              🎀
            </div>
          </div>
          {/* Cute Snail */}
          <div className="absolute bottom-2 right-4 text-xl">🐌</div>
        </div>

        {/* Top-Right: Cut Tree Stump with Fish Pastries Plate (media_1790344676633.jpg) */}
        <div className="absolute -top-8 -right-6 w-38 h-38 pointer-events-none drop-shadow-xl -rotate-12">
          {/* Tree slice wood base */}
          <div className="w-34 h-34 rounded-full bg-[#78350f] border-4 border-[#451a03] p-2 flex items-center justify-center shadow-2xl">
            <div className="w-full h-full rounded-full bg-[#92400e] border-2 border-[#78350f] flex items-center justify-center">
              {/* Ceramic dish with taiyaki / fish pastries */}
              <div className="w-22 h-22 rounded-full bg-[#f8fafc] border-2 border-stone-300 shadow-inner flex items-center justify-center gap-1 p-1">
                <span className="text-xl">🐟</span>
                <span className="text-sm">🥐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Leaves & Teddy Plush Accents */}
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-[#2d5212] opacity-70 blur-xs pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-[#2d5212] opacity-70 blur-xs pointer-events-none" />
      </div>

      {/* ═══ TOP BAR: BLUE MENU BUTTON & 04:51 PINK ALARM CLOCK TIMER (media_1790344676633.jpg) ═══ */}
      <div className="relative pt-[max(calc(env(safe-area-inset-top,0px)+10px),14px)] px-4 flex items-center justify-between z-30">
        {/* Left: Round Sky-Blue Menu Button */}
        <button
          onClick={() => {
            soundFX.playPop();
            onExitGame();
          }}
          className="w-10 h-10 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] border-2 border-white shadow-md flex items-center justify-center text-white active:scale-95 transition"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center: Cream Pill with Countdown & Pink Alarm Clock ⏰ (media_1790344676633.jpg) */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef9c3] border-2 border-[#fef08a] shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
          <span className="font-black text-sm tracking-wider text-[#713f12] font-mono">
            {formatTimer(matchSeconds)}
          </span>
          {/* Pink Alarm Clock */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f43f5e] to-[#fb7185] border border-white flex items-center justify-center shadow-xs text-white text-xs">
            ⏰
          </div>
        </div>

        {/* Right: Multiplayer Prize Pool or Settings */}
        <div className="flex items-center gap-1">
          {isMultiplayer && prizePool > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 border border-white/40 text-[11px] font-black text-white shadow-md">
              🏆 {Math.floor(prizePool * 0.9).toLocaleString()}🪙
            </div>
          )}
          <div className="w-8" />
        </div>
      </div>

      {/* ═══ FLOATING ACTION BANNER (UNO! NOTIFICATION) ═══ */}
      {unoBanner && (
        <div className="absolute top-22 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-sm shadow-2xl animate-bounce border-2 border-white">
          {unoBanner}
        </div>
      )}

      {/* ═══ CENTRAL PICNIC ARENA: MAT, 4 ARROWS, PLAYERS ═══ */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-auto min-h-0 z-20 px-2">
        {/* Top-Right Player (osi 🐻 - media_1790344676633.jpg) */}
        {topPlayer && (
          <div className="absolute top-2 right-6 sm:right-16 flex flex-col items-center z-20">
            {/* Yellow Card Fan */}
            <div className="relative flex -space-x-5 mb-1">
              <CardBackView size="sm" rotation={-14} />
              <CardBackView size="sm" rotation={-7} />
              <CardBackView size="sm" rotation={0} />
              <CardBackView size="sm" rotation={8} />
              <CardBackView size="sm" rotation={16} />
              {/* Dark Pill Badge with remaining card count (e.g. 13) */}
              <div className="absolute -bottom-2 -left-3 w-8 h-8 rounded-full bg-black/80 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-md">
                {topPlayer.hand.length}
              </div>
            </div>
            {/* Avatar & Name */}
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full border-2 border-amber-300 overflow-hidden shadow-lg bg-stone-800 relative ${
                  turnIndex === 2 ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                <img
                  src={topPlayer.avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'}
                  alt={topPlayer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-black text-white/90 drop-shadow mt-0.5 max-w-[70px] truncate">
                {topPlayer.name}
              </span>
            </div>
          </div>
        )}

        {/* Left Player (...C.E. - media_1790344676633.jpg) */}
        {leftPlayer && (
          <div className="absolute left-2 sm:left-6 top-[28%] flex flex-col items-center z-20">
            {/* Yellow Card Fan */}
            <div className="flex -space-x-4 mb-1">
              <CardBackView size="sm" rotation={-15} />
              <CardBackView size="sm" rotation={0} />
              <CardBackView size="sm" rotation={15} />
            </div>
            {/* Avatar & Name */}
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full border-2 border-amber-300 overflow-hidden shadow-lg bg-stone-800 relative ${
                  turnIndex === 1 ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                <img
                  src={leftPlayer.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={leftPlayer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-black text-white/90 drop-shadow mt-0.5 max-w-[65px] truncate">
                {leftPlayer.name}
              </span>
            </div>
          </div>
        )}

        {/* Right Player (Melodi Rüy... - media_1790344676633.jpg) */}
        {rightPlayer && (
          <div className="absolute right-2 sm:right-6 top-[38%] flex flex-col items-center z-20">
            {/* Yellow Card Fan */}
            <div className="flex -space-x-4 mb-1">
              <CardBackView size="sm" rotation={-15} />
              <CardBackView size="sm" rotation={0} />
              <CardBackView size="sm" rotation={15} />
            </div>
            {/* Avatar & Name */}
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full border-2 border-amber-300 overflow-hidden shadow-lg bg-stone-800 relative ${
                  turnIndex === 3 ? 'ring-4 ring-yellow-400 animate-pulse' : ''
                }`}
              >
                <img
                  src={rightPlayer.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt={rightPlayer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-black text-white/90 drop-shadow mt-0.5 max-w-[75px] truncate">
                {rightPlayer.name}
              </span>
            </div>
          </div>
        )}

        {/* ═══ CIRCULAR SCALLOPED PICNIC MAT WITH 4 BLUE ARROWS & ACTIVE CARD ═══ */}
        <ScallopedPicnicMat>
          {/* 4 Luminous Curved Sky-Blue Rotation Arrows */}
          <CurvedTurnArrows direction={direction} />

          {/* Active Discarded Card (Directly in Center) */}
          {topCard && (
            <div className="relative z-30 transform hover:scale-105 transition duration-200">
              <UnoCardView card={topCard} size="lg" rotation={topCard.tilt || 0} />
            </div>
          )}

          {/* Hidden/Subtle Draw Pile Trigger */}
          <button
            onClick={handleUserDrawCard}
            disabled={!isMyTurn}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Kart Çek"
          />
        </ScallopedPicnicMat>

        {/* Bottom-Left Player (User / FARKETMEZ - media_1790344676633.jpg) */}
        {userPlayer && (
          <div className="absolute left-6 sm:left-14 bottom-2 flex items-center gap-2 z-20">
            {/* Sunglasses / Accessory icon */}
            <div className="w-10 h-7 rounded-xl bg-gradient-to-tr from-[#38bdf8] via-[#e0f2fe] to-[#38bdf8] border-2 border-white shadow-md flex items-center justify-center text-xs font-black rotate-[-12deg]">
              🕶️
            </div>
            {/* Avatar & Name */}
            <div className="flex flex-col items-center">
              <div
                className={`w-13 h-13 rounded-full border-3 border-amber-400 overflow-hidden shadow-xl bg-stone-800 relative ${
                  isMyTurn ? 'ring-4 ring-yellow-400 shadow-yellow-500/50 animate-pulse' : ''
                }`}
              >
                {currentUser.avatarConfig ? (
                  <AvatarRenderer config={currentUser.avatarConfig} className="w-full h-full" />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="text-[11px] font-black text-white drop-shadow mt-0.5 max-w-[80px] truncate">
                {currentUser.username || 'FARKETMEZ'}
              </span>
            </div>
          </div>
        )}

        {/* ═══ 3D GOLDEN "ONE" BUTTON (media_1790344676633.jpg) ═══ */}
        <div className="absolute right-4 sm:right-10 bottom-2 z-30">
          <button
            onClick={handleCallUno}
            className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-[#b45309] to-[#78350f] p-1.5 border-2 border-[#d97706] shadow-[0_8px_16px_rgba(0,0,0,0.45)] active:scale-90 active:translate-y-1 transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {/* Inner Yellow Dome */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#fde047] via-[#facc15] to-[#ca8a04] border border-white/60 shadow-inner flex flex-col items-center justify-center p-1 relative overflow-hidden">
              {/* Top Orange Dot Pip */}
              <div className="w-3 h-3 rounded-full bg-[#f97316] shadow-xs mb-0.5 border border-white/40" />
              {/* Bold ONE Text */}
              <span className="font-black text-xs sm:text-sm tracking-wider text-[#78350f] drop-shadow-xs leading-none">
                ONE
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ═══ USER HAND CARDS FAN SECTION (media_1790344676633.jpg) ═══ */}
      <div className="relative z-30 pb-2 px-2 flex flex-col items-center">
        {/* Curved Card Fan Spread */}
        <div className="relative w-full max-w-md h-28 flex items-end justify-center overflow-visible select-none">
          {userPlayer?.hand.map((card, idx) => {
            const count = userPlayer.hand.length;
            const mid = (count - 1) / 2;
            const diff = idx - mid;
            // Ergonomic fan curve rotation (-12deg to +12deg) and vertical arch
            const rot = diff * Math.min(6, 30 / Math.max(1, count));
            const yOffset = Math.abs(diff) * 3;
            const playable = canPlayCard(card) && isMyTurn;

            return (
              <div
                key={card.id}
                style={{
                  transform: `translateX(${diff * 26}px) translateY(${yOffset}px) rotate(${rot}deg)`,
                  zIndex: idx + 10,
                }}
                className="absolute transition-transform duration-200"
              >
                <UnoCardView
                  card={card}
                  isPlayable={playable}
                  size="md"
                  onClick={() => handleUserPlayCard(card)}
                />
              </div>
            );
          })}
        </div>

        {/* ═══ BOTTOM UTILITY BAR: SPEAKER, MUTE MIC, CHAT BUBBLE (media_1790344676633.jpg) ═══ */}
        <div className="w-full max-w-md flex items-center justify-between px-3 pt-1">
          {/* Left: Green Speaker & Silver Mute Mic */}
          <div className="flex items-center gap-2">
            {/* Green Speaker Button */}
            <button
              onClick={() => {
                soundFX.playPop();
                setIsAudioMuted(!isAudioMuted);
              }}
              className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] border-2 border-white shadow-md flex items-center justify-center text-white active:scale-95 transition"
            >
              {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Silver Muted Mic Button */}
            <button
              onClick={() => {
                soundFX.playPop();
                setIsMicMuted(!isMicMuted);
              }}
              className="w-10 h-10 rounded-full bg-[#e2e8f0] hover:bg-[#cbd5e1] border-2 border-white shadow-md flex items-center justify-center text-stone-600 active:scale-95 transition"
            >
              {isMicMuted ? <MicOff className="w-5 h-5 text-stone-500" /> : <Mic className="w-5 h-5 text-[#22c55e]" />}
            </button>
          </div>

          {/* Turn status indicator */}
          <div className="px-3 py-1 rounded-full bg-black/40 border border-white/20 text-xs font-black text-amber-200">
            {isMyTurn ? '👉 Sıra Sende!' : `${players[turnIndex]?.name || 'Rakip'} oynuyor`}
          </div>

          {/* Right: Green Chat Message Bubble */}
          <button
            onClick={() => {
              soundFX.playPop();
              setShowQuickChat(!showQuickChat);
            }}
            className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] border-2 border-white shadow-md flex items-center justify-center text-white active:scale-95 transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ═══ QUICK CHAT DRAWER MODAL ═══ */}
      {showQuickChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-4 animate-in fade-in">
          <div className="bg-[#1e293b] rounded-3xl p-4 w-full max-w-sm border-2 border-emerald-500/40 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-black text-sm text-emerald-400">Hızlı Mesajlar & Emojiler</span>
              <button onClick={() => setShowQuickChat(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Hızlı oyna!', 'UNO!', 'Tebrikler! 🎉', 'Bol şans! 🍀', 'Görüşürüz 👋', 'Güzel hamle! 🔥'].map((msg) => (
                <button
                  key={msg}
                  onClick={() => {
                    soundFX.playPop();
                    setFloatingChat({ sender: currentUser.username, text: msg });
                    setShowQuickChat(false);
                    setTimeout(() => setFloatingChat(null), 3000);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 text-left text-xs font-bold text-white hover:bg-slate-700 transition"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Message Bubble */}
      {floatingChat && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-black/80 border border-white/20 text-white font-bold text-xs shadow-xl animate-in zoom-in-95">
          <span className="text-amber-400">{floatingChat.sender}: </span>
          <span>{floatingChat.text}</span>
        </div>
      )}

      {/* ═══ 3D 4-QUADRANT COLOR PICKER MODAL (WILD / WILD4) ═══ */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900/95 rounded-3xl p-6 border-2 border-amber-500/40 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Bir Renk Seçin</span>
            </h3>

            {/* Circular 4-Quadrant Color Wheel */}
            <div className="relative w-44 h-44 mx-auto rounded-full p-2 bg-gradient-to-br from-amber-700 to-amber-950 border-4 border-amber-500 flex flex-wrap overflow-hidden shadow-xl">
              {(['red', 'blue', 'yellow', 'green'] as CardColor[]).map((color, idx) => {
                const quadrantClasses = [
                  'rounded-tl-full border-r-2 border-b-2 bg-[#f43f5e]', // red
                  'rounded-tr-full border-l-2 border-b-2 bg-[#0284c7]', // blue
                  'rounded-bl-full border-r-2 border-t-2 bg-[#eab308]', // yellow
                  'rounded-br-full border-l-2 border-t-2 bg-[#65a30d]', // green
                ][idx];
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setShowColorPicker(false);
                      soundFX.playCardFlip();
                      if (pendingWildCard) {
                        executePlayCard(myIndex, pendingWildCard, color);
                        setPendingWildCard(null);
                      }
                    }}
                    className={`w-1/2 h-1/2 ${quadrantClasses} border-white/40 flex items-center justify-center font-black text-white text-xs uppercase tracking-wider transition hover:scale-105 active:scale-95 shadow-inner cursor-pointer`}
                  >
                    {color === 'red' ? 'Kırmızı' : color === 'blue' ? 'Mavi' : color === 'green' ? 'Yeşil' : 'Sarı'}
                  </button>
                );
              })}
              {/* Center UNO Pip */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950 border-2 border-amber-400 shadow-xl flex items-center justify-center font-black text-[10px] text-amber-300 pointer-events-none">
                UNO
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ GAME OVER MODAL ═══ */}
      {gameState === 'game_over' && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-amber-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {winner?.id === currentUser.id ? '🏆 UNO Şampiyonu!' : 'Oyun Bitti!'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Kazanan: <span className="text-yellow-400 font-bold">{winner?.name}</span>
            </p>

            <div className="w-full bg-slate-800/60 rounded-2xl p-4 mb-6 border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan Jeton</span>
                <span className="text-sm font-black text-yellow-400">
                  +{winner?.id === currentUser.id ? 250 : 60} 🪙
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan TP</span>
                <span className="text-sm font-black text-blue-400">+200 XP</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={onExitGame}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs transition active:scale-95"
              >
                Lobiye Dön
              </button>
              <button
                onClick={initGame}
                className="py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-lg shadow-red-500/30"
              >
                Tekrar Oyna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
