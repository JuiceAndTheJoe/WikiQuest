import { Routes, Route, Navigate } from "react-router-dom";
import HomeContainer from "./HomeContainer";
import LeaderboardContainer from "./LeaderboardContainer";
import GameContainer from "./GameContainer";
import ResultsContainer from "./ResultsContainer";
import LoginPresenter from "./LoginPresenter";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Pure presentational component: receives all data & handlers via props.
function AppPresenter({
  user,
  isAuthChecked,
  authLoading,
  authError,
  onLogin,
  onRegister,
  onClearError,
}) {
  // Show loading spinner while checking auth state
  if (!isAuthChecked) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPresenter
                onLogin={onLogin}
                onRegister={onRegister}
                loading={authLoading}
                error={authError}
                onClearError={onClearError}
              />
            )
          }
        />
        <Route
          path="/"
          element={user ? <HomeContainer /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/leaderboard"
          element={
            user ? <LeaderboardContainer /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/game"
          element={user ? <GameContainer /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/results"
          element={
            user ? <ResultsContainer /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default AppPresenter;
