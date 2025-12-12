import { memo, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const QuestionCard = memo(function QuestionCard({
  difficulty,
  wikipediaLoading,
  wikipediaError,
  wikipediaSummary,
  hasSummary,
  hintsUsed,
  revealedSummarySentences,
  onSkipQuestion,
  hints,
}) {
  // Memoize blur amount to prevent recalculation on every render
  const blurAmount = useMemo(() => {
    if (hintsUsed === 0) return 8;
    if (hintsUsed === 1) return 5;
    if (hintsUsed === 2) return 2;
    return 0;
  }, [hintsUsed]);

  return (
    <Card elevation={0} sx={{ bgcolor: "transparent" }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" gutterBottom sx={{ m: 0 }}>
            Who is this? 🔍
          </Typography>
          {difficulty && (
            <Chip
              label={difficulty.toUpperCase()}
              color="primary"
              size="small"
            />
          )}
        </Stack>

        <Typography variant="h6" component="h2" gutterBottom>
          Biography Clues
        </Typography>
        {wikipediaLoading && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 2 }}>
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
                bgcolor: "transparent",
                my: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Stack spacing={1} alignItems="center">
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
                  {hints && hints.usedHints >= hints.availableHints && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={onSkipQuestion}
                      sx={{ mt: 1 }}
                    >
                      Skip
                    </Button>
                  )}
                </Stack>
                {hintsUsed > 0 && (
                  <>
                    {wikipediaSummary.description && (
                      <Typography variant="body2" color="text.secondary">
                        {wikipediaSummary.description}
                      </Typography>
                    )}
                    <Stack spacing={1}>
                      {revealedSummarySentences?.map((sentence, idx) => (
                        <Typography
                          key={`${sentence}-${idx}`}
                          variant="body1"
                          color="text.primary"
                        >
                          {sentence}
                        </Typography>
                      ))}
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
  );
});

export default QuestionCard;
