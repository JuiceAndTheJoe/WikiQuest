import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export function saveUserData(userId, data) {
    return setDoc(doc(db, 'users', userId), data, { merge: true });
}

export function getUserData(userId) {
    return getDoc(doc(db, 'users', userId));
}

export function subscribeToUserData(userId, callback) {
    return onSnapshot(doc(db, 'users', userId), (doc) => {
        callback(doc.data());
    });
}

// Per-user metrics document
const userMetricsDocRef = (userId) => doc(db, 'users', userId, 'metrics', 'clicks');

export async function getGetStartedClicks(userId) {
    if (!userId) return 0;
    const snap = await getDoc(userMetricsDocRef(userId));
    const data = snap.exists() ? snap.data() : { getStartedClicks: 0 };
    return data.getStartedClicks || 0;
}

export function setGetStartedClicks(userId, count) {
    if (!userId) return Promise.resolve();
    return setDoc(userMetricsDocRef(userId), { getStartedClicks: count }, { merge: true });
}

export function subscribeGetStartedClicks(userId, callback) {
    if (!userId) return () => { };
    return onSnapshot(userMetricsDocRef(userId), (snap) => {
        if (snap.exists()) callback(snap.data().getStartedClicks || 0);
    });
}

// Leaderboard functions
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function getLeaderboard(maxCount = 10) {
    try {
        const leaderboardRef = collection(db, 'users');
        const q = query(leaderboardRef, orderBy('highScore', 'desc'), limit(maxCount));
        const snapshot = await getDocs(q);
        
        const leaderboard = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            leaderboard.push({
                userId: doc.id,
                email: data.email || 'Anonymous',
                highScore: data.highScore || 0,
            });
        });
        
        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}