import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { SummarizeResult, SummaryLength } from './types';
import { buildSummaryPrompt, getMaxTokensForLength } from './prompts';

export type LLMProvider = 'openai' | 'anthropic' | 'google';

type ProviderConfig = {
  provider: LLMProvider;
  model: string;
};

function parseModelString(modelString: string): ProviderConfig {
  const [provider, ...modelParts] = modelString.split('/');
  const model = modelParts.join('/');

  if (!provider || !model) {
    throw new Error(
      `Invalid model string: ${modelString}. Expected format: provider/model (e.g., openai/gpt-4o)`
    );
  }

  if (!['openai', 'anthropic', 'google'].includes(provider)) {
    throw new Error(
      `Unsupported provider: ${provider}. Supported: openai, anthropic, google`
    );
  }

  return { provider: provider as LLMProvider, model };
}

function getProviderModel(config: ProviderConfig) {
  switch (config.provider) {
    case 'openai': {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openai(config.model);
    }
    case 'anthropic': {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(config.model);
    }
    case 'google': {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });
      return google(config.model);
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

export async function summarizeWithLLM({
  url,
  title,
  content,
  summaryLength,
  modelString,
}: {
  url: string;
  title: string | null;
  content: string;
  summaryLength: SummaryLength;
  modelString: string;
}): Promise<SummarizeResult> {
  const config = parseModelString(modelString);
  const model = getProviderModel(config);
  const prompt = buildSummaryPrompt({ url, title, content, summaryLength });
  const maxTokens = getMaxTokensForLength(summaryLength);

  const result = await generateText({
    model,
    system: prompt.system,
    prompt: prompt.user,
    maxOutputTokens: maxTokens,
  });

  const totalTokens =
    (result.usage?.inputTokens ?? 0) + (result.usage?.outputTokens ?? 0);

  return {
    summary: result.text,
    tokensUsed: totalTokens,
  };
}
