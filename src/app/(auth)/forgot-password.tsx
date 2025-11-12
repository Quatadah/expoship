import { Link } from 'expo-router';
import { Button, Card, TextField } from 'heroui-native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { useAuth } from '../../features/auth/use-auth';
import { haptics } from '../../lib/haptics';
import { useToast } from '../../components/toast-context';

export default function ForgotPasswordScreen() {
  const { resetPassword, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = useCallback(async () => {
    setFormError(null);
    setSuccessMessage(null);

    const result = await resetPassword(email.trim());

    if (!result.success) {
      setFormError(result.error.message);
      await haptics.warning();
      showToast({
        title: 'Reset failed',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    setSuccessMessage(
      'Check your email for a secure link to reset your password. The link expires in 5 minutes.'
    );
    await haptics.success();
    showToast({
      title: 'Reset email sent',
      type: 'success',
    });
    setEmail('');
  }, [email, resetPassword, showToast]);

  return (
    <ScreenScrollView contentContainerClassName="gap-12 pb-16">
      <View className="pt-10 gap-3">
        <AppText className="text-xs tracking-[0.35em] text-muted uppercase">
          Reset password
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          We&apos;ll send a secure recovery link to your inbox.
        </AppText>
        <AppText className="text-base text-foreground/70">
          Password resets are handled by Supabase Auth with row-level security protected
          tokens.
        </AppText>
      </View>

      <Card className="border border-foreground/10 bg-background/80">
        <Card.Body className="gap-6">
          <TextField isRequired>
            <TextField.Label>Email</TextField.Label>
            <TextField.Input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </TextField>

          {formError && (
            <AppText className="text-sm text-danger font-medium">{formError}</AppText>
          )}

          {successMessage && (
            <Card className="border border-success/30 bg-success/10">
              <Card.Body>
                <AppText className="text-sm text-success/90">{successMessage}</AppText>
              </Card.Body>
            </Card>
          )}

          <Button
            color="primary"
            onPress={handleReset}
            isDisabled={!email || authState === 'processing'}
            isLoading={authState === 'processing'}
            className="h-12"
          >
            Send reset link
          </Button>

          <Link href="/(auth)/sign-in" asChild>
            <AppText className="text-sm text-primary font-medium">
              Back to sign in
            </AppText>
          </Link>
        </Card.Body>
      </Card>
    </ScreenScrollView>
  );
}

