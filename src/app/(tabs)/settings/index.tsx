import { useRouter } from 'expo-router';
import { Switch } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { useToast } from '../../../components/toast-context';
import { useAuth } from '../../../features/auth/use-auth';
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '../../../features/notifications/push';
import { supabase } from '../../../lib/supabase';
import {
  Section,
  type SettingIcon,
  type SettingRowProps,
} from './components';

const legalLinks = [
  {
    id: 'privacy',
    label: 'Privacy Policy',
    url: 'https://your-company.com/privacy',
    icon: {
      name: 'shield',
      background: 'bg-emerald-500/15',
      color: 'text-emerald-500',
    } as SettingIcon,
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    url: 'https://your-company.com/terms',
    icon: {
      name: 'file-text',
      background: 'bg-blue-500/15',
      color: 'text-blue-500',
    } as SettingIcon,
  },
  {
    id: 'support',
    label: 'Support',
    url: 'mailto:support@your-company.com',
    icon: {
      name: 'life-buoy',
      background: 'bg-purple-500/15',
      color: 'text-purple-500',
    } as SettingIcon,
  },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    user,
    profile,
    refreshProfile,
    signOut,
  } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Boolean(profile?.expo_push_token)
  );
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(Boolean(profile?.expo_push_token));
  }, [profile?.expo_push_token]);

  const canManageAccount = Boolean(user);

  const handleNotificationsToggle = async (nextValue: boolean) => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    if (notificationsLoading) {
      return;
    }

    setNotificationsLoading(true);

    try {
      if (nextValue) {
        const token = await registerForPushNotificationsAsync();
        await savePushToken(user.id, token);
        await refreshProfile();
        setNotificationsEnabled(true);
        showToast({
          title: 'Push notifications enabled',
          description: 'Device registered for Expo push alerts.',
          type: 'success',
        });
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            expo_push_token: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        await refreshProfile();
        setNotificationsEnabled(false);
        showToast({
          title: 'Push notifications disabled',
          description: 'We will stop sending device alerts.',
        });
      }
    } catch (error) {
      console.warn('[Settings] Push toggle failed', error);
      showToast({
        title: 'Notification setup failed',
        description:
          error instanceof Error ? error.message : 'Unable to update notifications.',
        type: 'error',
      });
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('[Settings] Failed to open link', error);
      showToast({
        title: 'Unable to open link',
        description:
          error instanceof Error ? error.message : 'Check the URL configuration.',
        type: 'error',
      });
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.warn('[Settings] Sign out failed', error);
      showToast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'Unable to sign out.',
        type: 'error',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const accountSectionItems: SettingRowProps[] = canManageAccount
    ? [
        {
          id: 'profile',
          label: 'Profile',
          subtitle: 'Update your name and username.',
          icon: {
            name: 'user',
            background: 'bg-emerald-500/15',
            color: 'text-emerald-500',
          },
          onPress: () => router.push('/(tabs)/settings/profile'),
          showChevron: true,
        },
        {
          id: 'email',
          label: 'Email',
          detail: user?.email ?? '',
          icon: {
            name: 'mail',
            background: 'bg-blue-500/15',
            color: 'text-blue-500',
          },
        },
      ]
    : [
        {
          id: 'sign-in',
          label: 'Sign in to manage your account',
          subtitle:
            'Access profile editing, push notifications, and account actions.',
          icon: {
            name: 'log-in',
            background: 'bg-primary/15',
            color: 'text-primary',
          },
          onPress: () => router.push('/(auth)/sign-in'),
          showChevron: true,
        },
      ];

  const notificationSectionItems: SettingRowProps[] = [
    {
      id: 'push',
      label: 'Push Notifications',
      subtitle: 'Enable Expo alerts for account and billing updates.',
      icon: {
        name: 'bell',
        background: 'bg-amber-500/15',
        color: 'text-amber-500',
      },
      rightElement: (
        <Switch
          isSelected={notificationsEnabled}
          isDisabled={notificationsLoading}
          onSelectedChange={handleNotificationsToggle}
        />
      ),
    },
  ];

  const legalSectionItems: SettingRowProps[] = legalLinks.map((link) => ({
    id: link.id,
    label: link.label,
    icon: link.icon,
    onPress: () => handleOpenLink(link.url),
    showChevron: true,
  }));

  const destructiveItems: SettingRowProps[] = canManageAccount
    ? [
        {
          id: 'sign-out',
          label: 'Sign Out',
          variant: 'destructive',
          onPress: handleSignOut,
          disabled: isSigningOut,
        },
      ]
    : [];

  return (
    <ScreenScrollView contentContainerClassName="gap-8 pb-20 px-4">
      <View className="pt-10 gap-4">
        <AppText className="text-xs tracking-[0.35em] text-muted uppercase">
          Settings
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          Manage your profile and preferences.
        </AppText>
        <AppText className="text-base text-foreground/70">
          Update account details, toggle notifications, and review key policies in
          one place.
        </AppText>
      </View>

      <Section title="Account" items={accountSectionItems} />
      <Section title="Notifications" items={notificationSectionItems} />
      <Section title="Legal & Support" items={legalSectionItems} />
      <Section items={destructiveItems} />
    </ScreenScrollView>
  );
}


