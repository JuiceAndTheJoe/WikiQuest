import { combineReducers } from 'redux';
import uiReducer from './features/ui/uiSlice';
import authReducer from './features/auth/authSlice';

// Combine feature reducers (application state only; no side effects here)
const rootReducer = combineReducers({
    ui: uiReducer,
    auth: authReducer,
});

export default rootReducer;