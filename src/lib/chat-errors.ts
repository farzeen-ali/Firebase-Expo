import { FirebaseError } from 'firebase/app';

const DATABASE_ERROR_MESSAGES: Record<string, string> = {
  PERMISSION_DENIED: 'You can only open your own chats. Check the Realtime Database rules.',
  UNAVAILABLE: 'Realtime Database is unreachable. Check your connection and try again.',
  NETWORK_ERROR: 'Network error. Check your connection and try again.',
  UNAUTHENTICATED: 'Sign in again to continue this chat.',
};

export function getChatErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return DATABASE_ERROR_MESSAGES[error.code] ?? 'Could not sync this chat. Please try again.';
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return 'Response stopped.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not complete that message. Please try again.';
}
