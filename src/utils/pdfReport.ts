import html2pdf from 'html2pdf.js';
import { PDFDocument } from 'pdf-lib';

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadPdfArrayBuffer(buffer: ArrayBuffer, filename: string) {
  downloadPdfBytes(new Uint8Array(buffer), filename);
}

export async function generatePdfArrayBufferFromElement(el: HTMLElement, options: any): Promise<ArrayBuffer> {
  // html2pdf returns a Worker with chainable API.
  // We convert the generated jsPDF to ArrayBuffer so we can merge PDFs.
  const worker: any = html2pdf().set(options).from(el).toPdf();
  const jsPdf: any = await worker.get('pdf');
  return jsPdf.output('arraybuffer');
}

export async function mergePdfArrayBufferWithDataUrl(
  basePdf: ArrayBuffer,
  appendPdfDataUrl: string
): Promise<Uint8Array> {
  const baseDoc = await PDFDocument.load(basePdf);
  const appendBytes = dataUrlToUint8Array(appendPdfDataUrl);
  const appendDoc = await PDFDocument.load(appendBytes);

  const merged = await PDFDocument.create();

  const basePages = await merged.copyPages(baseDoc, baseDoc.getPageIndices());
  basePages.forEach((p) => merged.addPage(p));

  const appendPages = await merged.copyPages(appendDoc, appendDoc.getPageIndices());
  appendPages.forEach((p) => merged.addPage(p));

  return merged.save();
}
