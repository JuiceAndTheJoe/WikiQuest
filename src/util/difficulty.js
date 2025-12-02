/**
 * Gets difficulty label based on game level
 *
 * @param {number} level - current game level
 * @returns {string} - difficulty label ('EASY', 'MEDIUM', 'HARD')
 */
export function getDifficulty(level) {
  if (level >= 11) return 'HARD';
  if (level >= 6) return 'MEDIUM';
  return 'EASY';
}
