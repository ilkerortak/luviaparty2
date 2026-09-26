import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ArrowLeft, Trophy, Users, RefreshCw, Sparkles, Shield, Swords } from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateLeaderboard } from '../../services/leaderboardService';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface JackarooProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

type Team = 'A' | 'B';
type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';
type CardSuit = '♠' | '♥' | '♦' | '♣';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  id: string;
  suit: CardSuit;
  value: CardValue;
  desc: string;
}

interface Marble {
  id: string;
  color: PlayerColor;
  status: 'base' | 'track' | 'home';
  position: number; // 0-63 for track, 0-3 for home
}

interface Player {
  color: PlayerColor;
  team: Team;
  name: string;
  isBot: boolean;
  avatarConfig?: any;
  hand: Card[];
  marbles: Marble[];
}

const TRACK_LENGTH = 64;
const START_POSITIONS: Record<PlayerColor, number> = { red: 0, blue: 16, yellow: 32, green: 48 };

const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];
const VALUES: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getCardDescription = (val: CardValue): string => {
  switch (val) {
    case 'A': return 'Çıkış veya 1/11 İlerle';
    case 'K': return 'Çıkış veya 13 Ezici İlerle';
    case 'Q': return '12 Adım İlerle';
    case 'J': return 'İki Taşın Yerini Değiş';
    case '4': return '4 Adım GERİ Git!';
    case '7': return '7 Adımı İkiye Böl';
    default: return `${val} Adım İlerle`;
  }
};

const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  let id = 1;
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ id: `c${id++}`, suit, value, desc: getCardDescription(value) });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const INITIAL_MARBLES = (color: PlayerColor): Marble[] =>
  Array.from({ length: 4 }).map((_, i) => ({ id: `${color}-${i}`, color, status: 'base', position: -1 }));

export const JackarooGame: React.FC<JackarooProps> = ({ currentUser, onUpdateUser, onExitGame, roomId }) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const activeCount = Math.max(2, isMultiplayer && rtdbPlayers.length > 0 ? rtdbPlayers.length : 2);
  const turnOrder: PlayerColor[] = activeCount === 2 ? ['red', 'blue'] : ['red', 'blue', 'yellow', 'green'];

  const mySlotIndex = isMultiplayer && rtdbPlayers.length > 0
    ? Math.max(0, rtdbPlayers.findIndex(p => p.userId === currentUser.id))
    : 0;
  const myColor: PlayerColor = turnOrder[mySlotIndex] || 'red';
  const myTeam: Team = (myColor === 'red' || myColor === 'yellow') ? 'A' : 'B';

  const getPlayerInit = (color: PlayerColor, idx: number): Player => {
    const team: Team = (color === 'red' || color === 'yellow') ? 'A' : 'B';
    if (isMultiplayer && rtdbPlayers[idx]) {
      const rp = rtdbPlayers[idx];
      return {
        color,
        team,
        name: rp.userId === currentUser.id ? `${rp.username} (Sen)` : rp.username,
        isBot: false,
        avatarConfig: rp.avatarConfig,
        hand: [],
        marbles: INITIAL_MARBLES(color),
      };
    }
    if (idx === 0) {
      return {
        color,
        team,
        name: `${currentUser.username} (Sen)`,
        isBot: false,
        avatarConfig: currentUser.avatarConfig,
        hand: [],
        marbles: INITIAL_MARBLES(color),
      };
    }
    return {
      color,
      team,
      name: `Oyuncu ${idx + 1}`,
      isBot: false,
      avatarConfig: { skinColor: '#FEE3D4', hairStyle: 'messy', hairColor: '#3b82f6', eyeStyle: 'cool', mouthStyle: 'smile', outfit: 'hoodie', outfitColor: '#6366f1', accessory: 'none', frame: 'none' } as any,
      hand: [],
      marbles: INITIAL_MARBLES(color),
    };
  };

  const [players, setPlayers] = useState<Record<PlayerColor, Player>>(() => ({
    red: getPlayerInit('red', 0),
    blue: getPlayerInit('blue', 1),
    yellow: getPlayerInit('yellow', 2),
    green: getPlayerInit('green', 3),
  }));

  const [turnIndex, setTurnIndex] = useState<number>(0);
  const currentTurnColor = turnOrder[turnIndex];
  const isMyTurn = currentTurnColor === myColor;

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [swapFirstMarble, setSwapFirstMarble] = useState<Marble | null>(null);
  const [log, setLog] = useState<string>('Jackaroo başladı! Kartlar dağıtıldı.');
  const [gameOver, setGameOver] = useState<Team | null>(null);

  // Host initializes game & deck
  useEffect(() => {
    if (!isMultiplayer || isRoomHost) {
      startNewRound(generateDeck());
    }
  }, [isMultiplayer, isRoomHost]);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.players) setPlayers(remoteState.players);
    if (remoteState.deck) setDeck(remoteState.deck);
    if (remoteState.discardPile) setDiscardPile(remoteState.discardPile);
    if (remoteState.turnIndex !== undefined) setTurnIndex(remoteState.turnIndex);
    if (remoteState.log) setLog(remoteState.log);
    if (remoteState.gameOver !== undefined) setGameOver(remoteState.gameOver);
  }, [remoteState, isMultiplayer]);

  const startNewRound = (currentDeck: Card[]) => {
    let newDeck = [...currentDeck];
    if (newDeck.length < 16) {
      newDeck = generateDeck();
      setDiscardPile([]);
    }

    const nextPlayers: Record<PlayerColor, Player> = { ...players };
    turnOrder.forEach((color, idx) => {
      const p = players[color] || getPlayerInit(color, idx);
      nextPlayers[color] = {
        ...p,
        hand: newDeck.splice(0, 4)
      };
    });

    setPlayers(nextPlayers);
    setDeck(newDeck);
    const newLog = 'Yeni tur! 4 kart dağıtıldı.';
    setLog(newLog);

    if (isMultiplayer) {
      pushState({
        deck: newDeck,
        discardPile: [],
        players: nextPlayers,
        turnIndex: 0,
        log: newLog,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const getTeamScore = (team: Team) => {
    return Object.values(players)
      .filter(p => p.team === team)
      .flatMap(p => p.marbles)
      .filter(m => m.status === 'home').length;
  };

  const checkWin = () => {
    const target = turnOrder.length === 2 ? 4 : 8;
    if (getTeamScore('A') >= target) {
      handleGameOver('A');
    } else if (getTeamScore('B') >= target) {
      handleGameOver('B');
    }
  };

  const handleGameOver = (team: Team) => {
    setGameOver(team);
    const isWin = team === myTeam;
    if (isWin) {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      const coins = isMultiplayer ? Math.floor(prizePool * 0.9) : 250;
      onUpdateUser({
        ...currentUser,
        coins: currentUser.coins + coins,
        exp: currentUser.exp + 200,
        gamesPlayed: currentUser.gamesPlayed + 1,
        gamesWon: currentUser.gamesWon + 1
      });
      if (isMultiplayer) rewardWinner(currentUser.id).catch(console.warn);
      updateLeaderboard('jackaroo', currentUser.id, currentUser.username, 250);
    } else {
      soundFX.playError();
      onUpdateUser({
        ...currentUser,
        coins: currentUser.coins + 60,
        exp: currentUser.exp + 50,
        gamesPlayed: currentUser.gamesPlayed + 1
      });
    }

    if (isMultiplayer) {
      pushState({
        gameOver: team,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const applyMarbleMove = (currentPlayers: Record<PlayerColor, Player>, marbleId: string, newPos: number, newStatus: 'base' | 'track' | 'home', activeColor: PlayerColor) => {
    const next = { ...currentPlayers };
    if (newStatus === 'track') {
      for (const color of turnOrder) {
        const opponentMarbles = next[color].marbles;
        const capturedIdx = opponentMarbles.findIndex(om => om.status === 'track' && om.position === newPos);
        if (capturedIdx !== -1 && color !== activeColor) {
          next[color].marbles[capturedIdx] = { ...opponentMarbles[capturedIdx], status: 'base', position: -1 };
          soundFX.playStampSlam();
        }
      }
    }
    for (const color of turnOrder) {
      const mIdx = next[color].marbles.findIndex(m => m.id === marbleId);
      if (mIdx !== -1) {
        next[color].marbles[mIdx] = { ...next[color].marbles[mIdx], status: newStatus, position: newPos };
      }
    }
    return next;
  };

  const nextTurn = (customPlayers?: Record<PlayerColor, Player>, customDiscard?: Card[], newLogMsg?: string) => {
    const pList = customPlayers || players;
    const dList = customDiscard || discardPile;
    const nextIdx = (turnIndex + 1) % turnOrder.length;
    setTurnIndex(nextIdx);

    const allEmpty = Object.values(pList).every(p => p.hand.length === 0);
    if (allEmpty) {
      if (!isMultiplayer || isRoomHost) {
        setTimeout(() => startNewRound(deck), 1000);
      }
    }

    if (isMultiplayer) {
      pushState({
        players: pList,
        discardPile: dList,
        turnIndex: nextIdx,
        log: newLogMsg || log,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const moveMarble = (marbleId: string, newPos: number, newStatus: 'base' | 'track' | 'home') => {
    soundFX.playPawnHop();
    const next = applyMarbleMove(players, marbleId, newPos, newStatus, myColor);
    setPlayers(next);
    checkWin();
    return next;
  };

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return;
    soundFX.playCardFlip();
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleMarbleClick = (marble: Marble) => {
    if (!isMyTurn || !selectedCard) return;

    // Release from base with A or K
    if (marble.status === 'base' && (selectedCard.value === 'A' || selectedCard.value === 'K') && marble.color === myColor) {
      const next = moveMarble(marble.id, START_POSITIONS[myColor], 'track');
      finalizeMove(selectedCard, next);
      return;
    }

    // Normal move forward on track
    if (marble.status === 'track') {
      if (selectedCard.value === 'J') {
        if (!swapFirstMarble) {
          setSwapFirstMarble(marble);
          setLog('Değiştirmek istediğin ikinci miskete dokun.');
          return;
        } else {
          const pos1 = swapFirstMarble.position;
          const pos2 = marble.position;
          let next = moveMarble(swapFirstMarble.id, pos2, 'track');
          next = moveMarble(marble.id, pos1, 'track');
          setSwapFirstMarble(null);
          finalizeMove(selectedCard, next);
          return;
        }
      }

      let steps = parseInt(selectedCard.value) || 1;
      if (selectedCard.value === 'A') steps = 1;
      if (selectedCard.value === 'K') steps = 13;
      if (selectedCard.value === 'Q') steps = 12;
      if (selectedCard.value === '4') steps = -4;

      const newPos = (marble.position + steps + TRACK_LENGTH) % TRACK_LENGTH;
      const next = moveMarble(marble.id, newPos, 'track');
      finalizeMove(selectedCard, next);
    }
  };

  const finalizeMove = (card: Card, customPlayers?: Record<PlayerColor, Player>) => {
    const nextDiscard = [...discardPile, card];
    setDiscardPile(nextDiscard);
    const baseP = customPlayers || players;
    const nextPlayers = {
      ...baseP,
      [myColor]: { ...baseP[myColor], hand: baseP[myColor].hand.filter(c => c.id !== card.id) }
    };
    setPlayers(nextPlayers);
    setSelectedCard(null);
    setSwapFirstMarble(null);
    const newLogMsg = `${players[myColor].name} (${card.value}) oynadı.`;
    setLog(newLogMsg);
    nextTurn(nextPlayers, nextDiscard, newLogMsg);
  };

  const discardCard = () => {
    if (!selectedCard || !isMyTurn) return;
    finalizeMove(selectedCard);
    setLog('Kart oynanamadığı için elden çıkarıldı.');
  };

  const renderTrackDot = (index: number) => {
    const angle = (index * (360 / TRACK_LENGTH) - 90) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const marblesHere = Object.values(players).flatMap(p => p.marbles).filter(m => m.status === 'track' && m.position === index);

    const isStartRed = index === START_POSITIONS.red;
    const isStartBlue = index === START_POSITIONS.blue;
    const isStartYellow = index === START_POSITIONS.yellow;
    const isStartGreen = index === START_POSITIONS.green;

    return (
      <div
        key={`track-${index}`}
        className={`absolute w-3.5 h-3.5 rounded-full border border-amber-500/40 flex items-center justify-center transition-all shadow-inner ${
          isStartRed ? 'bg-red-500/50 ring-1 ring-red-400' :
          isStartBlue ? 'bg-blue-500/50 ring-1 ring-blue-400' :
          isStartYellow ? 'bg-amber-400/50 ring-1 ring-amber-300' :
          isStartGreen ? 'bg-emerald-500/50 ring-1 ring-emerald-400' :
          'bg-stone-950/80'
        }`}
        style={{
          left: `${50 + cos * 41}%`,
          top: `${50 + sin * 41}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {marblesHere.map((m) => (
          <div
            key={m.id}
            onClick={() => handleMarbleClick(m)}
            className={`absolute w-5 h-5 rounded-full border border-white/70 shadow-[0_6px_10px_rgba(0,0,0,0.8)] cursor-pointer transform hover:scale-130 z-20 transition-all ${
              m.id === swapFirstMarble?.id ? 'animate-bounce ring-4 ring-yellow-400 scale-125' : ''
            }`}
            style={{
              background: m.color === 'red'
                ? 'radial-gradient(circle at 30% 30%, #ffffff 0%, #ef4444 45%, #7f1d1d 100%)'
                : m.color === 'blue'
                ? 'radial-gradient(circle at 30% 30%, #ffffff 0%, #3b82f6 45%, #1e3a8a 100%)'
                : m.color === 'yellow'
                ? 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f59e0b 45%, #78350f 100%)'
                : 'radial-gradient(circle at 30% 30%, #ffffff 0%, #10b981 45%, #064e3b 100%)',
            }}
          >
            {/* 3D Specular Highlight */}
            <div className="w-1.5 h-1.5 rounded-full bg-white/90 absolute top-0.5 left-1 pointer-events-none" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d17] text-white select-none overflow-hidden relative font-sans">
      {/* Top Header with Safe Area Notch Clearance */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] bg-slate-900/95 backdrop-blur border-b border-slate-800/80 flex-shrink-0 z-20 shadow-md">
        <button onClick={onExitGame} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 active:scale-95 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" />
          <span className="font-black text-sm text-amber-400 uppercase tracking-wider">Jackaroo Arena</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-black">
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            A: {getTeamScore('A')}
          </span>
          <span className="text-slate-500">vs</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            B: {getTeamScore('B')}
          </span>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-between p-2 relative min-h-0">
        {/* Opponent Melisa (Partner Team A) */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400">
            <AvatarRenderer config={players.yellow.avatarConfig} className="w-full h-full" />
          </div>
          <span className="text-xs font-bold text-amber-300">{players.yellow.name} (Ortağın)</span>
        </div>

        {/* Circular 3D Luxury Mahogany Board */}
        <div
          style={{ perspective: '900px' }}
          className="w-full flex items-center justify-center shrink-0 my-auto py-1"
        >
          <div
            style={{
              transform: 'rotateX(15deg) translateY(-2px)',
              transformStyle: 'preserve-3d',
            }}
            className="w-[min(76vw,36vh,270px)] h-[min(76vw,36vh,270px)] rounded-full bg-[radial-gradient(circle_at_35%_35%,#452311_0%,#271308_70%,#150904_100%)] border-4 border-[#85512d] shadow-[0_20px_0_#1b0e06,0_26px_0_#0d0703,0_34px_50px_rgba(0,0,0,0.9),inset_0_3px_6px_rgba(255,255,255,0.25)] relative shrink-0 flex items-center justify-center"
          >
            {/* Inner Inscribed Ring */}
            <div className="w-[85%] h-[85%] rounded-full border border-amber-600/30 pointer-events-none" />

            {/* Center Discard Pile in 3D */}
            {discardPile.length > 0 && (
              <div
                style={{
                  transformStyle: 'preserve-3d',
                }}
                className="absolute w-12 h-16 rounded-xl bg-gradient-to-b from-white to-slate-100 text-slate-900 border border-white shadow-[0_8px_0_#94a3b8,0_14px_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-1 rotate-6 z-10"
              >
                <span className={`text-xs font-black ${['♥', '♦'].includes(discardPile[discardPile.length - 1].suit) ? 'text-red-600' : 'text-slate-900'}`}>
                  {discardPile[discardPile.length - 1].value}
                </span>
                <span className={`text-sm ${['♥', '♦'].includes(discardPile[discardPile.length - 1].suit) ? 'text-red-600' : 'text-slate-900'}`}>
                  {discardPile[discardPile.length - 1].suit}
                </span>
              </div>
            )}

            {/* 64 Track Dots */}
            {Array.from({ length: TRACK_LENGTH }).map((_, i) => renderTrackDot(i))}
          </div>
        </div>

        {/* Status Log Banner */}
        <div className="py-1.5 px-4 rounded-full bg-slate-900/90 border border-white/10 text-xs font-bold text-center max-w-sm w-full shadow-md">
          <span className={currentTurnColor === 'red' ? 'text-amber-400' : 'text-slate-400'}>
            {currentTurnColor === 'red' ? '👉 Sıra Sende! Kartını seç ve miskete dokun' : `${players[currentTurnColor].name} hamle yapıyor...`}
          </span>
          <div className="text-[10px] text-slate-400 mt-0.5">{log}</div>
        </div>
      </div>

      {/* User Hand Tray with 3D Tactile Cards */}
      <div className="bg-slate-900 border-t border-slate-800 p-2.5 flex flex-col flex-shrink-0 z-20">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Eldeki Kartların ({myColor.toUpperCase()} - Takım {myTeam})</span>
          {selectedCard && isMyTurn && (
            <button
              onClick={discardCard}
              className="text-[11px] font-bold px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full hover:bg-rose-500/30 active:scale-95 transition"
            >
              Kartı Yak / At 🗑️
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 justify-center min-h-[96px]">
          {(players[myColor]?.hand || []).map((card, idx, arr) => {
            const isSelected = selectedCard?.id === card.id;
            const isHeartOrDiamond = ['♥', '♦'].includes(card.suit);
            const fanAngle = (idx - (arr.length - 1) / 2) * 5;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                style={{
                  transform: `rotate(${fanAngle}deg) translateY(${isSelected ? '-14px' : '0px'})`,
                  transformStyle: 'preserve-3d',
                }}
                className={`w-16 h-24 rounded-2xl p-1.5 flex flex-col justify-between border transition-all duration-200 cursor-pointer bg-gradient-to-b from-white to-slate-100 text-slate-900 select-none relative overflow-hidden ${
                  isSelected
                    ? 'ring-4 ring-amber-400 border-amber-400 scale-110 shadow-[0_12px_0_#b45309,0_16px_25px_rgba(245,158,11,0.5)] z-20'
                    : 'border-slate-200 shadow-[0_6px_0_#cbd5e1,0_8px_14px_rgba(0,0,0,0.3)] hover:-translate-y-2'
                }`}
              >
                {/* 3D Gloss Sheen Stripe */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <span className={`text-xs font-black ${isHeartOrDiamond ? 'text-red-600' : 'text-slate-900'}`}>{card.value}</span>
                  <span className={`text-xs ${isHeartOrDiamond ? 'text-red-600' : 'text-slate-900'}`}>{card.suit}</span>
                </div>

                <span className="text-[8px] font-bold text-center leading-tight text-slate-600 line-clamp-2 relative z-10">
                  {card.desc}
                </span>

                <span className={`text-[10px] font-black text-right relative z-10 ${isHeartOrDiamond ? 'text-red-600' : 'text-slate-900'}`}>
                  {card.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-amber-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {gameOver === myTeam ? '🏆 Tebrikler Kazandınız!' : 'Oyun Bitti!'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {gameOver === myTeam ? `Takım ${myTeam} şampiyon oldu!` : `Takım ${gameOver} oyunu kazandı.`}
            </p>

            <div className="w-full bg-slate-800/60 rounded-2xl p-4 mb-6 border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan Jeton</span>
                <span className="text-sm font-black text-yellow-400">+{gameOver === myTeam ? (isMultiplayer ? Math.floor(prizePool * 0.9) : 250) : 60} 🪙</span>
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
                onClick={() => {
                  setGameOver(null);
                  startNewRound(generateDeck());
                }}
                className="py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-lg shadow-amber-500/30"
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
