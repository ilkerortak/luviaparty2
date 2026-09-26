import React, { useRef, useState, useEffect } from 'react';
import type { User } from '../../types';
import { updateLeaderboard } from '../../services/leaderboardService';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Eraser,
  Trash2,
  Send,
  Trophy,
  Clock,
  Sparkles,
  Undo2,
  Paintbrush
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface DrawAndGuessProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatarConfig?: any;
  text: string;
  isCorrect?: boolean;
}

const USER_WORD_CHOICES = [
  { word: 'GİTAR', category: 'Müzik 🎸' },
  { word: 'ROKET', category: 'Uzay 🚀' },
  { word: 'KÖPEK', category: 'Hayvanlar 🐶' },
  { word: 'UÇAK', category: 'Araçlar ✈️' },
  { word: 'DONDURMA', category: 'Yiyecek 🍦' },
  { word: 'PİZZA', category: 'Yiyecek 🍕' },
  { word: 'GÜNEŞ', category: 'Doğa ☀️' },
  { word: 'KEDİ', category: 'Hayvanlar 🐾' },
  { word: 'EV', category: 'Yapılar 🏠' },
  { word: 'TELEFON', category: 'Teknoloji 📱' },
  { word: 'ARABA', category: 'Araçlar 🚗' },
  { word: 'BALIK', category: 'Hayvanlar 🐟' },
  { word: 'KİTAP', category: 'Eğitim 📚' },
];

const COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#78350f', '#64748b'
];

export const DrawAndGuess: React.FC<DrawAndGuessProps> = ({
  currentUser,
  onUpdateUser,
  onExitGame,
  roomId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentRound, setCurrentRound] = useState(1);

  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const gamePlayers = isMultiplayer && rtdbPlayers.length > 0
    ? rtdbPlayers.map(p => ({
        id: p.userId,
        name: p.username,
        avatar: p.avatarConfig,
        isMe: p.userId === currentUser.id
      }))
    : [
        { id: currentUser.id, name: currentUser.username, avatar: currentUser.avatarConfig, isMe: true }
      ];

  const MAX_ROUNDS = Math.max(gamePlayers.length, 2);
  const currentDrawerPlayer = gamePlayers[(currentRound - 1) % gamePlayers.length];
  const isUserDrawing = currentDrawerPlayer?.id === currentUser.id;
  const currentDrawerName = currentDrawerPlayer?.name || currentUser.username;

  // Word & category
  const [targetWord, setTargetWord] = useState('GİTAR');
  const [targetCategory, setTargetCategory] = useState('Müzik 🎸');
  const [wordChoices, setWordChoices] = useState<typeof USER_WORD_CHOICES>([]);
  const [isChoosingWord, setIsChoosingWord] = useState(true);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [brushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [undoHistory, setUndoHistory] = useState<ImageData[]>([]);
  const strokeBufferRef = useRef<{ x: number; y: number }[]>([]);

  // Timer & Phase
  const [timeLeft, setTimeLeft] = useState(50);
  const [gamePhase, setGamePhase] = useState<'playing' | 'round_end' | 'game_over'>('playing');

  // Chat & Guesses
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Luvia', text: '🎨 Çiz ve Tahmin Et başladı! Çizen oyuncu belirleniyor.' }
  ]);
  const [inputGuess, setInputGuess] = useState('');
  const [userGuessedCorrect, setUserGuessedCorrect] = useState(false);

  // Scores
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const sc: Record<string, number> = {};
    gamePlayers.forEach(p => { sc[p.name] = 0; });
    return sc;
  });

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Host initializes round 1
  useEffect(() => {
    if (!isMultiplayer || isRoomHost) {
      initRound(1);
    }
  }, [isMultiplayer, isRoomHost]);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.currentRound !== undefined && remoteState.currentRound !== currentRound) {
      setCurrentRound(remoteState.currentRound);
      setUserGuessedCorrect(false);
      clearCanvasLocally();
    }
    if (remoteState.targetWord) setTargetWord(remoteState.targetWord);
    if (remoteState.targetCategory) setTargetCategory(remoteState.targetCategory);
    if (remoteState.isChoosingWord !== undefined) setIsChoosingWord(remoteState.isChoosingWord);
    if (remoteState.timeLeft !== undefined && !isRoomHost) setTimeLeft(remoteState.timeLeft);
    if (remoteState.gamePhase) setGamePhase(remoteState.gamePhase);
    if (remoteState.scores) setScores(remoteState.scores);
  }, [remoteState, isMultiplayer, isRoomHost, currentRound]);

  // Sync live remote drawing strokes onto local canvas
  useEffect(() => {
    if (!isMultiplayer || isUserDrawing || !remoteState?.remoteStroke) return;
    const stroke = remoteState.remoteStroke;
    const canvas = canvasRef.current;
    if (!canvas || !stroke.points || stroke.points.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, [remoteState?.remoteStroke, isMultiplayer, isUserDrawing]);

  // Sync clear canvas action
  useEffect(() => {
    if (!isMultiplayer || isUserDrawing || !remoteState?.clearCanvasAction) return;
    clearCanvasLocally();
  }, [remoteState?.clearCanvasAction, isMultiplayer, isUserDrawing]);

  // Sync remote chat guesses
  useEffect(() => {
    if (!isMultiplayer || !remoteState?.newGuess) return;
    const g = remoteState.newGuess;
    if (g.sender !== currentUser.username) {
      setMessages(prev => {
        if (prev.some(m => m.id === g.id)) return prev;
        return [...prev, g];
      });
      if (g.isCorrect) {
        soundFX.playSuccess();
      }
    }
  }, [remoteState?.newGuess, isMultiplayer, currentUser.username]);

  const initRound = (roundNum: number) => {
    setCurrentRound(roundNum);
    setTimeLeft(50);
    setUserGuessedCorrect(false);
    setGamePhase('playing');
    clearCanvasLocally();

    const drawer = gamePlayers[(roundNum - 1) % gamePlayers.length];

    if (drawer?.id === currentUser.id) {
      setIsChoosingWord(true);
      const shuffled = [...USER_WORD_CHOICES].sort(() => Math.random() - 0.5);
      setWordChoices(shuffled.slice(0, 3));
    } else {
      setIsChoosingWord(true); // Waiting for the human drawer to choose
    }

    if (isMultiplayer && isRoomHost) {
      pushState({
        currentRound: roundNum,
        gamePhase: 'playing',
        isChoosingWord: true,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const handleSelectWord = (choice: { word: string; category: string }) => {
    setTargetWord(choice.word);
    setTargetCategory(choice.category);
    setIsChoosingWord(false);
    soundFX.playPop();
    const selectMsg = { id: Date.now().toString(), sender: 'Luvia', text: `🖌️ ${currentUser.username} kelimesini seçti, çizim başladı!` };
    setMessages(prev => [...prev, selectMsg]);

    if (isMultiplayer) {
      pushState({
        targetWord: choice.word,
        targetCategory: choice.category,
        isChoosingWord: false,
        newGuess: selectMsg,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  // Canvas Helpers
  const clearCanvasLocally = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1e2238';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setUndoHistory([]);
  };

  const clearCanvas = () => {
    clearCanvasLocally();
    if (isMultiplayer && isUserDrawing) {
      pushState({ clearCanvasAction: true, actionSeq: Date.now() }).catch(console.warn);
    }
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoHistory(prev => [...prev.slice(-10), data]);
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    soundFX.playPop();
    const previous = undoHistory[undoHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setUndoHistory(prev => prev.slice(0, -1));
  };

  // Round Timer (Only Host counts down in multiplayer)
  useEffect(() => {
    if (gamePhase !== 'playing' || isChoosingWord) return;
    if (isMultiplayer && !isRoomHost) return;

    if (timeLeft <= 0) {
      handleRoundEnd();
      return;
    }

    const t = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = prev - 1;
        if (isMultiplayer && nextTime % 5 === 0) {
          pushState({ timeLeft: nextTime, actionSeq: Date.now() }).catch(console.warn);
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [timeLeft, gamePhase, isChoosingWord, isMultiplayer, isRoomHost]);

  const handleRoundEnd = () => {
    setGamePhase('round_end');
    soundFX.playPop();

    if (isMultiplayer) {
      pushState({ gamePhase: 'round_end', actionSeq: Date.now() }).catch(console.warn);
    }

    if (currentRound >= MAX_ROUNDS) {
      setTimeout(() => {
        handleGameOver();
      }, 3000);
    } else {
      setTimeout(() => {
        initRound(currentRound + 1);
      }, 3500);
    }
  };

  const handleGameOver = () => {
    setGamePhase('game_over');
    soundFX.playGiftFanfare();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const isWinner = sorted[0]?.[0] === currentUser.username;
    const coinsReward = isMultiplayer
      ? (isWinner ? Math.floor(prizePool * 0.9) : 75)
      : (isWinner ? 200 : 75);
    const expReward = 150;

    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + coinsReward,
      exp: currentUser.exp + expReward,
      gamesPlayed: currentUser.gamesPlayed + 1,
      gamesWon: currentUser.gamesWon + (isWinner ? 1 : 0),
    });

    if (isMultiplayer) {
      if (isWinner) rewardWinner(currentUser.id).catch(console.warn);
      pushState({ gamePhase: 'game_over', actionSeq: Date.now() }).catch(console.warn);
    }

    updateLeaderboard('draw_guess', currentUser.id, currentUser.username, isWinner ? 200 : 75);
  };

  // User Guess submit
  const handleSendGuess = () => {
    if (!inputGuess.trim() || userGuessedCorrect) return;

    const text = inputGuess.trim();
    const isCorrect = text.toLocaleUpperCase('tr-TR') === targetWord.toLocaleUpperCase('tr-TR');

    if (isCorrect) {
      soundFX.playSuccess();
    } else {
      soundFX.playPop();
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser.username,
      avatarConfig: currentUser.avatarConfig,
      text: isCorrect ? '🎉 Doğru kelimeyi bildi!' : text,
      isCorrect,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputGuess('');

    let nextScores = { ...scores };
    if (isCorrect) {
      soundFX.playSuccess();
      confetti({ particleCount: 70, spread: 60 });
      setUserGuessedCorrect(true);
      nextScores = {
        ...scores,
        [currentUser.username]: (scores[currentUser.username] || 0) + 120,
        [currentDrawerName]: (scores[currentDrawerName] || 0) + 40,
      };
      setScores(nextScores);
    }

    if (isMultiplayer) {
      pushState({
        newGuess: newMsg,
        scores: nextScores,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const flushStrokeBuffer = () => {
    if (strokeBufferRef.current.length < 2) return;
    const pts = [...strokeBufferRef.current];
    strokeBufferRef.current = [pts[pts.length - 1]];
    pushState({
      remoteStroke: {
        color: isEraser ? '#1e2238' : selectedColor,
        size: brushSize,
        points: pts,
      },
      actionSeq: Date.now(),
    }).catch(console.warn);
  };

  // Mouse / Touch drawing events for User
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isUserDrawing || isChoosingWord) return;
    saveCanvasState();
    setIsDrawing(true);
    strokeBufferRef.current = [];
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (isMultiplayer) {
      flushStrokeBuffer();
      strokeBufferRef.current = [];
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isUserDrawing || isChoosingWord) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = Math.round(((clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((clientY - rect.top) / rect.height) * canvas.height);

    ctx.strokeStyle = isEraser ? '#1e2238' : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isMultiplayer) {
      strokeBufferRef.current.push({ x, y });
      if (strokeBufferRef.current.length >= 4) {
        flushStrokeBuffer();
      }
    }
  };

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Masked word hint for guessing
  const maskedWord = targetWord.split('').map((char, idx) => {
    if (userGuessedCorrect || isUserDrawing) return char;
    if (idx === 0 || (idx === 2 && targetWord.length > 4)) return char;
    return '_';
  }).join(' ');

  return (
    <div className="flex flex-col h-full bg-[#0d111e] text-white select-none overflow-hidden relative">
      {/* Top Header with Safe Area Notch Clearance */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] bg-slate-900/95 backdrop-blur border-b border-slate-800/80 flex-shrink-0 z-20 shadow-md">
        <button onClick={onExitGame} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 active:scale-95 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-pink-400" />
          <span className="font-black text-sm text-pink-400 uppercase tracking-wider">Çiz & Tahmin Et</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-slate-300">
            Tur {currentRound}/{MAX_ROUNDS}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Players Progress Bar */}
      <div className="grid grid-cols-4 gap-2 px-3 py-1.5 bg-slate-900/50 border-b border-white/5 flex-shrink-0">
        {gamePlayers.map((p, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 p-1 rounded-xl transition ${
              currentDrawerName === p.name ? 'bg-pink-500/20 ring-1 ring-pink-400' : 'bg-white/5'
            }`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-white/20 shadow-sm">
              <AvatarRenderer config={p.avatar} className="w-full h-full" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-white block truncate leading-none">{p.isMe ? `${p.name} (Sen)` : p.name}</span>
              <span className="text-[9px] text-amber-300 font-mono font-bold leading-none">{scores[p.name] || 0}p</span>
            </div>
          </div>
        ))}
      </div>

      {/* Word Hint Banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40">
        <span className="text-xs text-indigo-300 font-medium">
          Kategori: <strong className="text-white">{targetCategory}</strong>
        </span>
        <div className="flex items-center gap-2">
          {isUserDrawing ? (
            <span className="px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-black tracking-widest uppercase shadow-sm">
              Çizilecek: {targetWord}
            </span>
          ) : (
            <span className="px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black tracking-widest font-mono shadow-sm">
              {maskedWord} ({targetWord.length} harf)
            </span>
          )}
        </div>
      </div>

      {/* Main 3D Studio Easel & Canvas */}
      <div
        style={{ perspective: '850px' }}
        className="relative flex-1 flex flex-col items-center justify-center p-2 min-h-0 bg-[#0a0d17]"
      >
        <div
          style={{
            transform: 'rotateX(6deg) translateY(-2px)',
            transformStyle: 'preserve-3d',
          }}
          className="relative p-2.5 rounded-3xl bg-gradient-to-b from-[#3a2012] via-[#24130a] to-[#140a05] border-4 border-[#783e1d] shadow-[0_18px_0_#1b0d06,0_24px_0_#0a0502,0_32px_45px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] shrink-0"
        >
          {/* Top Easel Peg & Clamp */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-gradient-to-b from-amber-600 to-amber-900 rounded-t-lg border border-amber-400/60 shadow-md flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-amber-300 shadow-inner" />
          </div>

          {/* 3D Easel Tripod Legs Beneath */}
          <div className="absolute -bottom-6 left-6 w-3 h-8 bg-amber-950/80 rounded-b shadow-md transform -rotate-12 pointer-events-none" />
          <div className="absolute -bottom-6 right-6 w-3 h-8 bg-amber-950/80 rounded-b shadow-md transform rotate-12 pointer-events-none" />
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-3.5 h-9 bg-amber-950/60 rounded-b shadow-md pointer-events-none" />

          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-[min(82vw,33vh,290px)] h-[min(82vw,33vh,290px)] aspect-square rounded-2xl shadow-inner border border-black/40 touch-none bg-[#181d33] cursor-crosshair shrink-0 relative z-10"
          />
        </div>

        {/* Word Choice Modal for User Drawer */}
        {isChoosingWord && isUserDrawing && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fadeIn">
            <div className="bg-slate-900 rounded-3xl p-6 border border-pink-500/40 max-w-xs w-full text-center shadow-2xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Bir Kelime Seçin</span>
              </h3>
              <p className="text-xs text-slate-400">Çizmek istediğin kelimeye dokun:</p>
              <div className="space-y-2">
                {wordChoices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectWord(choice)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center justify-between"
                  >
                    <span>{choice.word}</span>
                    <span className="text-[10px] font-normal opacity-80">{choice.category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Waiting banner for guessers while drawer is picking word */}
        {isChoosingWord && !isUserDrawing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-700 px-5 py-3 rounded-2xl text-center space-y-1 shadow-xl">
              <p className="text-xs font-bold text-pink-400 animate-pulse">
                🎨 {currentDrawerName} bir kelime seçiyor...
              </p>
              <p className="text-[10px] text-slate-400">Lütfen bekleyin</p>
            </div>
          </div>
        )}
      </div>

      {/* Drawing Toolbar (Only active for User Drawer) */}
      {isUserDrawing && !isChoosingWord && (
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 flex-shrink-0 z-20">
          {/* Colors */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {COLORS.slice(0, 8).map(c => (
              <button
                key={c}
                onClick={() => { setSelectedColor(c); setIsEraser(false); soundFX.playPop(); }}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-all shadow-[0_3px_0_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.7)] ${
                  selectedColor === c && !isEraser ? 'scale-125 border-white ring-2 ring-pink-500 shadow-[0_5px_0_rgba(0,0,0,0.6)]' : 'border-white/30 hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Tools: Eraser, Undo, Clear */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl border transition ${
                isEraser ? 'bg-pink-500 border-pink-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={handleUndo}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 transition"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 border border-slate-700 text-red-400 active:scale-95 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat & Live Guesses Section */}
      <div className="h-28 bg-slate-950 border-t border-slate-800 flex flex-col flex-shrink-0">
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 text-xs no-scrollbar">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${
                m.isCorrect
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 animate-pulse'
                  : 'bg-white/5 text-slate-300'
              }`}
            >
              <span className="font-bold text-white">{m.sender}:</span>
              <span>{m.text}</span>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar (For Guessers) */}
        {!isUserDrawing && (
          <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputGuess}
              onChange={e => setInputGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendGuess()}
              disabled={userGuessedCorrect}
              placeholder={userGuessedCorrect ? 'Tebrikler bildin! 🎉' : 'Tahminini yaz...'}
              className="flex-1 bg-slate-800 text-white placeholder-slate-500 text-xs px-3 py-2 rounded-xl outline-none border border-slate-700 focus:border-pink-500"
            />
            <button
              onClick={handleSendGuess}
              disabled={userGuessedCorrect || !inputGuess.trim()}
              className="p-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Round End Modal */}
      {gamePhase === 'round_end' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl p-6 border border-white/10 text-center max-w-xs w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Tur Bitti! 🔔</h3>
            <p className="text-xs text-slate-400 mb-4">
              Doğru Kelime: <span className="text-pink-400 font-black text-sm uppercase">{targetWord}</span>
            </p>
            <div className="py-2 px-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-amber-300 font-bold">
              Sonraki tur başlıyor...
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gamePhase === 'game_over' && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30 mb-4 animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">Oyun Bitti! 🎨</h2>
            <p className="text-sm text-slate-400 mb-6">
              En Yüksek Puan:{' '}
              <span className="text-yellow-400 font-bold">
                {Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || currentUser.username}
              </span>
            </p>

            <div className="w-full bg-slate-800/60 rounded-2xl p-4 mb-6 border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Senin Puanın</span>
                <span className="text-sm font-black text-yellow-400">{scores[currentUser.username] || 0} TP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan Jeton</span>
                <span className="text-sm font-black text-yellow-400">+150 🪙</span>
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
                onClick={() => initRound(1)}
                className="py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-lg shadow-pink-500/30"
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
