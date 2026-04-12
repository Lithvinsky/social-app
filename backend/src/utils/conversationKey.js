/** Stable key for two user ids (1:1). */
export function makeParticipantKey(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `${x}:${y}`;
}
