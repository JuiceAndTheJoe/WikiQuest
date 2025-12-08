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
import { migrateAnonymousData } from "../../models/leaderboardModel";

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
  // Sign out from Firebase
  await signOut(auth);
  // onAuthStateChanged will trigger and create a new anonymous user automatically
});

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
            photoURL: userCredential.user.photoURL,
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
        // Import dynamically to avoid circular dependency
        const { updateUserProfile } =
          await import("../../models/leaderboardModel");
        await updateUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
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
        // User will be set via onAuthStateChanged listener
        state.loading = false;
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
