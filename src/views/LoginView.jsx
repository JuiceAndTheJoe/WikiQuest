import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

// Pure view: all data and handlers are provided by presenter
function LoginView({
  email,
  password,
  isRegisterMode,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onToggleMode,
  onSubmit,
  onClearError,
  onContinueAsGuest,
  isAnonymous = false,
}) {
  const heading = isRegisterMode ? "Create Account" : "Login";
  const description = isAnonymous
    ? "You're currently playing as a guest. Sign in or create an account to keep your progress synced."
    : isRegisterMode
      ? "Create an account to save your progress across devices."
      : "Sign in to continue or start a new session.";

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 480, m: "2rem auto" }}>
      <Stack spacing={2} component="form" onSubmit={onSubmit}>
        <Typography variant="h4" component="h1">
          {heading}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
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
          onChange={(e) => onEmailChange(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          fullWidth
          disabled={loading}
          slotProps={{ htmlInput: { minLength: 6 } }}
        />

        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          color="primary"
          sx={{ textTransform: "none" }}
        >
          {loading ? "Processing..." : isRegisterMode ? "Register" : "Login"}
        </Button>

        <Button
          variant="text"
          onClick={onToggleMode}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {isRegisterMode
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Button>

        <Button
          variant="outlined"
          onClick={onContinueAsGuest}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Continue as Guest
        </Button>
      </Stack>
    </Paper>
  );
}

export default LoginView;
