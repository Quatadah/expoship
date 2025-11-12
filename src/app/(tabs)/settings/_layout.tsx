import { Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Platform } from 'react-native';
import { useAppTheme } from '../../../contexts/app-theme-context';

export default function SettingsLayout() {
  const background = useThemeColor('background');
  const foreground = useThemeColor('foreground');
  const { isDark } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerTransparent: true,
        headerTintColor: foreground,
        headerStyle: {
          backgroundColor: Platform.select({
            ios: undefined,
            android: background,
          }),
        },
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
        },
        contentStyle: {
          backgroundColor: background,
        },
        headerBlurEffect: isDark ? 'dark' : 'light',
        headerBackButtonDisplayMode: 'generic',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Edit Profile',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}


