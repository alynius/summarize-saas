/**
 * PDF text extraction utilities
 */

export interface PdfExtractResult {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
  };
  wordCount: number;
}

/**
 * Count words in a text string
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Extract text content from a PDF buffer
 * Note: This function is for server-side use only (requires Node.js Buffer)
 * @param buffer - Buffer containing the PDF data
 * @returns Extracted text, page count, metadata, and word count
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  // Use require for pdf-parse (v1.x API)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");

  // Parse the PDF buffer
  const pdfData = await pdfParse(buffer);

  // Extract text and clean it up
  const text = pdfData.text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Extract metadata
  const metadata: PdfExtractResult["metadata"] = {};
  if (pdfData.info?.Title) {
    metadata.title = String(pdfData.info.Title);
  }
  if (pdfData.info?.Author) {
    metadata.author = String(pdfData.info.Author);
  }

  return {
    text,
    pageCount: pdfData.numpages,
    metadata,
    wordCount: countWords(text),
  };
}
