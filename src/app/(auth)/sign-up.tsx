import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { Button, Card, TextField } from 'heroui-native';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { useToast } from '../../components/toast-context';
import { useAuth } from '../../features/auth/use-auth';
import type { OAuthProvider } from '../../features/auth/types';
import { haptics } from '../../lib/haptics';

const StyledIonicons = withUniwind(Ionicons);

const providers: Array<{
  provider: OAuthProvider;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    provider: 'google',
    label: 'Continue with Google',
    icon: 'logo-google',
  },
  {
    provider: 'apple',
    label: 'Continue with Apple',
    icon: 'logo-apple',
  },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpWithEmail, signInWithProvider, authState } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<OAuthProvider | 'email' | null>(
    null
  );

  const handleSignUp = useCallback(async () => {
    setFormError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      await haptics.warning();
      return;
    }

    setPendingAction('email');
    const result = await signUpWithEmail(email.trim(), password, {
      full_name: fullName,
    });
    setPendingAction(null);

    if (!result.success) {
      setFormError(result.error.message);
      await haptics.warning();
      showToast({
        title: 'Sign up failed',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    setSuccessMessage(
      'Account created. Check your inbox to verify your email before signing in.'
    );
    await haptics.success();
    showToast({
      title: 'Check your inbox',
      description: 'Verify your email to activate your account.',
      type: 'success',
    });
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [confirmPassword, email, fullName, password, signUpWithEmail]);

  const handleProviderPress = useCallback(
    async (provider: OAuthProvider) => {
      setFormError(null);
      setSuccessMessage(null);
      setPendingAction(provider);
      const result = await signInWithProvider(provider);
      setPendingAction(null);

      if (!result.success) {
        setFormError(result.error.message);
        await haptics.warning();
        showToast({
          title: 'OAuth sign in failed',
          description: result.error.message,
          type: 'error',
        });
        return;
      }

      await haptics.success();
      showToast({
        title: 'Welcome aboard',
        type: 'success',
      });
      router.replace('/(tabs)/home');
    },
    [router, signInWithProvider]
  );

  return (
    <ScreenScrollView padTop contentContainerClassName="gap-6 pb-12">
      <View className="pt-6 gap-2">
        <AppText className="text-xs tracking-[0.35em] text-muted uppercase">
          Create account
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          Launch your SaaS faster with a verified workspace.
        </AppText>
        <AppText className="text-base text-foreground/70">
          Email sign up with Supabase Auth plus instant access via Google or Apple.
        </AppText>
      </View>

      <Card className="border border-foreground/10 bg-background/80">
        <Card.Body className="gap-4">
          <View className="gap-3">
            <TextField>
              <TextField.Label>Full name</TextField.Label>
              <TextField.Input value={fullName} onChangeText={setFullName} />
            </TextField>

            <TextField isRequired>
              <TextField.Label>Email</TextField.Label>
              <TextField.Input
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </TextField>

            <TextField isRequired>
              <TextField.Label>Password</TextField.Label>
              <TextField.Input
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="next"
              >
                <TextField.InputStartContent className="pointer-events-none">
                  <StyledIonicons
                    name="lock-closed-outline"
                    size={16}
                    className="text-muted"
                  />
                </TextField.InputStartContent>
              </TextField.Input>
            </TextField>

            <TextField isRequired>
              <TextField.Label>Confirm password</TextField.Label>
              <TextField.Input
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
              >
                <TextField.InputStartContent className="pointer-events-none">
                  <StyledIonicons
                    name="lock-closed-outline"
                    size={16}
                    className="text-muted"
                  />
                </TextField.InputStartContent>
              </TextField.Input>
            </TextField>
          </View>

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
            onPress={handleSignUp}
            isDisabled={
              !email || !password || !confirmPassword || authState === 'processing'
            }
            isLoading={pendingAction === 'email' && authState === 'processing'}
            className="h-12"
          >
            Create account
          </Button>

          <View className="gap-2">
            {providers.map((provider) => (
              <Pressable
                key={provider.provider}
                onPress={() => handleProviderPress(provider.provider)}
                disabled={authState === 'processing'}
                className="opacity-100 active:opacity-70 disabled:opacity-50"
              >
                <View className="flex-row items-center justify-center gap-2 py-2">
                  {pendingAction === provider.provider && authState === 'processing' ? (
                    <AppText className="text-sm text-primary">Loading...</AppText>
                  ) : (
                    <>
                      <StyledIonicons
                        name={provider.icon}
                        size={16}
                        className="text-primary"
                      />
                      <AppText className="text-sm text-primary font-medium">
                        {provider.label}
                      </AppText>
                    </>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          <View className="flex-row items-center justify-center gap-1 pt-2">
            <AppText className="text-sm text-foreground/70">
              Already have an account?
            </AppText>
            <Link href="/(auth)/sign-in" asChild>
              <AppText className="text-sm text-primary font-medium">Sign in</AppText>
            </Link>
          </View>
        </Card.Body>
      </Card>
    </ScreenScrollView>
  );
}

