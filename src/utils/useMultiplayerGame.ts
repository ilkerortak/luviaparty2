/**
 * useMultiplayerGame.ts
 * Tüm oyunlar için ortak çok oyunculu RTDB hook'u.
 * roomId varsa RTDB'den state dinler ve yayar; yoksa offline/bot modda çalışır.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToGameRoom,
  subscribeToGameState,
  updateGameState,
  distributeRewards,
  leaveGameRoom,
} from '../services/realtimeGameService';
import type { GameRoom, GamePlayer } from '../types';

interface UseMultiplayerGameOptions {
  roomId?: string;
  currentUserId: string;
  onOpponentState?: (state: Record<string, any>) => void;
}

interface UseMultiplayerGameReturn {
  room: GameRoom | null;
  players: GamePlayer[];
  isMultiplayer: boolean;
  isHost: boolean;
  myPlayer: GamePlayer | null;
  remoteState: Record<string, any>;
  pushState: (patch: Record<string, any>) => Promise<void>;
  rewardWinner: (winnerId?: string, winnerIds?: string[]) => Promise<{ prizeEach: number }>;
  leave: () => Promise<void>;
  prizePool: number;
}

export function useMultiplayerGame({
  roomId,
  currentUserId,
  onOpponentState,
}: UseMultiplayerGameOptions): UseMultiplayerGameReturn {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [remoteState, setRemoteState] = useState<Record<string, any>>({});
  const isMultiplayer = !!roomId;
  const onOpponentRef = useRef(onOpponentState);
  onOpponentRef.current = onOpponentState;

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = subscribeToGameRoom(roomId, setRoom);
    const unsubState = subscribeToGameState(roomId, (s) => {
      setRemoteState(s);
      onOpponentRef.current?.(s);
    });
    return () => {
      unsubRoom();
      unsubState();
    };
  }, [roomId]);

  const players = room
    ? Object.values(room.players).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))
    : [];
  const myPlayer = players.find(p => p.userId === currentUserId) ?? null;
  const isHost = room?.meta.hostId === currentUserId;
  const prizePool = room?.meta.prizePool ?? 0;

  const pushState = useCallback(async (patch: Record<string, any>) => {
    if (!roomId) return;
    await updateGameState(roomId, patch);
  }, [roomId]);

  const rewardWinner = useCallback(async (winnerId?: string, winnerIds?: string[]) => {
    if (!roomId) return { prizeEach: 0 };
    return distributeRewards(roomId, winnerId, winnerIds);
  }, [roomId]);

  const leave = useCallback(async () => {
    if (!roomId) return;
    await leaveGameRoom(roomId, currentUserId);
  }, [roomId, currentUserId]);

  return {
    room,
    players,
    isMultiplayer,
    isHost,
    myPlayer,
    remoteState,
    pushState,
    rewardWinner,
    leave,
    prizePool,
  };
}
