import { router } from 'expo-router';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { firebaseDatabaseUrl, geminiApiKey } from '@/config/firebase';
import { BottomTabInset } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useChatThreads } from '@/hooks/use-chat-threads';
import { getChatErrorMessage } from '@/lib/chat-errors';
import { deleteThread } from '@/services/realtime-db-service';
import type { ChatThread } from '@/types/chat';

function formatUpdated(timestamp: number) {
  if (!timestamp) {
    return '';
  }
  const delta = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) {
    return 'Now';
  }
  if (delta < hour) {
    return `${Math.floor(delta / minute)}m`;
  }
  if (delta < day) {
    return `${Math.floor(delta / hour)}h`;
  }
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { threads, isLoading, error } = useChatThreads();
  const setupMessage = !firebaseDatabaseUrl
    ? 'Add EXPO_PUBLIC_FIREBASE_DATABASE_URL to .env and restart Expo.'
    : !geminiApiKey
      ? 'Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart Expo.'
      : null;
  const topInset = Platform.OS === 'web' ? 88 : insets.top;

  function confirmDelete(thread: ChatThread) {
    if (!user) {
      return;
    }
    Alert.alert('Delete chat', `Delete "${thread.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteThread(user.uid, thread.id).catch((nextError) => {
            Alert.alert('Delete failed', getChatErrorMessage(nextError));
          });
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-[#F4F6F8] dark:bg-[#0B0D12]">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: topInset + 18,
          paddingBottom: insets.bottom + BottomTabInset + 28,
          paddingHorizontal: 20,
        }}>
        <View className="mx-auto w-full max-w-[720px] flex-1">
          <View className="mb-6 flex-row items-end justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-brand">Gemini</Text>
              <Text className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">Chats</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New chat"
              disabled={setupMessage != null}
              onPress={() => router.push('/chat/new')}
              className="h-11 items-center justify-center rounded-full bg-brand px-4">
              <Text className="text-sm font-semibold text-white">New chat</Text>
            </Pressable>
          </View>

          {setupMessage ? (
            <View className="rounded-3xl bg-white px-5 py-4 dark:bg-zinc-900">
              <Text className="text-base leading-6 text-zinc-700 dark:text-zinc-200">{setupMessage}</Text>
            </View>
          ) : null}

          {error ? (
            <Text className="mb-4 text-sm leading-5 text-red-600 dark:text-red-300">{error}</Text>
          ) : null}

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-16">
              <ActivityIndicator color="#208AEF" />
            </View>
          ) : threads.length === 0 ? (
            <Animated.View
              entering={FadeInDown.duration(360)}
              className="mt-2 rounded-3xl bg-white px-6 py-10 dark:bg-zinc-900">
              <Text className="text-lg font-semibold text-zinc-950 dark:text-white">Start a conversation</Text>
              <Text className="mt-2 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                Messages stay on this account and sync as Gemini replies.
              </Text>
            </Animated.View>
          ) : (
            <View className="gap-2">
              {threads.map((thread, index) => (
                <Animated.View key={thread.id} entering={FadeInDown.delay(Math.min(index, 8) * 35).duration(320)}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={thread.title}
                    onPress={() => router.push(`/chat/${thread.id}`)}
                    onLongPress={() => confirmDelete(thread)}
                    className="rounded-3xl bg-white px-4 py-4 active:opacity-80 dark:bg-zinc-900">
                    <View className="flex-row items-start justify-between gap-3">
                      <Text className="flex-1 text-base font-semibold text-zinc-950 dark:text-white" numberOfLines={1}>
                        {thread.title}
                      </Text>
                      <Text className="text-xs font-medium text-zinc-400">{formatUpdated(thread.updatedAt)}</Text>
                    </View>
                    {thread.preview ? (
                      <Text className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400" numberOfLines={2}>
                        {thread.preview}
                      </Text>
                    ) : null}
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
