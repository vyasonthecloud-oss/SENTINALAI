import { NextRequest, NextResponse } from 'next/server';
import { confirmOrderPayment, failOrderPayment } from '@/lib/paymentProcessor';
import { verifyPayUResponseHash, hasValidPayUConfig } from '@/lib/payu';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let params: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      params = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    }

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      mihpayid,
      hash,
      key,
      udf1: orderId,
      udf2,
      udf3,
      udf4,
      udf5,
      additionalCharges,
      error_Message,
    } = params;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!orderId && !txnid) {
      return NextResponse.json({ error: 'Missing order reference' }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const hasKeys = hasValidPayUConfig();
    const merchantSalt = process.env.PAYU_MERCHANT_SALT || 'dummy_salt';

    // Check if simulation mode in non-production
    const isSimulated = !isProduction && (!hasKeys || String(params.simulated) === 'true');

    let isHashValid = isSimulated;

    if (!isSimulated && hash && key) {
      isHashValid = verifyPayUResponseHash({
        key: key,
        txnid: txnid || '',
        amount: amount || '',
        productinfo: productinfo || '',
        firstname: firstname || '',
        email: email || '',
        status: status || '',
        receivedHash: hash,
        salt: merchantSalt,
        udf1: orderId || '',
        udf2: udf2 || '',
        udf3: udf3 || '',
        udf4: udf4 || '',
        udf5: udf5 || '',
        additionalCharges: additionalCharges,
      });
    }

    const isSuccess = isHashValid && (status === 'success' || isSimulated);

    if (isSuccess) {
      await confirmOrderPayment({
        orderId: orderId,
        razorpayOrderId: txnid,
        razorpayPaymentId: mihpayid || `payu_${Date.now()}`,
        razorpaySignature: hash || 'payu_verified_hash',
      });

      const redirectUrl = `${appUrl}/orders/${orderId || txnid}?payment=success`;

      // Return HTML auto-redirect for seamless cross-domain POST navigation
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
            <title>Payment Successful - Redirecting...</title>
          </head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h2>Payment Successful!</h2>
            <p>Redirecting you to your order summary...</p>
            <script>window.location.href = "${redirectUrl}";</script>
          </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    } else {
      // Record failure state
      await failOrderPayment({
        orderId: orderId,
        razorpayOrderId: txnid,
        reason: error_Message || (isHashValid ? 'PayU reported transaction failure' : 'Hash signature mismatch'),
      });

      const redirectUrl = `${appUrl}/orders/${orderId || txnid}?payment=failed`;

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
            <title>Payment Failed - Redirecting...</title>
          </head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #fff;">
            <h2>Payment Verification Failed</h2>
            <p>Redirecting you back to your order...</p>
            <script>window.location.href = "${redirectUrl}";</script>
          </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }
  } catch (error) {
    console.error('Error handling PayU response callback:', error instanceof Error ? error.message : 'Unknown error');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/checkout?error=payu_processing_failed`, 303);
  }
}
