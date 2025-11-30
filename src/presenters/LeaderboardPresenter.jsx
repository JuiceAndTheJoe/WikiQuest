import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaderboardView from '../views/LeaderboardView';

function LeaderboardPresenter({ leaderboardData, loading, error }) {
  const navigate = useNavigate();

  const handleReturn = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <LeaderboardView
      leaderboardData={leaderboardData}
      loading={loading}
      error={error}
      onReturn={handleReturn}
    />
  );
}

export default LeaderboardPresenter;
