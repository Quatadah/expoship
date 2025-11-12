import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { env, requireEnv } from './env';

const secureStorageAvailable = Platform.OS !== 'web';
const memoryStorage = new Map<string, string>();

const secureSetItem = async (key: string, value: string) => {
  if (!secureStorageAvailable) {
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.warn('[SupabaseAuthStorage] Failed to persist into SecureStore', error);
  }
};

const secureGetItem = async (key: string) => {
  if (!secureStorageAvailable) {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn('[SupabaseAuthStorage] Failed to read from SecureStore', error);
    return null;
  }
};

const secureRemoveItem = async (key: string) => {
  if (!secureStorageAvailable) {
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn('[SupabaseAuthStorage] Failed to delete from SecureStore', error);
  }
};

const supabaseStorage = {
  getItem: async (key: string) => {
    if (memoryStorage.has(key)) {
      return memoryStorage.get(key) ?? null;
    }

    const secureValue = await secureGetItem(key);
    if (secureValue) {
      memoryStorage.set(key, secureValue);
    }

    return secureValue ?? null;
  },
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
    await secureSetItem(key, value);
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
    await secureRemoveItem(key);
  },
};

const supabaseUrl = requireEnv(env.supabaseUrl, 'supabaseUrl');
const supabaseAnonKey = requireEnv(env.supabaseAnonKey, 'supabaseAnonKey');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'expoship-saas',
    },
  },
});

export type SupabaseClient = typeof supabase;

