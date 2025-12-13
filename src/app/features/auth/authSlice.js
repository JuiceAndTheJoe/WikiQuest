import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  linkWithCredential,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import {
  migrateAnonymousData,
  updateUserProfile,
} from "../../models/leaderboardModel";

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
        isAnonymous: false,
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
        isAnonymous: false,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await signOut(auth);
});

// Explicit guest login to avoid automatic anonymous sessions
export const loginAsGuest = createAsyncThunk(
  "auth/loginAsGuest",
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await signInAnonymously(auth);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        isAnonymous: true,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Convert anonymous account to permanent account using Firebase account linking
export const convertGuestToAccount = createAsyncThunk(
  "auth/convertGuestToAccount",
  async ({ email, password, isLogin }, { rejectWithValue }) => {
    try {
      const currentUser = auth.currentUser;

      // Verify current user is anonymous
      if (!currentUser || !currentUser.isAnonymous) {
        throw new Error("Can only convert anonymous accounts");
      }

      const anonymousUserId = currentUser.uid;

      if (isLogin) {
        // Sign in to existing account - migrate anonymous data
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        // Migrate anonymous user data to authenticated account
        try {
          await migrateAnonymousData(anonymousUserId, userCredential.user.uid, {
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
          });
          console.log("Data migration completed successfully");
        } catch (migrationError) {
          console.error(
            "Failed to migrate data, but login succeeded:",
            migrationError,
          );
        }

        return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          isAnonymous: false,
        };
      } else {
        // Link anonymous account with email/password credential
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(
          currentUser,
          credential,
        );

        // When linking, the UID stays the same, but we need to update Firestore with the email
        await updateUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        });

        return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          isAnonymous: false,
          linkedFromAnonymous: true,
        };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // { uid, email, isAnonymous }
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
        state.loading = false;
      })
      // Guest login
      .addCase(loginAsGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginAsGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Convert anonymous to account
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

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
