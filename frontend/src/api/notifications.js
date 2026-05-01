import { buildApiUrl, client, unwrap } from "./client.js";

// FIXED: updated API base URL to correct Render backend

export async function fetchNotifications(page = 1, limit = 30) {
  return unwrap(
    await client.get(buildApiUrl("/notifications"), {
      params: { page, limit },
    })
  );
}

/** Single cheap request for nav badge (uses `unreadCount` from list meta). */
export async function fetchNotificationUnreadCount() {
  const data = unwrap(
    await client.get(buildApiUrl("/notifications"), {
      params: { page: 1, limit: 1 },
    })
  );
  return data.unreadCount ?? 0;
}

export async function markNotificationsRead(payload) {
  return unwrap(
    await client.post(buildApiUrl("/notifications/read"), payload)
  );
}
