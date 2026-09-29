import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from '@firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';

type ReactNativeAuthStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type ReactNativeAuthModule = typeof FirebaseAuth & {
  getReactNativePersistence: (storage: ReactNativeAuthStorage) => Persistence;
};

/**
 * The React Native build of Firebase Auth exports this helper, but the
 * default TypeScript entrypoint does not. Metro resolves `@firebase/auth`
 * to that native build on iOS and Android.
 */
const getReactNativePersistence = (FirebaseAuth as ReactNativeAuthModule).getReactNativePersistence;

function isAlreadyInitialized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'auth/already-initialized'
  );
}

export function createAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (isAlreadyInitialized(error)) {
      return getAuth(app);
    }
    throw error;
  }
}
