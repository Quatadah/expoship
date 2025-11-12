import 'react-native-url-polyfill/auto';

import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Slot } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import '../../global.css';
import { AppStatusBar } from '../components/app-status-bar';
import { AppThemeProvider } from '../contexts/app-theme-context';
import { AuthProvider } from '../features/auth/auth-context';
import { BillingProvider } from '../features/billing/billing-context';
import { ToastProvider } from '../components/toast-context';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...FontAwesome6.font,
    ...Entypo.font,
    ...AntDesign.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <AppThemeProvider>
          <AuthProvider>
            <BillingProvider>
              <ToastProvider>
                <HeroUINativeProvider
                  config={{
                    textProps: {
                      allowFontScaling: false,
                    },
                  }}
                >
                  <AppStatusBar />
                  <Slot />
                </HeroUINativeProvider>
              </ToastProvider>
            </BillingProvider>
          </AuthProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
