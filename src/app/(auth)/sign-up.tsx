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
import { validateConfirmPassword, validateEmail, validatePassword } from '@/lib/auth-validation';

const MIN_PASSWORD_LENGTH = 8;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password, MIN_PASSWORD_LENGTH);
    const nextConfirmError = validateConfirmPassword(password, confirmPassword);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    setFormError(null);

    if (nextEmailError || nextPasswordError || nextConfirmError) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      eyebrow="Get started"
      title="Create account"
      subtitle="Use an email and a password with at least 8 characters.">
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
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!loading}
        />
        <AuthField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setConfirmError(undefined);
          }}
          error={confirmError}
          secure
          inputRef={confirmRef}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => {
            void handleSignUp();
          }}
          editable={!loading}
        />
        <AuthButton label="Create account" loading={loading} onPress={() => void handleSignUp()} />
      </Animated.View>

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-sm text-zinc-500 dark:text-zinc-400">Already have an account?</Text>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link" className="py-2">
            <Text className="text-sm font-semibold text-brand">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}
