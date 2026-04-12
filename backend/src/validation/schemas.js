import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id"),
});

export const updateUserSchema = z.object({
  bio: z.string().max(280).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/** Username substring search (lowercased server-side). */
export const userSearchQuerySchema = z.object({
  q: z.string().trim().min(2, "Use at least 2 characters").max(32),
});

export const createPostSchema = z.object({
  content: z.string().trim().min(1, "Content is required").max(8000),
});

export const commentBodySchema = z.object({
  content: z.string().min(1).max(2000),
});

export const createConversationSchema = z.object({
  participantId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid participant id"),
});

export const conversationIdParamSchema = z.object({
  conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id"),
});

export const postIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id"),
});

export const createMessageSchema = z.object({
  conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id"),
  content: z.string().min(1).max(8000),
});

export const notificationsReadSchema = z
  .object({
    notificationIds: z.array(z.string().regex(/^[a-fA-F0-9]{24}$/)).optional(),
    markAll: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.markAll === true ||
      (Array.isArray(d.notificationIds) && d.notificationIds.length > 0),
    { message: "Provide markAll: true or notificationIds" }
  );

export const commentIdParamSchema = z.object({
  commentId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id"),
});
