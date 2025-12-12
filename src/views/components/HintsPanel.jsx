import { memo, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Lightbulb, Send, Timer, Favorite } from "@mui/icons-material";
import "../../components/ElectricBorder.css";

const HintsPanel = memo(function HintsPanel({
  gameState,
  hints,
  canUseHint,
  isGameOver,
  userGuess,
  onGuessChange,
  onSubmitGuess,
  onUseHint,
  onNextQuestion,
}) {
  // Memoize hearts array to prevent re-renders
  const hearts = useMemo(
    () => [...Array(gameState?.lives || 3)],
    [gameState?.lives],
  );

  // Memoize hints left array
  const hintsLeft = useMemo(
    () => [...Array(hints?.availableHints - hints?.usedHints || 0)],
    [hints?.availableHints, hints?.usedHints],
  );

  const accuracy = gameState?.totalQuestions
    ? Math.round(
        ((gameState?.correctAnswers || 0) / gameState.totalQuestions) * 100,
      )
    : 0;

  return (
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
              {hearts.map((_, i) => (
                <Favorite
                  key={i}
                  sx={{ color: "error.main", fontSize: "3rem" }}
                />
              ))}
            </Stack>
            <Stack
              direction="row"
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6">
                  Score: {gameState?.score || 0}
                </Typography>
                <Typography variant="h6">
                  🔥 {gameState?.streak || 0}
                </Typography>
              </Box>
              {gameState?.streak >= 5 && (
                <Box
                  sx={{
                    marginLeft: "1rem",
                  }}
                >
                  <Typography
                    variant="h2"
                    className="pulse-animation"
                    sx={{
                      fontWeight: "bold",
                      color: gameState?.streak >= 7 ? "#ff9500" : "#d4e157",
                      textShadow:
                        gameState?.streak >= 7
                          ? "0 0 10px rgba(255, 149, 0, 0.6)"
                          : "0 0 10px rgba(212, 225, 87, 0.6)",
                    }}
                  >
                    {gameState?.streak >= 7 ? "2x" : "1.5x"}
                  </Typography>
                </Box>
              )}
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
            Accuracy: {accuracy}%
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Hints left:</Typography>
          {hintsLeft.map((_, i) => (
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
            Use Hint ({hints?.availableHints - hints?.usedHints || 0} left)
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
        </Stack>
      </CardContent>
    </Card>
  );
});

export default HintsPanel;
