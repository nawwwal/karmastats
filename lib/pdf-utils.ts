'use client';

export interface ExtractionPatterns {
  [key: string]: RegExp[];
}

/**
 * Extract plain text from a PDF document. The PDF.js worker is loaded
 * dynamically so this function can run in the browser only.
 */
export const extractTextFromPDF = async (
  arrayBuffer: ArrayBuffer,
): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction is only available on the client side');
  }

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
  const workerSrc = (
    await import('pdfjs-dist/legacy/build/pdf.worker.min?url')
  ).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let textContent = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent += text.items.map((s: any) => s.str || '').join(' ');
  }

  return textContent;
};

/**
 * Extract numeric parameters from text using configured regex patterns.
 */
export const extractParameters = (
  text: string,
  patterns: ExtractionPatterns,
): Record<string, number> => {
  const results: Record<string, number> = {};
  for (const [key, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      const match = text.match(regex);
      if (match) {
        const value = parseFloat(match[1]);
        if (!Number.isNaN(value)) {
          results[key] = value;
          break;
        }
      }
    }
  }
  return results;
};
