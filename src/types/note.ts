export const NOTE_TITLE_MAX = 120;
export const NOTE_BODY_MAX = 2000;

export type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type NoteInput = {
  title: string;
  body: string;
};
