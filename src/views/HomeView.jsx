/**
 * MenuView - Main menu interface for WikiQuest
 * Pure component for game start, leaderboard access, and user info display
 */

import {
  EmojiEvents,
  ExitToApp,
  Leaderboard,
  Person,
  PlayArrow,
  PlayCircle,
  Quiz,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ColorBends from "../components/background/ColorBends";

// Pure view: receives interaction handlers & data via props from Presenter.
function MenuView({
  user,
  onLogout,
  onStartGame,
  onResumeGame,
  onViewLeaderboard,
  onCreateAccount,
  hasSavedGame = false,
  userStats = { gamesPlayed: 0, highScore: 0, totalScore: 0 },
}) {
  const isAnonymous = user?.isAnonymous || false;
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
        noise={0.08}
        transparent
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

          {/* User Info */}
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {isAnonymous ? "Guest Player" : user?.email || "Player"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isAnonymous
                      ? "Playing as guest - create account to save progress"
                      : `Games Played: ${userStats.gamesPlayed}`}
                  </Typography>
                </Box>
              </Stack>
              <Stack alignItems="flex-end" spacing={1}>
                {!isAnonymous && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmojiEvents color="warning" />
                    <Typography variant="h6">
                      High Score: {userStats.highScore}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" spacing={1}>
                  {isAnonymous ? (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={onCreateAccount}
                    >
                      Sign In or Create Account
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ExitToApp />}
                      onClick={onLogout}
                    >
                      Logout
                    </Button>
                  )}
                </Stack>
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
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    {hasSavedGame ? "Continue Your Game" : "Start New Game"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {hasSavedGame
                      ? "You have a game in progress. Resume where you left off or start fresh!"
                      : "Guess famous people based on their Wikipedia biographies. Use hints wisely to maximize your score!"}
                  </Typography>

                  <Stack direction="row" spacing={2}>
                    {hasSavedGame && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayCircle />}
                        onClick={onResumeGame}
                        sx={{
                          py: 1.5,
                          fontSize: "1.1rem",
                          minWidth: 200,
                        }}
                      >
                        Resume Game
                      </Button>
                    )}
                    <Button
                      variant={hasSavedGame ? "outlined" : "contained"}
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={onStartGame}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        minWidth: 200,
                      }}
                    >
                      {hasSavedGame ? "New Game" : "Start Quiz"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Stats & Actions */}
            <Box>
              <Stack spacing={2}>
                {/* Stats Card */}
                <Card
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Stats
                    </Typography>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Total Score:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {userStats.totalScore || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Games:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {userStats.gamesPlayed}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">High Score:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {userStats.highScore}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Leaderboard Button */}
                <Button
                  variant="outlined"
                  startIcon={<Leaderboard />}
                  onClick={onViewLeaderboard}
                  sx={{ py: 1.5 }}
                >
                  View Leaderboard
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Game Rules */}
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
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
                    <li>Use hints if you&apos;re stuck (reduces score)</li>
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
