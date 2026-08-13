let nativeAsyncStorage = null;
try {
  // try to require native async storage (works on RN)
  // eslint-disable-next-line global-require
  nativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  nativeAsyncStorage = null;
}

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const Storage = {
  async getItem(key) {
    if (isWeb) {
      return Promise.resolve(localStorage.getItem(key));
    }
    if (nativeAsyncStorage) return nativeAsyncStorage.getItem(key);
    return Promise.resolve(null);
  },
  async setItem(key, value) {
    if (isWeb) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    if (nativeAsyncStorage) return nativeAsyncStorage.setItem(key, value);
    return Promise.resolve();
  },
  async removeItem(key) {
    if (isWeb) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    if (nativeAsyncStorage) return nativeAsyncStorage.removeItem(key);
    return Promise.resolve();
  }
};

export default Storage;
