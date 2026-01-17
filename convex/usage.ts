import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TIER_LIMITS = {
  free: 10,
  pro: 100,
  enterprise: Infinity,
} as const;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const getUsage = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();

    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", month)
      )
      .unique();

    if (!usage) {
      return {
        userId: args.userId,
        month,
        summaryCount: 0,
        tokensUsed: 0,
      };
    }

    return usage;
  },
});

export const getUsageWithLimits = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", month)
      )
      .unique();

    const summaryCount = usage?.summaryCount ?? 0;
    const tokensUsed = usage?.tokensUsed ?? 0;
    const limit = TIER_LIMITS[user.tier];

    return {
      userId: args.userId,
      month,
      summaryCount,
      tokensUsed,
      limit,
      remaining: Math.max(0, limit - summaryCount),
      tier: user.tier,
    };
  },
});

export const incrementUsage = mutation({
  args: {
    userId: v.id("users"),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();

    const existingUsage = await ctx.db
      .query("usage")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", month)
      )
      .unique();

    if (existingUsage) {
      await ctx.db.patch(existingUsage._id, {
        summaryCount: existingUsage.summaryCount + 1,
        tokensUsed: existingUsage.tokensUsed + (args.tokensUsed ?? 0),
      });
      return existingUsage._id;
    }

    const usageId = await ctx.db.insert("usage", {
      userId: args.userId,
      month,
      summaryCount: 1,
      tokensUsed: args.tokensUsed ?? 0,
    });

    return usageId;
  },
});

export const canSummarize = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return {
        allowed: false,
        reason: "User not found",
      };
    }

    const month = getCurrentMonth();
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", month)
      )
      .unique();

    const summaryCount = usage?.summaryCount ?? 0;
    const limit = TIER_LIMITS[user.tier];

    if (summaryCount >= limit) {
      return {
        allowed: false,
        reason: `Monthly limit reached (${limit} summaries for ${user.tier} tier)`,
        summaryCount,
        limit,
        tier: user.tier,
      };
    }

    return {
      allowed: true,
      summaryCount,
      limit,
      remaining: limit - summaryCount,
      tier: user.tier,
    };
  },
});

export const resetMonthlyUsage = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const month = getCurrentMonth();

    const existingUsage = await ctx.db
      .query("usage")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", month)
      )
      .unique();

    if (existingUsage) {
      await ctx.db.patch(existingUsage._id, {
        summaryCount: 0,
        tokensUsed: 0,
      });
    }

    return { success: true };
  },
});
