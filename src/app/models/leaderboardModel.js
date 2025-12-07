import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  deleteDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { USER_COLLECTION } from './constants';

/**
 * Fetches the leaderboard data from Firestore.
 *
 * @param {number} maxCount - Maximum number of leaderboard entries to fetch
 * @returns {Promise<Array< { userId: string, email: string, name: string, highScore: string, gamesPlayed: string, averageScore: string, accuracy: string, lastPlayed: string  } >>} - Array of leaderboard entries
 */
export async function getLeaderboard(maxCount = 10) {
  try {
    const leaderboardRef = collection(db, USER_COLLECTION);
    const q = query(
      leaderboardRef,
      orderBy('highScore', 'desc'),
      limit(maxCount * 2) // Fetch more to account for filtering anonymous users
    );
    const snapshot = await getDocs(q);

    const leaderboard = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Skip anonymous users (those without email) and migrated users
      if (!data.email || data.migrated) {
        return;
      }
      
      leaderboard.push({
        userId: doc.id,
        email: data.email,
        name: data.displayName || data.email || 'Player',
        highScore: data.highScore || 0,
        gamesPlayed: data.gamesPlayed || 0,
        averageScore: data.averageScore || 0,
        accuracy: data.accuracy || 0,
        lastPlayed: data.lastPlayed || null,
      });
    });

    // Limit to requested count after filtering
    return leaderboard.slice(0, maxCount);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time leaderboard updates.
 *
 * @param {function} callback - Callback function to handle leaderboard updates
 * @param {number} maxCount - Maximum number of leaderboard entries
 * @returns {function} Unsubscribe function
 */
export function subscribeToLeaderboard(callback, maxCount = 10) {
  const leaderboardRef = collection(db, USER_COLLECTION);
  const q = query(
    leaderboardRef,
    orderBy('highScore', 'desc'),
    limit(maxCount * 2) // Fetch more to account for filtering
  );

  return onSnapshot(q, (snapshot) => {
    const leaderboard = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Skip anonymous users (those without email) and migrated users
      if (!data.email || data.migrated) {
        return;
      }
      
      leaderboard.push({
        userId: doc.id,
        email: data.email,
        name: data.displayName || data.email || 'Player',
        highScore: data.highScore || 0,
        gamesPlayed: data.gamesPlayed || 0,
        averageScore: data.averageScore || 0,
        accuracy: data.accuracy || 0,
        lastPlayed: data.lastPlayed || null,
      });
    });

    // Limit to requested count after filtering
    callback(leaderboard.slice(0, maxCount));
  }, (error) => {
    console.error('Error in leaderboard subscription:', error);
  });
}

/**
 * Saves the game result to the user's profile in Firestore.
 *
 * @param {number} userId - User ID
 * @param {object} summary - Game summary data
 * @param {object} userProfile - User profile data
 * @returns {Promise<void>}
 */
export async function saveGameResult(userId, summary = {}, userProfile = {}) {
  console.log('💾 Saving game result:', { userId, score: summary.finalScore, userProfile });
  
  if (!userId || !summary) {
    console.log('⚠️ Skipping save - missing userId or summary');
    return;
  }
  
  const userRef = doc(db, USER_COLLECTION, userId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      const existing = snap.exists() ? snap.data() : {};

      const safeScore = summary.finalScore || 0;
      const safeCorrect = summary.correctAnswers || 0;
      const safeQuestions = summary.totalQuestions || 0;

      const totalScore = (existing.totalScore || 0) + safeScore;
      const gamesPlayed = (existing.gamesPlayed || 0) + 1;
      const totalCorrectAnswers =
        (existing.totalCorrectAnswers || 0) + safeCorrect;
      const totalQuestions = (existing.totalQuestions || 0) + safeQuestions;
      const accuracy =
        totalQuestions > 0
          ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
          : 0;
      const averageScore =
        gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : safeScore;

      const updatedData = {
        email: userProfile.email || existing.email || null,
        displayName: userProfile.displayName || existing.displayName || null,
        photoURL: userProfile.photoURL || existing.photoURL || null,
        highScore: Math.max(existing.highScore || 0, safeScore),
        gamesPlayed,
        totalScore,
        averageScore,
        totalCorrectAnswers,
        totalQuestions,
        accuracy,
        lastPlayed: summary.endedAt || Date.now(),
      };
      
      console.log('✅ Updating user document with:', updatedData);
      
      transaction.set(userRef, updatedData, { merge: true });
    });
    
    console.log('✅ Game result saved successfully');
  } catch (error) {
    if (error.code === 'resource-exhausted') {
      console.warn('Firestore quota exceeded. Score will not be saved. Try again later.');
    } else {
      throw error;
    }
  }
}

/**
 * Migrates user data from anonymous account to authenticated account.
 * Merges stats and deletes the anonymous user document.
 *
 * @param {string} anonymousUserId - The anonymous user ID
 * @param {string} authenticatedUserId - The authenticated user ID
 * @param {object} userProfile - User profile data (email, displayName, etc.)
 * @returns {Promise<void>}
 */
export async function migrateAnonymousData(anonymousUserId, authenticatedUserId, userProfile = {}) {
  console.log('🔄 Starting data migration:', { anonymousUserId, authenticatedUserId });
  
  if (!anonymousUserId || !authenticatedUserId || anonymousUserId === authenticatedUserId) {
    console.log('⚠️ Migration skipped - invalid IDs or same user');
    return;
  }

  const anonRef = doc(db, USER_COLLECTION, anonymousUserId);
  const authRef = doc(db, USER_COLLECTION, authenticatedUserId);

  try {
    // Step 1: Read both documents
    const anonSnap = await getDoc(anonRef);
    const authSnap = await getDoc(authRef);

    if (!anonSnap.exists()) {
      console.log('⚠️ No anonymous data found to migrate');
      return;
    }

    const anonData = anonSnap.data();
    const authData = authSnap.exists() ? authSnap.data() : {};
    
    console.log('📊 Anonymous data:', anonData);
    console.log('📊 Authenticated data (before merge):', authData);

    // Merge the data - taking the best of both
    const totalScore = (authData.totalScore || 0) + (anonData.totalScore || 0);
    const gamesPlayed = (authData.gamesPlayed || 0) + (anonData.gamesPlayed || 0);
    const totalCorrectAnswers = (authData.totalCorrectAnswers || 0) + (anonData.totalCorrectAnswers || 0);
    const totalQuestions = (authData.totalQuestions || 0) + (anonData.totalQuestions || 0);
    const accuracy = totalQuestions > 0 
      ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
      : 0;
    const averageScore = gamesPlayed > 0 
      ? Math.round(totalScore / gamesPlayed)
      : 0;
    const highScore = Math.max(authData.highScore || 0, anonData.highScore || 0);
    const lastPlayed = Math.max(authData.lastPlayed || 0, anonData.lastPlayed || 0);
    
    const mergedData = {
      email: userProfile.email || authData.email || null,
      displayName: userProfile.displayName || authData.displayName || null,
      photoURL: userProfile.photoURL || authData.photoURL || null,
      highScore,
      gamesPlayed,
      totalScore,
      averageScore,
      totalCorrectAnswers,
      totalQuestions,
      accuracy,
      lastPlayed,
    };
    
    console.log('✅ Merged data:', mergedData);

    // Step 2: Update authenticated user with merged data using transaction
    await runTransaction(db, async (transaction) => {
      transaction.set(authRef, mergedData, { merge: true });
    });

    console.log('✅ Successfully migrated anonymous data to authenticated account');
    console.log('ℹ️ Anonymous data will be filtered from leaderboard automatically');
  } catch (error) {
    console.error('❌ Error migrating anonymous data:', error);
    throw error;
  }
}

/**
 * Updates user profile information in Firestore.
 *
 * @param {string} userId - User ID
 * @param {object} userProfile - User profile data (email, displayName, photoURL)
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, userProfile = {}) {
  console.log('📝 Updating user profile:', { userId, userProfile });
  
  if (!userId) {
    return;
  }

  const userRef = doc(db, USER_COLLECTION, userId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      const existing = snap.exists() ? snap.data() : {};
      
      const updatedData = {
        ...existing,
        email: userProfile.email || existing.email || null,
        displayName: userProfile.displayName || existing.displayName || null,
        photoURL: userProfile.photoURL || existing.photoURL || null,
      };
      
      console.log('✅ Updated profile data:', updatedData);
      
      transaction.set(userRef, updatedData, { merge: true });
    });

    console.log('✅ Successfully updated user profile');
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
}
