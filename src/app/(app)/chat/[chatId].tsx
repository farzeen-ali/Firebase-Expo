import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { KeyboardAvoidingView, useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatMessage } from '@/components/chat/chat-message';
import { Composer } from '@/components/chat/composer';
import { firebaseDatabaseUrl, geminiApiKey } from '@/config/firebase';
import { BottomTabInset } from '@/constants/theme';
import { useChatSession } from '@/hooks/use-chat-session';

const SUGGESTIONS = ['Explain this idea simply', 'Draft a short plan', 'Help me debug some code'];

export default function ChatScreen() {
  const { chatId: chatIdParam } = useLocalSearchParams<{ chatId: string }>();
  const chatId = typeof chatIdParam === 'string' ? chatIdParam : 'new';
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const scrollRef = useRef<ScrollView>(null);
  const stickToBottom = useRef(true);
  const session = useChatSession(chatId);
  const setupMessage = !firebaseDatabaseUrl
    ? 'Add EXPO_PUBLIC_FIREBASE_DATABASE_URL to .env and restart Expo.'
    : !geminiApiKey
      ? 'Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart Expo.'
      : null;
  const titleSource = session.messages.find((message) => message.role === 'user')?.text ?? '';
  const title = titleSource.replace(/\s+/g, ' ').trim().slice(0, 42) || 'New chat';
  const topInset = Platform.OS === 'web' ? 72 : insets.top;
  const composerInset = keyboardVisible ? 8 : BottomTabInset;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/chat');
  }

  return (
    <View className="flex-1 bg-[#F4F6F8] dark:bg-[#0B0D12]">
      <KeyboardAvoidingView behavior="padding" automaticOffset style={{ flex: 1 }}>
        <View style={{ paddingTop: topInset }} className="flex-row items-center gap-2 px-3 pb-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to chats"
            onPress={goBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
            <Text className="text-xl text-zinc-950 dark:text-white">‹</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-[11px] font-semibold uppercase tracking-widest text-brand">Gemini</Text>
            <Text className="text-base font-semibold text-zinc-950 dark:text-white" numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          scrollEventThrottle={16}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
            stickToBottom.current = distanceFromBottom < 96;
          }}
          onContentSizeChange={() => {
            if (stickToBottom.current) {
              scrollRef.current?.scrollToEnd({ animated: true });
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={session.loadEarlier}
              enabled={session.hasEarlier}
              tintColor="#208AEF"
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
          }}>
          <View className="mx-auto w-full max-w-[760px] flex-1">
            {session.isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#208AEF" />
              </View>
            ) : session.messages.length === 0 ? (
              <View className="flex-1 justify-end gap-3 pb-4">
                <Text className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  How can I help?
                </Text>
                <Text className="text-base leading-6 text-zinc-500 dark:text-zinc-400">
                  Replies stream into this chat and stay synced to your account.
                </Text>
                <View className="mt-2 gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      accessibilityRole="button"
                      disabled={setupMessage != null || session.isSending}
                      onPress={() => void session.send(suggestion)}
                      className="self-start rounded-full border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <Text className="text-sm text-zinc-800 dark:text-zinc-100">{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View className="pt-2">
                {session.hasEarlier ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Load earlier messages"
                    onPress={session.loadEarlier}
                    className="mb-4 items-center py-2">
                    <Text className="text-sm font-semibold text-brand">Load earlier messages</Text>
                  </Pressable>
                ) : null}
                {session.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom + composerInset }} className="px-3 pt-1">
          <View className="mx-auto w-full max-w-[760px] gap-2">
            {session.error ? (
              <Text className="px-2 text-sm leading-5 text-red-600 dark:text-red-300">{session.error}</Text>
            ) : null}
            {setupMessage ? <Text className="px-2 text-sm leading-5 text-zinc-500">{setupMessage}</Text> : null}
            <Composer
              sending={session.isSending}
              disabled={setupMessage != null}
              onSend={(text) => void session.send(text)}
              onStop={session.stop}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
