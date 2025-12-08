import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameView from "../views/GameView";

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
      "giu",
    );
    sanitized = sanitized.replace(re, (match) => redactWord(match));
  }
  return sanitized.replace(/\s{2,}/g, " ").trim();
};

const splitIntoSentences = (text) => {
  if (!text) return [];
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]?/g);
  return sentences
    ? sentences.map((sentence) => sentence.trim()).filter(Boolean)
    : [];
};

const computeRevealCount = (hintsUsed, totalSentences) => {
  if (!totalSentences || hintsUsed <= 0) return 0;
  if (hintsUsed === 1) return Math.min(1, totalSentences);
  if (hintsUsed === 2) return Math.min(2, totalSentences);
  return totalSentences;
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
  onNextQuestion,
  gameStatus,
  hasAttemptedLoad,
  loadingGameState,
}) {
  const navigate = useNavigate();
  const [userGuess, setUserGuess] = useState("");

  useEffect(() => {
    if (gameStatus === "game_over") {
      navigate("/results");
    }
  }, [gameStatus, navigate]);

  const handleGuessChange = (guess) => setUserGuess(guess);

  const handleSubmitGuess = () => {
    if (!userGuess?.trim()) return;
    onSubmitGuess(userGuess.trim());
    setUserGuess("");
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
    navigate('/');
  };

  const { summary } = useMemo(() => {
    return {
      summary: wikipediaData?.summary || null,
    };
  }, [wikipediaData]);

  const sanitizedSummaryText = useMemo(() => {
    if (!currentQuestion || !summary?.extract) return "";
    return stripNameFromText(summary.extract, currentQuestion.person);
  }, [summary, currentQuestion]);

  const summarySentences = useMemo(() => {
    return splitIntoSentences(sanitizedSummaryText);
  }, [sanitizedSummaryText]);

  const revealedSummarySentences = useMemo(() => {
    const revealCount = computeRevealCount(
      hints?.usedHints || 0,
      summarySentences.length,
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
      onNextQuestion={handleNextQuestion}
      onBackToHome={handleBackToHome}
      lastResult={lastResult}
      wikipediaSummary={summary}
      revealedSummarySentences={revealedSummarySentences}
      totalSummarySentences={summarySentences.length}
      hintsUsed={hints?.usedHints || 0}
      wikipediaLoading={wikipediaLoading}
      wikipediaError={wikipediaError}
    />
  );
}

export default GamePresenter;
