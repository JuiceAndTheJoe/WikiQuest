import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDifficulty } from '../../../util/difficulty';
import { getLeaderboard } from '../../firestoreModel';
import { EasyCelebs, HardCelebs, MediumCelebs } from '../../game/celebs';

const MAX_HINTS_PER_QUESTION = 3;

function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function poolForLevel(level) {
  const difficulty = getDifficulty(level);
  if (difficulty === 'HARD') return HardCelebs;
  if (level === 'MEDIUM') return MediumCelebs;
  return EasyCelebs;
}

function formatCelebDisplayName(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function buildRunSummary(state) {
  return {
    finalScore: state.score || 0,
    levelReached: Math.max(0, (state.level || 1) - 1),
    highScore: state.highScore || 0,
    totalQuestions: state.totalQuestions || 0,
    correctAnswers: state.correctAnswers || state.correctCount || 0,
    streak: state.streak || 0,
    bestStreak: state.bestStreak || state.streak || 0,
    totalHintsUsed: state.totalHintsUsed || 0,
    difficulty: getDifficulty(state.level || 1),
    questionLog: [...(state.questionsLog || [])],
    endedAt: Date.now(),
  };
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
  status: 'idle',
  level: 1,
  lives: 3,
  correctCount: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  highScore: 0,
  completedRuns: 0,
  totalScoreAcrossRuns: 0,
  currentCeleb: null, // string name
  lastGuessResult: null, // 'correct' | 'wrong' | null
  lastResultDetail: null,
  lastAnsweredCeleb: null,
  questionsLog: [],
  currentQuestionStartTime: null,
  hintsUsedThisQuestion: 0,
  totalHintsUsed: 0,
  lastGameResult: null,
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
      state.status = 'playing';
      state.level = 1;
      state.lives = 3;
      state.correctCount = 0;
      state.correctAnswers = 0;
      state.totalQuestions = 0;
      state.score = 0;
      state.streak = 0;
      state.bestStreak = 0;
      state.lastGuessResult = null;
      state.lastResultDetail = null;
      state.lastAnsweredCeleb = null;
      state.questionsLog = [];
      state.currentQuestionStartTime = Date.now();
      state.hintsUsedThisQuestion = 0;
      state.totalHintsUsed = 0;
      state.lastGameResult = null;
      const pool = poolForLevel(state.level);
      state.currentCeleb = pickRandom(pool);
    },
    continueGame(state) {
      state.inGame = true;
      state.status = 'playing';
      state.lastGuessResult = null;
      state.lastResultDetail = null;
      if (!state.currentCeleb)
        state.currentCeleb = pickRandom(poolForLevel(state.level));
      if (!state.currentQuestionStartTime) {
        state.currentQuestionStartTime = Date.now();
      }
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
        state.lastResultDetail = null;
        return;
      }

      if (!guess) {
        state.lastGuessResult = 'wrong';
        state.lastResultDetail = {
          correct: false,
          correctAnswer: formatCelebDisplayName(rawTarget),
          guess: rawGuess,
          scoreDelta: 0,
          finalScore: state.score || 0,
        };
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

      const correctGuess = isAcceptableGuess(guessLetters, target);

      const now = Date.now();
      const questionNumber = (state.totalQuestions || 0) + 1;
      const timeTakenMs = state.currentQuestionStartTime
        ? Math.max(0, now - state.currentQuestionStartTime)
        : 0;

      const hintsUsedThisAttempt = state.hintsUsedThisQuestion || 0;

      const baseScoreDelta = Math.max(
        40,
        120 - (state.hintsUsedThisQuestion || 0) * 20
      );
      const scoreDelta = correctGuess ? baseScoreDelta : -10;

      const questionEntry = {
        id: `${questionNumber}-${now}`,
        celeb: rawTarget,
        displayName: formatCelebDisplayName(rawTarget),
        guess: rawGuess,
        correct: correctGuess,
        hintsUsed: hintsUsedThisAttempt,
        timeTakenMs,
        questionNumber,
        level: state.level,
        scoreDelta,
      };

      state.questionsLog = state.questionsLog || [];
      state.questionsLog.push(questionEntry);
      state.totalQuestions = questionNumber;

      if (correctGuess) {
        // correct
        state.lastGuessResult = 'correct';
        state.correctCount = (state.correctCount || 0) + 1;
        state.correctAnswers = (state.correctAnswers || 0) + 1;
        state.score = (state.score || 0) + baseScoreDelta;
        state.streak = (state.streak || 0) + 1;
        state.bestStreak = Math.max(state.bestStreak || 0, state.streak || 0);
        // add a life up to 3
        state.lives = Math.min(3, (state.lives || 0) + 1);
        // advance level
        state.level = (state.level || 1) + 1;
        // update highScore
        state.highScore = Math.max(state.highScore || 0, state.level - 1);
        // pick next celeb based on new level
        state.currentCeleb = pickRandom(poolForLevel(state.level));
        state.lastAnsweredCeleb = rawTarget;
        state.currentQuestionStartTime = Date.now();
        state.hintsUsedThisQuestion = 0;
      } else {
        // wrong guess
        state.lastGuessResult = 'wrong';
        state.score = Math.max(0, (state.score || 0) + scoreDelta);
        state.streak = 0;
        state.lives = Math.max(0, (state.lives || 0) - 1);
        if (state.lives <= 0) {
          // game over
          state.inGame = false;
          state.status = 'game_over';
          state.lastGameResult = buildRunSummary(state);
          state.completedRuns = (state.completedRuns || 0) + 1;
          state.totalScoreAcrossRuns =
            (state.totalScoreAcrossRuns || 0) +
            (state.lastGameResult?.finalScore || 0);
          // keep currentCeleb for review
        } else {
          state.lastAnsweredCeleb = rawTarget;
          state.currentCeleb = pickRandom(poolForLevel(state.level));
          state.currentQuestionStartTime = Date.now();
          state.hintsUsedThisQuestion = 0;
        }
      }

      state.lastResultDetail = {
        correct: correctGuess,
        correctAnswer: formatCelebDisplayName(
          correctGuess ? state.lastAnsweredCeleb || rawTarget : rawTarget
        ),
        guess: rawGuess,
        scoreDelta,
        finalScore: state.score || 0,
        hintsUsed: hintsUsedThisAttempt,
        timeTakenMs,
      };
    },
    useHint(state) {
      if (!state.inGame) return;
      if (state.hintsUsedThisQuestion >= MAX_HINTS_PER_QUESTION) return;
      state.hintsUsedThisQuestion += 1;
      state.totalHintsUsed = (state.totalHintsUsed || 0) + 1;
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
        state.leaderboardError =
          action.error.message || 'Failed to load leaderboard';
      });
  },
});

export const { startNewGame, continueGame, submitGuess, useHint } =
  gameSlice.actions;

export { MAX_HINTS_PER_QUESTION };

export default gameSlice.reducer;
