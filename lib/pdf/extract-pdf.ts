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
 * @param buffer - ArrayBuffer containing the PDF data
 * @returns Extracted text, page count, metadata, and word count
 */
export async function extractPdfText(buffer: ArrayBuffer): Promise<PdfExtractResult> {
  // Dynamic import for pdf-parse (works in both browser and Node.js)
  const { PDFParse } = await import("pdf-parse");

  // Convert ArrayBuffer to Uint8Array for pdf-parse
  const pdfData = new Uint8Array(buffer);

  // Create parser and parse the PDF
  const parser = new PDFParse({ data: pdfData });

  // Get text and info
  const [textResult, infoResult] = await Promise.all([
    parser.getText(),
    parser.getInfo(),
  ]);

  // Clean up parser
  await parser.destroy();

  // Extract text and clean it up
  const text = textResult.text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Extract metadata
  const metadata: PdfExtractResult["metadata"] = {};
  if (infoResult.info?.Title) {
    metadata.title = infoResult.info.Title;
  }
  if (infoResult.info?.Author) {
    metadata.author = infoResult.info.Author;
  }

  return {
    text,
    pageCount: infoResult.total,
    metadata,
    wordCount: countWords(text),
  };
}
