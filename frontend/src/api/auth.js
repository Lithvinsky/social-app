import { buildApiUrl, client, unwrap } from "./client.js";

// FIXED: updated API base URL to correct Render backend

export async function login(body) {
  const data = unwrap(await client.post(buildApiUrl("/auth/login"), body));
  return data;
}

export async function register(body) {
  const data = unwrap(await client.post(buildApiUrl("/auth/register"), body));
  return data;
}

export async function logoutApi() {
  try {
    unwrap(await client.post(buildApiUrl("/auth/logout")));
  } catch {
    /* offline */
  }
}
