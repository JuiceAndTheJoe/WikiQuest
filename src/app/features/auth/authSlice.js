import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";

// Async thunks for Firebase auth operations
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await signOut(auth);
});

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // { uid, email }
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
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
