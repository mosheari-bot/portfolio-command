import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBHIktmREJS4FoZB9XqNclsCD9hAE2-8CY",
  authDomain: "portfolio-command.firebaseapp.com",
  projectId: "portfolio-command",
  storageBucket: "portfolio-command.firebasestorage.app",
  messagingSenderId: "594502999319",
  appId: "1:594502999319:web:7cdf400dfb91b222e9ab52",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const DATA_DOC = doc(db, 'portfolio', 'main');

export async function saveData(data) {
  try {
    await setDoc(DATA_DOC, { ...data, updatedAt: Date.now() });
  } catch (e) {
    console.error('Firebase save error:', e);
    try { localStorage.setItem('portfolio_backup', JSON.stringify(data)); } catch {}
  }
}

export function subscribeToData(onData, onError) {
  return onSnapshot(DATA_DOC, snap => {
    if (snap.exists()) onData(snap.data());
    else onData(null);
  }, onError);
}

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
