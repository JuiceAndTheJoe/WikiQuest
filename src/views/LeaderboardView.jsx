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
import { ArrowBack, TrendingUp, Person } from "@mui/icons-material";
import ColorBends from "../components/background/ColorBends";
import SplitText from "../components/SplitText";

function LeaderboardView({
  leaderboardData,
  loading,
  error,
  userRank,
  currentUser,
  onBackToMenu,
  getRankIcon,
  getRankColor,
  communityStats,
}) {
  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Animated Background */}
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
              size="large"
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={onBackToMenu}
              sx={{ fontWeight: "bold" }}
            >
              Back to Menu
            </Button>
            <SplitText
              text="Leaderboard"
              className="text-4xl font-semibold text-center"
              delay={100}
              duration={0.6}
              ease="elastic.out(1, 0.3)"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              repeat={-1}
              repeatDelay={2.5}
            />
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
                          : currentUser?.displayName ||
                            currentUser?.email ||
                            "You"}
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
                      {communityStats.totalPlayers}
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
                      {communityStats.highestScore.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Games Played
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {communityStats.totalGamesPlayed.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Accuracy
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {communityStats.averageAccuracy}%
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
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ maxHeight: 620, overflowY: "auto" }}
                >
                  <Table stickyHeader>
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
                          player.id === currentUser?.uid ||
                          player.email === currentUser?.email;

                        return (
                          <TableRow
                            key={player.id || index}
                            sx={(theme) => ({
                              bgcolor: isCurrentUser
                                ? theme.palette.action.selected
                                : "inherit",
                              transition:
                                rank <= 3
                                  ? "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                                  : "none",
                              "&:hover": {
                                bgcolor: isCurrentUser
                                  ? theme.palette.action.selected
                                  : theme.palette.action.hover,
                                ...(isCurrentUser && {
                                  filter: "brightness(1.08)",
                                  boxShadow:
                                    theme.palette.mode === "dark"
                                      ? "0 0 0 1px rgba(255, 255, 255, 0.14)"
                                      : "0 0 0 1px rgba(0, 0, 0, 0.08)",
                                }),
                                ...(rank <= 3 && {
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    rank === 1
                                      ? "inset 0 0 16px rgba(255, 191, 0, 0.86)"
                                      : rank === 2
                                        ? "inset 0 0 16px rgba(255, 255, 255, 0.69)"
                                        : "inset 0 0 16px rgba(157, 71, 0, 1)",
                                }),
                              },
                            })}
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
                                    component="span"
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
                                      &nbsp;Last played:{" "}
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
