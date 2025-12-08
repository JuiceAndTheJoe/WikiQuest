import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HomeView from "../views/HomeView";

// Presenter for MenuView: manages navigation and user stats
function HomePresenter({
  user,
  userStats,
  hasSavedGame,
  onStartGame,
  onLogout,
}) {
  const navigate = useNavigate();

  const handleStartGame = useCallback(() => {
    onStartGame?.();
    navigate("/game");
  }, [onStartGame, navigate]);

  const handleResumeGame = useCallback(() => {
    navigate("/game");
  }, [navigate]);

  const handleViewLeaderboard = useCallback(() => {
    navigate("/leaderboard");
  }, [navigate]);

  const handleCreateAccount = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <HomeView
      user={user}
      onLogout={onLogout}
      onStartGame={handleStartGame}
      onResumeGame={handleResumeGame}
      onViewLeaderboard={handleViewLeaderboard}
      onCreateAccount={handleCreateAccount}
      userStats={userStats}
      hasSavedGame={hasSavedGame}
    />
  );
}

export default HomePresenter;
