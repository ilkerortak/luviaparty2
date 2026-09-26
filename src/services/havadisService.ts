import { ref, push, onChildAdded, remove, off } from 'firebase/database';
import { rtdb } from '../firebase/config';

export interface GlobalHavadis {
  id: string;
  senderName: string;
  roomId: string;
  roomTitle: string;
  roomNumber?: string;
  giftName?: string;
  targetUserName?: string;
  totalGold: number;
  message: string;
  unlockAt?: number;
  timestamp: number;
}

// In-memory active listeners for instant 0ms broadcast across components
const activeListeners = new Set<(announcement: GlobalHavadis) => void>();
const seenHavadisIds = new Set<string>();

// Broadcast a server-wide red packet announcement (Havadis)
export async function broadcastGlobalHavadis(data: Omit<GlobalHavadis, 'id' | 'timestamp'>): Promise<void> {
  const announcement: GlobalHavadis = {
    id: `havadis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...data,
    timestamp: Date.now(),
  };

  seenHavadisIds.add(announcement.id);

  // 1. Instantly trigger all local listeners in current window (0ms response)
  activeListeners.forEach(cb => {
    try { cb(announcement); } catch (e) { console.warn(e); }
  });

  // 2. Dispatch custom event on window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('global_havadis', { detail: announcement }));
  }

  // 3. Push to Firebase Realtime Database for all other players / rooms
  try {
    const havadisRef = ref(rtdb, 'server_announcements');
    await push(havadisRef, announcement);
  } catch (err) {
    console.warn('[Havadis] Failed to push to RTDB:', err);
  }
}

// Subscribe to global havadis announcements across the app
export function subscribeToGlobalHavadis(
  callback: (announcement: GlobalHavadis) => void
): () => void {
  // Add to in-memory set
  activeListeners.add(callback);

  // Window event listener
  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent<GlobalHavadis>).detail;
    if (detail && detail.id) {
      callback(detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('global_havadis', handleCustomEvent);
  }

  // RTDB listener for remote players
  const havadisRef = ref(rtdb, 'server_announcements');
  const unsubscribe = onChildAdded(havadisRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) return;

    const id = snapshot.key || val.id;
    if (id && seenHavadisIds.has(id)) {
      return; // Already processed
    }
    if (id) seenHavadisIds.add(id);

    const now = Date.now();
    // Accept announcements within last 3 minutes (handles clock skews)
    if (Math.abs(now - (val.timestamp || 0)) < 180000) {
      callback({
        id: id || `havadis_${Date.now()}`,
        ...val,
      });
    }

    // Clean up older announcements
    if (now - (val.timestamp || 0) > 180000) {
      remove(snapshot.ref).catch(() => {});
    }
  });

  return () => {
    activeListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('global_havadis', handleCustomEvent);
    }
    off(havadisRef);
  };
}
