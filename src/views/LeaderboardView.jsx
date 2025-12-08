/**
 * LeaderboardView - High scores and rankings display
 * Pure component for showing top players and their statistics
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  EmojiEvents,
  TrendingUp,
  Person,
} from "@mui/icons-material";
import ColorBends from "../components/background/ColorBends";

function LeaderboardView({
  leaderboardData,
  loading,
  error,
  userRank,
  currentUser,
  onBackToMenu,
}) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "warning.main"; // Gold
      case 2:
        return "grey.500"; // Silver
      case 3:
        return "error.main"; // Bronze
      default:
        return "text.primary";
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Animated Background */}
      <ColorBends
        colors={["#d80000ff", "#00a90eff", "#0010bdff"]}
        rotation={30}
        speed={0.3}
        scale={1.2}
        frequency={1.4}
        warpStrength={1.2}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0}
        transparent={false}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onBackToMenu}
            >
              Back to Menu
            </Button>
            <Typography variant="h3" component="h1">
              Leaderboard 📶
            </Typography>
          </Box>

          {/* User Rank & Community Stats Section */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="stretch"
          >
            {/* User's Current Rank - Left Half */}
            {userRank && (
              <Card
                elevation={2}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  flex: { xs: 1, md: 0.5 },
                  width: "100%",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <Person />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {currentUser?.isAnonymous
                          ? "Guest Player"
                          : currentUser?.email || "You"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your Current Rank: {` #${userRank.rank}`}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h4" fontWeight="bold">
                        {getRankIcon(userRank.rank)}
                      </Typography>
                      <Typography variant="body2">
                        Your Highscore: {userRank.highScore}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Community Statistics - Right Half */}
            {leaderboardData && leaderboardData.length > 0 && (
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  flex: { xs: 1, md: 0.5 },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Community Statistics
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Players
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {leaderboardData.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Highest Score
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {Math.max(
                        ...leaderboardData.map((p) => p.highScore || 0),
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Games Played
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {leaderboardData
                        .reduce((sum, p) => sum + (p.gamesPlayed || 0), 0)
                        .toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Accuracy
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {Math.round(
                        leaderboardData.reduce(
                          (sum, p) => sum + (p.accuracy || 0),
                          0,
                        ) / leaderboardData.length,
                      )}
                      %
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Stack>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary">
                  Loading leaderboard...
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Card
              elevation={2}
              sx={{ bgcolor: "error.light", color: "error.contrastText" }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Unable to load leaderboard
                </Typography>
                <Typography variant="body2">
                  {typeof error === "string"
                    ? error
                    : error.message || "Please try again later"}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Table */}
          {leaderboardData && leaderboardData.length > 0 && (
            <Card elevation={3}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.600" }}>
                      <TableRow>
                        <TableCell>
                          <strong>Rank</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Player</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Highscore</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Games Played</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Avg Score</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Accuracy</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaderboardData.map((player, index) => {
                        const rank = index + 1;
                        const isCurrentUser =
                          player.email === currentUser?.email;

                        return (
                          <TableRow
                            key={player.id || index}
                            sx={{
                              bgcolor: isCurrentUser
                                ? "action.selected"
                                : "inherit",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <TableCell>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={getRankColor(rank)}
                              >
                                {getRankIcon(rank)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "primary.main",
                                    width: 32,
                                    height: 32,
                                  }}
                                >
                                  {player.name ? (
                                    player.name.charAt(0)
                                  ) : (
                                    <Person />
                                  )}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight={
                                      isCurrentUser ? "bold" : "normal"
                                    }
                                  >
                                    {player.name ||
                                      player.email ||
                                      `Player ${rank}`}
                                    {isCurrentUser && (
                                      <Chip
                                        label="You"
                                        size="small"
                                        color="primary"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                  {player.lastPlayed && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Last played:{" "}
                                      {new Date(
                                        player.lastPlayed,
                                      ).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="warning.main"
                              >
                                {player.highScore?.toLocaleString() || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {player.gamesPlayed || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {Math.round(player.averageScore || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${Math.round(player.accuracy || 0)}%`}
                                size="small"
                                color={
                                  (player.accuracy || 0) >= 80
                                    ? "success"
                                    : (player.accuracy || 0) >= 60
                                      ? "warning"
                                      : "error"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {leaderboardData &&
            leaderboardData.length === 0 &&
            !loading &&
            !error && (
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <TrendingUp
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    No rankings yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Be the first to set a high score!
                  </Typography>
                </CardContent>
              </Card>
            )}

          {/* Leaderboard Table */}
        </Stack>
      </Container>
    </Box>
  );
}

export default LeaderboardView;
