import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Post } from "./models/Post.js";
import { Comment } from "./models/Comment.js";
import { Conversation } from "./models/Conversation.js";
import { Message } from "./models/Message.js";
import { Notification } from "./models/Notification.js";
import { makeParticipantKey } from "./utils/conversationKey.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI required");
  process.exit(1);
}

const RESET = process.argv.includes("--reset");

/** All accounts use this password */
const DEMO_PASSWORD = "password123";

const USERS = [
  {
    username: "alice",
    email: "alice@example.com",
    bio: "Product designer who likes messy problems, good coffee, and long hikes when the laptop finally closes. Tinkering with design systems and clearer UX for everyone.",
  },
  {
    username: "bob",
    email: "bob@example.com",
    bio: "Full-stack dev (MERN lately). I bike on weekends, argue about TypeScript for fun, and still get excited when a stale cache bug finally makes sense.",
  },
  {
    username: "carol",
    email: "carol@example.com",
    bio: "Data person: dashboards by day, vinyl by night. I care about honest charts, sample bias, and records that still crackle in the right light.",
  },
  {
    username: "dave",
    email: "dave@example.com",
    bio: "Photographer based in Kraków. Chasing light in old town alleys, lazy cats, and that ten-minute window when the city turns gold.",
  },
  {
    username: "erin",
    email: "erin@example.com",
    bio: "Runner, reader, repeat. Morning miles before email; fiction stack by the bed that grows faster than I can finish it.",
  },
  {
    username: "frank",
    email: "frank@example.com",
    bio: "Startup veteran with strong opinions on pizza crust and roadmaps. Believes small teams ship, big decks distract.",
  },
  {
    username: "grace",
    email: "grace@example.com",
    bio: "Teacher learning Rust slowly on purpose. Loves when students ask the uncomfortable question — that is where the lesson actually starts.",
  },
  {
    username: "henry",
    email: "henry@example.com",
    bio: "Music producer and night owl. If you DM late, I am probably looping the same eight bars until they feel honest.",
  },
  {
    username: "luis",
    email: "luis@example.com",
    bio: "Indie maker and coffee snob. Building small tools, sharing drafts early, and collecting interesting followers one thoughtful reply at a time.",
  },
];

/** Demo lithvinsky account only; refreshed on seed when email matches (does not overwrite other accounts). */
const LITHVINSKY_DEMO_BIO =
  "On Orbit for the long conversations and weirdly specific recommendations. Say hi if you want to compare notes on film, code, or bad coffee.";

const POST_TEMPLATES = [
  { author: "bob", content: "Shipped a big refactor today — feels good to delete legacy code." },
  {
    author: "alice",
    content: "Looking for book recommendations for long flights. Hit me with your favourites.",
  },
  {
    author: "carol",
    content:
      "Fun fact: most ‘average’ statistics hide two totally different stories. Always ask for the distribution.",
  },
  {
    author: "dave",
    content:
      "Golden hour in the old town never gets old. (Add a real image via Cloudinary in production.)",
  },
  { author: "erin", content: "5k before breakfast. The hardest part is leaving the blanket." },
  {
    author: "frank",
    content: "Hot take: your MVP should embarrass you a little. If it doesn’t, you shipped too late.",
  },
  {
    author: "grace",
    content: "Explained async/await to my class using a pizza delivery analogy. I think it landed.",
  },
  {
    author: "henry",
    content: "New track dropping Friday — DM if you want an early listen.",
  },
  {
    author: "bob",
    content: "TIL: MongoDB compound indexes are worth sketching on paper before you deploy.",
  },
  {
    author: "alice",
    content: "Design systems are UX for your team. Treat them like a product.",
  },
  {
    author: "carol",
    content: "Correlation ≠ causation, but it’s a great place to start asking why.",
  },
  {
    author: "dave",
    content: "Street cats make the best unwilling models.",
  },
  {
    author: "erin",
    content: "Rest day. Recovery is training too.",
  },
  {
    author: "frank",
    content: "If your roadmap is just a list of features, you don’t have a roadmap.",
  },
  {
    author: "grace",
    content:
      "Students asked if AI will replace programmers. We talked about tools vs taste for an hour.",
  },
  {
    author: "luis",
    content:
      "Shipped a tiny CLI that only does one thing — format messy JSON from stdin. Somehow that is the tool I use most this week.",
  },
  {
    author: "luis",
    content:
      "Reminder: you do not need a perfect personal brand. A clear bio and showing up consistently beats a polished empty feed.",
  },
];

/** follower -> target (follower follows target) */
const FOLLOW_EDGES = [
  ["alice", "bob"],
  ["alice", "carol"],
  ["alice", "dave"],
  ["alice", "erin"],
  ["bob", "alice"],
  ["bob", "carol"],
  ["bob", "henry"],
  ["carol", "bob"],
  ["carol", "dave"],
  ["carol", "frank"],
  ["dave", "alice"],
  ["dave", "erin"],
  ["dave", "grace"],
  ["erin", "carol"],
  ["erin", "frank"],
  ["frank", "alice"],
  ["frank", "bob"],
  ["frank", "grace"],
  ["grace", "henry"],
  ["grace", "erin"],
  ["henry", "bob"],
  ["henry", "dave"],
  ["henry", "frank"],
  /** Many follows for @luis (follower -> luis) */
  ["alice", "luis"],
  ["bob", "luis"],
  ["carol", "luis"],
  ["dave", "luis"],
  ["erin", "luis"],
  ["frank", "luis"],
  ["grace", "luis"],
  ["henry", "luis"],
  /** luis follows a few */
  ["luis", "alice"],
  ["luis", "bob"],
  ["luis", "dave"],
];

await connectDb(MONGO_URI);
const seedEmails = USERS.map((u) => u.email);

if (RESET) {
  await Promise.all([
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("Reset: cleared all posts, comments, conversations, messages, notifications.");
}

const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
const byName = {};

for (const u of USERS) {
  const doc = await User.findOneAndUpdate(
    { email: u.email },
    {
      username: u.username,
      email: u.email,
      passwordHash,
      bio: u.bio,
      avatar: "",
    },
    { upsert: true, new: true }
  );
  byName[u.username] = doc;
}

function uid(name) {
  return byName[name]._id;
}

const seedIds = USERS.map((u) => uid(u.username));

if (!RESET) {
  const oldPostIds = await Post.find({ author: { $in: seedIds } }).distinct("_id");
  if (oldPostIds.length) {
    await Comment.deleteMany({ post: { $in: oldPostIds } });
    await Post.deleteMany({ _id: { $in: oldPostIds } });
  }
}

await User.updateMany(
  { _id: { $in: seedIds } },
  { $set: { followers: [], following: [] } }
);

for (const [followerName, targetName] of FOLLOW_EDGES) {
  const followerId = uid(followerName);
  const targetId = uid(targetName);
  await User.findByIdAndUpdate(followerId, { $addToSet: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: followerId } });
}

const createdPosts = [];
for (const p of POST_TEMPLATES) {
  const post = await Post.create({
    author: uid(p.author),
    content: p.content,
    media: [],
    likes: [],
    commentCount: 0,
  });
  createdPosts.push(post);
}

const LIKE_SPEC = [
  [0, ["alice", "carol", "dave", "erin"]],
  [1, ["bob", "carol", "frank"]],
  [2, ["alice", "bob", "grace", "henry"]],
  [3, ["alice", "erin", "frank"]],
  [4, ["bob", "carol", "dave"]],
  [5, ["alice", "grace", "henry"]],
  [6, ["bob", "dave", "erin"]],
  [7, ["alice", "carol", "frank", "grace"]],
  [8, ["alice", "carol"]],
  [9, ["bob", "dave", "henry"]],
  [15, ["alice", "bob", "carol", "erin"]],
  [16, ["dave", "frank", "grace", "henry"]],
];

for (const [idx, likers] of LIKE_SPEC) {
  const post = createdPosts[idx];
  if (!post) continue;
  const ids = likers.map((n) => uid(n));
  await Post.findByIdAndUpdate(post._id, { $addToSet: { likes: { $each: ids } } });
}

const COMMENT_SPEC = [
  [0, "alice", "Congrats — what part of the stack?"],
  [0, "carol", "Deletion metrics should be a dashboard."],
  [1, "bob", "Read ‘The Dispossessed’ on a long haul once. Still think about it."],
  [1, "grace", "Project Hail Mary if you want something lighter but smart."],
  [2, "dave", "This. So much this."],
  [4, "frank", "Respect. I need three alarms."],
  [5, "alice", "Counterpoint: some teams need polish before users trust them."],
  [7, "bob", "Send it"],
  [9, "carol", "Tokens != components but yes — internal users matter."],
  [11, "erin", "Whiskers add 10x character."],
  [15, "alice", "CLI that does one thing well — chef's kiss."],
  [16, "bob", "Counter-narrative: a polished feed works if it is honest. But I get your point."],
];

for (const [postIdx, authorName, content] of COMMENT_SPEC) {
  const post = createdPosts[postIdx];
  if (!post) continue;
  await Comment.create({
    post: post._id,
    author: uid(authorName),
    content,
  });
  await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });
}

/** Sample DM: alice & carol */
const aId = uid("alice");
const cId = uid("carol");
const participantKey = makeParticipantKey(aId, cId);
let conv = await Conversation.findOne({ participantKey });
if (!conv) {
  conv = await Conversation.create({
    participantKey,
    participants: [aId, cId],
    lastMessage: "",
    lastMessageAt: new Date(),
  });
}
await Message.deleteMany({ conversation: conv._id });

const dmLines = [
  [aId, "Hey Carol — got a minute for those dashboard mocks?"],
  [cId, "Sure! I will send Figma link in 10."],
  [aId, "Legend. Need them for Friday stakeholder review."],
  [cId, "Pushed — check the Q2-overview page."],
];

for (const [sender, content] of dmLines) {
  const msg = await Message.create({
    conversation: conv._id,
    sender,
    content,
    readBy: [sender],
  });
  await Conversation.findByIdAndUpdate(conv._id, {
    lastMessage: content.slice(0, 200),
    lastMessageAt: msg.createdAt || new Date(),
    lastSender: sender,
  });
}

/** Inbox for @lithvinsky: DMs *from* seed members (finds existing user or creates demo account). */
let lithUser = await User.findOne({ username: "lithvinsky" });
if (!lithUser) {
  try {
    lithUser = await User.create({
      username: "lithvinsky",
      email: "lithvinsky@example.com",
      passwordHash,
      bio: LITHVINSKY_DEMO_BIO,
      avatar: "",
    });
    console.log("Created demo user lithvinsky (lithvinsky@example.com) for inbox seed.");
  } catch (e) {
    if (e.code === 11000) {
      console.log(
        "Skipping lithvinsky inbox: username 'lithvinsky' or lithvinsky@example.com is already taken by another account."
      );
    } else {
      throw e;
    }
  }
}

if (lithUser && lithUser.email === "lithvinsky@example.com") {
  await User.findByIdAndUpdate(lithUser._id, { $set: { bio: LITHVINSKY_DEMO_BIO } });
}

if (lithUser) {
  const lithId = lithUser._id;
  /** [sender username, lines they send to lithvinsky] — re-seed replaces messages in each 1:1 thread only. */
  const LITHVINSKY_INBOUND = [
    [
      "alice",
      [
        "Hey — your comments on the feed have been really thoughtful lately.",
        "If you want to jam on a small side project, I’m around this week.",
      ],
    ],
    [
      "bob",
      [
        "Quick heads-up: I’m pushing a backend deploy tonight ~22:00.",
        "If you see brief 502s it should be the rolling restart, not you.",
      ],
    ],
    [
      "carol",
      [
        "Sharing that dataset export we talked about — column defs are in the README sheet.",
        "Shout if the file size is painful on your connection.",
      ],
    ],
    [
      "dave",
      [
        "Golden hour shots from yesterday — reminded me of your post about street photography.",
      ],
    ],
    [
      "grace",
      [
        "Thanks again for the clarification on the thread — saved me a rabbit hole with the class.",
      ],
    ],
    [
      "henry",
      [
        "Threw a rough mix in the folder — no pressure, only if you’re curious.",
        "Either way, congrats on the launch noise on the feed.",
      ],
    ],
  ];

  for (const [senderName, lines] of LITHVINSKY_INBOUND) {
    const senderId = byName[senderName]?._id;
    if (!senderId) continue;
    const participantKey = makeParticipantKey(senderId, lithId);
    let c = await Conversation.findOne({ participantKey });
    if (!c) {
      c = await Conversation.create({
        participantKey,
        participants: [senderId, lithId],
        lastMessage: "",
        lastMessageAt: new Date(),
      });
    }
    await Message.deleteMany({ conversation: c._id });
    for (const content of lines) {
      const msg = await Message.create({
        conversation: c._id,
        sender: senderId,
        content,
        readBy: [senderId],
      });
      await Conversation.findByIdAndUpdate(c._id, {
        lastMessage: content.slice(0, 200),
        lastMessageAt: msg.createdAt || new Date(),
        lastSender: senderId,
      });
    }
  }
  console.log(
    `Seeded lithvinsky inbox: ${LITHVINSKY_INBOUND.length} DM threads from other members.`
  );
}

/**
 * Demo alerts for Alerts tab — mix of unread/read. Scoped recipients only;
 * replaces rows from the last seed for those users (avoids duplicates on re-run).
 */
const notifRecipientScope = [...seedIds];
if (lithUser) {
  notifRecipientScope.push(lithUser._id);
}
await Notification.deleteMany({ recipient: { $in: notifRecipientScope } });

/** type, recipient username, from username, optional post index, read, message uses alice–carol conv */
const NOTIFICATION_SEED = [
  { type: "like", recipient: "bob", from: "alice", post: 0 },
  { type: "like", recipient: "bob", from: "erin", post: 0, read: true },
  { type: "like", recipient: "alice", from: "carol", post: 1 },
  { type: "like", recipient: "luis", from: "henry", post: 16 },
  { type: "comment", recipient: "bob", from: "alice", post: 0 },
  { type: "comment", recipient: "alice", from: "grace", post: 1 },
  { type: "comment", recipient: "luis", from: "bob", post: 15, read: true },
  { type: "follow", recipient: "alice", from: "henry" },
  { type: "follow", recipient: "luis", from: "dave", read: true },
  { type: "follow", recipient: "frank", from: "luis" },
  { type: "follow", recipient: "carol", from: "erin" },
  {
    type: "message",
    recipient: "carol",
    from: "alice",
    messageConv: true,
  },
];

for (const n of NOTIFICATION_SEED) {
  const recipientId = uid(n.recipient);
  const fromId = uid(n.from);
  const postId =
    n.post !== undefined && createdPosts[n.post] ? createdPosts[n.post]._id : undefined;
  const conversation =
    n.messageConv && n.type === "message" ? conv._id : undefined;
  await Notification.create({
    recipient: recipientId,
    type: n.type,
    fromUser: fromId,
    post: postId,
    conversation: conversation || undefined,
    read: n.read ?? false,
  });
}

if (lithUser) {
  await Notification.create({
    recipient: lithUser._id,
    type: "follow",
    fromUser: uid("luis"),
    read: false,
  });
  if (createdPosts[16]) {
    await Notification.create({
      recipient: lithUser._id,
      type: "like",
      fromUser: uid("grace"),
      post: createdPosts[16]._id,
      read: false,
    });
  }
}

console.log(
  `Seeded notifications: ${NOTIFICATION_SEED.length}+ sample alerts for demo accounts.`
);

console.log("");
console.log(
  `Seed complete (${RESET ? "full reset · " : ""}${USERS.length} users, ${createdPosts.length} posts, likes, comments, notifications, 1 alice–carol DM + lithvinsky inbox).`
);
console.log(`Password for every demo account: ${DEMO_PASSWORD}`);
console.log("Try: alice@example.com, bob@example.com, carol@example.com");
console.log("");

await mongoose.disconnect();
process.exit(0);
