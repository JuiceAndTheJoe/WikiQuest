import { useState } from "react";
import LoginView from "../views/LoginView";

// Presenter for LoginView: manages form state and handlers
function LoginPresenter({ onLogin, onRegister, loading, error, onClearError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { email, password };
    if (isRegisterMode) onRegister(payload);
    else onLogin(payload);
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
    />
  );
}

export default LoginPresenter;
