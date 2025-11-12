import { type Session, type User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { storage, storageKeys } from '../../lib/storage';
import { env } from '../../lib/env';
import type {
  AuthContextValue,
  AuthLoadingState,
  AuthResult,
  OAuthProvider,
  Profile,
} from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isExpoGo = Constants.appOwnership === 'expo';

const redirectTo = AuthSession.makeRedirectUri({
  scheme: env.deepLinkScheme || undefined,
  path: 'auth/callback',
  useProxy: isExpoGo,
  preferLocalhost: !isExpoGo,
});

const transformError = (error: { message: string; code?: string }): AuthResult => ({
  success: false,
  error: {
    message: error.message,
    code: error.code,
  },
});

const makeSuccess = (): AuthResult => ({ success: true });

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  {
    scopes?: string;
    queryParams?: Record<string, string>;
  }
> = {
  google: {
    scopes: 'profile email',
  },
  apple: {
    queryParams: {
      useBundleId: 'true',
    },
  },
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() =>
    storage.getObject<Profile>(storageKeys.cachedProfile)
  );
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authState, setAuthState] = useState<AuthLoadingState>('idle');

  const loadProfile = useCallback(
    async (user: User | null) => {
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[AuthProvider] Failed to load profile', error);
        return;
      }

      setProfile(
        data
          ? {
              onboarding_completed: false,
              billing_plan: null,
              metadata: null,
              expo_push_token: null,
              ...data,
            }
          : null
      );

      if (data) {
        storage.setObject(storageKeys.cachedProfile, data);
      } else {
        storage.remove(storageKeys.cachedProfile);
      }
    },
    [setProfile]
  );

  const syncSession = useCallback(async () => {
    const {
      data: { session: initialSession },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.warn('[AuthProvider] Failed to fetch session', error);
    }

    setSession(initialSession);
    await loadProfile(initialSession?.user ?? null);
    setIsLoadingSession(false);
  }, [loadProfile]);

  useEffect(() => {
    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadProfile(nextSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile, syncSession]);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setAuthState('processing');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setAuthState('idle');
      if (error) {
        return transformError(error);
      }

      return makeSuccess();
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      metadata?: Record<string, unknown>
    ): Promise<AuthResult> => {
      setAuthState('processing');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectTo,
        },
      });

      setAuthState('idle');
      if (error) {
        return transformError(error);
      }

      return makeSuccess();
    },
    []
  );

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    setAuthState('processing');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      setAuthState('idle');
      return transformError(error);
    }

    setAuthState('idle');
    return makeSuccess();
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Sign out failed', error.message);
      throw error;
    }

    setSession(null);
    setProfile(null);
    storage.remove(storageKeys.cachedProfile);
  }, []);

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider): Promise<AuthResult> => {
      setAuthState('processing');
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            scopes: PROVIDER_CONFIG[provider].scopes,
            queryParams: PROVIDER_CONFIG[provider].queryParams,
          },
        });

        if (error) {
          setAuthState('idle');
          return transformError(error);
        }

        if (!data?.url) {
          setAuthState('idle');
          return transformError({
            message: 'Missing authorization URL for provider.',
          });
        }

        const result = await AuthSession.startAsync({
          authUrl: data.url,
          returnUrl: redirectTo,
        });

        if (result.type !== 'success') {
          setAuthState('idle');
          return transformError({
            message:
              result.type === 'dismiss'
                ? 'The sign in flow was closed.'
                : 'The sign in flow was cancelled.',
          });
        }

        const { code, error: oauthError, error_description: errorDescription } =
          result.params ?? {};

        if (oauthError || errorDescription) {
          setAuthState('idle');
          return transformError({
            message: errorDescription ?? oauthError ?? 'OAuth error',
          });
        }

        if (!code) {
          setAuthState('idle');
          return transformError({
            message: 'No authorization code received from provider.',
          });
        }

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setAuthState('idle');
          return transformError(exchangeError);
        }

        setAuthState('idle');
        return makeSuccess();
      } catch (error) {
        console.warn('[AuthProvider] OAuth sign in failed', error);
        setAuthState('idle');
        return transformError({
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        AuthSession.dismiss();
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user ?? null);
  }, [loadProfile, session?.user]);

  const updateProfile = useCallback(
    async (payload: Partial<Profile>): Promise<AuthResult> => {
      if (!session?.user) {
        return transformError({
          message: 'You must be authenticated to update your profile.',
        });
      }

      setAuthState('processing');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) {
        setAuthState('idle');
        return transformError(error);
      }

      await refreshProfile();
      setAuthState('idle');
      return makeSuccess();
    },
    [refreshProfile, session?.user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoadingSession,
      isEmailVerified: Boolean(session?.user?.email_confirmed_at),
      authState,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      signInWithProvider,
      refreshProfile,
      updateProfile,
    }),
    [
      authState,
      isLoadingSession,
      profile,
      resetPassword,
      session,
      signInWithEmail,
      signInWithProvider,
      signOut,
      signUpWithEmail,
      refreshProfile,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used inside an AuthProvider');
  }

  return context;
};

