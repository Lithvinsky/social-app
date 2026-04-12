import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/posts.js";
import { mergeCreatedPostIntoFeed } from "../utils/feedCache.js";

export default function CreatePost() {
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      return createPost({ content: content.trim() });
    },
    onSuccess: (data) => {
      setContent("");
      mergeCreatedPostIntoFeed(qc, data);
    },
  });

  return (
    <div
      id="create-post"
      className="overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/85 shadow-orbit ring-1 ring-brand/10 backdrop-blur-xl"
    >
      <div
        className="h-1 w-full bg-gradient-to-r from-lavender-light via-brand-muted to-brand"
        aria-hidden
      />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-orbit-ink">
            Create a post
          </h2>
          <span className="text-xs font-medium text-orbit-muted">Text only</span>
        </div>
        <textarea
          className="w-full rounded-2xl border-2 border-brand/15 bg-white/95 px-4 py-3.5 text-sm text-orbit-ink shadow-inner shadow-lavender-mist/30 placeholder:text-orbit-muted/65 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12 min-h-[108px] resize-y"
          placeholder="What’s on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={mut.isPending || !content.trim()}
            onClick={() => mut.mutate()}
            className="rounded-2xl bg-gradient-to-r from-brand to-brand-hover px-6 py-2.5 text-sm font-semibold text-white shadow-orbit transition hover:opacity-[0.97] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {mut.isPending ? "Posting…" : "Post"}
          </button>
        </div>
        {mut.isError ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-800">
            {mut.error?.message || "Could not create post"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
