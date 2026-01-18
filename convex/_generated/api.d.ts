/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_summarize from "../actions/summarize.js";
import type * as actions_summarizeBatch from "../actions/summarizeBatch.js";
import type * as actions_summarizeGithub from "../actions/summarizeGithub.js";
import type * as actions_summarizeImage from "../actions/summarizeImage.js";
import type * as actions_summarizePdf from "../actions/summarizePdf.js";
import type * as actions_summarizeReddit from "../actions/summarizeReddit.js";
import type * as actions_summarizeTwitter from "../actions/summarizeTwitter.js";
import type * as actions_summarizeYoutube from "../actions/summarizeYoutube.js";
import type * as summaries from "../summaries.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/summarize": typeof actions_summarize;
  "actions/summarizeBatch": typeof actions_summarizeBatch;
  "actions/summarizeGithub": typeof actions_summarizeGithub;
  "actions/summarizeImage": typeof actions_summarizeImage;
  "actions/summarizePdf": typeof actions_summarizePdf;
  "actions/summarizeReddit": typeof actions_summarizeReddit;
  "actions/summarizeTwitter": typeof actions_summarizeTwitter;
  "actions/summarizeYoutube": typeof actions_summarizeYoutube;
  summaries: typeof summaries;
  usage: typeof usage;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
