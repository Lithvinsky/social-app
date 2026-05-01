import { buildApiUrl, client, unwrap } from "./client.js";

// FIXED: updated API base URL to correct Render backend

export async function getUser(id) {
  return unwrap(await client.get(buildApiUrl(`/users/${id}`)));
}

export async function updateUser(id, body) {
  return unwrap(await client.put(buildApiUrl(`/users/${id}`), body));
}

export async function followUser(id) {
  return unwrap(await client.post(buildApiUrl(`/users/${id}/follow`)));
}

export async function unfollowUser(id) {
  return unwrap(await client.post(buildApiUrl(`/users/${id}/unfollow`)));
}

export async function suggestions() {
  return unwrap(await client.get(buildApiUrl("/users/suggestions")));
}

export async function searchUsers(q) {
  return unwrap(
    await client.get(buildApiUrl("/users/search"), { params: { q: q.trim() } })
  );
}
