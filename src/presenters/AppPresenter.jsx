import { Routes, Route, Navigate } from "react-router-dom";
import HomePresenter from "./HomePresenter";
import LoginPresenter from "./LoginPresenter";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Import placeholder presenters (will create these next)
import GamePresenter from "./GamePresenter";
import ResultsPresenter from "./ResultsPresenter";
import LeaderboardPresenter from "./LeaderboardPresenter";

// Pure presentational component: receives all data & handlers via props.
function AppPresenter({
  user,
  isAuthChecked,
  authLoading,
  authError,
  clickCount,
  uiLoading,
  wikipediaData,
  wikipediaLoading,
  wikipediaError,
  onGetStarted,
  onReset,
  onLogin,
  onRegister,
  onLogout,
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
          element={
            user ? (
              <HomePresenter
                onGetStarted={onGetStarted}
                onReset={onReset}
                clickCount={clickCount}
                loading={uiLoading}
                user={user}
                onLogout={onLogout}
                wikipediaData={wikipediaData}
                wikipediaLoading={wikipediaLoading}
                wikipediaError={wikipediaError}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/game"
          element={
            user ? (
              <GamePresenter
                user={user}
                onLogout={onLogout}
                wikipediaData={wikipediaData}
                wikipediaLoading={wikipediaLoading}
                wikipediaError={wikipediaError}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/results"
          element={
            user ? (
              <ResultsPresenter
                user={user}
                onLogout={onLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/leaderboard"
          element={
            user ? (
              <LeaderboardPresenter
                user={user}
                onLogout={onLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default AppPresenter;
