import { useEffect } from "react";
import { connect } from "react-redux";
import { logoutUser } from "../app/features/auth/authSlice";
import { loadSavedGame, startNewGame } from "../app/features/game/gameSlice";
import HomePresenter from "./HomePresenter";

const HomeContainer = (props) => {
  const { user, loadSavedGame, loadingGameState } = props;

  // Check for saved game on mount
  useEffect(() => {
    if (user?.uid && !loadingGameState) {
      loadSavedGame(user.uid);
    }
  }, [user?.uid, loadSavedGame, loadingGameState]);

  return <HomePresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  return {
    user: state.auth.user,
    hasSavedGame: g.hasSavedGame || false,
    loadingGameState: g.loadingGameState || false,
    userStats: {
      gamesPlayed: g.completedRuns || 0,
      highScore: g.highScore || 0,
      totalScore: g.totalScoreAcrossRuns || 0,
    },
  };
};

const mapDispatch = (dispatch) => ({
  onStartGame: () => dispatch(startNewGame()),
  loadSavedGame: (userId) => dispatch(loadSavedGame(userId)),
  onLogout: () => dispatch(logoutUser()),
});

export default connect(mapState, mapDispatch)(HomeContainer);
