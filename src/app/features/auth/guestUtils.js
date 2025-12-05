/**
 * Guest authentication utilities
 * Manages guest user creation and identification via localStorage
 */

const GUEST_ID_KEY = 'wikiCelebQuiz_guestId';

/**
 * Generate a unique guest ID
 * @returns {string} Format: guest_{timestamp}_{random}
 */
export function generateGuestId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `guest_${timestamp}_${random}`;
}

/**
 * Get or create a guest user ID
 * @returns {string} Guest ID
 */
export function getOrCreateGuestId() {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

/**
 * Get current guest ID without creating a new one
 * @returns {string|null} Guest ID or null if none exists
 */
export function getCurrentGuestId() {
  return localStorage.getItem(GUEST_ID_KEY);
}

/**
 * Clear guest ID from localStorage
 */
export function clearGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

/**
 * Create a new guest session (generates new ID, clearing old one)
 * @returns {string} New guest ID
 */
export function createNewGuestSession() {
  clearGuestId();
  return getOrCreateGuestId();
}

/**
 * Check if a user ID is a guest ID
 * @param {string} userId
 * @returns {boolean}
 */
export function isGuestUser(userId) {
  return userId && userId.startsWith('guest_');
}

/**
 * Create guest user object matching auth user shape
 * @param {string} guestId
 * @returns {object} Guest user object
 */
export function createGuestUserObject(guestId) {
  return {
    uid: guestId,
    email: null,
    isGuest: true,
  };
}
