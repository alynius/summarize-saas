export type SummaryLength = 'short' | 'medium' | 'long' | 'xl';

export type ExtractedContent = {
  text: string;
  title: string | null;
  excerpt: string | null;
  finalUrl: string;
  wordCount: number;
};

export type SummarizeResult = {
  summary: string;
  tokensUsed: number;
};
