import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Truck, Percent, ArrowRight, Flame,
  CheckCircle, MessageSquare, Star, ListOrdered, Factory, Leaf,
  Sparkles, Award, HeartHandshake, PackageCheck, AlertTriangle,
  Phone, MapPin, Eye, Download, Info
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { WhatsAppIcon } from '../components/icons/BrandIcons';

/* Category icon mapping */
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
  {
    icon: Percent,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    value: 'Up to 80% Off',
    title: 'Factory Direct Pricing',
    desc: 'Direct Sivakasi wholesale rates without middleman markup.'
  },
  {
    icon: Leaf,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    value: '100% Green Certified',
    title: 'CSIR-NEERI Approved',
    desc: 'Low-smoke, eco-friendly crackers complying with safety norms.'
  },
  {
    icon: Truck,
    color: 'text-sky-400',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/10',
    value: 'Safe Nationwide Dispatch',
    title: 'Multi-Layer Packing',
    desc: 'Heavy-duty 5-layer corrugated packing for damage-free transit.'
  },
  {
    icon: Flame,
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    value: 'Fresh 2026 Stock',
    title: 'Zero Duds Guarantee',
    desc: 'Strict moisture testing ensures every piece ignites flawlessly.'
  },
];

const SIGNATURE_COLLECTIONS = [
  {
    title: 'Family Celebration Combos',
    desc: 'Deluxe gift trunks packed with assorted sparklers, chakkars, pots & fancy aerial shots.',
    badge: 'Best Value',
    tag: 'Gift Boxes & Combos',
    color: 'from-amber-500/20 to-orange-500/5',
    border: 'border-amber-500/30',
  },
  {
    title: 'Flower Pots & Fountains',
    desc: 'Giant golden fountains, crackling showers, and multicolor pyro waterfalls for every courtyard.',
    badge: 'Family Favorite',
    tag: 'Flower Pots',
    color: 'from-rose-500/20 to-pink-500/5',
    border: 'border-rose-500/30',
  },
  {
    title: 'Ground Chakkars & Spinners',
    desc: 'Rapid spinning fireworks emitting sparkling golden rings and high-speed multi-hued flares.',
    badge: 'Popular',
    tag: 'Ground Chakkars',
    color: 'from-emerald-500/20 to-teal-500/5',
    border: 'border-emerald-500/30',
  },
  {
    title: 'Sky Shots & Night Repeaters',
    desc: '12, 30 & 60 multi-shot aerial repeaters bursting with glittering palms, brocades and sirens.',
    badge: 'Diwali Special',
    tag: 'Fancy Aerial & Sky Shots',
    color: 'from-purple-500/20 to-indigo-500/5',
    border: 'border-purple-500/30',
  },
  {
    title: 'Electric & Neon Sparklers',
    desc: 'Long-lasting silver and rainbow sparklers carefully calibrated for safe fun with children.',
    badge: 'Kids Safe',
    tag: 'Sparklers',
    color: 'from-yellow-500/20 to-amber-500/5',
    border: 'border-yellow-500/30',
  },
  {
    title: 'Traditional Sound & Garlands',
    desc: 'Classic Sivakasi morning pooja crackers, high decibel atom bombs, and celebration wala laris.',
    badge: 'Traditional',
    tag: 'Single Sound Crackers',
    color: 'from-red-500/20 to-orange-500/5',
    border: 'border-red-500/30',
  },
];

const WHY_CHOOSE_US = [
  {
    icon: Factory,
    title: 'Direct From Sivakasi Sheds',
    desc: 'Located directly at the heart of India\'s fireworks capital. We cut out distributors, brokers, and retail marks-up so you get genuine factory wholesale rates.',
  },
  {
    icon: Leaf,
    title: '100% CSIR-NEERI Green Certified',
    desc: 'All our products adhere strictly to government standards and Supreme Court guidelines, reducing particulate matter by 30-40% without compromising brightness.',
  },
  {
    icon: Award,
    title: 'Zero Duds & Premium Chemicals',
    desc: 'Every batch is freshly manufactured for the 2026 season. We test moisture levels to ensure you never experience damp or non-firing fireworks.',
  },
  {
    icon: PackageCheck,
    title: 'Heavy-Duty 5-Ply Transport Packaging',
    desc: 'Crackers are wrapped in moisture-resistant polymer sheets and encased inside reinforced 5-ply corrugated cartons to guarantee zero damage during transit.',
  },
  {
    icon: ListOrdered,
    title: '1-Minute Quick Order Rate Card',
    desc: 'No confusing catalogs needed! Our wholesale price list allows you to enter quantities row-by-row and see your total invoice & savings calculated in real-time.',
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated Sivakasi Support Desk',
    desc: 'From custom family combos to bulk apartment society orders, our experienced team provides quick WhatsApp updates and dispatch guidance.',
  },
];

const SAFETY_TIPS = [
  { tip: 'Always ignite fireworks outdoors in open, clear ground away from flammable structures or dry leaves.' },
  { tip: 'Maintain a safe bucket of water and sand nearby for emergency extinguishing and spent sparkler disposal.' },
  { tip: 'Light crackers at arm\'s length using a long agarbatti (incense stick) or sparkler, never open matches.' },
  { tip: 'Never bend over an ignited cracker. If a cracker fails to ignite, do not inspect it immediately.' },
  { tip: 'Ensure small children are always supervised by adults and wear comfortable cotton clothing.' },
];

const REVIEWS = [
  {
    name: 'Rajesh K.',
    city: 'Bengaluru',
    rating: 5,
    comment: 'Ordered the 45-item Maharaja Combo and aerial shots. Every single piece fired with brilliant colors! Packaging was rock-solid and delivery was super fast.',
  },
  {
    name: 'Suresh Kumar',
    city: 'Hyderabad',
    rating: 5,
    comment: 'The 80% factory direct pricing saved us almost ₹12,000 compared to local roadside shops. 100% authentic Sivakasi stock with zero duds. Pradhika Crackers is now our family tradition!',
  },
  {
    name: 'Meenakshi Sundaram',
    city: 'Chennai',
    rating: 5,
    comment: 'Quick order sheet made ordering for our entire apartment society seamless. The rate card calculated our discount instantly, and WhatsApp support answered all queries.',
  },
];

const HomePage = () => {
  const { storeSettings } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const shopName = storeSettings?.shopName || 'Pradhika Crackers';
  const whatsappNumber = String(storeSettings?.whatsapp || '').replace(/\D/g, '');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true'),
          api.get('/products/categories'),
        ]);
        if (prodRes.data?.success) setFeaturedProducts(prodRes.data.products || []);
        if (catRes.data?.success)  setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-10 xs:space-y-14 sm:space-y-20 pb-28 text-slate-100 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">

      {/* ─────────────────────────────────────────────────────────────────────────
          1. HERO FRONT SECTION (Mobile-First Banner Showcase)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-3 sm:pt-6 pb-2 sm:pb-6 overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[700px] h-[200px] sm:h-[350px] bg-amber-500/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

        <div className="relative z-10">

          {/* Top Announcement Tag */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="inline-flex items-center gap-2 badge-gradient px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-amber-300 shadow-lg shadow-amber-950/20 border border-amber-500/25 max-w-full">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse flex-shrink-0" />
              <span className="font-bold tracking-wide uppercase truncate">
                {shopName} · Sivakasi Direct
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm flex-shrink-0">
                80% OFF
              </span>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7 px-2">
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.12] mb-2 sm:mb-3">
              Light Up Happiness <br className="hidden xs:inline" />
              <span className="text-gradient-gold">This Diwali</span>
            </h1>
            <p className="text-slate-300 text-xs xs:text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Premium 100% Green Certified fireworks directly from Sivakasi factory sheds. 
              Wholesale pricing, zero middleman markup, and safe express doorstep delivery.
            </p>
          </div>

          {/* Primary Action Buttons (Responsive Stack on Mobile, Row on Desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-10 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              to="/quick-order"
              className="btn-gold btn-ripple w-full sm:w-auto px-5 sm:px-8 py-3.5 text-xs sm:text-sm rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 min-h-[46px]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Quick Order (Wholesale Rate Card)</span>
            </Link>

            <Link
              to="/products"
              className="btn-ghost w-full sm:w-auto px-5 sm:px-8 py-3.5 text-xs sm:text-sm rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 hover:border-amber-400/50 bg-white/5 hover:bg-white/10 transition-all min-h-[46px]"
            >
              <span>Explore Products Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${shopName}, I would like to order crackers for Diwali!`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 text-xs sm:text-sm rounded-xl font-semibold flex items-center justify-center gap-2 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-lg min-h-[46px]"
            >
              <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              FRONT HERO BANNER IMAGE (Unobstructed & Fluid Responsive)
          ───────────────────────────────────────────────────────────────── */}
          <div className="relative rounded-xl xs:rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_30px_rgba(212,160,23,0.15)] bg-slate-950 group">
            {/* The Image (Aspect 16:9 guarantees all Diwali celebration artwork is visible without distortion) */}
            <img
              src="/images/pradhika-banner.jpg"
              alt="Pradhika Crackers - Light Up Happiness This Diwali"
              className="w-full h-auto aspect-[16/9] object-cover sm:aspect-auto sm:max-h-[640px] transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              loading="eager"
            />

            {/* Desktop-Only Glass Overlay Strip */}
            <div className="hidden sm:flex absolute bottom-0 left-0 right-0 p-5 lg:p-6 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent items-center justify-between gap-4 border-t border-white/10">
              <div className="space-y-0.5">
                <div className="text-white font-extrabold text-base lg:text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  <span>Pradhika Crackers Diwali Celebration Collection</span>
                </div>
                <p className="text-xs text-amber-200/80">
                  Featured: Celebration Packs · Flower Pots · Ground Chakkars · Color Shots · Sparklers
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/quick-order"
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/30"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Order Now</span>
                </Link>
                <Link
                  to="/products"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>

            {/* Mobile-Only Action Strip (Directly Below Image to Not Obstruct Banner Graphics) */}
            <div className="sm:hidden p-3.5 bg-slate-950 border-t border-amber-500/20 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Diwali 2026 Collection</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  80% Off Sivakasi Direct
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/quick-order"
                  className="btn-gold py-2.5 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Quick Order</span>
                </Link>
                <Link
                  to="/products"
                  className="btn-ghost py-2.5 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Catalog</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Stats Strip (2 Columns on Mobile, 4 on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mt-5 sm:mt-8">
            {TRUST_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className={`glow-card rounded-xl p-3 sm:p-4.5 border ${stat.border} flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 hover:border-amber-400/40 transition-all`}
                >
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white leading-snug truncate">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-amber-300/90 mt-0.5 truncate">{stat.title}</div>
                    <div className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2 sm:line-clamp-none">{stat.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. DETAILED ABOUT THE COMPANY (Mobile-Optimized Layout)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="glow-card rounded-xl xs:rounded-2xl sm:rounded-3xl p-4.5 xs:p-6 sm:p-8 md:p-10 border border-amber-500/25 relative overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">

            {/* Left Column: Detailed Narrative */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About Pradhika Crackers</span>
              </div>

              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Authentic Sivakasi Manufacturing, <br />
                <span className="text-gradient-gold">Delivered Straight to Your Doorstep</span>
              </h2>

              <p className="text-slate-300 text-xs xs:text-sm sm:text-[15px] leading-relaxed">
                Welcome to <strong>Pradhika Crackers</strong>, your trusted destination for genuine Sivakasi fireworks. 
                Rooted in the pyrotechnics capital of India, we craft the most vibrant, reliable, and joyous fireworks 
                that make Diwali unforgettable for every family.
              </p>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                By operating directly from manufacturing sheds without middlemen or retail markups, 
                we pass on wholesale factory savings of <strong>up to 80%</strong> directly to consumers and bulk buyers across India.
              </p>

              {/* Company Highlights Checkmarks */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 pt-1">
                {[
                  '100% CSIR-NEERI Green Certified',
                  'Zero Middlemen • Wholesale Pricing',
                  'Strict Decibel Limit Compliance',
                  'Fresh 2026 Season Batch Guarantee',
                  'Waterproof 5-Ply Transit Cartons',
                  'Transparent Itemized Invoices',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col xs:flex-row gap-2.5">
                <Link
                  to="/quick-order"
                  className="btn-gold px-5 py-3 text-xs sm:text-sm rounded-xl font-bold flex items-center justify-center gap-2 text-center"
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>Open Wholesale Rate Card</span>
                </Link>
                <Link
                  to="/products"
                  className="px-5 py-3 text-xs sm:text-sm rounded-xl font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Browse Full Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Factory & Quality Badge Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0b101d] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                    <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-sm sm:text-base">Sivakasi Factory Direct</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400">Manufactured & Dispatched from Sivakasi, Tamil Nadu</p>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-white/10 pt-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Factory Unit & Hub</div>
                      <div className="text-slate-400 leading-relaxed text-[11px] sm:text-xs break-words">
                        {storeSettings?.address || 'Sivakasi Main By-Pass Road, Sivakasi, Tamil Nadu – 626123'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Green Pyro Formulation</div>
                      <div className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                        Barium-free formulations reducing smoke by 30–40%.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Nationwide Safe Logistics</div>
                      <div className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                        Authorised road freight transport with tracking updates.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Callout */}
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <div className="font-bold text-emerald-400 text-xs">Need Bulk / Society Quote?</div>
                    <div className="text-slate-400 text-[10px] sm:text-[11px]">Chat directly on WhatsApp</div>
                  </div>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${shopName}, I need a bulk quote for Diwali`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 sm:px-3 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                    aria-label="WhatsApp bulk inquiry"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span className="hidden xs:inline">Chat</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. WHY CHOOSE PRADHIKA CRACKERS (6 Key Value Pillars)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
          <div className="section-label">Our Core Promise</div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Thousands of Families Choose Pradhika
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            We combine authentic craftsmanship with certified green standards and factory pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {WHY_CHOOSE_US.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glow-card rounded-xl sm:rounded-2xl p-4 sm:p-5 sm:p-6 border border-white/5 hover:border-amber-400/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-amber-400/20 transition-all">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. SIGNATURE PRODUCT RANGES (Featured on Banner)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex flex-col xs:flex-row items-start xs:items-end justify-between mb-5 sm:mb-8 gap-2">
          <div>
            <div className="section-label">Festive Collection</div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Signature Ranges
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              From giant celebration boxes to colorful aerial repeaters.
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {SIGNATURE_COLLECTIONS.map((col) => (
            <Link
              key={col.title}
              to={`/products?category=${encodeURIComponent(col.tag)}`}
              className={`glow-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${col.border} bg-gradient-to-br ${col.color} hover:border-amber-400/60 transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[9px] xs:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-400/30">
                    {col.badge}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                  {col.title}
                </h3>
                <p className="text-xs text-slate-300/90 leading-relaxed mb-3 line-clamp-3">
                  {col.desc}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span className="text-[11px] sm:text-xs">Explore Range</span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">Direct Price →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. DIWALI BEST SELLERS (Live Product Catalog Preview)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-5 sm:mb-7">
          <div>
            <div className="section-label">Handpicked Favorites</div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Diwali Top Picks
            </h2>
          </div>
          <Link
            to="/quick-order"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold text-amber-400 border border-amber-400/25 hover:bg-amber-400/10 transition-all flex-shrink-0"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Full Rate Card</span>
            <span className="xs:hidden">Rate Card</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="shimmer-skeleton rounded-xl h-64 sm:h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {featuredProducts.slice(0, 8).map((product, i) => (
              <div key={product._id || i}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. ONE-SHEET QUICK ORDER CALLOUT (Responsive Banner)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div
          className="glow-card rounded-xl xs:rounded-2xl sm:rounded-3xl p-4.5 xs:p-6 sm:p-8 md:p-10 overflow-hidden relative border border-amber-500/40 bg-gradient-to-r from-slate-950 via-[#0e1627] to-slate-950 shadow-2xl"
          style={{ borderLeft: '4px solid #d4a017' }}
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-60 sm:w-96 h-60 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-8">
            <div className="max-w-xl space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                <Zap className="w-3.5 h-3.5" />
                <span>Super Fast 1-Minute Booking</span>
              </div>
              <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Order All Crackers <br />
                <span className="text-gradient-gold">in One Unified Sheet</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Save hours of scrolling through item cards. Our wholesale rate sheet lets you view all categories, 
                enter required box quantities, and track your total bill and 80% savings in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
              <Link
                to="/quick-order"
                className="btn-gold btn-ripple px-6 py-3.5 text-xs sm:text-sm rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 text-center"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Launch Quick Order Sheet</span>
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${shopName}, I would like to place an order via WhatsApp!`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 text-xs sm:text-sm rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-center"
              >
                <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          7. SAFETY ADVISORY & GREEN PLEDGE
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="glow-card rounded-xl xs:rounded-2xl sm:rounded-3xl p-4.5 xs:p-6 sm:p-8 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-extrabold text-white">Pradhika Safety First Guidelines</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Celebrate safely with your family and loved ones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{tip.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          8. CUSTOMER REVIEWS & SOCIAL PROOF
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 px-2">
          <div className="section-label">Customer Feedback</div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trusted by Families Across India
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-xs sm:text-sm font-bold text-white ml-2">4.9 / 5.0</span>
            <span className="text-[11px] sm:text-xs text-slate-400 ml-1">(2,400+ Verified Orders)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {REVIEWS.map((rev) => (
            <div key={rev.name} className="glow-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-3">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{rev.name}</span>
                <span className="text-slate-400">{rev.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;