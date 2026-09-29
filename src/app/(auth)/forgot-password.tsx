import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthScreen } from '@/components/auth/auth-screen';
import { FormMessage } from '@/components/auth/form-message';
import { useAuth } from '@/context/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateEmail } from '@/lib/auth-validation';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    setFormError(null);

    if (nextEmailError) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      eyebrow="Account recovery"
      title="Reset password"
      subtitle="We will email you a link to choose a new password.">
      {sent ? (
        <Animated.View entering={FadeIn.duration(360)} className="gap-4">
          <FormMessage
            message={`A reset link is on its way to ${email.trim()}. Open it on this device to choose a new password.`}
            tone="success"
          />
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link" className="h-14 items-center justify-center rounded-2xl bg-brand">
              <Text className="text-base font-semibold text-white">Back to sign in</Text>
            </Pressable>
          </Link>
        </Animated.View>
      ) : (
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
            returnKeyType="done"
            onSubmitEditing={() => {
              void handleReset();
            }}
            editable={!loading}
          />
          <AuthButton label="Send reset link" loading={loading} onPress={() => void handleReset()} />
        </Animated.View>
      )}

      {sent ? null : (
        <View className="items-center">
          <Link href="/login" asChild>
            <Pressable accessibilityRole="link" className="py-2">
              <Text className="text-sm font-semibold text-brand">Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </AuthScreen>
  );
}
