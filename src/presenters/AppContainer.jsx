import { useEffect } from "react";
import { connect } from "react-redux";
import AppPresenter from "./AppPresenter";
import {
  getStartedClicked,
  resetGetStarted,
  fetchGetStartedClicks,
} from "../app/features/ui/uiSlice";
import {
  loginUser,
  registerUser,
  logoutUser,
  clearError,
  initAuthListener,
} from "../app/features/auth/authSlice";

function AppContainer({
  user,
  authLoading,
  authError,
  isAuthChecked,
  clickCount,
  uiLoading,
  onGetStarted,
  onReset,
  fetchGetStarted,
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

  // Fetch user-specific data when authenticated
  useEffect(() => {
    if (user?.uid) {
      fetchGetStarted(user.uid);
    }
  }, [user?.uid, fetchGetStarted]);

  return (
    <AppPresenter
      user={user}
      isAuthChecked={isAuthChecked}
      authLoading={authLoading}
      authError={authError}
      clickCount={clickCount}
      uiLoading={uiLoading}
      onGetStarted={onGetStarted}
      onReset={onReset}
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
  clickCount: state.ui.getStartedClicks,
  uiLoading: state.ui.loading,
});

const mapDispatchToProps = (dispatch) => ({
  onGetStarted: () => dispatch(getStartedClicked()),
  onReset: () => dispatch(resetGetStarted()),
  fetchGetStarted: (userId) => dispatch(fetchGetStartedClicks(userId)),
  onLogin: (credentials) => dispatch(loginUser(credentials)),
  onRegister: (credentials) => dispatch(registerUser(credentials)),
  onLogout: () => dispatch(logoutUser()),
  onClearError: () => dispatch(clearError()),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
