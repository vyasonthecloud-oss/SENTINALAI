'use server';

import { prisma } from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { OrderStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '@/lib/email';

const VALID_TRANSITIONS: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export async function updateOrderStatusAction(orderId: string, targetStatus: string) {
  try {
    // 1. Server-side ADMIN authorization verification
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return { 
        success: false, 
        error: 'Unauthorized. Administrator privileges required.' 
      };
    }

    if (!orderId || typeof orderId !== 'string') {
      return { success: false, error: 'Invalid order ID.' };
    }

    // 2. Fetch existing order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // 3. Idempotent check
    if (order.orderStatus === targetStatus) {
      return { 
        success: true, 
        message: `Order is already in ${targetStatus} status.` 
      };
    }

    // 4. Validate state-machine transition
    const allowedNext = VALID_TRANSITIONS[order.orderStatus] || [];
    if (!allowedNext.includes(targetStatus)) {
      return { 
        success: false, 
        error: `Cannot transition order from '${order.orderStatus}' to '${targetStatus}'.` 
      };
    }

    // 5. Prepare lifecycle timestamps
    const updateData: {
      orderStatus: string;
      shippedAt?: Date;
      deliveredAt?: Date;
      cancelledAt?: Date;
    } = {
      orderStatus: targetStatus,
    };

    if (targetStatus === OrderStatus.SHIPPED && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (targetStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    if (targetStatus === OrderStatus.CANCELLED && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    // 6. Update database record
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // 7. Dispatch Email Notifications asynchronously (failures do NOT roll back status)
    if (targetStatus === OrderStatus.SHIPPED) {
      sendOrderShippedEmail(updatedOrder).catch((err) => {
        console.error('Non-blocking error dispatching shipping email:', err);
      });
    } else if (targetStatus === OrderStatus.DELIVERED) {
      sendOrderDeliveredEmail(updatedOrder).catch((err) => {
        console.error('Non-blocking error dispatching delivery email:', err);
      });
    }

    // 8. Revalidate customer and admin routes
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');

    return { 
      success: true, 
      message: `Order #${orderId.substring(0, 8)} transitioned to ${targetStatus}.` 
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while updating order status.' 
    };
  }
}
