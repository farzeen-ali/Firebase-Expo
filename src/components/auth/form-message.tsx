import { Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type FormMessageProps = {
  message: string | null;
  tone: 'error' | 'success';
};

export function FormMessage({ message, tone }: FormMessageProps) {
  if (!message) {
    return null;
  }

  const isError = tone === 'error';

  return (
    <Animated.View
      entering={FadeInUp.duration(280)}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className={
        isError
          ? 'rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/40'
          : 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/40'
      }>
      <Text
        className={
          isError
            ? 'text-sm leading-5 text-red-700 dark:text-red-200'
            : 'text-sm leading-5 text-emerald-800 dark:text-emerald-200'
        }>
        {message}
      </Text>
    </Animated.View>
  );
}
