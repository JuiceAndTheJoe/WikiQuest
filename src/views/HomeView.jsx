/**
 * MenuView - Main menu interface for WikiQuest
 * Pure component for game start, leaderboard access, and user info display
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
  Avatar,
  Grid,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  Leaderboard,
  Person,
  Quiz,
  ExitToApp,
  EmojiEvents
} from '@mui/icons-material';

// Pure view: receives interaction handlers & data via props from Presenter.
function MenuView({
  user,
  onLogout,
  onStartGame,
  onViewLeaderboard,
  userStats = { gamesPlayed: 0, highScore: 0, totalScore: 0 }
}) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            <Quiz sx={{ fontSize: 'inherit', mr: 1, verticalAlign: 'bottom' }} />
            WikiQuest
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Test your knowledge of famous people!
          </Typography>
        </Box>

        {/* User Info */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {user?.email || 'Player'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Games Played: {userStats.gamesPlayed}
                </Typography>
              </Box>
            </Stack>
            <Stack alignItems="flex-end" spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmojiEvents color="warning" />
                <Typography variant="h6">
                  High Score: {userStats.highScore}
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExitToApp />}
                onClick={onLogout}
              >
                Logout
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {/* Game Options */}
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Start New Game
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Guess famous people based on their Wikipedia biographies. 
                  Use hints wisely to maximize your score!
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={onStartGame}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                    minWidth: 200
                  }}
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats & Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              {/* Stats Card */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Stats
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Score:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {userStats.totalScore || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Games:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {userStats.gamesPlayed}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">High Score:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {userStats.highScore}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Leaderboard Button */}
              <Button
                variant="outlined"
                startIcon={<Leaderboard />}
                onClick={onViewLeaderboard}
                sx={{ py: 1.5 }}
              >
                View Leaderboard
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Game Rules */}
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            How to Play
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                  <li>Read the biographical clues about a famous person</li>
                  <li>Type your guess for who it is</li>
                  <li>Use hints if you're stuck (reduces score)</li>
                  <li>Faster answers get bonus points</li>
                </ul>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="div">
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                  <li>Correct answers increase your streak</li>
                  <li>Wrong answers end the game</li>
                  <li>Challenge yourself with famous people from history</li>
                  <li>Compete for the highest score!</li>
                </ul>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}

export default MenuView;
