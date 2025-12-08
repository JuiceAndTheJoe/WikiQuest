/**
 * MenuView - Main menu interface for WikiQuest
 * Pure component for game start, leaderboard access, and user info display
 */

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";
import {
  PlayArrow,
  Leaderboard,
  Person,
  Quiz,
  ExitToApp,
  EmojiEvents,
  Help,
  Close,
} from "@mui/icons-material";
import ColorBends from "../components/background/ColorBends";

// Pure view: receives interaction handlers & data via props from Presenter.
function MenuView({
  user,
  onLogout,
  onStartGame,
  onViewLeaderboard,
  onCreateAccount,
  userStats = { gamesPlayed: 0, highScore: 0 },
  leaderboardData = [],
}) {
  const [openHowToPlay, setOpenHowToPlay] = useState(false);
  const isAnonymous = user?.isAnonymous || false;
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
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #4d77a1ff, #42a5f5)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <Quiz
                sx={{ fontSize: "inherit", mr: 1, verticalAlign: "bottom" }}
              />
              WikiQuest
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Guess famous people based on their Wikipedia biographies. Use
              hints wisely to maximize your score!
            </Typography>
          </Box>

          {/* Top Players Mini Leaderboard & Action Buttons */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="stretch"
          >
            {/* Mini Leaderboard */}
            <Box
              sx={{
                p: 3,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                flex: { xs: 1, md: 0.5 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">🏆 Top Players</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<Leaderboard />}
                  onClick={onViewLeaderboard}
                >
                  All top players
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {leaderboardData.slice(0, 3).map((player, index) => (
                  <Box
                    key={player.uid || index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ minWidth: 30 }}
                      >
                        #{index + 1}
                      </Typography>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {player.displayName || player.email || "Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {player.gamesPlayed || 0} games
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold">
                      {player.highScore || 0}
                    </Typography>
                  </Box>
                ))}
                {leaderboardData.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No scores yet. Be the first!
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Action Buttons & User Info */}
            <Stack
              spacing={2}
              sx={{ flex: { xs: 1, md: 0.5 }, width: "100%" }}
              justifyContent="space-between"
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<PlayArrow />}
                onClick={onStartGame}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  flex: 1,
                }}
              >
                Start Quiz
              </Button>
              <Button
                variant="outlined"
                endIcon={<Help />}
                onClick={() => setOpenHowToPlay(true)}
                sx={{ py: 1.5, flex: 1 }}
              >
                How to Play
              </Button>

              {/* User Info & Stats Card */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  mt: 2,
                }}
              >
                <Stack spacing={3}>
                  {/* User Profile Row */}
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 48, height: 48 }}
                      >
                        <Person />
                      </Avatar>
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="h6">
                          {isAnonymous
                            ? "Guest Player"
                            : user?.email || "Player"}
                        </Typography>
                        {isAnonymous ? (
                          <Typography variant="body2" color="text.secondary">
                            Playing as guest - create account to save progress
                          </Typography>
                        ) : (
                          <>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                High Score:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {userStats.highScore}
                              </Typography>
                              <EmojiEvents
                                fontSize="small"
                                sx={{ color: "warning.main" }}
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Games Played: {userStats.gamesPlayed}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Stack>
                    {isAnonymous ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={onCreateAccount}
                      >
                        Sign In or Create Account
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ExitToApp />}
                        onClick={onLogout}
                      >
                        Logout
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          {/* How to Play Modal */}
          <Dialog
            open={openHowToPlay}
            onClose={() => setOpenHowToPlay(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: "rgba(20, 20, 20, 0.9)",

                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                animation: openHowToPlay
                  ? "slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "slideOutDown 0.3s ease-in",
                "@keyframes slideInUp": {
                  from: {
                    opacity: 0,
                    transform: "translateY(40px) scale(0.95) rotateX(-10deg)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0) scale(1) rotateX(0deg)",
                  },
                },
                "@keyframes slideOutDown": {
                  from: {
                    opacity: 1,
                    transform: "translateY(0) scale(1) rotateX(0deg)",
                  },
                  to: {
                    opacity: 0,
                    transform: "translateY(40px) scale(0.95) rotateX(-10deg)",
                  },
                },
                perspective: "1000px",
                transformStyle: "preserve-3d",
                boxShadow: openHowToPlay
                  ? "0 20px 60px rgba(0, 0, 0, 0.4)"
                  : "0 5px 15px rgba(0, 0, 0, 0.2)",
                transition: "box-shadow 0.4s ease-out",
              },
            }}
            TransitionProps={{
              timeout: 400,
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "white",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                animation: openHowToPlay
                  ? "fadeInDown 0.4s ease-out 0.05s both"
                  : "none",
                "@keyframes fadeInDown": {
                  from: {
                    opacity: 0,
                    transform: "translateY(-10px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              How to Play:
              <Button
                onClick={() => setOpenHowToPlay(false)}
                sx={{
                  minWidth: "auto",
                  color: "white",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "rotate(90deg) scale(1.1)",
                  },
                }}
              >
                <Close />
              </Button>
            </DialogTitle>
            <DialogContent>
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.8, color: "white", mt: 2 }}
              >
                We&apos;ll give you some biographical clues about a random
                celebrity, and you&apos;ll guess who it is.&nbsp;
                <strong>
                  Type your best guess and see if you&apos;re right!
                </strong>
                <br />
                <br />
                Stuck? No worries, use a hint! Just know that hints come at a
                cost to your score. 💡
                <br />
                <br />
                <strong>The goal:</strong> Get as many correct as you can! But
                be careful... 3 wrong answers means your game is over. Build
                your streak, climb the leaderboard, and prove you&apos;re a true
                WikiQuest champion! 🏆
              </Typography>
            </DialogContent>
          </Dialog>
        </Stack>
      </Container>
    </Box>
  );
}

export default MenuView;
