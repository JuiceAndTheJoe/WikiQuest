import { useEffect } from 'react';
import { connect } from 'react-redux';
import LeaderboardPresenter from './LeaderboardPresenter';
import { fetchLeaderboard } from '../app/features/game/gameSlice';

const LeaderboardContainer = (props) => {
  const { fetchLeaderboard } = props;

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return <LeaderboardPresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  return {
    leaderboardData: g.leaderboardData || [],
    loading: g.leaderboardLoading || false,
    error: g.leaderboardError || null,
  };
};

const mapDispatch = (dispatch) => ({
  fetchLeaderboard: () => dispatch(fetchLeaderboard()),
});

export default connect(mapState, mapDispatch)(LeaderboardContainer);
