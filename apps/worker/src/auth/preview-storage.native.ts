import Storage from 'expo-sqlite/kv-store';

/** Expo Go storage; uses the same SQLite keys as Expo's localStorage shim. */
export const previewStorage = {
  getItem(key: string) {
    return Storage.getItemSync(key);
  },
  setItem(key: string, value: string) {
    Storage.setItemSync(key, value);
  },
  removeItem(key: string) {
    Storage.removeItemSync(key);
  },
};
