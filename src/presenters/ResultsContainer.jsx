import { useEffect } from "react";
import { connect } from "react-redux";
import { startNewGame, fetchUserStats } from "../app/features/game/gameSlice";
import { getDifficulty } from "../app/features/game/gameUtils";
import ResultsPresenter from "./ResultsPresenter";

const ResultsContainer = (props) => {
  const { user, fetchUserStats } = props;

  // Fetch updated user stats when results page loads
  useEffect(() => {
    if (user?.uid) {
      fetchUserStats(user.uid);
    }
  }, [user?.uid, fetchUserStats]);

  return <ResultsPresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  const run = g.lastGameResult || {
    finalScore: g.score || 0,
    totalQuestions: g.totalQuestions || 0,
    correctAnswers: g.correctAnswers || g.correctCount || 0,
    streak: g.streak || 0,
    totalHintsUsed: g.totalHintsUsed || 0,
    difficulty: getDifficulty(g.level || 1).toLowerCase(),
    questionLog: g.questionsLog || [],
  };

  const questionLog = Array.isArray(run.questionLog) ? run.questionLog : [];
  const totalTime = questionLog.reduce(
    (sum, entry) => sum + (entry.timeTakenMs || 0),
    0,
  );

  const gameStats = {
    score: run.finalScore || 0,
    totalQuestions: run.totalQuestions || questionLog.length,
    correctAnswers:
      run.correctAnswers || questionLog.filter((q) => q.correct).length,
    streak: run.bestStreak ?? g.bestStreak ?? run.streak ?? g.streak ?? 0,
    gameTime: totalTime,
    difficulty: run.difficulty || getDifficulty(g.level || 1).toLowerCase(),
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
  const averageScore = gamesPlayed
    ? Math.round((run.finalScore || 0) / gamesPlayed)
    : run.finalScore || 0;

  // Use the actual user stats from Firestore (fetched in HomeContainer)
  const actualUserStats = g.userStats || {
    gamesPlayed: 0,
    highScore: 0,
    totalScore: 0,
    averageScore: 0,
  };

  const userStats = {
    gamesPlayed: actualUserStats.gamesPlayed || gamesPlayed,
    highScore: actualUserStats.highScore || 0,
    averageScore: actualUserStats.averageScore || averageScore,
  };

  // Compare current game score with the user's actual high score from Firestore
  const newHighScore = (run.finalScore || 0) > (actualUserStats.highScore || 0);

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
  fetchUserStats: (uid) => dispatch(fetchUserStats(uid)),
});

export default connect(mapState, mapDispatch)(ResultsContainer);
