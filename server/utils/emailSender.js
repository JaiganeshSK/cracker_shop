const { Resend } = require('resend');

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_McZsmFqe_8KWUXM7puWGaXPmTLPeekMiP');

/* ─────────────────────────────────────────────────────────────
   Shared brand colors / helpers
───────────────────────────────────────────────────────────── */
const brand = {
  primary: '#f59e0b',       // amber
  primaryDark: '#d97706',
  success: '#10b981',       // emerald
  dark: '#0f172a',
  surface: '#1e293b',
  text: '#e2e8f0',
  muted: '#94a3b8',
  border: '#334155',
  white: '#ffffff',
};

/* ─────────────────────────────────────────────────────────────
   Build items table rows (shared)
───────────────────────────────────────────────────────────── */
const buildItemRows = (items) =>
  items.map((item, i) => `
  <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
    <td style="padding:12px 16px; font-size:13px; color:#1e293b; border-bottom:1px solid #e2e8f0;">
      <span style="font-weight:700; display:block;">${item.name}</span>
      <span style="color:#64748b; font-size:11px;">${item.piecePerBox || ''}</span>
    </td>
    <td style="padding:12px 16px; text-align:center; font-size:13px; font-weight:600; color:#1e293b; border-bottom:1px solid #e2e8f0;">${item.quantity}</td>
    <td style="padding:12px 16px; text-align:right; font-size:13px; color:#475569; border-bottom:1px solid #e2e8f0;">&#8377;${Number(item.price).toLocaleString('en-IN')}</td>
    <td style="padding:12px 16px; text-align:right; font-size:13px; font-weight:700; color:#0f172a; border-bottom:1px solid #e2e8f0;">&#8377;${Number(item.total).toLocaleString('en-IN')}</td>
  </tr>`).join('');

/* ─────────────────────────────────────────────────────────────
   EMAIL 1 — Customer Confirmation
───────────────────────────────────────────────────────────── */
const buildCustomerEmail = (order, shopName) => {
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const savings = (order.mrpTotal || 0) - (order.subtotal || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Order Confirmed — ${shopName}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

  <!-- ── TOP LOGO BAR ── -->
  <tr>
    <td align="center" style="padding-bottom:20px;">
      <span style="font-size:13px;color:#64748b;letter-spacing:1px;text-transform:uppercase;font-weight:600;">${shopName}</span>
    </td>
  </tr>

  <!-- ── SUCCESS HERO ── -->
  <tr>
    <td style="background:linear-gradient(135deg,#065f46 0%,#047857 50%,#059669 100%);border-radius:20px 20px 0 0;padding:40px 32px;text-align:center;">
      <div style="width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;line-height:72px;display:block;">🎉</span>
      </div>
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Order Confirmed!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Thank you, ${order.customer.name}. Your festive crackers are on the way!</p>
    </td>
  </tr>

  <!-- ── ORDER META PILL ── -->
  <tr>
    <td style="background:#ffffff;padding:24px 32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
        <tr>
          <td style="padding:16px 20px;border-right:1px solid #e2e8f0;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;margin-bottom:4px;">Order ID</div>
            <div style="font-size:14px;font-weight:800;color:#0f172a;font-family:monospace;">${order.orderId}</div>
          </td>
          <td style="padding:16px 20px;border-right:1px solid #e2e8f0;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;margin-bottom:4px;">Date</div>
            <div style="font-size:13px;font-weight:600;color:#0f172a;">${orderDate}</div>
          </td>
          <td style="padding:16px 20px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;margin-bottom:4px;">Payment</div>
            <div style="font-size:13px;font-weight:600;color:#0f172a;">${order.paymentMethod}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── DIVIDER ── -->
  <tr><td style="background:#ffffff;padding:24px 32px 8px;">
    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">Order Summary</p>
  </td></tr>

  <!-- ── ITEMS TABLE ── -->
  <tr>
    <td style="background:#ffffff;padding:0 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:700;border-bottom:2px solid #e2e8f0;">Item</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:700;border-bottom:2px solid #e2e8f0;">Qty</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:700;border-bottom:2px solid #e2e8f0;">Rate</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:700;border-bottom:2px solid #e2e8f0;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemRows(order.items)}
        </tbody>
      </table>
    </td>
  </tr>

  <!-- ── TOTALS ── -->
  <tr>
    <td style="background:#ffffff;padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${savings > 0 ? `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;">MRP Total</td>
          <td style="padding:6px 0;font-size:13px;color:#94a3b8;text-align:right;text-decoration:line-through;">&#8377;${Number(order.mrpTotal).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#059669;font-weight:600;">Festival Discount Saved</td>
          <td style="padding:6px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">- &#8377;${savings.toLocaleString('en-IN')}</td>
        </tr>` : ''}
        ${order.deliveryFee > 0 ? `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;">Delivery Fee</td>
          <td style="padding:6px 0;font-size:13px;color:#64748b;text-align:right;">&#8377;${Number(order.deliveryFee).toLocaleString('en-IN')}</td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="padding-top:12px;border-top:2px solid #e2e8f0;"></td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:16px;font-weight:800;color:#0f172a;">Grand Total</td>
          <td style="padding:8px 0;font-size:20px;font-weight:900;color:#d97706;text-align:right;">&#8377;${Number(order.totalAmount).toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── SHIPPING CARD ── -->
  <tr>
    <td style="background:#ffffff;padding:0 32px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:0;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#059669;font-weight:700;">📦 Shipping Destination</p>
            <p style="margin:0;font-size:13px;color:#065f46;line-height:1.7;">
              ${order.customer.address}${order.customer.landmark ? ', ' + order.customer.landmark : ''}<br>
              <strong>${order.customer.city}, ${order.customer.state} – ${order.customer.pincode}</strong>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── WHAT HAPPENS NEXT ── -->
  <tr>
    <td style="background:#ffffff;padding:0 32px 32px;">
      <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">What happens next?</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="32" valign="top" style="padding:4px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#fef3c7;color:#d97706;font-size:11px;font-weight:800;text-align:center;line-height:24px;">1</span></td>
          <td style="padding:4px 0 4px 8px;font-size:13px;color:#475569;">Our team reviews your order and confirms it via WhatsApp.</td>
        </tr>
        <tr>
          <td width="32" valign="top" style="padding:4px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#fef3c7;color:#d97706;font-size:11px;font-weight:800;text-align:center;line-height:24px;">2</span></td>
          <td style="padding:4px 0 4px 8px;font-size:13px;color:#475569;">Your crackers are packed securely with moisture barrier.</td>
        </tr>
        <tr>
          <td width="32" valign="top" style="padding:4px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#fef3c7;color:#d97706;font-size:11px;font-weight:800;text-align:center;line-height:24px;">3</span></td>
          <td style="padding:4px 0 4px 8px;font-size:13px;color:#475569;">LR / Transport tracking number is sent to you on WhatsApp.</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── FOOTER ── -->
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 20px 20px;padding:24px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#64748b;">Questions? Just reply to this email.</p>
      <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ${shopName} &bull; All rights reserved</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
};

/* ─────────────────────────────────────────────────────────────
   EMAIL 2 — Admin New Order Notification
───────────────────────────────────────────────────────────── */
const buildAdminEmail = (order, shopName) => {
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Order Alert — ${shopName}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:620px;" cellpadding="0" cellspacing="0">

  <!-- ── HEADER ── -->
  <tr>
    <td style="background:linear-gradient(135deg,#78350f 0%,#92400e 60%,#b45309 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.6);font-weight:700;">🛒 Admin Alert</p>
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">New Order Received!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">${orderDate}</p>
    </td>
  </tr>

  <!-- ── ORDER ID + AMOUNT ── -->
  <tr>
    <td style="background:#1e293b;padding:24px 32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #334155;border-radius:12px;">
        <tr>
          <td style="padding:20px 24px;border-right:1px solid #334155;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:6px;">Order ID</div>
            <div style="font-size:16px;font-weight:800;color:#f59e0b;font-family:monospace;">${order.orderId}</div>
          </td>
          <td style="padding:20px 24px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:6px;">Total Amount</div>
            <div style="font-size:22px;font-weight:900;color:#10b981;">&#8377;${Number(order.totalAmount).toLocaleString('en-IN')}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── CUSTOMER INFO ── -->
  <tr>
    <td style="background:#1e293b;padding:20px 32px 0;">
      <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;">👤 Customer Details</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #334155;border-radius:12px;">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
            <span style="font-size:12px;color:#64748b;">Name</span><br>
            <span style="font-size:14px;font-weight:700;color:#e2e8f0;">${order.customer.name}</span>
          </td>
          <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
            <span style="font-size:12px;color:#64748b;">Phone</span><br>
            <span style="font-size:14px;font-weight:700;color:#e2e8f0;">${order.customer.phone}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
            <span style="font-size:12px;color:#64748b;">WhatsApp</span><br>
            <span style="font-size:14px;font-weight:700;color:#e2e8f0;">${order.customer.whatsapp || order.customer.phone}</span>
          </td>
          <td style="padding:16px 20px;border-bottom:1px solid #1e293b;">
            <span style="font-size:12px;color:#64748b;">Email</span><br>
            <span style="font-size:14px;font-weight:700;color:#e2e8f0;">${order.customer.email || '—'}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:16px 20px;">
            <span style="font-size:12px;color:#64748b;">Delivery Address</span><br>
            <span style="font-size:13px;font-weight:600;color:#e2e8f0;line-height:1.6;">${order.customer.address}${order.customer.landmark ? ', ' + order.customer.landmark : ''}, ${order.customer.city}, ${order.customer.state} – ${order.customer.pincode}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── ITEMS ── -->
  <tr>
    <td style="background:#1e293b;padding:20px 32px 0;">
      <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;">📦 Ordered Items (${order.items.length} Varieties)</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #334155;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#1e293b;">
            <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #334155;">Item</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #334155;">Qty</th>
            <th style="padding:10px 16px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;border-bottom:1px solid #334155;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, i) => `
          <tr style="background:${i % 2 === 0 ? '#0f172a' : '#1e293b'};">
            <td style="padding:11px 16px;font-size:13px;color:#e2e8f0;border-bottom:1px solid #334155;font-weight:600;">${item.name}<br><span style="font-size:11px;color:#64748b;font-weight:400;">${item.piecePerBox || ''}</span></td>
            <td style="padding:11px 16px;text-align:center;font-size:14px;font-weight:800;color:#f59e0b;border-bottom:1px solid #334155;">${item.quantity}</td>
            <td style="padding:11px 16px;text-align:right;font-size:13px;font-weight:700;color:#e2e8f0;border-bottom:1px solid #334155;">&#8377;${Number(item.total).toLocaleString('en-IN')}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#0f172a;">
            <td colspan="2" style="padding:14px 16px;font-size:14px;font-weight:800;color:#e2e8f0;">Grand Total</td>
            <td style="padding:14px 16px;text-align:right;font-size:18px;font-weight:900;color:#10b981;">&#8377;${Number(order.totalAmount).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    </td>
  </tr>

  <!-- ── QUICK ACTION ── -->
  <tr>
    <td style="background:#1e293b;padding:20px 32px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="https://wa.me/${order.customer.phone ? order.customer.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1') : ''}?text=Hello%20${encodeURIComponent(order.customer.name)}%2C%20we%20received%20your%20order%20%23${order.orderId}.%20We%20will%20confirm%20shortly!"
              style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;">
              💬 Reply on WhatsApp
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── FOOTER ── -->
  <tr>
    <td style="background:#0f172a;border:1px solid #1e293b;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#475569;">${shopName} Admin Notification &bull; &copy; ${new Date().getFullYear()}</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
};

/* ─────────────────────────────────────────────────────────────
   SEND — Customer Email
───────────────────────────────────────────────────────────── */
const sendOrderConfirmationEmail = async (order, setting) => {
  const shopName = setting?.shopName || 'Cracker Shop';

  if (!order.customer || !order.customer.email) {
    console.log('[Email] No customer email — skipping customer confirmation.');
    return;
  }

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `${shopName} Orders <onboarding@resend.dev>`,
      to: order.customer.email,
      subject: `🎉 Order Confirmed — #${order.orderId} | ${shopName}`,
      html: buildCustomerEmail(order, shopName),
    });
    if (error) console.error('[Email] Customer email error:', error);
    else console.log('[Email] Customer confirmation sent →', order.customer.email);
  } catch (err) {
    console.error('[Email] Customer email exception:', err.message);
  }
};

/* ─────────────────────────────────────────────────────────────
   SEND — Admin Notification Email
───────────────────────────────────────────────────────────── */
const sendAdminOrderNotification = async (order, setting) => {
  const shopName = setting?.shopName || 'Cracker Shop';
  // Admin email: use setting.email, fallback to admin username (stored as email in authRoutes)
  const adminEmail = setting?.email;

  if (!adminEmail) {
    console.log('[Email] No admin email in settings — skipping admin notification.');
    return;
  }

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `${shopName} Orders <onboarding@resend.dev>`,
      to: adminEmail,
      subject: `🛒 New Order #${order.orderId} — ₹${Number(order.totalAmount).toLocaleString('en-IN')} | ${shopName}`,
      html: buildAdminEmail(order, shopName),
    });
    if (error) console.error('[Email] Admin notification error:', error);
    else console.log('[Email] Admin notification sent →', adminEmail);
  } catch (err) {
    console.error('[Email] Admin notification exception:', err.message);
  }
};

module.exports = { sendOrderConfirmationEmail, sendAdminOrderNotification };
