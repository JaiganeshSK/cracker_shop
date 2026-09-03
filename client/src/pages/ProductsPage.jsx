import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Zap, Sparkles, Volume2 } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const currentCategory = searchParams.get('category') || 'All';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSound, setSelectedSound] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== 'All') {
          params.append('category', currentCategory);
        }
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        if (inStockOnly) {
          params.append('inStock', 'true');
        }
        if (sortBy !== 'default') {
          params.append('sort', sortBy);
        }

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          let list = res.data.products;
          if (selectedSound !== 'All') {
            list = list.filter((p) => p.soundLevel === selectedSound);
          }
          setProducts(list);
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
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Title & Quick Order Switch Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Fireworks & Crackers Catalog</span>
            <span className="text-sm font-semibold bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
              {products.length} Items
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore authentic Sivakasi fireworks with visual packaging, audio ratings, and 80% festival discount.
          </p>
        </div>

        <Link
          to="/quick-order"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20 hover:opacity-95 flex items-center gap-2 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Switch to Quick Order Price List</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search sparklers, rockets, chakkars, 12 shots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Sound Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Sound Levels</option>
              <option value="Silent / Visual">Silent / Visual</option>
              <option value="Mild Sound">Mild Sound</option>
              <option value="Loud Sound">Loud Sound</option>
              <option value="Musical / Whistling">Musical / Whistling</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="default">Featured / Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount %</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentCategory === 'All'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentCategory === cat.name
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="glass-panel rounded-2xl h-80 animate-pulse bg-slate-900/60" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Crackers Found</h3>
          <p className="text-xs text-slate-400">
            No products matched your search or category filters. Try clearing your filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSound('All');
              handleCategoryChange('All');
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
