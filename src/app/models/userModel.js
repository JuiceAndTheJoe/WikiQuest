import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { DISPLAY_NAME_COLLECTION, USER_COLLECTION } from "./constants";

/**
 * Save user data to Firestore
 *
 * @param {number} userId - User ID
 * @param {object} data - Data to save
 * @returns {Promise<void>}
 */
export function saveUserData(userId, data) {
  return setDoc(doc(db, USER_COLLECTION, userId), data, { merge: true });
}

/**
 * Get user data by ID
 *
 * @param {number} userId - User ID to fetch
 * @returns inferred Promise<DocumentSnapshot<DocumentData, DocumentData>>
 */
export function getUserData(userId) {
  return getDoc(doc(db, USER_COLLECTION, userId));
}

/**
 * Subscribe to real-time updates of user data
 *
 * @param {number} userId - User ID
 * @param {function} callback - Callback to handle data updates
 * @returns inferred unsubscribe function
 */
export function subscribeToUserData(userId, callback) {
  return onSnapshot(doc(db, USER_COLLECTION, userId), (doc) => {
    callback(doc.data());
  });
}

/**
 * Claim a unique display name for a user. Uses a dedicated collection keyed by
 * lower-cased display name to enforce uniqueness via transaction.
 *
 * @param {string} userId - The user ID that owns this display name
 * @param {string} displayName - The desired display name
 * @returns {Promise<void>}
 */
export async function claimDisplayName(userId, displayName) {
  if (!userId || !displayName) return;

  const normalized = displayName.trim().toLowerCase();
  const displayNameRef = doc(db, DISPLAY_NAME_COLLECTION, normalized);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(displayNameRef);

    if (snap.exists()) {
      const existing = snap.data();
      if (existing.userId && existing.userId !== userId) {
        throw new Error("Display name is already taken. Please choose another one.");
      }
    }

    transaction.set(displayNameRef, {
      userId,
      displayName,
      claimedAt: Date.now(),
    });
  });
}

/**
 * Release a display name previously owned by a user. No-op if owned by someone else.
 * @param {string} userId
 * @param {string} displayName
 */
export async function releaseDisplayName(userId, displayName) {
  if (!userId || !displayName) return;

  const normalized = displayName.trim().toLowerCase();
  const displayNameRef = doc(db, DISPLAY_NAME_COLLECTION, normalized);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(displayNameRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.userId === userId) {
      // Safe to delete only if the same user currently owns it
      transaction.delete(displayNameRef);
    }
  });
}
