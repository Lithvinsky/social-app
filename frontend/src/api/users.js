import { client, unwrap } from "./client.js";

export async function getUser(id) {
  return unwrap(await client.get(`/users/${id}`));
}

export async function updateUser(id, body) {
  return unwrap(await client.put(`/users/${id}`, body));
}

export async function followUser(id) {
  return unwrap(await client.post(`/users/${id}/follow`));
}

export async function unfollowUser(id) {
  return unwrap(await client.post(`/users/${id}/unfollow`));
}

export async function suggestions() {
  return unwrap(await client.get("/users/suggestions"));
}

export async function searchUsers(q) {
  return unwrap(
    await client.get("/users/search", { params: { q: q.trim() } })
  );
}
