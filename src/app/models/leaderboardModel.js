import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { USER_COLLECTION } from './constants';

/**
 * Fetches the leaderboard data from Firestore.
 *
 * @param {number} maxCount - Maximum number of leaderboard entries to fetch
 * @returns {Promise<Array< { userId: string, email: string, name: string, highScore: string, gamesPlayed: string, averageScore: string, accuracy: string, lastPlayed: string  } >>} - Array of leaderboard entries
 */
export async function getLeaderboard(maxCount = 10) {
  try {
    const leaderboardRef = collection(db, USER_COLLECTION);
    const q = query(
      leaderboardRef,
      orderBy('highScore', 'desc'),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);

    const leaderboard = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        userId: doc.id,
        email: data.email || 'Anonymous',
        name: data.displayName || data.email || 'Player',
        highScore: data.highScore || 0,
        gamesPlayed: data.gamesPlayed || 0,
        averageScore: data.averageScore || 0,
        accuracy: data.accuracy || 0,
        lastPlayed: data.lastPlayed || null,
      });
    });

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

/**
 * Saves the game result to the user's profile in Firestore.
 *
 * @param {number} userId - User ID
 * @param {object} summary - Game summary data
 * @param {object} userProfile - User profile data
 * @returns {Promise<void>}
 */
export async function saveGameResult(userId, summary = {}, userProfile = {}) {
  if (!userId || !summary) return;
  const userRef = doc(db, USER_COLLECTION, userId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef);
    const existing = snap.exists() ? snap.data() : {};

    const safeScore = summary.finalScore || 0;
    const safeCorrect = summary.correctAnswers || 0;
    const safeQuestions = summary.totalQuestions || 0;

    const totalScore = (existing.totalScore || 0) + safeScore;
    const gamesPlayed = (existing.gamesPlayed || 0) + 1;
    const totalCorrectAnswers =
      (existing.totalCorrectAnswers || 0) + safeCorrect;
    const totalQuestions = (existing.totalQuestions || 0) + safeQuestions;
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
        : 0;
    const averageScore =
      gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : safeScore;

    transaction.set(
      userRef,
      {
        email: userProfile.email || existing.email || null,
        displayName: userProfile.displayName || existing.displayName || null,
        photoURL: userProfile.photoURL || existing.photoURL || null,
        highScore: Math.max(existing.highScore || 0, safeScore),
        gamesPlayed,
        totalScore,
        averageScore,
        totalCorrectAnswers,
        totalQuestions,
        accuracy,
        lastPlayed: summary.endedAt || Date.now(),
      },
      { merge: true }
    );
  });
}
