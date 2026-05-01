import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  likePost,
  commentPost,
  fetchComments,
  deleteComment,
  deletePost,
} from "../api/services/postsService.js";
import { useSelector } from "react-redux";
import { useSocket } from "../hooks/useSocket.js";
import {
  updatePostInFeed,
  bumpCommentCountInFeed,
  removePostFromFeed,
  patchPostQuery,
  bumpCommentCountOnPostQuery,
} from "../utils/feedCache.js";
import { resolveMediaUrl } from "../utils/mediaUrl.js";

// FIXED: improved component structure

export default function PostCard({ post, onDeleted }) {
  const qc = useQueryClient();
  const socket = useSocket();
  const me = useSelector((s) => s.auth.user);
  const [openComments, setOpenComments] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!socket || !post?._id) return undefined;
    const postId = String(post._id);
    socket.emit("watch_post", { postId });
    return () => {
      socket.emit("unwatch_post", { postId });
    };
  }, [socket, post?._id]);

  const likeMut = useMutation({
    mutationFn: () => likePost(post._id),
    onSuccess: (data) => {
      const patch = {
        likeCount: data.likeCount,
        isLiked: data.liked,
      };
      updatePostInFeed(qc, post._id, patch);
      patchPostQuery(qc, post._id, patch);
    },
  });

  const commentMut = useMutation({
    mutationFn: () => commentPost(post._id, draft.trim()),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["comments", post._id] });
      bumpCommentCountInFeed(qc, post._id, 1);
      bumpCommentCountOnPostQuery(qc, post._id, 1);
    },
  });

  const { data: commentsPage } = useQuery({
    queryKey: ["comments", post._id],
    queryFn: () => fetchComments(post._id, 1, 30),
    enabled: openComments,
  });

  const delComment = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", post._id] });
      bumpCommentCountInFeed(qc, post._id, -1);
      bumpCommentCountOnPostQuery(qc, post._id, -1);
    },
  });

  const delPost = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      removePostFromFeed(qc, post._id);
      qc.removeQueries({ queryKey: ["post", post._id] });
      qc.removeQueries({ queryKey: ["comments", post._id] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
      onDeleted?.();
    },
  });

  const author = post.author;
  const isAuthor =
    me && author && String(author._id || author) === String(me._id);

  return (
    <article className="glass-panel-strong rounded-2xl p-5 ring-1 ring-white/40 transition-shadow duration-200 hover:shadow-card hover:ring-brand/15 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lavender-light/80 to-lavender-deep/50 text-sm font-bold text-brand-deep shadow-soft ring-2 ring-white/90 sm:h-12 sm:w-12">
          {(author?.username || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${author?._id}`}
              className="font-semibold text-orbit-ink hover:text-brand hover:underline"
            >
              @{author?.username}
            </Link>
            <span className="text-orbit-muted text-sm">
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })
                : ""}
            </span>
            {isAuthor ? (
              <button
                type="button"
                disabled={delPost.isPending}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm("Delete this post? This cannot be undone.")
                  ) {
                    return;
                  }
                  delPost.mutate();
                }}
                className="ml-auto text-sm text-red-600/90 hover:text-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            ) : null}
          </div>
          {post.content ? (
            <p className="mt-2 text-orbit-ink/90 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          ) : null}
          {post.media?.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
              {post.media.map((m, i) => {
                const src = resolveMediaUrl(m.url);
                if (!src) return null;
                const isVideo = m.resourceType === "video";
                return isVideo ? (
                  <video
                    key={m.url || i}
                    src={src}
                    controls
                    playsInline
                    className="max-h-80 w-full rounded-2xl object-cover shadow-soft ring-1 ring-white/50 sm:max-h-96"
                  />
                ) : (
                  <a
                    key={m.url || i}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl ring-1 ring-white/50 shadow-soft transition hover:ring-brand/30"
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="max-h-96 w-full object-cover"
                    />
                  </a>
                );
              })}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => likeMut.mutate()}
              className={
                post.isLiked
                  ? "rounded-full bg-pink-50 px-3 py-1.5 font-semibold text-pink-600 ring-1 ring-pink-200/80 transition hover:bg-pink-100/80"
                  : "rounded-full px-3 py-1.5 font-medium text-orbit-muted transition hover:bg-white/70 hover:text-pink-600"
              }
            >
              ♥ {post.likeCount ?? post.likes?.length ?? 0}
            </button>
            <button
              type="button"
              onClick={() => setOpenComments((v) => !v)}
              className={`rounded-full px-3 py-1.5 font-medium transition hover:bg-white/70 ${
                openComments
                  ? "bg-lavender-mist/80 text-brand-deep ring-1 ring-lavender-light/60"
                  : "text-orbit-muted hover:text-brand-deep"
              }`}
            >
              💬 {post.commentCount ?? 0}
            </button>
          </div>

          {openComments ? (
            <div className="mt-5 border-t border-white/50 pt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 input-orbit"
                  placeholder="Write a comment…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="button"
                  disabled={!draft.trim() || commentMut.isPending}
                  onClick={() => commentMut.mutate()}
                  className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 shadow-soft"
                >
                  Post
                </button>
              </div>
              <ul className="space-y-2">
                {(commentsPage?.items || []).map((c) => (
                  <li
                    key={c._id}
                    className="text-sm flex justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-orbit-ink">
                        @{c.author?.username}
                      </span>{" "}
                      <span className="text-orbit-muted">
                        {c.content}
                      </span>
                    </div>
                    {me && String(c.author?._id) === String(me._id) ? (
                      <button
                        type="button"
                        className="text-orbit-muted hover:text-red-600"
                        onClick={() => delComment.mutate(c._id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
