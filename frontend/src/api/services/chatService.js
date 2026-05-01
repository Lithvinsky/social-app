import { api, buildApiUrl, unwrap } from "../axios.js";

// FIXED: centralized axios instance
// FIXED: updated API URL
export async function listConversations() {
  return unwrap(await api.get(buildApiUrl("/conversations")));
}

export async function fetchUnreadMessageCount() {
  const data = unwrap(await api.get(buildApiUrl("/conversations/unread-count")));
  return data.total ?? 0;
}

export async function createConversation(participantId) {
  return unwrap(await api.post(buildApiUrl("/conversations"), { participantId }));
}

export async function fetchMessages(conversationId, page = 1, limit = 30) {
  return unwrap(
    await api.get(buildApiUrl(`/messages/${conversationId}`), {
      params: { page, limit },
    })
  );
}

export async function sendMessageRest(conversationId, content) {
  return unwrap(await api.post(buildApiUrl("/messages"), { conversationId, content }));
}
