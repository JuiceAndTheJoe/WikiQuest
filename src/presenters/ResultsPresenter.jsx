import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import ResultsView from "../views/ResultsView.jsx";

// Helper function to generate Wikipedia URL
const getWikipediaUrl = (celebName) => {
  const sanitizedName = celebName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
  return `https://en.wikipedia.org/wiki/${sanitizedName}`;
};

// Presenter for ResultsView: manages game results and navigation
function ResultsPresenter({
  gameStats,
  gameHistory,
  userStats,
  newHighScore,
  onStartNewGame,
  user,
  hasGameResult,
  themeMode,
}) {
  const [isRestarting, setIsRestarting] = useState(false);
  const navigate = useNavigate();

  // Redirect to home if there's no game result to display
  if (!hasGameResult && !isRestarting) {
    return <Navigate to="/" replace />;
  }

  const safeGameStats = gameStats || {
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    gameTime: 0,
    difficulty: "easy",
  };
  const safeHistory = Array.isArray(gameHistory) ? gameHistory : [];
  const safeUserStats = userStats || {
    gamesPlayed: 0,
    highScore: 0,
    averageScore: 0,
  };

  // Calculate derived values
  const isAnonymous = user?.isAnonymous || false;
  const accuracy =
    safeGameStats.totalQuestions > 0
      ? Math.round(
          (safeGameStats.correctAnswers / safeGameStats.totalQuestions) * 100,
        )
      : 0;

  const gameTimeSeconds = safeGameStats.gameTime
    ? Math.round(safeGameStats.gameTime / 1000)
    : 0;

  const avgTimePerQuestion =
    safeGameStats.totalQuestions > 0 && gameTimeSeconds > 0
      ? Math.round(gameTimeSeconds / safeGameStats.totalQuestions)
      : 0;

  // Event handlers
  const handlePlayAgain = () => {
    setIsRestarting(true);
    if (typeof onStartNewGame === "function") {
      onStartNewGame();
    }
    navigate("/game");
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
  };

  const handleBackToMenu = () => {
    navigate("/");
  };

  const handleCreateAccount = () => {
    navigate("/login");
  };

  // Prepare view props
  const viewProps = {
    gameStats: safeGameStats,
    gameHistory: safeHistory,
    userStats: safeUserStats,
    themeMode,
    onPlayAgain: handlePlayAgain,
    onViewLeaderboard: handleViewLeaderboard,
    onBackToMenu: handleBackToMenu,
    onCreateAccount: handleCreateAccount,
    newHighScore,
    user,
    // Calculated values
    isAnonymous,
    accuracy,
    gameTimeSeconds,
    avgTimePerQuestion,
    getWikipediaUrl,
  };

  return <ResultsView {...viewProps} />;
}

export default ResultsPresenter;
