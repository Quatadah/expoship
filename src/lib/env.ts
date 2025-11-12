import Constants from 'expo-constants';

type ExpoExtra = Record<string, string | undefined> | undefined;

const getExpoExtra = (): ExpoExtra => {
  if (Constants.expoConfig?.extra) {
    return Constants.expoConfig.extra as ExpoExtra;
  }

  // @ts-expect-error manifest is deprecated but might still contain extra during development
  if (Constants.manifest?.extra) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Constants.manifest.extra;
  }

  return undefined;
};

const extra = getExpoExtra() ?? {};

const toPublicEnvKey = (key: string) =>
  `EXPO_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;

const readEnvValue = (key: string) =>
  extra[key] ?? process.env[toPublicEnvKey(key)];

export const env = {
  supabaseUrl: readEnvValue('supabaseUrl') ?? '',
  supabaseAnonKey: readEnvValue('supabaseAnonKey') ?? '',
  googleClientId: readEnvValue('googleClientId') ?? '',
  appleServiceId: readEnvValue('appleServiceId') ?? '',
  deepLinkScheme: readEnvValue('deepLinkScheme') ?? 'expoship',
  revenuecatApiKey: readEnvValue('revenuecatApiKey') ?? '',
  revenuecatEntitlementId: readEnvValue('revenuecatEntitlementId') ?? 'pro',
  stripePublishableKey: readEnvValue('stripePublishableKey') ?? '',
  openAiApiKey: readEnvValue('openAiApiKey') ?? '',
  openAiBaseUrl: readEnvValue('openAiBaseUrl') ?? 'https://api.openai.com/v1',
};

export const requireEnv = (value: string, key: keyof typeof env) => {
  if (!value) {
    throw new Error(
      `Missing environment variable for ${key}. Ensure it is defined in app config or environment.`
    );
  }

  return value;
};

