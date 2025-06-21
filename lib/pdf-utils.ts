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

// Modern PDF Generation Utilities
export interface PDFTheme {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
  };
}

export const karmaTheme: PDFTheme = {
  primary: '#f97316', // orange-500
  secondary: '#eab308', // yellow-500
  accent: '#F8FDCF',
  neutral: '#F6F1F1',
  text: {
    primary: '#1f2937', // gray-800
    secondary: '#4b5563', // gray-600
    muted: '#9ca3af', // gray-400
  },
  gradients: {
    primary: ['#f97316', '#fb923c'], // orange-500 to orange-400
    secondary: ['#eab308', '#fbbf24'], // yellow-500 to yellow-400
  },
};

export interface PDFInputField {
  label: string;
  value: string | number;
  unit?: string;
}

export interface PDFResultItem {
  label: string;
  value: number | string;
  highlight?: boolean;
  category?: 'primary' | 'secondary' | 'statistical';
  format?: 'integer' | 'decimal' | 'percentage' | 'custom';
  precision?: number;
}

export interface PDFReportConfig {
  title: string;
  subtitle?: string;
  calculatorType: string;
  inputs: PDFInputField[];
  results: PDFResultItem[];
  interpretation?: {
    summary?: string;
    recommendations?: string[];
    assumptions?: string[];
    limitations?: string[];
  };
  theme?: PDFTheme;
}

/**
 * Formats a number based on the specified format type
 */
export function formatValue(
  value: number | string,
  format: string = 'decimal',
  precision: number = 2
): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'integer':
      return Math.round(value).toLocaleString();
    case 'decimal':
      return value.toFixed(precision);
    case 'percentage':
      return `${(value * 100).toFixed(precision)}%`;
    default:
      return value.toString();
  }
}

/**
 * Generates a modern, themed PDF report
 */
export async function generateModernPDF(config: PDFReportConfig): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const theme = config.theme || karmaTheme;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Header with gradient effect simulation
  const headerHeight = 35;
  doc.setFillColor(247, 115, 22); // primary color
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Add a subtle secondary color strip
  doc.setFillColor(234, 179, 8); // secondary color
  doc.rect(0, headerHeight - 3, pageWidth, 3, 'F');

  // Logo/Brand area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('KARMASTAT', margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Statistical Analysis Platform', margin, 28);

  // Date and time in header
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  const dateTimeText = `Generated: ${dateStr} at ${timeStr}`;
  const dateTimeWidth = doc.getTextWidth(dateTimeText);
  doc.text(dateTimeText, pageWidth - margin - dateTimeWidth, 20);

  yPosition = headerHeight + 20;

  // Report Title
  doc.setTextColor(31, 41, 55); // text primary
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(config.title, margin, yPosition);
  yPosition += 10;

  if (config.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // text secondary
    doc.text(config.subtitle, margin, yPosition);
    yPosition += 8;
  }

  yPosition += 10;

  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Input Parameters', margin, yPosition);
  yPosition += 8;

  // Input parameters in a styled box
  const inputBoxHeight = (config.inputs.length * 6) + 10;
  doc.setFillColor(249, 250, 251); // very light gray
  doc.setDrawColor(229, 231, 235); // border gray
  doc.roundedRect(margin, yPosition, contentWidth, inputBoxHeight, 3, 3, 'FD');

  yPosition += 8;

  config.inputs.forEach((input, index) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);

    const valueText = input.unit ? `${input.value} ${input.unit}` : input.value.toString();
    const labelWidth = contentWidth * 0.6;
    const valueWidth = contentWidth * 0.4;

    // Parameter label
    doc.text(input.label, margin + 5, yPosition);

    // Parameter value (right-aligned in its column)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    const valueTextWidth = doc.getTextWidth(valueText);
    doc.text(valueText, margin + contentWidth - 5 - valueTextWidth, yPosition);

    yPosition += 6;
  });

  yPosition += 15;

  // Results Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Results', margin, yPosition);
  yPosition += 8;

  // Group results by category
  const primaryResults = config.results.filter(r => r.highlight || r.category === 'primary');
  const secondaryResults = config.results.filter(r => !r.highlight && r.category !== 'primary');

  // Primary Results - Large highlighted numbers
  if (primaryResults.length > 0) {
    primaryResults.forEach((result, index) => {
      const resultBoxHeight = 25;

      // Alternating colors for primary results
      const isOrange = index % 2 === 0;
      const bgColor = isOrange ? [247, 115, 22] : [234, 179, 8]; // primary : secondary
      const textColor = [255, 255, 255];

      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, yPosition, contentWidth, resultBoxHeight, 5, 5, 'F');

      // Result label
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(result.label, margin + 10, yPosition + 8);

      // Result value - large and prominent
      const formattedValue = formatValue(result.value, result.format, result.precision);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const valueWidth = doc.getTextWidth(formattedValue);
      doc.text(formattedValue, margin + contentWidth - 10 - valueWidth, yPosition + 16);

      yPosition += resultBoxHeight + 5;
    });

    yPosition += 10;
  }

  // Secondary Results - Compact table format
  if (secondaryResults.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Additional Details', margin, yPosition);
    yPosition += 8;

    const detailsBoxHeight = (secondaryResults.length * 5) + 10;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, yPosition, contentWidth, detailsBoxHeight, 3, 3, 'FD');

    yPosition += 8;

    secondaryResults.forEach((result) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);

      const formattedValue = formatValue(result.value, result.format, result.precision);
      const valueWidth = doc.getTextWidth(formattedValue);

      doc.text(result.label, margin + 5, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(formattedValue, margin + contentWidth - 5 - valueWidth, yPosition);

      yPosition += 5;
    });

    yPosition += 15;
  }

  // Interpretation Section
  if (config.interpretation) {
    const interpretation = config.interpretation;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Interpretation & Recommendations', margin, yPosition);
    yPosition += 10;

    if (interpretation.summary) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const lines = doc.splitTextToSize(interpretation.summary, contentWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 8;
    }

    if (interpretation.recommendations && interpretation.recommendations.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Recommendations:', margin, yPosition);
      yPosition += 8;

      interpretation.recommendations.forEach((rec) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text('• ', margin + 5, yPosition);
        const lines = doc.splitTextToSize(rec, contentWidth - 10);
        doc.text(lines, margin + 10, yPosition);
        yPosition += lines.length * 4 + 2;
      });

      yPosition += 8;
    }

    if (interpretation.assumptions && interpretation.assumptions.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Assumptions:', margin, yPosition);
      yPosition += 8;

      interpretation.assumptions.forEach((assumption) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text('• ', margin + 5, yPosition);
        const lines = doc.splitTextToSize(assumption, contentWidth - 10);
        doc.text(lines, margin + 10, yPosition);
        yPosition += lines.length * 4 + 2;
      });
    }
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // muted text
  doc.text('Generated by Karmastat - Statistical Analysis Platform', margin, footerY);

  const pageNumberText = `Page 1 of ${doc.internal.pages.length - 1}`;
  const pageNumberWidth = doc.getTextWidth(pageNumberText);
  doc.text(pageNumberText, pageWidth - margin - pageNumberWidth, footerY);

  // Generate filename with timestamp
  const filename = `karmastat-${config.calculatorType.toLowerCase().replace(/\s+/g, '-')}-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.pdf`;

  doc.save(filename);
}
