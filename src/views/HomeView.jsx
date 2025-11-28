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
  wikipediaSummary,
  wikipediaContentText,
  wikipediaLoading,
  wikipediaError,
  showFullText,
  onToggleFullText,
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

        <Divider sx={{ width: "100%" }} />

        {/* Wikipedia API Integration Example */}
        <Typography variant="h5" component="h2">
          Wikipedia API Example
        </Typography>
        {wikipediaLoading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">
              Loading Wikipedia data…
            </Typography>
          </Stack>
        )}
        {wikipediaError && (
          <Typography variant="body2" color="error">
            Error: {wikipediaError}
          </Typography>
        )}
        {wikipediaSummary && (
          <Paper elevation={1} sx={{ p: 2, width: "100%", bgcolor: "grey.50" }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="h3">
                {wikipediaSummary.title}
              </Typography>
              {wikipediaSummary.thumbnail && (
                <Box
                  component="img"
                  src={wikipediaSummary.thumbnail.source}
                  alt={wikipediaSummary.title}
                  sx={{ maxWidth: "200px", borderRadius: 1 }}
                />
              )}
              <Typography variant="body2" color="text.secondary">
                {wikipediaSummary.description}
              </Typography>
              <Typography variant="body2">
                {wikipediaSummary.extract}
              </Typography>
              {wikipediaSummary.content_urls?.desktop?.page && (
                <Button
                  variant="outlined"
                  size="small"
                  href={wikipediaSummary.content_urls.desktop.page}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ alignSelf: "flex-start" }}
                >
                  Read More on Wikipedia
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {/* Full plain-text content (toggle) */}
        {wikipediaContentText && (
          <>
            <Button
              variant="text"
              size="small"
              onClick={onToggleFullText}
              sx={{ textTransform: "none" }}
            >
              {showFullText ? "Hide full text" : "Show full text"}
            </Button>
            {showFullText && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  width: "100%",
                  bgcolor: "background.paper",
                  whiteSpace: "pre-wrap",
                  maxHeight: 320,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ fontFamily: "inherit" }}
                >
                  {wikipediaContentText}
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default HomeView;
