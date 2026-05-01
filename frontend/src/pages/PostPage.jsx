import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "../api/services/postsService.js";

// FIXED: centralized axios instance
import PostCard from "../components/PostCard.jsx";

export default function PostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, status } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
  });

  if (status === "pending") {
    return <p className="text-orbit-muted">Loading…</p>;
  }
  if (status === "error" || !data) {
    return <p className="text-red-600">Post not found</p>;
  }

  return (
    <div>
      <Link
        to="/"
        className="text-sm font-medium text-brand hover:text-brand-hover mb-4 inline-flex items-center gap-1"
      >
        ← Back to feed
      </Link>
      <PostCard post={data} onDeleted={() => navigate("/")} />
    </div>
  );
}
