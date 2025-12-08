/**
 * MenuView - Main menu interface for WikiQuest
 * Pure component for game start, leaderboard access, and user info display
 */

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";
import {
  PlayArrow,
  Leaderboard,
  Person,
  Quiz,
  ExitToApp,
  EmojiEvents,
} from "@mui/icons-material";
import ColorBends from "../components/background/ColorBends";

// Pure view: receives interaction handlers & data via props from Presenter.
function MenuView({
  user,
  onLogout,
  onStartGame,
  onViewLeaderboard,
  userStats = { gamesPlayed: 0, highScore: 0 },
}) {
  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Animated Background */}
      <ColorBends
        colors={["#d80000ff", "#00a90eff", "#0010bdff"]}
        rotation={30}
        speed={0.3}
        scale={1.2}
        frequency={1.4}
        warpStrength={1.2}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0}
        transparent={false}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #4d77a1ff, #42a5f5)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <Quiz
                sx={{ fontSize: "inherit", mr: 1, verticalAlign: "bottom" }}
              />
              WikiQuest
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Test your knowledge of famous people!
            </Typography>
          </Box>

          {/* User Info & Stats */}
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack spacing={3}>
              {/* User Profile Row */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 48, height: 48 }}
                  >
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user?.email || "Player"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Games Played: {userStats.gamesPlayed}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExitToApp />}
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </Stack>

              {/* Stats Row */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <EmojiEvents
                      fontSize="small"
                      sx={{ color: "warning.main" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      High Score
                    </Typography>
                  </Stack>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats.highScore}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            }}
          >
            {/* Game Options */}
            <Box>
              <Card
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Start New Game
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Guess famous people based on their Wikipedia biographies.
                    Use hints wisely to maximize your score!
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={onStartGame}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      minWidth: 200,
                    }}
                  >
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </Box>

            {/* Stats & Actions */}
            <Box>
              {/* Leaderboard Button */}
              <Button
                variant="outlined"
                startIcon={<Leaderboard />}
                onClick={onViewLeaderboard}
                sx={{ py: 1.5, width: "100%" }}
              >
                View Leaderboard
              </Button>
            </Box>
          </Box>

          {/* Game Rules */}
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              How to Play
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <Box>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>Read the biographical clues about a famous person</li>
                    <li>Type your guess for who it is</li>
                    <li>Use hints if you're stuck (reduces score)</li>
                    <li>Faster answers get bonus points</li>
                  </ul>
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>Correct answers increase your streak</li>
                    <li>Wrong answers end the game</li>
                    <li>Challenge yourself with famous people from history</li>
                    <li>Compete for the highest score!</li>
                  </ul>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default MenuView;
