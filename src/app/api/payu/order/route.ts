import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@/types/database';
import { getAuthenticatedUser } from '@/lib/auth';
import { generatePayURequestHash, getPayUActionUrl, hasValidPayUConfig } from '@/lib/payu';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone,
      address, 
      city, 
      zip, 
      items,
    } = body;

    // 1. Input Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // 2. Fetch products from DB & calculate server-side amount
    const productIds = items.map((item: { id: string }) => item.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const dbProductMap = new Map(dbProducts.map(p => [p.id, p]));

    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const dbProd = dbProductMap.get(item.id);
      if (!dbProd) {
        return NextResponse.json({ error: `Product ID '${item.id}' was not found.` }, { status: 400 });
      }

      if (!dbProd.isActive) {
        return NextResponse.json({ error: `Product "${dbProd.title}" is currently unavailable.` }, { status: 400 });
      }

      const qty = Math.max(1, parseInt(String(item.quantity), 10) || 1);

      if (dbProd.stockQuantity <= 0) {
        return NextResponse.json({ error: `Product "${dbProd.title}" is out of stock.` }, { status: 400 });
      }

      if (qty > dbProd.stockQuantity) {
        return NextResponse.json({ 
          error: `Requested quantity (${qty}) exceeds available stock (${dbProd.stockQuantity}) for "${dbProd.title}".` 
        }, { status: 400 });
      }

      const itemSubtotal = dbProd.price * qty;
      calculatedSubtotal += itemSubtotal;

      verifiedOrderItems.push({
        productId: dbProd.id,
        productName: dbProd.title,
        sku: dbProd.sku || null,
        price: dbProd.price,
        quantity: qty,
        subtotal: itemSubtotal,
      });
    }

    if (calculatedSubtotal <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const authUser = await getAuthenticatedUser(req);
    const verifiedUserId = authUser ? authUser.id : null;

    const shippingAmount = 0;
    const discountAmount = 0;
    const calculatedTotal = calculatedSubtotal + shippingAmount - discountAmount;
    const fullAddress = [address, city, zip].filter(Boolean).join(', ') || 'Standard Shipping Address';

    // 3. Create Order in Database with PENDING status
    const order = await prisma.order.create({
      data: {
        userId: verifiedUserId,
        subtotal: calculatedSubtotal,
        shippingAmount: shippingAmount,
        discountAmount: discountAmount,
        totalAmount: calculatedTotal,
        customerName: customerName ? String(customerName).trim() : 'Guest Customer',
        customerEmail: String(customerEmail).trim().toLowerCase(),
        customerPhone: customerPhone ? String(customerPhone).trim() : null,
        shippingAddress: fullAddress,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
        paidAt: null,
        items: {
          create: verifiedOrderItems,
        },
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const hasKeys = hasValidPayUConfig();

    if (isProduction && !hasKeys) {
      console.error('Fatal: PayU credentials missing in production environment.');
      return NextResponse.json(
        { error: 'PayU gateway configuration error. Please contact store support.' },
        { status: 500 }
      );
    }

    // Generate unique transaction ID (alphanumeric, max 30 chars for PayU)
    const txnid = `tx_${order.id.replace(/-/g, '').slice(0, 16)}_${Date.now().toString().slice(-6)}`;

    // Store transaction reference on order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: txnid, // reusing primary external order reference field
      },
    });

    // Check if simulation mode (in development without credentials)
    if (!hasKeys) {
      return NextResponse.json({
        simulated: true,
        orderId: order.id,
        txnid: txnid,
        amount: calculatedTotal,
      });
    }

    const merchantKey = process.env.PAYU_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const surl = `${appUrl}/api/payu/response`;
    const furl = `${appUrl}/api/payu/response`;
    const formattedAmount = calculatedTotal.toFixed(2);
    const productInfo = `Sentinel AI Order ${order.id.slice(0, 8)}`;
    const firstNameClean = (customerName ? String(customerName).trim() : 'Customer').split(' ')[0] || 'Customer';
    const phoneClean = customerPhone ? String(customerPhone).replace(/\D/g, '') : '9999999999';

    const hash = generatePayURequestHash({
      key: merchantKey,
      txnid: txnid,
      amount: formattedAmount,
      productinfo: productInfo,
      firstname: firstNameClean,
      email: order.customerEmail,
      phone: phoneClean,
      surl: surl,
      furl: furl,
      salt: merchantSalt,
      udf1: order.id,
    });

    const actionUrl = getPayUActionUrl();

    return NextResponse.json({
      simulated: false,
      orderId: order.id,
      actionUrl: actionUrl,
      params: {
        key: merchantKey,
        txnid: txnid,
        amount: formattedAmount,
        productinfo: productInfo,
        firstname: firstNameClean,
        email: order.customerEmail,
        phone: phoneClean,
        surl: surl,
        furl: furl,
        hash: hash,
        udf1: order.id,
      },
    });
  } catch (error) {
    console.error('Error creating PayU order:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
