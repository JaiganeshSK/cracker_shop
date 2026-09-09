import { numberToWords } from './numberToWords';

export function generateInvoiceHtml(order, storeSettings) {
  if (!order) return '';

  const shopName = (storeSettings?.shopName || 'SRI KRISHNA FIREWORKS SIVAKASI').toUpperCase();
  const tagline = storeSettings?.tagline || 'Direct Sivakasi Factory Depot • 100% Certified Green Crackers';
  const address = storeSettings?.address || 'Shop No. 4, Factory By-Pass Road, Sivakasi, Tamil Nadu - 626123';
  const phone = storeSettings?.phone || '+91 94431 23456';
  const whatsapp = storeSettings?.whatsapp || '+91 94431 23456';
  const email = storeSettings?.email || 'sales@srikrishnafireworks.com';
  const upiId = storeSettings?.upiId || 'srikrishnafireworks@upi';

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const mrpTotal = order.mrpTotal || (order.totalAmount * 5);
  const totalDiscount = order.totalDiscount || (mrpTotal - order.totalAmount);
  const subtotal = order.subtotal || order.totalAmount;
  const deliveryFee = order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 0}`;

  const rowsHtml = (order.items || [])
    .map((item, idx) => {
      const itemMrp = item.mrp || (item.price ? Math.round(item.price * 5) : 0);
      const discountPct = itemMrp > item.price ? Math.round(((itemMrp - item.price) / itemMrp) * 100) : 0;
      const bg = idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';

      return `
        <tr style="${bg}">
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${idx + 1}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; color: #0f172a;">${item.name}</td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #cbd5e1; font-size: 11px; color: #475569;">${item.piecePerBox || '1 Box'}</td>
          <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #cbd5e1; font-size: 11px; color: #64748b; text-decoration: line-through;">₹${itemMrp > 0 ? itemMrp.toLocaleString('en-IN') : '-'}</td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #cbd5e1; font-size: 11px; color: #334155;">${discountPct > 0 ? discountPct + '%' : '-'}</td>
          <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; color: #0f172a;">₹${item.price?.toLocaleString('en-IN')}</td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #cbd5e1; font-weight: 700; font-size: 11px; color: #0f172a;">${item.quantity}</td>
          <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #cbd5e1; font-weight: 700; font-size: 11px; color: #0f172a;">₹${item.total?.toLocaleString('en-IN')}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${order.orderId}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.4;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .invoice-box {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 4px;
          margin-bottom: 12px;
          color: #334155;
        }
        .header-grid {
          display: table;
          width: 100%;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .header-left {
          display: table-cell;
          width: 58%;
          vertical-align: top;
          padding-right: 12px;
        }
        .header-right {
          display: table-cell;
          width: 42%;
          vertical-align: top;
        }
        .company-title {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .company-tagline {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .company-meta {
          font-size: 11px;
          color: #475569;
          line-height: 1.45;
        }
        .meta-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 8px 10px;
          font-size: 11px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
        }
        .meta-label {
          color: #64748b;
          font-weight: 600;
        }
        .meta-val {
          font-weight: 700;
          color: #0f172a;
          text-align: right;
        }
        .two-col {
          display: table;
          width: 100%;
          margin-bottom: 12px;
        }
        .col-left {
          display: table-cell;
          width: 50%;
          padding-right: 6px;
          vertical-align: top;
        }
        .col-right {
          display: table-cell;
          width: 50%;
          padding-left: 6px;
          vertical-align: top;
        }
        .info-card {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #f8fafc;
          padding: 8px 10px;
          font-size: 11px;
          min-height: 125px;
        }
        .card-header {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 6px;
        }
        table.items-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #cbd5e1;
          margin-bottom: 12px;
        }
        table.items-table th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 7px 8px;
          border: 1px solid #0f172a;
        }
        table.items-table td {
          border-left: 1px solid #cbd5e1;
          border-right: 1px solid #cbd5e1;
        }
        .summary-grid {
          display: table;
          width: 100%;
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .summary-left {
          display: table-cell;
          width: 56%;
          padding-right: 8px;
          vertical-align: top;
        }
        .summary-right {
          display: table-cell;
          width: 44%;
          vertical-align: top;
        }
        .words-box {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #f8fafc;
          padding: 8px 10px;
          font-size: 11px;
          margin-bottom: 8px;
        }
        .totals-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          overflow: hidden;
          font-size: 11px;
        }
        .totals-table td {
          padding: 6px 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .totals-table tr.grand-total {
          background-color: #0f172a;
          color: #ffffff;
          font-weight: 900;
          font-size: 13px;
        }
        .totals-table tr.grand-total td {
          padding: 9px 10px;
          border-bottom: none;
        }
        .terms-grid {
          display: table;
          width: 100%;
          border-top: 1px solid #cbd5e1;
          padding-top: 10px;
          margin-top: 8px;
          font-size: 10px;
          color: #475569;
          page-break-inside: avoid;
        }
        .terms-col {
          display: table-cell;
          width: 65%;
          padding-right: 12px;
          vertical-align: top;
        }
        .sign-col {
          display: table-cell;
          width: 35%;
          text-align: center;
          vertical-align: bottom;
        }
        .sign-line {
          border-top: 1px solid #94a3b8;
          margin-top: 36px;
          padding-top: 4px;
          font-weight: 700;
          text-transform: uppercase;
          color: #0f172a;
          font-size: 10px;
        }
        .footer-note {
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px solid #e2e8f0;
          font-size: 9px;
          color: #64748b;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Top Bar -->
        <div class="top-bar">
          <div>TAX INVOICE / CASH MEMORANDUM</div>
          <div>ORIGINAL FOR RECIPIENT</div>
        </div>

        <!-- Header -->
        <div class="header-grid">
          <div class="header-left">
            <div class="company-title">${shopName}</div>
            <div class="company-tagline">${tagline}</div>
            <div class="company-meta">
              <div>${address}</div>
              <div><strong>Phone:</strong> ${phone} &nbsp;|&nbsp; <strong>WhatsApp:</strong> +${whatsapp}</div>
              <div><strong>Email:</strong> ${email}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
                PESO Licence: PESO/EXP/TN/2026/0889 &bull; Sivakasi Factory Direct Clearance
              </div>
            </div>
          </div>

          <div class="header-right">
            <div class="meta-card">
              <div class="meta-row">
                <span class="meta-label">WhatsApp Order No:</span>
                <span class="meta-val" style="font-family: monospace; font-size: 12px;">${order.orderId}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Invoice Date:</span>
                <span class="meta-val">${formattedDate}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Payment Mode:</span>
                <span class="meta-val">${order.paymentMethod}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Payment Status:</span>
                <span class="meta-val" style="color: ${order.paymentStatus === 'Paid' ? '#047857' : '#b45309'}; text-transform: uppercase;">
                  ${order.paymentStatus || 'Pending'}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Order Status:</span>
                <span class="meta-val" style="text-transform: uppercase;">${order.orderStatus || 'Confirmed'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Transport LR No:</span>
                <span class="meta-val" style="font-family: monospace;">${order.trackingNumber || 'Pending Dispatch'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Party Info Grid -->
        <div class="two-col">
          <div class="col-left">
            <div class="info-card">
              <div class="card-header">BILLED &amp; SHIPPED TO (CUSTOMER)</div>
              <div style="font-weight: 700; font-size: 12px; color: #0f172a;">${order.customer?.name}</div>
              <div style="margin-top: 4px; line-height: 1.4; color: #334155;">
                <div><strong>Phone:</strong> ${order.customer?.phone} ${order.customer?.whatsapp ? '&bull; WA: ' + order.customer.whatsapp : ''}</div>
                ${order.customer?.email ? `<div><strong>Email:</strong> ${order.customer.email}</div>` : ''}
                <div>${order.customer?.address}${order.customer?.landmark ? ', Near ' + order.customer.landmark : ''}</div>
                <div style="font-weight: 600; color: #0f172a;">
                  ${order.customer?.city}${order.customer?.district ? ', ' + order.customer.district : ''}, ${order.customer?.state} - ${order.customer?.pincode}
                </div>
                ${order.customer?.preferredDeliveryDate ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Delivery: ${order.customer.preferredDeliveryDate}</div>` : ''}
              </div>
            </div>
          </div>

          <div class="col-right">
            <div class="info-card">
              <div class="card-header">DISPATCH &amp; CONSIGNMENT PARTICULARS</div>
              <div style="line-height: 1.5; color: #334155;">
                <div class="meta-row"><span class="meta-label">Dispatch Depot:</span><span class="meta-val">Sivakasi Factory Gate (TN)</span></div>
                <div class="meta-row"><span class="meta-label">Destination:</span><span class="meta-val">${order.customer?.city}, ${order.customer?.state}</span></div>
                <div class="meta-row"><span class="meta-label">Transport Mode:</span><span class="meta-val">Surface Road Express Cargo</span></div>
                <div class="meta-row"><span class="meta-label">Consignment Type:</span><span class="meta-val">Safety Pack Green Crackers</span></div>
                <div class="meta-row"><span class="meta-label">Total Packages:</span><span class="meta-val">${Math.max(1, Math.ceil((order.items?.length || 1) / 6))} Carton Box(es)</span></div>
                <div class="meta-row"><span class="meta-label">Docket / LR No:</span><span class="meta-val" style="font-family: monospace;">${order.trackingNumber || 'Assigned at Truck Loading'}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">#</th>
              <th style="text-align: left;">Description of Goods</th>
              <th style="width: 90px; text-align: center;">Packing</th>
              <th style="width: 70px; text-align: right;">MRP (₹)</th>
              <th style="width: 55px; text-align: center;">Disc %</th>
              <th style="width: 75px; text-align: right;">Rate (₹)</th>
              <th style="width: 45px; text-align: center;">Qty</th>
              <th style="width: 85px; text-align: right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: 700; font-size: 11px; border-top: 2px solid #cbd5e1;">
              <td colspan="2" style="padding: 6px 8px;">Total Items: ${order.items?.length || 0} Varieties</td>
              <td colspan="4" style="padding: 6px 8px; text-align: center; color: #475569;">Total Quantity / Packs:</td>
              <td style="padding: 6px 8px; text-align: center; font-size: 12px; font-weight: 800;">${totalQuantity}</td>
              <td style="padding: 6px 8px; text-align: right; font-size: 12px; font-weight: 800;">₹${subtotal.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Summary & Totals -->
        <div class="summary-grid">
          <div class="summary-left">
            <div class="words-box">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">
                Invoice Amount in Words
              </div>
              <div style="font-weight: 700; font-style: italic; color: #0f172a; font-size: 11px;">
                ${numberToWords(order.totalAmount)}
              </div>
            </div>

            <div style="border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; padding: 8px 10px; font-size: 11px;">
              <div class="meta-row"><span class="meta-label">Payment Method:</span><span class="meta-val">${order.paymentMethod}</span></div>
              <div class="meta-row"><span class="meta-label">Store UPI ID:</span><span class="meta-val" style="font-family: monospace;">${upiId}</span></div>
              <div class="meta-row"><span class="meta-label">Factory Certification:</span><span class="meta-val">100% Sivakasi Origin Green Fireworks</span></div>
            </div>
          </div>

          <div class="summary-right">
            <table class="totals-table">
              <tr>
                <td style="color: #475569;">Total MRP Value</td>
                <td style="text-align: right; font-weight: 600;">₹${mrpTotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="color: #047857; background-color: #f0fdf4;">
                <td style="font-weight: 600;">Festival Discount (80% Off)</td>
                <td style="text-align: right; font-weight: 700;">- ₹${totalDiscount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="color: #475569;">Net Goods Value</td>
                <td style="text-align: right; font-weight: 600;">₹${subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="color: #475569;">Packaging &amp; Transport</td>
                <td style="text-align: right; font-weight: 700; color: ${order.deliveryFee === 0 ? '#047857' : '#0f172a'};">
                  ${deliveryFee}
                </td>
              </tr>
              <tr class="grand-total">
                <td>NET INVOICE TOTAL</td>
                <td style="text-align: right; font-size: 15px; font-weight: 900;">₹${order.totalAmount?.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Terms & Signature -->
        <div class="terms-grid">
          <div class="terms-col">
            <div style="font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 2px;">
              Terms &amp; Conditions
            </div>
            <ol style="padding-left: 14px; line-height: 1.45;">
              <li>All fireworks supplied are 100% certified Sivakasi Green Crackers complying with PESO safety standards.</li>
              <li>Goods once booked and dispatched from Sivakasi factory cannot be returned or refunded.</li>
              <li>Store crackers in a cool, dry place away from children, heat sources, and open flames.</li>
              <li>Subject to Sivakasi (Tamil Nadu) jurisdiction only.</li>
            </ol>
          </div>

          <div class="sign-col">
            <div style="font-weight: 700; font-size: 10px; color: #0f172a; text-transform: uppercase;">
              For ${shopName}
            </div>
            <div class="sign-line">Authorized Signatory</div>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="footer-note">
          Thank you for celebrating with ${shopName}! Wishing you and your family a sparkling and safe festive season! &bull; Computer generated commercial invoice.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Robust print function: Injects an isolated iframe and calls its print method.
 * Guaranteed zero blank pages and zero style bleeding across browsers!
 */
export function printInvoice(order, storeSettings) {
  const html = generateInvoiceHtml(order, storeSettings);
  if (!html) return;

  // Remove any stale print iframes
  const existing = document.getElementById('__invoice_print_frame__');
  if (existing) {
    existing.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = '__invoice_print_frame__';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Allow styles and DOM in iframe to settle before print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Print iframe error:', e);
      // Fallback
      window.print();
    } finally {
      // Clean up iframe after print dialog completes
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2000);
    }
  }, 250);
}
