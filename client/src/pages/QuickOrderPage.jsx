import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, ArrowRight, ShoppingBag, Search, X, LayoutGrid, SlidersHorizontal,
  CheckCircle2, AlertCircle, Plus, Minus, Sparkles, ChevronDown,
  FileText, Download, Eye,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const SOUND_LEVELS = ['All', 'Silent / Visual', 'Mild Sound', 'Musical / Whistling', 'Loud Sound'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'discount', label: 'Best Discount' },
];

const QuickOrderPage = () => {
  const navigate = useNavigate();
  const {
    cart, setItemExactQuantity, totalItems, subtotal, mrpTotal,
    totalSavings, savingsPercent, isMinOrderMet, minOrderValue,
    minOrderRemaining, grandTotal, setIsCartOpen, storeSettings,
    setIsPriceListModalOpen,
  } = useCart();

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cracker_cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('cracker_cached_products');
    } catch {
      return true;
    }
  });
  const [masterCategories, setMasterCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('cracker_cached_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSound, setSelectedSound] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=1000'),
          api.get('/products/categories'),
        ]);
        if (prodRes.data.success && prodRes.data.products) {
          setProducts(prodRes.data.products);
          try {
            localStorage.setItem('cracker_cached_products', JSON.stringify(prodRes.data.products));
          } catch (e) {}
        }
        if (catRes.data.success && catRes.data.categories) {
          setMasterCategories(catRes.data.categories);
          try {
            localStorage.setItem('cracker_cached_categories', JSON.stringify(catRes.data.categories));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Failed to load products for quick order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const clearSearch = () => setSearchTerm('');

  const resetAll = () => {
    setSearchTerm('');
    setSelectedSound('All');
    setSortBy('default');
    setInStockOnly(false);
    setCurrentCategory('All');
  };

  const hasActiveFilters =
    currentCategory !== 'All' || searchTerm || selectedSound !== 'All' || sortBy !== 'default' || inStockOnly;

  let filteredProducts = products.filter((p) => {
    let match = true;
    if (currentCategory !== 'All' && p.category !== currentCategory) match = false;
    if (selectedSound !== 'All' && p.soundLevel !== selectedSound) match = false;
    if (inStockOnly && !p.inStock) match = false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) match = false;
    }
    return match;
  });

  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
  } else if (sortBy === 'discount') {
    filteredProducts.sort((a, b) => {
      const p1 = Math.round(((a.price - (a.discountedPrice || a.price)) / a.price) * 100);
      const p2 = Math.round(((b.price - (b.discountedPrice || b.price)) / b.price) * 100);
      return p2 - p1;
    });
  }

  const categories =
    masterCategories.length > 0
      ? masterCategories.map((c) => c.name)
      : [...new Set(products.map((p) => p.category))];

  const getProductQty = (productId) => {
    const item = cart.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  let globalIndex = 0;

  // ── Bottom bar is always visible; use a fixed generous padding so the page
  // never jumps/wobbles when the first item is added to the cart.
  const BOTTOM_BAR_PB = 'pb-44 sm:pb-32';

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 ${BOTTOM_BAR_PB}`}>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06] no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
            <span>Quick Order Sheet</span>
            {!loading && (
              <span className="text-sm font-semibold bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                {filteredProducts.length} Items
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {storeSettings?.tagline || 'Enter quantities for any item. Savings & total calculate in real time.'}
          </p>
        </div>

        <Link
          to="/products"
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all active:scale-95"
        >
          <LayoutGrid className="w-4 h-4 fill-current" />
          <span>Catalog</span>
        </Link>
      </div>

      {/* ── Search + Filter Row ──────────────────────────────────────── */}
      <div className="space-y-3 no-print animate-fade-up-3">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sparklers, rockets, chakkars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle button (mobile) */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 sm:hidden" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Sound Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Sound Level
                </label>
                <select
                  value={selectedSound}
                  onChange={(e) => setSelectedSound(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {SOUND_LEVELS.map((s) => (
                    <option key={s} value={s}>{s === 'All' ? 'All Sounds' : s}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-end pb-0.5">
                <button
                  onClick={() => setInStockOnly((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm w-full justify-center border transition-colors ${
                    inStockOnly
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${inStockOnly ? 'bg-emerald-400 border-emerald-400' : 'border-slate-600'}`} />
                  <span>In Stock Only</span>
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetAll}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2"
              >
                ✕ Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Category Pills — horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 max-w-full overscroll-x-contain" style={{ touchAction: 'pan-x' }}>
          <button
            type="button"
            onClick={() => setCurrentCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              currentCategory === 'All'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCurrentCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                currentCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tables / Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="shimmer-skeleton rounded-2xl h-48" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800/60">
          <div className="text-4xl mb-3">🎆</div>
          <p className="text-slate-400 font-medium">No crackers matched your filter.</p>
          <button
            onClick={resetAll}
            className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((category) => {
            const catItems = filteredProducts.filter((p) => p.category === category);
            if (catItems.length === 0) return null;
            const catTotal = catItems.reduce((sum, p) => sum + getProductQty(p._id) * p.price, 0);

            return (
              <div key={category} className="glow-card rounded-2xl overflow-hidden">
                {/* Category Header */}
                <div className="cat-header px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex-shrink-0" />
                    <h3 className="text-sm font-black text-gradient-gold uppercase tracking-wider truncate">
                      {category}
                    </h3>
                    <span className="text-[11px] text-slate-600 font-medium flex-shrink-0">
                      ({catItems.length})
                    </span>
                  </div>
                  {catTotal > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex-shrink-0 max-w-[120px] truncate">
                      ₹{catTotal.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* ── DESKTOP TABLE ──────────────────────────────────── */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#060b15]/80 text-slate-600 text-[10px] uppercase tracking-wider border-b border-white/[0.05]">
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
                            className={`transition-all ${
                              currentQty > 0 ? 'row-selected' : 'hover:bg-white/[0.02]'
                            } ${!product.inStock ? 'opacity-40' : ''}`}
                          >

                            <td className="py-3 px-3 text-center text-slate-500 font-mono text-xs">{globalIndex}</td>
                            <td className="py-2 px-3 no-print">
                              <img
                                src={product.imageUrl || storeSettings?.logoUrl || ''}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800"
                                onError={(e) => { e.target.style.display = 'none'; }}
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
                          src={product.imageUrl || storeSettings?.logoUrl || ''}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0"
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; }}
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
