import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fetchNotificationUnreadCount } from "../api/notifications.js";
import { fetchUnreadMessageCount } from "../api/chat.js";

export function useUnreadCounts() {
  const accessToken = useSelector((s) => s.auth.accessToken);

  const { data: alertsUnread = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchNotificationUnreadCount,
    enabled: Boolean(accessToken),
    staleTime: 15_000,
    refetchInterval: 90_000,
  });

  const { data: messagesUnread = 0 } = useQuery({
    queryKey: ["conversations", "unread-total"],
    queryFn: fetchUnreadMessageCount,
    enabled: Boolean(accessToken),
    staleTime: 15_000,
    refetchInterval: 60_000,
  });

  return { alertsUnread, messagesUnread };
}
