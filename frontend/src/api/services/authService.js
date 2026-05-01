import { api, buildApiUrl, unwrap } from "../axios.js";

// FIXED: refactored login logic
// FIXED: removed hardcoded URL
export async function login(body) {
  return unwrap(await api.post(buildApiUrl("/auth/login"), body));
}

export async function register(body) {
  return unwrap(await api.post(buildApiUrl("/auth/register"), body));
}

export async function logoutApi() {
  try {
    await api.post(buildApiUrl("/auth/logout"));
  } catch {
    /* ignore offline logout */
  }
}
