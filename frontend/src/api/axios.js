import axios from "axios";
import { store } from "../store/index.js";
import { clearAuth, setAccessToken } from "../store/authSlice.js";
import { resolveApiOrigin } from "../utils/apiOrigin.js";

const API_ORIGIN = resolveApiOrigin();

export function buildApiUrl(path = "") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api${normalized}`;
}

const AUTH_LOGIN_URL = buildApiUrl("/auth/login");
const AUTH_REGISTER_URL = buildApiUrl("/auth/register");
const AUTH_REFRESH_URL = buildApiUrl("/auth/refresh");

export const api = axios.create({
  withCredentials: true,
});

let refreshPromise = null;

function normalizeApiError(error) {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    error.message = message;
  }
  return error;
}

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original) {
      return Promise.reject(normalizeApiError(error));
    }
    const url = String(original.url || "");
    const shouldRefresh =
      error.response?.status === 401 &&
      !original._retry &&
      !url.includes(AUTH_LOGIN_URL) &&
      !url.includes(AUTH_REGISTER_URL) &&
      !url.includes(AUTH_REFRESH_URL);

    if (!shouldRefresh) {
      return Promise.reject(normalizeApiError(error));
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post(AUTH_REFRESH_URL)
          .then((res) => {
            const nextToken = res.data?.data?.accessToken;
            if (nextToken) {
              store.dispatch(setAccessToken(nextToken));
            }
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      if (!store.getState().auth.accessToken) {
        store.dispatch(clearAuth());
        return Promise.reject(normalizeApiError(error));
      }
      return api(original);
    } catch {
      store.dispatch(clearAuth());
      return Promise.reject(normalizeApiError(error));
    }
  }
);

export function unwrap(response) {
  const payload = response.data;
  if (!payload?.success) {
    const err = new Error(payload?.message || "Request failed");
    err.errors = payload?.errors;
    throw err;
  }
  return payload.data;
}
