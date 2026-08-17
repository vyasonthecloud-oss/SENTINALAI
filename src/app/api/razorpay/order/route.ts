import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@/types/database';
import { getAuthenticatedUser } from '@/lib/auth';

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

    // 2. Fetch products from DB & calculate server-side amount (zero trust on client values)
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

    // 3. Create Order in Database with PENDING status (Stock is NOT yet deducted)
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

    // 4. Create Razorpay Order
    const isProduction = process.env.NODE_ENV === 'production';
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    const hasValidKeys = Boolean(
      razorpayKeyId && 
      razorpayKeyId !== 'rzp_test_dummy_key' && 
      razorpayKeySecret && 
      razorpayKeySecret !== 'dummy_secret'
    );

    if (isProduction && !hasValidKeys) {
      console.error('Fatal: Live Razorpay credentials missing in production environment.');
      return NextResponse.json(
        { error: 'Payment gateway configuration error. Please contact store support.' },
        { status: 500 }
      );
    }

    let razorpayOrderId = '';
    const currency = 'INR';
    const amountPaise = Math.round(calculatedTotal * 100);

    if (!hasValidKeys) {
      // Non-production development simulation mode
      razorpayOrderId = 'order_simulated_' + order.id;
    } else {
      const razorpay = new Razorpay({
        key_id: razorpayKeyId!,
        key_secret: razorpayKeySecret!,
      });

      const options = {
        amount: amountPaise,
        currency: currency,
        receipt: order.id,
        notes: {
          orderId: order.id,
          customerEmail: order.customerEmail,
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    }

    // 5. Store Razorpay Order ID on local Order
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        razorpayOrderId: razorpayOrderId,
      },
    });

    return NextResponse.json({
      id: razorpayOrderId,
      currency: currency,
      amount: amountPaise,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
