import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle, Phone, MapPin } from 'lucide-react';
import api from '../services/api';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const statusSteps = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSearched(true);

    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(query.trim())}`);
      if (res.data.success && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setOrders([]);
      setErrorMsg(err.response?.data?.message || 'No orders found matching this query');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const getStepIndex = (status) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 pb-24 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Live Consignment Tracking
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          Track Your Cracker Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your Order ID (e.g. CRK-2026-1048) or registered Phone Number to track factory packing and dispatch.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            required
            placeholder="Order ID (CRK-...) or 10-digit Phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Search Results */}
      {searched && (
        <div className="space-y-6">
          {errorMsg && (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3 max-w-md mx-auto border border-rose-500/30">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <div className="text-sm font-bold text-white">No Order Found</div>
              <p className="text-xs text-slate-400">{errorMsg}</p>
            </div>
          )}

          {orders.map((order) => {
            const currentStep = getStepIndex(order.orderStatus);

            return (
              <div
                key={order._id}
                className="glass-panel rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6"
              >
                {/* Order Top Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400">
                        {order.orderId}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        Status: {order.orderStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400">Total Consignment Value</div>
                    <div className="text-lg font-black text-white">₹{order.totalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Status Timeline Bar */}
                <div className="py-4">
                  <div className="relative flex items-center justify-between">
                    {/* Connecting line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 z-0 transition-all duration-500"
                      style={{
                        width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />

                    {statusSteps.map((step, idx) => {
                      const isPassed = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                              isPassed
                                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/40 scale-110'
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs mt-2 font-semibold ${
                              isCurrent
                                ? 'text-amber-400 font-bold'
                                : isPassed
                                ? 'text-slate-200'
                                : 'text-slate-500'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking / Courier LR Number */}
                {order.trackingNumber && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-300 flex items-center gap-3">
                    <Truck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Transport LR / Tracking Docket:</span>{' '}
                      <span className="font-mono text-white text-sm font-black">{order.trackingNumber}</span>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        You can show this LR number at your local transport parcel office to collect your parcel.
                      </p>
                    </div>
                  </div>
                )}

                {/* Items & Shipping Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="text-slate-400 font-medium mb-1">Shipping Destination:</div>
                    <div className="font-bold text-white">{order.customer.name}</div>
                    <div className="text-slate-300">{order.customer.address}</div>
                    <div className="text-amber-400">
                      {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="text-slate-400 font-medium mb-1">Package Contents:</div>
                    <div className="font-bold text-white">{order.items.length} Product Varieties</div>
                    <div className="text-slate-400 mt-1 line-clamp-2">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
