import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Printer, Zap, ArrowRight, ShoppingBag, Search, X,
  CheckCircle2, AlertCircle, Plus, Minus, Sparkles, ChevronDown,
  FileText, Download, Eye,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const QuickOrderPage = () => {
  const navigate = useNavigate();
  const {
    cart, setItemExactQuantity, totalItems, subtotal, mrpTotal,
    totalSavings, savingsPercent, isMinOrderMet, minOrderValue,
    minOrderRemaining, grandTotal, setIsCartOpen, storeSettings,
    setIsPriceListModalOpen,
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
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (catRes.data.success) setMasterCategories(catRes.data.categories);
      } catch (err) {
        console.error('Failed to load products for quick order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!filterText) return true;
    return (
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.category.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const categories =
    masterCategories.length > 0
      ? masterCategories.map((c) => c.name).filter((catName) => filteredProducts.some((p) => p.category === catName))
      : [...new Set(filteredProducts.map((p) => p.category))];

  const getProductQty = (productId) => {
    const item = cart.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  const handlePrint = () => window.print();

  let globalIndex = 0;

  // ── Bottom bar height: ~80px desktop, ~120px mobile
  // We need generous pb to not clip content or footer behind the bar
  const BOTTOM_BAR_PB = totalItems > 0 ? 'pb-56 sm:pb-40' : 'pb-32 sm:pb-24';

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 ${BOTTOM_BAR_PB}`}>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800 no-print">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0f172a] text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {storeSettings?.shopName || 'Public Store'} • Sivakasi Wholesale
            </span>
            <span className="text-xs text-rose-300 font-medium bg-[#1e141a] px-3 py-1 rounded-full border border-rose-500/30 shadow-sm">
              Flat 80% Off MRP
            </span>
            <span className="text-xs text-emerald-300 font-medium bg-[#0d1e17] px-3 py-1 rounded-full border border-emerald-500/30 hidden sm:inline-block shadow-sm">
              100% Green Crackers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Quick Order Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {storeSettings?.tagline || 'Enter quantities for any item. Savings & total calculate in real time.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <Link
            to="/products"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Visual View</span>
          </Link>
          {storeSettings?.priceListUrl && (
            <button
              type="button"
              onClick={() => setIsPriceListModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Price List (PDF)</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({totalItems})</span>
          </button>
        </div>
      </div>

      {/* ── Wholesale Rate Card / Price List Notice Banner ─────────────── */}
      {storeSettings?.priceListUrl && storeSettings?.showPriceListNotice !== false && (
        <div className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors no-print">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {storeSettings.priceListNoticeText || 'Wholesale Price List (PDF) Available'}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                  PDF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Download or view complete Sivakasi factory rate list with item codes, packing specifications &amp; wholesale prices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsPriceListModalOpen(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Online</span>
            </button>

            <a
              href={storeSettings.priceListUrl}
              download={storeSettings.priceListFileName || `${storeSettings?.shopName || 'Wholesale'}-Price-List.pdf`}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      )}

      {/* ── Search + Category Pills ──────────────────────────────────── */}
      <div className="space-y-3 no-print">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by cracker name or category..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors max-w-lg"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            Jump:
          </span>
          <button
            type="button"
            onClick={() => setFilterText('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
              !filterText ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterText(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                filterText.toLowerCase() === cat.toLowerCase()
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Print Header ─────────────────────────────────────────────── */}
      <div className="hidden print-only mb-6 text-center">
        <h2 className="text-2xl font-black">{storeSettings?.shopName || 'Fireworks Store'}</h2>
        <p className="text-sm">Factory Direct Wholesale Cracker Price List 2026</p>
      </div>

      {/* ── Tables / Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="shimmer-skeleton rounded-2xl h-48" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800/60">
          <div className="text-4xl mb-3">🎆</div>
          <p className="text-slate-400 font-medium">No crackers matched your filter.</p>
          <button
            onClick={() => setFilterText('')}
            className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((category) => {
            const catItems = filteredProducts.filter((p) => p.category === category);
            const catTotal = catItems.reduce((sum, p) => sum + getProductQty(p._id) * p.price, 0);

            return (
              <div key={category} className="glass-panel rounded-2xl overflow-hidden border border-slate-800/60">
                {/* Category Header */}
                <div className="bg-slate-950/90 px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                      {category}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({catItems.length})
                    </span>
                  </div>
                  {catTotal > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      ₹{catTotal.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* ── DESKTOP TABLE ──────────────────────────────────── */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/60 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3 w-14 no-print">Img</th>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Pack</th>
                        <th className="py-2.5 px-3 text-right">MRP</th>
                        <th className="py-2.5 px-3 text-right">Offer</th>
                        <th className="py-2.5 px-3 text-center w-36 no-print">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {catItems.map((product) => {
                        globalIndex++;
                        const currentQty = getProductQty(product._id);
                        const rowTotal = currentQty * product.price;

                        return (
                          <tr
                            key={product._id}
                            className={`transition-colors ${
                              currentQty > 0 ? 'bg-amber-500/5' : 'hover:bg-slate-800/30'
                            } ${!product.inStock ? 'opacity-40' : ''}`}
                          >
                            <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">{globalIndex}</td>
                            <td className="py-2 px-3 no-print">
                              <img
                                src={product.imageUrl || '/uploads/products/placeholder.webp'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800"
                                loading="lazy"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-white text-sm leading-snug">{product.name}</div>
                              {!product.inStock && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                  Out of Stock
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-300 text-xs">{product.piecePerBox}</td>
                            <td className="py-3 px-3 text-right line-through text-slate-500 text-xs">₹{product.mrp}</td>
                            <td className="py-3 px-3 text-right font-black text-amber-400 text-sm">₹{product.price}</td>
                            <td className="py-2.5 px-3 no-print">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  disabled={!product.inStock || currentQty <= 0}
                                  onClick={() => setItemExactQuantity(product, Math.max(0, currentQty - 1))}
                                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  disabled={!product.inStock}
                                  value={currentQty === 0 ? '' : currentQty}
                                  placeholder="0"
                                  onChange={(e) => setItemExactQuantity(product, e.target.value)}
                                  className={`w-14 h-8 py-1 text-center font-bold text-sm rounded-lg border focus:outline-none focus:ring-1 transition-colors ${
                                    currentQty > 0
                                      ? 'bg-amber-500 text-slate-950 border-amber-400 focus:ring-amber-400'
                                      : 'bg-slate-900 text-white border-slate-700/80 focus:border-amber-500 focus:ring-amber-500/50'
                                  } disabled:opacity-40`}
                                />
                                <button
                                  type="button"
                                  disabled={!product.inStock}
                                  onClick={() => setItemExactQuantity(product, currentQty + 1)}
                                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-xs sm:text-sm">
                              {rowTotal > 0 ? (
                                <span className="text-amber-300 font-extrabold">₹{rowTotal.toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-700">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── MOBILE CARD LIST ──────────────────────────────── */}
                <div className="sm:hidden divide-y divide-slate-800/50">
                  {catItems.map((product) => {
                    globalIndex++;
                    const currentQty = getProductQty(product._id);
                    const rowTotal = currentQty * product.price;

                    return (
                      <div
                        key={product._id}
                        className={`p-3.5 flex gap-3 transition-colors ${
                          currentQty > 0 ? 'bg-amber-500/5' : ''
                        } ${!product.inStock ? 'opacity-40' : ''}`}
                      >
                        {/* Image */}
                        <img
                          src={product.imageUrl || '/uploads/products/placeholder.webp'}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0"
                          loading="lazy"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <div className="font-bold text-white text-sm leading-snug line-clamp-2">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400">{product.piecePerBox}</span>
                              {!product.inStock && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price + Stepper */}
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-[10px] text-slate-500 line-through leading-none">₹{product.mrp}</div>
                              <div className="text-base font-extrabold text-amber-400 leading-tight">₹{product.price}</div>
                            </div>

                            {/* Qty Stepper */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                disabled={!product.inStock || currentQty <= 0}
                                onClick={() => setItemExactQuantity(product, Math.max(0, currentQty - 1))}
                                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 active:scale-95 transition-all"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                disabled={!product.inStock}
                                value={currentQty === 0 ? '' : currentQty}
                                placeholder="0"
                                onChange={(e) => setItemExactQuantity(product, e.target.value)}
                                className={`w-14 h-9 text-center font-bold text-sm rounded-xl border focus:outline-none transition-colors ${
                                  currentQty > 0
                                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                                    : 'bg-slate-900 text-white border-slate-700 focus:border-amber-500'
                                } disabled:opacity-40`}
                              />
                              <button
                                type="button"
                                disabled={!product.inStock}
                                onClick={() => setItemExactQuantity(product, currentQty + 1)}
                                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 active:scale-95 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Row Total */}
                          {rowTotal > 0 && (
                            <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg inline-block border border-emerald-500/20">
                              Subtotal: ₹{rowTotal.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── STICKY BOTTOM CALCULATION BAR ───────────────────────────── */}
      <div className="fixed bottom-[58px] md:bottom-0 left-0 right-0 z-30 bg-[#0d1420] border-t border-white/10 shadow-2xl no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Mobile: 2-row layout */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6">

          {/* Row 1: Summary metrics */}
          <div className="flex items-center justify-between gap-2 py-2.5 border-b border-slate-800/60 sm:hidden">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <div>
                <span className="text-slate-500">Items: </span>
                <span className="font-bold text-white">{totalItems}</span>
              </div>
              <div>
                <span className="text-slate-500">Saved: </span>
                <span className="font-bold text-emerald-400">₹{totalSavings.toLocaleString()}</span>
              </div>
              <div className="pl-2 border-l border-slate-800">
                <span className="text-slate-500">Total: </span>
                <span className="font-extrabold text-amber-400 text-sm">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            {savingsPercent > 0 && (
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 flex-shrink-0">
                {savingsPercent}% OFF
              </span>
            )}
          </div>

          {/* Row 2 (mobile) / Single row (desktop): Action */}
          <div className="py-2.5 flex items-center justify-between gap-3">
            {/* Desktop metrics */}
            <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs sm:text-sm flex-wrap">
              <div>
                <span className="text-slate-400">Items: </span>
                <span className="font-extrabold text-white">{totalItems} pcs</span>
              </div>
              <div className="hidden lg:block">
                <span className="text-slate-400">MRP: </span>
                <span className="line-through text-slate-500">₹{mrpTotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Saved: </span>
                <span className="font-bold text-emerald-400">₹{totalSavings.toLocaleString()} ({savingsPercent}%)</span>
              </div>
              <div className="pl-4 border-l border-slate-800">
                <span className="text-slate-400">Net Payable: </span>
                <span className="font-black text-amber-400 text-base sm:text-lg">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action area */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isMinOrderMet && totalItems > 0 && (
                <div className="hidden md:flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Add ₹{minOrderRemaining} more</span>
                </div>
              )}

              {!isMinOrderMet && totalItems > 0 && (
                <div className="flex md:hidden items-center gap-1.5 text-xs text-rose-400 flex-shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>₹{minOrderRemaining} more needed</span>
                </div>
              )}

              <button
                type="button"
                disabled={!isMinOrderMet}
                onClick={() => navigate('/checkout')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderPage;
