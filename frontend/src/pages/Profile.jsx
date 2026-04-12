import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getUser,
  followUser,
  unfollowUser,
  suggestions,
  updateUser,
} from "../api/users.js";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice.js";
import { createConversation } from "../api/chat.js";
import FollowMemberSearch from "../components/FollowMemberSearch.jsx";

function sortByUsername(a, b) {
  return String(a.username || "").localeCompare(
    String(b.username || ""),
    undefined,
    { sensitivity: "base" },
  );
}

function MemberList({ users, emptyLabel }) {
  if (!users.length) {
    return (
      <p className="py-6 text-center text-sm text-orbit-muted">{emptyLabel}</p>
    );
  }
  return (
    <ul className="max-h-72 space-y-1 overflow-y-auto rounded-2xl border border-white/55 bg-white/50 py-1 ring-1 ring-white/40">
      {users.map((u) => (
        <li key={u._id}>
          <Link
            to={`/profile/${u._id}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-orbit-ink transition hover:bg-white/70"
          >
            {u.avatar ? (
              <img
                src={u.avatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/80"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lavender-mist text-sm font-bold text-brand ring-2 ring-white/80">
                {(u.username || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 truncate font-medium">@{u.username}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const me = useSelector((s) => s.auth.user);
  const qc = useQueryClient();
  const [bioDraft, setBioDraft] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [openList, setOpenList] = useState(null);

  const { data: profile, status } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });

  useEffect(() => {
    if (!editingBio && profile?.bio != null) {
      setBioDraft(profile.bio);
    }
  }, [profile?._id, profile?.bio, editingBio]);

  const { data: suggested } = useQuery({
    queryKey: ["suggestions"],
    queryFn: suggestions,
    enabled: Boolean(me),
  });

  const followMut = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowing) {
        await unfollowUser(id);
        return false;
      }
      await followUser(id);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", id] }),
  });

  const saveBio = useMutation({
    mutationFn: () => updateUser(id, { bio: bioDraft }),
    onSuccess: (u) => {
      dispatch(setUser(u));
      qc.invalidateQueries({ queryKey: ["user", id] });
      setEditingBio(false);
    },
  });

  const openChat = useMutation({
    mutationFn: () => createConversation(id),
    onSuccess: (c) => navigate(`/chat/${c._id}`),
  });

  const isMe = me && String(me._id) === String(id);

  function startEditBio() {
    setBioDraft(profile?.bio ?? "");
    setEditingBio(true);
  }

  function cancelEditBio() {
    setBioDraft(profile?.bio ?? "");
    setEditingBio(false);
  }

  function toggleList(which) {
    setOpenList((v) => (v === which ? null : which));
  }

  if (status === "pending") {
    return (
      <div className="space-y-4">
        <div className="glass-panel-strong h-56 animate-pulse rounded-[1.35rem] ring-1 ring-white/40" />
        <p className="text-sm text-orbit-muted">Loading profile…</p>
      </div>
    );
  }
  if (status === "error" || !profile) {
    return (
      <div className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-6 text-red-800">
        User not found.
      </div>
    );
  }

  const followerList = [...(profile.followers || [])].sort(sortByUsername);
  const followingList = [...(profile.following || [])].sort(sortByUsername);
  const followerCount = profile.followerCount ?? followerList.length;
  const followingCount = profile.followingCount ?? followingList.length;

  const listUsers =
    openList === "followers"
      ? followerList
      : openList === "following"
        ? followingList
        : [];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="glass-panel-strong overflow-hidden ring-1 ring-white/45">
          <div className="h-36 bg-gradient-to-r from-lavender-light/90 via-lavender-deep/70 to-brand/40 sm:h-44" />
          <div className="relative -mt-16 px-6 pb-6 pt-2 sm:-mt-[4.5rem] sm:px-8 sm:pb-8">
            <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-lavender-light to-brand text-4xl font-bold text-white shadow-orbit ring-[5px] ring-white/95 sm:h-32 sm:w-32 sm:text-[2.75rem]">
              {(profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-orbit-ink sm:text-[2rem]">
                  @{profile.username}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleList("followers")}
                    aria-expanded={openList === "followers"}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-soft ring-1 transition ${
                      openList === "followers"
                        ? "bg-white/95 text-brand-deep ring-lavender-light/60"
                        : "bg-white/55 text-orbit-ink ring-white/55 hover:bg-white/80"
                    }`}
                  >
                    Followers
                    <span className="ml-1.5 tabular-nums text-orbit-muted">
                      {followerCount.toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleList("following")}
                    aria-expanded={openList === "following"}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-soft ring-1 transition ${
                      openList === "following"
                        ? "bg-white/95 text-brand-deep ring-lavender-light/60"
                        : "bg-white/55 text-orbit-ink ring-white/55 hover:bg-white/80"
                    }`}
                  >
                    Following
                    <span className="ml-1.5 tabular-nums text-orbit-muted">
                      {followingCount.toLocaleString()}
                    </span>
                  </button>
                </div>

                {isMe && editingBio ? (
                  <div className="mt-5 space-y-3">
                    <textarea
                      className="input-orbit min-h-[100px] w-full"
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                      placeholder="Tell people about you…"
                      maxLength={280}
                      aria-label="Bio"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={saveBio.isPending}
                        className="rounded-2xl bg-brand px-5 py-2 text-sm font-semibold text-white shadow-orbit hover:bg-brand-hover disabled:opacity-50"
                        onClick={() => saveBio.mutate()}
                      >
                        {saveBio.isPending ? "Saving…" : "Save bio"}
                      </button>
                      <button
                        type="button"
                        disabled={saveBio.isPending}
                        className="rounded-2xl border border-white/80 bg-white/80 px-5 py-2 text-sm font-semibold text-orbit-ink ring-1 ring-white/60 hover:bg-white"
                        onClick={cancelEditBio}
                      >
                        Cancel
                      </button>
                    </div>
                    {saveBio.isError ? (
                      <p className="text-xs font-medium text-red-700">
                        {saveBio.error?.message || "Could not save bio."}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5">
                    <p className="text-base leading-relaxed text-orbit-ink/90 whitespace-pre-wrap">
                      {profile.bio?.trim()
                        ? profile.bio
                        : isMe
                          ? "You haven’t added a bio yet."
                          : "No bio yet."}
                    </p>
                    {isMe ? (
                      <button
                        type="button"
                        onClick={startEditBio}
                        className="mt-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold text-brand-deep shadow-soft ring-1 ring-lavender-light/50 transition hover:bg-white hover:ring-brand/20"
                      >
                        {profile.bio?.trim() ? "Edit bio" : "Add bio"}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
              {!isMe ? (
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => followMut.mutate()}
                    className="w-full rounded-2xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-orbit hover:bg-brand-hover sm:w-auto"
                  >
                    {profile.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openChat.mutate()}
                    className="w-full rounded-2xl border border-white/80 bg-white/70 px-5 py-2.5 text-sm font-semibold text-orbit-ink shadow-soft hover:bg-white sm:w-auto"
                  >
                    Message
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {openList ? (
            <div className="border-t border-white/50 bg-lavender-mist/25 px-6 py-5 backdrop-blur-sm sm:px-8">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-orbit-muted">
                {openList === "followers" ? "Followers" : "Following"}
              </h2>
              <MemberList
                users={listUsers}
                emptyLabel={
                  openList === "followers"
                    ? "No followers yet."
                    : "Not following anyone yet."
                }
              />
            </div>
          ) : null}
        </div>
      </div>
      <aside className="space-y-4">
        <FollowMemberSearch />
        <h2 className="text-sm font-semibold text-orbit-muted">Suggested</h2>
        <ul className="space-y-2">
          {(suggested || []).slice(0, 8).map((u) => (
            <li key={u._id}>
              <Link
                to={`/profile/${u._id}`}
                className="flex items-center gap-2 text-sm text-orbit-ink hover:text-brand"
              >
                <span className="font-medium">@{u.username}</span>
                {u.score != null ? (
                  <span className="text-xs text-orbit-muted">({u.score})</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
