import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Save user data to Firestore
 *
 * @param {number} userId - User ID
 * @param {object} data - Data to save
 * @returns {Promise<void>}
 */
export function saveUserData(userId, data) {
  return setDoc(doc(db, 'users', userId), data, { merge: true });
}

/**
 * Get user data by ID
 *
 * @param {number} userId - User ID to fetch
 * @returns inferred Promise<DocumentSnapshot<DocumentData, DocumentData>>
 */
export function getUserData(userId) {
  return getDoc(doc(db, 'users', userId));
}

/**
 * Subscribe to real-time updates of user data
 *
 * @param {number} userId - User ID
 * @param {function} callback - Callback to handle data updates
 * @returns inferred unsubscribe function
 */
export function subscribeToUserData(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), (doc) => {
    callback(doc.data());
  });
}
