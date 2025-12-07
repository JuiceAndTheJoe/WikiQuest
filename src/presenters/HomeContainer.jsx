import { useEffect } from 'react';
import { connect } from 'react-redux';
import { logoutUser } from '../app/features/auth/authSlice';
import { loadSavedGame, startNewGame, fetchUserStats } from '../app/features/game/gameSlice';
import HomePresenter from './HomePresenter';

const HomeContainer = (props) => {
  const { user, loadSavedGame, fetchUserStats, loadingGameState } = props;

  // Check for saved game and fetch user stats on mount
  useEffect(() => {
    if (user?.uid && !loadingGameState) {
      loadSavedGame({ userId: user.uid });
      fetchUserStats(user.uid);
    }
  }, [user?.uid, loadSavedGame, fetchUserStats, loadingGameState]);

  return <HomePresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  return {
    user: state.auth.user,
    hasSavedGame: g.hasSavedGame || false,
    loadingGameState: g.loadingGameState || false,
    userStats: g.userStats || {
      gamesPlayed: 0,
      highScore: 0,
      totalScore: 0,
    },
  };
};

const mapDispatch = (dispatch) => ({
  onStartGame: () => dispatch(startNewGame()),
  loadSavedGame: (params) => dispatch(loadSavedGame(params)),
  fetchUserStats: (userId) => dispatch(fetchUserStats(userId)),
  onLogout: () => dispatch(logoutUser()),
});

export default connect(mapState, mapDispatch)(HomeContainer);
