import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmOrderPayment, failOrderPayment, refundOrderPayment } from '@/lib/paymentProcessor';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.warn('Webhook received without x-razorpay-signature header.');
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret is not configured on server.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // 1. Verify Webhook HMAC-SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const actualBuf = Buffer.from(signature, 'utf-8');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      console.warn('Webhook signature verification failed.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // 2. Parse Event Payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    // Safe event logging without printing keys or credentials
    console.log(`Razorpay Webhook Event Received: [${eventType}] - Event ID: ${event.id || 'N/A'}`);

    // 3. Process Events Idempotently
    switch (eventType) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = payload.payment?.entity;
        const orderEntity = payload.order?.entity;

        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const razorpayPaymentId = paymentEntity?.id;
        const localOrderId = paymentEntity?.notes?.orderId || orderEntity?.receipt;

        if (razorpayOrderId || localOrderId) {
          const result = await confirmOrderPayment({
            orderId: localOrderId,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
          });

          if (result.alreadyPaid) {
            console.log(`Webhook: Order ${result.orderId} was already paid. No-op.`);
          } else if (result.success) {
            console.log(`Webhook: Order ${result.orderId} successfully marked PAID.`);
          } else {
            console.error(`Webhook: Failed to confirm payment for order ${localOrderId || razorpayOrderId}: ${result.error}`);
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = payload.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const localOrderId = paymentEntity?.notes?.orderId;
        const errorDesc = paymentEntity?.error_description || paymentEntity?.error_code || 'Payment failed';

        if (razorpayOrderId || localOrderId) {
          await failOrderPayment({
            orderId: localOrderId,
            razorpayOrderId: razorpayOrderId,
            reason: errorDesc,
          });
          console.log(`Webhook: Payment failure recorded for ${localOrderId || razorpayOrderId}`);
        }
        break;
      }

      case 'refund.processed':
      case 'refund.created': {
        const refundEntity = payload.refund?.entity;
        const paymentEntity = payload.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;

        if (razorpayOrderId) {
          await refundOrderPayment({
            razorpayOrderId: razorpayOrderId,
            refundId: refundEntity?.id,
          });
          console.log(`Webhook: Refund recorded for order ${razorpayOrderId}`);
        }
        break;
      }

      default:
        // Acknowledge unhandled event types cleanly
        console.log(`Webhook: Unhandled event type [${eventType}] acknowledged.`);
        break;
    }

    return NextResponse.json({ status: 'ok', event: eventType });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
