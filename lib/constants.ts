// Free tier limits
export const FREE_TIER_LIMIT = 10;

// Default model for summarization
export const DEFAULT_MODEL = 'openai/gpt-4o-mini';

// Summary lengths available
export const SUMMARY_LENGTHS = ['short', 'medium', 'long', 'xl'] as const;

// API rate limiting
export const RATE_LIMIT_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Content extraction limits
export const MAX_CONTENT_LENGTH = 100000; // characters
export const REQUEST_TIMEOUT_MS = 15000;
