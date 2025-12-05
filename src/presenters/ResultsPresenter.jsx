import { useNavigate } from "react-router-dom";
import ResultsView from "../views/ResultsView";

// Presenter for ResultsView: manages game results and navigation
function ResultsPresenter({
  gameStats,
  gameHistory,
  userStats,
  newHighScore,
  onStartNewGame,
  user,
}) {
  const navigate = useNavigate();
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
    totalScore: 0,
    averageScore: 0,
  };

  const handlePlayAgain = () => {
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

  return (
    <ResultsView
      gameStats={safeGameStats}
      gameHistory={safeHistory}
      userStats={safeUserStats}
      onPlayAgain={handlePlayAgain}
      onViewLeaderboard={handleViewLeaderboard}
      onBackToMenu={handleBackToMenu}
      onCreateAccount={handleCreateAccount}
      user={user}
      newHighScore={newHighScore}
    />
  );
}

export default ResultsPresenter;
