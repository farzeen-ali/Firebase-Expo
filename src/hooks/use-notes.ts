import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { createNote, deleteNote, subscribeToNotes, updateNote } from '@/services/firestore-service';
import type { Note, NoteInput } from '@/types/note';

export function useNotes() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(userId != null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToNotes(
      userId,
      (nextNotes) => {
        setNotes(nextNotes);
        setIsLoading(false);
        setError(null);
      },
      (nextError) => {
        setError(getFirestoreErrorMessage(nextError));
        setIsLoading(false);
      },
    );
  }, [userId]);

  const create = useCallback(
    async (input: NoteInput) => {
      if (!userId) {
        throw new Error('You need to be signed in.');
      }
      await createNote(userId, input);
    },
    [userId],
  );

  const update = useCallback(
    async (noteId: string, input: NoteInput) => {
      if (!userId) {
        throw new Error('You need to be signed in.');
      }
      await updateNote(userId, noteId, input);
    },
    [userId],
  );

  const remove = useCallback(
    async (noteId: string) => {
      if (!userId) {
        throw new Error('You need to be signed in.');
      }
      await deleteNote(userId, noteId);
    },
    [userId],
  );

  return { notes, isLoading, error, create, update, remove };
}
