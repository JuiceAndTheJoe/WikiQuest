import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import LevelPresenter from './LevelPresenter';
import { submitGuess } from '../app/features/game/gameSlice';
import { fetchWikipediaPage } from '../app/features/wikipedia/wikipediaSlice';

const LevelContainer = (props) => {
  const { currentCeleb, fetchPage } = props;

  useEffect(() => {
    let running;
    if (!currentCeleb) {
      console.log('LevelContainer: no currentCeleb available, skipping fetch');
      return;
    }

    console.log('LevelContainer: fetching wikipedia for', currentCeleb);
    // dispatch returns the thunk-promise which may include an `abort` method
    try {
      running = fetchPage(currentCeleb);
      console.log('LevelContainer: fetch started for', currentCeleb, running);
    } catch (err) {
      console.error('LevelContainer: error dispatching fetchPage', err);
    }

    return () => {
      // cancel in-flight fetch when celeb changes or component unmounts
      try {
        if (running && typeof running.abort === 'function') {
          console.log('LevelContainer: aborting in-flight fetch for', currentCeleb);
          running.abort();
        }
      } catch (e) {
        console.warn('LevelContainer: abort failed', e);
      }
    };
  }, [currentCeleb, fetchPage]);

  return <LevelPresenter {...props} />;
};

const mapState = (state) => {
  const g = state.game || {};
  const difficulty = (lives => {
    // Difficulty mapping (reversed): more lives => harder
    // 3 -> HARD, 2 -> MEDIUM, 1 -> EASY
    if (lives >= 3) return 'HARD';
    if (lives === 2) return 'MEDIUM';
    return 'EASY';
  })(g.lives || 3);

  return {
    level: g.level,
    lives: g.lives,
    difficulty,
    currentCeleb: g.currentCeleb,
    inGame: g.inGame,
    lastGuessResult: g.lastGuessResult,
    correctCount: g.correctCount,
    highScore: g.highScore,
    wikipediaData: state.wikipedia?.pageData || null,
    wikipediaLoading: state.wikipedia?.loading || false,
    wikipediaError: state.wikipedia?.error || null,
    wikipediaSections: state.wikipedia?.pageData?.contentSections || null,
    wikipediaSummary: state.wikipedia?.pageData?.summary || null,
  };
};

const mapDispatch = (dispatch) => ({
  onGuess: (name) => dispatch(submitGuess(name)),
  fetchPage: (title) => dispatch(fetchWikipediaPage(title)),
});

export default connect(mapState, mapDispatch)(LevelContainer);
