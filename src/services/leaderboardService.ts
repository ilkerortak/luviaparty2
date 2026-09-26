import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit, setDoc, doc, serverTimestamp } from 'firebase/firestore';

export type GameId = 'werewolf' | 'draw_guess' | 'spy' | 'ludo' | 'mic_grab' | 'jackaroo' | 'uno' | 'trivia';

/**
 * Update leaderboard entry for a user after a game win.
 * Stores score based on coins earned (or any metric you prefer).
 */
export async function updateLeaderboard(gameId: GameId, userId: string, username: string, score: number) {
  const leaderboardRef = doc(db, 'leaderboards', gameId, 'entries', userId);
  await setDoc(
    leaderboardRef,
    {
      username,
      score,
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Retrieve top players for a given game.
 */
export async function getTopPlayers(gameId: GameId, topN: number = 10) {
  const leaderboardRef = collection(db, 'leaderboards', gameId, 'entries');
  const q = query(leaderboardRef, orderBy('score', 'desc'), limit(topN));
  const snap = await getDocs(q);
  const results: Array<{ userId: string; username: string; score: number }> = [];
  snap.forEach((doc) => {
    const data = doc.data() as { username: string; score: number };
    results.push({ userId: doc.id, username: data.username, score: data.score });
  });
    return results;
}
