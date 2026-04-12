import { client, unwrap } from "./client.js";

export async function listConversations() {
  return unwrap(await client.get("/conversations"));
}

export async function fetchUnreadMessageCount() {
  const data = unwrap(await client.get("/conversations/unread-count"));
  return data.total ?? 0;
}

export async function createConversation(participantId) {
  return unwrap(
    await client.post("/conversations", { participantId })
  );
}

export async function fetchMessages(conversationId, page = 1, limit = 30) {
  return unwrap(
    await client.get(`/messages/${conversationId}`, {
      params: { page, limit },
    })
  );
}

export async function sendMessageRest(conversationId, content) {
  return unwrap(
    await client.post("/messages", { conversationId, content })
  );
}
