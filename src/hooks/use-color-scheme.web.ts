import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 *
 * Static web rendering needs the server snapshot to stay `light` until the
 * client takes over, otherwise the first paint can disagree with hydration.
 */
function subscribe() {
  return () => {};
}

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
