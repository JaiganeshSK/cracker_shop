import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, ShieldCheck, Truck, Percent, ArrowRight, Star, Flame, CheckCircle } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true'),
          api.get('/products/categories'),
        ]);

        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Festive Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-300 mb-6 shadow-inner animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Diwali 2026 Pre-Booking Now Active • Sivakasi Factory Direct</span>
            <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              80% OFF
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Light Up Your Celebrations with{' '}
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
              Premium Sivakasi Crackers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            Buy authentic 100% Green Certified Fireworks straight from the manufacturing hub of Sivakasi. Enjoy wholesale factory prices, maximum discounts, and safe transport to your doorstep.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-12">
            <Link
              to="/quick-order"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>⚡ Quick Order / Price List Sheet</span>
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Visual Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80 text-left">
            <div className="glass-panel p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Up to 80% Discount</div>
                <div className="text-[11px] text-slate-400">Direct Factory Price</div>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">100% Green Certified</div>
                <div className="text-[11px] text-slate-400">CSIR-NEERI Approved</div>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Safe Express Dispatch</div>
                <div className="text-[11px] text-slate-400">Authorized Logistics</div>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Fresh 2026 Stock</div>
                <div className="text-[11px] text-slate-400">Zero Duds Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              Browse Categories
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Sivakasi Fireworks Collection
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400 mb-3 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{cat.count} items</span>
                <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED FESTIVE SPECIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
              Top Picks & Combos
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Diwali Best Sellers & Aerial Specials
            </h2>
          </div>
          <Link
            to="/quick-order"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Order via Price List</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-panel rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. FAST QUICK ORDER PROMO CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 p-8 sm:p-12 shadow-2xl shadow-rose-900/30 text-white">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block bg-slate-950/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
              ⚡ High-Speed Bulk Ordering
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Order All Your Crackers in One Single Sheet!
            </h3>
            <p className="text-xs sm:text-base text-amber-100/90 leading-relaxed font-normal">
              Skip adding items one by one! View our complete Sivakasi wholesale price list table, enter desired quantities for each cracker, and watch your total savings calculate instantly.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/quick-order"
                className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-6 py-3 rounded-xl text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Open Quick Order Sheet Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
