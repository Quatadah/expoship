import * as Haptics from 'expo-haptics';

export const haptics = {
  lightImpact: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('[Haptics] Light impact failed', error);
    }
  },
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('[Haptics] Success notification failed', error);
    }
  },
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('[Haptics] Warning notification failed', error);
    }
  },
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('[Haptics] Error notification failed', error);
    }
  },
};

