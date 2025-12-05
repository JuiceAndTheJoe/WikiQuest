import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { getAllGuestData, clearAllGuestData } from '../../models/guestStorageModel';
import { saveCurrentGameState } from '../../models/gameProgressModel';
import { saveGameResult } from '../../models/leaderboardModel';
import { isGuestUser, createNewGuestSession, createGuestUserObject } from './guestUtils';

// Async thunks for Firebase auth operations
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { getState }) => {
  const state = getState();
  const currentUser = state.auth.user;
  
  // Only sign out from Firebase if user is authenticated (not guest)
  if (currentUser && !currentUser.isGuest) {
    await signOut(auth);
  }
  
  // Create a new guest session after logout
  const newGuestId = createNewGuestSession();
  return createGuestUserObject(newGuestId);
});

// Convert guest account to authenticated account
export const convertGuestToAccount = createAsyncThunk(
  'auth/convertGuestToAccount',
  async ({ email, password, isLogin }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.auth.user;
      
      // Verify current user is a guest
      if (!currentUser || !currentUser.isGuest) {
        throw new Error('Can only convert guest accounts');
      }
      
      const guestId = currentUser.uid;
      
      // Get all guest data before creating account
      const guestData = await getAllGuestData(guestId);
      
      // Create or sign in to Firebase account
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      const newUserId = userCredential.user.uid;
      
      // Migrate guest data to Firestore
      if (guestData.gameState) {
        await saveCurrentGameState(newUserId, guestData.gameState);
      }
      
      if (guestData.gameResult) {
        await saveGameResult(newUserId, guestData.gameResult, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || null,
          photoURL: userCredential.user.photoURL || null,
        });
      }
      
      // Clear guest data from localStorage
      await clearAllGuestData(guestId);
      
      return {
        uid: newUserId,
        email: userCredential.user.email,
        migratedFromGuest: true,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // { uid, email, isGuest? }
    loading: false,
    error: null,
    isAuthChecked: false, // Track if initial auth check completed
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthChecked = true;
    },
    clearError(state) {
      state.error = null;
    },
    setGuestUser(state, action) {
      state.user = action.payload;
      state.isAuthChecked = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = action.payload; // Set new guest user
        state.loading = false;
      })
      // Convert guest to account
      .addCase(convertGuestToAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(convertGuestToAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(convertGuestToAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError, setGuestUser } = authSlice.actions;
export default authSlice.reducer;
