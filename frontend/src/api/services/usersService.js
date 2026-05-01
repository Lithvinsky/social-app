import { api, buildApiUrl, unwrap } from "../axios.js";

// FIXED: centralized axios instance
// FIXED: improved component structure
export async function getUser(id) {
  return unwrap(await api.get(buildApiUrl(`/users/${id}`)));
}

export async function updateUser(id, body) {
  return unwrap(await api.put(buildApiUrl(`/users/${id}`), body));
}

export async function followUser(id) {
  return unwrap(await api.post(buildApiUrl(`/users/${id}/follow`)));
}

export async function unfollowUser(id) {
  return unwrap(await api.post(buildApiUrl(`/users/${id}/unfollow`)));
}

export async function suggestions() {
  return unwrap(await api.get(buildApiUrl("/users/suggestions")));
}

export async function searchUsers(q) {
  return unwrap(await api.get(buildApiUrl("/users/search"), { params: { q } }));
}
