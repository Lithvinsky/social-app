import { api, buildApiUrl, unwrap } from "../axios.js";

// FIXED: centralized axios instance
// FIXED: updated API URL
export async function fetchNotifications(page = 1, limit = 30) {
  return unwrap(
    await api.get(buildApiUrl("/notifications"), {
      params: { page, limit },
    })
  );
}

export async function fetchNotificationUnreadCount() {
  const data = unwrap(
    await api.get(buildApiUrl("/notifications"), {
      params: { page: 1, limit: 1 },
    })
  );
  return data.unreadCount ?? 0;
}

export async function markNotificationsRead(payload) {
  return unwrap(await api.post(buildApiUrl("/notifications/read"), payload));
}
