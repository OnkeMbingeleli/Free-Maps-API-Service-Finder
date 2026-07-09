import { createContext, useContext, useEffect, useState } from 'react';
import { firebaseAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser ?? null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = (email, password) => signInWithEmailAndPassword(firebaseAuth, email, password);
  const signUp = (email, password) => createUserWithEmailAndPassword(firebaseAuth, email, password);
  const signOutUser = () => signOut(firebaseAuth);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
