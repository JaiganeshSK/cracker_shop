import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Copy, Check, Eye, CheckCircle2, Home, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import InvoiceModal from '../components/InvoiceModal';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { storeSettings } = useCart();
  const [order, setOrder] = useState(location.state?.order || (() => {
    try {
      const saved = (orderId ? localStorage.getItem(`order_${orderId}`) : null) || localStorage.getItem('cracker_last_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!orderId || parsed.orderId === orderId) return parsed;
      }
    } catch (_) {}
    return null;
  }));
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!order);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    // Professional elegant fireworks — staggered shell bursts with curated palettes
    try {
      const palettes = [
        ['#f59e0b', '#fbbf24', '#fde68a', '#ffffff'],   // gold
        ['#10b981', '#34d399', '#6ee7b7', '#ffffff'],   // emerald
        ['#f43f5e', '#fb7185', '#fda4af', '#ffffff'],   // rose
        ['#818cf8', '#a5b4fc', '#c7d2fe', '#ffffff'],   // indigo
        ['#f59e0b', '#10b981', '#f43f5e', '#818cf8'],   // mixed
      ];

      const fireShell = (originX, paletteIdx, delay) => {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 90,
            spread: 55,
            origin: { x: originX, y: 0.9 },
            colors: palettes[paletteIdx % palettes.length],
            startVelocity: 55,
            gravity: 0.8,
            ticks: 200,
            scalar: 1.1,
            shapes: ['circle', 'square'],
            zIndex: 9999,
          });
        }, delay);
      };

      // Sequence of elegant shell launches
      fireShell(0.25, 0, 0);
      fireShell(0.75, 1, 300);
      fireShell(0.5,  2, 700);
      fireShell(0.15, 3, 1200);
      fireShell(0.85, 4, 1500);
      fireShell(0.4,  0, 2100);
      fireShell(0.6,  1, 2400);
      fireShell(0.5,  2, 3000);
      // Final grand finale — simultaneous triple burst
      fireShell(0.25, 0, 3700);
      fireShell(0.5,  4, 3750);
      fireShell(0.75, 1, 3800);
    } catch {
      // Ignore if canvas unavailable
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/track/${orderId}`);
          if (res.data.success && res.data.orders?.length > 0) {
            setOrder(res.data.orders[0]);
          } else {
            const saved = localStorage.getItem(`order_${orderId}`) || localStorage.getItem('cracker_last_order');
            if (saved) setOrder(JSON.parse(saved));
          }
        } catch (err) {
          console.error('Failed to fetch order from API, checking local storage:', err);
          try {
            const saved = localStorage.getItem(`order_${orderId}`) || localStorage.getItem('cracker_last_order');
            if (saved) setOrder(JSON.parse(saved));
          } catch (_) {}
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order]);

  const handleCopyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400">
        Retrieving order details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 pb-24 space-y-8">
      {/* Top Celebration Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl text-center space-y-4 border border-amber-500/30 glow-gold relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            WhatsApp Order Successfully Placed!
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
            Thank You for Celebrating With Us!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2">
            Your festive cracker order details have been sent to our factory. Our team will verify and chat with you on WhatsApp.
          </p>
        </div>

        {/* WhatsApp Order Number Pill */}
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-emerald-500/40 px-4 py-2 rounded-xl shadow-lg shadow-emerald-950/40">
          <span className="text-xs text-slate-400">WhatsApp Order Number:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
            {order?.orderId || orderId}
          </span>
          <button
            onClick={handleCopyOrderId}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>


      {/* Itemized Receipt & Delivery Slip */}
      {order && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Consignment Invoice Summary</h2>
              <p className="text-xs text-slate-400">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Preview Full A4 Invoice"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <div className="text-slate-400 font-medium">Customer Details:</div>
              <div className="font-bold text-white text-sm mt-0.5">{order.customer.name}</div>
              <div className="text-slate-300">Phone: {order.customer.phone}</div>
              {order.customer.whatsapp && (
                <div className="text-slate-300">WhatsApp: {order.customer.whatsapp}</div>
              )}
            </div>
            <div>
              <div className="text-slate-400 font-medium">Shipping Destination:</div>
              <div className="text-slate-200 mt-0.5 leading-relaxed">
                {order.customer.address}, {order.customer.city}
                {order.customer.district ? `, ${order.customer.district}` : ''}
              </div>
              <div className="text-amber-400 font-semibold">
                {order.customer.state} - {order.customer.pincode}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ordered Products ({order.items.length} Varieties)
            </div>
            <div className="divide-y divide-slate-800 border-y border-slate-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-slate-400 ml-2">({item.piecePerBox})</span>
                    <div className="text-slate-400 text-[11px]">
                      {item.quantity} x ₹{item.price}
                    </div>
                  </div>
                  <div className="font-bold text-white">₹{item.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Totals */}
          <div className="space-y-1.5 text-xs text-slate-400 pt-2">
            <div className="flex justify-between">
              <span>Items Total MRP</span>
              <span className="line-through">₹{order.mrpTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Festival Discount Saved</span>
              <span>- ₹{order.totalDiscount?.toLocaleString()}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Standard Logistics / Delivery</span>
                <span>₹{order.deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2 border-t border-slate-800">
              <span>Total Payable ({order.paymentMethod})</span>
              <span className="text-amber-400 text-lg">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
        {order && (
          <a
            href={`https://wa.me/${String(storeSettings?.whatsapp || '916369050467').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I placed order #${order.orderId} for ₹${(order.totalAmount || 0).toLocaleString()} (Customer: ${order.customer?.name}). Please confirm my order.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-1/2 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        )}
      </div>

      <div className="text-center no-print pt-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline">
          <Home className="w-3.5 h-3.5" />
          <span>Return to Store Home</span>
        </Link>
      </div>

      {/* Professional Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
        storeSettings={storeSettings}
        showPrint={false}
      />
    </div>
  );
};

export default OrderSuccessPage;
