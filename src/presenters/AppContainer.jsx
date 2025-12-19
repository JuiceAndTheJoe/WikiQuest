import { useEffect } from "react";
import { connect } from "react-redux";
import { initAuthListener } from "../app/features/auth/authListeners";
import {
  clearError,
  loginUser,
  registerUser,
  loginAsGuest,
  convertGuestToAccount,
} from "../app/features/auth/authSlice";
import { setSavedGameFlag } from "../app/features/game/gameSlice";
import { setTheme } from "../app/features/theme/themeSlice";
import { hasSavedGame } from "../app/models/gameProgressModel";
import AppPresenter from "./AppPresenter";

function AppContainer({
  user,
  authLoading,
  authError,
  isAuthChecked,
  onLogin,
  onRegister,
  onClearError,
  onGuestLogin,
  onConvertGuest,
  dispatch,
}) {
  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuthListener(dispatch);
    return () => unsubscribe();
  }, [dispatch]);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("themeMode");
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      dispatch(setTheme(savedTheme));
    }
  }, [dispatch]);

  // Check for saved game when user changes (works for both anonymous and authenticated users)
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
      onClearError={onClearError}
      onGuestLogin={onGuestLogin}
      onConvertGuest={onConvertGuest}
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
  onGuestLogin: () => dispatch(loginAsGuest()),
  onConvertGuest: (credentials) => dispatch(convertGuestToAccount(credentials)),
  onClearError: () => dispatch(clearError()),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
