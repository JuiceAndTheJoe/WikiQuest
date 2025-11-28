import { useNavigate } from "react-router-dom";
import HomeView from "../views/HomeView";

// Presenter for MenuView: manages navigation and user stats
function HomePresenter({
  user,
  onLogout,
  clickCount,
}) {
  const navigate = useNavigate();

  // Mock user stats for now - will connect to model later
  const userStats = {
    gamesPlayed: 0,
    highScore: 0,
    totalScore: 0
  };

  const handleStartGame = () => {
    navigate("/game");
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
  };

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
