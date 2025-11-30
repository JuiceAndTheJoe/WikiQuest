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

  // Compute three separate hints: HintHARD, HintMEDIUM, HintEASY
  const { HintHARD, HintMEDIUM, HintEASY } = useMemo(() => {
    try {
      if (!sanitizedSummary && (!sanitizedSections || sanitizedSections.length === 0)) {
        return { HintHARD: '', HintMEDIUM: '', HintEASY: '' };
      }

      // Helper to extract total N sentences across all sections
      const extractTotalSentences = (sections, totalCount) => {
        if (!Array.isArray(sections) || totalCount <= 0) return [];
        const allSentences = [];
        
        for (const sec of sections) {
          const text = sec?.text || '';
          // Split by period followed by space or end of string
          const sectionSentences = text.split(/\.(?:\s+|$)/).filter(s => s.trim().length > 0);
          for (const sentence of sectionSentences) {
            if (allSentences.length >= totalCount) break;
            allSentences.push(sentence.trim() + '.');
          }
          if (allSentences.length >= totalCount) break;
        }
        
        return allSentences;
      };

      // HintHARD: Only wikipedia summary
      const hard = sanitizedSummary?.extract || '';

      // HintMEDIUM: HintHARD + 1 additional sentence from sections (approx 2x size of HARD)
      const oneSentence = extractTotalSentences(sanitizedSections, 1);
      const medium = [hard, ...oneSentence].filter(Boolean).join('\n\n');

      // HintEASY: HintHARD + 2 additional sentences from sections (approx 3x size of HARD)
      const twoSentences = extractTotalSentences(sanitizedSections, 2);
      const easy = [hard, ...twoSentences].filter(Boolean).join('\n\n');

      return { HintHARD: hard, HintMEDIUM: medium, HintEASY: easy };
    } catch (e) {
      console.error('Error computing hints:', e);
      return { HintHARD: '', HintMEDIUM: '', HintEASY: '' };
    }
  }, [sanitizedSummary, sanitizedSections]);

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
      HintHARD={HintHARD}
      HintMEDIUM={HintMEDIUM}
      HintEASY={HintEASY}
    />
  );
}

export default LevelPresenter;
