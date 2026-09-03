import { NextRequest, NextResponse } from 'next/server';
import { fetchPayUCheckoutDetails, hasValidPayUConfig } from '@/lib/payu';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount) || 100;

    if (!hasValidPayUConfig()) {
      return NextResponse.json({
        status: 1,
        msg: 'PayU simulation mode: mock checkout details',
        result: {
          paymentOptions: {
            upi: { enabled: true, title: 'UPI' },
            cards: { enabled: true, title: 'Credit & Debit Cards' },
            netbanking: { enabled: true, title: 'Net Banking' },
            wallets: { enabled: true, title: 'Wallets' },
          },
        },
      });
    }

    const details = await fetchPayUCheckoutDetails(amount);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error in PayU getCheckoutDetails API:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to fetch PayU checkout details' }, { status: 500 });
  }
}
