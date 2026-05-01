import { buildApiUrl, client, unwrap } from "./client.js";

// FIXED: updated API base URL to correct Render backend

export async function createPost(body) {
  return unwrap(await client.post(buildApiUrl("/posts"), body));
}

export async function fetchFeed({ pageParam = 1, limit = 10 }) {
  return unwrap(
    await client.get(buildApiUrl("/posts/feed"), {
      params: { page: pageParam, limit },
    })
  );
}

export async function getPost(id) {
  return unwrap(await client.get(buildApiUrl(`/posts/${id}`)));
}

export async function deletePost(id) {
  return unwrap(await client.delete(buildApiUrl(`/posts/${id}`)));
}

export async function likePost(id) {
  return unwrap(await client.post(buildApiUrl(`/posts/${id}/like`)));
}

export async function commentPost(id, content) {
  return unwrap(
    await client.post(buildApiUrl(`/posts/${id}/comment`), { content })
  );
}

export async function fetchComments(id, page = 1, limit = 20) {
  return unwrap(
    await client.get(buildApiUrl(`/posts/${id}/comments`), {
      params: { page, limit },
    })
  );
}

export async function deleteComment(commentId) {
  return unwrap(await client.delete(buildApiUrl(`/comments/${commentId}`)));
}
