import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { FormMessage } from '@/components/auth/form-message';
import { useAuth } from '@/context/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateEmail, validatePassword } from '@/lib/auth-validation';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen eyebrow="Welcome back" title="Sign in" subtitle="Use the email and password for your account.">
      <Animated.View entering={FadeInDown.delay(90).duration(480)} className="gap-4">
        <FormMessage message={formError} tone="error" />
        <AuthField
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setEmailError(undefined);
          }}
          error={emailError}
          keyboardType="email-address"
          inputMode="email"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />
        <AuthField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setPasswordError(undefined);
          }}
          error={passwordError}
          secure
          inputRef={passwordRef}
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => {
            void handleSignIn();
          }}
          editable={!loading}
        />
        <Link href="/forgot-password" asChild>
          <Pressable accessibilityRole="link" className="self-end py-1">
            <Text className="text-sm font-semibold text-brand">Forgot password?</Text>
          </Pressable>
        </Link>
        <AuthButton label="Sign in" loading={loading} onPress={() => void handleSignIn()} />
      </Animated.View>

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">New here?</Text>
        <Link href="/sign-up" asChild>
          <Pressable accessibilityRole="link" className="py-2">
            <Text className="text-sm font-semibold text-brand">Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
