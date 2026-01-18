import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSummary = mutation({
  args: {
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
    youtubeVideoId: v.optional(v.string()),
    youtubeThumbnail: v.optional(v.string()),
    youtubeChannelName: v.optional(v.string()),
    youtubeDuration: v.optional(v.string()),
    // PDF-specific fields
    pdfFileName: v.optional(v.string()),
    pdfPageCount: v.optional(v.number()),
    // Batch URLs fields
    batchUrls: v.optional(v.array(v.string())),
    batchCount: v.optional(v.number()),
    // Twitter/X fields
    twitterThreadId: v.optional(v.string()),
    twitterAuthor: v.optional(v.string()),
    twitterAuthorHandle: v.optional(v.string()),
    twitterTweetCount: v.optional(v.number()),
    // Reddit fields
    redditPostId: v.optional(v.string()),
    redditSubreddit: v.optional(v.string()),
    redditAuthor: v.optional(v.string()),
    redditScore: v.optional(v.number()),
    redditCommentCount: v.optional(v.number()),
    // GitHub fields
    githubType: v.optional(v.union(v.literal("pr"), v.literal("issue"))),
    githubOwner: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    githubNumber: v.optional(v.number()),
    githubState: v.optional(v.string()),
    githubFilesChanged: v.optional(v.number()),
    // Image OCR fields
    imageFileNames: v.optional(v.array(v.string())),
    imageCount: v.optional(v.number()),
    ocrMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const summaryId = await ctx.db.insert("summaries", {
      userId: args.userId,
      url: args.url,
      inputType: args.inputType,
      inputTitle: args.inputTitle,
      inputContent: args.inputContent,
      inputWordCount: args.inputWordCount,
      summary: args.summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed: args.tokensUsed,
      createdAt: Date.now(),
      youtubeVideoId: args.youtubeVideoId,
      youtubeThumbnail: args.youtubeThumbnail,
      youtubeChannelName: args.youtubeChannelName,
      youtubeDuration: args.youtubeDuration,
      pdfFileName: args.pdfFileName,
      pdfPageCount: args.pdfPageCount,
      batchUrls: args.batchUrls,
      batchCount: args.batchCount,
      twitterThreadId: args.twitterThreadId,
      twitterAuthor: args.twitterAuthor,
      twitterAuthorHandle: args.twitterAuthorHandle,
      twitterTweetCount: args.twitterTweetCount,
      redditPostId: args.redditPostId,
      redditSubreddit: args.redditSubreddit,
      redditAuthor: args.redditAuthor,
      redditScore: args.redditScore,
      redditCommentCount: args.redditCommentCount,
      githubType: args.githubType,
      githubOwner: args.githubOwner,
      githubRepo: args.githubRepo,
      githubNumber: args.githubNumber,
      githubState: args.githubState,
      githubFilesChanged: args.githubFilesChanged,
      imageFileNames: args.imageFileNames,
      imageCount: args.imageCount,
      ocrMethod: args.ocrMethod,
    });

    return summaryId;
  },
});

export const getUserSummaries = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    let summariesQuery = ctx.db
      .query("summaries")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc");

    if (args.cursor) {
      summariesQuery = summariesQuery.filter((q) =>
        q.lt(q.field("createdAt"), args.cursor!)
      );
    }

    const summaries = await summariesQuery.take(limit + 1);

    const hasMore = summaries.length > limit;
    const items = hasMore ? summaries.slice(0, -1) : summaries;
    const nextCursor = hasMore ? items[items.length - 1].createdAt : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  },
});

export const getSummary = query({
  args: {
    summaryId: v.id("summaries"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.summaryId);
  },
});

export const getSummaryWithAccess = query({
  args: {
    summaryId: v.id("summaries"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const summary = await ctx.db.get(args.summaryId);

    if (!summary) {
      return null;
    }

    if (summary.userId !== args.userId) {
      throw new Error("Unauthorized: You don't have access to this summary");
    }

    return summary;
  },
});

export const deleteSummary = mutation({
  args: {
    summaryId: v.id("summaries"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const summary = await ctx.db.get(args.summaryId);

    if (!summary) {
      throw new Error("Summary not found");
    }

    if (summary.userId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own summaries");
    }

    await ctx.db.delete(args.summaryId);

    return { success: true };
  },
});

export const getUserSummaryCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const summaries = await ctx.db
      .query("summaries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return summaries.length;
  },
});
