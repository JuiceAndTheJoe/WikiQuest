/**
 * GameView - Active quiz interface for WikiQuest
 * Pure component for displaying biography, hints, guess input, and score
 */

import { Lightbulb, Send, Timer, Home, Favorite } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ColorBends from "../components/background/ColorBends";

function GameView({
  gameState,
  hints,
  userGuess,
  onGuessChange,
  onSubmitGuess,
  onUseHint,
  onNextQuestion,
  onBackToHome,
  lastResult,
  wikipediaSummary,
  revealedSummarySentences,
  hintsUsed,
  wikipediaLoading,
  wikipediaError,
  hasSummary,
  canUseHint,
  isGameOver,
  blurAmount,
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

      <Container maxWidth="lg" sx={{ py: 3, position: "relative", zIndex: 1 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={onBackToHome}
          sx={{
            position: "fixed",
            left: 16,
            top: 16,
            zIndex: 10,
            fontWeight: "bold",
          }}
        >
          Home
        </Button>
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left Column - Question */}
            <Box
              sx={{
                flex: 2,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Card elevation={0} sx={{ bgcolor: "transparent" }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h5" gutterBottom>
                    Who is this? 🔍
                  </Typography>

                  {/* Wikipedia API Integration */}
                  <Typography variant="h6" component="h2" gutterBottom>
                    Biography Clues
                  </Typography>
                  {wikipediaLoading && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ my: 2 }}
                    >
                      <CircularProgress size={20} />
                      <Typography variant="caption" color="text.secondary">
                        Loading Wikipedia data…
                      </Typography>
                    </Stack>
                  )}
                  {wikipediaError && (
                    <Typography variant="body2" color="error" sx={{ my: 2 }}>
                      Error: {wikipediaError}
                    </Typography>
                  )}
                  {wikipediaSummary && (
                    <>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          width: "100%",
                          bgcolor: "grey.700",
                          my: 2,
                        }}
                      >
                        <Stack spacing={1.5}>
                          {wikipediaSummary.thumbnail && (
                            <Box
                              component="img"
                              src={wikipediaSummary.thumbnail.source}
                              alt="Person"
                              onContextMenu={(e) => e.preventDefault()}
                              onDragStart={(e) => e.preventDefault()}
                              sx={{
                                maxWidth: "220px",
                                borderRadius: 1,
                                mx: "auto",
                                display: "block",
                                pointerEvents: "auto",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                msUserSelect: "none",
                                filter: `blur(${blurAmount}px)`,
                                transition: "filter 0.3s ease",
                              }}
                            />
                          )}
                          {hintsUsed > 0 && (
                            <>
                              {wikipediaSummary.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {wikipediaSummary.description}
                                </Typography>
                              )}
                              <Stack spacing={1}>
                                {revealedSummarySentences?.map(
                                  (sentence, idx) => (
                                    <Typography
                                      key={`${sentence}-${idx}`}
                                      variant="body1"
                                      color="text.primary"
                                    >
                                      {sentence}
                                    </Typography>
                                  ),
                                )}
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Paper>
                      {hasSummary && hintsUsed === 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          Use hints to gradually reveal the biography text.
                        </Typography>
                      )}
                      {!hasSummary && !wikipediaLoading && (
                        <Typography variant="body2" color="text.secondary">
                          No summary is available for this person yet.
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Right Column - Hints */}
            <Box
              sx={{
                flex: 1,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Card elevation={0} sx={{ bgcolor: "transparent" }}>
                <CardContent sx={{ p: 0 }}>
                  <Stack
                    direction="row"
                    spacing={3}
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="column" spacing={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {[...Array(gameState?.lives || 3)].map((_, i) => (
                          <Favorite
                            key={i}
                            sx={{ color: "error.main", fontSize: "3rem" }}
                          />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="h6">
                            Score: {gameState?.score || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6">
                            🔥 {gameState?.streak || 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    <Chip
                      icon={<Timer />}
                      label={`Question ${(gameState?.totalQuestions || 0) + 1}`}
                      color="primary"
                    />
                  </Stack>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Questions: {gameState?.totalQuestions || 0}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          ((gameState?.correctAnswers || 0) /
                            Math.max(gameState?.totalQuestions || 1, 1)) *
                          100
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Accuracy:{" "}
                      {gameState?.totalQuestions > 0
                        ? Math.round(
                            ((gameState?.correctAnswers || 0) /
                              gameState.totalQuestions) *
                              100,
                          )
                        : 0}
                      %
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6">Hints left:</Typography>
                    {[
                      ...Array(hints?.availableHints - hints?.usedHints || 0),
                    ].map((_, i) => (
                      <Typography key={i} variant="h6">
                        🧩
                      </Typography>
                    ))}
                  </Stack>

                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Lightbulb />}
                      onClick={onUseHint}
                      disabled={!canUseHint || isGameOver}
                      fullWidth
                      sx={{ fontWeight: "bold" }}
                    >
                      Use Hint ({hints?.availableHints - hints?.usedHints || 0}{" "}
                      left)
                    </Button>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: "center" }}
                    >
                      Using hints reduces your score multiplier
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Guess Input */}
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Your guess"
                      placeholder="Enter the person's name..."
                      value={userGuess || ""}
                      onChange={(e) => onGuessChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSubmitGuess()}
                      disabled={isGameOver}
                      variant="outlined"
                    />

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={onSubmitGuess}
                        disabled={!userGuess?.trim() || isGameOver}
                        sx={{ minWidth: 120 }}
                      >
                        Submit Guess
                      </Button>

                      {isGameOver && (
                        <Button variant="outlined" onClick={onNextQuestion}>
                          Try Again
                        </Button>
                      )}
                    </Stack>

                    {/* Last Result Feedback */}
                    {lastResult && (
                      <Alert
                        severity={lastResult.correct ? "success" : "error"}
                      >
                        {lastResult.correct
                          ? `Correct! +${lastResult.scoreDelta} points`
                          : `Wrong! The answer was: ${lastResult.correctAnswer}`}
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default GameView;
