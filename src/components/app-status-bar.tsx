import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';
import { memo } from 'react';
import { Platform } from 'react-native';
import { useAppTheme } from '../contexts/app-theme-context';

const STATUSBAR_ANIMATION = true;

const AppStatusBarComponent = () => {
  const background = useThemeColor('background');
  const { isDark } = useAppTheme();

  return (
    <StatusBar
      style={isDark ? 'light' : 'dark'}
      backgroundColor={background}
      animated={STATUSBAR_ANIMATION}
      translucent={Platform.OS === 'android' ? false : undefined}
    />
  );
};

export const AppStatusBar = memo(AppStatusBarComponent);

AppStatusBar.displayName = 'AppStatusBar';

