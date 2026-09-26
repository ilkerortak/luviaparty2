/**
 * GameRoomLobby.tsx
 * Firebase RTDB tabanlı gerçek zamanlı çok oyunculu oyun lobisi.
 * Giriş ücreti onayı, oda kodu paylaşımı, hazır onayı ve geri sayım içerir.
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { User, GameType, GameRoom, GamePlayer } from '../../types';
import { GAME_ENTRY_FEES, GAME_MIN_PLAYERS, GAME_MAX_PLAYERS, PLATFORM_CUT } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import {
  createGameRoom,
  joinGameRoom,
  findOrCreateQuickMatch,
  setPlayerReady,
  startGame,
  subscribeToGameRoom,
  leaveGameRoom,
  deleteGameRoom,
  findRoomByCode,
} from '../../services/realtimeGameService';
import {
  ArrowLeft,
  Users,
  Play,
  Copy,
  Check,
  Crown,
  Coins,
  Trophy,
  Timer,
  Search,
  X,
  Zap,
  Shield,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const GAME_LABELS: Record<GameType, { title: string; emoji: string; bg: string }> = {
  ludo:       { title: 'Kızma Birader',    emoji: '🎲', bg: 'from-emerald-900 to-teal-950' },
  uno:        { title: 'UNO Çılgınlığı',   emoji: '🃏', bg: 'from-red-900 to-rose-950' },
  draw_guess: { title: 'Çiz & Tahmin',     emoji: '🎨', bg: 'from-pink-900 to-rose-950' },
  werewolf:   { title: 'Uzay Vampiri',     emoji: '🐺', bg: 'from-purple-900 to-indigo-950' },
  spy:        { title: 'Casus Kim?',       emoji: '🕵️', bg: 'from-cyan-900 to-teal-950' },
  mic_grab:   { title: 'Şarkıyı Yakala',  emoji: '🎤', bg: 'from-indigo-900 to-blue-950' },
  jackaroo:   { title: 'Jackaroo',         emoji: '👑', bg: 'from-amber-900 to-orange-950' },
  trivia:     { title: 'Bilgi Yarışması',  emoji: '🧠', bg: 'from-amber-900 to-yellow-950' },
};

interface Props {
  gameType: GameType;
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onGameStart: (roomId: string) => void;
  onClose: () => void;
}

type Screen = 'entry' | 'lobby' | 'code_entry' | 'countdown';

export const GameRoomLobby: React.FC<Props> = ({
  gameType,
  currentUser,
  onUpdateUser,
  onGameStart,
  onClose,
}) => {
  const entryFee = GAME_ENTRY_FEES[gameType];
  const minPlayers = GAME_MIN_PLAYERS[gameType];
  const maxPlayers = GAME_MAX_PLAYERS[gameType];
  const label = GAME_LABELS[gameType];

  const [screen, setScreen] = useState<Screen>('entry');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  // Subscribe to RTDB room updates
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToGameRoom(roomId, (r) => {
      setRoom(r);
      if (r?.meta.status === 'playing') {
        setScreen('countdown');
      }
    });
    return unsub;
  }, [roomId]);

  // Countdown to start
  useEffect(() => {
    if (screen !== 'countdown') return;
    soundFX.playSuccess();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(t);
          onGameStart(roomId!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen]);

  const handleCreateRoom = async () => {
    if (currentUser.coins < entryFee) {
      setError(`Yetersiz jeton! En az ${entryFee}🪙 gerekiyor.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const id = await createGameRoom(gameType, currentUser);
      onUpdateUser({ ...currentUser, coins: currentUser.coins - entryFee });
      setRoomId(id);
      setIsHost(true);
      setScreen('lobby');
      soundFX.playSuccess();
    } catch (e: any) {
      setError(e.message || 'Oda oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (codeInput.length !== 6) { setError('6 haneli kod girin.'); return; }
    setLoading(true);
    setError(null);
    try {
      const found = await findRoomByCode(codeInput);
      if (!found) { setError('Oda bulunamadı veya oyun başlamış.'); setLoading(false); return; }
      if (currentUser.coins < found.meta.entryFee) {
        setError(`Yetersiz jeton! Bu oda için ${found.meta.entryFee}🪙 gerekiyor.`);
        setLoading(false);
        return;
      }
      await joinGameRoom(found.id, currentUser);
      onUpdateUser({ ...currentUser, coins: currentUser.coins - found.meta.entryFee });
      setRoomId(found.id);
      setIsHost(false);
      setScreen('lobby');
      soundFX.playSuccess();
    } catch (e: any) {
      setError(e.message || 'Odaya katılınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMatch = async () => {
    if (currentUser.coins < entryFee) {
      setError(`Yetersiz jeton! En az ${entryFee}🪙 gerekiyor.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const match = await findOrCreateQuickMatch(gameType, currentUser);
      onUpdateUser({ ...currentUser, coins: currentUser.coins - entryFee });
      setRoomId(match.roomId);
      setIsHost(match.isHost);
      setScreen('lobby');
      soundFX.playSuccess();
    } catch (e: any) {
      setError(e.message || 'Hızlı eşleşme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!roomId) return;
    const me = room?.players[currentUser.id];
    soundFX.playPop();
    await setPlayerReady(roomId, currentUser.id, !me?.isReady);
  };

  const handleStartGame = async () => {
    if (!roomId || !isHost) return;
    const players = room ? Object.values(room.players) : [];
    if (players.length < minPlayers) {
      setError(`En az ${minPlayers} oyuncu gerekiyor.`);
      return;
    }
    soundFX.playSuccess();
    await startGame(roomId, { phase: 'starting', turnIndex: 0 });
  };

  const handleLeave = async () => {
    if (!roomId) { onClose(); return; }
    if (isHost) {
      await deleteGameRoom(roomId);
    } else {
      await leaveGameRoom(roomId, currentUser.id);
    }
    soundFX.playPop();
    onClose();
  };

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.meta.roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    soundFX.playPop();
  };

  const players: GamePlayer[] = room ? Object.values(room.players) : [];
  const prizePool = room?.meta.prizePool ?? entryFee;
  const netPrize = Math.floor(prizePool * (1 - PLATFORM_CUT));

  // ─── COUNTDOWN SCREEN ────────────────────────────────────────────────────
  if (screen === 'countdown') {
    return (
      <div className={`fixed inset-0 max-w-md mx-auto z-50 bg-gradient-to-b ${label.bg} flex flex-col items-center justify-center text-white shadow-2xl`}>
        <div className="text-8xl font-black animate-bounce">{countdown}</div>
        <div className="mt-4 text-xl font-bold text-white/80">Oyun Başlıyor!</div>
        <div className="mt-2 text-4xl">{label.emoji}</div>
      </div>
    );
  }

  // ─── ENTRY SCREEN ─────────────────────────────────────────────────────────
  if (screen === 'entry' || screen === 'code_entry') {
    return (
      <div className={`fixed inset-0 max-w-md mx-auto z-50 bg-gradient-to-b ${label.bg} flex flex-col text-white shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] border-b border-white/10 flex-shrink-0">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-base font-black">{label.emoji} {label.title}</div>
            <div className="text-xs text-white/50">Çok Oyunculu Lobi</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          {/* Prize pool preview */}
          <div className="w-full max-w-sm rounded-3xl bg-white/10 border border-white/20 p-5 text-center backdrop-blur">
            <div className="text-3xl mb-1">{label.emoji}</div>
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Giriş Ücreti</div>
            <div className="text-5xl font-black text-yellow-300 my-1">{entryFee}<span className="text-2xl ml-1">🪙</span></div>
            <div className="text-xs text-white/50">{minPlayers}–{maxPlayers} oyuncu • Havuz = tüm giriş ücretleri</div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-emerald-300 text-sm font-bold">
              <Trophy className="w-4 h-4" />
              <span>Kazanan %{Math.round((1 - PLATFORM_CUT) * 100)} havuzu alır</span>
            </div>
          </div>

          {/* Coin balance */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/60">Bakiyen:</span>
            <span className={`font-black ${currentUser.coins >= entryFee ? 'text-yellow-300' : 'text-rose-400'}`}>
              {currentUser.coins.toLocaleString()}🪙
            </span>
          </div>

          {error && (
            <div className="w-full max-w-sm bg-rose-500/20 border border-rose-500 rounded-2xl px-4 py-2 text-rose-300 text-sm text-center">
              {error}
            </div>
          )}

          {screen === 'code_entry' ? (
            <div className="w-full max-w-sm space-y-3">
              <input
                type="number"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.slice(0, 6))}
                placeholder="6 haneli oda kodu"
                className="w-full text-center text-2xl font-black bg-white/10 border border-white/20 rounded-2xl px-4 py-3 outline-none placeholder-white/30 tracking-widest"
              />
              <button
                onClick={handleJoinByCode}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-sm shadow-lg active:scale-95 transition disabled:opacity-50"
              >
                {loading ? '⏳ Katılıyor...' : '🚀 Odaya Katıl'}
              </button>
              <button
                onClick={() => { setScreen('entry'); setError(null); }}
                className="w-full py-3 rounded-2xl bg-white/10 font-bold text-sm"
              >
                ← Geri
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={handleQuickMatch}
                disabled={loading || currentUser.coins < entryFee}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 font-black text-sm shadow-lg shadow-teal-500/30 active:scale-95 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                {loading ? 'Eşleşiyor...' : `⚡ Hızlı Eşleş • ${entryFee}🪙`}
              </button>

              <button
                onClick={handleCreateRoom}
                disabled={loading || currentUser.coins < entryFee}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 font-black text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                {loading ? 'Oluşturuluyor...' : `Oda Kur • ${entryFee}🪙`}
              </button>

              <button
                onClick={() => { setScreen('code_entry'); setError(null); }}
                className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/20 font-black text-sm active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Koda Göre Odaya Katıl
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── LOBBY SCREEN ─────────────────────────────────────────────────────────
  const me = room?.players[currentUser.id];
  const otherPlayers = players.filter(p => p.userId !== room?.meta.hostId);
  const allOthersReady = otherPlayers.length > 0 && otherPlayers.every(p => p.isReady);
  const canHostStart = players.length >= minPlayers && (otherPlayers.length === 0 || allOthersReady);

  return (
    <div className={`fixed inset-0 max-w-md mx-auto z-50 bg-gradient-to-b ${label.bg} flex flex-col text-white shadow-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] border-b border-white/10 bg-black/20 backdrop-blur flex-shrink-0">
        <button onClick={handleLeave} className="p-1.5 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-sm font-black">{label.emoji} {label.title}</div>
          <div className="text-[10px] text-white/50">{isHost ? '👑 Oda Sahibisin' : 'Bekleniyor...'}</div>
        </div>
        {/* Room code */}
        <button onClick={copyCode} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-black">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{room?.meta.roomCode ?? '------'}</span>
        </button>
      </div>

      {/* Prize Pool Banner */}
      <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-400/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white/70">Ödül Havuzu:</span>
          <span className="font-black text-yellow-300">{prizePool.toLocaleString()}🪙</span>
        </div>
        <div className="text-[10px] text-white/40">Kazanan: ~{netPrize.toLocaleString()}🪙</div>
      </div>

      {/* Player Slots */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
        {Array.from({ length: maxPlayers }).map((_, idx) => {
          const player = players[idx];
          const isMe = player?.userId === currentUser.id;
          if (!player) {
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 border-dashed">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 border-dashed flex items-center justify-center text-white/30 text-xl font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/40 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Gerçek Oyuncu Bekleniyor...
                  </div>
                  <div className="text-[10px] text-white/20">Koltuk {idx + 1}</div>
                </div>
              </div>
            );
          }
          return (
            <div key={player.userId} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              player.userId === room?.meta.hostId || player.isReady
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-white/10 border-white/10'
            }`}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                <AvatarRenderer config={player.avatarConfig} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {player.userId === room?.meta.hostId && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                  <span className="font-black text-sm truncate">{player.username}</span>
                  {isMe && <span className="text-[10px] text-emerald-300 font-bold">(Sen)</span>}
                </div>
                <div className="text-[10px] text-white/50">
                  {player.userId === room?.meta.hostId
                    ? '👑 Oda Sahibi'
                    : player.isReady
                    ? '✅ Hazır'
                    : '⏳ Hazır Olması Bekleniyor'}
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                player.userId === room?.meta.hostId || player.isReady
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]'
                  : 'bg-slate-600'
              }`} />
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mx-4 mb-2 bg-rose-500/20 border border-rose-500 rounded-2xl px-4 py-2 text-rose-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="px-4 pb-6 pt-2 flex gap-3 flex-shrink-0">
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={!canHostStart}
            className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
              canHostStart
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                : 'bg-white/10 text-white/40'
            }`}
          >
            <Play className="w-4 h-4" />
            {players.length < minPlayers
              ? `Oyuncu Bekleniyor (${players.length}/${minPlayers})`
              : !canHostStart
              ? 'Oyuncuların Hazır Olması Bekleniyor...'
              : 'Oyunu Başlat!'}
          </button>
        ) : (
          <button
            onClick={handleToggleReady}
            className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
              me?.isReady
                ? 'bg-gradient-to-r from-rose-500 to-pink-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
            }`}
          >
            <Shield className="w-4 h-4" />
            {me?.isReady ? 'Hazır Değilim' : 'Hazırım!'}
          </button>
        )}
      </div>
    </div>
  );
};
