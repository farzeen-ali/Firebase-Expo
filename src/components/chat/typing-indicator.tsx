import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

function pulse(dot: SharedValue<number>, delay: number) {
  dot.value = withDelay(
    delay,
    withRepeat(withSequence(withTiming(1, { duration: 280 }), withTiming(0.35, { duration: 280 })), -1, false),
  );
}

function Dot({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 3 }],
  }));

  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />;
}

export function TypingIndicator() {
  const first = useSharedValue(0.35);
  const second = useSharedValue(0.35);
  const third = useSharedValue(0.35);

  useEffect(() => {
    pulse(first, 0);
    pulse(second, 120);
    pulse(third, 240);
  }, [first, second, third]);

  return (
    <View accessibilityLabel="Gemini is thinking" className="flex-row items-center gap-1.5 py-1">
      <Dot progress={first} />
      <Dot progress={second} />
      <Dot progress={third} />
    </View>
  );
}
