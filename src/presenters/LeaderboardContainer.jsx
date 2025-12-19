import { useEffect } from "react";
import { connect } from "react-redux";
import LeaderboardPresenter from "./LeaderboardPresenter";
import { updateLeaderboard } from "../app/features/game/gameSlice";
import { subscribeToLeaderboard } from "../app/models/leaderboardModel";

const LeaderboardContainer = (props) => {
  const { dispatch } = props;

  useEffect(() => {
    // Subscribe to real-time leaderboard updates
    const unsubscribe = subscribeToLeaderboard((leaderboardData) => {
      dispatch(updateLeaderboard(leaderboardData));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <LeaderboardPresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  return {
    user: state.auth.user,
    themeMode: state.theme.mode,
    leaderboardData: g.leaderboardData || [],
    loading: g.leaderboardLoading || false,
    error: g.leaderboardError || null,
  };
};

export default connect(mapState)(LeaderboardContainer);
