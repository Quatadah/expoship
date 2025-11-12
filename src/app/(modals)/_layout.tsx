import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="paywall"
        options={{
          title: 'Upgrade',
        }}
      />
    </Stack>
  );
}

