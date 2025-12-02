/**
 * ResultsView - Game over screen with statistics and replay options
 * Pure component for displaying final score, game stats, and next actions
 */

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Leaderboard,
  Home,
  EmojiEvents,
  Timer,
  TrendingUp,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

function ResultsView({
  gameStats,
  gameHistory,
  userStats,
  onPlayAgain,
  onViewLeaderboard,
  onBackToMenu,
  newHighScore = false
}) {
  const accuracy = gameStats?.totalQuestions > 0 
    ? Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100) 
    : 0;
    
  const gameTime = gameStats?.gameTime 
    ? Math.round(gameStats.gameTime / 1000) 
    : 0;
    
  const avgTimePerQuestion = gameStats?.totalQuestions > 0 && gameTime > 0
    ? Math.round(gameTime / gameStats.totalQuestions)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            color={newHighScore ? "success.main" : "inherit"}
          >
            {newHighScore ? "🎉 New High Score! 🎉" : "Game Over"}
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            Final Score: {gameStats?.score || 0}
          </Typography>
          {newHighScore && (
            <Chip 
              icon={<EmojiEvents />} 
              label="Personal Best!" 
              color="warning"
              sx={{ fontSize: '1rem', py: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Game Statistics */}
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Game Statistics
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Main Stats */}
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Questions Answered:</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {gameStats?.totalQuestions || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Correct Answers:</Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {gameStats?.correctAnswers || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Best Streak:</Typography>
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
                  </Grid>

                  {/* Time Stats */}
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Game Time:</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Avg per Question:</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {avgTimePerQuestion}s
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Hints Used:</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {gameHistory?.reduce((total, q) => total + (q.hintsUsed || 0), 0) || 0}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1">Difficulty:</Typography>
                          <Chip 
                            label={gameStats?.difficulty?.toUpperCase() || 'EASY'} 
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Question History */}
                <Typography variant="h6" gutterBottom>
                  Question Breakdown
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {gameHistory && gameHistory.length > 0 ? (
                    <Stack spacing={1}>
                      {gameHistory.map((question, index) => (
                        <Paper key={index} elevation={0} sx={{ p: 2, bgcolor: question.correct ? 'success.light' : 'error.light', opacity: 0.8 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            {question.correct ? 
                              <CheckCircle color="success" /> : 
                              <Cancel color="error" />
                            }
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                {question.question}
                              </Typography>
                              <Typography variant="caption">
                                Your answer: {question.userAnswer} • 
                                Score: +{question.score} • 
                                Time: {Math.round((question.timeSpent || 0) / 1000)}s
                                {question.hintsUsed > 0 && ` • Hints used: ${question.hintsUsed}`}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No questions completed
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Overall Stats & Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* Overall User Stats */}
              <Card elevation={2}>
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
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {userStats?.highScore || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Score:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {userStats?.totalScore || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Average Score:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round(userStats?.averageScore || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  {/* Progress Bar */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Progress to Next Milestone
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={((userStats?.totalScore || 0) % 1000) / 10}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>

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
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

export default ResultsView;