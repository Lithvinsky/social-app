import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  fetchMessages,
  listConversations,
  sendMessageRest,
} from "../api/chat.js";
import { useSocket } from "../hooks/useSocket.js";
import { useSelector } from "react-redux";

export default function ChatThread() {
  const { conversationId } = useParams();
  const qc = useQueryClient();
  const me = useSelector((s) => s.auth.user);
  const socket = useSocket();
  const bottomRef = useRef(null);
  const [text, setText] = useState("");
  const [typingFrom, setTypingFrom] = useState(null);
  const typingTimeout = useRef(null);

  const { data: convs } = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    enabled: Boolean(conversationId),
  });

  const other = useMemo(() => {
    const c = convs?.find((x) => String(x._id) === String(conversationId));
    if (!c) return null;
    return (
      c.otherUser ||
      c.participants?.find((p) => String(p._id) !== String(me?._id)) ||
      null
    );
  }, [convs, conversationId, me?._id]);

  const {
    data,
    status: msgStatus,
    error: msgError,
    refetch,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId, 1, 50),
    enabled: Boolean(conversationId),
  });

  const sendRestMut = useMutation({
    mutationFn: (content) => sendMessageRest(conversationId, content),
    onSuccess: (msg) => {
      setText("");
      qc.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        const exists = old.items?.some(
          (m) => String(m._id) === String(msg._id),
        );
        if (exists) return old;
        return { ...old, items: [...(old.items || []), msg] };
      });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["conversations", "unread-total"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.items?.length, msgStatus]);

  useEffect(() => {
    if (!socket || !conversationId) return undefined;
    socket.emit("join_conversation", { conversationId }, (res) => {
      if (res?.ok) {
        qc.invalidateQueries({ queryKey: ["conversations", "unread-total"] });
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
        qc.invalidateQueries({ queryKey: ["notifications"] });
      }
    });

    function onMsg(msg) {
      if (String(msg.conversation) !== String(conversationId)) return;
      qc.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        const exists = old.items?.some(
          (m) => String(m._id) === String(msg._id),
        );
        if (exists) return old;
        return { ...old, items: [...(old.items || []), msg] };
      });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
    }

    function onTyping({ conversationId: cid, userId, isTyping }) {
      if (String(cid) !== String(conversationId)) return;
      if (String(userId) === String(me?._id)) return;
      setTypingFrom(isTyping ? userId : null);
    }

    socket.on("receive_message", onMsg);
    socket.on("typing", onTyping);
    return () => {
      socket.emit("typing", { conversationId, isTyping: false });
      socket.emit("leave_conversation", { conversationId });
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
      }
      socket.off("receive_message", onMsg);
      socket.off("typing", onTyping);
    };
  }, [socket, conversationId, qc, me?._id]);

  function send() {
    const content = text.trim();
    if (!content || !conversationId) return;
    if (socket) {
      socket.emit(
        "send_message",
        { conversationId, content },
        (res) => {
          socket.emit("typing", { conversationId, isTyping: false });
          if (res?.ok && res.message) {
            setText("");
            qc.setQueryData(["messages", conversationId], (old) => {
              if (!old) return old;
              const exists = old.items?.some(
                (m) => String(m._id) === String(res.message._id),
              );
              if (exists) return old;
              return { ...old, items: [...(old.items || []), res.message] };
            });
            qc.invalidateQueries({ queryKey: ["conversations"] });
            qc.invalidateQueries({
              queryKey: ["conversations", "unread-total"],
            });
          }
        },
      );
      return;
    }
    sendRestMut.mutate(content);
  }

  function onInputChange(v) {
    setText(v);
    if (!socket) return;
    socket.emit("typing", { conversationId, isTyping: true });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { conversationId, isTyping: false });
    }, 1200);
  }

  const items = data?.items || [];
  const sending = sendRestMut.isPending;
  const notFound =
    msgError?.response?.status === 404 ||
    msgError?.response?.status === 403;
  const otherLabel = other?.username ? `@${other.username}` : "Chat";

  if (!conversationId) {
    return null;
  }

  if (msgStatus === "pending") {
    return (
      <div className="flex min-h-[min(52vh,420px)] flex-col">
        <div className="border-b border-white/50 px-4 py-3 sm:px-5">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-lavender-mist/70" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}
            >
              <div
                className="h-11 max-w-[70%] animate-pulse rounded-[1.25rem] bg-lavender-mist/60"
                style={{ width: `${40 + (i % 3) * 12}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (msgStatus === "error") {
    return (
      <div className="flex min-h-[min(52vh,420px)] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold text-orbit-ink">
          {notFound ? "This conversation is unavailable." : "Could not load messages."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to="/chat"
            className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-orbit hover:bg-brand-hover"
          >
            All messages
          </Link>
          {!notFound ? (
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-deep ring-1 ring-lavender-light/50 hover:bg-white"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/50 bg-lavender-mist/25 px-3 py-3 backdrop-blur-sm sm:px-5">
        <Link
          to="/chat"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-lg text-brand-deep shadow-soft ring-1 ring-lavender-light/40 transition hover:bg-white md:hidden"
          aria-label="Back to conversations"
        >
          ←
        </Link>
        {other?._id ? (
          <Link
            to={`/profile/${other._id}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-1 pr-2 transition hover:bg-white/50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lavender-light/80 to-lavender-deep/50 text-sm font-bold text-brand-deep shadow-soft ring-2 ring-white/90">
              {(other.username || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate font-semibold text-orbit-ink">
                {otherLabel}
              </div>
              <div className="text-xs text-orbit-muted">View profile</div>
            </div>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lavender-mist/80 text-sm font-bold text-orbit-muted ring-2 ring-white/80">
              …
            </div>
            <div className="truncate font-semibold text-orbit-ink">
              {otherLabel}
            </div>
          </div>
        )}
      </header>

      {me && !socket ? (
        <p className="shrink-0 border-b border-amber-200/60 bg-amber-50/90 px-4 py-2 text-center text-xs font-medium text-amber-900">
          Connecting to live chat… You can still send messages; they may send a
          little slower until the connection is ready.
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 sm:p-5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-orbit-muted">
            No messages yet. Say hello below.
          </p>
        ) : null}
        {items.map((m) => {
          const mine = String(m.sender?._id) === String(me?._id);
          const t = m.createdAt ? new Date(m.createdAt) : null;
          return (
            <div
              key={m._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[1.25rem] px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
                  mine
                    ? "bg-gradient-to-br from-brand to-brand-hover text-white shadow-orbit"
                    : "border border-white/80 bg-white/92 text-orbit-ink shadow-soft"
                }`}
              >
                {!mine ? (
                  <div className="mb-0.5 text-[10px] font-medium text-orbit-muted">
                    @{m.sender?.username}
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                {t ? (
                  <div
                    className={`mt-1.5 text-[10px] tabular-nums ${
                      mine ? "text-white/75" : "text-orbit-muted"
                    }`}
                  >
                    {formatDistanceToNow(t, { addSuffix: true })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        {typingFrom ? (
          <p className="text-xs italic text-orbit-muted">
            {other?.username
              ? `@${other.username} is typing…`
              : "Typing…"}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/50 bg-lavender-mist/35 p-3 backdrop-blur-sm sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            className="input-orbit min-h-[44px] flex-1 resize-y py-2.5 sm:min-h-[48px]"
            placeholder="Message… (Shift+Enter for new line)"
            rows={2}
            value={text}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!sending) send();
              }
            }}
            disabled={sending}
          />
          <button
            type="button"
            disabled={sending || !text.trim()}
            onClick={send}
            className="shrink-0 rounded-2xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-orbit transition hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50 sm:mb-0.5"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
        {sendRestMut.isError ? (
          <p className="mt-2 text-xs font-medium text-red-700">
            {sendRestMut.error?.message || "Could not send. Try again."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
