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
  onLogout,
  onClearError,
  onConvertGuest,
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
            <LoginPresenter
              onLogin={onLogin}
              onRegister={onRegister}
              onConvertGuest={onConvertGuest}
              loading={authLoading}
              error={authError}
              onClearError={onClearError}
              user={user}
            />
          }
        />
        <Route path="/" element={<HomeContainer />} />
        <Route path="/leaderboard" element={<LeaderboardContainer />} />
        <Route path="/game" element={<GameContainer />} />
        <Route path="/results" element={<ResultsContainer />} />
      </Routes>
    </div>
  );
}

export default AppPresenter;
