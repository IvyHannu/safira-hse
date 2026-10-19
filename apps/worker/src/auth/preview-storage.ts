/** Browser storage for the local Worker preview. */
export const previewStorage = {
  getItem(key: string) {
    return globalThis.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    globalThis.localStorage.setItem(key, value);
  },
  removeItem(key: string) {
    globalThis.localStorage.removeItem(key);
  },
};
