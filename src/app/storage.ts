/* Device-local settings only (F13). Every read and write is wrapped, so the app still works when
   storage is blocked or full. Nothing here ever leaves the browser. */

const PREFIX = 'pakkadsa:';

export type StoreKey =
  'learned' | 'last' | 'lang' | 'theme' | 'speed' | 'anim' | 'codeLang' | 'install';

export const store = {
  get<T>(key: StoreKey, fallback: T): T {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: StoreKey, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable: settings last for this page only */
    }
  },
};
