import { useRouter } from 'expo-router';
import { Button, Card, TextField } from 'heroui-native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { useAuth } from '../../features/auth/use-auth';
import { supabase } from '../../lib/supabase';

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { refreshProfile, authState } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = useCallback(async () => {
    setFormError(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    await refreshProfile();
    setSuccessMessage('Password updated successfully. Redirecting to your workspace…');
    setPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);

    setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 1200);
  }, [confirmPassword, password, refreshProfile, router]);

  return (
    <ScreenScrollView contentContainerClassName="gap-12 pb-16">
      <View className="pt-10 gap-3">
        <AppText className="text-xs tracking-[0.35em] text-muted uppercase">
          Update password
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          Secure your account with a new password.
        </AppText>
        <AppText className="text-base text-foreground/70">
          You&apos;re signed in via a secure password reset link. Choose a new password to
          finish the process.
        </AppText>
      </View>

      <Card className="border border-foreground/10 bg-background/80">
        <Card.Body className="gap-6">
          <TextField isRequired>
            <TextField.Label>New password</TextField.Label>
            <TextField.Input
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </TextField>

          <TextField isRequired>
            <TextField.Label>Confirm password</TextField.Label>
            <TextField.Input
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
            onPress={handleUpdate}
            isDisabled={
              !password || !confirmPassword || isSubmitting || authState === 'processing'
            }
            isLoading={isSubmitting}
            className="h-12"
          >
            Update password
          </Button>
        </Card.Body>
      </Card>
    </ScreenScrollView>
  );
}

