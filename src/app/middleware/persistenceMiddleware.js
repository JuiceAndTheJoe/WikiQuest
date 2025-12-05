import {
  fetchLeaderboard,
  setSavedGameFlag,
  startNewGame,
  submitGuess,
  useHint,
} from '../features/game/gameSlice';
import {
  clearSavedGameState,
  saveCurrentGameState,
} from '../models/gameProgressModel';
import { saveGameResult } from '../models/leaderboardModel';
import {
  saveGuestGameState,
  clearGuestGameState,
  saveGuestGameResult,
} from '../models/guestStorageModel';
import { isGuestUser } from '../features/auth/guestUtils';

let lastPersistedRunId = null;

const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const userId = state.auth.user?.uid;
  const isGuest = userId && isGuestUser(userId);

  // Watch for game start to generate a gameId
  if (action.type === startNewGame.type && userId && !state.game.hasSavedGame) {
    if (isGuest) {
      // Save to localStorage for guests
      saveGuestGameState(userId, { ...state.game })
        .then(() => {
          store.dispatch(setSavedGameFlag(true));
        })
        .catch((err) => {
          console.warn('Failed to save initial guest game state', err);
        });
    } else {
      // Save to Firestore for authenticated users
      saveCurrentGameState(userId, { ...state.game })
        .then(() => {
          store.dispatch(setSavedGameFlag(true));
        })
        .catch((err) => {
          console.warn('Failed to save initial game state', err);
        });
    }
  }

  // On hint usage, save current game state
  if (action.type === useHint.type && userId) {
    if (isGuest) {
      saveGuestGameState(userId, { ...state.game }).catch((err) => {
        console.warn('Failed to save guest game state after hint', err);
      });
    } else {
      saveCurrentGameState(userId, { ...state.game }).catch((err) => {
        console.warn('Failed to save game state after hint', err);
      });
    }
  }

  // After each guess, update user stats and save guess history
  if (action.type === submitGuess.type && userId) {
    const lastResult = state.game?.lastResultDetail;

    if (lastResult) {
      if (isGuest) {
        saveGuestGameState(userId, { ...state.game }).catch((err) => {
          console.warn('Failed to save guest game state', err);
        });
      } else {
        saveCurrentGameState(userId, { ...state.game }).catch((err) => {
          console.warn('Failed to save current game state', err);
        });
      }
    }
  }

  // On game end, persist results and clear saved state
  const runSummary = state.game?.lastGameResult;
  if (
    userId &&
    runSummary?.endedAt &&
    runSummary.endedAt !== lastPersistedRunId
  ) {
    lastPersistedRunId = runSummary.endedAt;

    if (isGuest) {
      // Clear guest saved state
      clearGuestGameState(userId).catch((err) => {
        console.warn('Failed to clear guest saved game state', err);
      });

      store.dispatch(setSavedGameFlag(false));

      // Save guest game result to localStorage
      saveGuestGameResult(userId, runSummary).catch((err) => {
        console.warn('Failed to persist guest game result', err);
      });
    } else {
      // Clear Firestore saved state
      clearSavedGameState(userId).catch((err) => {
        console.warn('Failed to clear saved game state', err);
      });

      store.dispatch(setSavedGameFlag(false));

      // Save authenticated user game result to Firestore
      saveGameResult(userId, runSummary, {
        email: state.auth.user?.email || null,
        displayName: state.auth.user?.displayName || null,
        photoURL: state.auth.user?.photoURL || null,
      })
        .then(() => {
          store.dispatch(fetchLeaderboard());
        })
        .catch((err) => {
          console.warn('Failed to persist game result. If quota exceeded, wait and try later.');
        });
    }
  }

  return result;
};

export default persistenceMiddleware;
