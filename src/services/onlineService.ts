import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  type Unsubscribe
} from 'firebase/firestore';
import { ref as dbRef, push, set, remove, onChildAdded, off, onValue } from 'firebase/database';
import { db, rtdb } from '../firebase/config';
import type { User, VoiceRoom, RoomSeat, MomentPost, ActiveGift } from '../types';

// Sync user profile to Firestore & RTDB so all other users see it in real-time
export async function syncUserProfile(user: User): Promise<void> {
  const now = Date.now();
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      lastOnline: now,
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore syncUserProfile warning:', err);
  }

  try {
    const rtdbUserRef = dbRef(rtdb, `users/${user.id}`);
    await set(rtdbUserRef, {
      id: user.id,
      username: user.username,
      level: user.level,
      exp: user.exp,
      maxExp: user.maxExp,
      totalExp: user.totalExp,
      charm: user.charm,
      coins: user.coins,
      avatarConfig: user.avatarConfig,
      lastOnline: now,
    });
  } catch (err) {
    // RTDB user sync optional warning
  }
}

// Fetch user profile from Firestore
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    console.warn('Firestore getUserProfile warning:', err);
    return null;
  }
}

// Subscribe to Live Voice Room (Seats, Active Gift, and Kick Events)
export function subscribeToVoiceRoom(
  roomId: string,
  onUpdate: (seats: RoomSeat[], activeGift?: ActiveGift | null, kickedUserId?: string | null, host?: User | null, roomData?: any) => void
): Unsubscribe {
  const roomRef = doc(db, 'voice_rooms', roomId);

  let isInitial = true;
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && data.seats) {
        // Only broadcast gifts sent during live session (ignore gifts on initial join)
        const now = Date.now();
        const giftTime = data.giftTimestamp || 0;
        const recentGift = (!isInitial && data.activeGift && (now - giftTime < 5000)) ? data.activeGift : null;
        isInitial = false;

        // Check if anyone was kicked in the last 10 seconds
        const kickTime = data.kickedTimestamp || 0;
        const recentKickedUser = (data.kickedUserId && (now - kickTime < 10000)) ? data.kickedUserId : null;

        onUpdate(data.seats, recentGift, recentKickedUser, data.host || null, data);
      }
    } else {
      // Initialize room in Firestore if new
      const initialSeats: RoomSeat[] = Array.from({ length: 12 }, (_, idx) => ({
        seatIndex: idx,
        user: null,
        isMuted: false,
        isSpeaking: false,
        micLevel: 0,
      }));
      setDoc(roomRef, {
        id: roomId,
        title: '🎙️ Parti & Müzik Kulübü',
        seats: initialSeats,
        activeGift: null,
        updatedAt: Date.now(),
      }, { merge: true }).catch(() => {});
    }
  }, (error) => {
    console.warn('Firestore voice room snapshot error (using offline fallback):', error);
  });
}

// Broadcast a gift popup to all users in the room (both RTDB for 0ms latency and Firestore for persistence)
export async function broadcastRoomGift(
  roomId: string,
  gift: ActiveGift
): Promise<void> {
  const now = Date.now();
  // 1. RTDB instant broadcast (all users in the room get child_added event immediately)
  try {
    const liveGiftsRef = dbRef(rtdb, `voice_rooms/${roomId}/live_gifts`);
    await push(liveGiftsRef, {
      ...gift,
      timestamp: now,
    });
  } catch (err) {
    console.warn('Failed to broadcast room gift in RTDB:', err);
  }

  // 2. Firestore persistence
  try {
    const roomRef = doc(db, 'voice_rooms', roomId);
    await setDoc(roomRef, {
      activeGift: gift,
      giftTimestamp: now,
      updatedAt: now,
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to broadcast room gift in Firestore:', err);
  }
}

// RTDB Real-Time Gift Subscription for Voice Rooms
export function subscribeToLiveGifts(
  roomId: string,
  onGift: (gift: ActiveGift) => void
): () => void {
  const giftsRef = dbRef(rtdb, `voice_rooms/${roomId}/live_gifts`);
  const seenGiftKeys = new Set<string>();

  onChildAdded(giftsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) return;
    const key = snapshot.key || val.id;
    if (key && seenGiftKeys.has(key)) return;
    if (key) seenGiftKeys.add(key);

    const now = Date.now();
    // Accept gifts within last 12 seconds
    if (Math.abs(now - (val.timestamp || 0)) < 12000) {
      onGift(val as ActiveGift);
    }

    // Auto prune old gifts from RTDB
    if (now - (val.timestamp || 0) > 30000) {
      remove(snapshot.ref).catch(() => {});
    }
  });

  return () => {
    off(giftsRef);
  };
}

// Kick user from voice room completely (Host only)
export async function kickUserFromVoiceRoom(
  roomId: string,
  targetUserId: string,
  targetSeatIndex?: number
): Promise<void> {
  const roomRef = doc(db, 'voice_rooms', roomId);
  try {
    const updatePayload: any = {
      kickedUserId: targetUserId,
      kickedTimestamp: Date.now(),
      updatedAt: Date.now(),
    };

    if (targetSeatIndex !== undefined && targetSeatIndex >= 0) {
      await updateVoiceRoomSeat(roomId, targetSeatIndex, null, false);
    }

    await setDoc(roomRef, updatePayload, { merge: true });
  } catch (err) {
    console.warn('Failed to kick user from voice room:', err);
  }
}

// Update Seat in Voice Room (Real-time seat claiming / microphone)
import { runTransaction } from 'firebase/firestore';

export async function updateVoiceRoomSeat(
  roomId: string,
  seatIndex: number,
  user: User | null,
  isSpeaking: boolean = false,
  micLevel: number = 0
): Promise<void> {
  // Update RTDB seat immediately for instant 0ms seat occupancy view
  try {
    const rtdbSeatRef = dbRef(rtdb, `voice_rooms/${roomId}/live_seats/${seatIndex}`);
    if (user) {
      set(rtdbSeatRef, {
        seatIndex,
        user: {
          id: user.id,
          username: user.username,
          avatarConfig: user.avatarConfig,
        },
        isSpeaking,
        micLevel,
        updatedAt: Date.now(),
      }).catch(() => {});
    } else {
      remove(rtdbSeatRef).catch(() => {});
    }
  } catch (e) {}

  const roomRef = doc(db, 'voice_rooms', roomId);
  try {
    await runTransaction(db, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) {
        throw new Error('Room does not exist');
      }
      const data = roomDoc.data();
      const currentSeats: RoomSeat[] = data.seats || [];
      const seatCount = Math.max(12, currentSeats.length, seatIndex + 1);
      const normalizedSeats: RoomSeat[] = Array.from({ length: seatCount }, (_, idx) => {
        const found = currentSeats.find(s => s.seatIndex === idx);
        return found || {
          seatIndex: idx,
          user: null,
          isMuted: false,
          isSpeaking: false,
          micLevel: 0,
        };
      });
      const updatedSeats = normalizedSeats.map(s => {
        // If this user was previously seated on another seat, vacate that seat!
        if (user && s.user?.id === user.id && s.seatIndex !== seatIndex) {
          return {
            ...s,
            user: null,
            isSpeaking: false,
            micLevel: 0,
          };
        }
        if (s.seatIndex === seatIndex) {
          return {
            ...s,
            user,
            isSpeaking,
            micLevel,
          };
        }
        return s;
      });
      transaction.update(roomRef, {
        seats: updatedSeats,
        updatedAt: Date.now(),
      });
    });
  } catch (err) {
    console.warn('Failed to update voice room seat in Firestore:', err);
  }
}

export function subscribeToVoiceRooms(onRooms: (rooms: VoiceRoom[]) => void): Unsubscribe {
  const roomsCol = collection(db, 'voice_rooms');
  const q = query(roomsCol, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: VoiceRoom[] = [];
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);

    snapshot.forEach(docSnap => {
      const room = { id: docSnap.id, ...docSnap.data() } as VoiceRoom;
      const lastActive = room.lastActiveAt || room.createdAt || 0;

      // Auto-purge rooms older than 1 year without activity
      if (room.isPermanent && lastActive > 0 && lastActive < oneYearAgo) {
        deleteVoiceRoom(docSnap.id).catch(() => {});
        return;
      }

      list.push(room);
    });
    onRooms(list);
  }, (error) => {
    console.warn('Voice rooms snapshot error:', error);
  });
}

export async function createVoiceRoom(roomData: Partial<VoiceRoom>): Promise<string> {
  const initialSeats: RoomSeat[] = Array.from({ length: 12 }, (_, idx) => ({
    seatIndex: idx,
    user: (idx === 0 && roomData.host) ? roomData.host : null,
    isMuted: false,
    isSpeaking: false,
    micLevel: 0,
  }));

  const now = Date.now();
  const roomsCol = collection(db, 'voice_rooms');
  const docRef = await addDoc(roomsCol, {
    ...roomData,
    seats: initialSeats,
    activeGift: null,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
  });

  // RTDB: Set seat 0 immediately for instant 0ms occupancy if host is provided
  try {
    if (roomData.host) {
      const rtdbSeatRef = dbRef(rtdb, `voice_rooms/${docRef.id}/live_seats/0`);
      set(rtdbSeatRef, {
        seatIndex: 0,
        user: {
          id: roomData.host.id,
          username: roomData.host.username,
          avatarConfig: roomData.host.avatarConfig,
        },
        isSpeaking: false,
        micLevel: 0,
        updatedAt: now,
      }).catch(() => {});
    }
  } catch (e) {}

  return docRef.id;
}

export async function deleteVoiceRoom(roomId: string): Promise<void> {
  try {
    const roomRef = doc(db, 'voice_rooms', roomId);
    await deleteDoc(roomRef);
  } catch (err) {
    console.warn('Failed to delete voice room from Firestore:', err);
  }
}

export async function updateVoiceRoomActivity(roomId: string): Promise<void> {
  try {
    const roomRef = doc(db, 'voice_rooms', roomId);
    await updateDoc(roomRef, {
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Failed to update room activity timestamp:', err);
  }
}

// Subscribe to Live Room Chat Messages
export function subscribeToRoomMessages(
  roomId: string,
  onMessages: (messages: any[]) => void
): Unsubscribe {
  const messagesCol = collection(db, 'voice_rooms', roomId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    onMessages(list);
  }, (error) => {
    console.warn('Chat snapshot error with orderBy, falling back to simple query:', error);
    onSnapshot(messagesCol, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      onMessages(list);
    }, (fallbackErr) => {
      console.warn('Fallback chat listener also failed:', fallbackErr);
    });
  });
}

// Send Room Chat Message (Both RTDB for 0ms delivery and Firestore for persistent room history)
export async function sendRoomChatMessage(
  roomId: string,
  message: { sender: string; text: string; isGift?: boolean; isSystem?: boolean; avatarConfig?: any }
): Promise<void> {
  const now = Date.now();
  // 1. RTDB instant broadcast
  try {
    const liveChatRef = dbRef(rtdb, `voice_rooms/${roomId}/live_chat`);
    await push(liveChatRef, {
      ...message,
      timestamp: now,
    });
  } catch (err) {
    console.warn('RTDB chat message send warning:', err);
  }

  // 2. Firestore persistent collection
  try {
    const messagesCol = collection(db, 'voice_rooms', roomId, 'messages');
    await addDoc(messagesCol, {
      ...message,
      timestamp: now,
    });
  } catch (err) {
    console.warn('Failed to send room chat message to Firestore:', err);
  }
}

// RTDB Real-Time Live Chat Subscription
export function subscribeToLiveRoomChat(
  roomId: string,
  onMessage: (msg: any) => void
): () => void {
  const liveChatRef = dbRef(rtdb, `voice_rooms/${roomId}/live_chat`);
  const seenMsgKeys = new Set<string>();

  onChildAdded(liveChatRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) return;
    const key = snapshot.key;
    if (key && seenMsgKeys.has(key)) return;
    if (key) seenMsgKeys.add(key);

    const now = Date.now();
    // Accept messages within last 2 minutes
    if (Math.abs(now - (val.timestamp || 0)) < 120000) {
      onMessage({ id: key, ...val });
    }

    // Prune messages older than 3 minutes from RTDB
    if (now - (val.timestamp || 0) > 180000) {
      remove(snapshot.ref).catch(() => {});
    }
  });

  return () => {
    off(liveChatRef);
  };
}

// Subscribe to Live Moments Feed
export function subscribeToMoments(
  onMoments: (posts: MomentPost[]) => void
): Unsubscribe {
  const momentsCol = collection(db, 'moments');
  const q = query(momentsCol, orderBy('createdAt', 'desc'), limit(30));

  return onSnapshot(q, (snapshot) => {
    const posts: MomentPost[] = [];
    snapshot.forEach(docSnap => {
      posts.push({ id: docSnap.id, ...docSnap.data() } as MomentPost);
    });
    if (posts.length > 0) {
      onMoments(posts);
    }
  }, (error) => {
    console.warn('Moments snapshot error:', error);
  });
}

// Publish Moment to Firestore
export async function publishOnlineMoment(post: MomentPost): Promise<void> {
  try {
    const momentsCol = collection(db, 'moments');
    await addDoc(momentsCol, {
      ...post,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('Failed to publish moment to Firestore:', err);
  }
}

// Like Moment in Firestore
export async function toggleOnlineMomentLike(postId: string, incrementVal: number): Promise<void> {
  try {
    const postRef = doc(db, 'moments', postId);
    await updateDoc(postRef, {
      likes: increment(incrementVal),
    });
  } catch (err) {
    console.warn('Failed to update moment like in Firestore:', err);
  }
}
