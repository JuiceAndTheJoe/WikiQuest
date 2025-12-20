import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSavedGameState } from "../app/models/gameProgressModel";
import HomeView from "../views/HomeView";

// Presenter for MenuView: manages navigation and user stats
function HomePresenter({
  user,
  userStats,
  hasSavedGame,
  leaderboardData,
  onStartGame,
  onLogout,
  onChangeDisplayName,
  onClearSavedGame,
}) {
  const navigate = useNavigate();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingName, setPendingName] = useState(user?.displayName || "");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("EASY");

  const handleStartGame = useCallback(async () => {
    if (user?.uid) {
      try {
        await clearSavedGameState(user.uid);
        onClearSavedGame?.();
      } catch (err) {
        console.warn("Failed to clear saved game", err);
      }
    }

    onStartGame?.({ difficulty: selectedDifficulty });
    navigate("/game");
  }, [onStartGame, onClearSavedGame, navigate, user?.uid, selectedDifficulty]);

  const isDifficultyUnlocked = useCallback(
    (difficulty) => {
      const difficultyMap = getDifficulty(userStats.highestLevelReached);
      return difficultyMap === difficulty;
    },
    [userStats]
  );

  const handleSelectDifficulty = useCallback((difficulty) => {
    setSelectedDifficulty(difficulty);
  }, []);

  const handleResumeGame = useCallback(() => {
    navigate("/game");
  }, [navigate]);

  const handleViewLeaderboard = useCallback(() => {
    navigate("/leaderboard");
  }, [navigate]);

  const handleCreateAccount = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const handleOpenNameModal = useCallback(() => {
    setPendingName(user?.displayName || "");
    setNameError("");
    setIsNameModalOpen(true);
  }, [user?.displayName]);

  const handleCloseNameModal = useCallback(() => {
    if (savingName) return;
    setIsNameModalOpen(false);
  }, [savingName]);

  const handleSubmitName = useCallback(() => {
    const trimmed = (pendingName || "").trim();
    if (!trimmed) {
      setNameError("Display name cannot be empty");
      return;
    }

    setSavingName(true);
    setNameError("");
    onChangeDisplayName({ displayName: trimmed })
      .unwrap()
      .then(() => {
        setSavingName(false);
        setIsNameModalOpen(false);
      })
      .catch((err) => {
        setSavingName(false);
        setNameError(err || "Could not update display name");
      });
  }, [pendingName, onChangeDisplayName]);

  return (
    <HomeView
      user={user}
      onLogout={onLogout}
      onStartGame={handleStartGame}
      onResumeGame={handleResumeGame}
      onViewLeaderboard={handleViewLeaderboard}
      onCreateAccount={handleCreateAccount}
      onOpenDisplayNameModal={handleOpenNameModal}
      onCloseDisplayNameModal={handleCloseNameModal}
      onSubmitDisplayName={handleSubmitName}
      onDisplayNameChange={setPendingName}
      displayNameValue={pendingName}
      displayNameError={nameError}
      displayNameSaving={savingName}
      isDisplayNameModalOpen={isNameModalOpen}
      userStats={userStats}
      hasSavedGame={hasSavedGame}
      leaderboardData={leaderboardData}
      isDifficultyUnlocked={isDifficultyUnlocked}
      selectedDifficulty={selectedDifficulty}
      onSelectDifficulty={handleSelectDifficulty}
    />
  );
}

export default HomePresenter;
