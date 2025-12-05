import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Updates user stats after each guess (incremental updates).
 *
 * @param {string} userId - User ID
 * @param {object} guessData - Data from the guess
 * @param {boolean} guessData.correct - Whether guess was correct
 * @param {number} guessData.scoreDelta - Score change from this guess
 * @param {number} guessData.hintsUsed - Hints used for this question
 * @returns {Promise<void>}
 */
export async function updateUserStatsAfterGuess(userId, guessData) {
  if (!userId || !guessData) return;

  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(userRef);
    const existing = snap.exists() ? snap.data() : {};

    const totalQuestions = (existing.totalQuestions || 0) + 1;
    const totalCorrectAnswers =
      (existing.totalCorrectAnswers || 0) + (guessData.correct ? 1 : 0);
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
        : 0;

    // Update current game in progress stats
    const currentGameStats = existing.currentGameStats || {};
    const newScore = (currentGameStats.score || 0) + guessData.scoreDelta;

    transaction.set(
      userRef,
      {
        totalQuestions,
        totalCorrectAnswers,
        accuracy,
        lastPlayed: Date.now(),
        currentGameStats: {
          score: newScore,
          level: guessData.level || 1,
          lives: guessData.lives || 0,
          correctCount:
            (currentGameStats.correctCount || 0) + (guessData.correct ? 1 : 0),
        },
      },
      { merge: true }
    );
  });
}

/**
 * Saves detailed guess history under a specific game run.
 *
 * @param {string} userId
 * @param {string} gameId
 * @param {object} guessData
 * @returns {Promise<void>}
 */
export async function saveGuessToHistory(userId, gameId, guessData) {
  if (!userId || !gameId || !guessData) return;

  const guessesRef = collection(
    db,
    'users',
    userId,
    'gameHistory',
    gameId,
    'guesses'
  );
  await addDoc(guessesRef, {
    ...guessData,
    timestamp: serverTimestamp(),
  });
}
