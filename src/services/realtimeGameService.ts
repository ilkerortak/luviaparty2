/**
 * realtimeGameService.ts
 * Firebase Realtime Database tabanlı çok oyunculu oyun servisi.
 * Düşük gecikme (~50ms) sayesinde tüm oyunlarda anlık eşitleme sağlar.
 */
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
  serverTimestamp,
  type DatabaseReference,
} from 'firebase/database';
import { doc, updateDoc, runTransaction, getDoc } from 'firebase/firestore';
import { rtdb, db } from '../firebase/config';
import type {
  User,
  GameType,
  GameRoom,
  GamePlayer,
  GameRoomMeta,
} from '../types';
import {
  GAME_ENTRY_FEES,
  GAME_MIN_PLAYERS,
  GAME_MAX_PLAYERS,
  PLATFORM_CUT,
} from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function gameRoomRef(roomId: string): DatabaseReference {
  return ref(rtdb, `game_rooms/${roomId}`);
}

function playersRef(roomId: string): DatabaseReference {
  return ref(rtdb, `game_rooms/${roomId}/players`);
}

function stateRef(roomId: string): DatabaseReference {
  return ref(rtdb, `game_rooms/${roomId}/state`);
}

function metaRef(roomId: string): DatabaseReference {
  return ref(rtdb, `game_rooms/${roomId}/meta`);
}

// ─── Create Room ─────────────────────────────────────────────────────────────

/**
 * Yeni bir oyun odası oluşturur ve kullanıcının coinini düşer.
 * Oda oluşturma ücretsizdir; asıl giriş ücreti odaya katılırken alınır.
 */
export async function createGameRoom(
  gameType: GameType,
  host: User,
): Promise<string> {
  const newRoomRef = push(ref(rtdb, 'game_rooms'));
  const roomId = newRoomRef.key!;
  const entryFee = GAME_ENTRY_FEES[gameType];

  const hostPlayer: GamePlayer = {
    userId: host.id,
    username: host.username,
    avatarConfig: host.avatarConfig,
    isReady: false,
    isBot: false,
    paidFee: true,         // host automatically pays
    joinedAt: Date.now(),
    score: 0,
  };

  const meta: GameRoomMeta = {
    gameType,
    status: 'waiting',
    entryFee,
    prizePool: entryFee,   // host's entry fee starts the pool
    minPlayers: GAME_MIN_PLAYERS[gameType],
    maxPlayers: GAME_MAX_PLAYERS[gameType],
    hostId: host.id,
    roomCode: generateRoomCode(),
    createdAt: Date.now(),
  };

  const room: GameRoom = {
    id: roomId,
    meta,
    players: { [host.id]: hostPlayer },
    state: {},
  };

  // Deduct host entry fee from Firestore coins atomically
  await deductCoinsFromUser(host.id, entryFee);

  // Write room to RTDB
  await set(newRoomRef, room);
  return roomId;
}

// ─── Join Room ────────────────────────────────────────────────────────────────

/**
 * Mevcut odaya katıl ve giriş ücretini öde.
 * Kullanıcı yetersiz coin varsa hata fırlatır.
 */
export async function joinGameRoom(
  roomId: string,
  user: User,
): Promise<void> {
  const snap = await get(metaRef(roomId));
  if (!snap.exists()) throw new Error('Oda bulunamadı.');

  const meta = snap.val() as GameRoomMeta;
  if (meta.status !== 'waiting') throw new Error('Oyun zaten başladı!');

  const pSnap = await get(playersRef(roomId));
  const currentCount = pSnap.exists() ? Object.keys(pSnap.val()).length : 0;
  if (currentCount >= meta.maxPlayers) throw new Error('Oda dolu!');

  const entryFee = meta.entryFee;

  // Atomically deduct coins
  await deductCoinsFromUser(user.id, entryFee);

  const player: GamePlayer = {
    userId: user.id,
    username: user.username,
    avatarConfig: user.avatarConfig,
    isReady: false,
    isBot: false,
    paidFee: true,
    joinedAt: Date.now(),
    score: 0,
  };

  await update(ref(rtdb, `game_rooms/${roomId}/players/${user.id}`), player as any);
  await update(metaRef(roomId), {
    prizePool: meta.prizePool + entryFee,
  });
}

// ─── Quick Match ─────────────────────────────────────────────────────────────

/**
 * ⚡ Hızlı Eşleşme (Quick Match):
 * Mevcut açık (waiting) ve dolmamış bir oda arar, varsa hemen katılır.
 * Yoksa yeni oda oluşturur ve oda sahibi (host) olarak odayı kurar.
 */
export async function findOrCreateQuickMatch(
  gameType: GameType,
  user: User,
): Promise<{ roomId: string; isHost: boolean }> {
  try {
    const snap = await get(ref(rtdb, 'game_rooms'));
    if (snap.exists()) {
      const all = snap.val() as Record<string, any>;
      for (const [id, val] of Object.entries(all)) {
        if (
          val.meta?.gameType === gameType &&
          val.meta?.status === 'waiting'
        ) {
          const players = val.players ? Object.keys(val.players) : [];
          // If already in this room as host or player
          if (players.includes(user.id)) {
            return { roomId: id, isHost: val.meta.hostId === user.id };
          }
          if (players.length < val.meta.maxPlayers) {
            // Found open room with slot, join it
            await joinGameRoom(id, user);
            return { roomId: id, isHost: false };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Quick match search failed, creating new room instead:', err);
  }

  // No open room found, create one
  const newRoomId = await createGameRoom(gameType, user);
  return { roomId: newRoomId, isHost: true };
}

// ─── Ready Up ────────────────────────────────────────────────────────────────

export async function setPlayerReady(roomId: string, userId: string, isReady: boolean): Promise<void> {
  await update(ref(rtdb, `game_rooms/${roomId}/players/${userId}`), { isReady });
}

// ─── Start Game ───────────────────────────────────────────────────────────────

export async function startGame(roomId: string, initialState: Record<string, any>): Promise<void> {
  await update(metaRef(roomId), {
    status: 'playing',
    startedAt: Date.now(),
  });
  await set(stateRef(roomId), initialState);
}

// ─── Update Game State ────────────────────────────────────────────────────────

/**
 * Host tarafından her hamle sonrası oyun durumu RTDB'ye yazılır.
 * Tüm oyuncular onValue ile anlık dinler.
 */
export async function updateGameState(
  roomId: string,
  patch: Record<string, any>,
): Promise<void> {
  await update(stateRef(roomId), patch);
}

// ─── Distribute Rewards ───────────────────────────────────────────────────────

/**
 * Oyun bitince kazananı(ları) belirle ve ödül havuzunu dağıt.
 * @param winnerId - tek kazanan (ludo, uno, trivia, spy, draw_guess)
 * @param winnerIds - takım kazananları (werewolf, jackaroo)
 */
export async function distributeRewards(
  roomId: string,
  winnerId?: string,
  winnerIds?: string[],
): Promise<{ prizeEach: number }> {
  const snap = await get(metaRef(roomId));
  if (!snap.exists()) throw new Error('Oda bulunamadı.');

  const meta = snap.val() as GameRoomMeta;
  const pool = meta.prizePool;
  const netPool = Math.floor(pool * (1 - PLATFORM_CUT));

  let winners: string[] = [];
  if (winnerIds && winnerIds.length > 0) {
    winners = winnerIds.filter(id => !id.startsWith('bot_'));
  } else if (winnerId && !winnerId.startsWith('bot_')) {
    winners = [winnerId];
  }

  const prizeEach = winners.length > 0 ? Math.floor(netPool / winners.length) : 0;

  // Award coins to each human winner via Firestore
  await Promise.all(
    winners.map(uid => addCoinsToUser(uid, prizeEach, `Oyun ödülü (${meta.gameType})`))
  );

  // Mark room as finished
  await update(metaRef(roomId), {
    status: 'finished',
    finishedAt: Date.now(),
    winnerId: winnerId || null,
    winnerIds: winnerIds || null,
  });

  return { prizeEach };
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

export function subscribeToGameRoom(
  roomId: string,
  callback: (room: GameRoom | null) => void,
): () => void {
  const roomRef = gameRoomRef(roomId);
  const handler = (snap: any) => {
    if (snap.exists()) {
      callback({ id: roomId, ...snap.val() } as GameRoom);
    } else {
      callback(null);
    }
  };
  onValue(roomRef, handler);
  return () => off(roomRef, 'value', handler);
}

export function subscribeToGameState(
  roomId: string,
  callback: (state: Record<string, any>) => void,
): () => void {
  const sRef = stateRef(roomId);
  const handler = (snap: any) => {
    callback(snap.exists() ? snap.val() : {});
  };
  onValue(sRef, handler);
  return () => off(sRef, 'value', handler);
}

/** Subscribe to available rooms of a specific gameType (lobby listing) */
export function subscribeToOpenRooms(
  gameType: GameType,
  callback: (rooms: GameRoom[]) => void,
): () => void {
  const allRoomsRef = ref(rtdb, 'game_rooms');
  const handler = (snap: any) => {
    if (!snap.exists()) { callback([]); return; }
    const all = snap.val() as Record<string, any>;
    const rooms = Object.entries(all)
      .map(([id, val]) => ({ id, ...val } as GameRoom))
      .filter(r => r.meta?.gameType === gameType && r.meta?.status === 'waiting');
    callback(rooms);
  };
  onValue(allRoomsRef, handler);
  return () => off(allRoomsRef, 'value', handler);
}

// ─── Leave / Abandon ─────────────────────────────────────────────────────────

export async function leaveGameRoom(roomId: string, userId: string): Promise<void> {
  try {
    await remove(ref(rtdb, `game_rooms/${roomId}/players/${userId}`));
    // If no human players remain, delete room
    const snap = await get(playersRef(roomId));
    if (!snap.exists()) {
      await remove(gameRoomRef(roomId));
    }
  } catch (err) {
    console.warn('leaveGameRoom error:', err);
  }
}

/** Host can delete the room entirely */
export async function deleteGameRoom(roomId: string): Promise<void> {
  await remove(gameRoomRef(roomId));
}

/** Find a room by its 6-digit code */
export async function findRoomByCode(code: string): Promise<GameRoom | null> {
  const snap = await get(ref(rtdb, 'game_rooms'));
  if (!snap.exists()) return null;
  const all = snap.val() as Record<string, any>;
  for (const [id, val] of Object.entries(all)) {
    if ((val as any).meta?.roomCode === code && (val as any).meta?.status === 'waiting') {
      return { id, ...val } as GameRoom;
    }
  }
  return null;
}

// ─── Firestore Coin Helpers ───────────────────────────────────────────────────

async function deductCoinsFromUser(userId: string, amount: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('Kullanıcı bulunamadı.');
    const current = snap.data().coins || 0;
    if (current < amount) throw new Error('Yetersiz jeton!');
    tx.update(userRef, { coins: current - amount });
  });
}

async function addCoinsToUser(userId: string, amount: number, _reason?: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const current = snap.data().coins || 0;
      await updateDoc(userRef, { coins: current + amount });
    }
  } catch (err) {
    console.warn('addCoinsToUser error:', err);
  }
}
