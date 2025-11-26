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
import { fetchWikipediaPage } from "../app/features/wikipedia/wikipediaSlice";

function AppContainer({
  user,
  authLoading,
  authError,
  isAuthChecked,
  clickCount,
  uiLoading,
  wikipediaData,
  wikipediaLoading,
  wikipediaError,
  onGetStarted,
  onReset,
  fetchGetStarted,
  fetchWikipedia,
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

  // Fetch Wikipedia data on mount (example: React page)
  useEffect(() => {
    fetchWikipedia("React_(software)");
  }, [fetchWikipedia]);

  return (
    <AppPresenter
      user={user}
      isAuthChecked={isAuthChecked}
      authLoading={authLoading}
      authError={authError}
      clickCount={clickCount}
      uiLoading={uiLoading}
      wikipediaData={wikipediaData}
      wikipediaLoading={wikipediaLoading}
      wikipediaError={wikipediaError}
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
  wikipediaData: state.wikipedia.pageData,
  wikipediaLoading: state.wikipedia.loading,
  wikipediaError: state.wikipedia.error,
});

const mapDispatchToProps = (dispatch) => ({
  onGetStarted: () => dispatch(getStartedClicked()),
  onReset: () => dispatch(resetGetStarted()),
  fetchGetStarted: (userId) => dispatch(fetchGetStartedClicks(userId)),
  fetchWikipedia: (pageTitle) => dispatch(fetchWikipediaPage(pageTitle)),
  onLogin: (credentials) => dispatch(loginUser(credentials)),
  onRegister: (credentials) => dispatch(registerUser(credentials)),
  onLogout: () => dispatch(logoutUser()),
  onClearError: () => dispatch(clearError()),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
