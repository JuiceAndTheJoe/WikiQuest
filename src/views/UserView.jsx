import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

function UserView({ level, highScore, lives, inGame, correctCount, onStartNew, onContinue, user, onLogout, onViewLeaderboard = () => {} }) {
  return (
    <Paper sx={{ p: 3, maxWidth: 820, m: '2rem auto' }} elevation={2}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Player Hub</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Signed in as: {user?.email}</Typography>
            <Button variant="outlined" size="small" onClick={onLogout}>Logout</Button>
          </Box>
        </Box>

        <Typography>Current Level: {level}</Typography>
        <Typography>Current Lives: {lives}</Typography>
        <Typography>Current Round Progress: {correctCount} correct this run</Typography>
        <Typography>High Score (levels completed): {highScore}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={onStartNew}>Start New Game</Button>
          <Button variant="outlined" color="secondary" onClick={onContinue} disabled={!inGame}>Continue</Button>
          <Button variant="outlined" color="info" onClick={onViewLeaderboard}>View Leaderboard</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default UserView;
