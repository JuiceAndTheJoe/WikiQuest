import { fetchLeaderboard, submitGuess } from '../features/game/gameSlice';
import {
  saveGuessToHistory,
  updateUserStatsAfterGuess,
} from '../models/gameProgressModel';
import { saveGameResult } from '../models/leaderboardModel';

let lastPersistedRunId = null;
let currentGameId = null;

const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const userId = state.auth.user?.uid;

  // Watch for game start to generate a gameId
  if (action.type === 'game/startNewGame' && userId) {
    currentGameId = `game_${Date.now()}_${userId}`;
  }

  // After each guess, update user stats and save guess history
  if (action.type === submitGuess.type && userId) {
    const lastResult = state.game?.lastResultDetail;

    if (lastResult) {
      const guessData = {
        correct: lastResult.correct,
        scoreDelta: lastResult.scoreDelta,
        hintsUsed: lastResult.hintsUsed || 0,
        level: state.game.level,
        lives: state.game.lives,
        celeb: lastResult.correctAnswer,
        guess: lastResult.guess,
        timeTakenMs: lastResult.timeTakenMs,
      };

      updateUserStatsAfterGuess(userId, guessData).catch((err) => {
        console.warn('Failed to update user stats after guess', err);
      });

      if (currentGameId) {
        saveGuessToHistory(userId, currentGameId, guessData).catch((err) => {
          console.warn('Failed to save guess to history', err);
        });
      }
    }
  }

  const runSummary = state.game?.lastGameResult;
  if (
    userId &&
    runSummary?.endedAt &&
    runSummary.endedAt !== lastPersistedRunId
  ) {
    lastPersistedRunId = runSummary.endedAt;
    currentGameId = null; // Reset game ID

    saveGameResult(userId, runSummary, {
      email: state.auth.user?.email || null,
      displayName: state.auth.user?.displayName || null,
      photoURL: state.auth.user?.photoURL || null,
    })
      .then(() => {
        store.dispatch(fetchLeaderboard());
      })
      .catch((err) => {
        console.warn('Failed to persist game result', err);
      });
  }

  return result;
};

export default persistenceMiddleware;
