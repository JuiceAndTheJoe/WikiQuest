import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardView from '../views/LeaderboardView';

// Presenter for LeaderboardView: manages leaderboard data and navigation
function LeaderboardPresenter({
  user,
  onLogout,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock leaderboard data - will connect to Firebase later
  const leaderboardData = [
    {
      id: "1",
      name: "QuizMaster",
      email: "quiz@example.com",
      highScore: 2850,
      gamesPlayed: 45,
      averageScore: 190,
      accuracy: 85,
      lastPlayed: "2025-11-28"
    },
    {
      id: "2", 
      name: "HistoryBuff",
      email: "history@example.com",
      highScore: 2400,
      gamesPlayed: 32,
      averageScore: 175,
      accuracy: 78,
      lastPlayed: "2025-11-27"
    },
    {
      id: "3",
      name: "WikiExpert", 
      email: "wiki@example.com",
      highScore: 2200,
      gamesPlayed: 28,
      averageScore: 165,
      accuracy: 82,
      lastPlayed: "2025-11-26"
    },
    {
      id: "4",
      name: user?.email || "You",
      email: user?.email || "current@user.com",
      highScore: 420,
      gamesPlayed: 15,
      averageScore: 95,
      accuracy: 65,
      lastPlayed: "2025-11-28"
    },
    {
      id: "5",
      name: "Newbie",
      email: "new@example.com", 
      highScore: 180,
      gamesPlayed: 8,
      averageScore: 85,
      accuracy: 55,
      lastPlayed: "2025-11-25"
    }
  ];

  // Mock user rank
  const userRank = {
    rank: 4,
    highScore: 420
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBackToMenu = () => {
    navigate("/");
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <LeaderboardView
      leaderboardData={leaderboardData}
      loading={loading}
      error={error}
      userRank={userRank}
      currentUser={user}
      onBackToMenu={handleBackToMenu}
      onRefresh={handleRefresh}
    />
  );
}

export default LeaderboardPresenter;