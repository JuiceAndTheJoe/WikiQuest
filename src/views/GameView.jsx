/**
 * GameView - Active quiz interface for WikiQuest
 * Pure component for displaying biography, hints, guess input, and score
 */

import { Home } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import QuestionCard from "./components/QuestionCard";
import HintsPanel from "./components/HintsPanel";
import CardWrapper from "./components/CardWrapper";

function GameView({
  gameState,
  hints,
  userGuess,
  onGuessChange,
  onSubmitGuess,
  onUseHint,
  onSkipQuestion,
  onNextQuestion,
  onBackToHome,
  lastResult,
  wikipediaSummary,
  revealedSummarySentences,
  totalSummarySentences,
  hintsUsed,
  wikipediaLoading,
  wikipediaError,
  showResultFeedback,
  onCloseResultFeedback,
  difficulty,
}) {
  const hasSummary = totalSummarySentences > 0;
  const canUseHint =
    hasSummary && hints && hints.availableHints > hints.usedHints;
  const isGameOver = gameState?.lives <= 0;

  // Calculate electric border intensity based on streak
  const getElectricBorderConfig = (streak) => {
    const currentStreak = streak || 0;

    // Disabled for streak 0-2
    if (currentStreak < 3) {
      return { opacity: 0, speed: 0, chaos: 0, thickness: 0, color: "#7df9ff" };
    }

    // Mild at streak 3, scales up progressively, reaches max at streak 10
    // streak 3: opacity 0.3, speed 0.5, chaos 0.2, color blue
    // streak 5: opacity 0.5, speed 0.9, chaos 0.5, color cyan-green
    // streak 7: opacity 0.7, speed 1.4, chaos 0.8, color yellow-orange
    // streak 10+: opacity 1, speed 2, chaos 1, color red (MAX)

    const normalizedStreak = Math.min(currentStreak - 3, 7) / 7; // 0-1 scale from streak 3-10

    // Color progression: cyan/blue (200°) → green (120°) → yellow (60°) → orange (30°) → red (0°)
    // Hue goes from 200 to 0 as normalizedStreak goes from 0 to 1
    const hue = Math.round(200 * (1 - normalizedStreak));
    const color = `hsl(${hue}, 100%, 50%)`;

    return {
      opacity: Math.min(0.3 + normalizedStreak * 0.7, 1),
      speed: Math.min(0.5 + normalizedStreak * 1.8, 2),
      chaos: Math.min(0.2 + normalizedStreak * 1.0, 1),
      thickness: Math.min(1 + normalizedStreak * 1.5, 2.5),
      color,
    };
  };

  const borderConfig = getElectricBorderConfig(gameState?.streak);

  const getBlurAmount = () => {
    if (hintsUsed === 0) return 8;
    if (hintsUsed === 1) return 5;
    if (hintsUsed === 2) return 2;
    return 0;
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: "black" }}>
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
            <CardWrapper borderConfig={borderConfig} flex={2}>
              <QuestionCard
                difficulty={difficulty}
                wikipediaLoading={wikipediaLoading}
                wikipediaError={wikipediaError}
                wikipediaSummary={wikipediaSummary}
                hasSummary={hasSummary}
                hintsUsed={hintsUsed}
                revealedSummarySentences={revealedSummarySentences}
                onSkipQuestion={onSkipQuestion}
                hints={hints}
                getBlurAmount={getBlurAmount}
              />
            </CardWrapper>

            {/* Right Column - Hints */}
            <CardWrapper borderConfig={borderConfig} flex={1}>
              <HintsPanel
                gameState={gameState}
                hints={hints}
                canUseHint={canUseHint}
                isGameOver={isGameOver}
                userGuess={userGuess}
                onGuessChange={onGuessChange}
                onSubmitGuess={onSubmitGuess}
                onUseHint={onUseHint}
                onNextQuestion={onNextQuestion}
              />
            </CardWrapper>
          </Box>
        </Stack>
      </Container>

      {/* Last Result Feedback Modal */}
      {lastResult && (
        <Dialog
          open={showResultFeedback}
          onClose={onCloseResultFeedback}
          maxWidth="sm"
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCloseResultFeedback();
            }
          }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 3,
                boxShadow: 6,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backgroundColor:
                  lastResult.guess === "[SKIPPED]"
                    ? "rgba(100, 100, 100, 0.3)"
                    : lastResult.correct
                      ? "rgba(0, 169, 14, 0.2)"
                      : "rgba(216, 0, 0, 0.2)",
              },
            },
            backdrop: {
              sx: {
                backdropFilter: "blur(4px)",
              },
            },
          }}
        >
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              py: 6,
              px: 4,
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {wikipediaSummary?.thumbnail && (
              <Box
                component="img"
                src={wikipediaSummary.thumbnail.source}
                alt="Celebrity"
                sx={{
                  maxWidth: "280px",
                  maxHeight: "280px",
                  borderRadius: 2,
                  mb: 0.5,
                  border: "3px solid white",
                  boxShadow: 3,
                }}
              />
            )}
            {lastResult.correctAnswer && lastResult.correct && (
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {lastResult.correctAnswer}
              </Typography>
            )}
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "white",
              }}
            >
              {lastResult.guess === "[SKIPPED]"
                ? "Skipped!"
                : lastResult.correct
                  ? "Correct!"
                  : "Wrong!"}
            </Typography>
            {lastResult.correct ? null : (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {lastResult.guess === "[SKIPPED]"
                    ? `The answer was: ${lastResult.correctAnswer}`
                    : `The answer was: ${lastResult.correctAnswer}`}
                </Typography>
              </>
            )}
            <Typography
              variant="h5"
              sx={{
                color:
                  lastResult.guess === "[SKIPPED]"
                    ? "#a9a9a9"
                    : lastResult.correct
                      ? "#00a90e"
                      : "#d80000",
                fontWeight: 600,
              }}
            >
              {lastResult.correct
                ? `+${lastResult.scoreDelta} points${lastResult.streakMultiplier > 1 ? ` (${lastResult.streakMultiplier}x)` : ""}`
                : lastResult.guess === "[SKIPPED]"
                  ? `${lastResult.scoreDelta * 10} points`
                  : `${lastResult.scoreDelta} points`}
            </Typography>
            <Button
              variant="contained"
              color={
                lastResult.guess === "[SKIPPED]"
                  ? "inherit"
                  : lastResult.correct
                    ? "success"
                    : "error"
              }
              size="large"
              onClick={onCloseResultFeedback}
              sx={{
                mt: 2,
                px: 4,
              }}
            >
              Continue
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default GameView;
