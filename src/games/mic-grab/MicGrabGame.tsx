import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { updateLeaderboard } from '../../services/leaderboardService';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Mic,
  Music,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Clock,
  Zap,
  Radio,
  Send,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface MicGrabProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

interface SongPrompt {
  word: string;
  category: string;
  songs: {
    title: string;
    artist: string;
    lyrics: string[];
  }[];
}

const SONG_PROMPTS: SongPrompt[] = [
  {
    word: 'AŞK',
    category: 'Romantik & Pop',
    songs: [
      {
        artist: 'Tarkan',
        title: 'Şıkıdım',
        lyrics: ['Oynama', 'şıkıdım', 'şıkıdım', 'aşk', 'bu', 'mu', 'söyle?']
      },
      {
        artist: 'Duman',
        title: 'Her Şeyi Yak',
        lyrics: ['Beni', 'yak', 'kendini', 'yak', 'her', 'şeyi', 'yak', 'bir', 'aşk', 'için!']
      },
      {
        artist: 'Sezen Aksu',
        title: 'Seni Kimler Aldı',
        lyrics: ['Yürüyorum', 'hasretin', 'acının', 'aşkın', 'üstüne...']
      }
    ]
  },
  {
    word: 'GÖZLER',
    category: 'Klasikler',
    songs: [
      {
        artist: 'Barış Manço',
        title: 'Gülpembe',
        lyrics: ['Gözlerimde', 'yaşlar', 'akıyor', 'sensiz', 'Gülpembe...']
      },
      {
        artist: 'Haluk Levent',
        title: 'Elfida',
        lyrics: ['Beni', 'bırakın', 'kendi', 'halime', 'o', 'gözler', 'bana', 'baksın!']
      },
      {
        artist: 'Cem Karaca',
        title: 'Resimdeki Gözyaşları',
        lyrics: ['Bir', 'resmin', 'kalmış', 'bende', 'ıslak', 'gözler', 'ağlar...']
      }
    ]
  },
  {
    word: 'DENİZ',
    category: 'Yaz & Akdeniz',
    songs: [
      {
        artist: 'Mavi Sakal',
        title: 'İki Yol',
        lyrics: ['Çekti', 'gitti', 'buralardan', 'mavi', 'bir', 'deniz', 'gibi...']
      },
      {
        artist: 'Dario Moreno',
        title: 'Deniz ve Mehtap',
        lyrics: ['Deniz', 've', 'mehtap', 'sordular', 'seni', 'nerdesin?']
      },
      {
        artist: 'Teoman',
        title: 'Kupa Kızı',
        lyrics: ['Bir', 'deniz', 'kenarında', 'sessizce', 'otursak...']
      }
    ]
  },
  {
    word: 'YILDIZ',
    category: 'Duygusal',
    songs: [
      {
        artist: 'Müzeyyen Senar',
        title: 'Yıldızların Altında',
        lyrics: ['Benimle', 'dans', 'eder', 'misin', 'bu', 'parlak', 'yıldız', 'altında?']
      },
      {
        artist: 'Yıldız Tilbe',
        title: 'Delikanlım',
        lyrics: ['Aşk', 'laftan', 'anlamaz', 'ki', 'gökteki', 'yıldızlar', 'şahidim!']
      },
      {
        artist: 'Mor ve Ötesi',
        title: 'Bir Derdim Var',
        lyrics: ['Bir', 'derdim', 'var', 'bin', 'yıldız', 'içinde', 'kayboldum...']
      }
    ]
  },
  {
    word: 'GECE',
    category: 'Rock & Alternatif',
    songs: [
      {
        artist: 'Şebnem Ferah',
        title: 'Sil Baştan',
        lyrics: ['Bu', 'gece', 'son', 'bir', 'kez', 'düşün', 'sil', 'baştan', 'başlamak', 'gerek!']
      },
      {
        artist: 'Manga',
        title: 'Dursun Zaman',
        lyrics: ['Karanlık', 'bir', 'gece', 'dursun', 'zaman', 'yanımda', 'kal...']
      },
      {
        artist: 'Model',
        title: 'Değmesin Ellerimiz',
        lyrics: ['Her', 'gece', 'aynı', 'hüzün', 'dokunmasın', 'ellerimiz...']
      }
    ]
  }
];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export const MicGrabGame: React.FC<MicGrabProps> = ({
  currentUser,
  onUpdateUser,
  onExitGame,
  roomId,
}) => {
  const [round, setRound] = useState(1);
  const MAX_ROUNDS = 5;
  const currentPrompt = SONG_PROMPTS[(round - 1) % SONG_PROMPTS.length];

  const [phase, setPhase] = useState<'countdown' | 'grab_race' | 'singing' | 'voting' | 'round_end' | 'game_over'>('countdown');
  const [timer, setTimer] = useState(3);
  const [grabber, setGrabber] = useState<string | null>(null);
  const [grabReactionTime, setGrabReactionTime] = useState<number | null>(null);

  // Karaoke singing state
  const [currentSongLyrics, setCurrentSongLyrics] = useState<string[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [customLyricInput, setCustomLyricInput] = useState('');

  // Floating emojis
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const reactionCounter = useRef(0);

  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const players = isMultiplayer && rtdbPlayers.length > 0
    ? rtdbPlayers.map(p => ({
        id: p.userId,
        name: p.username,
        avatar: p.avatarConfig,
        isMe: p.userId === currentUser.id,
      }))
    : [
        { id: currentUser.id, name: currentUser.username, avatar: currentUser.avatarConfig, isMe: true }
      ];

  // Scores
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const sc: Record<string, number> = {};
    players.forEach(p => { sc[p.name] = 0; });
    return sc;
  });

  // Jury votes in current round: { username: boolean }
  const [votes, setVotes] = useState<Record<string, boolean>>({});

  const grabStartTimeRef = useRef<number>(0);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.phase) setPhase(remoteState.phase);
    if (remoteState.timer !== undefined && !isRoomHost) setTimer(remoteState.timer);
    if (remoteState.round !== undefined) setRound(remoteState.round);
    if (remoteState.grabber !== undefined) setGrabber(remoteState.grabber);
    if (remoteState.grabReactionTime !== undefined) setGrabReactionTime(remoteState.grabReactionTime);
    if (remoteState.currentSongLyrics) setCurrentSongLyrics(remoteState.currentSongLyrics);
    if (remoteState.scores) setScores(remoteState.scores);
    if (remoteState.remoteReaction) {
      triggerReactionLocally(remoteState.remoteReaction.emoji);
    }
  }, [remoteState, isMultiplayer, isRoomHost]);

  const triggerReactionLocally = (emoji: string) => {
    const id = ++reactionCounter.current;
    const x = Math.floor(Math.random() * 70) + 15;
    setFloatingReactions(prev => [...prev.slice(-15), { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2200);
  };

  // Send a floating emoji reaction
  const triggerReaction = (emoji: string) => {
    soundFX.playPop();
    triggerReactionLocally(emoji);
    if (isMultiplayer) {
      pushState({ remoteReaction: { emoji, id: Date.now() }, actionSeq: Date.now() }).catch(console.warn);
    }
  };

  // Timer loop (Host drives timer in multiplayer)
  useEffect(() => {
    if (isMultiplayer && !isRoomHost) return;

    if (timer <= 0) {
      handleTimerExpiry();
      return;
    }
    const t = setInterval(() => {
      setTimer(prev => {
        const nextTime = prev - 1;
        if (isMultiplayer && nextTime % 3 === 0) {
          pushState({ timer: nextTime, actionSeq: Date.now() }).catch(console.warn);
        }
        return nextTime;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timer, phase, isMultiplayer, isRoomHost]);

  // Lyric bouncy karaoke animation during singing
  useEffect(() => {
    if (phase !== 'singing' || currentSongLyrics.length === 0) return;
    const interval = setInterval(() => {
      setActiveLyricIndex(prev => (prev + 1) % currentSongLyrics.length);
    }, 700);
    return () => clearInterval(interval);
  }, [phase, currentSongLyrics]);

  // When phase changes to grab_race, record time
  useEffect(() => {
    if (phase === 'grab_race') {
      grabStartTimeRef.current = performance.now();
    }
  }, [phase]);

  const handleTimerExpiry = () => {
    if (phase === 'countdown') {
      soundFX.playHorn();
      setPhase('grab_race');
      setTimer(6);
      if (isMultiplayer) pushState({ phase: 'grab_race', timer: 6, actionSeq: Date.now() }).catch(console.warn);
    } else if (phase === 'grab_race') {
      if (!grabber) {
        soundFX.playBuzzer();
        // No one grabbed, move to next round or finish
        if (round >= MAX_ROUNDS) {
          setPhase('game_over');
          handleGameOver();
        } else {
          nextRound();
        }
      }
    } else if (phase === 'singing') {
      soundFX.playPop();
      setPhase('voting');
      setTimer(8);
      if (isMultiplayer) pushState({ phase: 'voting', timer: 8, actionSeq: Date.now() }).catch(console.warn);
    } else if (phase === 'voting') {
      // Calculate real jury votes
      const approvals = Object.values(votes).filter(Boolean).length;
      const juryCount = Math.max(1, players.filter(p => p.name !== grabber).length);
      const isApproved = approvals >= Math.ceil(juryCount / 2);

      let nextScores = { ...scores };
      if (isApproved && grabber) {
        soundFX.playApplause();
        nextScores = {
          ...nextScores,
          [grabber]: (nextScores[grabber] || 0) + 150,
        };
        setScores(nextScores);
      } else {
        soundFX.playBuzzer();
      }

      setPhase('round_end');
      setTimer(3);
      if (isMultiplayer) {
        pushState({
          scores: nextScores,
          phase: 'round_end',
          timer: 3,
          actionSeq: Date.now(),
        }).catch(console.warn);
      }
    } else if (phase === 'round_end') {
      if (round >= MAX_ROUNDS) {
        setPhase('game_over');
        handleGameOver();
      } else {
        nextRound();
      }
    }
  };

  const handleGameOver = () => {
    soundFX.playGiftFanfare();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const isWinner = sortedScores[0]?.[0] === currentUser.username;

    const coinsReward = isMultiplayer
      ? (isWinner ? Math.floor(prizePool * 0.9) : 80)
      : (isWinner ? 250 : 80);
    const expReward = isWinner ? 200 : 100;

    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + coinsReward,
      exp: currentUser.exp + expReward,
      gamesPlayed: currentUser.gamesPlayed + 1,
      gamesWon: currentUser.gamesWon + (isWinner ? 1 : 0),
    });

    if (isMultiplayer) {
      if (isWinner) rewardWinner(currentUser.id).catch(console.warn);
      pushState({ phase: 'game_over', actionSeq: Date.now() }).catch(console.warn);
    }

    updateLeaderboard('mic_grab', currentUser.id, currentUser.username, scores[currentUser.username] || 0).catch(console.warn);
  };

  const nextRound = () => {
    const nextR = round + 1;
    setRound(nextR);
    setGrabber(null);
    setGrabReactionTime(null);
    setCurrentSongLyrics([]);
    setActiveLyricIndex(0);
    setCustomLyricInput('');
    setVotes({});
    setPhase('countdown');
    setTimer(3);

    if (isMultiplayer) {
      pushState({
        round: nextR,
        grabber: null,
        grabReactionTime: null,
        currentSongLyrics: [],
        phase: 'countdown',
        timer: 3,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  // User hits the giant Mic buzzer
  const handleUserGrab = () => {
    if (phase !== 'grab_race' || grabber) return;
    const reactionMs = Math.round(performance.now() - grabStartTimeRef.current);
    setGrabReactionTime(reactionMs);
    soundFX.playStageBuzzer();
    confetti({ particleCount: 70, spread: 70 });
    setGrabber(currentUser.username);
    const lyrics = currentPrompt.songs[0].lyrics;
    setCurrentSongLyrics(lyrics);
    setActiveLyricIndex(0);
    setPhase('singing');
    setTimer(12);

    const nextScores = {
      ...scores,
      [currentUser.username]: (scores[currentUser.username] || 0) + 100,
    };
    setScores(nextScores);

    if (isMultiplayer) {
      pushState({
        grabber: currentUser.username,
        grabReactionTime: reactionMs,
        currentSongLyrics: lyrics,
        phase: 'singing',
        timer: 12,
        scores: nextScores,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  // User selects which song to sing
  const handlePickSong = (song: typeof currentPrompt.songs[0]) => {
    soundFX.playPop();
    setCurrentSongLyrics(song.lyrics);
    setActiveLyricIndex(0);
    if (isMultiplayer) {
      pushState({ currentSongLyrics: song.lyrics, actionSeq: Date.now() }).catch(console.warn);
    }
  };

  // User submits custom lyrics
  const handleCustomLyricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLyricInput.trim()) return;
    const words = customLyricInput.trim().split(/\s+/);
    setCurrentSongLyrics(words);
    setActiveLyricIndex(0);
    setCustomLyricInput('');
    if (isMultiplayer) {
      pushState({ currentSongLyrics: words, actionSeq: Date.now() }).catch(console.warn);
    }
  };

  // Real connected user votes for singing player
  const handleUserVote = (approved: boolean) => {
    if (phase !== 'voting' || !grabber || grabber === currentUser.username) return;

    soundFX.playPop();
    const newVotes = {
      ...votes,
      [currentUser.username]: approved,
    };
    setVotes(newVotes);

    if (isMultiplayer) {
      pushState({
        [`juryVote_${currentUser.id}`]: approved,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // ══════════════════════════════════════════════════════
  // GAME OVER PODIUM
  // ══════════════════════════════════════════════════════
  if (phase === 'game_over') {
    return (
      <div className="flex flex-col h-full bg-[#0a051b] text-white select-none relative overflow-hidden">
        {/* Concert Disco Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/40 via-purple-950/70 to-[#0a051b]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn max-w-md mx-auto w-full">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-1 shadow-[0_0_50px_rgba(236,72,153,0.5)] flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
            </div>
            <Sparkles className="w-7 h-7 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
          </div>

          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 mb-2">
            SAHNE KAPANIŞI!
          </h2>
          <p className="text-xs text-purple-200/80 mb-6 font-semibold">
            {sortedScores[0]?.[0] === currentUser.username
              ? '🎤 Tebrikler! Gecenin Yıldızı Sen Oldun!'
              : `👏 Harika performans! 1. Sırayı ${sortedScores[0]?.[0] || 'Kazanan'} aldı.`}
          </p>

          {/* Top 3 Podium Cards */}
          <div className="w-full space-y-2.5 mb-6">
            {sortedScores.map(([name, score], index) => {
              const player = players.find(p => p.name === name);
              const isFirst = index === 0;
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/40'
                      : index === 1
                      ? 'bg-slate-900/70 border-slate-700/60'
                      : 'bg-slate-900/40 border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👏'}
                    </span>
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                      <AvatarRenderer config={player?.avatar || currentUser.avatarConfig} size="sm" />
                    </div>
                    <div className="text-left">
                      <span className={`font-black text-xs block ${name === currentUser.username ? 'text-pink-400' : 'text-white'}`}>
                        {name} {name === currentUser.username ? '(Sen)' : ''}
                      </span>
                      <span className="text-[10px] text-purple-300 font-bold">
                        {isFirst ? 'Gecenin Vokalisti' : 'Yarışmacı'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-amber-400 text-sm">{score} Puan</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reward Box */}
          <div className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 to-pink-950/80 border border-purple-500/30 flex items-center justify-around mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🪙</span>
              <div className="text-left">
                <span className="text-[10px] text-purple-300 block uppercase font-bold">Kazanılan Altın</span>
                <span className="font-black text-yellow-400 text-sm">
                  +{sortedScores[0]?.[0] === currentUser.username ? '250' : '80'}
                </span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-purple-500/30" />
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚡</span>
              <div className="text-left">
                <span className="text-[10px] text-purple-300 block uppercase font-bold">Kazanılan XP</span>
                <span className="font-black text-cyan-400 text-sm">
                  +{sortedScores[0]?.[0] === currentUser.username ? '200' : '100'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 w-full">
            <button
              onClick={() => {
                setRound(1);
                const sc: Record<string, number> = {};
                players.forEach(p => { sc[p.name] = 0; });
                setScores(sc);
                nextRound();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 font-bold text-xs text-white transition active:scale-95 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Tekrar Oyna</span>
            </button>
            <button
              onClick={onExitGame}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 font-black text-xs text-white shadow-lg shadow-pink-500/30 transition transform active:scale-95"
            >
              Lobiye Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // MAIN GAME ARENA
  // ══════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-[#080415] text-white select-none relative overflow-hidden">
      {/* Dynamic Laser & Spotlight Stage Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-[#0a051b] to-[#060310] pointer-events-none" />
      <div className="absolute -top-24 left-1/4 w-72 h-72 bg-pink-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-72 h-72 bg-cyan-600/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Sweeping Laser Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute top-0 left-1/4 w-[1px] h-[600px] bg-gradient-to-b from-pink-400 to-transparent transform -rotate-45 origin-top" />
        <div className="absolute top-0 right-1/4 w-[1px] h-[600px] bg-gradient-to-b from-cyan-400 to-transparent transform rotate-45 origin-top" />
      </div>

      {/* Floating Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingReactions.map(r => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-20 text-3xl animate-bounce transition-all duration-1000 ease-out transform -translate-y-48 opacity-90 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* ── TOP HEADER BAR ── */}
      <div className="relative z-20 flex items-center justify-between px-4 pb-2.5 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] bg-slate-950/90 backdrop-blur-md border-b border-purple-500/20 flex-shrink-0 shadow-md">
        <button
          onClick={onExitGame}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md shadow-pink-500/30">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-sm bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent block leading-tight">
              Mikrofon Kapmaca
            </span>
            <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider block">
              Canlı Konser Arenası
            </span>
          </div>
        </div>

        {/* Countdown Pill */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border transition ${
          timer <= 3
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
            : 'bg-purple-500/20 border-purple-500/40 text-purple-200'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{timer}s</span>
        </div>
      </div>

      {/* ── ROUND & SCOREBOARD STRIP ── */}
      <div className="relative z-20 flex items-center space-x-2 px-3 py-2 bg-purple-950/20 border-b border-purple-500/10 overflow-x-auto no-scrollbar">
        <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs shadow whitespace-nowrap flex items-center space-x-1">
          <Radio className="w-3 h-3 animate-pulse text-amber-300" />
          <span>Tur {round}/{MAX_ROUNDS}</span>
        </div>

        {Object.entries(scores).map(([name, score]) => (
          <div
            key={name}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold whitespace-nowrap transition ${
              name === currentUser.username
                ? 'border-pink-500/60 bg-pink-500/15 text-pink-200 shadow-sm'
                : 'border-slate-800/80 bg-slate-900/60 text-slate-300'
            }`}
          >
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="truncate max-w-[65px]">{name}</span>
            <span className="text-yellow-400 font-black">{score}p</span>
          </div>
        ))}
      </div>

      {/* ── STAGE SOUND EQUALIZER VIZ ── */}
      <div className="relative z-10 flex items-end justify-center space-x-1.5 h-7 pt-2 px-4 pointer-events-none opacity-80">
        {[20, 60, 40, 85, 30, 95, 70, 45, 80, 50, 90, 35, 75, 40, 65, 30].map((h, i) => (
          <div
            key={i}
            style={{
              height: phase === 'singing' ? `${Math.max(15, (h * (activeLyricIndex + 1)) % 100)}%` : `${h * 0.3}%`,
              transition: 'height 0.25s ease'
            }}
            className="w-1.5 rounded-t-full bg-gradient-to-t from-purple-500 via-pink-500 to-amber-300 shadow-[0_0_8px_rgba(236,72,153,0.5)]"
          />
        ))}
      </div>

      {/* ── MAIN STAGE CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-4 overflow-y-auto no-scrollbar">

        {/* ── TOP PROMPT CARD (3D Megascreen) ── */}
        <div
          style={{ transform: 'perspective(900px) rotateX(4deg)' }}
          className="w-full max-w-md mx-auto p-3 sm:p-4 rounded-3xl bg-gradient-to-br from-slate-900/95 via-purple-950/70 to-slate-900/95 border border-purple-500/40 text-center shadow-[0_12px_0_#1e1b4b,0_18px_30px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-md shrink-0 transition-transform"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-center space-x-2 text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-1">
            <Music className="w-3.5 h-3.5 text-pink-400" />
            <span>Kategori: {currentPrompt.category}</span>
          </div>

          <div className="text-xs font-semibold text-slate-300">
            Şarkı sözünde geçmesi gereken kelime:
          </div>

          <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 tracking-wider my-1.5 animate-pulse drop-shadow-md">
            "{currentPrompt.word}"
          </div>

          <div className="text-[11px] text-slate-400">
            {phase === 'countdown' && '⏳ Geri sayım bitince mikrofona ilk sen bas!'}
            {phase === 'grab_race' && '⚡ HEMEN ŞİMDİ MİKROFONU KAP!'}
            {phase === 'singing' && (grabber === currentUser.username ? '🎤 Senin sıran! Şarkını söyle veya seç!' : `🎤 ${grabber} sahnede şarkı söylüyor!`)}
            {phase === 'voting' && '🗳️ Doğru kelime söylendi mi? Oyla!'}
            {phase === 'round_end' && '✨ Tur puanları güncellendi!'}
          </div>
        </div>

        {/* ── CENTER INTERACTIVE ARENA ── */}
        <div className="my-auto flex flex-col items-center w-full max-w-md mx-auto py-2">

          {/* 1. COUNTDOWN PHASE */}
          {phase === 'countdown' && (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-1 shadow-[0_8px_0_#581c87,0_16px_30px_rgba(168,85,247,0.5)] flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-full bg-[#0f0728] flex items-center justify-center border-2 border-white/20">
                  <span className="text-4xl font-black text-yellow-300 animate-pulse">
                    {timer}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-200 tracking-wide">
                Parmaklarını hazırla... Mikrofon açılıyor!
              </span>
            </div>
          )}

          {/* 2. GRAB RACE PHASE (GIANT 3D METALLIC STAGE BUZZER) */}
          {phase === 'grab_race' && (
            <div className="flex flex-col items-center space-y-4 animate-scaleIn">
              <button
                onClick={handleUserGrab}
                className="group relative w-44 h-44 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-2.5 shadow-[0_14px_0_#831843,0_20px_0_#500724,0_26px_40px_rgba(0,0,0,0.9)] active:translate-y-3 active:shadow-[0_3px_0_#831843,0_8px_15px_rgba(0,0,0,0.7)] transition-all transform cursor-pointer"
              >
                {/* 3D Outer Bevel Ring */}
                <div className="w-full h-full rounded-full bg-gradient-to-b from-purple-800 via-pink-900 to-slate-950 flex flex-col items-center justify-center border-4 border-yellow-300/90 shadow-[inset_0_4px_10px_rgba(255,255,255,0.4),inset_0_-6px_12px_rgba(0,0,0,0.8)]">
                  {/* Metallic Grill & Mic Center */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-pink-500/30 to-purple-900/60 flex items-center justify-center mb-1 border border-pink-400/50 shadow-[0_4px_12px_rgba(236,72,153,0.5)] group-active:scale-95 transition">
                    <Mic className="w-10 h-10 text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-bounce" />
                  </div>
                  <span className="text-base font-black uppercase text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    KAP!
                  </span>
                </div>
              </button>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-black animate-pulse shadow-lg">
                <Zap className="w-3.5 h-3.5" />
                <span>İLK DOKUNAN MİKROFONU ALIR!</span>
              </div>
            </div>
          )}

          {/* 3. SINGING KARAOKE PHASE */}
          {phase === 'singing' && grabber && (
            <div className="w-full flex flex-col items-center space-y-3">
              {/* Singer Avatar with Audio Halo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-300 shadow-[0_0_30px_rgba(236,72,153,0.6)] animate-pulse">
                  <AvatarRenderer
                    config={players.find(p => p.name === grabber)?.avatar || currentUser.avatarConfig}
                    size="lg"
                    isSpeaking={true}
                    micLevel={90}
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black text-[10px] shadow uppercase whitespace-nowrap">
                  🎤 {grabReactionTime ? `${grabReactionTime} ms` : 'Sahnede'}
                </span>
              </div>

              {/* Singer Name & Karaoke Screen */}
              <div className="w-full max-w-sm p-4 rounded-3xl bg-slate-900/95 border border-purple-500/40 shadow-[0_12px_0_#0f172a,0_18px_28px_rgba(0,0,0,0.8)] text-center space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="font-bold flex items-center space-x-1">
                    <Music className="w-3 h-3 text-pink-400" />
                    <span>{grabber} Şarkı Söylüyor</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-400 uppercase">
                    {activeLyricIndex + 1}/{currentSongLyrics.length || 1}
                  </span>
                </div>

                {/* Bouncing Karaoke Lyric Flow */}
                <div className="min-h-[56px] flex items-center justify-center flex-wrap gap-1.5 p-2 rounded-2xl bg-black/40 border border-white/5">
                  {currentSongLyrics.length > 0 ? (
                    currentSongLyrics.map((word, idx) => {
                      const isActive = idx === activeLyricIndex;
                      const isWordMatched = word.toLocaleUpperCase('tr-TR').includes(currentPrompt.word.toLocaleUpperCase('tr-TR'));
                      return (
                        <span
                          key={idx}
                          className={`text-sm sm:text-base font-black px-2 py-0.5 rounded-lg transition-all transform ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110 shadow-lg shadow-pink-500/40'
                              : isWordMatched
                              ? 'text-yellow-300 font-extrabold underline'
                              : 'text-slate-400'
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">Şarkı yükleniyor... 🎶</span>
                  )}
                </div>

                {/* If user is the singer: Quick Song Picker or Lyric Input */}
                {grabber === currentUser.username && (
                  <div className="space-y-2 pt-2 border-t border-purple-500/20">
                    <span className="text-[10px] font-bold text-slate-300 block">
                      Hazır Şarkı Seç veya Kendi Sözünü Söyle:
                    </span>

                    <div className="grid grid-cols-3 gap-1.5">
                      {currentPrompt.songs.map((song, i) => (
                        <button
                          key={i}
                          onClick={() => handlePickSong(song)}
                          className="p-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-400/30 text-[10px] font-bold text-purple-200 transition active:scale-95 truncate"
                          title={`${song.artist} - ${song.title}`}
                        >
                          <span className="block truncate text-pink-400">{song.artist}</span>
                          <span className="block truncate text-white">{song.title}</span>
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleCustomLyricSubmit} className="flex items-center space-x-1.5 pt-1">
                      <input
                        type="text"
                        value={customLyricInput}
                        onChange={e => setCustomLyricInput(e.target.value)}
                        placeholder={`"${currentPrompt.word}" içeren şarkı sözü yaz...`}
                        className="flex-1 bg-slate-800/80 rounded-xl px-3 py-2 text-xs text-white border border-slate-700 outline-none focus:border-pink-500"
                      />
                      <button
                        type="submit"
                        className="p-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. VOTING / JURY PHASE */}
          {phase === 'voting' && grabber && (
            <div className="w-full max-w-sm text-center space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-xl space-y-2">
                <span className="text-xs font-black text-yellow-300 uppercase tracking-wide block">
                  🎤 Performans Oylaması
                </span>
                <p className="text-xs text-slate-200">
                  <span className="font-bold text-pink-400">{grabber}</span>, şarkıda{' '}
                  <span className="text-yellow-300 font-bold">"{currentPrompt.word}"</span> kelimesini doğru söyledi mi?
                </p>

                {grabber === currentUser.username ? (
                  <div className="py-3 flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-purple-300 font-bold">
                      Jüri ve seyirciler senin performansını oyluyor...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={() => handleUserVote(true)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl font-black text-xs transition-all transform active:translate-y-1 ${
                        votes[currentUser.username] === true
                          ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 shadow-[0_2px_0_#065f46]'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_6px_0_#065f46,0_10px_16px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Harikaydı (+150p)</span>
                    </button>
                    <button
                      onClick={() => handleUserVote(false)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl font-black text-xs transition-all transform active:translate-y-1 ${
                        votes[currentUser.username] === false
                          ? 'bg-rose-500 text-white ring-2 ring-rose-300 shadow-[0_2px_0_#9f1239]'
                          : 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_6px_0_#9f1239,0_10px_16px_rgba(244,63,94,0.3)]'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Bilemedi (0p)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. ROUND END TRANSITION */}
          {phase === 'round_end' && (
            <div className="text-center space-y-2 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
                <Sparkles className="w-7 h-7 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-black text-white">Tur Tamamlandı!</h3>
              <p className="text-xs text-purple-300">Puanlar hanelere yazıldı. Yeni tur başlıyor...</p>
            </div>
          )}
        </div>

        {/* ── BOTTOM STAGE AUDIENCE & FLOATING EMOJI BAR ── */}
        <div className="w-full max-w-md mx-auto pt-2 border-t border-purple-500/20 space-y-2.5">
          {/* Reaction Toolbar */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-2xl bg-slate-900/70 border border-purple-500/20 backdrop-blur">
            <span className="text-[10px] font-bold text-purple-300 ml-1">Seyirci Tepkisi:</span>
            <div className="flex items-center space-x-2">
              {['❤️', '🔥', '👏', '🎵', '🌹', '🍅'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition transform active:scale-125"
                  title="Tepki Gönder"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Players Stage Podiums */}
          <div className="grid grid-cols-4 gap-2">
            {players.map(p => {
              const isSinger = grabber === p.name;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col items-center p-1.5 rounded-2xl border transition-all ${
                    isSinger
                      ? 'bg-pink-500/20 border-pink-400/80 shadow-md shadow-pink-500/20'
                      : 'bg-slate-900/40 border-slate-800/60'
                  }`}
                >
                  <div className="relative">
                    <AvatarRenderer
                      config={p.avatar}
                      size="sm"
                      isSpeaking={isSinger}
                      micLevel={isSinger ? 85 : 0}
                    />
                    {isSinger && (
                      <span className="absolute -top-1 -right-1 text-xs animate-bounce">
                        🎤
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 truncate max-w-[65px] ${
                    p.isMe ? 'text-pink-400' : 'text-slate-300'
                  }`}>
                    {p.name}
                  </span>
                  <span className="text-[9px] font-black text-amber-400">
                    {scores[p.name] || 0}p
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
