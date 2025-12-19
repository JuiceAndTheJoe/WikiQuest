import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { USERNAME_MAX_LENGTH } from "../app/models/constants";
import TrueFocus from "../components/TrueFocus";

// Pure view: all data and handlers are provided by presenter
function LoginView({
  email,
  password,
  isRegisterMode,
  displayName,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
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
    <Container>
      <Box
        sx={{
          my: 5,
          "& .focus-container": {
            flexWrap: "nowrap",
            gap: { xs: "0.4375em", sm: "0.625em" },
          },
          "& .focus-word": {
            fontSize: { xs: "3.5rem", sm: "4rem" },
            lineHeight: 1,
          },
        }}
      >
        <TrueFocus
          sentence="WikiQuest"
          words={["Wiki", "Quest"]}
          manualMode={false}
          blurAmount={8}
          borderColor="#42a5f5"
          glowColor="rgba(66, 165, 245, 0.6)"
          animationDuration={0.8}
          pauseBetweenAnimations={1.7}
          gap="0"
        />
      </Box>
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

          {isRegisterMode && (
            <TextField
              label="Username"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              required
              fullWidth
              disabled={loading}
              helperText="This name will appear on the leaderboard and must be unique."
              slotProps={{
                htmlInput: { maxLength: USERNAME_MAX_LENGTH },
              }}
            />
          )}

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

          <Divider sx={{ my: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              or
            </Typography>
          </Divider>

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
    </Container>
  );
}

export default LoginView;
