import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadSavedGameState } from "../../models/gameProgressModel";
import { getLeaderboard } from "../../models/leaderboardModel";
import { getUserData } from "../../models/userModel";
import {
  BASE_SCORE,
  HINT_PENALTY,
  MAX_HINTS_PER_QUESTION,
  MAX_LIVES,
  MIN_SCORE,
  WRONG_ANSWER_PENALTY,
} from "./gameConstants";
import {
  buildRunSummary,
  extractBaseName,
  formatCelebDisplayName,
  normalizeLetters,
  pickRandom,
  poolForLevel,
  validateGuess,
} from "./gameUtils";

export const fetchLeaderboard = createAsyncThunk(
  "game/fetchLeaderboard",
  async () => {
    const leaderboard = await getLeaderboard();
    return leaderboard;
  },
);

export const fetchUserStats = createAsyncThunk(
  "game/fetchUserStats",
  async (userId) => {
    const userDoc = await getUserData(userId);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        gamesPlayed: data.gamesPlayed || 0,
        highScore: data.highScore || 0,
        totalScore: data.totalScore || 0,
        averageScore: data.averageScore || 0,
        accuracy: data.accuracy || 0,
      };
    }
    return {
      gamesPlayed: 0,
      highScore: 0,
      totalScore: 0,
      averageScore: 0,
      accuracy: 0,
    };
  },
);

export const loadSavedGame = createAsyncThunk(
  "game/loadSavedGame",
  async ({ userId }) => {
    // All users (anonymous and authenticated) load from Firestore
    const savedState = await loadSavedGameState(userId);
    return savedState;
  },
);

const initialState = {
  inGame: false,
  status: "idle",
  level: 1,
  lives: MAX_LIVES,
  correctCount: 0,
  correctAnswers: 0,
  totalQuestions: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  highScore: 0,
  completedRuns: 0,
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
  hasSavedGame: false,
  loadingGameState: false,
  userStats: {
    gamesPlayed: 0,
    highScore: 0,
    totalScore: 0,
    averageScore: 0,
    accuracy: 0,
  },
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startNewGame(state) {
      state.inGame = true;
      state.status = "playing";
      state.level = 1;
      state.lives = MAX_LIVES;
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
      state.hasSavedGame = false;
      const pool = poolForLevel(state.level);
      state.currentCeleb = pickRandom(pool);
    },
    submitGuess(state, action) {
      const rawGuess = String(action.payload || "").trim();
      const guess = rawGuess.toLowerCase();
      const rawTarget = String(state.currentCeleb || "").trim();

      // Extract base name for comparison (removes disambiguation info like "_(musician)")
      const baseTarget = extractBaseName(rawTarget);
      const target = normalizeLetters(baseTarget);
      const guessLetters = normalizeLetters(guess);

      if (!state.inGame || !state.currentCeleb) {
        state.lastGuessResult = null;
        state.lastResultDetail = null;
        return;
      }

      if (!guess) {
        state.lastGuessResult = "wrong";
        state.lastResultDetail = {
          correct: false,
          correctAnswer: formatCelebDisplayName(rawTarget),
          guess: rawGuess,
          scoreDelta: 0,
          finalScore: state.score || 0,
        };
        return;
      }

      const correctGuess = validateGuess(guessLetters, target);

      const now = Date.now();
      const questionNumber = (state.totalQuestions || 0) + 1;
      const timeTakenMs = state.currentQuestionStartTime
        ? Math.max(0, now - state.currentQuestionStartTime)
        : 0;

      const hintsUsedThisAttempt = state.hintsUsedThisQuestion || 0;

      const baseScoreDelta = Math.max(
        MIN_SCORE,
        BASE_SCORE - (state.hintsUsedThisQuestion || 0) * HINT_PENALTY,
      );

      // Calculate streak multiplier
      let streakMultiplier = 1;
      const currentStreak = state.streak || 0;
      if (currentStreak >= 6) {
        streakMultiplier = 3;
      } else if (currentStreak >= 4) {
        streakMultiplier = 2;
      } else if (currentStreak >= 2) {
        streakMultiplier = 1.5;
      }

      const scoreDelta = correctGuess
        ? Math.round(baseScoreDelta * streakMultiplier)
        : WRONG_ANSWER_PENALTY;

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
        streakMultiplier: correctGuess ? streakMultiplier : 1,
      };

      state.questionsLog = state.questionsLog || [];
      state.questionsLog.push(questionEntry);
      state.totalQuestions = questionNumber;

      if (correctGuess) {
        // correct
        state.lastGuessResult = "correct";
        state.correctCount = (state.correctCount || 0) + 1;
        state.correctAnswers = (state.correctAnswers || 0) + 1;
        state.score = (state.score || 0) + scoreDelta;
        state.streak = (state.streak || 0) + 1;
        state.bestStreak = Math.max(state.bestStreak || 0, state.streak || 0);
        // advance level
        state.level = (state.level || 1) + 1;
        // update highScore
        state.highScore = Math.max(state.highScore || 0, state.level - 1);
        state.lastAnsweredCeleb = rawTarget;
      } else {
        // wrong guess
        state.lastGuessResult = "wrong";
        state.score = Math.max(0, (state.score || 0) + scoreDelta);
        state.streak = 0;
        state.lives = Math.max(0, (state.lives || 0) - 1);
        if (state.lives <= 0) {
          // game over
          state.inGame = false;
          state.status = "game_over";
          state.lastGameResult = buildRunSummary(state);
          state.completedRuns = (state.completedRuns || 0) + 1;
          // keep currentCeleb for review
        } else {
          state.lastAnsweredCeleb = rawTarget;
        }
      }

      state.lastResultDetail = {
        correct: correctGuess,
        correctAnswer: formatCelebDisplayName(
          correctGuess ? state.lastAnsweredCeleb || rawTarget : rawTarget,
        ),
        guess: rawGuess,
        scoreDelta,
        finalScore: state.score || 0,
        hintsUsed: hintsUsedThisAttempt,
        timeTakenMs,
        streakMultiplier: correctGuess ? streakMultiplier : 1,
      };
    },
    useHint(state) {
      if (!state.inGame) return;
      if (state.hintsUsedThisQuestion >= MAX_HINTS_PER_QUESTION) return;
      state.hintsUsedThisQuestion += 1;
      state.totalHintsUsed = (state.totalHintsUsed || 0) + 1;
    },
    advanceToNextQuestion(state) {
      if (!state.inGame) return;
      if (state.lives <= 0) return; // Don't advance if game is over
      state.currentCeleb = pickRandom(poolForLevel(state.level));
      state.currentQuestionStartTime = Date.now();
      state.hintsUsedThisQuestion = 0;
    },
    skipQuestion(state) {
      if (!state.inGame || !state.currentCeleb) return;

      const rawTarget = String(state.currentCeleb || "").trim();
      const now = Date.now();
      const questionNumber = (state.totalQuestions || 0) + 1;
      const timeTakenMs = state.currentQuestionStartTime
        ? Math.max(0, now - state.currentQuestionStartTime)
        : 0;
      const hintsUsedThisAttempt = state.hintsUsedThisQuestion || 0;

      // Log the skip as a question
      const questionEntry = {
        id: `${questionNumber}-${now}`,
        celeb: rawTarget,
        displayName: formatCelebDisplayName(rawTarget),
        guess: "[SKIPPED]",
        correct: false,
        hintsUsed: hintsUsedThisAttempt,
        timeTakenMs,
        questionNumber,
        level: state.level,
        scoreDelta: WRONG_ANSWER_PENALTY,
      };

      state.questionsLog = state.questionsLog || [];
      state.questionsLog.push(questionEntry);
      state.totalQuestions = questionNumber;

      // Deduct score and life
      state.lastGuessResult = "skipped";
      state.score = Math.max(0, (state.score || 0) + WRONG_ANSWER_PENALTY * 10);
      state.streak = 0;
      state.lives = Math.max(0, (state.lives || 0) - 1);

      state.lastAnsweredCeleb = rawTarget;

      if (state.lives <= 0) {
        // Game over
        state.inGame = false;
        state.status = "game_over";
        state.lastGameResult = buildRunSummary(state);
        state.completedRuns = (state.completedRuns || 0) + 1;
      }

      state.lastResultDetail = {
        correct: false,
        correctAnswer: formatCelebDisplayName(rawTarget),
        guess: "[SKIPPED]",
        scoreDelta: WRONG_ANSWER_PENALTY,
        finalScore: state.score || 0,
      };
    },
    setSavedGameFlag(state, action) {
      state.hasSavedGame = action.payload;
    },
    updateLeaderboard(state, action) {
      state.leaderboardData = action.payload;
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
          action.error.message || "Failed to load leaderboard";
      })
      .addCase(loadSavedGame.pending, (state) => {
        state.loadingGameState = true;
      })
      .addCase(loadSavedGame.fulfilled, (state, action) => {
        state.loadingGameState = false;
        const savedState = action.payload;
        if (savedState) {
          const sanitized = { ...savedState };
          delete sanitized.leaderboardData;
          delete sanitized.leaderboardLoading;
          delete sanitized.leaderboardError;
          delete sanitized.userStats;
          Object.assign(state, sanitized);
          state.hasSavedGame = true;
        } else {
          state.hasSavedGame = false;
        }
      })
      .addCase(loadSavedGame.rejected, (state) => {
        state.loadingGameState = false;
        state.hasSavedGame = false;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      });
  },
});

export const {
  startNewGame,
  continueGame,
  submitGuess,
  useHint,
  advanceToNextQuestion,
  skipQuestion,
  setSavedGameFlag,
  resumeGame,
  updateLeaderboard,
} = gameSlice.actions;

export default gameSlice.reducer;
