import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardView from "../views/LeaderboardView";

// Presenter for LeaderboardView: manages leaderboard data and navigation
function LeaderboardPresenter({
  user,
  leaderboardData,
  loading,
  error,
  fetchLeaderboard,
}) {
  const navigate = useNavigate();

  const normalizedData = useMemo(() => {
    if (!Array.isArray(leaderboardData)) return [];
    return leaderboardData.map((entry, index) => ({
      id: entry.userId || entry.id || index,
      name:
        entry.name || entry.displayName || entry.email || `Player ${index + 1}`,
      email: entry.email || entry.userEmail || "Unknown",
      highScore: entry.highScore || 0,
      gamesPlayed: entry.gamesPlayed || entry.completedRuns || 0,
      averageScore:
        entry.averageScore || entry.avgScore || entry.highScore || 0,
      accuracy: entry.accuracy ?? entry.avgAccuracy ?? 0,
      lastPlayed: entry.lastPlayed || entry.updatedAt || null,
    }));
  }, [leaderboardData]);

  const userRank = useMemo(() => {
    if (!user) return null;
    const idx = normalizedData.findIndex(
      (entry) => entry.email === user.email || entry.id === user.uid
    );
    if (idx === -1) return null;
    return {
      rank: idx + 1,
      highScore: normalizedData[idx].highScore,
    };
  }, [normalizedData, user]);

  const handleBackToMenu = () => {
    navigate("/");
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  return (
    <LeaderboardView
      leaderboardData={normalizedData}
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
