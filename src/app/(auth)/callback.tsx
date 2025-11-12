import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { supabase } from '../../lib/supabase';

type CallbackParams = {
  access_token?: string;
  refresh_token?: string;
  type?: string;
  error?: string;
  error_description?: string;
};

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<CallbackParams>();
  const router = useRouter();
  const [status, setStatus] = useState('Completing authentication flow…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const completeAuthFlow = async () => {
      if (params.error || params.error_description) {
        setIsError(true);
        setStatus(params.error_description ?? params.error ?? 'Authentication error');
        return;
      }

      if (
        params.type === 'recovery' &&
        params.access_token &&
        params.refresh_token
      ) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (error) {
          setIsError(true);
          setStatus(error.message);
          return;
        }

        router.replace('/(auth)/update-password');
        return;
      }

      router.replace('/(tabs)/home');
    };

    void completeAuthFlow();
  }, [params, router]);

  return (
    <ScreenScrollView contentContainerClassName="flex-1 justify-center items-center px-8">
      <View className="items-center gap-4">
        <ActivityIndicator size="large" />
        <AppText
          className={`text-center text-base ${
            isError ? 'text-danger' : 'text-foreground'
          }`}
        >
          {status}
        </AppText>
      </View>
    </ScreenScrollView>
  );
}

