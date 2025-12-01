import { connect } from "react-redux";
import HomePresenter from "./HomePresenter";
import { startNewGame } from "../app/features/game/gameSlice";
import { logoutUser } from "../app/features/auth/authSlice";

const mapState = (state) => {
  const g = state.game || {};
  return {
    user: state.auth.user,
    userStats: {
      gamesPlayed: g.completedRuns || 0,
      highScore: g.highScore || 0,
      totalScore: g.totalScoreAcrossRuns || 0,
    },
  };
};

const mapDispatch = (dispatch) => ({
  onStartGame: () => dispatch(startNewGame()),
  onLogout: () => dispatch(logoutUser()),
});

export default connect(mapState, mapDispatch)(HomePresenter);
