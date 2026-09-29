import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView, useKeyboardState } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthScreenProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreen({ eyebrow, title, subtitle, children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((state) => state.isVisible);

  return (
    <View className="flex-1 bg-[#F4F7FB] dark:bg-[#070B14]">
      <StatusBar style="auto" />
      <View className="absolute -left-16 -top-12 h-56 w-56 rounded-full bg-brand/15" />
      <View className="absolute -right-12 top-28 h-40 w-40 rounded-full bg-sky-300/40 dark:bg-brand/10" />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={32}
        extraKeyboardSpace={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: keyboardVisible ? 'flex-start' : 'center',
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 24,
        }}>
        <Animated.View
          entering={FadeInDown.duration(560).springify().damping(18)}
          className="w-full max-w-[440px] self-center gap-8">
          <View className="gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand">
              <Text className="text-2xl font-semibold text-white">F</Text>
            </View>
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-brand">{eyebrow}</Text>
              <Text className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">{title}</Text>
              <Text className="text-base leading-6 text-zinc-500 dark:text-zinc-400">{subtitle}</Text>
            </View>
          </View>
          {children}
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}
