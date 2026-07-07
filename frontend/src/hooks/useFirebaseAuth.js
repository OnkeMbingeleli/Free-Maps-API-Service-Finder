import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  firebaseAuth,
  googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '../config/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const authSignInWithGoogle = () => signInWithPopup(firebaseAuth, googleProvider);
  const authSignInWithEmail = (email, password) => signInWithEmailAndPassword(firebaseAuth, email, password);
  const authCreateAccountWithEmail = (email, password) => createUserWithEmailAndPassword(firebaseAuth, email, password);
  const authSignOut = () => signOut(firebaseAuth);

  return {
    user,
    loading,
    authSignInWithGoogle,
    authSignInWithEmail,
    authCreateAccountWithEmail,
    authSignOut,
  };
}
