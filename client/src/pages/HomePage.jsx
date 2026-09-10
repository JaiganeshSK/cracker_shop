import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Truck, Percent, ArrowRight, Flame,
  CheckCircle, MessageSquare, Star, ListOrdered, Factory, Leaf, FileText,
  Eye, Download,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

/* Category icon mapping — using Lucide icons instead of emojis */
const CAT_ICON_MAP = {
  'sparkler':   '✦',
  'rocket':     '↑',
  'chakkar':    '◎',
  'flower':     '✿',
  'bomb':       '●',
  'wala':       '∿',
  'aerial':     '✦',
  'sky':        '↑',
  'fancy':      '★',
  'gift':       '⬡',
  'cracker':    '✦',
  'match':      '|',
  'twinkling':  '✦',
  'colour':     '◈',
};

const getCatInitial = (name = '') => {
  const lower = name.toLowerCase();
  const key = Object.keys(CAT_ICON_MAP).find((k) => lower.includes(k));
  return key ? CAT_ICON_MAP[key] : name.charAt(0).toUpperCase();
};

const TRUST_STATS = [
  { icon: Percent,    color: 'gold',    value: 'Up to 80% Off',          label: 'Factory Direct Pricing' },
  { icon: ShieldCheck,color: 'emerald', value: '100% Green Certified',   label: 'CSIR-NEERI Approved' },
  { icon: Truck,      color: 'blue',    value: 'Safe Express Delivery',  label: 'Authorised Logistics' },
  { icon: Flame,      color: 'rose',    value: 'Fresh 2026 Stock',       label: 'Zero Duds Guaranteed' },
];

const ICON_COLOR = {
  gold:    'text-gold-400',
  emerald: 'text-emerald-400',
  blue:    'text-blue-400',
  rose:    'text-rose-400',
};

const HomePage = () => {
  const { storeSettings, setIsPriceListModalOpen } = useCart();
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
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products);
        if (catRes.data.success)  setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="hero-bg pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">

            {/* Pre-badge */}
            <div className="animate-fade-up inline-flex items-center gap-2.5 badge-gradient px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 mb-7 tracking-wide">
              <Flame className="w-3.5 h-3.5 text-[#d4a017] fill-current" />
              <span>{storeSettings?.shopName || 'Public Store'} · Sivakasi Factory Direct</span>
              <span className="bg-gradient-to-r from-[#e8b830] to-[#d4a017] text-[#060b15] text-[10px] px-2.5 py-0.5 rounded-full font-black shadow-sm">
                80% OFF
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up-1 text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-5">
              {storeSettings?.shopName || 'Public Store'}
              <br />
              <span className="text-gradient-gold">Celebrations</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up-2 text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-9 leading-relaxed">
              {storeSettings?.tagline || 'Authentic 100% Green Certified fireworks from Sivakasi. Wholesale factory prices, maximum discounts, safe delivery to your doorstep.'}
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-up-3 flex flex-col xs:flex-row items-center justify-center gap-3 mb-14">
              <Link
                to="/quick-order"
                className="btn-gold btn-ripple w-full xs:w-auto px-8 py-3.5 text-sm rounded-xl"
              >
                <Zap className="w-4 h-4" />
                Quick Order · Price List
              </Link>
              {storeSettings?.priceListUrl && storeSettings?.showPriceListNotice !== false && (
                <button
                  type="button"
                  onClick={() => setIsPriceListModalOpen(true)}
                  className="btn-ghost w-full xs:w-auto px-6 py-3.5 text-sm flex items-center justify-center gap-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10 transition-colors rounded-xl"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Price List (PDF)</span>
                </button>
              )}
              <Link
                to="/products"
                className="btn-ghost w-full xs:w-auto px-8 py-3.5 text-sm rounded-xl"
              >
                Browse Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_STATS.map(({ icon: Icon, color, value, label }, i) => (
                <div
                  key={value}
                  className={`glow-card rounded-xl p-4 text-left animate-fade-up-${i + 4}`}
                >
                  <Icon className={`w-5 h-5 ${ICON_COLOR[color]} mb-2.5`} />
                  <div className="text-sm font-bold text-white leading-snug">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GRADIENT DIVIDER ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="gradient-divider" />
      </div>

      {/* ── 2. KEY FACTS STRIP ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Factory, label: 'Factory Direct',   sub: 'No middleman markup',  color: 'text-gold-400',    idx: 1 },
            { icon: Leaf,    label: 'Green Certified',  sub: 'Eco-safe fireworks',   color: 'text-emerald-400', idx: 2 },
            { icon: Zap,     label: 'Instant Booking',  sub: 'Order ready in 2 min', color: 'text-blue-400',    idx: 3 },
          ].map((item) => (
            <div key={item.label} className={`glow-card rounded-xl p-5 text-center animate-fade-up-${item.idx}`}>
              <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-3`} />
              <div className="text-sm font-bold text-white">{item.label}</div>
              <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHOLESALE RATE CARD BANNER ────────────────────────────────────── */}
      {storeSettings?.priceListUrl && storeSettings?.showPriceListNotice !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glow-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-up">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {storeSettings.priceListNoticeText || 'Wholesale Price List (PDF)'}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider badge-gradient text-amber-400 px-2 py-0.5 rounded">
                    PDF
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Official {storeSettings?.shopName || 'Public Store'} catalog with product codes, case packing specifications, and factory wholesale rates.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPriceListModalOpen(true)}
                className="btn-gold btn-ripple flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>View Online</span>
              </button>
              <a
                href={storeSettings.priceListUrl}
                download={storeSettings.priceListFileName || `${storeSettings?.shopName || 'Wholesale'}-Price-List.pdf`}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. CATEGORIES ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div className="animate-slide-left">
            <div className="section-label">Browse Categories</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sivakasi Collection
            </h2>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="shimmer-skeleton h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`glow-card rounded-xl p-4 flex flex-col justify-between min-h-[100px] group animate-fade-up-${Math.min(i + 1, 8)}`}
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-3 group-hover:bg-gold-400/20 group-hover:scale-110 transition-all duration-300">
                    <span className="text-gold-400 font-black text-base leading-none">
                      {getCatInitial(cat.name)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-gold-400 transition-colors duration-200 leading-snug line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{cat.count} items</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── GRADIENT DIVIDER ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="gradient-divider" />
      </div>

      {/* ── 4. FEATURED PRODUCTS ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-7">
          <div className="animate-slide-left">
            <div className="section-label">Top Picks</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Diwali Best Sellers
            </h2>
          </div>
          <Link
            to="/quick-order"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-gold-400 border border-gold-400/25 hover:bg-gold-400/8 hover:border-gold-400/40 transition-all"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Price List
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="shimmer-skeleton rounded-xl h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.slice(0, 8).map((product, i) => (
              <div key={product._id} className={`animate-fade-up-${Math.min(i + 1, 8)}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. SOCIAL PROOF ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glow-card rounded-2xl p-6 sm:p-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>
              <div>
                <span className="text-base font-bold text-white">4.9 / 5</span>
                <span className="text-sm text-slate-500 ml-2">· 2,400+ customers</span>
              </div>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                'Genuine Sivakasi Crackers',
                'Secure Packed Delivery',
                'Zero Counterfeit Products',
              ].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. QUICK ORDER CTA ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glow-card rounded-2xl p-7 sm:p-10 overflow-hidden relative animate-fade-up"
             style={{ borderLeft: '3px solid rgba(212,160,23,0.6)' }}>
          {/* Background gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-transparent pointer-events-none" />
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }} />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-gold-400 text-xs font-bold uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5" />
                Bulk Ordering
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Order All Crackers<br className="sm:hidden" /> in One Sheet
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                View our complete wholesale price list, enter quantities, and see your total savings calculated instantly — no cart needed.
              </p>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
              <Link
                to="/quick-order"
                className="btn-gold btn-ripple px-7 py-3.5 text-sm rounded-xl"
              >
                <Zap className="w-4 h-4" />
                Open Price List
              </Link>
              <a
                href={`https://wa.me/${''}`}
                className="flex items-center justify-center gap-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/45 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;