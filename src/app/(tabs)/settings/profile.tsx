import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { useToast } from '../../../components/toast-context';
import { useAuth } from '../../../features/auth/use-auth';
import {
    Section,
    type SettingRowProps,
} from './components';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    user,
    profile,
    updateProfile,
  } = useAuth();

  const [form, setForm] = useState({
    fullName: profile?.full_name ?? '',
    username: profile?.username ?? '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/sign-in');
    }
  }, [router, user]);

  useEffect(() => {
    setForm({
      fullName: profile?.full_name ?? '',
      username: profile?.username ?? '',
    });
  }, [profile?.full_name, profile?.username]);

  const handleProfileChange = (key: 'fullName' | 'username', value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = async () => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }

    const trimmedFullName = form.fullName.trim();
    const trimmedUsername = form.username.trim();

    if (
      trimmedFullName === (profile?.full_name ?? '') &&
      trimmedUsername === (profile?.username ?? '')
    ) {
      showToast({
        title: 'Nothing to update',
        description: 'Your profile information is already up to date.',
      });
      return;
    }

    setIsSavingProfile(true);
    const result = await updateProfile({
      full_name: trimmedFullName || null,
      username: trimmedUsername || null,
    });
    setIsSavingProfile(false);

    if (!result.success) {
      showToast({
        title: 'Profile update failed',
        description: result.error.message,
        type: 'error',
      });
      return;
    }

    showToast({
      title: 'Profile updated',
      description: 'Your account details are synced.',
      type: 'success',
    });
  };

  const profileFields: SettingRowProps[] = [
    {
      id: 'full-name',
      label: 'Full Name',
      rightElement: (
        <TextInput
          value={form.fullName}
          onChangeText={(value) => handleProfileChange('fullName', value)}
          placeholder="Ada Lovelace"
          placeholderTextColor="rgba(148, 163, 184, 0.9)"
          autoCapitalize="words"
          className="min-w-[160px] text-right text-base text-foreground"
        />
      ),
    },
    {
      id: 'username',
      label: 'Username',
      rightElement: (
        <TextInput
          value={form.username}
          onChangeText={(value) => handleProfileChange('username', value)}
          placeholder="adal"
          placeholderTextColor="rgba(148, 163, 184, 0.9)"
          autoCapitalize="none"
          autoCorrect={false}
          className="min-w-[160px] text-right text-base text-foreground"
        />
      ),
    },
    {
      id: 'email',
      label: 'Email',
      detail: user?.email ?? '',
    },
  ];

  const saveAction: SettingRowProps[] = [
    {
      id: 'save',
      label: isSavingProfile ? 'Saving...' : 'Save Changes',
      variant: 'primary',
      onPress: isSavingProfile ? undefined : handleProfileSave,
      disabled: isSavingProfile,
    },
  ];

  return (
    <ScreenScrollView contentContainerClassName="gap-8 pb-20 px-4">
      <View className="pt-10 gap-4">
        <AppText className="text-xs tracking-[0.35em] text-muted uppercase">
          Account
        </AppText>
        <AppText className="text-3xl font-semibold text-foreground leading-tight">
          Edit your profile details.
        </AppText>
        <AppText className="text-base text-foreground/70">
          Update the information that appears across your account.
        </AppText>
      </View>

      <Section title="Profile" items={profileFields} />
      <Section items={saveAction} />
    </ScreenScrollView>
  );
}


