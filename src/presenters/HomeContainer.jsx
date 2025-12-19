import { useEffect } from "react";
import { connect } from "react-redux";
import { changeDisplayName, logoutUser } from "../app/features/auth/authSlice";
import {
  fetchLeaderboard,
  fetchUserStats,
  loadSavedGame,
  setSavedGameFlag,
  startNewGame,
} from "../app/features/game/gameSlice";
import HomePresenter from "./HomePresenter";

const HomeContainer = (props) => {
  const {
    user,
    loadSavedGame,
    fetchUserStats,
    fetchLeaderboard,
    loadingGameState,
  } = props;

  // Check for saved game, fetch user stats, and load leaderboard on mount
  useEffect(() => {
    if (user?.uid && !loadingGameState) {
      loadSavedGame({ userId: user.uid });
      fetchUserStats(user.uid);
      fetchLeaderboard();
    }
  }, [
    user?.uid,
    loadSavedGame,
    fetchUserStats,
    fetchLeaderboard,
    loadingGameState,
  ]);

  return <HomePresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  return {
    user: state.auth.user,
    themeMode: state.theme.mode,
    hasSavedGame: g.hasSavedGame || false,
    loadingGameState: g.loadingGameState || false,
    userStats: g.userStats || {
      gamesPlayed: 0,
      highScore: 0,
    },
    leaderboardData: g.leaderboardData || [],
  };
};

const mapDispatch = (dispatch) => ({
  onStartGame: () => dispatch(startNewGame()),
  onClearSavedGame: () => dispatch(setSavedGameFlag(false)),
  loadSavedGame: (params) => dispatch(loadSavedGame(params)),
  fetchUserStats: (userId) => dispatch(fetchUserStats(userId)),
  fetchLeaderboard: () => dispatch(fetchLeaderboard()),
  onChangeDisplayName: (payload) => dispatch(changeDisplayName(payload)),
  onLogout: () => dispatch(logoutUser()),
});

export default connect(mapState, mapDispatch)(HomeContainer);
