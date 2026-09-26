import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { updateLeaderboard } from '../../services/leaderboardService';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Search,
  Clock,
  Fingerprint,
  FileText,
  Send,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface SpyGameProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

const WORD_PAIRS = [
  { civilian: 'ÇAY', spy: 'KAHVE' },
  { civilian: 'FUTBOL', spy: 'BASKETBOL' },
  { civilian: 'GÜNEŞ', spy: 'AY' },
  { civilian: 'DOKTOR', spy: 'HEMŞİRE' },
  { civilian: 'DENİZ', spy: 'GÖL' },
  { civilian: 'SİNEMA', spy: 'TİYATRO' },
  { civilian: 'PİZZA', spy: 'HAMBURGER' },
  { civilian: 'KEDİ', spy: 'KÖPEK' },
  { civilian: 'UÇAK', spy: 'HELİKOPTER' },
  { civilian: 'GİTAR', spy: 'KEMAN' },
  { civilian: 'ALTIN', spy: 'GÜMÜŞ' },
  { civilian: 'ELMA', spy: 'ARMUT' },
  { civilian: 'BİLGİSAYAR', spy: 'TABLET' },
];

export const SpyGame: React.FC<SpyGameProps> = ({
  currentUser,
  onUpdateUser,
  onExitGame,
  roomId,
}) => {
  const [phase, setPhase] = useState<'card_check' | 'clue_giving' | 'voting' | 'spy_guess' | 'result'>('card_check');
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [clueInput, setClueInput] = useState('');
  const [spyGuessInput, setSpyGuessInput] = useState('');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [winner, setWinner] = useState<'civilians' | 'spy' | null>(null);
  const [timer, setTimer] = useState(15);

  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const [pair, setPair] = useState(() => WORD_PAIRS[0]);
  const [spyIndex, setSpyIndex] = useState(0);

  const [players, setPlayers] = useState<any[]>(() => [
    {
      id: currentUser.id,
      name: currentUser.username,
      avatar: currentUser.avatarConfig,
      isSpy: false,
      clue: '',
    },
  ]);

  // Host initializes pair, spy and players purely from real users
  useEffect(() => {
    if (isMultiplayer && !isRoomHost) return; // Guest waits for host

    const chosenPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    const source = isMultiplayer && rtdbPlayers.length > 0 ? rtdbPlayers : [
      { userId: currentUser.id, username: currentUser.username, avatarConfig: currentUser.avatarConfig }
    ];
    const sIndex = Math.floor(Math.random() * source.length);

    const initialPlayers = source.map((p, idx) => ({
      id: p.userId,
      name: p.username,
      avatar: p.avatarConfig,
      isSpy: idx === sIndex,
      clue: '',
    }));

    setPair(chosenPair);
    setSpyIndex(sIndex);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      pushState({
        pair: chosenPair,
        spyIndex: sIndex,
        players: initialPlayers,
        phase: 'card_check',
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  }, [isMultiplayer, isRoomHost, rtdbPlayers.length]);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.pair) setPair(remoteState.pair);
    if (remoteState.spyIndex !== undefined) setSpyIndex(remoteState.spyIndex);
    if (remoteState.phase) setPhase(remoteState.phase);
    if (remoteState.timer !== undefined && !isRoomHost) setTimer(remoteState.timer);
    if (remoteState.winner) setWinner(remoteState.winner);

    // Sync remote player clues and votes
    if (remoteState.players) {
      setPlayers(prev =>
        remoteState.players.map((rp: any) => {
          const remoteClue = remoteState[`clue_${rp.id}`];
          return {
            ...rp,
            clue: remoteClue !== undefined ? remoteClue : rp.clue,
          };
        })
      );
    }
  }, [remoteState, isMultiplayer, isRoomHost]);

  const me = players.find(p => p.id === currentUser.id);
  const isMeSpy = me ? me.isSpy : spyIndex === 0;
  const myWord = isMeSpy ? pair.spy : pair.civilian;

  // Timer loop (Only host ticks timer in multiplayer)
  useEffect(() => {
    if (phase === 'result' || phase === 'card_check') return;
    if (isMultiplayer && !isRoomHost) return;

    if (timer <= 0) {
      if (phase === 'clue_giving') {
        setPhase('voting');
        setTimer(20);
        if (isMultiplayer) {
          pushState({ phase: 'voting', timer: 20, actionSeq: Date.now() }).catch(console.warn);
        }
      } else if (phase === 'voting') {
        handleVotingEnd();
      } else if (phase === 'spy_guess') {
        handleFinishGame('civilians');
      }
      return;
    }

    const t = setInterval(() => {
      setTimer(prev => {
        const nextTime = prev - 1;
        if (isMultiplayer && nextTime % 5 === 0) {
          pushState({ timer: nextTime, actionSeq: Date.now() }).catch(console.warn);
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [timer, phase, isMultiplayer, isRoomHost]);

  const handleRevealCard = () => {
    soundFX.playCardFlip();
    setIsCardRevealed(true);
  };

  const handleStartClues = () => {
    soundFX.playSuccess();
    setPhase('clue_giving');
    setTimer(30);
    if (isMultiplayer) {
      pushState({ phase: 'clue_giving', timer: 30, actionSeq: Date.now() }).catch(console.warn);
    }
  };

  const handleSendClue = () => {
    if (!clueInput.trim()) return;
    soundFX.playPop();
    const trimmed = clueInput.trim();
    const nextPlayers = players.map(p => p.id === currentUser.id ? { ...p, clue: trimmed } : p);
    setPlayers(nextPlayers);
    setClueInput('');
    if (isMultiplayer) {
      pushState({
        [`clue_${currentUser.id}`]: trimmed,
        players: nextPlayers,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const handleSelectVote = (targetId: string) => {
    setSelectedVote(targetId);
    soundFX.playStampSlam();
    if (isMultiplayer) {
      pushState({
        [`spyVote_${currentUser.id}`]: targetId,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const handleVotingEnd = () => {
    soundFX.playPop();
    const spyPlayer = players.find(p => p.isSpy);
    const spyId = spyPlayer ? spyPlayer.id : null;

    // Tally real votes
    const votes: Record<string, number> = {};
    players.forEach(p => {
      let v = isMultiplayer && remoteState ? remoteState[`spyVote_${p.id}`] : null;
      if (!v && p.id === currentUser.id) v = selectedVote;
      if (v) votes[v] = (votes[v] || 0) + 1;
    });

    const topTarget = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || selectedVote;
    const isSpyVoted = topTarget === spyId;

    if (isSpyVoted) {
      // Spy gets last chance to guess the civilian word
      setPhase('spy_guess');
      setTimer(20);
      if (isMultiplayer) {
        pushState({ phase: 'spy_guess', timer: 20, actionSeq: Date.now() }).catch(console.warn);
      }
    } else {
      // Spy escaped!
      handleFinishGame('spy');
    }
  };

  const handleSpyGuessSubmit = () => {
    const isCorrect = spyGuessInput.trim().toLocaleUpperCase('tr-TR') === pair.civilian.toLocaleUpperCase('tr-TR');
    handleFinishGame(isCorrect ? 'spy' : 'civilians');
  };

  const handleFinishGame = (winningSide: 'civilians' | 'spy') => {
    setWinner(winningSide);
    setPhase('result');
    soundFX.playGiftFanfare();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

    const isUserWinner = (isMeSpy && winningSide === 'spy') || (!isMeSpy && winningSide === 'civilians');
    const coins = isMultiplayer
      ? (isUserWinner ? Math.floor(prizePool * 0.9) : 70)
      : (isUserWinner ? 200 : 70);
    const exp = 150;

    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + coins,
      exp: currentUser.exp + exp,
      gamesPlayed: currentUser.gamesPlayed + 1,
      gamesWon: currentUser.gamesWon + (isUserWinner ? 1 : 0),
    });

    if (isMultiplayer) {
      if (isUserWinner) rewardWinner(currentUser.id).catch(console.warn);
      pushState({ phase: 'result', winner: winningSide, actionSeq: Date.now() }).catch(console.warn);
    }

    updateLeaderboard('spy', currentUser.id, currentUser.username, coins);
  };

  // Compute live vote counts
  const voteCounts: Record<string, number> = {};
  players.forEach(p => {
    const v = isMultiplayer && remoteState ? remoteState[`spyVote_${p.id}`] : (p.id === currentUser.id ? selectedVote : null);
    if (v) voteCounts[v] = (voteCounts[v] || 0) + 1;
  });

  const spyPlayer = players.find(p => p.isSpy);

  return (
    <div className="flex flex-col h-full bg-[#0b0e1b] text-white select-none overflow-hidden relative font-sans">
      {/* Top Header with Safe Area Clearance */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] bg-slate-900/95 backdrop-blur border-b border-slate-800/80 flex-shrink-0 z-20 shadow-md">
        <button onClick={onExitGame} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 active:scale-95 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-400" />
          <span className="font-black text-sm text-amber-400 uppercase tracking-wider">Köstebek Kim?</span>
        </div>

        {phase !== 'card_check' && phase !== 'result' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-black font-mono text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{timer}s</span>
          </div>
        )}
      </div>

      {/* ═══ STAGE 1: 3D CARD CHECK (Top Secret Dossier) ═══ */}
      {phase === 'card_check' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div
            style={{ perspective: '800px' }}
            className="flex items-center justify-center my-auto shrink-0"
          >
            <div
              onClick={handleRevealCard}
              style={{
                transform: 'rotateX(8deg) translateY(-2px)',
                transformStyle: 'preserve-3d',
              }}
              className={`w-[min(68vw,240px)] h-[min(42vh,300px)] rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col items-center justify-between shrink-0 shadow-[0_18px_0_#180e06,0_24px_0_#0a0502,0_32px_45px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] ${
                isCardRevealed
                  ? isMeSpy
                    ? 'bg-gradient-to-br from-red-950 via-slate-900 to-black border-red-500 shadow-red-500/30'
                    : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-cyan-400 shadow-cyan-500/30'
                  : 'bg-gradient-to-br from-amber-950/90 via-stone-900 to-black border-amber-500/60 shadow-amber-500/30 hover:scale-105 active:scale-95'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black">ÇOK GİZLİ DOSYA</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>

              {!isCardRevealed ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/30">
                    <Fingerprint className="w-10 h-10 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Gizli Kelimeni Görmek İçin Dokun</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-400 uppercase">Senin Kelimen:</span>
                  <span className={`text-3xl font-black tracking-wider ${isMeSpy ? 'text-red-400' : 'text-cyan-300'}`}>
                    {myWord}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-black mt-2">
                    {isMeSpy ? '🕵️ KÖSTEBEKSİN!' : '🧑‍💼 SİVİLSİN!'}
                  </span>
                </div>
              )}

              <div className="text-[10px] text-slate-500 font-mono">LUVIA İSTİHBARAT SERVİSİ</div>
            </div>
          </div>

          {isCardRevealed && (
            <button
              onClick={handleStartClues}
              className="mt-6 py-3 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-sm shadow-[0_8px_0_#9f1239,0_12px_20px_rgba(244,63,94,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#9f1239] transition animate-bounce"
            >
              Masaya Katıl ve Başla 👉
            </button>
          )}
        </div>
      )}

      {/* ═══ STAGE 2: 3D CLUES & VOTING ═══ */}
      {(phase === 'clue_giving' || phase === 'voting') && (
        <div className="flex-1 flex flex-col justify-between p-4 min-h-0">
          {/* Phase Banner */}
          <div className="text-center py-1.5 px-4 rounded-full bg-slate-900 border border-white/10 text-xs font-bold text-amber-300 mx-auto">
            {phase === 'clue_giving' ? '💬 Herkes kelimesini ele vermeden bir ipucu veriyor!' : '🗳️ Köstebek olduğunu düşündüğün kişiyi seç!'}
          </div>

          {/* 3D Players Grid with Isometric Depth */}
          <div
            style={{ perspective: '800px' }}
            className="my-auto max-w-sm mx-auto w-full py-1"
          >
            <div
              style={{
                transform: 'rotateX(8deg)',
                transformStyle: 'preserve-3d',
              }}
              className="grid grid-cols-2 gap-3.5 w-full"
            >
              {players.map((p) => {
                const isSelected = selectedVote === p.id;
                const vCount = voteCounts[p.id] || 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => phase === 'voting' && handleSelectVote(p.id)}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center relative ${
                      phase === 'voting' ? 'cursor-pointer hover:border-amber-400' : ''
                    } ${
                      isSelected
                        ? 'bg-red-500/25 border-red-500 ring-4 ring-red-500/50 shadow-[0_10px_0_#9f1239,0_14px_22px_rgba(225,29,72,0.6)] scale-105 z-20'
                        : 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-slate-700/60 shadow-[0_8px_0_#0f172a,0_12px_18px_rgba(0,0,0,0.6)] hover:-translate-y-1'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 mb-1.5 shadow-md">
                      <AvatarRenderer config={p.avatar} className="w-full h-full" />
                    </div>
                    <span className="text-xs font-black text-white truncate max-w-[90px]">{p.id === currentUser.id ? `${p.name} (Sen)` : p.name}</span>

                    {/* Speech Clue Bubble */}
                    <div className="w-full mt-2 p-2 rounded-xl bg-slate-950 border border-white/10 text-[10px] text-slate-300 min-h-[40px] flex items-center justify-center italic shadow-inner">
                      {p.clue ? `"${p.clue}"` : p.id === currentUser.id ? 'İpucunu aşağıya yaz...' : 'Yazması bekleniyor...'}
                    </div>

                    {/* Live Vote Counter Badge */}
                    {phase === 'voting' && vCount > 0 && (
                      <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-rose-600 border border-rose-400 text-[10px] font-black text-white shadow-md animate-bounce z-30">
                        🗳️ {vCount} Oy
                      </div>
                    )}

                    {/* 3D Stamped Suspect Badge */}
                    {phase === 'voting' && isSelected && (
                      <div className="absolute -top-2.5 -right-2 px-2.5 py-0.5 rounded-lg border-2 border-red-500 bg-red-600 text-[9px] font-black text-white tracking-widest uppercase rotate-12 shadow-[0_4px_10px_rgba(225,29,72,0.8)] animate-pulse z-30">
                        ŞÜPHELİ 🚨
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Clue Input Bar */}
          {phase === 'clue_giving' && !me?.clue && (
            <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 rounded-2xl">
              <input
                type="text"
                value={clueInput}
                onChange={e => setClueInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendClue()}
                placeholder="Kelimen hakkında bir ipucu yaz..."
                className="flex-1 bg-slate-800 text-white placeholder-slate-500 text-xs px-3 py-2.5 rounded-xl outline-none border border-slate-700 focus:border-amber-400"
              />
              <button
                onClick={handleSendClue}
                disabled={!clueInput.trim()}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Voting Confirmation Button */}
          {phase === 'voting' && (
            <button
              onClick={handleVotingEnd}
              disabled={!selectedVote}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-xl active:scale-95 transition"
            >
              Şüpheliyi Oyla ve Kararı Açıkla ⚖️
            </button>
          )}
        </div>
      )}

      {/* ═══ STAGE 3: SPY REVENGE GUESS ═══ */}
      {phase === 'spy_guess' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-2xl animate-bounce">
            🕵️
          </div>
          {isMeSpy ? (
            <>
              <h2 className="text-xl font-black text-red-400">Yakalandın, Ama Son Bir Şansın Var!</h2>
              <p className="text-xs text-slate-300 max-w-xs">
                Sivillerin gizli kelimesini doğru tahmin edersen tüm oyunu çalarak sen kazanırsın!
              </p>

              <div className="w-full max-w-xs space-y-2">
                <input
                  type="text"
                  value={spyGuessInput}
                  onChange={e => setSpyGuessInput(e.target.value)}
                  placeholder="Sivillerin kelimesini tahmin et..."
                  className="w-full bg-slate-900 border border-red-500 text-white p-3 rounded-2xl text-center text-sm font-bold uppercase outline-none"
                />
                <button
                  onClick={handleSpyGuessSubmit}
                  disabled={!spyGuessInput.trim()}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
                >
                  Tahmini Gönder 🎯
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-black text-amber-400">Köstebek Yakalandı!</h2>
              <p className="text-xs text-slate-300 max-w-xs">
                {spyPlayer?.name || 'Köstebek'} şu anda sivillerin kelimesini tahmin etmeye çalışıyor...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-cyan-300 font-mono animate-pulse">
                <Clock className="w-4 h-4" />
                <span>Kalan Süre: {timer}s</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ STAGE 4: RESULT SCREEN ═══ */}
      {phase === 'result' && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {winner === 'civilians' ? '🧑‍💼 Siviller Kazandı!' : '🕵️ Köstebek Kazandı!'}
            </h2>
            <div className="space-y-1 text-xs text-slate-400 mb-6">
              <p>Sivil Kelimesi: <strong className="text-cyan-300">{pair.civilian}</strong></p>
              <p>Köstebek Kelimesi: <strong className="text-red-400">{pair.spy}</strong></p>
              <p>Gerçek Köstebek: <strong className="text-white">{spyPlayer?.name || 'Bilinmiyor'}</strong></p>
            </div>

            <div className="w-full bg-slate-800/60 rounded-2xl p-4 mb-6 border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan Jeton</span>
                <span className="text-sm font-black text-yellow-400">+200 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan TP</span>
                <span className="text-sm font-black text-blue-400">+150 XP</span>
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
                  setPhase('card_check');
                  setIsCardRevealed(false);
                  setSelectedVote(null);
                }}
                className="py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-lg shadow-amber-500/30"
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
