export interface ReceiptVerificationResult {
  rawText: string;
  isRahelBerhane: boolean;
  detectedReceiver: string | null;
  detectedDate: string | null;
  detectedAmount: number | null;
  amountMatches: boolean | null;
  detectedTxnId: string | null;
  overallStatus: 'VERIFIED' | 'WARNING' | 'MISMATCH';
  statusMessage: string;
}

export function parseReceiptText(rawText: string, expectedAmount?: number): ReceiptVerificationResult {
  const clean = rawText.replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  // 1. Receiver Name Check (Target: Rahel Berhane / Rachel Berhane / ራሔል በርሀነ)
  const hasRahel = lower.includes('rahel') || lower.includes('rachel') || clean.includes('ራሔል');
  const hasBerhane = lower.includes('berhane') || lower.includes('birhane') || clean.includes('በርሀነ') || clean.includes('ብርሃነ');
  const isRahelBerhane = (lower.includes('rahel berhane') || lower.includes('rachel berhane') || (hasRahel && hasBerhane));

  let detectedReceiver: string | null = null;
  // Look for patterns like "for Rahel Berhane Weldemariam ETB..." or "to Rahel Berhane"
  const receiverMatch = clean.match(/(?:for|to|beneficiary|receiver|credited to)\s+([A-Za-z\s]{4,40}?)(?:ETB|on |with |account|\d|\.|\,)/i);
  if (receiverMatch) {
    detectedReceiver = receiverMatch[1].trim();
  } else if (isRahelBerhane) {
    const m = clean.match(/(?:Rahel|Rachel)\s+(?:Berhane|Birhane)[A-Za-z\s]*/i);
    detectedReceiver = m ? m[0].trim() : 'Rahel Berhane';
  }

  // 2. Date Check
  const dateMatch = clean.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)?/i)
    || clean.match(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)?\b/)
    || clean.match(/\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/);
  const detectedDate = dateMatch ? dateMatch[0].trim() : null;

  // 3. Amount Check
  // Patterns like "ETB 250.00" or "250.00 ETB" or "Amount: 250"
  const amountMatch = clean.match(/ETB\s*([0-9,]+(?:\.[0-9]{1,2})?)/i)
    || clean.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*ETB/i)
    || clean.match(/(?:Amount|Total)[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  
  let detectedAmount: number | null = null;
  if (amountMatch) {
    const num = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(num)) detectedAmount = num;
  }

  let amountMatches: boolean | null = null;
  if (detectedAmount !== null && expectedAmount !== undefined) {
    // Allow slight tolerance for bank service charge or exact match
    amountMatches = Math.abs(detectedAmount - expectedAmount) < 5 || detectedAmount >= expectedAmount;
  }

  // 4. Transaction ID / Reference Check
  const txnMatch = clean.match(/(?:transaction\s*id|txn\s*id|ref(?:erence)?\s*(?:no)?|ft(?:\d|[A-Z])+)[ :\-]*([A-Z0-9]{6,20})/i)
    || clean.match(/\b(FT[0-9A-Z]{8,14})\b/i);
  const detectedTxnId = txnMatch ? txnMatch[1].trim() : null;

  // 5. Determine Overall Status
  let overallStatus: 'VERIFIED' | 'WARNING' | 'MISMATCH' = 'WARNING';
  let statusMessage = '';

  if (isRahelBerhane && (amountMatches === true || amountMatches === null)) {
    overallStatus = 'VERIFIED';
    statusMessage = 'Verified: Transferred to Rahel Berhane with matching details.';
  } else if (!isRahelBerhane) {
    overallStatus = 'MISMATCH';
    statusMessage = 'Warning: Receiver name does not match Rahel Berhane.';
  } else if (amountMatches === false) {
    overallStatus = 'WARNING';
    statusMessage = `Warning: Detected amount (${detectedAmount} ETB) does not match expected (${expectedAmount} ETB).`;
  }

  return {
    rawText,
    isRahelBerhane,
    detectedReceiver,
    detectedDate,
    detectedAmount,
    amountMatches,
    detectedTxnId,
    overallStatus,
    statusMessage,
  };
}

export async function verifyReceiptImage(imageUrl: string, expectedAmount?: number): Promise<ReceiptVerificationResult> {
  const win = typeof window !== 'undefined' ? (window as any) : null;
  if (!win || !win.Tesseract) {
    return {
      rawText: '',
      isRahelBerhane: false,
      detectedReceiver: null,
      detectedDate: null,
      detectedAmount: null,
      amountMatches: null,
      detectedTxnId: null,
      overallStatus: 'WARNING',
      statusMessage: 'OCR scanner loading or not available. Please verify manually.',
    };
  }

  try {
    const result = await win.Tesseract.recognize(imageUrl, 'eng');
    const text = result?.data?.text || '';
    return parseReceiptText(text, expectedAmount);
  } catch (err) {
    return {
      rawText: '',
      isRahelBerhane: false,
      detectedReceiver: null,
      detectedDate: null,
      detectedAmount: null,
      amountMatches: null,
      detectedTxnId: null,
      overallStatus: 'WARNING',
      statusMessage: 'Unable to scan screenshot automatically. Please inspect image manually.',
    };
  }
}
