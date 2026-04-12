import UserSearch from "./UserSearch.jsx";

/** Profile sidebar: full “Find people” card. */
export default function FollowMemberSearch({ className = "" }) {
  return <UserSearch variant="panel" className={className} />;
}
