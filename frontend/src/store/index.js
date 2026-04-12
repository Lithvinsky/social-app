import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer, { setAuth } from "./authSlice.js";
import { getPersistStorage } from "./persistStorage.js";

/** Zustand used this key before Redux; may still hold a valid session. */
const LEGACY_ZUSTAND_KEY = "social-auth";

const authPersistConfig = {
  key: "social-auth",
  storage: getPersistStorage(),
  whitelist: ["accessToken", "user"],
};

const persistedAuth = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuth,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ["auth._persist"],
      },
    }),
});

/** Created once; used by `PersistGate` in `main.jsx`. */
export const persistor = persistStore(store);

/**
 * After redux-persist rehydrates, pull session from legacy Zustand storage if the
 * user still has no access token. (Do not skip just because `persist:social-auth`
 * exists — that key can be present with empty auth after a bad migration.)
 */
export function hydrateAuthFromLegacyStorage() {
  if (typeof localStorage === "undefined") return;
  try {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      localStorage.removeItem(LEGACY_ZUSTAND_KEY);
      return;
    }
    const raw = localStorage.getItem(LEGACY_ZUSTAND_KEY);
    if (!raw) return;
    const st = JSON.parse(raw)?.state;
    if (!st?.accessToken) return;
    store.dispatch(
      setAuth({
        user: st.user ?? null,
        accessToken: st.accessToken,
      })
    );
    localStorage.removeItem(LEGACY_ZUSTAND_KEY);
  } catch {
    /* ignore corrupt storage */
  }
}
