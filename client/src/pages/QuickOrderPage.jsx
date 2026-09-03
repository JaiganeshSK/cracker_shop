import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Zap, ArrowRight, ShoppingBag, Search, CheckCircle2, AlertCircle, Plus, Minus, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const QuickOrderPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    setItemExactQuantity,
    totalItems,
    subtotal,
    mrpTotal,
    totalSavings,
    savingsPercent,
    isMinOrderMet,
    minOrderValue,
    minOrderRemaining,
    deliveryFee,
    grandTotal,
    setIsCartOpen,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterCategories, setMasterCategories] = useState([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        if (prodRes.data.success) {
          setProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setMasterCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Failed to load products for quick order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Group products by category following Category Master sortOrder
  const filteredProducts = products.filter((p) => {
    if (!filterText) return true;
    return (
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.category.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const categories =
    masterCategories.length > 0
      ? masterCategories
          .map((c) => c.name)
          .filter((catName) => filteredProducts.some((p) => p.category === catName))
      : [...new Set(filteredProducts.map((p) => p.category))];

  // Get current quantity for a product in cart
  const getProductQty = (productId) => {
    const item = cart.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  const handlePrint = () => {
    window.print();
  };

  let globalIndex = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-32">
      {/* Header & Print Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Sivakasi Factory Wholesale Price List</span>
            </span>
            <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Flat 80% Off MRP
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              100% Green Crackers
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            High-Speed Quick Order Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Key in quantities for any cracker in the table below. Discounts, total savings, and net payable calculate in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/products"
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Visual Cards View</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Price List</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart ({totalItems})</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar & Category Jump Pills */}
      <div className="space-y-3 no-print">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Type cracker name or category to filter table instantly..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Quick Category Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
            Jump to:
          </span>
          <button
            type="button"
            onClick={() => setFilterText('')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              !filterText
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterText(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterText.toLowerCase() === cat.toLowerCase()
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Price List Table Header (Visible only when printing) */}
      <div className="hidden print-only mb-6 text-center">
        <h2 className="text-2xl font-black">Sri Krishna Fireworks Sivakasi</h2>
        <p className="text-sm">Factory Direct Wholesale Cracker Price List 2026</p>
        <p className="text-xs">Phone: +91 94431 23456 • WhatsApp Order: +91 94431 23456</p>
      </div>

      {/* Tables by Category */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          Loading comprehensive wholesale price list...
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          No crackers matched your filter.
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const catItems = filteredProducts.filter((p) => p.category === category);
            return (
              <div
                key={category}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-800"
              >
                {/* Category Bar */}
                <div className="bg-slate-950/90 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-wider">
                      {category}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {catItems.length} Products
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 w-16 no-print">Photo</th>
                        <th className="py-2.5 px-3">Cracker Item Name</th>
                        <th className="py-2.5 px-3 w-28">Pack Info</th>
                        <th className="py-2.5 px-3 w-24 text-right">MRP (₹)</th>
                        <th className="py-2.5 px-3 w-24 text-right">Offer (₹)</th>
                        <th className="py-2.5 px-3 w-36 text-center no-print">Order Qty</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {catItems.map((product) => {
                        globalIndex++;
                        const currentQty = getProductQty(product._id);
                        const rowTotal = currentQty * product.price;

                        return (
                          <tr
                            key={product._id}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              currentQty > 0 ? 'bg-amber-500/5' : ''
                            } ${!product.inStock ? 'opacity-50' : ''}`}
                          >
                            {/* Serial Number */}
                            <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">
                              {globalIndex}
                            </td>

                            {/* Thumbnail Photo (WebP) */}
                            <td className="py-2 px-3 no-print">
                              <img
                                src={product.imageUrl || '/uploads/products/placeholder.webp'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800"
                                loading="lazy"
                              />
                            </td>

                            {/* Product Name */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-white leading-snug">
                                {product.name}
                              </div>
                              {!product.inStock && (
                                <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                  Out of Stock
                                </span>
                              )}
                            </td>

                            {/* Pack Info */}
                            <td className="py-3 px-3 text-slate-300 font-medium text-xs">
                              {product.piecePerBox}
                            </td>

                            {/* MRP */}
                            <td className="py-3 px-3 text-right line-through text-slate-400 text-xs">
                              ₹{product.mrp}
                            </td>

                            {/* Offer Price */}
                            <td className="py-3 px-3 text-right font-black text-amber-400 text-sm">
                              ₹{product.price}
                            </td>

                            {/* Order Quantity Stepper Input */}
                            <td className="py-2.5 px-3 no-print">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={!product.inStock || currentQty <= 0}
                                  onClick={() =>
                                    setItemExactQuantity(product, Math.max(0, currentQty - 1))
                                  }
                                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <input
                                  type="number"
                                  min="0"
                                  disabled={!product.inStock}
                                  value={currentQty === 0 ? '' : currentQty}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setItemExactQuantity(product, e.target.value)
                                  }
                                  className={`w-14 py-1 text-center font-bold text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-1 transition-colors ${
                                    currentQty > 0
                                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                                      : 'bg-slate-900 text-white border-slate-700/80 focus:border-amber-500 focus:ring-amber-500'
                                  } disabled:opacity-40`}
                                />

                                <button
                                  type="button"
                                  disabled={!product.inStock}
                                  onClick={() =>
                                    setItemExactQuantity(product, currentQty + 1)
                                  }
                                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Row Total */}
                            <td className="py-3 px-3 text-right font-extrabold text-white text-xs sm:text-sm">
                              {rowTotal > 0 ? (
                                <span className="text-amber-300 font-bold">
                                  ₹{rowTotal.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STICKY BOTTOM CALCULATION BAR (Always visible as customer scrolls table) */}
      <div className="fixed bottom-0 md:bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl p-3 sm:p-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400">Total Items: </span>
              <span className="font-extrabold text-white">{totalItems} Pcs/Boxes</span>
            </div>

            <div className="hidden sm:block">
              <span className="text-slate-400">MRP Value: </span>
              <span className="line-through text-slate-500">₹{mrpTotal.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-slate-400">Discount Saved: </span>
              <span className="font-bold text-emerald-400">
                ₹{totalSavings.toLocaleString()} ({savingsPercent}%)
              </span>
            </div>

            <div className="pl-3 border-l border-slate-800">
              <span className="text-slate-400">Net Payable: </span>
              <span className="font-black text-amber-400 text-base sm:text-lg">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action & Min Order Indicator */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isMinOrderMet && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Add ₹{minOrderRemaining} more for min order</span>
              </div>
            )}

            <button
              type="button"
              disabled={!isMinOrderMet}
              onClick={() => navigate('/checkout')}
              className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderPage;
