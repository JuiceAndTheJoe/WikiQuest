import { useEffect } from "react";
import { connect } from "react-redux";
import { initAuthListener } from "../app/features/auth/authListeners";
import {
  clearError,
  loginUser,
  logoutUser,
  registerUser,
} from "../app/features/auth/authSlice";
import { setSavedGameFlag } from "../app/features/game/gameSlice";
import { hasSavedGame } from "../app/models/gameProgressModel";
import AppPresenter from "./AppPresenter";

function AppContainer({
  user,
  authLoading,
  authError,
  isAuthChecked,
  onLogin,
  onRegister,
  onLogout,
  onClearError,
  dispatch,
}) {
  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuthListener(dispatch);
    return () => unsubscribe();
  }, [dispatch]);

  // Check for saved game when user changes
  useEffect(() => {
    if (user?.uid) {
      hasSavedGame(user.uid)
        .then((exists) => {
          dispatch(setSavedGameFlag(exists));
        })
        .catch((err) => {
          console.warn("Failed to check saved game", err);
        });
    }
  }, [user?.uid, dispatch]);

  return (
    <AppPresenter
      user={user}
      isAuthChecked={isAuthChecked}
      authLoading={authLoading}
      authError={authError}
      onLogin={onLogin}
      onRegister={onRegister}
      onLogout={onLogout}
      onClearError={onClearError}
    />
  );
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  authLoading: state.auth.loading,
  authError: state.auth.error,
  isAuthChecked: state.auth.isAuthChecked,
});

const mapDispatchToProps = (dispatch) => ({
  onLogin: (credentials) => dispatch(loginUser(credentials)),
  onRegister: (credentials) => dispatch(registerUser(credentials)),
  onLogout: () => dispatch(logoutUser()),
  onClearError: () => dispatch(clearError()),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
