import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  MAX_HINTS_PER_QUESTION,
  MAX_LIVES,
} from "../app/features/game/gameConstants";
import {
  advanceToNextQuestion,
  loadSavedGame,
  startNewGame,
  submitGuess,
  useHint,
} from "../app/features/game/gameSlice";
import { fetchWikipediaPage } from "../app/features/wikipedia/wikipediaSlice";
import GamePresenter from "./GamePresenter";

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
    loadSavedGame,
    loadingGameState,
    hasSavedGame,
    wikipediaLoading,
    gameStatus,
  } = props;

  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Load previous game or start new game on mount
  useEffect(() => {
    if (
      props.user?.uid &&
      !inGame &&
      gameStatus !== "game_over" &&
      !hasAttemptedLoad
    ) {
      loadSavedGame(props.user.uid);
      setHasAttemptedLoad(true);
    }
  }, [props.user?.uid, loadSavedGame, inGame, gameStatus]);

  useEffect(() => {
    if (
      hasAttemptedLoad &&
      !loadingGameState &&
      !hasSavedGame &&
      !inGame &&
      gameStatus !== "game_over"
    ) {
      startNewGame();
    }
  }, [loadingGameState, hasSavedGame, inGame, gameStatus, startNewGame]);

  useEffect(() => {
    if (!currentCelebRaw || loadingGameState || !inGame) return;

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
  }, [currentCelebRaw, fetchPage, loadingGameState, inGame]);

  return (
    <GamePresenter
      {...props}
      hasAttemptedLoad={hasAttemptedLoad}
      loadingGameState={loadingGameState}
      loading={wikipediaLoading}
    />
  );
};

const mapState = (state) => {
  const g = state.game || {};
  const displayName = g.currentCeleb ? formatDisplayName(g.currentCeleb) : "";

  const gameState = {
    score: g.score ?? Math.max(0, (g.level || 1) - 1),
    streak: g.streak || 0,
    lives: typeof g.lives === "number" ? g.lives : MAX_LIVES,
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
  onNextQuestion: () => dispatch(advanceToNextQuestion()),
  startNewGame: () => dispatch(startNewGame()),
  loadSavedGame: (userId) => dispatch(loadSavedGame(userId)),
  fetchPage: (title) => dispatch(fetchWikipediaPage(title)),
});

export default connect(mapState, mapDispatch)(GameContainer);
