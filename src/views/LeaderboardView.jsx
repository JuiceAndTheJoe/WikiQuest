import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';

function LeaderboardView({ leaderboardData = [], loading = false, error = null, onReturn = () => {} }) {
  return (
    <Paper sx={{ p: 3, maxWidth: 820, m: '2rem auto' }} elevation={2}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Leaderboard</Typography>
          <Button variant="outlined" onClick={onReturn}>Back to Player Hub</Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error">Error loading leaderboard: {String(error)}</Typography>
        )}

        {!loading && !error && leaderboardData.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No leaderboard data available yet. Be the first to play!
          </Typography>
        )}

        {!loading && !error && leaderboardData.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">High Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboardData.map((entry, index) => (
                  <TableRow key={entry.userId || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.email || 'Anonymous'}</TableCell>
                    <TableCell align="right">{entry.highScore || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Paper>
  );
}

export default LeaderboardView;
