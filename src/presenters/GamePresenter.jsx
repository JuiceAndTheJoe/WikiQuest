import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameView from "../views/GameView.jsx";
import { getDifficulty } from "../app/features/game/gameUtils";

const removeDiacritics = (value) =>
  value ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : value;

const redactWord = (value) => value.replace(/[^\s]/g, "_");

const stripNameFromText = (text, name) => {
  if (!text) return "";
  const normalized = removeDiacritics(text);
  if (!name) return normalized;
  const parts = name.replace(/_/g, " ").split(/\s+/).filter(Boolean);
  let sanitized = normalized;
  for (const part of parts) {
    const re = new RegExp(
      `\\b${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "giu"
    );
    sanitized = sanitized.replace(re, (match) => redactWord(match));
  }
  return sanitized.trim();
};

const splitIntoSentences = (text) => {
  if (!text) return [];
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para) => para.trim()).filter(Boolean);
};

const computeRevealCount = (hintsUsed, totalSentences) => {
  if (!totalSentences || hintsUsed <= 0) return 0;
  if (hintsUsed === 1) return Math.min(1, totalSentences);
  if (hintsUsed === 2) return Math.min(2, totalSentences);
  return totalSentences;
};

// Calculate electric border intensity based on streak
const getElectricBorderConfig = (streak) => {
  const currentStreak = streak || 0;

  // Disabled for streak 0
  if (currentStreak < 1) {
    return { opacity: 0, speed: 0, chaos: 0, thickness: 0, color: "#7df9ff" };
  }

  // For streak 6+: Rainbow/blinking effect with max chaos and speed
  if (currentStreak >= 6) {
    // Rainbow color cycling
    const time = Date.now() / 100; // Cycle through colors faster
    const hue = time % 360;
    const color = `hsl(${hue}, 100%, 50%)`;

    return {
      opacity: 1,
      speed: 3, // Maximum chaos speed
      chaos: 1.5, // Maximum chaos
      thickness: 3,
      color,
      // Add blinking effect via opacity
      animationOpacity: true,
    };
  }

  // Mild at streak 1, scales up progressively, reaches max at streak 5
  // streak 1: opacity 0.5, speed 1, chaos 0.5, color blue
  // streak 3: opacity 0.6, speed 1.3, chaos 0.65, color cyan-green
  // streak 5: opacity 0.85, speed 1.8, chaos 0.9, color red (MAX)

  const normalizedStreak = Math.min(currentStreak - 1, 4) / 4; // 0-1 scale from streak 1-5

  // Color progression: cyan/blue (200°) → green (120°) → yellow (60°) → orange (30°) → red (0°)
  // Hue goes from 200 to 0 as normalizedStreak goes from 0 to 1
  const hue = Math.round(200 * (1 - normalizedStreak));
  const color = `hsl(${hue}, 100%, 50%)`;

  return {
    opacity: Math.min(0.5 + normalizedStreak * 0.35, 1),
    speed: Math.min(1 + normalizedStreak * 0.8, 1.8),
    chaos: Math.min(0.5 + normalizedStreak * 0.4, 0.9),
    thickness: Math.min(1.5 + normalizedStreak * 1.5, 3),
    color,
  };
};

// Presenter for GameView: manages game logic and Wikipedia data
function GamePresenter({
  wikipediaData,
  wikipediaLoading,
  wikipediaError,
  currentQuestion,
  gameState,
  hints,
  lastResult,
  onSubmitGuess,
  onUseHint,
  onSkipQuestion,
  onNextQuestion,
  gameStatus,
  hasAttemptedLoad,
  loadingGameState,
}) {
  const navigate = useNavigate();
  const [userGuess, setUserGuess] = useState("");
  const [showResultFeedback, setShowResultFeedback] = useState(false);

  // Extract streak value to ensure stable dependency
  const currentStreak = gameState?.streak || 0;

  // Memoize difficulty to ensure it updates when level changes
  const difficulty = useMemo(() => {
    return getDifficulty(gameState?.level || 1);
  }, [gameState?.level]);

  // Memoize border config based on streak
  const borderConfig = useMemo(() => {
    const config = getElectricBorderConfig(currentStreak);
    return config;
  }, [currentStreak]);

  useEffect(() => {
    if (gameStatus === "game_over") {
      navigate("/results");
    }
  }, [gameStatus, navigate]);

  useEffect(() => {
    if (lastResult) {
      setShowResultFeedback(true);
    }
  }, [lastResult]);

  useEffect(() => {
    if (showResultFeedback) {
      const timer = setTimeout(() => {
        handleCloseResultFeedback();
      }, 2500); // Auto-close after 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [showResultFeedback]);

  const handleGuessChange = (guess) => setUserGuess(guess);

  const handleSubmitGuess = () => {
    if (!userGuess?.trim()) return;
    onSubmitGuess(userGuess.trim());
    setUserGuess("");
  };

  const handleSkipQuestion = () => {
    onSkipQuestion();
  };

  const handleUseHint = () => {
    if (!summarySentences.length) return;
    if (hints?.usedHints >= hints?.availableHints) return;
    onUseHint();
  };

  const handleNextQuestion = () => {
    onNextQuestion();
    setUserGuess("");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleCloseResultFeedback = () => {
    setShowResultFeedback(false);
    handleNextQuestion();
  };

  const { summary } = useMemo(() => {
    return {
      summary: wikipediaData?.summary || null,
    };
  }, [wikipediaData]);

  const sanitizedSummaryText = useMemo(() => {
    if (!currentQuestion) return "";
    const sourceText = summary?.fullContent || summary?.extract || "";
    if (!sourceText) return "";
    return stripNameFromText(sourceText, currentQuestion.person);
  }, [summary, currentQuestion]);

  const summarySentences = useMemo(() => {
    return splitIntoSentences(sanitizedSummaryText);
  }, [sanitizedSummaryText]);

  const revealedSummarySentences = useMemo(() => {
    const revealCount = computeRevealCount(
      hints?.usedHints || 0,
      summarySentences.length
    );
    return summarySentences.slice(0, revealCount);
  }, [summarySentences, hints?.usedHints]);

  if (loadingGameState && !hasAttemptedLoad) {
    return <div>Loading previous game...</div>;
  }

  return (
    <GameView
      currentQuestion={currentQuestion}
      gameState={gameState}
      hints={hints}
      userGuess={userGuess}
      onGuessChange={handleGuessChange}
      onSubmitGuess={handleSubmitGuess}
      onUseHint={handleUseHint}
      onSkipQuestion={handleSkipQuestion}
      onNextQuestion={handleNextQuestion}
      onBackToHome={handleBackToHome}
      lastResult={lastResult}
      wikipediaSummary={summary}
      revealedSummarySentences={revealedSummarySentences}
      totalSummarySentences={summarySentences.length}
      hintsUsed={hints?.usedHints || 0}
      wikipediaLoading={wikipediaLoading}
      wikipediaError={wikipediaError}
      showResultFeedback={showResultFeedback}
      onCloseResultFeedback={handleCloseResultFeedback}
      difficulty={difficulty}
      borderConfig={borderConfig}
    />
  );
}

export default GamePresenter;
