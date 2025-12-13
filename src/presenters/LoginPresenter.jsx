import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginView from "../views/LoginView";

// Presenter for LoginView: manages form state and handlers
function LoginPresenter({
  user,
  onLogin,
  onRegister,
  onGuestLogin,
  onConvertGuest,
  loading,
  error,
  onClearError,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  // Redirect authenticated (non-anonymous) users to home
  useEffect(() => {
    if (user && !user.isAnonymous) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { email, password };
    if (isRegisterMode) {
      payload.displayName = displayName;
    }

    // If user is anonymous, convert their account
    if (user?.isAnonymous) {
      onConvertGuest({ ...payload, isLogin: !isRegisterMode });
    } else {
      // Normal login/register
      if (isRegisterMode) onRegister(payload);
      else onLogin(payload);
    }
  };

  const handleToggleMode = () => {
    setIsRegisterMode((m) => !m);
    if (error) onClearError();
  };

  const handleContinueAsGuest = () => {
    // Manually create an anonymous session instead of auto-login
    onGuestLogin()
      .then(() => navigate("/"))
      .catch(() => {
        /* error handled via redux error state */
      });
  };

  return (
    <LoginView
      email={email}
      password={password}
      isRegisterMode={isRegisterMode}
      displayName={displayName}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onDisplayNameChange={setDisplayName}
      onToggleMode={handleToggleMode}
      onSubmit={handleSubmit}
      onClearError={onClearError}
      onContinueAsGuest={handleContinueAsGuest}
      isAnonymous={user?.isAnonymous || false}
    />
  );
}

export default LoginPresenter;
