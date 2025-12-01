import { combineReducers } from 'redux';
import authReducer from './features/auth/authSlice';
import wikipediaReducer from './features/wikipedia/wikipediaSlice';
import gameReducer from './features/game/gameSlice';

// Combine feature reducers (application state only; no side effects here)
const rootReducer = combineReducers({
    auth: authReducer,
    wikipedia: wikipediaReducer,
    game: gameReducer,
});

export default rootReducer;