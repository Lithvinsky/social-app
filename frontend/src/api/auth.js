import { client, unwrap } from "./client.js";

export async function login(body) {
  const data = unwrap(await client.post("/auth/login", body));
  return data;
}

export async function register(body) {
  const data = unwrap(await client.post("/auth/register", body));
  return data;
}

export async function logoutApi() {
  try {
    unwrap(await client.post("/auth/logout"));
  } catch {
    /* offline */
  }
}
