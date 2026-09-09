import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    clearCart,
    totalItems,
    subtotal,
    mrpTotal,
    totalSavings,
    savingsPercent,
    deliveryFee,
    grandTotal,
    isMinOrderMet,
    minOrderValue,
    minOrderRemaining,
    storeSettings,
    generateWhatsAppMessage,
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    preferredDeliveryDate: '',
  });

  const paymentMethod = 'WhatsApp Order';
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg('');

    if (!isMinOrderMet) {
      setErrorMsg(`Minimum order value is ₹${minOrderValue}. Please add ₹${minOrderRemaining} more.`);
      return;
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      setErrorMsg('Please complete all required customer shipping fields.');
      return;
    }

    setSubmitting(true);

    // Pre-open window synchronously during user click to bypass browser popup blockers
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let waTab = null;
    if (!isMobile) {
      try {
        waTab = window.open('', '_blank');
        if (waTab) {
          try {
            waTab.document.title = 'Connecting to WhatsApp...';
            waTab.document.body.innerHTML = `
              <div style="font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; color: #334155; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 12px;">💬</div>
                <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #0f172a;">Connecting to WhatsApp...</h2>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Preparing your festive cracker order details...</p>
              </div>
            `;
          } catch (_) {}
        }
      } catch (_) {
        waTab = null;
      }
    }

    try {
      const orderPayload = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          preferredDeliveryDate: formData.preferredDeliveryDate,
        },
        items: cart.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          piecePerBox: item.product.piecePerBox,
          price: item.product.price,
          mrp: item.product.mrp,
          quantity: item.quantity,
          total: item.quantity * item.product.price,
        })),
        paymentMethod,
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data.success && res.data.order) {
        const createdOrder = res.data.order;

        // Generate complete WhatsApp receipt with the new WhatsApp Order Number
        const msg = generateWhatsAppMessage(formData, createdOrder.orderId);
        const shopWhatsApp = storeSettings?.whatsapp || '916369050467';
        const waUrl = `https://wa.me/${shopWhatsApp}?text=${msg}`;

        if (isMobile) {
          // Mobile: Transition route first so return from WhatsApp lands on Order Success
          clearCart();
          navigate(`/order-success/${createdOrder.orderId}`, {
            replace: true,
            state: { order: createdOrder },
          });
          window.location.href = waUrl;
        } else {
          // Desktop: Send pre-opened tab to WhatsApp, and navigate current tab to success
          if (waTab && !waTab.closed) {
            waTab.location.href = waUrl;
          } else {
            const fallbackWin = window.open(waUrl, '_blank');
            if (!fallbackWin) {
              window.location.href = waUrl;
            }
          }

          clearCart();
          navigate(`/order-success/${createdOrder.orderId}`, {
            state: { order: createdOrder },
          });
        }
      }
    } catch (err) {
      if (waTab && !waTab.closed) {
        waTab.close();
      }
      console.error('Order submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-slate-400 text-sm">Please add crackers to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/quick-order')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Explore Quick Order Sheet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Shipping Form */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Delivery & Contact Information</h1>
            <p className="text-xs text-slate-400 mt-1">
              Provide accurate shipping details for transport delivery and consignment tracking.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp Number (For Order Updates)
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="Same as mobile or WhatsApp number"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Street / Door Delivery Address <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={3}
                placeholder="House / Door No, Street, Building, Area..."
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  City / Town <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Madurai"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="e.g. Madurai"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pincode <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="6 digits PIN"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Other State">Other State</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  name="preferredDeliveryDate"
                  value={formData.preferredDeliveryDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <button
                type="submit"
                disabled={submitting || !isMinOrderMet}
                className="w-full py-4 rounded-xl font-extrabold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Assigning WhatsApp Order Number...</span>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
                    <span>Place Order via WhatsApp (₹{grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Your order will receive an official <strong className="text-amber-400">WhatsApp Order Number</strong> and be sent to our factory WhatsApp for packing &amp; dispatch.
              </p>
            </div>
          </form>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
            <p className="text-xs text-slate-400">{totalItems} Total items selected</p>
          </div>

          {/* Item List Scroll */}
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60"
              >
                <div className="flex-1 pr-3">
                  <div className="font-bold text-white truncate">{item.product.name}</div>
                  <div className="text-slate-400 text-[11px]">
                    {item.quantity} x ₹{item.product.price} ({item.product.piecePerBox})
                  </div>
                </div>
                <div className="text-right font-bold text-white">
                  ₹{item.quantity * item.product.price}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Total MRP Value</span>
              <span className="line-through">₹{mrpTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Festival Discount Saved ({savingsPercent}%)</span>
              <span>- ₹{totalSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard Logistics Fee</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-black text-white">
              <span>Net Payable</span>
              <span className="text-amber-400 text-xl">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Security & Green Cracker Notice */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Genuine Sivakasi Factory Direct</span>
            </div>
            <p className="leading-relaxed">
              Consignment is booked safely via approved road transport parcel services with tracking LR details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
