import defaultWebStorage from "redux-persist/lib/storage";

const noopStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

/** Avoid crashing when localStorage is blocked (private mode, denied cookies, quota). */
export function getPersistStorage() {
  if (typeof localStorage === "undefined") {
    return noopStorage;
  }
  try {
    const k = "__orbit_persist_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return defaultWebStorage;
  } catch {
    return noopStorage;
  }
}
