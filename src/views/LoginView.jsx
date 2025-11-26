import { useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import PrimaryButton from "../components/PrimaryButton";
import Button from "@mui/material/Button";

// Pure view: receives auth handlers and state via props
function LoginView({ onLogin, onRegister, loading, error, onClearError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      onRegister({ email, password });
    } else {
      onLogin({ email, password });
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    if (error) onClearError();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 480, m: "2rem auto" }}>
      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" component="h1">
          {isRegisterMode ? "Register" : "Login"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isRegisterMode
            ? "Create an account to save your data"
            : "Sign in to access your saved data"}
        </Typography>

        {error && (
          <Alert severity="error" onClose={onClearError}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          disabled={loading}
          slotProps={{ htmlInput: { minLength: 6 } }}
        />

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Processing..." : isRegisterMode ? "Register" : "Login"}
        </PrimaryButton>

        <Button
          variant="text"
          onClick={toggleMode}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {isRegisterMode
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Button>
      </Stack>
    </Paper>
  );
}

export default LoginView;
