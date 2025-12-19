import { EasyCelebs, HardCelebs, MediumCelebs } from "../../data/celebs";

/**
 * Gets difficulty label based on game level
 *
 * @param {number} level - current game level
 * @returns {string} - difficulty label ('EASY', 'MEDIUM', 'HARD')
 */
export function getDifficulty(level) {
  if (level >= 11) return "HARD";
  if (level >= 6) return "MEDIUM";
  return "EASY";
}

/**
 * Picks a random element from the given array
 *
 * @param {Array<T>} arr - array to pick from
 * @returns {T} - random element or null if array is empty
 */
export function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

/**
 * Gets celeb pool for the given level
 *
 * @param {number} level - current game level
 * @returns {Array<string>} - array of celeb names
 */
export function poolForLevel(level) {
  const difficulty = getDifficulty(level);
  if (difficulty === "HARD") return HardCelebs;
  if (difficulty === "MEDIUM") return MediumCelebs;
  return EasyCelebs;
}

/**
 * Generates a normalized key for a celeb name so duplicates
 * with disambiguation or different spacing map to the same entry.
 *
 * @param {string} value - celeb name value
 * @returns {string} - normalized key
 */
export function celebKey(value) {
  return normalizeLetters(extractBaseName(value));
}

/**
 * Picks a celeb for the given level that has not been used in the
 * current game run yet. Falls back to the full pool if exhausted.
 *
 * @param {number} level - current game level
 * @param {Array<string>} askedCelebKeys - list of normalized celeb keys already asked
 * @returns {string|null} - unused celeb or a fallback if pool is exhausted
 */
export function pickUniqueCeleb(level, askedCelebKeys = []) {
  const pool = poolForLevel(level);
  if (!pool || pool.length === 0) return null;

  const used = new Set((askedCelebKeys || []).filter(Boolean));
  const candidates = pool.filter((name) => !used.has(celebKey(name)));

  if (candidates.length > 0) {
    return pickRandom(candidates);
  }

  // If the pool is exhausted, allow fallback to keep the game playable
  return pickRandom(pool);
}

/**
 * Extracts the base name without disambiguation info
 * e.g., "Drake_(musician)" -> "Drake", "Chris_Evans_(actor)" -> "Chris_Evans"
 *
 * @param {string | null | undefined} value - celeb name value
 * @returns {string} - base name without disambiguation
 */
export function extractBaseName(value) {
  if (!value) return "";

  return value.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Formats celeb name for display
 *
 * @param {string | null | undefined} value - celeb name value
 * @returns {string} - formatted celeb name (underscores to spaces, parentheses removed)
 */
export function formatCelebDisplayName(value) {
  if (!value) return "";

  return value
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/_/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Builds a summary of the completed game run
 *
 * @param {object} state - game state
 * @returns {{ finalScore: number, levelReached: number, highScore: number,
 *   totalQuestions: number, correctAnswers: number, streak: number, bestStreak: number, totalHintsUsed: number,
 *   difficulty: string, questionLog: Array, endedAt: Date }} - run summary
 */
export function buildRunSummary(state) {
  return {
    finalScore: state.score || 0,
    levelReached: Math.max(0, (state.level || 1) - 1),
    highScore: state.highScore || 0,
    totalQuestions: state.totalQuestions || 0,
    correctAnswers: state.correctAnswers || state.correctCount || 0,
    streak: state.streak || 0,
    bestStreak: state.bestStreak || state.streak || 0,
    totalHintsUsed: state.totalHintsUsed || 0,
    difficulty: getDifficulty(state.level || 1),
    questionLog: [...(state.questionsLog || [])],
    endedAt: Date.now(),
  };
}

/**
 * Normalizes a string by removing diacritics, non-letter characters,
 *
 * @param {string} s - Input string
 * @returns {string} - Normalized string
 */
export function normalizeLetters(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[_\s\-\d\W]+/g, "")
    .toLowerCase();
}

/**
 * Generates a frequency map of characters in the given string
 *
 * @param {string} input - Input string
 * @returns {Record<string, number>} - Frequency map of characters
 */
function frequencyMap(input) {
  const map = Object.create(null);

  for (const character of input) {
    map[character] = (map[character] || 0) + 1;
  }
  return map;
}

/**
 * Validates whether the guess `g` can be formed from the target word `t`
 *
 * @param {string} guess - The guessed word
 * @param {string} target - The target word
 * @returns {boolean} - True if the guess is valid, false otherwise
 */
export function validateGuess(guess, target) {
  if (!target) return false;

  const targetFrequency = frequencyMap(target);
  const guessFrequency = frequencyMap(guess || "");

  let deficit = 0;

  for (const key of Object.keys(targetFrequency)) {
    const need = targetFrequency[key];
    const have = guessFrequency[key] || 0;
    if (have < need) deficit += need - have;
    if (deficit > 1) return false;
  }
  return true;
}
