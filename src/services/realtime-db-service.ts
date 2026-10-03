import {
  get,
  limitToLast,
  onValue,
  push,
  query,
  ref,
  update,
  type DataSnapshot,
} from 'firebase/database';

import { rtdb } from '@/config/firebase';
import type { ChatMessage, ChatMessageStatus, ChatRole, ChatThread } from '@/types/chat';

const TITLE_MAX = 80;
const PREVIEW_MAX = 180;

function requireDatabase() {
  if (!rtdb) {
    throw new Error('Add EXPO_PUBLIC_FIREBASE_DATABASE_URL to .env and restart Expo.');
  }
  return rtdb;
}

function threadPath(userId: string, chatId?: string) {
  return chatId ? `chatThreads/${userId}/${chatId}` : `chatThreads/${userId}`;
}

function messagesPath(userId: string, chatId: string, messageId?: string) {
  const base = `chats/${userId}/${chatId}/messages`;
  return messageId ? `${base}/${messageId}` : base;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function asText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function mapThread(id: string, value: unknown): ChatThread | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const title = asText(record.title).trim();
  if (!title) {
    return null;
  }
  return {
    id,
    title,
    preview: asText(record.preview),
    createdAt: asNumber(record.createdAt),
    updatedAt: asNumber(record.updatedAt),
  };
}

function mapMessage(id: string, value: unknown): ChatMessage | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const role = record.role === 'model' ? 'model' : record.role === 'user' ? 'user' : null;
  if (!role) {
    return null;
  }
  const status: ChatMessageStatus =
    record.status === 'streaming' || record.status === 'error' ? record.status : 'complete';
  return {
    id,
    role,
    text: asText(record.text),
    createdAt: asNumber(record.createdAt),
    status,
  };
}

function snapshotList<T>(snapshot: DataSnapshot, mapItem: (id: string, value: unknown) => T | null) {
  const items: T[] = [];
  snapshot.forEach((child) => {
    const item = mapItem(child.key ?? '', child.val());
    if (item) {
      items.push(item);
    }
  });
  return items;
}

export function subscribeToThreads(userId: string, onThreads: (threads: ChatThread[]) => void, onError: (error: unknown) => void) {
  if (!rtdb) {
    queueMicrotask(() => onError(new Error('Add EXPO_PUBLIC_FIREBASE_DATABASE_URL to .env and restart Expo.')));
    return () => {};
  }

  return onValue(
    ref(rtdb, threadPath(userId)),
    (snapshot) => {
      const threads = snapshotList(snapshot, mapThread).sort((a, b) => b.updatedAt - a.updatedAt);
      onThreads(threads);
    },
    (error) => onError(error),
  );
}

export function subscribeToMessages(
  userId: string,
  chatId: string,
  limit: number,
  onMessages: (messages: ChatMessage[]) => void,
  onError: (error: unknown) => void,
) {
  if (!rtdb) {
    queueMicrotask(() => onError(new Error('Add EXPO_PUBLIC_FIREBASE_DATABASE_URL to .env and restart Expo.')));
    return () => {};
  }

  const messagesQuery = query(ref(rtdb, messagesPath(userId, chatId)), limitToLast(limit));
  return onValue(
    messagesQuery,
    (snapshot) => {
      onMessages(snapshotList(snapshot, mapMessage));
    },
    (error) => onError(error),
  );
}

export async function createChatId(userId: string) {
  const database = requireDatabase();
  const chatId = push(ref(database, threadPath(userId))).key;
  if (!chatId) {
    throw new Error('Could not start a new chat.');
  }
  return chatId;
}

function clip(value: string, max: number) {
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

export async function ensureThread(userId: string, chatId: string, titleSource: string) {
  const database = requireDatabase();
  const threadRef = ref(database, threadPath(userId, chatId));
  const existing = await get(threadRef);
  const now = Date.now();
  const title = clip(titleSource, TITLE_MAX) || 'New chat';

  if (!existing.exists()) {
    await update(ref(database), {
      [threadPath(userId, chatId)]: {
        title,
        preview: '',
        createdAt: now,
        updatedAt: now,
      },
    });
    return;
  }

  await update(threadRef, { updatedAt: now });
}

export async function touchThread(userId: string, chatId: string, preview: string) {
  const database = requireDatabase();
  await update(ref(database, threadPath(userId, chatId)), {
    preview: clip(preview, PREVIEW_MAX),
    updatedAt: Date.now(),
  });
}

export async function saveMessage(
  userId: string,
  chatId: string,
  message: { role: ChatRole; text: string; status: ChatMessageStatus; id?: string },
) {
  const database = requireDatabase();
  const messageId = message.id ?? push(ref(database, messagesPath(userId, chatId))).key;
  if (!messageId) {
    throw new Error('Could not save that message.');
  }

  await update(ref(database), {
    [messagesPath(userId, chatId, messageId)]: {
      role: message.role,
      text: message.text,
      status: message.status,
      createdAt: Date.now(),
    },
  });

  return messageId;
}

export async function updateMessage(
  userId: string,
  chatId: string,
  messageId: string,
  patch: { text: string; status: ChatMessageStatus },
) {
  const database = requireDatabase();
  await update(ref(database, messagesPath(userId, chatId, messageId)), patch);
}

export async function deleteThread(userId: string, chatId: string) {
  const database = requireDatabase();
  await update(ref(database), {
    [threadPath(userId, chatId)]: null,
    [`chats/${userId}/${chatId}`]: null,
  });
}
