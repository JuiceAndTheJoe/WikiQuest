// Middleware: persists select Redux changes to Firestore.
import { saveGameResult } from '../firestoreModel';
import { fetchLeaderboard } from '../features/game/gameSlice';

let lastPersistedRunId = null;

const persistenceMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    // Persist completed game runs to leaderboard
    const state = store.getState();
    const runSummary = state.game?.lastGameResult;
    const userId = state.auth.user?.uid;
    if (userId && runSummary?.endedAt && runSummary.endedAt !== lastPersistedRunId) {
        lastPersistedRunId = runSummary.endedAt;
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
