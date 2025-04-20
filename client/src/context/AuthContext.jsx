import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider - Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthProvider - Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('AuthProvider - Starting Google sign in');
      const result = await signInWithPopup(auth, provider);
      console.log('AuthProvider - Google sign in successful');
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      console.log('AuthProvider - Starting email sign in');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider - Email sign in successful');
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      console.log('AuthProvider - Starting email registration');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider - Email registration successful');
      return result.user;
    } catch (error) {
      console.error('Error registering with email:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      console.log('AuthProvider - Starting sign out');
      await signOut(auth);
      console.log('AuthProvider - Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signInWithEmail,
    registerWithEmail,
    logOut
  };

  console.log('AuthProvider - Current state:', { user: user?.email, loading });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 