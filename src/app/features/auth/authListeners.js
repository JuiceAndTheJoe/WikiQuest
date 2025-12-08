import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { setUser } from "./authSlice";

/**
 * Initializes the Firebase authentication state listener.
 * Simply forwards the current auth state (including anonymous) to Redux.
 *
 * @param {function} dispatch
 * @returns inferred unsubscribe function
 */
export function initAuthListener(dispatch) {
  return onAuthStateChanged(auth, (user) => {
    // Pass through Firebase user (authenticated or anonymous) or null
    const userPayload = user
      ? {
          uid: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
        }
      : null;

    dispatch(setUser(userPayload));
  });
}
