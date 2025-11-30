/**
 * GameView - Active quiz interface for WikiQuest
 * Pure component for displaying biography, hints, guess input, and score
 */

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  Lightbulb,
  Send,
  Timer,
  EmojiEvents,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

function GameView({
  currentQuestion,
  gameState,
  hints,
  userGuess,
  onGuessChange,
  onSubmitGuess,
  onUseHint,
  onNextQuestion,
  lastResult,
  wikipediaSummary,
  wikipediaContentText,
  wikipediaLoading,
  wikipediaError,
  showFullText,
  onToggleFullText,
  loading
}) {
  const canUseHint = hints && hints.availableHints > hints.usedHints;
  const isGameOver = gameState?.lives <= 0;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Game Header */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={3} alignItems="center">
              <Box>
                <Typography variant="h6">Score: {gameState?.score || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="h6">Streak: {gameState?.streak || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="h6" color={gameState?.lives <= 1 ? "error" : "inherit"}>
                  Lives: {gameState?.lives || 3}
                </Typography>
              </Box>
            </Stack>
            <Chip 
              icon={<Timer />} 
              label={`Question ${(gameState?.totalQuestions || 0) + 1}`}
              color="primary" 
            />
          </Stack>
        </Paper>

        {/* Last Result Feedback */}
        {lastResult && (
          <Alert 
            severity={lastResult.correct ? "success" : "error"}
            onClose={() => {}}
          >
            {lastResult.correct 
              ? `Correct! +${lastResult.finalScore} points` 
              : `Wrong! The answer was: ${lastResult.correctAnswer}`
            }
            {lastResult.partialMatch && " (Partial match - some points awarded)"}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Column - Question */}
          <Box sx={{ flex: 2 }}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Who Am I?
                </Typography>
                
                {/* Wikipedia API Integration */}
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
                  <Paper elevation={1} sx={{ p: 2, width: "100%", bgcolor: "grey.50", my: 2 }}>
                    <Stack spacing={1.5}>
                      {wikipediaSummary.thumbnail && (
                        <Box
                          component="img"
                          src={wikipediaSummary.thumbnail.source}
                          alt="Person"
                          sx={{ maxWidth: "200px", borderRadius: 1, mx: 'auto' }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {wikipediaSummary.description}
                      </Typography>
                      <Typography variant="body1">
                        {wikipediaSummary.extract}
                      </Typography>
                    </Stack>
                  </Paper>
                )}

                {/* Full plain-text content (toggle) */}
                {wikipediaContentText && (
                  <>
                    <Button
                      variant="text"
                      size="small"
                      onClick={onToggleFullText}
                      startIcon={showFullText ? <VisibilityOff /> : <Visibility />}
                      sx={{ textTransform: "none", mb: 1 }}
                    >
                      {showFullText ? "Hide full biography" : "Show full biography"}
                    </Button>
                    {showFullText && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          width: "100%",
                          bgcolor: "background.paper",
                          whiteSpace: "pre-wrap",
                          maxHeight: 320,
                          overflow: "auto",
                          border: "1px solid",
                          borderColor: "divider",
                          mb: 2
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{ fontFamily: "inherit" }}
                        >
                          {wikipediaContentText}
                        </Typography>
                      </Paper>
                    )}
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Guess Input */}
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Your guess"
                    placeholder="Enter the person's name..."
                    value={userGuess || ''}
                    onChange={(e) => onGuessChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSubmitGuess()}
                    disabled={loading || isGameOver}
                    variant="outlined"
                  />
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={onSubmitGuess}
                      disabled={!userGuess?.trim() || loading || isGameOver}
                      sx={{ minWidth: 120 }}
                    >
                      Submit Guess
                    </Button>
                    
                    {isGameOver && (
                      <Button
                        variant="outlined"
                        onClick={onNextQuestion}
                        disabled={loading}
                      >
                        Try Again
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Hints */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hints
                </Typography>
                
                <Stack spacing={2}>
                  {hints?.usedHints > 0 && (
                    <Box>
                      {hints.currentHints.map((hint, index) => (
                        <Paper key={index} elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: 'action.hover' }}>
                          <Typography variant="body2">
                            <strong>Hint {index + 1}:</strong> {hint}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Lightbulb />}
                    onClick={onUseHint}
                    disabled={!canUseHint || loading || isGameOver}
                    fullWidth
                  >
                    Use Hint ({hints?.availableHints - hints?.usedHints || 0} left)
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Using hints reduces your score multiplier
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card elevation={1} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progress
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Questions: {gameState?.totalQuestions || 0}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={((gameState?.correctAnswers || 0) / Math.max(gameState?.totalQuestions || 1, 1)) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Accuracy: {gameState?.totalQuestions > 0 
                      ? Math.round(((gameState?.correctAnswers || 0) / gameState.totalQuestions) * 100)
                      : 0}%
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}

export default GameView;