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
    inputType: v.union(
      v.literal("url"),
      v.literal("text"),
      v.literal("youtube"),
      v.literal("pdf"),
      v.literal("batch"),
      v.literal("twitter"),
      v.literal("reddit"),
      v.literal("github"),
      v.literal("image")
    ),
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
    // YouTube-specific metadata
    youtubeVideoId: v.optional(v.string()),
    youtubeThumbnail: v.optional(v.string()),
    youtubeChannelName: v.optional(v.string()),
    youtubeDuration: v.optional(v.string()),
    // PDF-specific metadata
    pdfFileName: v.optional(v.string()),
    pdfPageCount: v.optional(v.number()),
    // Batch URLs metadata
    batchUrls: v.optional(v.array(v.string())),
    batchCount: v.optional(v.number()),
    // Twitter/X metadata
    twitterThreadId: v.optional(v.string()),
    twitterAuthor: v.optional(v.string()),
    twitterAuthorHandle: v.optional(v.string()),
    twitterTweetCount: v.optional(v.number()),
    // Reddit metadata
    redditPostId: v.optional(v.string()),
    redditSubreddit: v.optional(v.string()),
    redditAuthor: v.optional(v.string()),
    redditScore: v.optional(v.number()),
    redditCommentCount: v.optional(v.number()),
    // GitHub metadata
    githubType: v.optional(v.union(v.literal("pr"), v.literal("issue"))),
    githubOwner: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    githubNumber: v.optional(v.number()),
    githubState: v.optional(v.string()),
    githubFilesChanged: v.optional(v.number()),
    // Image OCR metadata
    imageFileNames: v.optional(v.array(v.string())),
    imageCount: v.optional(v.number()),
    ocrMethod: v.optional(v.string()),
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
