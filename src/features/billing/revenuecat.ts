import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesConfiguration } from 'react-native-purchases';
import { env, requireEnv } from '../../lib/env';

let isConfigured = false;

const getConfiguration = (appUserID?: string | null): PurchasesConfiguration => {
  const apiKey = requireEnv(env.revenuecatApiKey, 'revenuecatApiKey');
  return {
    apiKey,
    appUserID: appUserID ?? null,
  };
};

export const configureRevenueCat = async (appUserID?: string | null) => {
  if (isConfigured) {
    if (appUserID) {
      await Purchases.logIn(appUserID);
    }
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure(getConfiguration(appUserID));
  isConfigured = true;
};

export const identifyRevenueCatUser = async (appUserID: string) => {
  if (!isConfigured) {
    await configureRevenueCat(appUserID);
    return;
  }

  await Purchases.logIn(appUserID);
};

export const logoutRevenueCatUser = async () => {
  if (!isConfigured) {
    return;
  }

  try {
    await Purchases.logOut();
  } catch (error) {
    console.warn('[RevenueCat] Failed to log out', error);
  }
};

export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isConfigured) {
    await configureRevenueCat();
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.warn('[RevenueCat] Failed to fetch customer info', error);
    return null;
  }
};

export const fetchOfferings = async () => {
  if (!isConfigured) {
    await configureRevenueCat();
  }

  try {
    return await Purchases.getOfferings();
  } catch (error) {
    console.warn('[RevenueCat] Failed to load offerings', error);
    return null;
  }
};

export const purchasePackage = async (pkg: { identifier: string }) => {
  const offerings = await fetchOfferings();
  const packageToPurchase = offerings?.current?.availablePackages.find(
    (availablePackage) => availablePackage.identifier === pkg.identifier
  );

  if (!packageToPurchase) {
    throw new Error(`Package ${pkg.identifier} not available for purchase`);
  }

  return Purchases.purchasePackage(packageToPurchase);
};

export const restorePurchases = async () => {
  if (!isConfigured) {
    await configureRevenueCat();
  }

  return Purchases.restorePurchases();
};

export const getActiveEntitlements = (customerInfo: CustomerInfo | null) => {
  if (!customerInfo) {
    return [];
  }

  return Object.keys(customerInfo.entitlements.active);
};

export const hasEntitlement = (
  customerInfo: CustomerInfo | null,
  entitlementId: string
) => {
  if (!customerInfo) {
    return false;
  }

  return Boolean(customerInfo.entitlements.active[entitlementId]);
};

