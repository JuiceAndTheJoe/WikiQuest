import { Routes, Route, Navigate } from "react-router-dom";
import HomePresenter from "./HomePresenter";
import UserContainer from "./UserContainer";
import LevelContainer from "./LevelContainer";
import LoginPresenter from "./LoginPresenter";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

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
              <UserContainer />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/level"
          element={
            user ? (
              <LevelContainer />
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
