import axios from "axios";
import { store } from "../store/index.js";
import { clearAuth, setAccessToken } from "../store/authSlice.js";

// FIXED: updated API base URL to correct Render backend
const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "https://social-app-5sgz.onrender.com"
).replace(/\/$/, "");

export function buildApiUrl(path = "") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api${normalized}`;
}

const AUTH_LOGIN_URL = buildApiUrl("/auth/login");
const AUTH_REGISTER_URL = buildApiUrl("/auth/register");
const AUTH_REFRESH_URL = buildApiUrl("/auth/refresh");

export const client = axios.create({
  withCredentials: true,
});

let refreshPromise = null;

function attachApiMessage(error) {
  const msg = error.response?.data?.message;
  if (typeof msg === "string" && msg.length > 0) {
    error.message = msg;
  }
  return error;
}

client.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original) {
      return Promise.reject(attachApiMessage(error));
    }
    const url = original.url || "";
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !url.includes(AUTH_LOGIN_URL) &&
      !url.includes(AUTH_REGISTER_URL) &&
      !url.includes(AUTH_REFRESH_URL)
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = client
            .post(AUTH_REFRESH_URL)
            .then((r) => {
              const next = r.data?.data?.accessToken;
              if (next) {
                store.dispatch(setAccessToken(next));
              }
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        if (!store.getState().auth.accessToken) {
          store.dispatch(clearAuth());
          return Promise.reject(attachApiMessage(error));
        }
        return client(original);
      } catch {
        store.dispatch(clearAuth());
        return Promise.reject(attachApiMessage(error));
      }
    }
    return Promise.reject(attachApiMessage(error));
  }
);

export function unwrap(res) {
  const b = res.data;
  if (!b?.success) {
    const err = new Error(b?.message || "Request failed");
    err.errors = b?.errors;
    throw err;
  }
  return b.data;
}
