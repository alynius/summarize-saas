import type { SummaryLength } from './types';

export type SummaryLengthSpec = {
  guidance: string;
  formatting: string;
  maxTokens: number;
};

export const SUMMARY_LENGTH_SPECS: Record<SummaryLength, SummaryLengthSpec> = {
  short: {
    guidance:
      'Write a tight summary that delivers the primary claim plus one high-signal supporting detail.',
    formatting:
      'Use 1-2 short paragraphs. Aim for 2-5 sentences total.',
    maxTokens: 768,
  },
  medium: {
    guidance:
      'Write a clear summary that covers the core claim plus the most important supporting evidence or data points.',
    formatting:
      'Use 1-3 short paragraphs. Aim for 2-3 sentences per paragraph.',
    maxTokens: 1536,
  },
  long: {
    guidance:
      'Write a detailed summary that prioritizes the most important points first, followed by key supporting facts or events, then secondary details.',
    formatting:
      'Use up to 3 short paragraphs. Aim for 2-4 sentences per paragraph.',
    maxTokens: 3072,
  },
  xl: {
    guidance:
      'Write a comprehensive summary that captures the main points, supporting facts, and concrete numbers or quotes when present.',
    formatting:
      'Use 2-5 short paragraphs with Markdown headings (### ) to break sections. Include at least 3 headings.',
    maxTokens: 6144,
  },
};

export type SummaryPromptMessages = {
  system: string;
  user: string;
};

export function buildSummaryPrompt({
  url,
  title,
  content,
  summaryLength,
}: {
  url: string;
  title: string | null;
  content: string;
  summaryLength: SummaryLength;
}): SummaryPromptMessages {
  const spec = SUMMARY_LENGTH_SPECS[summaryLength];

  const systemPrompt = `You summarize online articles for users who want the key takeaways.

${spec.guidance}
${spec.formatting}

Rules:
- Write in direct, factual language
- Format the answer in Markdown
- Do not use emojis or disclaimers
- Base everything strictly on the provided content
- Do not invent or speculate beyond what is stated`;

  const contextLines: string[] = [`Source URL: ${url}`];
  if (title) {
    contextLines.push(`Title: ${title}`);
  }

  const userPrompt = `<context>
${contextLines.join('\n')}
</context>

<content>
${content}
</content>

Summarize the above content.`;

  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

export function getMaxTokensForLength(length: SummaryLength): number {
  return SUMMARY_LENGTH_SPECS[length].maxTokens;
}
