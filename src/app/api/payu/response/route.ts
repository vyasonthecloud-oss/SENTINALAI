import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { confirmOrderPayment, failOrderPayment } from '@/lib/paymentProcessor';
import { verifyPayUResponseHash, getEffectivePayUSalt } from '@/lib/payu';

function resolveAppUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host && !host.includes('localhost')) {
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  const origin = req.nextUrl?.origin;
  if (origin && !origin.includes('localhost')) {
    return origin.replace(/\/$/, '');
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.sentinalai.store';
  }
  return 'http://localhost:3000';
}

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

    const appUrl = resolveAppUrl(req);

    if (!orderId && !txnid) {
      return NextResponse.redirect(`${appUrl}/checkout?error=missing_order`, 303);
    }

    // Locate the order in the database
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          orderId ? { id: orderId } : undefined,
          txnid ? { razorpayOrderId: txnid } : undefined,
          txnid ? { id: txnid } : undefined,
        ].filter(Boolean) as Array<{ id?: string; razorpayOrderId?: string }>,
      },
    });

    const targetOrderId = existingOrder ? existingOrder.id : (orderId || txnid);
    const isProduction = process.env.NODE_ENV === 'production';
    const merchantSalt = getEffectivePayUSalt();

    // Check if simulation mode in non-production
    const isSimulated = !isProduction && String(params.simulated) === 'true';

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
        orderId: targetOrderId,
        razorpayOrderId: txnid,
        razorpayPaymentId: mihpayid || `payu_${Date.now()}`,
        razorpaySignature: hash || 'payu_verified_hash',
      });

      const redirectUrl = `${appUrl}/orders/${targetOrderId}?payment=success`;
      return NextResponse.redirect(redirectUrl, 303);
    } else {
      await failOrderPayment({
        orderId: targetOrderId,
        razorpayOrderId: txnid,
        reason: error_Message || (isHashValid ? 'PayU reported transaction failure' : 'Hash signature mismatch'),
      });

      const redirectUrl = `${appUrl}/orders/${targetOrderId}?payment=failed`;
      return NextResponse.redirect(redirectUrl, 303);
    }
  } catch (error) {
    console.error('Error handling PayU response callback:', error instanceof Error ? error.message : 'Unknown error');
    const appUrl = resolveAppUrl(req);
    return NextResponse.redirect(`${appUrl}/checkout?error=payu_processing_failed`, 303);
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const orderId = searchParams.get('udf1') || searchParams.get('orderId');
    const txnid = searchParams.get('txnid');
    const appUrl = resolveAppUrl(req);

    if (orderId || txnid) {
      return NextResponse.redirect(`${appUrl}/orders/${orderId || txnid}`, 303);
    }
    return NextResponse.redirect(`${appUrl}/checkout`, 303);
  } catch {
    const appUrl = resolveAppUrl(req);
    return NextResponse.redirect(`${appUrl}/checkout`, 303);
  }
}
