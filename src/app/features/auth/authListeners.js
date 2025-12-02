import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { setUser } from './authSlice';

/**
 * Initializes the Firebase authentication state listener.
 *
 * @param {function} dispatch
 * @returns inferred unsubscribe function
 */
export function initAuthListener(dispatch) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      dispatch(setUser({ uid: user.uid, email: user.email }));
    } else {
      dispatch(setUser(null));
    }
  });
}
