'use client';

import * as pdfjs from 'pdfjs-dist';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjs.getDocument(typedArray).promise;
    let textContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map(s => s.str).join(' ');
    }

    return textContent;
};
