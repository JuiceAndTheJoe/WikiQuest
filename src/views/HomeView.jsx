import PrimaryButton from "../components/PrimaryButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

// Pure view: receives interaction handlers & data via props from Presenter.
function HomeView({
  onGetStarted,
  onReset,
  clickCount,
  loading,
  user,
  onLogout,
}) {
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 640, m: "2rem auto" }}>
      <Stack spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1">
            Welcome to Your App
          </Typography>
          <Button variant="outlined" size="small" onClick={onLogout}>
            Logout
          </Button>
        </Box>

        <Typography variant="body2" color="primary">
          Signed in as: {user?.email}
        </Typography>

        <Divider sx={{ width: "100%" }} />

        <Typography variant="body1">
          Your data is now saved per-user in Firestore!
        </Typography>
        <PrimaryButton onClick={onGetStarted} disabled={loading}>
          {loading ? "Loading…" : "Get Started"}
        </PrimaryButton>
        <Typography variant="body2" color="text.secondary">
          Get Started clicked {clickCount} time{clickCount === 1 ? "" : "s"}.
        </Typography>
        {clickCount > 0 && (
          <Button variant="text" color="secondary" onClick={onReset}>
            Reset Counter
          </Button>
        )}
        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">
              Fetching persisted count…
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default HomeView;
