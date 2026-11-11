import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

type EmailOptions = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP credentials not set. Simulated email:', { to, subject })
    return { messageId: 'simulated-id' }
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || `WhatsyMart <${process.env.SMTP_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ''),
  })
}

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsyMart</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f4c35 0%, #1a7a4a 60%, #22c55e 100%); padding: 32px 36px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header span { color: #fbbf24; }
    .body { padding: 32px 36px; color: #0f172a; line-height: 1.6; }
    .footer { background: #f8fafc; padding: 20px 36px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0f4c35, #22c55e); color: white !important; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Whatsy<span>Mart</span></h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2026 WhatsyMart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

export const emailTemplates = {
  orderConfirmation: (data: {
    customerName: string
    orderId: string
    items: { name: string; qty: number; price: number }[]
    total: number
    currency: string
  }) => ({
    subject: `Order Confirmed — #${data.orderId.slice(0, 8).toUpperCase()} | WhatsyMart`,
    html: baseTemplate(`
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi <strong>${data.customerName}</strong>,</p>
      <p>Your order has been received and is being prepared.</p>
      <hr class="divider">
      <h3>Order Summary</h3>
      ${data.items
        .map(
          (i) =>
            `<p>${i.name} × ${i.qty} — <strong>${data.currency} ${(
              i.price * i.qty
            ).toFixed(2)}</strong></p>`
        )
        .join('')}
      <hr class="divider">
      <p><strong>Total: ${data.currency} ${data.total.toFixed(2)}</strong></p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/account/orders" class="btn">View Orders</a>
    `),
  }),

  bankTransferInstructions: (data: {
    customerName: string
    orderId: string
    amount: number
    currency: string
    bankDetails: string
  }) => ({
    subject: `Bank Transfer Instructions — #${data.orderId.slice(0, 8).toUpperCase()} | WhatsyMart`,
    html: baseTemplate(`
      <h2>Complete Your Bank Transfer</h2>
      <p>Hi <strong>${data.customerName}</strong>,</p>
      <p>Please transfer <strong>${data.currency} ${data.amount.toFixed(2)}</strong> using the following details:</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;font-family:monospace;font-size:14px;margin:16px 0;">
        ${data.bankDetails}
      </div>
      <p><strong>Payment Reference:</strong> <span class="badge">WM-${data.orderId.slice(0, 8).toUpperCase()}</span></p>
      <p style="color:#64748b;font-size:14px;">Include this reference in your transfer remark. Your order will be verified within 24–48 hours.</p>
    `),
  }),

  // ── Seller Verification Emails ──────────────────────────────────────────

  applicationReceived: (data: { sellerName: string; storeName: string }) => ({
    subject: `Application Received — ${data.storeName} | WhatsyMart`,
    html: baseTemplate(`
      <h2>Application Received! 📋</h2>
      <p>Hi <strong>${data.sellerName}</strong>,</p>
      <p>Thank you for applying to sell on <strong>WhatsyMart</strong>! We've received your verification application for <strong>${data.storeName}</strong>.</p>
      <hr class="divider">
      <h3>What happens next?</h3>
      <ul style="line-height:2;">
        <li>✅ Our team will review your application within <strong>24–48 hours</strong></li>
        <li>📄 We may contact you if additional documents are needed</li>
        <li>📧 You'll receive an email once a decision is made</li>
      </ul>
      <hr class="divider">
      <p style="color:#64748b;font-size:14px;">Questions? Reply to this email or contact our seller support team.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/seller" class="btn">View Your Dashboard</a>
    `),
  }),

  applicationApproved: (data: { sellerName: string; storeName: string; storeSlug: string }) => ({
    subject: `🎉 Congratulations! Your Store is Approved — ${data.storeName} | WhatsyMart`,
    html: baseTemplate(`
      <h2>You're Approved! 🎉</h2>
      <p>Hi <strong>${data.sellerName}</strong>,</p>
      <p>Great news! Your seller application for <strong>${data.storeName}</strong> has been <strong style="color:#16a34a;">approved</strong>. Your store is now live on WhatsyMart!</p>
      <hr class="divider">
      <h3>Next Steps</h3>
      <ul style="line-height:2;">
        <li>🛒 <strong>Add your products</strong> — Go to your Seller Dashboard</li>
        <li>⚡ <strong>Enable WhatsApp ordering</strong> — Set up your WhatsApp number in settings</li>
        <li>📸 <strong>Upload high-quality images</strong> — They convert 3× better</li>
        <li>💰 <strong>Set up payouts</strong> — Add your bank / mobile money details</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/seller" class="btn">Go to Seller Dashboard →</a>
      <hr class="divider">
      <p style="color:#64748b;font-size:14px;">Your store page: <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/store/${data.storeSlug}">${process.env.NEXT_PUBLIC_APP_URL || ''}/store/${data.storeSlug}</a></p>
    `),
  }),

  applicationRejected: (data: {
    sellerName: string
    storeName: string
    reason: string
  }) => ({
    subject: `Seller Application Update — ${data.storeName} | WhatsyMart`,
    html: baseTemplate(`
      <h2>Application Update</h2>
      <p>Hi <strong>${data.sellerName}</strong>,</p>
      <p>Thank you for your interest in selling on WhatsyMart. After reviewing your application for <strong>${data.storeName}</strong>, we were unable to approve it at this time.</p>
      <hr class="divider">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;margin:16px 0;">
        <h3 style="color:#dc2626;margin-top:0;">Reason</h3>
        <p style="margin-bottom:0;">${data.reason}</p>
      </div>
      <hr class="divider">
      <h3>What can you do?</h3>
      <ul style="line-height:2;">
        <li>📄 Address the issues mentioned above</li>
        <li>🔄 Re-apply with updated documents</li>
        <li>📧 Contact us if you have questions about the decision</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/become-a-seller" class="btn">Re-Apply →</a>
      <hr class="divider">
      <p style="color:#64748b;font-size:14px;">We encourage you to re-apply after addressing the feedback. We look forward to welcoming you to WhatsyMart.</p>
    `),
  }),
}
