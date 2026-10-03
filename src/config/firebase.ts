import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { createAuth } from '@/config/auth-persistence';

const firebaseEnv = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

export const firebaseDatabaseUrl = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL?.trim() || null;
export const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || null;

const missingEnvKeys = (Object.keys(firebaseEnv) as (keyof typeof firebaseEnv)[]).filter(
  (key) => !firebaseEnv[key],
);

const envName: Record<keyof typeof firebaseEnv, string> = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
};

export const firebaseConfigError =
  missingEnvKeys.length > 0
    ? `Missing ${missingEnvKeys.map((key) => envName[key]).join(', ')}. Copy .env.example to .env, fill in the Firebase web app config, and restart Expo.`
    : null;

function createFirebaseApp(): FirebaseApp {
  if (firebaseConfigError) {
    throw new Error(firebaseConfigError);
  }

  return getApps().length === 0
    ? initializeApp({
        apiKey: firebaseEnv.apiKey!,
        authDomain: firebaseEnv.authDomain!,
        projectId: firebaseEnv.projectId!,
        storageBucket: firebaseEnv.storageBucket!,
        messagingSenderId: firebaseEnv.messagingSenderId!,
        appId: firebaseEnv.appId!,
        ...(firebaseDatabaseUrl ? { databaseURL: firebaseDatabaseUrl } : {}),
      })
    : getApp();
}

const app: FirebaseApp | null = firebaseConfigError ? null : createFirebaseApp();

export const auth: Auth | null = app ? createAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const rtdb: Database | null = app && firebaseDatabaseUrl ? getDatabase(app, firebaseDatabaseUrl) : null;
