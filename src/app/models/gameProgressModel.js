import {
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
  SESSION_COLLECTION,
  SESSION_GAME_DOC_ID,
  USER_COLLECTION,
} from './constants';

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

  const userRef = doc(db, USER_COLLECTION, userId);

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
 * Saves the current game state for the user.
 *
 * @param {string} userId - User ID
 * @param {object} gameState - Current game state to save
 * @returns {Promise<void>}
 */
export async function saveCurrentGameState(userId, gameState) {
  if (!userId || !gameState) return;

  const userRef = doc(
    db,
    USER_COLLECTION,
    userId,
    SESSION_COLLECTION,
    SESSION_GAME_DOC_ID
  );

  await runTransaction(db, async (transaction) => {
    transaction.set(userRef, {
      ...gameState,
      savedAt: serverTimestamp(),
    });
  });
}

/**
 * Loads the saved game state for the user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Loaded game state or null if none exists
 */
export async function loadSavedGameState(userId) {
  if (!userId) return null;

  const userRef = doc(
    db,
    USER_COLLECTION,
    userId,
    SESSION_COLLECTION,
    SESSION_GAME_DOC_ID
  );
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Clears the saved game state for the user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearSavedGameState(userId) {
  if (!userId) return;

  const gameStateRef = doc(
    db,
    USER_COLLECTION,
    userId,
    SESSION_COLLECTION,
    SESSION_GAME_DOC_ID
  );
  await deleteDoc(gameStateRef);
}

/**
 * Checks if a saved game exists for the user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if a saved game exists, false otherwise
 */
export async function hasSavedGame(userId) {
  if (!userId) return false;

  const userRef = doc(
    db,
    USER_COLLECTION,
    userId,
    SESSION_COLLECTION,
    SESSION_GAME_DOC_ID
  );
  const snap = await getDoc(userRef);
  return snap.exists();
}
