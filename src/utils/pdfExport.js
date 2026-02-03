import { jsPDF } from 'jspdf';

// Color schemes for light and dark themes
const COLORS = {
  light: {
    bg: [255, 255, 255],
    headerBg: [15, 118, 110],
    primary: [15, 118, 110],
    primaryDark: [17, 94, 89],
    text: [30, 41, 59],
    textSecondary: [71, 85, 105],
    cardBg: [241, 245, 249],
    accent: [204, 251, 241],
    border: [226, 232, 240],
    warning: [254, 243, 199],
    warningText: [120, 53, 15]
  },
  dark: {
    bg: [30, 41, 59],
    headerBg: [15, 118, 110],
    primary: [20, 184, 166],
    primaryDark: [94, 234, 212],
    text: [241, 245, 249],
    textSecondary: [148, 163, 184],
    cardBg: [51, 65, 85],
    accent: [6, 78, 59],
    border: [71, 85, 105],
    warning: [120, 53, 15],
    warningText: [254, 243, 199]
  }
};

// Sanitize text for PDF - replace Unicode with ASCII equivalents
function sanitizeText(text) {
  if (!text) return '';
  return String(text)
    // Greek letters
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/σ/g, 'sigma')
    .replace(/μ/g, 'mu')
    .replace(/δ/g, 'delta')
    .replace(/Δ/g, 'Delta')
    .replace(/π/g, 'pi')
    .replace(/Σ/g, 'Sum')
    .replace(/√/g, 'sqrt')
    // Subscripts and superscripts
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    // Special symbols
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/≠/g, '!=')
    .replace(/±/g, '+/-')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/·/g, '*')
    .replace(/∞/g, 'infinity')
    .replace(/≈/g, '~')
    // Bar notation
    .replace(/P̄/g, 'P-bar')
    .replace(/Q̄/g, 'Q-bar')
    .replace(/x̄/g, 'x-bar')
    // Clean up any remaining problematic characters
    .replace(/[^\x00-\x7F]/g, '');
}

export function exportToPDF(theme, calculation) {
  if (!calculation) {
    alert('Please perform a calculation first before exporting.');
    return;
  }

  const doc = new jsPDF();
  const colors = COLORS[theme] || COLORS.light;
  const isDark = theme === 'dark';
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  let y = 15;

  // Background for dark theme
  if (isDark) {
    doc.setFillColor(...colors.bg);
    doc.rect(0, 0, 210, 297, 'F');
  }

  // Header
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('KARMASTAT', 105, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Statistical Calculator', 105, 27, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const studyTitle = sanitizeText(calculation.studyType || 'Sample Size Calculation');
  doc.text(studyTitle, 105, 38, { align: 'center' });

  y = 55;

  // Study Type & Method
  doc.setFillColor(...colors.cardBg);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(...colors.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Study Type:', margin + 5, y + 8);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeText(calculation.studyType || 'N/A'), margin + 40, y + 8);

  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Method:', margin + 5, y + 16);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeText(calculation.method || 'N/A'), margin + 30, y + 16);

  y += 30;

  // Input Parameters
  doc.setFillColor(...colors.primary);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INPUT PARAMETERS', 105, y + 6, { align: 'center' });
  y += 12;

  doc.setFillColor(...colors.cardBg);
  const inputKeys = Object.keys(calculation.inputs || {});
  const inputHeight = inputKeys.length * 7 + 6;
  doc.roundedRect(margin, y, contentWidth, inputHeight, 3, 3, 'F');

  doc.setTextColor(...colors.text);
  doc.setFontSize(9);
  let inputY = y + 6;
  inputKeys.forEach(key => {
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizeText(key) + ':', margin + 5, inputY);
    doc.setFont('helvetica', 'normal');
    const value = sanitizeText(String(calculation.inputs[key]));
    doc.text(value, margin + 85, inputY);
    inputY += 7;
  });

  y += inputHeight + 8;

  // Formula
  doc.setFillColor(...colors.primary);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FORMULA', 105, y + 6, { align: 'center' });
  y += 12;

  doc.setFillColor(...colors.accent);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');

  const formulaText = sanitizeText(calculation.formula || 'N/A');
  const formulaLines = doc.splitTextToSize(formulaText, contentWidth - 10);
  doc.setTextColor(...colors.primaryDark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formulaLines, 105, y + 7, { align: 'center' });

  const explanationText = sanitizeText(calculation.formulaExplanation || '');
  const explanationLines = doc.splitTextToSize(explanationText, contentWidth - 10);
  doc.setTextColor(...colors.textSecondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(explanationLines, 105, y + 15, { align: 'center' });

  y += 28;

  // Step-by-Step Calculation
  doc.setFillColor(...colors.primary);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STEP-BY-STEP CALCULATION', 105, y + 6, { align: 'center' });
  y += 12;

  (calculation.steps || []).forEach((step, index) => {
    if (y > 250) {
      doc.addPage();
      if (isDark) {
        doc.setFillColor(...colors.bg);
        doc.rect(0, 0, 210, 297, 'F');
      }
      y = 20;
    }

    const stepCalc = sanitizeText(step.calc);
    const calcLines = doc.splitTextToSize(stepCalc, contentWidth - 25);
    const stepHeight = Math.max(14, calcLines.length * 4 + 10);

    doc.setFillColor(...colors.cardBg);
    doc.roundedRect(margin, y, contentWidth, stepHeight, 2, 2, 'F');

    // Step number circle
    doc.setFillColor(...colors.primary);
    doc.circle(margin + 8, y + 7, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), margin + 8, y + 8.5, { align: 'center' });

    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizeText(step.title), margin + 15, y + 5);

    doc.setTextColor(...colors.primaryDark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(calcLines, margin + 15, y + 10);

    y += stepHeight + 2;
  });

  y += 4;

  // Results
  if (y > 220) {
    doc.addPage();
    if (isDark) {
      doc.setFillColor(...colors.bg);
      doc.rect(0, 0, 210, 297, 'F');
    }
    y = 20;
  }

  doc.setFillColor(...colors.primary);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESULTS', 105, y + 6, { align: 'center' });
  y += 12;

  const resultKeys = Object.keys(calculation.results || {});
  const resultWidth = contentWidth / Math.max(resultKeys.length, 1);

  resultKeys.forEach((key, index) => {
    const x = margin + (index * resultWidth);
    const isPrimary = index === 0;

    if (isPrimary) {
      doc.setFillColor(...colors.primary);
    } else {
      doc.setFillColor(...colors.cardBg);
    }
    doc.roundedRect(x + 2, y, resultWidth - 4, 24, 3, 3, 'F');

    if (isPrimary) {
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(...colors.primaryDark);
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizeText(String(calculation.results[key])), x + resultWidth / 2, y + 10, { align: 'center' });

    if (isPrimary) {
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(...colors.textSecondary);
    }
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const keyLines = doc.splitTextToSize(sanitizeText(key), resultWidth - 8);
    doc.text(keyLines, x + resultWidth / 2, y + 17, { align: 'center' });
  });

  y += 32;

  // Interpretation
  if (y > 220) {
    doc.addPage();
    if (isDark) {
      doc.setFillColor(...colors.bg);
      doc.rect(0, 0, 210, 297, 'F');
    }
    y = 20;
  }

  doc.setFillColor(...colors.primary);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INTERPRETATION', 105, y + 6, { align: 'center' });
  y += 12;

  doc.setFillColor(...colors.warning);
  const interpretText = sanitizeText(calculation.interpretation || '');
  const interpretLines = doc.splitTextToSize(interpretText, contentWidth - 10);
  const interpretHeight = interpretLines.length * 4 + 8;
  doc.roundedRect(margin, y, contentWidth, interpretHeight, 3, 3, 'F');

  doc.setTextColor(...colors.warningText);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(interpretLines, margin + 5, y + 6);

  y += interpretHeight + 8;

  // Recommendations
  if (calculation.recommendations && calculation.recommendations.length > 0) {
    if (y > 240) {
      doc.addPage();
      if (isDark) {
        doc.setFillColor(...colors.bg);
        doc.rect(0, 0, 210, 297, 'F');
      }
      y = 20;
    }

    doc.setFillColor(...colors.primary);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATIONS', 105, y + 6, { align: 'center' });
    y += 12;

    doc.setFillColor(...colors.cardBg);
    const recHeight = calculation.recommendations.length * 7 + 6;
    doc.roundedRect(margin, y, contentWidth, recHeight, 3, 3, 'F');

    doc.setTextColor(...colors.text);
    doc.setFontSize(8);
    let recY = y + 6;
    calculation.recommendations.forEach(rec => {
      doc.setFont('helvetica', 'normal');
      const recText = '- ' + sanitizeText(rec);
      const recLines = doc.splitTextToSize(recText, contentWidth - 10);
      doc.text(recLines[0], margin + 5, recY);
      recY += 7;
    });

    y += recHeight + 8;
  }

  // Reference
  if (calculation.reference) {
    if (y > 265) {
      doc.addPage();
      if (isDark) {
        doc.setFillColor(...colors.bg);
        doc.rect(0, 0, 210, 297, 'F');
      }
      y = 20;
    }

    doc.setFillColor(...colors.cardBg);
    const refText = sanitizeText(calculation.reference);
    const refLines = doc.splitTextToSize(refText, contentWidth - 50);
    const refHeight = Math.max(14, refLines.length * 4 + 8);
    doc.roundedRect(margin, y, contentWidth, refHeight, 3, 3, 'F');

    doc.setTextColor(...colors.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Reference:', margin + 5, y + 6);

    doc.setTextColor(...colors.textSecondary);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(refLines, margin + 5, y + 12);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...colors.textSecondary);
    doc.text(
      'Generated by KARMASTAT | Where Selfless Work Meets Calculated Precision | Page ' + i + ' of ' + pageCount,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save('KARMASTAT_' + (calculation.type || 'calculation') + '_' + timestamp + '.pdf');
}

// Copy results to clipboard
export function copyToClipboard(calculation) {
  if (!calculation) {
    alert('No calculation results to copy.');
    return;
  }

  let text = 'KARMASTAT - ' + (calculation.studyType || 'Sample Size Calculation') + '\n';
  text += 'Method: ' + (calculation.method || 'N/A') + '\n\n';

  text += 'INPUT PARAMETERS:\n';
  Object.entries(calculation.inputs || {}).forEach(([key, value]) => {
    text += '  ' + key + ': ' + value + '\n';
  });

  text += '\nFORMULA: ' + (calculation.formula || 'N/A') + '\n';

  text += '\nRESULTS:\n';
  Object.entries(calculation.results || {}).forEach(([key, value]) => {
    text += '  ' + key + ': ' + value + '\n';
  });

  text += '\nINTERPRETATION:\n' + (calculation.interpretation || 'N/A') + '\n';

  if (calculation.reference) {
    text += '\nREFERENCE: ' + calculation.reference + '\n';
  }

  text += '\n---\nGenerated by KARMASTAT - Where Selfless Work Meets Calculated Precision';

  navigator.clipboard.writeText(text).then(() => {
    alert('Results copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy results. Please try again.');
  });
}

export default exportToPDF;
