import { useEffect } from "react";
import { connect } from "react-redux";
import GamePresenter from "./GamePresenter";
import {
  startNewGame,
  continueGame,
  submitGuess,
  useHint,
  MAX_HINTS_PER_QUESTION,
} from "../app/features/game/gameSlice";
import { fetchWikipediaPage } from "../app/features/wikipedia/wikipediaSlice";

const formatDisplayName = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const GameContainer = (props) => {
  const {
    currentCelebRaw,
    fetchPage,
    inGame,
    startNewGame,
    continueExistingGame,
    wikipediaLoading,
    gameStatus,
  } = props;

  useEffect(() => {
    if (!inGame && gameStatus !== "game_over") {
      startNewGame();
    } else if (inGame && !currentCelebRaw) {
      continueExistingGame();
    }
  }, [inGame, currentCelebRaw, startNewGame, continueExistingGame, gameStatus]);

  useEffect(() => {
    if (!currentCelebRaw) return undefined;

    let running;
    try {
      running = fetchPage(currentCelebRaw);
    } catch (err) {
      console.warn("Failed to fetch Wikipedia page", err);
    }

    return () => {
      if (running && typeof running.abort === "function") {
        running.abort();
      }
    };
  }, [currentCelebRaw, fetchPage]);

  return <GamePresenter {...props} loading={wikipediaLoading} />;
};

const mapState = (state) => {
  const g = state.game || {};
  const displayName = g.currentCeleb ? formatDisplayName(g.currentCeleb) : "";

  const gameState = {
    score: g.score ?? Math.max(0, (g.level || 1) - 1),
    streak: g.streak || 0,
    lives: typeof g.lives === "number" ? g.lives : 3,
    totalQuestions: g.totalQuestions || 0,
    correctAnswers: g.correctAnswers ?? g.correctCount ?? 0,
  };

  const hints = {
    availableHints: MAX_HINTS_PER_QUESTION,
    usedHints: g.hintsUsedThisQuestion || 0,
    currentHints: [],
  };

  return {
    user: state.auth.user,
    inGame: g.inGame,
    gameStatus: g.status,
    currentCelebRaw: g.currentCeleb,
    currentQuestion: g.currentCeleb
      ? {
          person: displayName,
          correctAnswer: displayName,
        }
      : null,
    gameState,
    hints,
    lastResult: g.lastResultDetail,
    wikipediaData: state.wikipedia?.pageData || null,
    wikipediaLoading: state.wikipedia?.loading || false,
    wikipediaError: state.wikipedia?.error || null,
  };
};

const mapDispatch = (dispatch) => ({
  onSubmitGuess: (guess) => dispatch(submitGuess(guess)),
  onUseHint: () => dispatch(useHint()),
  onNextQuestion: () => dispatch(startNewGame()),
  startNewGame: () => dispatch(startNewGame()),
  continueExistingGame: () => dispatch(continueGame()),
  fetchPage: (title) => dispatch(fetchWikipediaPage(title)),
});

export default connect(mapState, mapDispatch)(GameContainer);
