import { Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Platform } from 'react-native';

export default function AuthLayout() {
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: background,
        },
        presentation: Platform.select({ ios: 'modal', default: 'card' }),
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: 'Reset password' }}
      />
      <Stack.Screen name="callback" options={{ headerShown: false }} />
      <Stack.Screen name="update-password" options={{ title: 'Update password' }} />
    </Stack>
  );
}

