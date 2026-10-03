import { useEffect, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { getChatErrorMessage } from '@/lib/chat-errors';
import { subscribeToThreads } from '@/services/realtime-db-service';
import type { ChatThread } from '@/types/chat';

export function useChatThreads() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(userId != null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToThreads(
      userId,
      (nextThreads) => {
        setThreads(nextThreads);
        setIsLoading(false);
        setError(null);
      },
      (nextError) => {
        setError(getChatErrorMessage(nextError));
        setIsLoading(false);
      },
    );
  }, [userId]);

  return { threads, isLoading, error };
}
