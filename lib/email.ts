import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend] Warning: RESEND_API_KEY is not set in environment variables.');
    return null;
  }
  return new Resend(apiKey);
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'Alpona <onboarding@resend.dev>';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface OrderItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Common styles to keep email layout simple
const containerStyle = 'max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000; font-family: Arial, sans-serif; padding: 20px;';
const headerStyle = 'text-align: center; padding-bottom: 20px; border-bottom: 2px solid #B8763C;';
const brandStyle = 'color: #B8763C; font-size: 24px; font-weight: bold; margin: 0;';
const buttonStyle = 'display: inline-block; background-color: #B8763C; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 20px;';
const highlightBoxStyle = 'background-color: #FCF5F0; border-left: 4px solid #B8763C; padding: 12px; margin: 20px 0;';

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  items,
  shippingAddress,
  total,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  total: number;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[Resend] Skipped sending order confirmation email because RESEND_API_KEY is missing.');
    return { data: null, error: new Error('RESEND_API_KEY missing') };
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.size} / ${item.color}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        <h1 style="${brandStyle}">ALPONA</h1>
      </div>
      <p>Hi ${customerName},</p>
      <p>Your order has been confirmed and is now being processed!</p>
      
      <div style="${highlightBoxStyle}">
        <strong>Order Number:</strong> ${orderNumber}
      </div>

      <h3 style="color: #B8763C;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="padding: 8px; border-bottom: 2px solid #eee; text-align: left;">Item</th>
            <th style="padding: 8px; border-bottom: 2px solid #eee; text-align: center;">Variant</th>
            <th style="padding: 8px; border-bottom: 2px solid #eee; text-align: center;">Qty</th>
            <th style="padding: 8px; border-bottom: 2px solid #eee; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total Paid:</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; color: #B8763C;">₹${total}</td>
          </tr>
        </tfoot>
      </table>

      <h3 style="color: #B8763C;">Shipping Address</h3>
      <p style="margin: 0;">${shippingAddress.name}</p>
      <p style="margin: 0;">${shippingAddress.address}</p>
      <p style="margin: 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${baseUrl}/order/track?order=${orderNumber}" style="${buttonStyle}">Track Your Order</a>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: fromEmail,
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html,
  });
}

export async function sendShippingUpdateEmail({
  to,
  customerName,
  orderNumber,
  trackingUrl,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingUrl: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[Resend] Skipped sending shipping update email because RESEND_API_KEY is missing.');
    return { data: null, error: new Error('RESEND_API_KEY missing') };
  }

  const html = `
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        <h1 style="${brandStyle}">ALPONA</h1>
      </div>
      <p>Hi ${customerName},</p>
      <p>Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.</p>
      
      <div style="${highlightBoxStyle}">
        <p style="margin: 0;"><strong>Estimated delivery:</strong> 5–7 business days</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${trackingUrl}" style="${buttonStyle}">Track Shipment</a>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: fromEmail,
    to,
    subject: `Your order ${orderNumber} is on its way!`,
    html,
  });
}

export const sendOrderShippingUpdateEmail = sendShippingUpdateEmail

export async function sendPaymentFailedEmail({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[Resend] Skipped sending payment failed email because RESEND_API_KEY is missing.');
    return { data: null, error: new Error('RESEND_API_KEY missing') };
  }

  const html = `
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        <h1 style="${brandStyle}">ALPONA</h1>
      </div>
      <p>Hi ${customerName},</p>
      <p>We noticed that your payment could not be processed for order <strong>${orderNumber}</strong>.</p>
      
      <p>Don't worry, your items are still waiting for you. You can try completing your purchase again using a different payment method.</p>

      <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
        <a href="${baseUrl}/checkout" style="${buttonStyle}">Try Again</a>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">If you believe this is an error or need assistance, please reply to this email to contact our support team.</p>
    </div>
  `;

  return resend.emails.send({
    from: fromEmail,
    to,
    subject: `Payment failed for order ${orderNumber}`,
    html,
  });
}

export async function sendAccountLockoutEmail({
  to,
}: {
  to: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[Resend] Skipped sending account lockout email because RESEND_API_KEY is missing.');
    return { data: null, error: new Error('RESEND_API_KEY missing') };
  }

  const resetUrl = `${baseUrl}/auth/forgot-password`;
  const html = `
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        <h1 style="${brandStyle}">ALPONA</h1>
      </div>
      <h2 style="color: #d9534f; margin-top: 20px;">Security Alert: Account Temporarily Locked</h2>
      <p>Hi,</p>
      <p>We detected multiple consecutive failed login attempts on your account. For your security, your account has been temporarily locked for 15 minutes.</p>
      
      <div style="${highlightBoxStyle}">
        <p style="margin: 0;"><strong>Lockout duration:</strong> 15 minutes</p>
        <p style="margin: 5px 0 0 0;">If this was not you, someone may be trying to access your account.</p>
      </div>

      <p>If you forgot your password or need to reset it, click the link below:</p>

      <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
        <a href="${resetUrl}" style="${buttonStyle}">Reset Your Password</a>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">If you made these attempts, please wait 15 minutes before trying to sign in again.</p>
    </div>
  `;

  return resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Security Alert: Account Temporarily Locked',
    html,
  });
}
