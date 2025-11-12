import type { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  website: string | null;
  billing_plan: string | null;
  onboarding_completed: boolean;
  expo_push_token: string | null;
  updated_at: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AuthLoadingState = 'idle' | 'processing';

export type AuthError = {
  message: string;
  code?: string;
};

export type AuthResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: AuthError;
    };

export type OAuthProvider = 'google' | 'apple';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoadingSession: boolean;
  isEmailVerified: boolean;
  authState: AuthLoadingState;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signInWithProvider: (provider: OAuthProvider) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: Partial<Profile>) => Promise<AuthResult>;
};

