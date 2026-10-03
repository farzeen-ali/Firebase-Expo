import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChatMarkdown } from '@/components/chat/chat-markdown';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import type { ChatMessage as ChatMessageModel } from '@/types/chat';

type ChatMessageProps = {
  message: ChatMessageModel;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming' && !message.text.trim();

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      className={isUser ? 'mb-3 items-end' : 'mb-3 items-start'}>
      <View className={`max-w-[88%] rounded-3xl px-4 py-3 ${messageBubbleClass(message)}`}>
        {!isUser ? (
          <Text className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Gemini</Text>
        ) : null}
        {isStreaming ? <TypingIndicator /> : <ChatMarkdown text={message.text} inverted={isUser && message.status !== 'error'} />}
      </View>
    </Animated.View>
  );
}

function messageBubbleClass(message: ChatMessageModel) {
  if (message.status === 'error') {
    return 'bg-red-50 dark:bg-red-950/50';
  }
  if (message.role === 'user') {
    return 'bg-brand';
  }
  return 'border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900';
}
