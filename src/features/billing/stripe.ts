import {
  initPaymentSheet,
  initStripe,
  presentPaymentSheet,
  type InitPaymentSheetReturnType,
  type PresentPaymentSheetReturnType,
} from '@stripe/stripe-react-native';
import { env, requireEnv } from '../../lib/env';

const defaultMerchantDisplayName = 'ExpoShip SaaS';

let isConfigured = false;

export const configureStripe = async () => {
  if (isConfigured) {
    return;
  }

  const publishableKey = requireEnv(env.stripePublishableKey, 'stripePublishableKey');

  await initStripe({
    publishableKey,
    merchantIdentifier: 'merchant.com.expoship',
    setUrlSchemeOnAndroid: true,
  });

  isConfigured = true;
};

export type PaymentSheetSetup = {
  customerId: string;
  customerEphemeralKeySecret: string;
  paymentIntentClientSecret: string;
  merchantDisplayName?: string;
};

export const initializePaymentSheet = async ({
  customerId,
  customerEphemeralKeySecret,
  paymentIntentClientSecret,
  merchantDisplayName = defaultMerchantDisplayName,
}: PaymentSheetSetup): Promise<InitPaymentSheetReturnType> => {
  await configureStripe();

  return initPaymentSheet({
    customerId,
    customerEphemeralKeySecret,
    paymentIntentClientSecret,
    merchantDisplayName,
    allowsDelayedPaymentMethods: true,
    defaultBillingDetails: {
      email: undefined,
    },
  });
};

export const openPaymentSheet = async (): Promise<PresentPaymentSheetReturnType> => {
  await configureStripe();
  return presentPaymentSheet();
};

