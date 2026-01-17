import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    summariesThisMonth: v.number(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  summaries: defineTable({
    userId: v.id("users"),
    url: v.optional(v.string()),
    inputType: v.union(v.literal("url"), v.literal("text")),
    inputTitle: v.optional(v.string()),
    inputContent: v.string(),
    inputWordCount: v.number(),
    summary: v.string(),
    summaryLength: v.union(
      v.literal("short"),
      v.literal("medium"),
      v.literal("long"),
      v.literal("xl")
    ),
    model: v.string(),
    tokensUsed: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  usage: defineTable({
    userId: v.id("users"),
    month: v.string(),
    summaryCount: v.number(),
    tokensUsed: v.number(),
  }).index("by_user_month", ["userId", "month"]),
});
