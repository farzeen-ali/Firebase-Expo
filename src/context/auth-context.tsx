import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth, firebaseConfigError } from '@/config/firebase';

type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function requireAuth() {
  if (!auth) {
    throw new Error(firebaseConfigError ?? 'Firebase Auth is not configured.');
  }
  return auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(auth == null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsReady(true);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      configError: firebaseConfigError,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
      },
      signUp: async (email, password) => {
        await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
      },
      resetPassword: (email) => sendPasswordResetEmail(requireAuth(), email.trim()),
      signOut: () => firebaseSignOut(requireAuth()),
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return value;
}
