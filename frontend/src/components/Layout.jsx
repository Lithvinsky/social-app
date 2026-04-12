import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { useSocket } from "../hooks/useSocket.js";
import {
  mergeCreatedPostIntoFeed,
  removePostFromFeed,
  updatePostInFeed,
  bumpCommentCountInFeed,
  patchPostQuery,
  bumpCommentCountOnPostQuery,
} from "../utils/feedCache.js";

export default function Layout() {
  const socket = useSocket();
  const qc = useQueryClient();
  const token = useSelector((s) => s.auth.accessToken);
  const me = useSelector((s) => s.auth.user);
  const showAppChrome = Boolean(token);

  useEffect(() => {
    if (!socket || !token) return undefined;
    const onNotif = () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
      qc.invalidateQueries({ queryKey: ["conversations", "unread-total"] });
    };
    const onMsg = () => {
      qc.invalidateQueries({ queryKey: ["conversations", "unread-total"] });
    };
    const onFeedUpdate = (payload) => {
      const pid = payload?.postId;
      switch (payload?.kind) {
        case "post_created":
          if (payload.post) mergeCreatedPostIntoFeed(qc, payload.post);
          break;
        case "post_deleted":
          if (pid) {
            removePostFromFeed(qc, pid);
            qc.removeQueries({ queryKey: ["post", pid] });
            qc.removeQueries({ queryKey: ["comments", pid] });
          }
          break;
        case "post_updated":
          if (pid != null && payload.likeCount != null) {
            updatePostInFeed(qc, pid, { likeCount: payload.likeCount });
            patchPostQuery(qc, pid, { likeCount: payload.likeCount });
          }
          break;
        default:
          qc.invalidateQueries({ queryKey: ["feed"] });
      }
    };
    const onPostUpdate = (payload) => {
      const pid = payload?.postId;
      if (!pid) return;
      switch (payload.kind) {
        case "post_updated":
          if (payload.likeCount != null) {
            updatePostInFeed(qc, pid, { likeCount: payload.likeCount });
            patchPostQuery(qc, pid, { likeCount: payload.likeCount });
          }
          break;
        case "post_deleted":
          removePostFromFeed(qc, pid);
          qc.removeQueries({ queryKey: ["post", pid] });
          qc.removeQueries({ queryKey: ["comments", pid] });
          break;
        case "comment_added":
          qc.invalidateQueries({ queryKey: ["comments", pid] });
          if (
            !payload.actorId ||
            !me?._id ||
            String(payload.actorId) !== String(me._id)
          ) {
            bumpCommentCountInFeed(qc, pid, 1);
            bumpCommentCountOnPostQuery(qc, pid, 1);
          }
          break;
        case "comment_deleted":
          qc.invalidateQueries({ queryKey: ["comments", pid] });
          if (
            !payload.actorId ||
            !me?._id ||
            String(payload.actorId) !== String(me._id)
          ) {
            bumpCommentCountInFeed(qc, pid, -1);
            bumpCommentCountOnPostQuery(qc, pid, -1);
          }
          break;
        default:
          qc.invalidateQueries({ queryKey: ["post", pid] });
          qc.invalidateQueries({ queryKey: ["comments", pid] });
      }
    };
    socket.on("notification:new", onNotif);
    socket.on("receive_message", onMsg);
    socket.on("feed:update", onFeedUpdate);
    socket.on("post:update", onPostUpdate);
    return () => {
      socket.off("notification:new", onNotif);
      socket.off("receive_message", onMsg);
      socket.off("feed:update", onFeedUpdate);
      socket.off("post:update", onPostUpdate);
    };
  }, [socket, token, qc, me?._id]);

  return (
    <div className="min-h-screen flex">
      {showAppChrome ? <Sidebar /> : null}
      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col ${
          showAppChrome ? "lg:pl-[15.5rem]" : ""
        }`}
      >
        <Navbar />
        <main
          className={
            showAppChrome
              ? "flex-1 w-full max-w-2xl xl:max-w-3xl mx-auto px-4 py-6 pb-36 lg:pb-8"
              : "flex-1 w-full max-w-2xl xl:max-w-3xl mx-auto px-4 py-6"
          }
        >
          <Outlet />
        </main>
        {showAppChrome ? <MobileBottomNav /> : null}
      </div>
    </div>
  );
}
