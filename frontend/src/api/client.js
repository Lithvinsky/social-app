import axios from "axios";
import { store } from "../store/index.js";
import { clearAuth, setAccessToken } from "../store/authSlice.js";

const baseURL =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "/api";

export const client = axios.create({
  baseURL,
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
      !url.includes("/auth/login") &&
      !url.includes("/auth/register") &&
      !url.includes("/auth/refresh")
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = client
            .post("/auth/refresh")
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
