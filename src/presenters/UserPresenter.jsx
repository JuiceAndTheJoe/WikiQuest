import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserView from '../views/UserView';

// Simple presenter forwarding handlers and derived props
function UserPresenter({ level, highScore, lives, inGame, correctCount, onStartNew, onContinue, user, onLogout }) {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    onStartNew?.();
    navigate('/level');
  }, [onStartNew, navigate]);

  const handleContinue = useCallback(() => {
    onContinue?.();
    navigate('/level');
  }, [onContinue, navigate]);

  return (
    <UserView
      level={level}
      highScore={highScore}
      lives={lives}
      inGame={inGame}
      correctCount={correctCount}
      onStartNew={handleStart}
      onContinue={handleContinue}
      user={user}
      onLogout={onLogout}
    />
  );
}

export default UserPresenter;
