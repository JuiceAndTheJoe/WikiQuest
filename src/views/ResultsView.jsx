/**
 * ResultsView - Game over screen with statistics and replay options
 * Pure component for displaying final score, game stats, and next actions
 */

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
  Link,
} from "@mui/material";

import {
  PlayArrow,
  Leaderboard,
  Home,
  CheckCircle,
  Cancel,
  AccountCircle,
} from "@mui/icons-material";

import ColorBends from "../components/background/ColorBends";
import SplitText from "../components/SplitText";

// Helper function to generate Wikipedia URL
const getWikipediaUrl = (celebName) => {
  const sanitizedName = celebName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
  return `https://en.wikipedia.org/wiki/${sanitizedName}`;
};

function ResultsView({
  gameStats,
  gameHistory,
  userStats,
  onPlayAgain,
  onViewLeaderboard,
  onBackToMenu,
  newHighScore = false,
  user,
  onCreateAccount,
}) {
  const isAnonymous = user?.isAnonymous || false;
  const accuracy =
    gameStats?.totalQuestions > 0
      ? Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100)
      : 0;

  const gameTime = gameStats?.gameTime
    ? Math.round(gameStats.gameTime / 1000)
    : 0;

  const avgTimePerQuestion =
    gameStats?.totalQuestions > 0 && gameTime > 0
      ? Math.round(gameTime / gameStats.totalQuestions)
      : 0;

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Animated Background */}
      <ColorBends
        colors={["#420056ff", "#006cf0ff", "#6a00bbff"]}
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
            {newHighScore ? (
              <Box sx={{ mb: 2 }}>
                <SplitText
                  text="New Personal Best!"
                  className="text-2xl font-semibold text-center"
                  delay={100}
                  duration={0.6}
                  ease="elastic.out(1, 0.3)"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  repeat={-1}
                  repeatDelay={0.3}
                />
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                <SplitText
                  text="Good Job!"
                  className="text-2xl font-semibold text-center"
                  delay={100}
                  duration={0.6}
                  ease="elastic.out(1, 0.3)"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  repeat={-1}
                  repeatDelay={2.5}
                />
              </Box>
            )}
            <Typography variant="h4" color="primary" gutterBottom>
              Final Score: {gameStats?.score || 0}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            }}
          >
            {/* Game Statistics */}
            <Box>
              <Card
                elevation={3}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Game Statistics
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 3,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    }}
                  >
                    {/* Main Stats */}
                    <Box>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Stack spacing={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">
                              Questions Answered:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {gameStats?.totalQuestions || 0}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">
                              Correct Answers:
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="success.main"
                            >
                              {gameStats?.correctAnswers || 0}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">
                              Best Streak:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {gameStats?.streak || 0}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">Accuracy:</Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {accuracy}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>

                    {/* Time Stats */}
                    <Box>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Stack spacing={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">Game Time:</Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {Math.floor(gameTime / 60)}:
                              {(gameTime % 60).toString().padStart(2, "0")}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">
                              Avg per Question:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {avgTimePerQuestion}s
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">Hints Used:</Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {gameHistory?.reduce(
                                (total, q) => total + (q.hintsUsed || 0),
                                0,
                              ) || 0}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">Difficulty:</Typography>
                            <Chip
                              label={
                                gameStats?.difficulty?.toUpperCase() || "EASY"
                              }
                              size="small"
                              color="primary"
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Question History */}
                  <Typography variant="h6" gutterBottom>
                    Question Breakdown
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                    {gameHistory && gameHistory.length > 0 ? (
                      <Stack spacing={1}>
                        {gameHistory.map((question, index) => (
                          <Link
                            key={index}
                            href={getWikipediaUrl(question.question)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              textDecoration: "none",
                              display: "block",
                              transition:
                                "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: question.correct
                                  ? "0 8px 16px rgba(0, 169, 14, 0.3)"
                                  : "0 8px 16px rgba(216, 0, 0, 0.3)",
                              },
                            }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: question.correct
                                  ? "rgba(0, 169, 14, 0.15)"
                                  : "rgba(216, 0, 0, 0.15)",
                                border: `2px solid ${
                                  question.correct
                                    ? "rgba(0, 169, 14, 0.3)"
                                    : "rgba(216, 0, 0, 0.3)"
                                }`,
                                opacity: 1,
                                transition:
                                  "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                cursor: "pointer",
                                "&:hover": {
                                  borderColor: question.correct
                                    ? "rgba(0, 169, 14, 0.8)"
                                    : "rgba(216, 0, 0, 0.8)",
                                  bgcolor: question.correct
                                    ? "rgba(0, 169, 14, 0.25)"
                                    : "rgba(216, 0, 0, 0.25)",
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                {question.correct ? (
                                  <CheckCircle color="success" />
                                ) : (
                                  <Cancel color="error" />
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.8,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      component="span"
                                    >
                                      {question.question}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption">
                                    Your answer: {question.userAnswer} • Score:{" "}
                                    {question.score > 0 ? "+" : ""}
                                    {question.score} • Time:{" "}
                                    {Math.round(
                                      (question.timeSpent || 0) / 1000,
                                    )}
                                    s
                                    {question.hintsUsed > 0 &&
                                      ` • Hints used: ${question.hintsUsed}`}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Link>
                        ))}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 2 }}
                      >
                        No questions completed
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Overall Stats & Actions */}
            <Box>
              <Stack spacing={2}>
                {/* Overall User Stats */}
                <Card
                  elevation={2}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Statistics
                    </Typography>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Total Games:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {userStats?.gamesPlayed || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">High Score:</Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="warning.main"
                        >
                          {userStats?.highScore || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Average Score:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {Math.round(userStats?.averageScore || 0)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Anonymous User Conversion Prompt */}
                {isAnonymous && (
                  <Alert
                    severity="info"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={onCreateAccount}
                        startIcon={<AccountCircle />}
                      >
                        Sign In
                      </Button>
                    }
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Save Your Progress!
                    </Typography>
                    <Typography variant="caption">
                      Create an account or sign in to save this score
                      permanently
                    </Typography>
                  </Alert>
                )}

                {/* Action Buttons */}
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={onPlayAgain}
                    sx={{ py: 1.5 }}
                  >
                    Play Again
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Leaderboard />}
                    onClick={onViewLeaderboard}
                  >
                    View Leaderboard
                  </Button>

                  <Button
                    variant="text"
                    startIcon={<Home />}
                    onClick={onBackToMenu}
                  >
                    Back to Menu
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default ResultsView;
