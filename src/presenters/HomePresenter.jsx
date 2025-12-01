import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HomeView from "../views/HomeView";

// Presenter for MenuView: manages navigation and user stats
function HomePresenter({ user, userStats, onStartGame, onLogout }) {
  const navigate = useNavigate();

  const handleStartGame = useCallback(() => {
    onStartGame?.();
    navigate("/game");
  }, [onStartGame, navigate]);

  const handleViewLeaderboard = useCallback(() => {
    navigate("/leaderboard");
  }, [navigate]);

  return (
    <HomeView
      user={user}
      onLogout={onLogout}
      onStartGame={handleStartGame}
      onViewLeaderboard={handleViewLeaderboard}
      userStats={userStats}
    />
  );
}

export default HomePresenter;
