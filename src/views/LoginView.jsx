import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import PrimaryButton from "../components/PrimaryButton";
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
}) {
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 480, m: "2rem auto" }}>
      <Stack spacing={2} component="form" onSubmit={onSubmit}>
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

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Processing..." : isRegisterMode ? "Register" : "Login"}
        </PrimaryButton>

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
      </Stack>
    </Paper>
  );
}

export default LoginView;
