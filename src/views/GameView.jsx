/**
 * GameView - Active quiz interface for WikiQuest
 * Pure component for displaying biography, hints, guess input, and score
 * All logic and calculations are handled by GamePresenter
 */

import { ArrowBack } from "@mui/icons-material";
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
import ColorBends from "../components/background/ColorBends";

function GameView({
  gameState,
  hints,
  userGuess,
  themeMode,
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
  borderConfig,
}) {
  const hasSummary = totalSummarySentences > 0;
  const canUseHint =
    hasSummary && hints && hints.availableHints > hints.usedHints;
  const isGameOver = gameState?.lives <= 0;
  const isDark = themeMode === "dark";

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Animated Background with invert filter for light mode */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          filter: isDark ? "none" : "invert(1)",
        }}
      >
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
        />
      </Box>
      <Container maxWidth="lg" sx={{ py: 3, position: "relative", zIndex: 1 }}>
        <Stack spacing={3}>
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBack />}
              onClick={onBackToHome}
              sx={{ fontWeight: "bold", alignSelf: "flex-start" }}
            >
              Back to Menu
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
              alignItems: "stretch",
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
                ? `+${lastResult.scoreDelta} points${lastResult.currentMultiplier > 1 ? ` (${lastResult.currentMultiplier.toFixed(1)}x)` : ""}`
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
