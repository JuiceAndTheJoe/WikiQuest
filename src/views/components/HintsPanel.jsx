import { memo, useMemo, useRef, useEffect } from "react";
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
  const textFieldRef = useRef(null);
  const prevStreakRef = useRef(gameState?.streak || 0);
  const hadFocusRef = useRef(false);

  // Track if streak crosses threshold (4 or 8) and remember if textbox had focus
  useEffect(() => {
    const currentStreak = gameState?.streak || 0;
    const prevStreak = prevStreakRef.current;

    // Check if we're crossing a threshold where animation starts/stops
    const crossesThreshold =
      (prevStreak < 4 && currentStreak >= 4) || // Animation starts
      (prevStreak >= 4 && currentStreak < 4) || // Animation stops
      (prevStreak < 8 && currentStreak >= 8) || // Rainbow animation starts
      (prevStreak >= 8 && currentStreak < 8); // Rainbow animation stops

    if (crossesThreshold && !isGameOver) {
      hadFocusRef.current = document.activeElement === textFieldRef.current;
    }

    prevStreakRef.current = currentStreak;
  }, [gameState?.streak, isGameOver]);

  // Re-focus if we were focused before threshold cross
  useEffect(() => {
    if (hadFocusRef.current && textFieldRef.current && !isGameOver) {
      // Use setTimeout to ensure focus happens after re-render
      const timer = setTimeout(() => {
        textFieldRef.current?.focus();
        hadFocusRef.current = false;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [gameState?.streak, isGameOver]);

  // Memoize hearts array to prevent re-renders
  const hearts = useMemo(
    () => [...Array(gameState?.lives || MAX_LIVES)],
    [gameState?.lives]
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

  // Calculate electric border color based on streak to match the border effect
  const getTextboxColor = () => {
    const streak = gameState?.streak || 0;
    if (streak < 1) return null;
    if (streak >= 6) {
      // Rainbow color cycling to match the electric border
      const time = Date.now() / 100;
      const hue = time % 360;
      return `hsl(${hue}, 100%, 50%)`;
    }

    const normalizedStreak = Math.min(streak - 1, 4) / 4; // 0-1 scale from streak 1-5
    const hue = Math.round(200 * (1 - normalizedStreak));
    return `hsl(${hue}, 100%, 50%)`;
  };

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
            </Stack>
          </Stack>
          <Stack direction="column" spacing={1} alignItems="flex-end">
            <Chip
              icon={<Timer />}
              label={`Question ${(gameState?.totalQuestions || 0) + 1}`}
              color="primary"
            />
            {gameState?.streak >= 2 && (
              <Box>
                <Typography
                  variant="h2"
                  className={
                    gameState?.streak >= 6
                      ? "blink-rainbow-animation"
                      : "pulse-animation"
                  }
                  sx={{
                    fontWeight: "bold",
                    color:
                      gameState?.streak >= 6
                        ? "#ff00ff"
                        : gameState?.streak >= 4
                          ? "#ff9500"
                          : "#d4e157",
                    textShadow:
                      gameState?.streak >= 6
                        ? "0 0 10px rgba(255, 0, 255, 0.8)"
                        : gameState?.streak >= 4
                          ? "0 0 10px rgba(255, 149, 0, 0.6)"
                          : "0 0 10px rgba(212, 225, 87, 0.6)",
                  }}
                >
                  {gameState?.streak >= 6
                    ? "3x 🚀"
                    : gameState?.streak >= 4
                      ? "2x"
                      : "1.5x"}
                </Typography>
              </Box>
            )}
          </Stack>
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
            sx={{
              "& .MuiFormLabel-root": {
                color:
                  gameState?.streak >= 4
                    ? getTextboxColor
                    : "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color:
                    gameState?.streak >= 4
                      ? getTextboxColor
                      : "rgba(255, 255, 255, 0.7)",
                },
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor:
                    gameState?.streak >= 4
                      ? getTextboxColor
                      : "rgba(255, 255, 255, 0.23)",
                  borderWidth: gameState?.streak >= 4 ? "2px" : "1px",
                },
                "&:hover fieldset": {
                  borderColor:
                    gameState?.streak >= 4
                      ? getTextboxColor
                      : "rgba(255, 255, 255, 0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    gameState?.streak >= 4
                      ? getTextboxColor
                      : "rgba(255, 255, 255, 0.87)",
                  boxShadow:
                    gameState?.streak >= 4
                      ? `0 0 15px ${getTextboxColor}66, inset 0 0 10px ${getTextboxColor}33`
                      : "none",
                },
              },
            }}
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
