import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@/types/database';
import { sendOrderConfirmationEmail } from './email';

export interface ConfirmPaymentParams {
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface FailPaymentParams {
  orderId?: string;
  razorpayOrderId?: string;
  reason?: string;
}

export interface RefundPaymentParams {
  orderId?: string;
  razorpayOrderId?: string;
  refundId?: string;
}

/**
 * Atomically confirms payment for an order and decrements product inventory.
 * Idempotent: Subsequent calls for an already-paid order return immediately without re-decrementing stock.
 */
export async function confirmOrderPayment({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: ConfirmPaymentParams) {
  try {
    if (!orderId && !razorpayOrderId) {
      return { success: false, error: 'Order reference required for payment confirmation.' };
    }

    // 1. Find the order in the database
    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { razorpayOrderId: razorpayOrderId! },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found in database.' };
    }

    // 2. Idempotency Guard: If already marked PAID, return success without re-decrementing inventory
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { 
        success: true, 
        alreadyPaid: true, 
        orderId: order.id,
        message: 'Order payment was already processed.' 
      };
    }

    // 3. Atomic Database Transaction: Deduct stock and update payment state
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Safely decrement inventory for each line item
      for (const item of order.items) {
        if (!item.productId) continue;

        const dbProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!dbProduct) {
          console.warn(`Product ID '${item.productId}' not found during inventory deduction.`);
          continue;
        }

        // Validate that sufficient stock is available
        if (dbProduct.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${dbProduct.title}". Required: ${item.quantity}, Available: ${dbProduct.stockQuantity}`
          );
        }

        // Atomically decrement inventory
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update Order to PAID and PROCESSING
      const nextOrderStatus = order.orderStatus === OrderStatus.PENDING 
        ? OrderStatus.PROCESSING 
        : order.orderStatus;

      return await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: nextOrderStatus,
          paidAt: order.paidAt || new Date(),
          razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          razorpaySignature: razorpaySignature || order.razorpaySignature,
          razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
        },
      });
    });

    // 4. Dispatch Order Confirmation Email asynchronously (failures do NOT roll back payment)
    sendOrderConfirmationEmail({ ...updatedOrder, items: order.items }).catch((emailErr) => {
      console.error('Non-blocking error dispatching order confirmation email:', emailErr);
    });

    return { 
      success: true, 
      alreadyPaid: false, 
      orderId: updatedOrder.id,
      message: 'Payment confirmed and stock successfully deducted.' 
    };
  } catch (error) {
    console.error('Error confirming order payment:', error instanceof Error ? error.message : error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Database transaction failed during payment confirmation.' 
    };
  }
}

/**
 * Marks an order as FAILED / CANCELLED if it is not already PAID.
 */
export async function failOrderPayment({
  orderId,
  razorpayOrderId,
  reason,
}: FailPaymentParams) {
  try {
    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { razorpayOrderId: razorpayOrderId! },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Do not cancel orders that have already been paid
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { success: false, error: 'Cannot fail an order that is already marked as PAID.' };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        orderStatus: OrderStatus.CANCELLED,
        cancelledAt: order.cancelledAt || new Date(),
      },
    });

    return { 
      success: true, 
      orderId: order.id, 
      message: `Order marked as failed${reason ? `: ${reason}` : '.'}` 
    };
  } catch (error) {
    console.error('Error failing order payment:', error instanceof Error ? error.message : error);
    return { success: false, error: 'Failed to update order failure status.' };
  }
}

/**
 * Marks an order as REFUNDED.
 */
export async function refundOrderPayment({
  orderId,
  razorpayOrderId,
}: RefundPaymentParams) {
  try {
    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { razorpayOrderId: razorpayOrderId! },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    return { success: true, orderId: order.id, message: 'Order marked as REFUNDED.' };
  } catch (error) {
    console.error('Error recording order refund:', error instanceof Error ? error.message : error);
    return { success: false, error: 'Failed to record refund.' };
  }
}
