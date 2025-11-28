import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LevelView from '../views/LevelView';
import { startNewGame, resetGameState } from '../app/features/game/gameSlice';

function LevelPresenter({ level, lives, difficulty, currentCeleb, inGame, lastGuessResult, onGuess, correctCount, highScore, wikipediaSummary, wikipediaSections, wikipediaLoading, wikipediaError }) {
  const [guessInput, setGuessInput] = useState('');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [showGameOver, setShowGameOver] = useState(false);

  // When lives run out, show a short Game Over modal, then reset and return home
  useEffect(() => {
    if (typeof lives === 'number' && lives <= 0) {
      setShowGameOver(true);
    }
    return () => {};
  }, [lives, dispatch, navigate]);

  const handleGuess = useCallback(() => {
    onGuess(guessInput);
    setGuessInput('');
  }, [onGuess, guessInput]);

  const handleReturn = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handlePlayAgain = useCallback(() => {
    // Start a fresh run
    dispatch(startNewGame());
    setShowGameOver(false);
    navigate('/level');
  }, [dispatch, navigate]);

  const handleGameOverReturn = useCallback(() => {
    // Reset game state and go home
    dispatch(resetGameState());
    setShowGameOver(false);
    navigate('/');
  }, [dispatch, navigate]);

  // Compute hint text based on difficulty and fetched wikipedia data
  const hintText = useMemo(() => {
    try {
      if (!wikipediaSummary && (!wikipediaSections || wikipediaSections.length === 0)) return '';

      // helpers
      const removeDiacritics = (s) => (s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s);
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const removeNameFromText = (text, celeb) => {
        if (!text) return '';
        if (!celeb) return removeDiacritics(text);

        let normalized = removeDiacritics(text);
        const name = celeb.replace(/_/g, ' ').trim();
        if (!name) return normalized;

        const parts = name.split(/\s+/).filter(Boolean);
        // include full name variant
        const variants = new Set(parts.concat([name]));

        for (const v of variants) {
          const vNorm = removeDiacritics(v);
          if (!vNorm) continue;
          const re = new RegExp('\\b' + escapeRegExp(vNorm) + '\\b', 'giu');
          normalized = normalized.replace(re, '');
        }

        // collapse extra whitespace and trim
        return normalized.replace(/\s{2,}/g, ' ').trim();
      };

      const splitSentences = (text) => {
        if (!text) return [];
        return text
          .split(/\.(?:\s+|$)/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      };

      const pickN = (arr, n) => {
        if (!arr || arr.length === 0) return [];
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, n);
      };

      const nMap = { HARD: 1, MEDIUM: 2, EASY: 3 };
      const n = nMap[difficulty] || 1;

      const parts = [];
      // summary sentences (name-stripped)
      const summaryText = removeNameFromText(wikipediaSummary?.extract || '', currentCeleb);
      const summarySentences = splitSentences(summaryText);
      parts.push(...pickN(summarySentences, n));

      // sections (name-stripped)
      if (Array.isArray(wikipediaSections)) {
        for (const sec of wikipediaSections) {
          const secText = removeNameFromText(sec.text || '', currentCeleb);
          const sentences = splitSentences(secText);
          const chosen = pickN(sentences, n);
          parts.push(...chosen);
        }
      }

      return parts.join('.\n') + (parts.length ? '.' : '');
    } catch (e) {
      return '';
    }
  }, [wikipediaSummary, wikipediaSections, difficulty, currentCeleb]);

  // prepare sanitized props for the view (remove celeb forename/surname everywhere)
  const sanitizedSummary = useMemo(() => {
    if (!wikipediaSummary) return null;
    const removeDiacritics = (s) => (s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s);
    const name = currentCeleb || '';
    const removeNameFromTextOuter = (text) => {
      if (!text) return '';
      // reuse same logic as above but simpler: remove diacritics and name parts
      let normalized = removeDiacritics(text);
      const parts = name.replace(/_/g, ' ').split(/\s+/).filter(Boolean);
      for (const p of parts) {
        const re = new RegExp('\\b' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'giu');
        normalized = normalized.replace(re, '');
      }
      return normalized.replace(/\s{2,}/g, ' ').trim();
    };
    return { ...wikipediaSummary, extract: removeNameFromTextOuter(wikipediaSummary.extract || '') };
  }, [wikipediaSummary, currentCeleb]);

  const sanitizedSections = useMemo(() => {
    if (!Array.isArray(wikipediaSections)) return [];
    const removeDiacritics = (s) => (s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s);
    const name = currentCeleb || '';
    return wikipediaSections.map((sec) => {
      const text = sec?.text || '';
      let normalized = removeDiacritics(text);
      const parts = name.replace(/_/g, ' ').split(/\s+/).filter(Boolean);
      for (const p of parts) {
        const re = new RegExp('\\b' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'giu');
        normalized = normalized.replace(re, '');
      }
      normalized = normalized.replace(/\s{2,}/g, ' ').trim();
      return { ...sec, text: normalized };
    });
  }, [wikipediaSections, currentCeleb]);

  return (
    <LevelView
      level={level}
      lives={lives}
      difficulty={difficulty}
      currentCeleb={currentCeleb}
      inGame={inGame}
      lastGuessResult={lastGuessResult}
      guessInput={guessInput}
      setGuessInput={setGuessInput}
      onGuess={handleGuess}
      onReturn={handleReturn}
      showGameOver={showGameOver}
      onPlayAgain={handlePlayAgain}
      onGameOverReturn={handleGameOverReturn}
      correctCount={correctCount}
      highScore={highScore}
      wikipediaLoading={wikipediaLoading}
      wikipediaError={wikipediaError}
      wikipediaSummary={sanitizedSummary}
      wikipediaSections={sanitizedSections}
      hintText={hintText}
      showDebug={true}
    />
  );
}

export default LevelPresenter;
