/**
 * Guest Storage Model
 * Manages localStorage operations for guest user game data
 * Parallel to Firestore models but for guest sessions only
 */

const GUEST_GAME_STATE_KEY = 'wikiCelebQuiz_guestGameState';
const GUEST_GAME_RESULT_KEY = 'wikiCelebQuiz_guestGameResult';

/**
 * Save current game state to localStorage for a guest
 * @param {string} guestId - Guest user ID
 * @param {object} gameState - Current game state from Redux
 * @returns {Promise<void>}
 */
export async function saveGuestGameState(guestId, gameState) {
  try {
    const dataToSave = {
      guestId,
      savedAt: Date.now(),
      gameState,
    };
    localStorage.setItem(GUEST_GAME_STATE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save guest game state:', error);
    throw error;
  }
}

/**
 * Load saved game state for a guest
 * @param {string} guestId - Guest user ID
 * @returns {Promise<object|null>} Saved game state or null
 */
export async function loadGuestGameState(guestId) {
  try {
    const saved = localStorage.getItem(GUEST_GAME_STATE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);
    // Verify the saved state belongs to this guest
    if (data.guestId !== guestId) return null;

    return data.gameState;
  } catch (error) {
    console.error('Failed to load guest game state:', error);
    return null;
  }
}

/**
 * Check if a guest has a saved game
 * @param {string} guestId - Guest user ID
 * @returns {Promise<boolean>}
 */
export async function hasGuestSavedGame(guestId) {
  try {
    const saved = localStorage.getItem(GUEST_GAME_STATE_KEY);
    if (!saved) return false;

    const data = JSON.parse(saved);
    return data.guestId === guestId;
  } catch (error) {
    console.error('Failed to check guest saved game:', error);
    return false;
  }
}

/**
 * Clear saved game state for a guest
 * @param {string} guestId - Guest user ID
 * @returns {Promise<void>}
 */
export async function clearGuestGameState(guestId) {
  try {
    const saved = localStorage.getItem(GUEST_GAME_STATE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    // Only clear if it belongs to this guest
    if (data.guestId === guestId) {
      localStorage.removeItem(GUEST_GAME_STATE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear guest game state:', error);
  }
}

/**
 * Save game result to localStorage for a guest
 * @param {string} guestId - Guest user ID
 * @param {object} gameResult - Game result summary
 * @returns {Promise<void>}
 */
export async function saveGuestGameResult(guestId, gameResult) {
  try {
    const dataToSave = {
      guestId,
      savedAt: Date.now(),
      gameResult,
    };
    localStorage.setItem(GUEST_GAME_RESULT_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save guest game result:', error);
  }
}

/**
 * Get guest game result
 * @param {string} guestId - Guest user ID
 * @returns {Promise<object|null>}
 */
export async function getGuestGameResult(guestId) {
  try {
    const saved = localStorage.getItem(GUEST_GAME_RESULT_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);
    if (data.guestId !== guestId) return null;

    return data.gameResult;
  } catch (error) {
    console.error('Failed to get guest game result:', error);
    return null;
  }
}

/**
 * Get all guest data for migration to authenticated account
 * @param {string} guestId - Guest user ID
 * @returns {Promise<object>} Object containing all guest data
 */
export async function getAllGuestData(guestId) {
  try {
    const [gameState, gameResult] = await Promise.all([
      loadGuestGameState(guestId),
      getGuestGameResult(guestId),
    ]);

    return {
      gameState,
      gameResult,
    };
  } catch (error) {
    console.error('Failed to get all guest data:', error);
    return { gameState: null, gameResult: null };
  }
}

/**
 * Clear all guest data from localStorage
 * @param {string} guestId - Guest user ID
 * @returns {Promise<void>}
 */
export async function clearAllGuestData(guestId) {
  try {
    await Promise.all([
      clearGuestGameState(guestId),
    ]);
    // Clear game result
    const saved = localStorage.getItem(GUEST_GAME_RESULT_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.guestId === guestId) {
        localStorage.removeItem(GUEST_GAME_RESULT_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to clear all guest data:', error);
  }
}
