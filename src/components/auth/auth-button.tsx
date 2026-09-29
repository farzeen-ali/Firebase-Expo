import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const PRESS_SPRING = { damping: 16, stiffness: 340 };

function animateScale(scale: SharedValue<number>, to: number) {
  scale.value = withSpring(to, PRESS_SPRING);
}

export function AuthButton({ label, onPress, loading = false, disabled = false }: AuthButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => {
          animateScale(scale, 0.97);
        }}
        onPressOut={() => {
          animateScale(scale, 1);
        }}
        className={`h-14 items-center justify-center rounded-2xl bg-brand ${isDisabled ? 'opacity-60' : 'opacity-100'}`}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-base font-semibold text-white">{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
