import { Order, OrderItem } from '@prisma/client';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Sentinal AI <orders@sentinalai.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Base email dispatch utility using Resend REST API.
 * Never throws an unhandled error so email delivery failures do not roll back transactions.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; mock?: boolean; error?: string }> {
  try {
    if (!to || !to.includes('@')) {
      console.warn('sendEmail: Invalid recipient email address.');
      return { success: false, error: 'Invalid recipient email' };
    }

    const isTestMode = !RESEND_API_KEY || 
      RESEND_API_KEY === 'dummy_resend_key' || 
      RESEND_API_KEY.startsWith('re_dummy') ||
      process.env.NODE_ENV !== 'production' && !RESEND_API_KEY;

    if (isTestMode) {
      // Safe development/test console simulation
      console.log(`\n================== [SENTINAL AI EMAIL MOCK] ==================`);
      console.log(`To: ${to}`);
      console.log(`From: ${EMAIL_FROM}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview: HTML template generated (${html.length} bytes)`);
      console.log(`==============================================================\n`);
      return { success: true, mock: true };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Resend API returned error:', errorData.message || res.statusText);
      return { success: false, error: errorData.message || 'Email delivery failed' };
    }

    console.log(`Email successfully dispatched to ${to} [${subject}]`);
    return { success: true };
  } catch (error) {
    console.error('Safe Email Dispatch Error:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: error instanceof Error ? error.message : 'Network error during email dispatch' };
  }
}

/**
 * Email wrapper styled with Sentinal AI dark glassmorphism aesthetic.
 */
function wrapEmailTemplate(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #fafafa;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #121215;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      padding: 28px;
      text-align: center;
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #ffffff;
      margin: 0;
    }
    .tagline {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 4px;
    }
    .content {
      padding: 32px 28px;
    }
    .btn {
      display: inline-block;
      background-color: #10b981;
      color: #000000 !important;
      font-weight: 800;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      margin: 20px 0;
    }
    .footer {
      padding: 24px 28px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #71717a;
      text-align: center;
      line-height: 1.6;
    }
    .item-row {
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 12px 0;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .total-card {
      background-color: #18181b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 16px 20px;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">SENTINAL AI</div>
      <div class="tagline">Industrial Electronic Hardware & Components</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">Sentinal AI Hardware Logistics • Bangalore, India</p>
      <p style="margin: 0;">This is an automated transactional notification. If you have questions, please reach out to support@sentinalai.com.</p>
    </div>
  </div>
</body>
</html>
  `;
}

type OrderWithItems = Order & { items: OrderItem[] };

/**
 * 1. ORDER & PAYMENT CONFIRMATION EMAIL
 */
export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  const orderUrl = `${APP_URL}/orders/${order.id}`;

  const itemsHtml = order.items.map(item => `
    <tr class="item-row">
      <td style="padding: 10px 0; vertical-align: top;">
        <strong style="color: #ffffff; font-size: 13px;">${item.productName}</strong>
        ${item.sku ? `<div style="font-size: 11px; color: #a1a1aa; font-family: monospace;">SKU: ${item.sku}</div>` : ''}
        <div style="font-size: 11px; color: #71717a;">Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</div>
      </td>
      <td style="padding: 10px 0; text-align: right; vertical-align: top; font-family: monospace; font-weight: 700; color: #10b981;">
        ₹${(item.subtotal || (item.price * item.quantity)).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = wrapEmailTemplate(
    `Order Confirmed #${order.id.substring(0, 8)}`,
    `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; rounded-full: 9999px; border-radius: 50px;">
          ✓ Payment Confirmed
        </span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 16px 0 6px 0; color: #ffffff;">Thank You for Your Order!</h2>
        <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
          Hi <strong>${order.customerName}</strong>, your payment has been processed and our warehouse team is preparing your hardware components for dispatch.
        </p>
      </div>

      <div style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #71717a;">Order Reference:</span>
          <strong style="color: #10b981; font-family: monospace;">#${order.id}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #71717a;">Order Date:</span>
          <span style="color: #e4e4e7;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        ${order.shippingAddress ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
            <span style="color: #71717a; display: block; margin-bottom: 3px;">Delivery Destination:</span>
            <span style="color: #e4e4e7;">${order.shippingAddress}</span>
          </div>
        ` : ''}
      </div>

      <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 12px;">
        Order Items (${order.items.length})
      </h3>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #a1a1aa;">
          <span>Subtotal</span>
          <span style="font-family: monospace; color: #ffffff;">₹${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #a1a1aa;">
          <span>Express Shipping</span>
          <span style="font-family: monospace; color: #10b981;">${order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount.toFixed(2)}`}</span>
        </div>
        ${order.discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #10b981;">
            <span>Discount Applied</span>
            <span style="font-family: monospace;">-₹${order.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding-top: 12px; margin-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 16px; font-weight: 800;">
          <span style="color: #ffffff;">Total Paid</span>
          <span style="color: #10b981; font-family: monospace;">₹${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${orderUrl}" class="btn">Track Order Progress</a>
      </div>
    `
  );

  return await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation #${order.id.substring(0, 8)} - Sentinal AI`,
    html,
  });
}

/**
 * 2. SHIPPING UPDATE EMAIL
 */
export async function sendOrderShippedEmail(order: Order) {
  const orderUrl = `${APP_URL}/orders/${order.id}`;

  const html = wrapEmailTemplate(
    `Your Order #${order.id.substring(0, 8)} Has Shipped!`,
    `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 50px;">
          🚀 Package Dispatched
        </span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 16px 0 6px 0; color: #ffffff;">Your Components Are on the Way!</h2>
        <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
          Hi <strong>${order.customerName}</strong>, your package has been verified, securely packaged, and handed over to our express logistics courier partner.
        </p>
      </div>

      <div style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 18px; margin: 24px 0; font-size: 13px;">
        <div style="margin-bottom: 10px;">
          <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase;">Order Number</span>
          <strong style="color: #10b981; font-family: monospace; font-size: 14px;">#${order.id}</strong>
        </div>
        <div style="margin-bottom: 10px;">
          <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase;">Dispatched At</span>
          <span style="color: #ffffff;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase;">Estimated Delivery Time</span>
          <span style="color: #06b6d4; font-weight: 700;">2 - 4 Business Days</span>
        </div>
        ${order.shippingAddress ? `
          <div style="padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <span style="color: #71717a; display: block; font-size: 11px; text-transform: uppercase;">Destination Address</span>
            <span style="color: #e4e4e7;">${order.shippingAddress}</span>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${orderUrl}" class="btn">View Live Tracking</a>
      </div>
    `
  );

  return await sendEmail({
    to: order.customerEmail,
    subject: `Order Shipped #${order.id.substring(0, 8)} - Sentinal AI`,
    html,
  });
}

/**
 * 3. DELIVERY UPDATE EMAIL
 */
export async function sendOrderDeliveredEmail(order: Order) {
  const orderUrl = `${APP_URL}/orders/${order.id}`;

  const html = wrapEmailTemplate(
    `Order Delivered #${order.id.substring(0, 8)}`,
    `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 50px;">
          ✓ Package Delivered
        </span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 16px 0 6px 0; color: #ffffff;">Your Package Has Arrived!</h2>
        <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
          Hi <strong>${order.customerName}</strong>, your Sentinal AI component package has been successfully delivered.
        </p>
      </div>

      <div style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 18px; margin: 24px 0; font-size: 13px;">
        <div style="margin-bottom: 8px;">
          <span style="color: #71717a;">Order ID:</span>
          <strong style="color: #10b981; font-family: monospace;">#${order.id}</strong>
        </div>
        <div>
          <span style="color: #71717a;">Delivery Completed:</span>
          <span style="color: #ffffff;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #a1a1aa; text-align: center;">
        Need technical assistance or datasheet documentation for your components? You can view order invoices and support directly from your dashboard.
      </p>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${orderUrl}" class="btn">View Order Details & Invoices</a>
      </div>
    `
  );

  return await sendEmail({
    to: order.customerEmail,
    subject: `Delivered: Order #${order.id.substring(0, 8)} - Sentinal AI`,
    html,
  });
}

/**
 * 4. PASSWORD RESET EMAIL
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: {
  to: string;
  name: string;
  resetLink: string;
}) {
  const html = wrapEmailTemplate(
    'Reset Your Password | Sentinal AI',
    `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 50px;">
          🔒 Security Notification
        </span>
        <h2 style="font-size: 22px; font-weight: 800; margin: 16px 0 6px 0; color: #ffffff;">Password Reset Request</h2>
        <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
          Hi <strong>${name}</strong>, we received a request to reset the password for your Sentinal AI account.
        </p>
      </div>

      <p style="font-size: 13px; color: #d4d4d8; text-align: center; line-height: 1.6;">
        Click the button below to establish a new password for your account. This link is cryptographically signed and will expire in <strong>60 minutes</strong>.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetLink}" class="btn">Reset My Password</a>
      </div>

      <div style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
        <strong>Security Notice:</strong> If you did not initiate this password reset request, please ignore this email. Your existing password remains secure.
      </div>
    `
  );

  return await sendEmail({
    to,
    subject: 'Password Reset Request - Sentinal AI',
    html,
  });
}
