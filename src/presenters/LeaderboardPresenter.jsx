import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardView from "../views/LeaderboardView";

// Helper functions
const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `#${rank}`;
  }
};

const getRankColor = (rank) => {
  switch (rank) {
    case 1:
      return "warning.main"; // Gold
    case 2:
      return "grey.500"; // Silver
    case 3:
      return "error.main"; // Bronze
    default:
      return "text.primary";
  }
};

// Presenter for LeaderboardView: manages leaderboard data and navigation
function LeaderboardPresenter({ user, leaderboardData, loading, error, themeMode }) {
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
      (entry) => entry.email === user.email || entry.id === user.uid,
    );
    if (idx === -1) return null;
    return {
      rank: idx + 1,
      highScore: normalizedData[idx].highScore,
    };
  }, [normalizedData, user]);

  // Calculate community statistics
  const communityStats = useMemo(() => {
    if (!normalizedData || normalizedData.length === 0) {
      return {
        totalPlayers: 0,
        highestScore: 0,
        totalGamesPlayed: 0,
        averageAccuracy: 0,
      };
    }

    return {
      totalPlayers: normalizedData.length,
      highestScore: Math.max(...normalizedData.map((p) => p.highScore || 0)),
      totalGamesPlayed: normalizedData.reduce(
        (sum, p) => sum + (p.gamesPlayed || 0),
        0,
      ),
      averageAccuracy: Math.round(
        normalizedData.reduce((sum, p) => sum + (p.accuracy || 0), 0) /
          normalizedData.length,
      ),
    };
  }, [normalizedData]);

  const handleBackToMenu = () => {
    navigate("/");
  };

  return (
    <LeaderboardView
      leaderboardData={normalizedData}
      loading={loading}
      error={error}
      userRank={userRank}
      currentUser={user}
      themeMode={themeMode}
      onBackToMenu={handleBackToMenu}
      getRankIcon={getRankIcon}
      getRankColor={getRankColor}
      communityStats={communityStats}
    />
  );
}

export default LeaderboardPresenter;
