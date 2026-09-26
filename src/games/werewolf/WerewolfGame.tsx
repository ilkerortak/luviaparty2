import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { updateLeaderboard } from '../../services/leaderboardService';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Moon,
  Sun,
  Shield,
  Eye,
  Skull,
  Vote,
  Sparkles,
  Trophy,
  AlertTriangle,
  Clock,
  Zap,
  Wrench,
  Ghost,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface WerewolfGameProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

type RoleType = 'werewolf' | 'seer' | 'doctor' | 'crewmate';
type Role = RoleType;

interface Player {
  id: string;
  name: string;
  role: RoleType;
  isAlive: boolean;
  avatarConfig: any;
  votesReceived: number;
}

const ROLE_DETAILS: Record<RoleType, { title: string; color: string; desc: string; icon: any }> = {
  werewolf: {
    title: 'UZAY VAMPİRİ',
    color: 'from-rose-600 to-red-700 text-rose-400',
    desc: 'Geceleri gizlice avlan. Mürettebata yakalanmadan hepsini ortadan kaldır!',
    icon: Skull
  },
  seer: {
    title: 'GÖZCÜ (KAHİN)',
    color: 'from-purple-600 to-indigo-700 text-purple-400',
    desc: 'Geceleri bir oyuncunun gerçek kimliğini gör ve mürettebata yol göster.',
    icon: Eye
  },
  doctor: {
    title: 'DOKTOR',
    color: 'from-emerald-600 to-teal-700 text-emerald-400',
    desc: 'Geceleri bir oyuncuyu koruma altına alarak hayatta kalmasını sağla.',
    icon: Shield
  },
  crewmate: {
    title: 'MÜRETTEBAT',
    color: 'from-cyan-600 to-blue-700 text-cyan-400',
    desc: 'Gündüz tartışmalarında ipuçlarını topla ve oylamada vampirleri uzaya fırlat!',
    icon: Wrench
  }
};

export const WerewolfGame: React.FC<WerewolfGameProps> = ({
  currentUser,
  onUpdateUser,
  onExitGame,
  roomId,
}) => {
  const [phase, setPhase] = useState<'role_reveal' | 'night' | 'day_discussion' | 'voting' | 'verdict' | 'game_over'>('role_reveal');
  const [timer, setTimer] = useState<number>(5);
  const [nightActionTarget, setNightActionTarget] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [playerVotes, setPlayerVotes] = useState<Record<string, string>>({});
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [winnerTeam, setWinnerTeam] = useState<'crew' | 'werewolf' | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>(['Uzay gemisi hareket halinde. Roller dağıtıldı!']);
  const [seerResult, setSeerResult] = useState<string | null>(null);
  const [miniTaskDone, setMiniTaskDone] = useState(false);

  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const [players, setPlayers] = useState<Player[]>(() => [
    {
      id: currentUser.id,
      name: currentUser.username,
      role: 'werewolf',
      isAlive: true,
      avatarConfig: currentUser.avatarConfig,
      votesReceived: 0,
    }
  ]);

  // Host initializes players and roles
  useEffect(() => {
    if (isMultiplayer && !isRoomHost) return; // Guest receives via remoteState

    const count = isMultiplayer && rtdbPlayers.length > 0 ? rtdbPlayers.length : 4;
    let roles: Role[] = ['werewolf', 'seer', 'doctor', 'crewmate'];
    if (count === 5) roles = ['werewolf', 'seer', 'doctor', 'crewmate', 'crewmate'];
    if (count >= 6) roles = ['werewolf', 'werewolf', 'seer', 'doctor', 'crewmate', 'crewmate'];
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
    const assignedPlayers: Player[] = [];

    if (isMultiplayer && rtdbPlayers.length > 0) {
      rtdbPlayers.forEach((p, idx) => {
        assignedPlayers.push({
          id: p.userId,
          name: p.username,
          role: shuffledRoles[idx % shuffledRoles.length],
          isAlive: true,
          avatarConfig: p.avatarConfig,
          votesReceived: 0,
        });
      });
    } else {
      assignedPlayers.push(
        { id: currentUser.id, name: `${currentUser.username} (Sen)`, role: shuffledRoles[0], isAlive: true, avatarConfig: currentUser.avatarConfig, votesReceived: 0 },
        { id: 'p2', name: 'Oyuncu 2', role: shuffledRoles[1], isAlive: true, avatarConfig: { skinColor: '#FEE3D4', hairStyle: 'messy', hairColor: '#3b82f6', eyeStyle: 'cool', mouthStyle: 'smile', outfit: 'hoodie', outfitColor: '#6366f1', accessory: 'none', frame: 'none' } as any, votesReceived: 0 },
        { id: 'p3', name: 'Oyuncu 3', role: shuffledRoles[2], isAlive: true, avatarConfig: { skinColor: '#FFDCB1', hairStyle: 'anime', hairColor: '#06b6d4', eyeStyle: 'cool', mouthStyle: 'smirk', outfit: 'cyberpunk', outfitColor: '#3b82f6', accessory: 'gaming_headset', frame: 'cyber_glow' } as any, votesReceived: 0 },
        { id: 'p4', name: 'Oyuncu 4', role: shuffledRoles[3], isAlive: true, avatarConfig: { skinColor: '#E8B688', hairStyle: 'curly', hairColor: '#3b2219', eyeStyle: 'sparkle', mouthStyle: 'laugh', outfit: 'streetwear', outfitColor: '#10b981', accessory: 'glasses', frame: 'none' } as any, votesReceived: 0 },
      );
    }

    setPlayers(assignedPlayers);

    if (isMultiplayer) {
      pushState({
        players: assignedPlayers,
        phase: 'role_reveal',
        timer: 5,
        logMessages: ['Uzay gemisi hareket halinde. Roller dağıtıldı!'],
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  }, [isMultiplayer, isRoomHost, rtdbPlayers.length]);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.players) setPlayers(remoteState.players);
    if (remoteState.phase) setPhase(remoteState.phase);
    if (remoteState.timer !== undefined) setTimer(remoteState.timer);
    if (remoteState.logMessages) setLogMessages(remoteState.logMessages);
    if (remoteState.eliminatedPlayer !== undefined) setEliminatedPlayer(remoteState.eliminatedPlayer);
    if (remoteState.winnerTeam !== undefined) setWinnerTeam(remoteState.winnerTeam);
    if (remoteState.playerVotes) setPlayerVotes(remoteState.playerVotes);
  }, [remoteState, isMultiplayer]);

  const me = players.find(p => p.id === currentUser.id) || {
    id: currentUser.id,
    name: currentUser.username,
    role: 'crewmate' as Role,
    isAlive: true,
    avatarConfig: currentUser.avatarConfig,
    votesReceived: 0,
  };

  // Phase Timer Loop (Driven by Host in multiplayer, or locally in singleplayer)
  useEffect(() => {
    if (phase === 'game_over') return;
    if (isMultiplayer && !isRoomHost) return; // Only host ticks the game clock

    if (timer <= 0) {
      handlePhaseTransition();
      return;
    }

    const t = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [timer, phase, isMultiplayer, isRoomHost]);

  const handlePhaseTransition = () => {
    if (phase === 'role_reveal') {
      soundFX.playPop();
      setPhase('night');
      setTimer(12);
      const newLogs = ['🌙 Gece çöktü. Uzay istasyonunda ışıklar söndü...', ...logMessages];
      setLogMessages(newLogs);
      if (isMultiplayer) {
        pushState({ phase: 'night', timer: 12, logMessages: newLogs, actionSeq: Date.now() }).catch(console.warn);
      }
    } else if (phase === 'night') {
      resolveNightActions();
    } else if (phase === 'day_discussion') {
      soundFX.playPop();
      setPhase('voting');
      setTimer(15);
      const newLogs = ['🚨 Acil durum toplantısı! Oylarınızı verin.', ...logMessages];
      setLogMessages(newLogs);
      if (isMultiplayer) {
        pushState({ phase: 'voting', timer: 15, logMessages: newLogs, actionSeq: Date.now() }).catch(console.warn);
      }
    } else if (phase === 'voting') {
      resolveVoting();
    } else if (phase === 'verdict') {
      checkEndGameOrNextRound();
    }
  };

  const resolveNightActions = () => {
    let target = nightActionTarget;
    let protectedId: string | null = null;
    if (isMultiplayer && remoteState) {
      players.forEach(p => {
        if (remoteState[`nightAction_${p.id}`]) {
          if (p.role === 'werewolf') target = remoteState[`nightAction_${p.id}`];
          if (p.role === 'doctor') protectedId = remoteState[`nightAction_${p.id}`];
        }
      });
    }

    let killedPlayer: Player | null = null;
    if (target && target !== protectedId) {
      killedPlayer = players.find(p => p.id === target) || null;
    }

    const nextPlayers = players.map(p => {
      if (killedPlayer && p.id === killedPlayer.id) {
        return { ...p, isAlive: false };
      }
      return p;
    });

    setPlayers(nextPlayers);
    setNightActionTarget(null);
    setSeerResult(null);

    soundFX.playPop();
    setPhase('day_discussion');
    setTimer(12);

    const morningMsg = killedPlayer 
      ? `☀️ Sabah oldu: ${killedPlayer.name} gece saldırıya uğradı! ☠️`
      : '☀️ Sabah oldu: Doktor bir mürettebatı mucizevi şekilde kurtardı! 🛡️';
    const newLogs = [morningMsg, ...logMessages];
    setLogMessages(newLogs);

    if (killedPlayer) soundFX.playError();
    else soundFX.playSuccess();

    if (isMultiplayer) {
      pushState({
        players: nextPlayers,
        phase: 'day_discussion',
        timer: 12,
        logMessages: newLogs,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const resolveVoting = () => {
    const alivePlayers = players.filter(p => p.isAlive);
    const votes: Record<string, number> = {};
    const finalPlayerVotes: Record<string, string> = {};

    alivePlayers.forEach(p => {
      let votedFor = p.id === currentUser.id ? selectedVote : null;
      if (isMultiplayer && remoteState && remoteState[`playerVotes_${p.id}`]) {
        votedFor = remoteState[`playerVotes_${p.id}`];
      }
      if (votedFor) {
        finalPlayerVotes[p.id] = votedFor;
        votes[votedFor] = (votes[votedFor] || 0) + 1;
      }
    });

    setPlayerVotes(finalPlayerVotes);

    let maxVotes = 0;
    let ejectedId: string | null = null;

    Object.entries(votes).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        ejectedId = id;
      }
    });

    const ejected = ejectedId ? players.find(p => p.id === ejectedId) : null;
    setEliminatedPlayer(ejected || null);

    let nextPlayers = players;
    let ejectedMsg = '';
    if (ejected) {
      nextPlayers = players.map(p => p.id === ejected.id ? { ...p, isAlive: false } : p);
      setPlayers(nextPlayers);
      soundFX.playError();
      ejectedMsg = `🚀 ${ejected.name} en çok oyu alarak uzay boşluğuna fırlatıldı!`;
    } else {
      ejectedMsg = 'Oylar eşit çıktı veya oy kullanılmadı, kimse fırlatılmadı.';
    }

    const newLogs = [ejectedMsg, ...logMessages];
    setLogMessages(newLogs);
    setPhase('verdict');
    setTimer(6);

    if (isMultiplayer) {
      pushState({
        players: nextPlayers,
        eliminatedPlayer: ejected || null,
        playerVotes: finalPlayerVotes,
        phase: 'verdict',
        timer: 6,
        logMessages: newLogs,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const checkEndGameOrNextRound = () => {
    const aliveWerewolves = players.filter(p => p.isAlive && p.role === 'werewolf').length;
    const aliveCrew = players.filter(p => p.isAlive && p.role !== 'werewolf').length;

    if (aliveWerewolves === 0) {
      handleGameOver('crew');
    } else if (aliveWerewolves >= aliveCrew) {
      handleGameOver('werewolf');
    } else {
      setPhase('night');
      setTimer(12);
      setSelectedVote(null);
      setPlayerVotes({});
      const newLogs = ['🌙 Yeniden gece oldu...', ...logMessages];
      setLogMessages(newLogs);
      if (isMultiplayer) {
        pushState({
          phase: 'night',
          timer: 12,
          playerVotes: {},
          logMessages: newLogs,
          actionSeq: Date.now(),
        }).catch(console.warn);
      }
    }
  };

  const handleGameOver = (winningTeam: 'crew' | 'werewolf') => {
    setPhase('game_over');
    setWinnerTeam(winningTeam);
    soundFX.playGiftFanfare();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

    const isMyTeamWin = (me.role === 'werewolf' && winningTeam === 'werewolf') || (me.role !== 'werewolf' && winningTeam === 'crew');
    const coins = isMultiplayer
      ? Math.floor(prizePool * 0.9)
      : (isMyTeamWin ? 250 : 80);
    const exp = 200;

    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins + (isMyTeamWin ? coins : 50),
      exp: currentUser.exp + exp,
      gamesPlayed: currentUser.gamesPlayed + 1,
      gamesWon: currentUser.gamesWon + (isMyTeamWin ? 1 : 0),
    });

    if (isMultiplayer) {
      if (isMyTeamWin) rewardWinner(currentUser.id).catch(console.warn);
      pushState({
        phase: 'game_over',
        winnerTeam: winningTeam,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }

    updateLeaderboard('werewolf', currentUser.id, currentUser.username, isMyTeamWin ? 250 : 80);
  };

  const handleNightAction = (targetPlayer: Player) => {
    if (!me.isAlive) return;
    if (me.role === 'seer') {
      soundFX.playCastleHarp();
      setSeerResult(targetPlayer.role === 'werewolf' ? 'UZAY VAMPİRİ! 🐺' : 'MASUM MÜRETTEBAT 🧑‍🚀');
    } else if (me.role === 'doctor') {
      soundFX.playSuccess();
    } else if (me.role === 'werewolf') {
      soundFX.playAlarm();
    } else {
      soundFX.playPop();
    }
    setNightActionTarget(targetPlayer.id);

    if (isMultiplayer) {
      pushState({
        [`nightAction_${currentUser.id}`]: targetPlayer.id,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const handleSelectVote = (targetId: string) => {
    soundFX.playStampSlam();
    setSelectedVote(targetId);
    if (isMultiplayer) {
      pushState({
        [`playerVotes_${currentUser.id}`]: targetId,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }
  };

  const myRole: RoleType = (me.role in ROLE_DETAILS ? me.role : 'crewmate') as RoleType;
  const MyRoleIcon = ROLE_DETAILS[myRole].icon;

  return (
    <div className="flex flex-col h-full bg-[#070913] text-white select-none overflow-hidden relative font-sans">
      {/* Top Header with Safe Area Notch Clearance */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] bg-slate-900/95 backdrop-blur border-b border-slate-800/80 flex-shrink-0 z-20 shadow-md">
        <button onClick={onExitGame} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 active:scale-95 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {phase === 'night' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
          <span className="font-black text-sm uppercase tracking-wider text-white">
            {phase === 'night' ? 'Gece Evresi' : phase === 'voting' ? 'Oylama Toplantısı' : 'Uzay Vampir'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-black font-mono text-amber-300">
          <Clock className="w-3.5 h-3.5" />
          <span>{timer}s</span>
        </div>
      </div>

      {/* Role Banner Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center">
            <MyRoleIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Gizli Rolün:</span>
            <span className="text-xs font-black text-cyan-300">{ROLE_DETAILS[myRole].title}</span>
          </div>
        </div>

        {me.isAlive ? (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black">
            CANLI
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black">
            HAYALET 👻
          </span>
        )}
      </div>

      {/* ═══ 3D ROLE REVEAL STAGE ═══ */}
      {phase === 'role_reveal' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div
            style={{ perspective: '800px' }}
            className="flex items-center justify-center my-auto"
          >
            <div
              style={{
                transform: 'rotateX(8deg) rotateY(-4deg)',
                transformStyle: 'preserve-3d',
              }}
              className="w-48 h-68 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border-2 border-cyan-400 p-5 shadow-[0_18px_0_#0f172a,0_24px_0_#020617,0_34px_50px_rgba(6,182,212,0.5),inset_0_2px_4px_rgba(255,255,255,0.2)] flex flex-col items-center justify-between animate-bounce"
            >
              <span className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase">GİZLİ KİMLİK</span>
              <MyRoleIcon className="w-18 h-18 text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
              <h3 className="text-base font-black text-white">{ROLE_DETAILS[myRole].title}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-6 max-w-xs font-medium">{ROLE_DETAILS[myRole].desc}</p>
        </div>
      )}

      {/* ═══ 3D NIGHT & DAY GAMEPLAY STAGE ═══ */}
      {phase !== 'role_reveal' && phase !== 'verdict' && phase !== 'game_over' && (
        <div className="flex-1 flex flex-col justify-between p-4 min-h-0">
          {/* Seer Scan Result Toast */}
          {seerResult && (
            <div className="py-2 px-4 rounded-2xl bg-purple-600/30 border border-purple-500 text-purple-200 text-xs font-bold text-center animate-pulse">
              🔮 Kahin Görüsü: <strong>{seerResult}</strong>
            </div>
          )}

          {/* 3D Players Council Arena with Isometric Tilt */}
          <div
            style={{ perspective: '900px' }}
            className="my-auto w-full max-w-sm mx-auto flex items-center justify-center py-2"
          >
            <div
              style={{
                transform: 'rotateX(12deg)',
                transformStyle: 'preserve-3d',
              }}
              className="grid grid-cols-3 gap-3.5 w-full p-3 rounded-3xl bg-slate-950/60 border-2 border-slate-800/80 shadow-[0_18px_0_#0b0f19,0_24px_0_#020617,0_30px_45px_rgba(0,0,0,0.85),inset_0_2px_6px_rgba(255,255,255,0.1)]"
            >
              {players.map((p) => {
                const isMe = p.id === currentUser.id;
                const isTargetSelected = nightActionTarget === p.id;
                const isVoteSelected = selectedVote === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (phase === 'night' && p.isAlive && !isMe) handleNightAction(p);
                      if (phase === 'voting' && p.isAlive && me.isAlive) handleSelectVote(p.id);
                    }}
                    className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center relative ${
                      !p.isAlive
                        ? 'opacity-40 bg-slate-900/40 border-slate-800'
                        : isTargetSelected
                        ? 'bg-rose-500/25 border-rose-500 ring-4 ring-rose-500/50 shadow-[0_8px_0_#9f1239,0_12px_20px_rgba(244,63,94,0.6)] scale-105 z-20'
                        : isVoteSelected
                        ? 'bg-amber-500/25 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_8px_0_#b45309,0_12px_20px_rgba(245,158,11,0.6)] scale-105 z-20'
                        : 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-slate-700/60 shadow-[0_6px_0_#0f172a,0_8px_14px_rgba(0,0,0,0.5)] hover:-translate-y-1'
                    }`}
                  >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 relative mb-1.5">
                    <AvatarRenderer config={p.avatarConfig} className="w-full h-full" />
                    {!p.isAlive && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-rose-500 font-black text-lg">
                        ☠️
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-black text-white truncate max-w-[70px]">
                    {isMe ? `${p.name} (Sen)` : p.name}
                  </span>

                  {/* Vote count badge */}
                  {phase === 'voting' && Object.values(playerVotes).filter(t => t === p.id).length > 0 && (
                    <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-[9px] font-black text-white border border-white/40 shadow animate-bounce">
                      🗳️ {Object.values(playerVotes).filter(t => t === p.id).length} OY
                    </span>
                  )}
                </div>
              );
            })}
            </div>
          </div>

          {/* Mini Interactive Task Button for Crew */}
          {phase === 'day_discussion' && !miniTaskDone && (
            <button
              onClick={() => {
                soundFX.playSuccess();
                setMiniTaskDone(true);
                setLogMessages(prev => ['⚡ Reaktör kablolarını bağladın! (+50 TP)', ...prev]);
              }}
              className="py-2.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Gemi Reaktörünü Onar (Mini Görev)</span>
            </button>
          )}

          {/* Live Action Logs */}
          <div className="h-24 bg-slate-950/80 backdrop-blur rounded-2xl p-2 border border-slate-800/80 overflow-y-auto space-y-1 text-xs no-scrollbar shrink-0">
            {logMessages.map((msg, i) => (
              <div key={i} className="text-slate-300 font-medium">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ VERDICT / EJECTION ANIMATION ═══ */}
      {phase === 'verdict' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn bg-gradient-to-b from-indigo-950/30 to-[#070913]">
          {eliminatedPlayer ? (
            <>
              <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-rose-500 shadow-2xl animate-spin duration-1000">
                <AvatarRenderer config={eliminatedPlayer.avatarConfig} className="w-full h-full" />
              </div>
              <h2 className="text-2xl font-black text-yellow-400 mb-2">
                {eliminatedPlayer.name} Uzaya Fırlatıldı! 🚀
              </h2>
              <p className="text-sm font-bold text-slate-300">
                Gerçek Rolü:{' '}
                <span className="text-rose-400 font-black uppercase">
                  {ROLE_DETAILS[eliminatedPlayer.role].title}
                </span>
              </p>
            </>
          ) : (
            <h2 className="text-xl font-black text-white">Eşitlik oldu! Kimse fırlatılmadı.</h2>
          )}
        </div>
      )}

      {/* ═══ GAME OVER SCREEN ═══ */}
      {phase === 'game_over' && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-amber-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {winnerTeam === 'crew' ? '🧑‍🚀 Mürettebat Kazandı!' : '🐺 Uzay Vampirleri Kazandı!'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {winnerTeam === 'werewolf' ? 'Tüm masumlar elendi.' : 'Tüm uzay vampirleri tespit edildi!'}
            </p>

            <div className="w-full bg-slate-800/60 rounded-2xl p-4 mb-6 border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Kazanılan Jeton</span>
                <span className="text-sm font-black text-yellow-400">+250 🪙</span>
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
                  setPhase('role_reveal');
                  setTimer(5);
                  setPlayers(prev => prev.map(p => ({ ...p, isAlive: true })));
                }}
                className="py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-lg shadow-cyan-500/30"
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
