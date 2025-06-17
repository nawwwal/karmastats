'use client';

export const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // Dynamic import to prevent SSR issues
    if (typeof window === 'undefined') {
        throw new Error('PDF extraction is only available on the client side');
    }

    const pdfjs = await import('pdfjs-dist');

    // Set the worker source
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjs.getDocument(typedArray).promise;
    let textContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((s: any) => s.str || '').join(' ');
    }

    return textContent;
};
