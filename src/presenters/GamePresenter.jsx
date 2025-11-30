import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GameView from "../views/GameView";

// Presenter for GameView: manages game logic and Wikipedia data
function GamePresenter({
  user,
  onLogout,
  wikipediaData,
  wikipediaLoading,
  wikipediaError,
}) {
  const navigate = useNavigate();
  const [showFullText, setShowFullText] = useState(false);
  const [userGuess, setUserGuess] = useState("");
  const [lastResult, setLastResult] = useState(null);

  // Mock game state - will connect to model later
  const gameState = {
    score: 0,
    streak: 0,
    lives: 3,
    totalQuestions: 0,
    correctAnswers: 0
  };

  // Mock current question
  const currentQuestion = {
    person: "Albert Einstein",
    correctAnswer: "Albert Einstein"
  };

  // Mock hints
  const hints = {
    availableHints: 5,
    usedHints: 0,
    currentHints: []
  };

  const { summary, contentText } = useMemo(() => {
    return {
      summary: wikipediaData?.summary || null,
      contentText: wikipediaData?.contentText || null,
    };
  }, [wikipediaData]);

  const handleToggleFullText = () => setShowFullText((s) => !s);
  
  const handleGuessChange = (guess) => setUserGuess(guess);
  
  const handleSubmitGuess = () => {
    // Mock guess validation - will connect to model later
    const correct = userGuess.toLowerCase().includes("einstein");
    setLastResult({
      correct,
      correctAnswer: currentQuestion.correctAnswer,
      finalScore: correct ? 100 : 0,
      partialMatch: false
    });
    setUserGuess("");
    
    // Navigate to results if game over
    if (!correct) {
      setTimeout(() => navigate("/results"), 2000);
    }
  };
  
  const handleUseHint = () => {
    // Mock hint usage - will connect to model later
    console.log("Using hint");
  };
  
  const handleNextQuestion = () => {
    navigate("/results");
  };

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
      lastResult={lastResult}
      wikipediaSummary={summary}
      wikipediaContentText={contentText}
      wikipediaLoading={wikipediaLoading}
      wikipediaError={wikipediaError}
      showFullText={showFullText}
      onToggleFullText={handleToggleFullText}
      loading={false}
    />
  );
}

export default GamePresenter;