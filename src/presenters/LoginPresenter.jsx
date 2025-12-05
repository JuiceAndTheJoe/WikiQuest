import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginView from "../views/LoginView";

// Presenter for LoginView: manages form state and handlers
function LoginPresenter({ onLogin, onRegister, onConvertGuest, loading, error, onClearError, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  // Redirect authenticated (non-guest) users to home
  useEffect(() => {
    if (user && !user.isGuest) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { email, password };
    
    // If user is a guest, convert their account
    if (user?.isGuest) {
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

  return (
    <LoginView
      email={email}
      password={password}
      isRegisterMode={isRegisterMode}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onToggleMode={handleToggleMode}
      onSubmit={handleSubmit}
      onClearError={onClearError}
      isGuest={user?.isGuest || false}
    />
  );
}

export default LoginPresenter;
