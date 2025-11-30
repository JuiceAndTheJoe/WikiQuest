import { useNavigate } from "react-router-dom";
import ResultsView from "../views/ResultsView";

// Presenter for ResultsView: manages game results and navigation
function ResultsPresenter({
  user,
  onLogout,
}) {
  const navigate = useNavigate();

  // Mock game stats - will connect to model later
  const gameStats = {
    score: 350,
    totalQuestions: 4,
    correctAnswers: 3,
    streak: 2,
    gameTime: 125000, // 2 minutes 5 seconds in ms
    difficulty: "easy"
  };

  // Mock game history
  const gameHistory = [
    {
      question: "Albert Einstein",
      userAnswer: "Albert Einstein",
      correct: true,
      score: 100,
      timeSpent: 25000,
      hintsUsed: 0
    },
    {
      question: "Marie Curie", 
      userAnswer: "Marie Curie",
      correct: true,
      score: 120,
      timeSpent: 20000,
      hintsUsed: 1
    },
    {
      question: "Leonardo da Vinci",
      userAnswer: "Leonardo da Vinci", 
      correct: true,
      score: 130,
      timeSpent: 18000,
      hintsUsed: 0
    },
    {
      question: "William Shakespeare",
      userAnswer: "Charles Dickens",
      correct: false,
      score: 0,
      timeSpent: 45000,
      hintsUsed: 2
    }
  ];

  // Mock user stats
  const userStats = {
    gamesPlayed: 15,
    highScore: 420,
    totalScore: 2850,
    averageScore: 190
  };

  const newHighScore = gameStats.score > userStats.highScore;

  const handlePlayAgain = () => {
    navigate("/game");
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
  };

  const handleBackToMenu = () => {
    navigate("/");
  };

  return (
    <ResultsView
      gameStats={gameStats}
      gameHistory={gameHistory}
      userStats={userStats}
      onPlayAgain={handlePlayAgain}
      onViewLeaderboard={handleViewLeaderboard}
      onBackToMenu={handleBackToMenu}
      newHighScore={newHighScore}
    />
  );
}

export default ResultsPresenter;