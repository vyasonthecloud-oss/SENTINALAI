import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmOrderPayment, failOrderPayment } from '@/lib/paymentProcessor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (isProduction && (!secret || secret === 'dummy_secret')) {
      console.error('Fatal: RAZORPAY_KEY_SECRET is not configured in production.');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const effectiveSecret = secret || 'dummy_secret';

    const isSimulatedMode = Boolean(
      !isProduction &&
      String(razorpay_order_id).startsWith('order_simulated_') && 
      (!secret || secret === 'dummy_secret')
    );

    let isValid = isSimulatedMode;

    // 1. Cryptographic Signature Verification
    if (!isValid) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Incomplete payment credentials' }, { status: 400 });
      }

      const shasum = crypto.createHmac('sha256', effectiveSecret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      const digestBuf = Buffer.from(digest, 'utf-8');
      const signatureBuf = Buffer.from(String(razorpay_signature), 'utf-8');

      isValid = digestBuf.length === signatureBuf.length && crypto.timingSafeEqual(digestBuf, signatureBuf);
    }

    if (!isValid) {
      // Signature mismatch - record failed payment state safely
      await failOrderPayment({ 
        orderId, 
        razorpayOrderId: razorpay_order_id, 
        reason: 'Payment signature mismatch' 
      });
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Atomic, Idempotent Payment Confirmation & Inventory Deduction
    const result = await confirmOrderPayment({
      orderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id ? String(razorpay_payment_id) : undefined,
      razorpaySignature: razorpay_signature ? String(razorpay_signature) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Payment processing error' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      alreadyPaid: result.alreadyPaid,
      message: result.message 
    });
  } catch (error) {
    console.error('Error verifying payment:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
