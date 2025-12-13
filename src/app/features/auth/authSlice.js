import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  linkWithCredential,
  signInAnonymously,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import {
  migrateAnonymousData,
  updateUserProfile,
} from "../../models/leaderboardModel";
import { claimDisplayName, releaseDisplayName } from "../../models/userModel";
import { USERNAME_MAX_LENGTH } from "../../models/constants";

// Change display name (unique) for authenticated users
export const changeDisplayName = createAsyncThunk(
  "auth/changeDisplayName",
  async ({ displayName }, { getState, rejectWithValue }) => {
    try {
      const trimmed = (displayName || "").trim();
      if (!trimmed) {
        throw new Error("Display name is required");
      }
      if (trimmed.length > USERNAME_MAX_LENGTH) {
        throw new Error(`Display name must be ${USERNAME_MAX_LENGTH} characters or less`);
      }

      const user = auth.currentUser;
      const stateUser = getState().auth.user;

      if (!user || stateUser?.isAnonymous) {
        throw new Error("You must be signed in to change display name");
      }

      // Reserve name (will throw if taken)
      await claimDisplayName(user.uid, trimmed);

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: trimmed });

      // Update Firestore user profile
      await updateUserProfile(user.uid, {
        email: user.email,
        displayName: trimmed,
      });

      // Release old display name if different
      const oldName = stateUser?.displayName;
      if (oldName && oldName.trim().toLowerCase() !== trimmed.toLowerCase()) {
        try {
          await releaseDisplayName(user.uid, oldName);
        } catch (releaseError) {
          // Non-blocking: log but don't fail the user-facing flow
          console.warn("Failed to release previous display name", releaseError);
        }
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: trimmed,
        isAnonymous: false,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to change display name");
    }
  },
);

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
        displayName: userCredential.user.displayName,
        isAnonymous: false,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password, displayName }, { rejectWithValue }) => {
    let userCredential;
    try {
      const trimmedName = (displayName || "").trim();
      if (!trimmedName) {
        throw new Error("Display name is required");
      }
      if (trimmedName.length > USERNAME_MAX_LENGTH) {
        throw new Error(`Display name must be ${USERNAME_MAX_LENGTH} characters or less`);
      }

      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await claimDisplayName(userCredential.user.uid, trimmedName);
      await updateProfile(userCredential.user, { displayName: trimmedName });
      await updateUserProfile(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: trimmedName,
      });

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: trimmedName,
        isAnonymous: false,
      };
    } catch (error) {
      // If account was created but we failed to claim the name, clean up to avoid orphaned users
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
        } catch (cleanupError) {
          console.warn("Failed to clean up user after registration error", cleanupError);
        }
      }
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
        displayName: userCredential.user.displayName,
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
  async ({ email, password, isLogin, displayName }, { rejectWithValue }) => {
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
          displayName: userCredential.user.displayName,
          isAnonymous: false,
        };
      } else {
        const trimmedName = (displayName || "").trim();
        if (!trimmedName) {
          throw new Error("Display name is required");
        }
        if (trimmedName.length > USERNAME_MAX_LENGTH) {
          throw new Error(`Display name must be ${USERNAME_MAX_LENGTH} characters or less`);
        }

        // Reserve display name before linking to avoid assigning credentials if the name is taken
        await claimDisplayName(currentUser.uid, trimmedName);

        // Link anonymous account with email/password credential
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(
          currentUser,
          credential,
        );

        await updateProfile(userCredential.user, { displayName: trimmedName });
        // When linking, the UID stays the same, but we need to update Firestore with the email
        await updateUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: trimmedName,
        });

        return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: trimmedName,
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
      })
      // Change display name
      .addCase(changeDisplayName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeDisplayName.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
      })
      .addCase(changeDisplayName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
