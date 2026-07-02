import { mockDelay } from './delay';

export type PaymentMethod = 'upi' | 'card' | 'wallet';

export type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'processing'
  | 'verifying'
  | 'success'
  | 'failed';

export type PaymentProgress = {
  status: PaymentStatus;
  message: string;
  txnId?: string;
};

const STEPS: { status: PaymentStatus; message: string; ms: number }[] = [
  { status: 'initiating', message: 'Connecting to Razorpay (demo)...', ms: 600 },
  { status: 'processing', message: 'Processing payment...', ms: 900 },
  { status: 'verifying', message: 'Verifying with bank / UPI...', ms: 800 },
  { status: 'success', message: 'Payment successful!', ms: 400 },
];

/** Simulates real-time payment — demo only, no real gateway. */
export async function simulateDemoPayment(
  opts: {
    batchId: string;
    amount: number;
    method: PaymentMethod;
    onProgress: (p: PaymentProgress) => void;
  },
): Promise<{ txnId: string; paidAt: string }> {
  const txnId = `EDDVA-DEMO-${Date.now().toString(36).toUpperCase()}`;
  for (const step of STEPS) {
    opts.onProgress({ status: step.status, message: step.message, txnId });
    await new Promise(r => setTimeout(r, step.ms));
  }
  await mockDelay(200);
  opts.onProgress({
    status: 'success',
    message: `Paid ${opts.amount} via ${opts.method.toUpperCase()}`,
    txnId,
  });
  return { txnId, paidAt: new Date().toISOString() };
}
