const feedKey = ["feed"];

function totalLoaded(pages) {
  return pages.reduce((n, p) => n + (p.items?.length ?? 0), 0);
}

/** Shape returned by POST /posts and feed:update (post_created). */
export function mergeCreatedPostIntoFeed(qc, post) {
  if (!post?._id) return;
  const id = String(post._id);
  qc.setQueryData(feedKey, (old) => {
    if (!old?.pages?.length) {
      return {
        pageParams: [1],
        pages: [
          {
            items: [post],
            page: 1,
            limit: 10,
            total: 1,
            hasMore: false,
          },
        ],
      };
    }
    const pages = old.pages.map((page) => ({
      ...page,
      items: (page.items ?? []).filter((p) => String(p._id) !== id),
    }));
    const [first, ...rest] = pages;
    if (!first) return old;
    const total =
      typeof first.total === "number" ? first.total + 1 : first.total;
    const newFirst = {
      ...first,
      items: [post, ...(first.items ?? [])],
      total,
    };
    const newPages = [newFirst, ...rest];
    const loaded = totalLoaded(newPages);
    const li = newPages.length - 1;
    if (li >= 0 && typeof total === "number") {
      newPages[li] = {
        ...newPages[li],
        hasMore: loaded < total,
      };
    }
    return { ...old, pages: newPages };
  });
}

export function removePostFromFeed(qc, postId) {
  const id = String(postId);
  qc.setQueryData(feedKey, (old) => {
    if (!old?.pages?.length) return old;
    let found = false;
    const pages = old.pages.map((page) => ({
      ...page,
      items: (page.items ?? []).filter((p) => {
        if (String(p._id) === id) {
          found = true;
          return false;
        }
        return true;
      }),
    }));
    if (!found) return old;
    const first = old.pages[0];
    const total =
      typeof first.total === "number" ? Math.max(0, first.total - 1) : first.total;
    const newPages = pages.map((p) => ({ ...p, total }));
    const loaded = totalLoaded(newPages);
    const li = newPages.length - 1;
    if (li >= 0 && typeof total === "number") {
      newPages[li] = {
        ...newPages[li],
        hasMore: loaded < total,
      };
    }
    return { ...old, pages: newPages };
  });
}

export function updatePostInFeed(qc, postId, updates) {
  const id = String(postId);
  qc.setQueryData(feedKey, (old) => {
    if (!old?.pages?.length) return old;
    let changed = false;
    const pages = old.pages.map((page) => ({
      ...page,
      items: (page.items ?? []).map((p) => {
        if (String(p._id) !== id) return p;
        changed = true;
        return { ...p, ...updates };
      }),
    }));
    return changed ? { ...old, pages } : old;
  });
}

/** For comment delta when we don't have full post from API. */
export function bumpCommentCountInFeed(qc, postId, delta) {
  const id = String(postId);
  qc.setQueryData(feedKey, (old) => {
    if (!old?.pages?.length) return old;
    let changed = false;
    const pages = old.pages.map((page) => ({
      ...page,
      items: (page.items ?? []).map((p) => {
        if (String(p._id) !== id) return p;
        changed = true;
        const n = (p.commentCount ?? 0) + delta;
        return { ...p, commentCount: Math.max(0, n) };
      }),
    }));
    return changed ? { ...old, pages } : old;
  });
}

/** Single-post page query (React Query key ["post", id]). */
export function patchPostQuery(qc, postId, updates) {
  const id = String(postId);
  qc.setQueryData(["post", id], (old) =>
    old && typeof old === "object" ? { ...old, ...updates } : old
  );
}

export function bumpCommentCountOnPostQuery(qc, postId, delta) {
  const id = String(postId);
  qc.setQueryData(["post", id], (old) => {
    if (!old || typeof old !== "object") return old;
    const n = Math.max(0, (old.commentCount ?? 0) + delta);
    return { ...old, commentCount: n };
  });
}
