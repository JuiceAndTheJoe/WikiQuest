import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EasyCelebs, MediumCelebs, HardCelebs } from '../../game/celebs';
import { getLeaderboard } from '../../firestoreModel';

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function poolForLevel(level) {
  if (level >= 11) return HardCelebs;
  if (level >= 6) return MediumCelebs;
  return EasyCelebs;
}

export const fetchLeaderboard = createAsyncThunk(
  'game/fetchLeaderboard',
  async () => {
    const leaderboard = await getLeaderboard();
    return leaderboard;
  }
);

const initialState = {
  inGame: false,
  level: 1,
  lives: 3,
  correctCount: 0,
  highScore: 0,
  currentCeleb: null, // string name
  lastGuessResult: null, // 'correct' | 'wrong' | null
  leaderboardData: [],
  leaderboardLoading: false,
  leaderboardError: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startNewGame(state) {
      state.inGame = true;
      state.level = 1;
      state.lives = 3;
      state.correctCount = 0;
      state.lastGuessResult = null;
      const pool = poolForLevel(state.level);
      state.currentCeleb = pickRandom(pool);
    },
    continueGame(state) {
      state.inGame = true;
      state.lastGuessResult = null;
      if (!state.currentCeleb) state.currentCeleb = pickRandom(poolForLevel(state.level));
    },
    submitGuess(state, action) {
      const rawGuess = String(action.payload || '').trim();
      const guess = rawGuess.toLowerCase();
      const rawTarget = String(state.currentCeleb || '').trim();

      // Helper: normalize name to letters only, remove diacritics, lowercase
      const normalizeLetters = (s) =>
        String(s || '')
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[_\s\-\d\W]+/g, '')
          .toLowerCase();

      const target = normalizeLetters(rawTarget);
      const guessLetters = normalizeLetters(guess);
      if (!state.inGame || !state.currentCeleb) {
        state.lastGuessResult = null;
        return;
      }

      if (!guess) {
        state.lastGuessResult = 'wrong';
        return;
      }

      // Determine acceptance: letter-frequency based allowance of up to 1 missing letter
      const isAcceptableGuess = (g, t) => {
        if (!t) return false;
        // frequency maps
        const freq = (str) => {
          const m = Object.create(null);
          for (const ch of str) {
            m[ch] = (m[ch] || 0) + 1;
          }
          return m;
        };
        const tf = freq(t);
        const gf = freq(g || '');
        let deficit = 0;
        for (const k of Object.keys(tf)) {
          const need = tf[k];
          const have = gf[k] || 0;
          if (have < need) deficit += need - have;
          if (deficit > 1) return false;
        }
        return true;
      };

      if (isAcceptableGuess(guessLetters, target)) {
        // correct
        state.lastGuessResult = 'correct';
        state.correctCount = (state.correctCount || 0) + 1;
        // add a life up to 3
        state.lives = Math.min(3, (state.lives || 0) + 1);
        // advance level
        state.level = (state.level || 1) + 1;
        // update highScore
        state.highScore = Math.max(state.highScore || 0, state.level - 1);
        // pick next celeb based on new level
        state.currentCeleb = pickRandom(poolForLevel(state.level));
      } else {
        // wrong guess
        state.lastGuessResult = 'wrong';
        state.lives = Math.max(0, (state.lives || 0) - 1);
        if (state.lives <= 0) {
          // game over
          state.inGame = false;
          // keep currentCeleb for review
        }
        // If still alive, keep same level and same celeb — UI will show easier hint next
      }
    },
    forcePickNewCeleb(state) {
      state.currentCeleb = pickRandom(poolForLevel(state.level));
      state.lastGuessResult = null;
    },
    setHighScore(state, action) {
      const n = Number(action.payload || 0);
      if (!Number.isNaN(n)) state.highScore = n;
    },
    resetGameState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboardLoading = true;
        state.leaderboardError = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboardLoading = false;
        state.leaderboardData = action.payload || [];
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboardLoading = false;
        state.leaderboardError = action.error.message || 'Failed to load leaderboard';
      });
  },
});

export const {
  startNewGame,
  continueGame,
  submitGuess,
  forcePickNewCeleb,
  setHighScore,
  resetGameState,
} = gameSlice.actions;

export const selectGame = (s) => s.game || {};
export default gameSlice.reducer;
