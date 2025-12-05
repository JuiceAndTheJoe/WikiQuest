import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { setUser, setGuestUser } from './authSlice';
import { getOrCreateGuestId, createGuestUserObject } from './guestUtils';

/**
 * Initializes the Firebase authentication state listener.
 * Auto-creates a guest user if no authenticated user exists.
 *
 * @param {function} dispatch
 * @returns inferred unsubscribe function
 */
export function initAuthListener(dispatch) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Authenticated Firebase user
      dispatch(setUser({ uid: user.uid, email: user.email }));
    } else {
      // No authenticated user - create/restore guest session
      const guestId = getOrCreateGuestId();
      dispatch(setGuestUser(createGuestUserObject(guestId)));
    }
  });
}
