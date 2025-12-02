import { useEffect } from "react";
import { connect } from "react-redux";
import AppPresenter from "./AppPresenter";
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
