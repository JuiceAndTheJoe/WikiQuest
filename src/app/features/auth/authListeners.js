import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { setUser } from './authSlice';

/**
 * Initializes the Firebase authentication state listener.
 * Auto-signs in as anonymous user if no authenticated user exists.
 *
 * @param {function} dispatch
 * @returns inferred unsubscribe function
 */
export function initAuthListener(dispatch) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Firebase user (authenticated or anonymous)
      const userPayload = { 
        uid: user.uid, 
        email: user.email,
        isAnonymous: user.isAnonymous 
      };
      dispatch(setUser(userPayload));
    } else {
      // No user - sign in anonymously
      try {
        await signInAnonymously(auth);
        // onAuthStateChanged will trigger again with the anonymous user
      } catch (error) {
        console.error('Failed to sign in anonymously:', error);
        console.error('Please enable Anonymous Authentication in Firebase Console:');
        console.error('Authentication → Sign-in method → Anonymous → Enable');
        // Create a local anonymous-like user as fallback
        dispatch(setUser({ 
          uid: 'local-' + Date.now(),
          email: null,
          isAnonymous: true 
        }));
      }
    }
  });
}
