import {
  fetchLeaderboard,
  setSavedGameFlag,
  startNewGame,
  submitGuess,
  useHint,
} from "../features/game/gameSlice";
import {
  clearSavedGameState,
  saveCurrentGameState,
} from "../models/gameProgressModel";
import { saveGameResult } from "../models/leaderboardModel";

let lastPersistedRunId = null;

const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  const userId = state.auth.user?.uid;

  // Watch for game start to save initial state
  if (action.type === startNewGame.type && userId && !state.game.hasSavedGame) {
    // Save to Firestore for all users (anonymous and authenticated)
    saveCurrentGameState(userId, { ...state.game })
      .then(() => {
        store.dispatch(setSavedGameFlag(true));
      })
      .catch((err) => {
        console.warn("Failed to save initial game state", err);
      });
  }

  // On hint usage, save current game state
  if (action.type === useHint.type && userId) {
    saveCurrentGameState(userId, { ...state.game }).catch((err) => {
      console.warn("Failed to save game state after hint", err);
    });
  }

  // After each guess, update user stats and save guess history
  if (action.type === submitGuess.type && userId) {
    const lastResult = state.game?.lastResultDetail;

    if (lastResult) {
      saveCurrentGameState(userId, { ...state.game }).catch((err) => {
        console.warn("Failed to save current game state", err);
      });
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

    // Clear Firestore saved state for all users
    clearSavedGameState(userId).catch((err) => {
      console.warn("Failed to clear saved game state", err);
    });

    store.dispatch(setSavedGameFlag(false));

    // Save game result to Firestore (for both anonymous and authenticated users)
    // Anonymous users won't appear on leaderboard but data is still saved
    saveGameResult(userId, runSummary, {
      email: state.auth.user?.email || null,
      displayName: state.auth.user?.displayName || null,
    })
      .then(() => {
        store.dispatch(fetchLeaderboard());
      })
      .catch((err) => {
        console.warn(
          "Failed to persist game result. If quota exceeded, wait and try later.",
          err,
        );
      });
  }

  return result;
};

export default persistenceMiddleware;
