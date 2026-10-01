import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import { hasNoteErrors, validateNote } from '@/lib/note-validation';
import type { Note, NoteInput } from '@/types/note';

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }
  return db;
}

function notesCollection(userId: string) {
  return collection(requireDb(), 'users', userId, 'notes');
}

function noteDocument(userId: string, noteId: string) {
  return doc(requireDb(), 'users', userId, 'notes', noteId);
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  return null;
}

function mapNote(id: string, data: DocumentData): Note {
  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : '',
    title: typeof data.title === 'string' ? data.title : '',
    body: typeof data.body === 'string' ? data.body : '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function normalizeNoteInput(input: NoteInput): NoteInput {
  const next = {
    title: input.title.trim(),
    body: input.body.trim(),
  };
  const errors = validateNote(next);
  if (hasNoteErrors(errors)) {
    throw new Error(errors.title ?? errors.body ?? 'Check the note and try again.');
  }
  return next;
}

export function subscribeToNotes(
  userId: string,
  onNotes: (notes: Note[]) => void,
  onError: (error: unknown) => void,
) {
  if (!db) {
    queueMicrotask(() => onError(new Error('Firestore is not configured.')));
    return () => {};
  }

  const notesQuery = query(notesCollection(userId), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      onNotes(snapshot.docs.map((item) => mapNote(item.id, item.data())));
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createNote(userId: string, input: NoteInput) {
  const next = normalizeNoteInput(input);
  await addDoc(notesCollection(userId), {
    userId,
    title: next.title,
    body: next.body,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNote(userId: string, noteId: string, input: NoteInput) {
  const next = normalizeNoteInput(input);
  await updateDoc(noteDocument(userId, noteId), {
    title: next.title,
    body: next.body,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(userId: string, noteId: string) {
  await deleteDoc(noteDocument(userId, noteId));
}
