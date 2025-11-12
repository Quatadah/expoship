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

export default function SignInScreen() {
  const router = useRouter();
  const {
    signInWithEmail,
    signInWithProvider,
    authState,
    isEmailVerified,
    user,
  } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<OAuthProvider | 'email' | null>(
    null
  );

  const handleEmailSignIn = useCallback(async () => {
    setFormError(null);
    setPendingAction('email');
    const result = await signInWithEmail(email.trim(), password);
    setPendingAction(null);

    if (!result.success) {
      setFormError(result.error.message);
       await haptics.warning();
      showToast({
        title: 'Sign in failed',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    await haptics.success();
    showToast({
      title: 'Welcome back',
      type: 'success',
    });
    router.replace('/(tabs)/home');
  }, [email, password, router, signInWithEmail]);

  const handleProviderPress = useCallback(
    async (provider: OAuthProvider) => {
      setFormError(null);
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
        title: 'Welcome back',
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
          Welcome back
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          Sign in to manage your Expo SaaS workspace.
        </AppText>
        <AppText className="text-base text-foreground/70">
          Secure authentication powered by Supabase Auth with OAuth providers ready on
          day one.
        </AppText>
      </View>

      {!isEmailVerified && user && (
        <Card className="border border-warning/30 bg-warning/10">
          <Card.Body className="gap-2">
            <AppText className="text-sm text-warning/90 font-medium">
              Verify your email
            </AppText>
            <AppText className="text-sm text-warning/80">
              We sent a verification link to {user.email}. Please confirm your email to
              unlock all features.
            </AppText>
          </Card.Body>
        </Card>
      )}

      <Card className="border border-foreground/10 bg-background/80">
        <Card.Body className="gap-4">
          <View className="gap-3">
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

          <Button
            color="primary"
            onPress={handleEmailSignIn}
            isDisabled={!email || !password || authState === 'processing'}
            isLoading={pendingAction === 'email' && authState === 'processing'}
            className="h-12"
          >
            Continue
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

          <View className="flex-row items-center justify-between pt-2">
            <Link href="/(auth)/forgot-password" asChild>
              <AppText className="text-sm text-primary font-medium">
                Forgot password?
              </AppText>
            </Link>
            <Link href="/(auth)/sign-up" asChild>
              <AppText className="text-sm text-primary font-medium">
                Create account
              </AppText>
            </Link>
          </View>
        </Card.Body>
      </Card>
    </ScreenScrollView>
  );
}

