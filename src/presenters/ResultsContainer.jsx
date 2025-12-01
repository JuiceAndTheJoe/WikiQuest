import { connect } from "react-redux";
import ResultsPresenter from "./ResultsPresenter";
import { startNewGame } from "../app/features/game/gameSlice";

const difficultyForLevel = (level) => {
  if (level >= 11) return "hard";
  if (level >= 6) return "medium";
  return "easy";
};

const mapState = (state) => {
  const g = state.game || {};
  const run = g.lastGameResult || {
    finalScore: g.score || 0,
    totalQuestions: g.totalQuestions || 0,
    correctAnswers: g.correctAnswers || g.correctCount || 0,
    streak: g.streak || 0,
    totalHintsUsed: g.totalHintsUsed || 0,
    difficulty: difficultyForLevel(g.level || 1),
    questionLog: g.questionsLog || [],
  };

  const questionLog = Array.isArray(run.questionLog) ? run.questionLog : [];
  const totalTime = questionLog.reduce(
    (sum, entry) => sum + (entry.timeTakenMs || 0),
    0
  );

  const gameStats = {
    score: run.finalScore || 0,
    totalQuestions: run.totalQuestions || questionLog.length,
    correctAnswers:
      run.correctAnswers || questionLog.filter((q) => q.correct).length,
    streak: run.bestStreak ?? g.bestStreak ?? run.streak ?? g.streak ?? 0,
    gameTime: totalTime,
    difficulty: run.difficulty || difficultyForLevel(g.level || 1),
    totalHintsUsed: run.totalHintsUsed || 0,
  };

  const gameHistory = questionLog.map((entry) => ({
    question: entry.displayName || entry.celeb || "Unknown",
    userAnswer: entry.guess || "—",
    correct: Boolean(entry.correct),
    score:
      typeof entry.scoreDelta === "number"
        ? entry.scoreDelta
        : entry.correct
        ? 100
        : 0,
    timeSpent: entry.timeTakenMs || 0,
    hintsUsed: entry.hintsUsed || 0,
  }));

  const gamesPlayed = g.completedRuns || (g.lastGameResult ? 1 : 0);
  const totalScore = g.totalScoreAcrossRuns || run.finalScore || 0;
  const averageScore = gamesPlayed
    ? Math.round(totalScore / gamesPlayed)
    : totalScore;

  const userStats = {
    gamesPlayed,
    highScore: g.highScore || 0,
    totalScore,
    averageScore,
  };

  const newHighScore = (run.finalScore || 0) > (g.highScore || 0);

  return {
    gameStats,
    gameHistory,
    userStats,
    newHighScore,
    user: state.auth.user,
  };
};

const mapDispatch = (dispatch) => ({
  onStartNewGame: () => dispatch(startNewGame()),
});

export default connect(mapState, mapDispatch)(ResultsPresenter);
