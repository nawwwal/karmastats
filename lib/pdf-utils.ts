'use client';

import { karmaTheme, lightTheme, darkTheme } from './theme';

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

// PDF Generation Types and Utilities
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
}

// Use centralized theme colors for PDF generation
export const pdfTheme = {
  colors: {
    primary: karmaTheme.colors.primary.DEFAULT, // #FF8C42
    secondary: karmaTheme.colors.secondary.DEFAULT, // #2C5282
    accent: karmaTheme.colors.accent.DEFAULT, // #F6AD55
    success: karmaTheme.colors.success.DEFAULT, // #38A169
    warning: karmaTheme.colors.warning.DEFAULT, // #D69E2E
    error: karmaTheme.colors.error.DEFAULT, // #E53E3E
  },

  textColors: {
    primary: karmaTheme.colors.gray[700], // #2D3748
    secondary: karmaTheme.colors.gray[600], // #4A5568
    muted: karmaTheme.colors.gray[500], // #718096
  },

  backgrounds: {
    light: '#F7FAFC', // bg-secondary from theme
    card: '#FFFFFF', // bg-primary from theme
    border: karmaTheme.colors.gray[200], // #E2E8F0
  },

  gradients: {
    primary: [karmaTheme.colors.primary.DEFAULT, karmaTheme.colors.primary[400]], // Orange gradient
    secondary: [karmaTheme.colors.secondary.DEFAULT, karmaTheme.colors.secondary[400]], // Blue gradient
  },
};

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
 * Convert hex color to RGB array for jsPDF
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
}

/**
 * Generates a modern, themed PDF report using centralized Karmastat theme
 */
export async function generateModernPDF(config: PDFReportConfig): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Header with gradient effect simulation using theme colors
  const headerHeight = 35;
  const primaryRgb = hexToRgb(pdfTheme.colors.primary);
  const secondaryRgb = hexToRgb(pdfTheme.colors.secondary);

  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Add a subtle secondary color strip
  doc.setFillColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
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
  const textPrimaryRgb = hexToRgb(pdfTheme.textColors.primary);
  const textSecondaryRgb = hexToRgb(pdfTheme.textColors.secondary);

  doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(config.title, margin, yPosition);
  yPosition += 10;

  if (config.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);
    doc.text(config.subtitle, margin, yPosition);
    yPosition += 8;
  }

  yPosition += 10;

  // Input Parameters Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
  doc.text('Input Parameters', margin, yPosition);
  yPosition += 8;

  // Input parameters in a styled box
  const inputBoxHeight = (config.inputs.length * 6) + 10;
  const bgLightRgb = hexToRgb(pdfTheme.backgrounds.light);
  const borderRgb = hexToRgb(pdfTheme.backgrounds.border);

  doc.setFillColor(bgLightRgb[0], bgLightRgb[1], bgLightRgb[2]);
  doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
  doc.roundedRect(margin, yPosition, contentWidth, inputBoxHeight, 3, 3, 'FD');

  yPosition += 8;

  config.inputs.forEach((input, index) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);

    const valueText = input.unit ? `${input.value} ${input.unit}` : input.value.toString();

    // Parameter label
    doc.text(input.label, margin + 5, yPosition);

    // Parameter value (right-aligned in its column)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
    const valueTextWidth = doc.getTextWidth(valueText);
    doc.text(valueText, margin + contentWidth - 5 - valueTextWidth, yPosition);

    yPosition += 6;
  });

  yPosition += 15;

  // Results Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
  doc.text('Results', margin, yPosition);
  yPosition += 8;

  // Group results by category
  const primaryResults = config.results.filter(r => r.highlight || r.category === 'primary');
  const secondaryResults = config.results.filter(r => !r.highlight && r.category !== 'primary');

  // Primary Results - Large highlighted numbers
  if (primaryResults.length > 0) {
    primaryResults.forEach((result, index) => {
      const resultBoxHeight = 25;

      // Alternating colors for primary results using theme colors
      const isOrange = index % 2 === 0;
      const bgColor = isOrange ? primaryRgb : secondaryRgb;
      const textColor = [255, 255, 255];

      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(margin, yPosition, contentWidth, resultBoxHeight, 5, 5, 'F');

      // Result label
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
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
    doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);
    doc.text('Additional Details', margin, yPosition);
    yPosition += 8;

    const detailsBoxHeight = (secondaryResults.length * 5) + 10;
    doc.setFillColor(bgLightRgb[0], bgLightRgb[1], bgLightRgb[2]);
    doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
    doc.roundedRect(margin, yPosition, contentWidth, detailsBoxHeight, 3, 3, 'FD');

    yPosition += 8;

    secondaryResults.forEach((result) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);

      const formattedValue = formatValue(result.value, result.format, result.precision);
      const valueWidth = doc.getTextWidth(formattedValue);

      doc.text(result.label, margin + 5, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
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
    doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
    doc.text('Interpretation & Recommendations', margin, yPosition);
    yPosition += 10;

    if (interpretation.summary) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);
      const lines = doc.splitTextToSize(interpretation.summary, contentWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 8;
    }

    if (interpretation.recommendations && interpretation.recommendations.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
      doc.text('Recommendations:', margin, yPosition);
      yPosition += 8;

      interpretation.recommendations.forEach((rec) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);
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
      doc.setTextColor(textPrimaryRgb[0], textPrimaryRgb[1], textPrimaryRgb[2]);
      doc.text('Assumptions:', margin, yPosition);
      yPosition += 8;

      interpretation.assumptions.forEach((assumption) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textSecondaryRgb[0], textSecondaryRgb[1], textSecondaryRgb[2]);
        doc.text('• ', margin + 5, yPosition);
        const lines = doc.splitTextToSize(assumption, contentWidth - 10);
        doc.text(lines, margin + 10, yPosition);
        yPosition += lines.length * 4 + 2;
      });
    }
  }

  // Footer
  const footerY = pageHeight - 15;
  const mutedRgb = hexToRgb(pdfTheme.textColors.muted);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedRgb[0], mutedRgb[1], mutedRgb[2]);
  doc.text('Generated by Karmastat - Statistical Analysis Platform', margin, footerY);

  const pageNumberText = `Page 1 of ${doc.internal.pages.length - 1}`;
  const pageNumberWidth = doc.getTextWidth(pageNumberText);
  doc.text(pageNumberText, pageWidth - margin - pageNumberWidth, footerY);

  // Generate filename with timestamp
  const filename = `karmastat-${config.calculatorType.toLowerCase().replace(/\s+/g, '-')}-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.pdf`;

  doc.save(filename);
}
