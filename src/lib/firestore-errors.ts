import { FirebaseError } from 'firebase/app';

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'You can only access your own notes. Check the Firestore security rules.',
  unavailable: 'Firestore is unreachable. Check your connection and try again.',
  unauthenticated: 'Sign in again to manage your notes.',
  'failed-precondition': 'Firestore rejected this query. Confirm the database is created and the rules are published.',
  'not-found': 'That note no longer exists.',
  aborted: 'The save was interrupted. Try again.',
  cancelled: 'The request was cancelled. Try again.',
  'resource-exhausted': 'Too many requests. Wait a moment and try again.',
};

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return FIRESTORE_ERROR_MESSAGES[error.code] ?? 'Could not update your notes. Please try again.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not update your notes. Please try again.';
}
