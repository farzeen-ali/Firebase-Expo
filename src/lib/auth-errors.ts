import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'An account already exists for that email.',
  'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/missing-email': 'Enter the email address for this account.',
  'auth/operation-not-allowed': 'Email and password sign-in is not enabled for this Firebase project.',
  'auth/invalid-api-key': 'Firebase rejected the API key. Check the values in your .env file.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? 'Something went wrong. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}
