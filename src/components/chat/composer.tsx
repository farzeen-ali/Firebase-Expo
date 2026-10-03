import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

type ComposerProps = {
  sending: boolean;
  disabled?: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

const PRESS_SPRING = { damping: 16, stiffness: 340 };

function animateScale(scale: SharedValue<number>, to: number) {
  scale.value = withSpring(to, PRESS_SPRING);
}

export function Composer({ sending, disabled = false, onSend, onStop }: ComposerProps) {
  const [text, setText] = useState('');
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const scheme = useColorScheme();
  const canSend = text.trim().length > 0 && !disabled;
  const isDark = scheme === 'dark';

  function submit() {
    if (!canSend || sending) {
      return;
    }
    const next = text;
    setText('');
    onSend(next);
  }

  return (
    <View className="flex-row items-end gap-2 rounded-[28px] border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <TextInput
        value={text}
        onChangeText={setText}
        editable={!disabled}
        multiline
        placeholder="Message Gemini"
        placeholderTextColor={isDark ? '#8B93A7' : '#8A93A6'}
        accessibilityLabel="Message"
        className="max-h-32 min-h-11 flex-1 px-2 py-2 text-base text-zinc-950 dark:text-white"
      />
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sending ? 'Stop reply' : 'Send message'}
          disabled={!sending && !canSend}
          onPress={sending ? onStop : submit}
          onPressIn={() => animateScale(scale, 0.94)}
          onPressOut={() => animateScale(scale, 1)}
          className={`h-11 w-11 items-center justify-center rounded-full ${sending || canSend ? 'bg-brand' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
          <Text className={`text-base font-semibold ${sending || canSend ? 'text-white' : 'text-zinc-400'}`}>
            {sending ? '■' : '↑'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
