import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, doc, setDoc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';

/**
 * Chat service using Firestore for real‑time messages.
 * Each chat room is stored under `rooms/{roomId}/messages`.
 * Typing indicator is stored under `rooms/{roomId}/typing/{userId}` with a boolean flag.
 */
export const chatService = {
  /**
   * Send a message to a room.
   */
  async sendMessage(roomId: string, userId: string, username: string, text: string) {
    const msgRef = collection(db, 'rooms', roomId, 'messages');
    await addDoc(msgRef, {
      senderId: userId,
      senderName: username,
      text,
      timestamp: serverTimestamp(),
    });
  },

  /**
   * Delete a specific message by its ID
   */
  async deleteMessage(roomId: string, messageId: string) {
    try {
      const msgDoc = doc(db, 'rooms', roomId, 'messages', messageId);
      await deleteDoc(msgDoc);
    } catch (e) {
      console.warn('Failed to delete message:', e);
    }
  },

  /**
   * Clear all messages in a conversation
   */
  async clearConversation(roomId: string) {
    try {
      const msgs = collection(db, 'rooms', roomId, 'messages');
      const snap = await getDocs(msgs);
      const promises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(promises);
    } catch (e) {
      console.warn('Failed to clear conversation:', e);
    }
  },

  /**
   * Subscribe to new messages in a room.
   * Callback receives an array of messages ordered by timestamp.
   */
  subscribe(roomId: string, onUpdate: (messages: any[]) => void) {
    const msgs = collection(db, 'rooms', roomId, 'messages');
    const q = query(msgs, orderBy('timestamp'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      onUpdate(data);
    });
    return unsub;
  },

  /**
   * Set typing status for a user.
   */
  async setTyping(roomId: string, userId: string, isTyping: boolean) {
    const typingRef = doc(db, 'rooms', roomId, 'typing', userId);
    await setDoc(typingRef, { isTyping }, { merge: true });
  },

  /**
   * Subscribe to typing indicators in a room.
   */
  subscribeTyping(roomId: string, onUpdate: (typingMap: Record<string, boolean>) => void) {
    const typingCol = collection(db, 'rooms', roomId, 'typing');
    const unsub = onSnapshot(typingCol, (snap) => {
      const map: Record<string, boolean> = {};
      snap.forEach((doc) => {
        const data = doc.data() as { isTyping: boolean };
        map[doc.id] = data.isTyping;
      });
      onUpdate(map);
    });
    return unsub;
  },
};
