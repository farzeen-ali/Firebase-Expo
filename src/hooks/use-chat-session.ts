import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { getChatErrorMessage } from '@/lib/chat-errors';
import { streamGeminiReply } from '@/services/gemini-service';
import {
  createChatId,
  ensureThread,
  saveMessage,
  subscribeToMessages,
  touchThread,
  updateMessage,
} from '@/services/realtime-db-service';
import type { ChatMessage } from '@/types/chat';

const PAGE_SIZE = 30;
const WRITE_INTERVAL_MS = 120;

export function useChatSession(routeChatId: string) {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [createdId, setCreatedId] = useState<string | null>(null);
  const chatId = routeChatId === 'new' ? createdId : routeChatId;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(chatId != null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const writeChain = useRef(Promise.resolve());
  const streamedText = useRef('');
  const [trackedRouteId, setTrackedRouteId] = useState(routeChatId);

  if (trackedRouteId !== routeChatId) {
    setTrackedRouteId(routeChatId);
    if (trackedRouteId !== 'new') {
      setMessages([]);
      setLimit(PAGE_SIZE);
      setError(null);
      setIsLoading(routeChatId !== 'new');
    }
  }

  useEffect(() => {
    if (!userId || !chatId) {
      return;
    }

    return subscribeToMessages(
      userId,
      chatId,
      limit,
      (nextMessages) => {
        setMessages(nextMessages);
        setIsLoading(false);
        setError(null);
      },
      (nextError) => {
        setError(getChatErrorMessage(nextError));
        setIsLoading(false);
      },
    );
  }, [chatId, limit, userId]);

  const loadEarlier = useCallback(() => {
    setLimit((current) => current + PAGE_SIZE);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) {
        return;
      }
      if (!userId) {
        setError('You need to be signed in.');
        return;
      }

      setIsSending(true);
      setError(null);
      streamedText.current = '';
      const controller = new AbortController();
      abortRef.current = controller;
      let activeChatId = chatId;
      let assistantId = '';

      const queueAssistantWrite = (nextText: string, status: 'streaming' | 'complete' | 'error') => {
        if (!activeChatId || !assistantId) {
          return;
        }
        const targetChatId = activeChatId;
        writeChain.current = writeChain.current
          .then(() => updateMessage(userId, targetChatId, assistantId, { text: nextText, status }))
          .catch(() => undefined);
      };

      try {
        if (!activeChatId) {
          activeChatId = await createChatId(userId);
          setCreatedId(activeChatId);
          router.replace(`/chat/${activeChatId}`);
        }

        await ensureThread(userId, activeChatId, trimmed);
        await saveMessage(userId, activeChatId, {
          role: 'user',
          text: trimmed,
          status: 'complete',
        });
        await touchThread(userId, activeChatId, trimmed);

        const history = [
          ...messages
            .filter((message) => message.status !== 'error' && message.text.trim())
            .map((message) => ({ role: message.role, text: message.text })),
          { role: 'user' as const, text: trimmed },
        ];

        assistantId = await saveMessage(userId, activeChatId, {
          role: 'model',
          text: '',
          status: 'streaming',
        });

        let lastWrite = 0;
        const full = await streamGeminiReply(
          history,
          (nextText) => {
            streamedText.current = nextText;
            const now = Date.now();
            if (now - lastWrite < WRITE_INTERVAL_MS) {
              return;
            }
            lastWrite = now;
            queueAssistantWrite(nextText, 'streaming');
          },
          controller.signal,
        );

        await writeChain.current;
        await updateMessage(userId, activeChatId, assistantId, { text: full, status: 'complete' });
        await touchThread(userId, activeChatId, full);
      } catch (nextError) {
        await writeChain.current;
        const message = getChatErrorMessage(nextError);
        const partial = streamedText.current.trim();
        if (userId && activeChatId && assistantId) {
          const stopped = controller.signal.aborted && partial.length > 0;
          await updateMessage(userId, activeChatId, assistantId, {
            text: stopped ? partial : message,
            status: stopped ? 'complete' : 'error',
          }).catch(() => undefined);
          if (stopped) {
            await touchThread(userId, activeChatId, partial).catch(() => undefined);
          }
        }
        if (!controller.signal.aborted) {
          setError(message);
        }
      } finally {
        abortRef.current = null;
        setIsSending(false);
      }
    },
    [chatId, isSending, messages, userId],
  );

  return {
    messages,
    isLoading,
    error,
    isSending,
    hasEarlier: messages.length >= limit,
    loadEarlier,
    send,
    stop,
  };
}
