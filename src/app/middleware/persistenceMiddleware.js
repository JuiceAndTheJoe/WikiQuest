// Middleware: persists getStartedClicks to Firestore when changed.
// Keeps Firestore side effects out of reducers and views.
import { setGetStartedClicks } from '../firestoreModel';
import { getStartedClicked, resetGetStarted } from '../features/ui/uiSlice';

const persistenceMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    // Only persist after the action has updated state
    if (action.type === getStartedClicked.type || action.type === resetGetStarted.type) {
        const state = store.getState();
        const userId = state.auth.user?.uid;
        const count = state.ui.getStartedClicks;
        // Fire and forget; errors can be handled/logged here if desired
        if (userId) {
            setGetStartedClicks(userId, count).catch((err) => {
                // In production you might dispatch an error action instead
                console.warn('Failed to persist getStartedClicks', err);
            });
        }
    }
    return result;
};

export default persistenceMiddleware;
