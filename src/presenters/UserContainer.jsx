import { connect } from 'react-redux';
import UserPresenter from './UserPresenter';
import { startNewGame, continueGame } from '../app/features/game/gameSlice';
import { logoutUser } from '../app/features/auth/authSlice';

// map state
const mapState = (state) => {
  const g = state.game || {};
  return {
    level: g.level,
    highScore: g.highScore,
    lives: g.lives,
    inGame: g.inGame,
    correctCount: g.correctCount,
    user: state.auth?.user || null,
  };
};

const mapDispatch = { onStartNew: startNewGame, onContinue: continueGame, onLogout: logoutUser };

export default connect(mapState, mapDispatch)(UserPresenter);
