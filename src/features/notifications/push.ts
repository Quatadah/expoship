import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    throw new Error('Push notifications only work on physical devices.');
  }

  let existingStatus = (await Notifications.getPermissionsAsync()).status;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    existingStatus = status;
  }

  if (existingStatus !== 'granted') {
    throw new Error('Push notification permissions were not granted.');
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      'EAS project ID is missing. Set it via app.json → expo → extra → eas.projectId.'
    );
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token.data;
};

export const savePushToken = async (userId: string, token: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId);

  if (error) {
    throw error;
  }
};

