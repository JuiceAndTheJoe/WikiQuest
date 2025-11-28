import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

function LevelView({ level, lives, difficulty, inGame, lastGuessResult, guessInput, setGuessInput, onGuess, onReturn = () => {}, wikipediaLoading = false, wikipediaError = null, wikipediaSummary = null, wikipediaSections = null, showGameOver = false, onPlayAgain = () => {}, onGameOverReturn = () => {}, correctCount = 0, highScore = 0 }) {
  return (
    <>
      <Paper sx={{ p: 3, maxWidth: 720, m: '2rem auto' }} elevation={2}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h4">Level {level}</Typography>
          <Typography variant="subtitle1">Lives: {lives}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{difficulty}</Typography>
        </Box>

        {lastGuessResult === 'correct' && <Typography color="success.main">Correct! Moving to next level.</Typography>}
        {lastGuessResult === 'wrong' && <Typography color="error">Wrong guess. Try again.</Typography>}

        <Box>
          {wikipediaLoading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="caption">Loading hint…</Typography>
            </Stack>
          )}
          {wikipediaError && (
            <Typography color="error">Hint error: {String(wikipediaError)}</Typography>
          )}
          {!wikipediaLoading && !wikipediaError && (
            <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
              {difficulty === 'HARD' && wikipediaSummary && (
                <Typography variant="body2">{wikipediaSummary.extract}</Typography>
              )}
              {difficulty === 'MEDIUM' && wikipediaSections && wikipediaSections[0] && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{wikipediaSections[0].text.split('\n').slice(0,2).join('\n')}</Typography>
              )}
              {difficulty === 'EASY' && wikipediaSections && wikipediaSections[0] && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{wikipediaSections[0].text}</Typography>
              )}
            </Box>
          )}
          <TextField
            label="Type your guess"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            sx={{ mr: 1, width: '60%' }}
          />
          <Button variant="contained" color="success" onClick={onGuess}>Guess</Button>
          <Button variant="text" color="inherit" onClick={onReturn} sx={{ ml: 1 }}>Return to Home</Button>
        </Box>
      </Stack>
        </Paper>

        <Dialog open={Boolean(showGameOver)} aria-labelledby="game-over-title">
          <DialogTitle id="game-over-title">Game Over</DialogTitle>
          <DialogContent>
            <Typography>You reached level {Math.max(0, (level || 1) - 1)}.</Typography>
            <Typography>Correct guesses this run: {correctCount}</Typography>
            <Typography>All-time high score: {highScore}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button variant="contained" color="primary" onClick={onPlayAgain}>Play Again</Button>
              <Button variant="outlined" color="secondary" onClick={onGameOverReturn}>Return to Player Hub</Button>
            </Box>
          </DialogContent>
        </Dialog>
      </>
  );
}

export default LevelView;
