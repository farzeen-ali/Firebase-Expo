import { NOTE_BODY_MAX, NOTE_TITLE_MAX, type NoteInput } from '@/types/note';

export type NoteFieldErrors = {
  title?: string;
  body?: string;
};

export function validateNote(input: NoteInput): NoteFieldErrors {
  const title = input.title.trim();
  const body = input.body.trim();
  const errors: NoteFieldErrors = {};

  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > NOTE_TITLE_MAX) {
    errors.title = `Title must be ${NOTE_TITLE_MAX} characters or fewer.`;
  }

  if (body.length > NOTE_BODY_MAX) {
    errors.body = `Note must be ${NOTE_BODY_MAX.toLocaleString()} characters or fewer.`;
  }

  return errors;
}

export function hasNoteErrors(errors: NoteFieldErrors) {
  return Boolean(errors.title || errors.body);
}
