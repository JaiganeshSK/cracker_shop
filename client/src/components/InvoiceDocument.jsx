import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const InvoiceDocument = ({ order, storeSettings, invoiceRef }) => {
  if (!order) return null;

  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  const shopName = storeSettings?.shopName || 'FIREWORKS STORE SIVAKASI';
  const tagline = storeSettings?.tagline || 'Direct Factory Outlet • 100% Certified Green Crackers';
  const address = storeSettings?.address || 'Sivakasi, Tamil Nadu - 626123';
  const phone = storeSettings?.phone || '';
  const whatsapp = storeSettings?.whatsapp || '';
  const email = storeSettings?.email || '';
  const upiId = storeSettings?.upiId || '';

  return (
    <div
      ref={invoiceRef}
      id="printable-invoice"
      className="invoice-paper bg-white text-slate-900 mx-auto p-6 sm:p-10 font-sans leading-normal select-text"
      style={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        color: '#111827',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ── TOP BANNER BAR ─────────────────────────────────────── */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4 text-[11px] font-bold tracking-wider uppercase text-slate-700">
        <div>TAX INVOICE / CASH MEMORANDUM</div>
        <div>ORIGINAL FOR RECIPIENT</div>
      </div>

      {/* ── COMPANY & INVOICE HEADER ──────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-300 mb-4">
        {/* Company Details (Left) - Typography only, NO images */}
        <div className="col-span-7 pr-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
            {shopName}
          </h1>
          <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{tagline}</p>
          <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
            <p className="leading-snug">{address}</p>
            <p>
              <span className="font-semibold text-slate-800">Phone:</span> {phone} &nbsp;|&nbsp;{' '}
              <span className="font-semibold text-slate-800">WhatsApp:</span> +{whatsapp}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Email:</span> {email}
            </p>
            <p className="text-[10px] text-slate-500 pt-0.5">
              PESO Licence: PESO/EXP/TN/2026/0889 &bull; Sivakasi Factory Direct Clearance
            </p>
          </div>
        </div>

        {/* Invoice Metadata Box (Right) */}
        <div className="col-span-5 bg-slate-50 border border-slate-300 rounded p-3 text-[11px]">
          <div className="grid grid-cols-2 gap-y-1.5">
            <div className="text-slate-500 font-semibold">WhatsApp Order No:</div>
            <div className="font-mono font-bold text-slate-950 text-right text-xs">
              {order.orderId}
            </div>

            <div className="text-slate-500 font-semibold">Date:</div>
            <div className="font-medium text-slate-900 text-right">{formattedDate}</div>

            <div className="text-slate-500 font-semibold">Payment Mode:</div>
            <div className="font-bold text-slate-900 text-right">{order.paymentMethod}</div>

            <div className="text-slate-500 font-semibold">Payment Status:</div>
            <div className="text-right">
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {order.paymentStatus || 'Pending'}
              </span>
            </div>

            <div className="text-slate-500 font-semibold">Order Status:</div>
            <div className="font-bold text-slate-900 text-right uppercase text-[10px]">
              {order.orderStatus || 'Confirmed'}
            </div>

            <div className="text-slate-500 font-semibold">Transport LR No:</div>
            <div className="font-mono font-semibold text-slate-900 text-right">
              {order.trackingNumber || 'Pending Dispatch'}
            </div>
          </div>
        </div>
      </div>

      {/* ── BILL TO & DISPATCH DETAILS ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 text-[11px] mb-4">
        {/* Customer Information */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
            BILLED &amp; SHIPPED TO (CUSTOMER)
          </div>
          <div className="font-bold text-slate-950 text-xs">{order.customer?.name}</div>
          <div className="text-slate-700 mt-1 space-y-0.5 leading-relaxed">
            <p>
              <span className="font-semibold text-slate-800">Phone:</span> {order.customer?.phone}
              {order.customer?.whatsapp && (
                <span> &bull; WA: {order.customer?.whatsapp}</span>
              )}
            </p>
            {order.customer?.email && (
              <p>
                <span className="font-semibold text-slate-800">Email:</span> {order.customer?.email}
              </p>
            )}
            <p className="mt-1">
              {order.customer?.address}
              {order.customer?.landmark && `, Near ${order.customer.landmark}`}
            </p>
            <p className="font-semibold text-slate-900">
              {order.customer?.city}
              {order.customer?.district && `, ${order.customer.district}`}, {order.customer?.state} -{' '}
              {order.customer?.pincode}
            </p>
            {order.customer?.preferredDeliveryDate && (
              <p className="text-slate-600 text-[10px] pt-1">
                Preferred Date: {order.customer.preferredDeliveryDate}
              </p>
            )}
          </div>
        </div>

        {/* Logistics & Dispatch Info */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1">
            DISPATCH &amp; CONSIGNMENT PARTICULARS
          </div>
          <div className="grid grid-cols-2 gap-y-1 text-slate-700">
            <div className="text-slate-500">Dispatch Location:</div>
            <div className="font-medium text-slate-900 text-right">Sivakasi Depot (TN)</div>

            <div className="text-slate-500">Destination:</div>
            <div className="font-medium text-slate-900 text-right">
              {order.customer?.city}, {order.customer?.state}
            </div>

            <div className="text-slate-500">Transport Carrier:</div>
            <div className="font-medium text-slate-900 text-right">Surface Road Cargo / Express</div>

            <div className="text-slate-500">Consignment Type:</div>
            <div className="font-medium text-slate-900 text-right">Safety Pack Green Crackers</div>

            <div className="text-slate-500">Total Packages:</div>
            <div className="font-medium text-slate-900 text-right">
              {Math.max(1, Math.ceil((order.items?.length || 1) / 6))} Carton Box(es)
            </div>

            <div className="text-slate-500">Docket / LR Number:</div>
            <div className="font-mono font-bold text-slate-950 text-right">
              {order.trackingNumber || 'Assigned at Loading'}
            </div>
          </div>
        </div>
      </div>

      {/* ── ITEMIZED CRACKER PRODUCTS TABLE ───────────────────── */}
      <div className="border border-slate-300 rounded overflow-hidden mb-4">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
              <th className="py-2 px-2 text-center w-8 border-r border-slate-800">#</th>
              <th className="py-2 px-3">Description of Goods</th>
              <th className="py-2 px-2 text-center w-24 border-x border-slate-800">Packing</th>
              <th className="py-2 px-2 text-right w-16 border-r border-slate-800">MRP (₹)</th>
              <th className="py-2 px-2 text-center w-14 border-r border-slate-800">Disc %</th>
              <th className="py-2 px-2 text-right w-18 border-r border-slate-800">Rate (₹)</th>
              <th className="py-2 px-2 text-center w-12 border-r border-slate-800">Qty</th>
              <th className="py-2 px-3 text-right w-20">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items?.map((item, idx) => {
              const mrp = item.mrp || (item.price ? Math.round(item.price * 5) : 0);
              const discountPct = mrp > item.price ? Math.round(((mrp - item.price) / mrp) * 100) : 0;

              return (
                <tr
                  key={idx}
                  className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-200 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-950">
                    {item.name}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600 border-x border-slate-200 text-[10px]">
                    {item.piecePerBox || '1 Box'}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-500 border-r border-slate-200 line-through">
                    {mrp > 0 ? mrp.toLocaleString('en-IN') : '-'}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-700 font-medium border-r border-slate-200 text-[10px]">
                    {discountPct > 0 ? `${discountPct}%` : '-'}
                  </td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-900 border-r border-slate-200">
                    {item.price?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-950 border-r border-slate-200">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-950">
                    {item.total?.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold text-slate-800 text-[10px] border-t-2 border-slate-300">
              <td colSpan={2} className="py-2 px-3">
                Total Line Items: {order.items?.length || 0} Varieties
              </td>
              <td colSpan={4} className="py-2 px-2 text-center">
                Total Pieces / Packs:
              </td>
              <td className="py-2 px-2 text-center font-black text-slate-950 text-xs">
                {totalQuantity}
              </td>
              <td className="py-2 px-3 text-right font-black text-slate-950 text-xs">
                ₹{order.subtotal?.toLocaleString('en-IN') || order.totalAmount?.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── SETTLEMENT & SUMMARY SECTION ──────────────────────── */}
      <div className="grid grid-cols-12 gap-4 mb-4" style={{ pageBreakInside: 'avoid' }}>
        {/* Left: Amount in Words & Payment Instructions */}
        <div className="col-span-7 flex flex-col justify-between border border-slate-300 rounded p-3 bg-slate-50/50">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Invoice Amount in Words
            </div>
            <div className="font-bold text-slate-950 text-xs leading-snug italic border-b border-slate-200 pb-2">
              {numberToWords(order.totalAmount)}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Payment Method:</span>
              <span className="font-bold text-slate-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Store UPI ID:</span>
              <span className="font-mono font-bold text-slate-950">{upiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Dispatch Policy:</span>
              <span className="text-slate-800">100% Sivakasi Factory Direct Green Fireworks</span>
            </div>
          </div>
        </div>

        {/* Right: Bill Calculation Totals */}
        <div className="col-span-5 border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-[11px]">
            <tbody>
              <tr className="border-b border-slate-200 bg-white">
                <td className="py-1.5 px-3 text-slate-600">Total MRP Value</td>
                <td className="py-1.5 px-3 text-right font-medium text-slate-900">
                  ₹{order.mrpTotal ? order.mrpTotal.toLocaleString('en-IN') : (order.totalAmount * 5).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-emerald-800">
                <td className="py-1.5 px-3 font-semibold">Festival Discount (80% Off)</td>
                <td className="py-1.5 px-3 text-right font-bold">
                  - ₹{order.totalDiscount ? order.totalDiscount.toLocaleString('en-IN') : ((order.mrpTotal || order.totalAmount * 5) - order.totalAmount).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-white">
                <td className="py-1.5 px-3 text-slate-600">Net Goods Value</td>
                <td className="py-1.5 px-3 text-right font-semibold text-slate-900">
                  ₹{order.subtotal ? order.subtotal.toLocaleString('en-IN') : order.totalAmount?.toLocaleString('en-IN')}
                </td>
              </tr>
              {order.deliveryFee > 0 && (
                <tr className="border-b border-slate-200 bg-white">
                  <td className="py-1.5 px-3 text-slate-600">Packaging &amp; Freight</td>
                  <td className="py-1.5 px-3 text-right font-semibold">
                    ₹{order.deliveryFee}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-black text-sm">
                <td className="py-2.5 px-3">NET PAYABLE AMOUNT</td>
                <td className="py-2.5 px-3 text-right text-base font-black tracking-tight">
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TERMS & CONDITIONS & SIGNATURE ────────────────────── */}
      <div
        className="grid grid-cols-12 gap-4 pt-3 border-t border-slate-300 text-[10px] text-slate-600"
        style={{ pageBreakInside: 'avoid' }}
      >
        {/* Terms */}
        <div className="col-span-8 pr-2">
          <div className="font-bold text-slate-800 uppercase tracking-wider mb-1">
            Terms &amp; Conditions
          </div>
          <ol className="list-decimal pl-3.5 space-y-0.5 leading-normal">
            <li>
              All fireworks supplied are certified Sivakasi Green Crackers complying with PESO safety standards.
            </li>
            <li>
              Goods once booked and dispatched from Sivakasi factory cannot be returned or refunded.
            </li>
            <li>
              Store crackers in a dry, ventilated place away from children, heat sources, and open flames.
            </li>
            <li>
              Subject to Sivakasi (Tamil Nadu) jurisdiction only.
            </li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="col-span-4 flex flex-col justify-between text-center pl-2">
          <div className="text-[10px] font-bold text-slate-900 uppercase">
            For {shopName}
          </div>
          <div className="mt-8 border-t border-slate-400 pt-1">
            <span className="text-[10px] font-semibold text-slate-800 uppercase tracking-wider">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NOTICE ──────────────────────────────────────── */}
      <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-500 font-medium">
        Thank you for celebrating with {shopName}! Wishing you and your family a sparkling and prosperous festive season! &bull; This is a computer generated invoice.
      </div>
    </div>
  );
};

export default InvoiceDocument;
