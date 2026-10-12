/**
 * Some embedded viewers (sandboxed iframes, private windows) block
 * localStorage / sessionStorage, and reading them throws. The demo stores its
 * session there, so swap in an in-memory replacement when they are unusable.
 */
const createMemoryStorage = (): Storage => {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => Array.from(items.keys())[index] ?? null,
    removeItem: (key) => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, String(value));
    },
  };
};

for (const name of ["localStorage", "sessionStorage"] as const) {
  try {
    const storage = window[name];
    storage.setItem("__storage_test__", "1");
    storage.removeItem("__storage_test__");
  } catch {
    Object.defineProperty(window, name, {
      value: createMemoryStorage(),
      configurable: true,
    });
  }
}

export {};
