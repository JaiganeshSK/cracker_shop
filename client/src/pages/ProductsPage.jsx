import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Zap, Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const SOUND_LEVELS = ['All', 'Silent / Visual', 'Mild Sound', 'Musical / Whistling', 'Loud Sound'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'discount', label: 'Best Discount' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cracker_cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('cracker_cached_categories');
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
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get('category') || 'All';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSound, setSelectedSound] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.data.success && res.data.categories) {
          setCategories(res.data.categories);
          try {
            localStorage.setItem('cracker_cached_categories', JSON.stringify(res.data.categories));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      // Only show full loading spinner if we don't already have products displayed
      if (products.length === 0) {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== 'All') params.append('category', currentCategory);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (inStockOnly) params.append('inStock', 'true');
        if (sortBy !== 'default') params.append('sort', sortBy);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success && res.data.products) {
          let list = res.data.products;
          if (selectedSound !== 'All') list = list.filter((p) => p.soundLevel === selectedSound);
          setProducts(list);
          // Cache default catalog
          if (!currentCategory || currentCategory === 'All') {
            try {
              localStorage.setItem('cracker_cached_products', JSON.stringify(res.data.products));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, searchTerm, selectedSound, sortBy, inStockOnly]);

  const handleCategoryChange = (catName) => {
    const sp = new URLSearchParams(searchParams);
    if (catName === 'All') sp.delete('category');
    else sp.set('category', catName);
    setSearchParams(sp);
  };

  const clearSearch = () => setSearchTerm('');

  const resetAll = () => {
    setSearchTerm('');
    setSelectedSound('All');
    setSortBy('default');
    setInStockOnly(false);
    handleCategoryChange('All');
  };

  const hasActiveFilters =
    currentCategory !== 'All' || searchTerm || selectedSound !== 'All' || sortBy !== 'default' || inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
            <span>Fireworks Catalog</span>
            {!loading && (
              <span className="text-sm font-semibold bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                {products.length} Items
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authentic Sivakasi fireworks with visual packaging · Up to 80% off MRP
          </p>
        </div>

        <Link
          to="/quick-order"
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Quick Order Sheet</span>
        </Link>
      </div>

      {/* ── Search + Filter Row ──────────────────────────────────────── */}
      <div className="space-y-3">
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
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => handleCategoryChange('All')}
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
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                currentCategory === cat.name
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.name}
              <span className={`ml-1 text-[10px] ${currentCategory === cat.name ? 'opacity-70' : 'text-slate-500'}`}>
                ({cat.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="shimmer-skeleton rounded-2xl h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-sm mx-auto border border-slate-800/60">
          <div className="text-5xl">🎆</div>
          <h3 className="text-lg font-bold text-white">No Crackers Found</h3>
          <p className="text-xs text-slate-400">
            No products matched your search or filters. Try clearing your filters.
          </p>
          <button
            onClick={resetAll}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
