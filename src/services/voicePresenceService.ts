import {
  ref,
  set,
  remove,
  onDisconnect,
  onValue,
  off,
  type DataSnapshot
} from 'firebase/database';
import { rtdb } from '../firebase/config';
import { updateVoiceRoomSeat } from './onlineService';
import type { User, RoomSeat } from '../types';
import { App as CapApp } from '@capacitor/app';

export interface PresenceUser {
  userId: string;
  username: string;
  avatarConfig?: any;
  seatIndex: number | null;
  lastSeen: number;
  online: boolean;
}

class VoicePresenceService {
  private currentRoomId: string | null = null;
  private currentUser: User | null = null;
  private currentSeatIndex: number | null = null;
  private heartbeatTimer: any = null;
  private appStateSub: any = null;
  private isCleaningUp: boolean = false;

  constructor() {
    this.setupGlobalExitListeners();
  }

  // Setup window & mobile app unload listeners
  private setupGlobalExitListeners() {
    if (typeof window !== 'undefined') {
      const handleUnload = () => {
        this.leaveCurrentRoomSync();
      };

      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('pagehide', handleUnload);

      // Capacitor App background / exit listener
      try {
        CapApp.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            // App was minimized, sent to background, or user is exiting
            this.leaveCurrentRoomSync();
          } else {
            // App resumed: refresh heartbeat & presence if in room
            if (this.currentRoomId && this.currentUser) {
              this.refreshPresence();
            }
          }
        }).then(sub => {
          this.appStateSub = sub;
        }).catch(() => {});
      } catch (e) {
        // Not running in Capacitor environment
      }
    }
  }

  // Join or update user's presence in a voice room
  public joinRoom(roomId: string, user: User, seatIndex: number | null = null) {
    // If switching rooms, vacate previous room first
    if (this.currentRoomId && this.currentRoomId !== roomId) {
      this.leaveRoom();
    }

    this.currentRoomId = roomId;
    this.currentUser = user;
    this.currentSeatIndex = seatIndex;
    this.isCleaningUp = false;

    this.registerRTDBPresence();
    this.startHeartbeat();
  }

  // Update current user's seat index (when sitting down or standing up)
  public updateSeat(seatIndex: number | null) {
    if (!this.currentRoomId || !this.currentUser) return;

    const previousSeat = this.currentSeatIndex;
    this.currentSeatIndex = seatIndex;

    // Clear previous seat in RTDB live seats if existed
    if (previousSeat !== null && previousSeat !== seatIndex) {
      const oldSeatRef = ref(rtdb, `voice_rooms/${this.currentRoomId}/live_seats/${previousSeat}`);
      remove(oldSeatRef).catch(() => {});
    }

    this.registerRTDBPresence();
  }

  // Register presence and server-side onDisconnect hooks in Firebase RTDB
  private registerRTDBPresence() {
    if (!this.currentRoomId || !this.currentUser) return;

    const roomId = this.currentRoomId;
    const userId = this.currentUser.id;
    const seatIdx = this.currentSeatIndex;

    try {
      // 1. User presence node
      const presenceRef = ref(rtdb, `voice_rooms/${roomId}/presence/${userId}`);
      const presenceDisconnect = onDisconnect(presenceRef);
      presenceDisconnect.remove().catch(() => {});

      const payload: PresenceUser = {
        userId,
        username: this.currentUser.username,
        avatarConfig: this.currentUser.avatarConfig || null,
        seatIndex: seatIdx,
        lastSeen: Date.now(),
        online: true,
      };

      set(presenceRef, payload).catch(() => {});

      // 2. If seated, register live seat node with onDisconnect
      if (seatIdx !== null) {
        const seatRef = ref(rtdb, `voice_rooms/${roomId}/live_seats/${seatIdx}`);
        const seatDisconnect = onDisconnect(seatRef);
        seatDisconnect.remove().catch(() => {});

        set(seatRef, {
          userId,
          occupiedAt: Date.now(),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('VoicePresenceService registerRTDBPresence warning:', err);
    }
  }

  // Refresh timestamp in RTDB every 5 seconds
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.refreshPresence();
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private refreshPresence() {
    if (!this.currentRoomId || !this.currentUser || this.isCleaningUp) return;

    const presenceRef = ref(
      rtdb,
      `voice_rooms/${this.currentRoomId}/presence/${this.currentUser.id}/lastSeen`
    );
    set(presenceRef, Date.now()).catch(() => {});
  }

  // Synchronous exit cleanup (for beforeunload / appStateChange / component unmount)
  public leaveCurrentRoomSync() {
    if (!this.currentRoomId || !this.currentUser) return;
    this.isCleaningUp = true;

    const roomId = this.currentRoomId;
    const userId = this.currentUser.id;
    const seatIndex = this.currentSeatIndex;

    // 1. RTDB removal
    try {
      const presenceRef = ref(rtdb, `voice_rooms/${roomId}/presence/${userId}`);
      remove(presenceRef).catch(() => {});

      if (seatIndex !== null) {
        const seatRef = ref(rtdb, `voice_rooms/${roomId}/live_seats/${seatIndex}`);
        remove(seatRef).catch(() => {});
      }
    } catch (e) {
      // Ignore
    }

    // 2. Firestore seat vacation
    if (seatIndex !== null) {
      updateVoiceRoomSeat(roomId, seatIndex, null, false).catch(() => {});
    }

    this.stopHeartbeat();
    this.currentRoomId = null;
    this.currentUser = null;
    this.currentSeatIndex = null;
  }

  // Normal room leave (when leaving room explicitly)
  public leaveRoom() {
    this.leaveCurrentRoomSync();
  }

  // Subscribe to live room presence in RTDB
  public subscribeRoomPresence(
    roomId: string,
    callback: (presenceMap: Record<string, PresenceUser>) => void
  ): () => void {
    const presenceRef = ref(rtdb, `voice_rooms/${roomId}/presence`);

    const listener = (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      const now = Date.now();
      const activeMap: Record<string, PresenceUser> = {};

      Object.entries(data).forEach(([uid, val]: [string, any]) => {
        // Consider offline if lastSeen is older than 20 seconds
        if (val && typeof val === 'object') {
          const age = now - (val.lastSeen || 0);
          if (age < 20000) {
            activeMap[uid] = val as PresenceUser;
          }
        }
      });

      callback(activeMap);
    };

    onValue(presenceRef, listener);

    return () => {
      off(presenceRef, 'value', listener);
    };
  }

  // Automatically cleans up ghost/stale seats in Firestore if a seated user went offline
  public filterAndCleanSeats(
    roomId: string,
    remoteSeats: RoomSeat[],
    presenceMap: Record<string, PresenceUser>,
    currentUserId: string,
    onSeatCleaned?: (seatIndex: number) => void
  ): RoomSeat[] {
    const now = Date.now();

    return remoteSeats.map(seat => {
      if (!seat.user) return seat;

      // Current user is always considered live locally
      if (seat.user.id === currentUserId) return seat;

      // Check if user has active presence in RTDB
      const presence = presenceMap[seat.user.id];
      const isOnline = presence && (now - (presence.lastSeen || 0) < 20000);

      if (!isOnline) {
        // User left the app or disconnected! Clear stale seat in Firestore
        updateVoiceRoomSeat(roomId, seat.seatIndex, null, false).catch(() => {});
        if (onSeatCleaned) onSeatCleaned(seat.seatIndex);
        return {
          ...seat,
          user: null,
          isSpeaking: false,
          micLevel: 0,
        };
      }

      return seat;
    });
  }
}

export const voicePresence = new VoicePresenceService();
