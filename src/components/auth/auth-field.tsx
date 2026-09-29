import { useState, type RefObject } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthFieldProps = Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoComplete'
  | 'inputMode'
  | 'keyboardType'
  | 'onSubmitEditing'
  | 'returnKeyType'
  | 'textContentType'
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secure?: boolean;
  inputRef?: RefObject<TextInput | null>;
  editable?: boolean;
};

export function AuthField({
  label,
  value,
  onChangeText,
  error,
  secure = false,
  inputRef,
  editable = true,
  ...inputProps
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const borderClass = error
    ? 'border-red-400 dark:border-red-400'
    : focused
      ? 'border-brand'
      : 'border-zinc-200 dark:border-zinc-700';

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</Text>
      <View className={`h-14 flex-row items-center rounded-2xl border bg-white px-4 dark:bg-zinc-900 ${borderClass}`}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={secure && hidden}
          autoCapitalize={inputProps.autoCapitalize ?? 'none'}
          autoCorrect={false}
          placeholder={label}
          placeholderTextColor={isDark ? '#8B93A7' : '#8A93A6'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          className="h-full flex-1 text-base text-zinc-900 dark:text-zinc-50"
          {...inputProps}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? `Show ${label}` : `Hide ${label}`}
            hitSlop={8}
            onPress={() => setHidden((current) => !current)}
            className="ml-2 h-11 w-11 items-center justify-center">
            <SymbolView
              name={
                hidden
                  ? { ios: 'eye', android: 'visibility', web: 'visibility' }
                  : { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
              }
              size={20}
              tintColor={isDark ? '#C5CAD6' : '#5C6578'}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
