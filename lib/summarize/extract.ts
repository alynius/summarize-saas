import type { ExtractedContent } from './types';

const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

const DEFAULT_TIMEOUT_MS = 10000;

function stripCssFromHtml(html: string): string {
  return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export async function extractContentFromUrl(
  url: string,
  options: { timeoutMs?: number } = {}
): Promise<ExtractedContent> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL (status ${response.status})`);
    }

    const finalUrl = response.url || url;
    const html = await response.text();
    const cleanedHtml = stripCssFromHtml(html);

    const { Readability } = await import('@mozilla/readability');
    const { JSDOM, VirtualConsole } = await import('jsdom');

    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', () => {
      // Suppress jsdom CSS parsing errors
    });

    const dom = new JSDOM(cleanedHtml, { url: finalUrl, virtualConsole });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new Error('Could not extract article content from URL');
    }

    const text = article.textContent.replace(/\s+/g, ' ').trim();

    return {
      text,
      title: article.title || null,
      excerpt: article.excerpt || null,
      finalUrl,
      wordCount: countWords(text),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
