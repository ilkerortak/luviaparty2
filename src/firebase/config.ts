import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDgswRNd49CnYzNLvW8EGjhSwiVinsuJaw",
  authDomain: "luvia-party.firebaseapp.com",
  projectId: "luvia-party",
  storageBucket: "luvia-party.firebasestorage.app",
  messagingSenderId: "1069423383335",
  appId: "1:1069423383335:android:7809795591f48f751f0f02",
  // ⚠️ Firebase konsolundan RTDB URL'nizi buraya girin:
  databaseURL: "https://luvia-party-default-rtdb.europe-west1.firebasedatabase.app",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);
export const rtdb = getDatabase(app, "https://luvia-party-default-rtdb.europe-west1.firebasedatabase.app");

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut };
