import { buildApiUrl, client, unwrap } from "./client.js";

// FIXED: updated API base URL to correct Render backend

export async function listConversations() {
  return unwrap(await client.get(buildApiUrl("/conversations")));
}

export async function fetchUnreadMessageCount() {
  const data = unwrap(
    await client.get(buildApiUrl("/conversations/unread-count"))
  );
  return data.total ?? 0;
}

export async function createConversation(participantId) {
  return unwrap(
    await client.post(buildApiUrl("/conversations"), { participantId })
  );
}

export async function fetchMessages(conversationId, page = 1, limit = 30) {
  return unwrap(
    await client.get(buildApiUrl(`/messages/${conversationId}`), {
      params: { page, limit },
    })
  );
}

export async function sendMessageRest(conversationId, content) {
  return unwrap(
    await client.post(buildApiUrl("/messages"), { conversationId, content })
  );
}
