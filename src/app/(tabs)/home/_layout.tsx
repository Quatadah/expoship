import { Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Platform } from 'react-native';
import { useAppTheme } from '../../../contexts/app-theme-context';

export default function HomeLayout() {
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
        name="welcome-dialog"
        options={{ 
          title: 'Welcome Dialog', 
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{ 
          title: 'Premium Plans', 
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen
        name="themes"
        options={{ 
          title: 'Themes', 
          presentation: 'formSheet',
        }}
      />

    </Stack>
  );
}

