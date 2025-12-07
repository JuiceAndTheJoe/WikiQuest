/**
 * GameView - Active quiz interface for WikiQuest
 * Pure component for displaying biography, hints, guess input, and score
 */

import { Lightbulb, Send, Timer, Home } from '@mui/icons-material';
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
} from '@mui/material';

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
  totalSummarySentences,
  hintsUsed,
  wikipediaLoading,
  wikipediaError,
}) {
  const hasSummary = totalSummarySentences > 0;
  const canUseHint =
    hasSummary && hints && hints.availableHints > hints.usedHints;
  const isGameOver = gameState?.lives <= 0;

  const getBlurAmount = () => {
    if (hintsUsed === 0) return 8;
    if (hintsUsed === 1) return 5;
    if (hintsUsed === 2) return 2;
    return 0;
  };

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Game Header */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack
            direction='row'
            spacing={3}
            alignItems='center'
            justifyContent='space-between'
          >
            <Stack direction='row' spacing={3} alignItems='center'>
              <Box>
                <Typography variant='h6'>
                  Score: {gameState?.score || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant='h6'>
                  Streak: {gameState?.streak || 0}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant='h6'
                  color={gameState?.lives <= 1 ? 'error' : 'inherit'}
                >
                  Lives: {gameState?.lives || 3}
                </Typography>
              </Box>
            </Stack>
            <Chip
              icon={<Timer />}
              label={`Question ${(gameState?.totalQuestions || 0) + 1}`}
              color='primary'
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left Column - Question */}
          <Box sx={{ flex: 2 }}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h5' gutterBottom>
                  Who Am I?
                </Typography>

                {/* Wikipedia API Integration */}
                <Typography variant='h6' component='h2' gutterBottom>
                  Biography Clues
                </Typography>
                {wikipediaLoading && (
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                    sx={{ my: 2 }}
                  >
                    <CircularProgress size={20} />
                    <Typography variant='caption' color='text.secondary'>
                      Loading Wikipedia data…
                    </Typography>
                  </Stack>
                )}
                {wikipediaError && (
                  <Typography variant='body2' color='error' sx={{ my: 2 }}>
                    Error: {wikipediaError}
                  </Typography>
                )}
                {wikipediaSummary && (
                  <>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        width: '100%',
                        bgcolor: 'grey.700',
                        my: 2,
                      }}
                    >
                      <Stack spacing={1.5}>
                        {wikipediaSummary.thumbnail && (
                          <Box
                            component='img'
                            src={wikipediaSummary.thumbnail.source}
                            alt='Person'
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            sx={{
                              maxWidth: '220px',
                              borderRadius: 1,
                              mx: 'auto',
                              display: 'block',
                              pointerEvents: 'auto',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none',
                              filter: `blur(${getBlurAmount()}px)`,
                              transition: 'filter 0.3s ease',
                            }}
                          />
                        )}
                        {hintsUsed > 0 && (
                          <>
                            {wikipediaSummary.description && (
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {wikipediaSummary.description}
                              </Typography>
                            )}
                            <Stack spacing={1}>
                              {revealedSummarySentences?.map(
                                (sentence, idx) => (
                                  <Typography
                                    key={`${sentence}-${idx}`}
                                    variant='body1'
                                    color='text.primary'
                                  >
                                    {sentence}
                                  </Typography>
                                )
                              )}
                            </Stack>
                          </>
                        )}
                      </Stack>
                    </Paper>
                    {hasSummary && hintsUsed === 0 && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontStyle: 'italic' }}
                      >
                        Use hints to gradually reveal the biography text.
                      </Typography>
                    )}
                    {!hasSummary && !wikipediaLoading && (
                      <Typography variant='body2' color='text.secondary'>
                        No summary is available for this person yet.
                      </Typography>
                    )}
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Guess Input */}
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label='Your guess'
                    placeholder="Enter the person's name..."
                    value={userGuess || ''}
                    onChange={(e) => onGuessChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSubmitGuess()}
                    disabled={isGameOver}
                    variant='outlined'
                  />

                  <Stack direction='row' spacing={2}>
                    <Button
                      variant='contained'
                      startIcon={<Send />}
                      onClick={onSubmitGuess}
                      disabled={!userGuess?.trim() || isGameOver}
                      sx={{ minWidth: 120 }}
                    >
                      Submit Guess
                    </Button>

                    {isGameOver && (
                      <Button variant='outlined' onClick={onNextQuestion}>
                        Try Again
                      </Button>
                    )}
                  </Stack>

                  {/* Last Result Feedback */}
                  {lastResult && (
                    <Alert severity={lastResult.correct ? 'success' : 'error'}>
                      {lastResult.correct
                        ? `Correct! +${lastResult.scoreDelta} points`
                        : `Wrong! The answer was: ${lastResult.correctAnswer}`}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Hints */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Hints
                </Typography>

                <Stack spacing={2}>
                  <Stack spacing={1}>
                    {[1, 2, 3].map((stage) => {
                      const isUnlocked = hintsUsed >= stage;
                      const isCurrent = hintsUsed + 1 === stage;
                      const descriptions = [
                        'Reveals the first sentence',
                        'Adds the next sentence',
                        'Shows the entire summary',
                      ];
                      return (
                        <Paper
                          key={stage}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            bgcolor: isUnlocked
                              ? 'success.light'
                              : isCurrent
                                ? 'warning.light'
                                : 'action.hover',
                          }}
                        >
                          <Typography variant='subtitle2'>
                            Hint {stage}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {descriptions[stage - 1]}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </Stack>

                  <Button
                    variant='contained'
                    color='error'
                    startIcon={<Lightbulb />}
                    onClick={onUseHint}
                    disabled={!canUseHint || isGameOver}
                    fullWidth
                    sx={{ fontWeight: 'bold' }}
                  >
                    Use Hint ({hints?.availableHints - hints?.usedHints || 0}{' '}
                    left)
                  </Button>

                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ textAlign: 'center' }}
                  >
                    Using hints reduces your score multiplier
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card elevation={1} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Progress
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant='body2' gutterBottom>
                      Questions: {gameState?.totalQuestions || 0}
                    </Typography>
                    <LinearProgress
                      variant='determinate'
                      value={
                        ((gameState?.correctAnswers || 0) /
                          Math.max(gameState?.totalQuestions || 1, 1)) *
                        100
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant='caption' color='text.secondary'>
                    Accuracy:{' '}
                    {gameState?.totalQuestions > 0
                      ? Math.round(
                          ((gameState?.correctAnswers || 0) /
                            gameState.totalQuestions) *
                            100
                        )
                      : 0}
                    %
                  </Typography>
                </Stack>
                <Button
                  variant='outlined'
                  size='medium'
                  startIcon={<Home />}
                  onClick={onBackToHome}
                  sx={{ mt: 2, fontWeight: 'bold' }}
                  fullWidth
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}

export default GameView;
