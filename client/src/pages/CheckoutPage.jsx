import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Navigation,
  Building2,
  Calendar,
  Truck,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Telangana',
  'Maharashtra',
  'Gujarat',
  'Andaman and Nicobar Islands',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other State / Location',
];

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

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCopyPhoneToWhatsApp = () => {
    if (formData.phone) {
      setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
    }
  };

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

    const trimmedName = (formData.name || '').trim();
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    const trimmedAddress = (formData.address || '').trim();
    const trimmedCity = (formData.city || '').trim();
    const cleanPincode = (formData.pincode || '').replace(/\D/g, '');

    if (!trimmedName || !cleanPhone || !trimmedAddress || !trimmedCity || !cleanPincode) {
      setErrorMsg('Please complete all required customer shipping fields.');
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (cleanPincode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    const validItems = cart.filter((item) => item && item.product && (item.product._id || item.product.id));
    if (validItems.length === 0) {
      setErrorMsg('Your cart contains no valid products. Please select crackers from the catalog.');
      return;
    }

    setSubmitting(true);

    // Pre-open window synchronously during user click on desktop to bypass browser popup blockers
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

    let createdOrder = null;

    try {
      const orderPayload = {
        customer: {
          name: trimmedName,
          phone: cleanPhone,
          whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, '') : cleanPhone,
          email: (formData.email || '').trim(),
          address: trimmedAddress,
          landmark: (formData.landmark || '').trim(),
          city: trimmedCity,
          district: (formData.district || '').trim(),
          state: formData.state,
          pincode: cleanPincode,
          preferredDeliveryDate: formData.preferredDeliveryDate,
        },
        items: validItems.map((item) => ({
          productId: item.product._id || item.product.id || '650000000000000000000001',
          name: item.product.name,
          piecePerBox: item.product.piecePerBox,
          price: Number(item.product.price) || 0,
          mrp: Number(item.product.mrp) || Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          total: (Number(item.quantity) || 1) * (Number(item.product.price) || 0),
        })),
        paymentMethod,
      };

      const res = await api.post('/orders', orderPayload, { timeout: 9000 });
      if (res.data?.success && res.data?.order) {
        createdOrder = res.data.order;
      }
    } catch (err) {
      console.warn('Backend order save encountered a delay or cold-start; dispatching resilient WhatsApp order:', err);
    }

    // Bulletproof Fallback: If backend is cold/slow/unreachable on Vercel, generate client order so customer is NEVER blocked!
    if (!createdOrder) {
      const fallbackOrderId = `WA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      createdOrder = {
        orderId: fallbackOrderId,
        customer: {
          name: trimmedName,
          phone: cleanPhone,
          whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, '') : cleanPhone,
          email: (formData.email || '').trim(),
          address: trimmedAddress,
          landmark: (formData.landmark || '').trim(),
          city: trimmedCity,
          district: (formData.district || '').trim(),
          state: formData.state,
          pincode: cleanPincode,
          preferredDeliveryDate: formData.preferredDeliveryDate,
        },
        items: validItems.map((item) => ({
          productId: item.product._id || item.product.id,
          name: item.product.name,
          piecePerBox: item.product.piecePerBox,
          price: Number(item.product.price) || 0,
          mrp: Number(item.product.mrp) || Number(item.product.price) || 0,
          quantity: Number(item.quantity) || 1,
          total: (Number(item.quantity) || 1) * (Number(item.product.price) || 0),
        })),
        subtotal,
        mrpTotal,
        totalDiscount: totalSavings,
        deliveryFee,
        totalAmount: grandTotal,
        paymentMethod,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
        createdAt: new Date().toISOString(),
        isLocalFallback: true,
      };
    }

    // Persist order in local storage for order confirmation & tracking
    try {
      localStorage.setItem('cracker_last_order', JSON.stringify(createdOrder));
      if (createdOrder.orderId) {
        localStorage.setItem(`order_${createdOrder.orderId}`, JSON.stringify(createdOrder));
      }
    } catch (_) {}

    // Generate complete WhatsApp receipt with the new WhatsApp Order Number
    const msg = generateWhatsAppMessage(formData, createdOrder.orderId);
    const rawPhone = storeSettings?.whatsapp || '916369050467';
    let shopWhatsApp = String(rawPhone).replace(/\D/g, '');
    if (shopWhatsApp.length === 10) {
      shopWhatsApp = '91' + shopWhatsApp;
    }
    const waUrl = `https://wa.me/${shopWhatsApp}?text=${msg}`;

    if (isMobile) {
      // Mobile: Transition route first so return from WhatsApp lands on Order Success
      clearCart();
      navigate(`/order-success/${createdOrder.orderId}`, {
        replace: true,
        state: { order: createdOrder },
      });
      setTimeout(() => {
        window.location.href = waUrl;
      }, 150);
    } else {
      // Desktop: Send pre-opened tab to WhatsApp, and navigate current tab to success
      if (waTab && !waTab.closed) {
        waTab.location.href = waUrl;
      } else {
        const fallbackWin = window.open(waUrl, '_blank');
        if (!fallbackWin) {
          console.warn('WhatsApp popup blocked; user can chat from the order confirmation page.');
        }
      }

      clearCart();
      navigate(`/order-success/${createdOrder.orderId}`, {
        state: { order: createdOrder },
      });
    }

    setSubmitting(false);
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
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        {/* Visual Step Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => navigate('/quick-order')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
              ✓
            </span>
            <span className="hidden sm:inline">1. Cart</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
              2
            </span>
            <span className="hidden xs:inline">Details</span>
            <span className="hidden sm:inline text-slate-400">/ Delivery</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-[10px]">
              3
            </span>
            <span className="hidden sm:inline">WhatsApp Order</span>
          </div>
        </div>
      </div>

      {/* Mobile-only Order Summary Strip */}
      <div className="lg:hidden glass-panel rounded-2xl border border-white/10 p-4 mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">{totalItems} items · Saved <span className="text-emerald-400 font-bold">₹{totalSavings.toLocaleString()}</span></div>
            <div className="text-base font-extrabold text-amber-400">₹{grandTotal.toLocaleString()}</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 flex-shrink-0">
          {savingsPercent}% OFF
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Shipping Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold tracking-wide uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Direct Sivakasi Factory Consignment</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Delivery &amp; Contact Details</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Please complete your contact and shipping destination details for prompt consignment packing &amp; parcel transport booking.
              </p>
            </div>
          </div>

          {/* Min Order Alert Banner */}
          {!isMinOrderMet && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Minimum Order Requirement: ₹{minOrderValue.toLocaleString()}</div>
                  <p className="text-amber-200/80 mt-0.5">Please add crackers worth ₹{minOrderRemaining.toLocaleString()} more to place your order.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/quick-order')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex-shrink-0 transition-all active:scale-95 shadow-md shadow-amber-500/20 self-start sm:self-auto cursor-pointer"
              >
                Add Crackers
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Section 1: Contact Details */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Contact &amp; Communication</h2>
                  <p className="text-[11px] text-slate-400">Who should we contact for order verification and consignment updates?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Name */}
                <div>
                  <label htmlFor="checkout-name" className="block text-slate-300 font-semibold mb-1.5">
                    Recipient Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="checkout-name"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="checkout-phone" className="block text-slate-300 font-semibold mb-1.5">
                    Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="checkout-phone"
                      name="phone"
                      required
                      maxLength={10}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="checkout-whatsapp" className="text-slate-300 font-semibold">
                      WhatsApp Number
                    </label>
                    {formData.phone && formData.whatsapp !== formData.phone && (
                      <button
                        type="button"
                        onClick={handleCopyPhoneToWhatsApp}
                        className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors cursor-pointer"
                      >
                        Same as mobile
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="checkout-whatsapp"
                      name="whatsapp"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="WhatsApp for order updates"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="checkout-email" className="block text-slate-300 font-semibold mb-1.5">
                    Email Address <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="checkout-email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com (For invoice)"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Destination */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Consignment Delivery Address</h2>
                  <p className="text-[11px] text-slate-400">Where should we deliver your festive cracker parcel?</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Street Address */}
                <div>
                  <label htmlFor="checkout-address" className="block text-slate-300 font-semibold mb-1.5">
                    Door No. / Building / Street Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-slate-500">
                      <Home className="w-4 h-4" />
                    </div>
                    <textarea
                      id="checkout-address"
                      name="address"
                      required
                      rows={2}
                      autoComplete="street-address"
                      placeholder="House / Door No., Building Name, Street / Road, Area / Colony..."
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Landmark */}
                <div>
                  <label htmlFor="checkout-landmark" className="block text-slate-300 font-semibold mb-1.5">
                    Landmark / Locality <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="checkout-landmark"
                      name="landmark"
                      autoComplete="address-line2"
                      placeholder="e.g. Near Old Bus Stand, Opp. Shiva Temple, Main Road"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* City, District, Pincode 3-Col Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label htmlFor="checkout-city" className="block text-slate-300 font-semibold mb-1.5">
                      City / Town <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="checkout-city"
                        name="city"
                        required
                        autoComplete="address-level2"
                        placeholder="e.g. Madurai"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="checkout-district" className="block text-slate-300 font-semibold mb-1.5">
                      District
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="checkout-district"
                        name="district"
                        autoComplete="address-level3"
                        placeholder="e.g. Madurai"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label htmlFor="checkout-pincode" className="block text-slate-300 font-semibold mb-1.5">
                      Pincode <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="checkout-pincode"
                        name="pincode"
                        required
                        maxLength={6}
                        autoComplete="postal-code"
                        inputMode="numeric"
                        placeholder="6 digits PIN"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* State */}
                <div>
                  <label htmlFor="checkout-state" className="block text-slate-300 font-semibold mb-1.5">
                    Delivery State
                  </label>
                  <select
                    id="checkout-state"
                    name="state"
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    {INDIAN_STATES.map((stateName) => (
                      <option key={stateName} value={stateName} className="bg-slate-900 text-white">
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Delivery Preferences */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Delivery Schedule &amp; Logistics</h2>
                  <p className="text-[11px] text-slate-400">Specify when you would like this consignment to arrive</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="checkout-delivery-date" className="block text-slate-300 font-semibold mb-1.5">
                    Preferred Delivery Date <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      id="checkout-delivery-date"
                      name="preferredDeliveryDate"
                      min={todayStr}
                      value={formData.preferredDeliveryDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all text-xs sm:text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave empty for earliest priority transport dispatch.
                  </p>
                </div>

                {/* Safe Road Transport Note */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">Sivakasi Transport Dispatch:</strong> All parcels are securely packed with heavy-duty moisture barrier and booked through authorized parcel transport services. Consignment LR receipt will be forwarded on WhatsApp.
                  </div>
                </div>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !isMinOrderMet}
                className="w-full py-4 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <span>Generating Official WhatsApp Receipt...</span>
                ) : !isMinOrderMet ? (
                  <span>Min. Order ₹{minOrderValue.toLocaleString()} Required (Add ₹{minOrderRemaining.toLocaleString()} more)</span>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
                    <span>Place Order via WhatsApp (₹{grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-y-1 gap-x-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Direct Sivakasi Factory Rate
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Green Crackers
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Safe Road Parcel Booking
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: Sticky Order Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Order Summary</h2>
              <p className="text-xs text-slate-400">Verified factory pricing</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
              {totalItems} Items
            </span>
          </div>

          {/* Item List Scroll */}
          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center justify-between text-xs py-2 border-b border-white/[0.04]"
              >
                <div className="flex-1 pr-3">
                  <div className="font-bold text-white truncate">{item.product.name}</div>
                  <div className="text-slate-400 text-[11px]">
                    {item.quantity} x ₹{item.product.price} ({item.product.piecePerBox})
                  </div>
                </div>
                <div className="text-right font-bold text-white">
                  ₹{(item.quantity * item.product.price).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-slate-400 border-t border-white/[0.08] pt-4">
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
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Standard Logistics Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
            )}
            <div className="pt-3 border-t border-white/[0.08] flex justify-between text-base font-black text-white">
              <span>Net Payable</span>
              <span className="text-amber-400 text-xl font-extrabold">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Security & Green Cracker Notice */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Genuine Sivakasi Factory Direct</span>
            </div>
            <p className="leading-relaxed">
              Consignment is booked safely via approved road transport parcel services with tracking LR details sent on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
