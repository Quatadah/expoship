import { useEffect, useState } from 'react';

const memoryStorage = new Map<string, string>();
const subscribedListeners = new Set<(key: string) => void>();
const trackedKeys = new Set<string>();

export const storageKeys = {
  theme: 'app.theme',
  featureFlags: 'feature.flags',
  cachedProfile: 'profile.cached',
} as const;

const serialize = (value: unknown) => JSON.stringify(value);
const deserialize = <T>(value: string | undefined | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('[Storage] Failed to parse value', error);
    return null;
  }
};

export const storage = {
  setString(key: string, value: string) {
    memoryStorage.set(key, value);
    trackedKeys.add(key);
    writeLocalValue(key, value);
    notify(key);
  },
  getString(key: string) {
    if (memoryStorage.has(key)) {
      return memoryStorage.get(key) ?? null;
    }

    const stored = readLocalValue(key);
    if (stored !== null) {
      memoryStorage.set(key, stored);
      trackedKeys.add(key);
    }
    return stored;
  },
  setBoolean(key: string, value: boolean) {
    this.setString(key, value ? 'true' : 'false');
  },
  getBoolean(key: string) {
    const stored = this.getString(key);
    if (stored === null) {
      return null;
    }

    return stored === 'true';
  },
  setObject<T>(key: string, value: T) {
    this.setString(key, serialize(value));
  },
  getObject<T>(key: string) {
    return deserialize<T>(this.getString(key));
  },
  remove(key: string) {
    memoryStorage.delete(key);
    trackedKeys.delete(key);
    removeLocalValue(key);
    notify(key);
  },
  clearAll() {
    memoryStorage.clear();
    const keys = Array.from(trackedKeys);
    trackedKeys.clear();
    clearLocalValues(keys);
    keys.forEach((key) => notify(key));
  },
  subscribe(listener: (key: string) => void) {
    subscribedListeners.add(listener);
    return () => {
      subscribedListeners.delete(listener);
    };
  },
};

export const useStorageValue = <T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    const stored = storage.getObject<T>(key);
    return stored ?? defaultValue;
  });

  useEffect(() => {
    const unsubscribe = storage.subscribe((changedKey) => {
      if (changedKey === key) {
        const stored = storage.getObject<T>(key);
        setValue(stored ?? defaultValue);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [defaultValue, key]);

  const setStoredValue = (nextValue: T) => {
    storage.setObject(key, nextValue);
    setValue(nextValue);
  };

  return [value, setStoredValue];
};

function notify(key: string) {
  subscribedListeners.forEach((listener) => {
    try {
      listener(key);
    } catch (error) {
      console.warn('[Storage] Listener error', error);
    }
  });
}

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return globalThis.localStorage as Storage;
    }
  } catch (error) {
    console.warn('[Storage] Unable to access localStorage', error);
  }

  return null;
}

function writeLocalValue(key: string, value: string) {
  const local = getLocalStorage();
  if (!local) {
    return;
  }

  try {
    local.setItem(key, value);
  } catch (error) {
    console.warn('[Storage] Failed to persist value', error);
  }
}

function readLocalValue(key: string) {
  const local = getLocalStorage();
  if (!local) {
    return null;
  }

  try {
    return local.getItem(key);
  } catch (error) {
    console.warn('[Storage] Failed to read persisted value', error);
    return null;
  }
}

function removeLocalValue(key: string) {
  const local = getLocalStorage();
  if (!local) {
    return;
  }

  try {
    local.removeItem(key);
  } catch (error) {
    console.warn('[Storage] Failed to remove persisted value', error);
  }
}

function clearLocalValues(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  const local = getLocalStorage();
  if (!local) {
    return;
  }

  keys.forEach((key) => {
    try {
      local.removeItem(key);
    } catch (error) {
      console.warn('[Storage] Failed to clear value', error);
    }
  });
}

