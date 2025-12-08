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
  leaderboardData = [],
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
              Guess famous people based on their Wikipedia biographies. Use
              hints wisely to maximize your score!
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
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 48, height: 48 }}
                  >
                    <Person />
                  </Avatar>
                  <Stack direction="column" spacing={0.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h6">
                        {user?.email || "Player"}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          High Score:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {userStats.highScore}
                        </Typography>
                        <EmojiEvents
                          fontSize="small"
                          sx={{ color: "warning.main" }}
                        />
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Games Played: {userStats.gamesPlayed}
                    </Typography>
                  </Stack>
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
              ></Stack>
            </Stack>
          </Box>

          {/* Top Players Mini Leaderboard */}
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              🏆 Top Players
            </Typography>
            <Stack spacing={1.5}>
              {leaderboardData.slice(0, 3).map((player, index) => (
                <Box
                  key={player.uid || index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ minWidth: 30 }}
                    >
                      #{index + 1}
                    </Typography>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {player.displayName || player.email || "Anonymous"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {player.gamesPlayed || 0} games
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" fontWeight="bold">
                    {player.highScore || 0}
                  </Typography>
                </Box>
              ))}
              {leaderboardData.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No scores yet. Be the first!
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack spacing={2} sx={{ maxWidth: 300, mx: "auto" }}>
            <Button
              variant="outlined"
              startIcon={<Leaderboard />}
              onClick={onViewLeaderboard}
              sx={{ py: 1.5 }}
            >
              See Who's Best
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={onStartGame}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
              }}
            >
              Start Quiz
            </Button>
          </Stack>

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
              How to Play:
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
                    <li>
                      You can use hints if you're stuck! at the cost of your
                      score...)
                    </li>
                  </ul>
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                    <li>Correct answers increase your streak</li>
                    <li>3 wrong answers end the game</li>
                    <li>Challenge yourself and your peers!</li>
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
