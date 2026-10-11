import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, Truck, Percent, ArrowRight, Flame,
  CheckCircle, MessageSquare, Star, ListOrdered, Factory, Leaf,
  Sparkles, Award, HeartHandshake, PackageCheck, AlertTriangle,
  Phone, MapPin, Eye, Download, LayoutGrid, ChevronRight, Check
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { WhatsAppIcon } from '../components/icons/BrandIcons';

/* Category icon mapping */
const CATEGORY_ITEMS = [
  { name: 'Sparklers',               label: 'Sparklers',       icon: '✦', badge: 'Kids Safe',      color: 'from-amber-500/20 to-yellow-500/10' },
  { name: 'Ground Chakkars',          label: 'Chakkars',        icon: '◎', badge: 'Classic',        color: 'from-orange-500/20 to-amber-500/10' },
  { name: 'Flower Pots',              label: 'Flower Pots',     icon: '✿', badge: 'Popular',        color: 'from-rose-500/20 to-pink-500/10'    },
  { name: 'Fancy Aerial & Sky Shots', label: 'Sky Shots',       icon: '↑', badge: 'Night Visual',   color: 'from-purple-500/20 to-indigo-500/10' },
  { name: 'Single Sound Crackers',    label: 'Sound & Lariss',  icon: '●', badge: 'Loud',           color: 'from-red-500/20 to-orange-500/10'   },
  { name: 'Gift Boxes & Combos',      label: 'Gift Boxes',      icon: '⬡', badge: 'Mega Value',     color: 'from-yellow-500/20 to-amber-500/10' },
  { name: 'Novelty & Kids Crackers',  label: 'Kids Novelty',    icon: '◈', badge: 'Eco Safe',       color: 'from-emerald-500/20 to-teal-500/10' },
  { name: 'Rockets & Missiles',       label: 'Rockets',         icon: '▲', badge: 'Aerial',         color: 'from-blue-500/20 to-cyan-500/10'    },
];

const TRUST_STATS = [
  {
    icon: Percent,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    value: 'Up to 80% Off',
    title: 'Factory Direct Pricing',
    desc: 'Zero middleman markups. Direct Sivakasi wholesale rates.',
  },
  {
    icon: Leaf,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    value: '100% Green Certified',
    title: 'CSIR-NEERI Approved',
    desc: 'Low-smoke, barium-free eco pyrotechnics.',
  },
  {
    icon: Truck,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/20',
    value: 'Pan-India Express',
    title: '5-Ply Armored Packing',
    desc: 'Heavy-duty moisture-proof cartons for safe transit.',
  },
  {
    icon: Flame,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    value: 'Fresh 2026 Stock',
    title: 'Zero Duds Guaranteed',
    desc: 'Strict batch ignition testing before dispatch.',
  },
];

const SIGNATURE_PACKS = [
  {
    title: 'Royal Celebration Combo (45 Items)',
    category: 'Gift Boxes & Combos',
    subtitle: 'VIP Festive Assortment for Entire Family',
    mrp: 7500,
    price: 1500,
    badge: 'Best Value · 80% Off',
    highlight: 'Includes Giant Aerial Cakes, Deluxe Pots, Chakkars & Sparklers',
  },
  {
    title: 'Diwali Sparkle Family Box (25 Items)',
    category: 'Gift Boxes & Combos',
    subtitle: 'Complete Variety Pack for Children & Families',
    mrp: 3200,
    price: 640,
    badge: 'Popular Family Pack',
    highlight: 'Handpicked Non-stop Sparkles, Color Pots & Ground Wheels',
  },
  {
    title: 'Mega 60 Shots Multicolor Sky Cake',
    category: 'Fancy Aerial & Sky Shots',
    subtitle: 'High Altitude Continuous Night Sky Repeater',
    mrp: 3800,
    price: 760,
    badge: 'Diwali Special',
    highlight: 'Glittering Golden Brocades, Ruby Palms & Siren Tails',
  },
];

const SAFETY_TIPS = [
  { step: '01', title: 'Light Outdoors Only', desc: 'Always ignite fireworks in open spaces away from buildings, vehicles, and dry foliage.' },
  { step: '02', title: 'Water & Sand Standby', desc: 'Keep a bucket of water and sand nearby for emergency extinguishing and spent sparkler dip.' },
  { step: '03', title: 'Arm’s Length Ignition', desc: 'Use a long incense stick (agarbatti) to light fuses. Never lean over ignited fireworks.' },
  { step: '04', title: 'Adult Supervision', desc: 'Children must always be supervised by adults and wear comfortable cotton clothing.' },
];

const REVIEWS = [
  {
    name: 'Rajesh Kannan',
    city: 'Bengaluru',
    rating: 5,
    tag: 'Verified Family Order',
    comment: 'The 45-item celebration combo trunk arrived in spotless condition. Every single cracker ignited with brilliant colors. Saved over ₹11,000 compared to local stores!',
  },
  {
    name: 'Suresh Kumar',
    city: 'Hyderabad',
    rating: 5,
    tag: 'Bulk Society Order',
    comment: 'Ordered for our residential gated community. The wholesale rate card made itemized quantity selection effortless. True Sivakasi factory pricing!',
  },
  {
    name: 'Priyanka Sharma',
    city: 'Chennai',
    rating: 5,
    tag: 'Verified Purchase',
    comment: 'Low-smoke green crackers were perfect for my kids. Safe, vibrant, zero duds, and great WhatsApp communication from the Sivakasi team.',
  },
];

const HomePage = () => {
  const { storeSettings } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const shopName = storeSettings?.shopName || 'Pradhika Crackers';
  const whatsappNumber = String(storeSettings?.whatsapp || '').replace(/\D/g, '');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const prodRes = await api.get('/products?featured=true');
        if (prodRes.data?.success) setFeaturedProducts(prodRes.data.products || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-16 pb-28 text-slate-100 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">

      {/* ─────────────────────────────────────────────────────────────────────────
          1. HERO SHOWCASE (Banner First & Center, Mobile-App Ergonomics)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="pt-2 sm:pt-4">
        {/* Banner Card Container */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_35px_rgba(212,160,23,0.18)] bg-slate-950 group">
          
          {/* Floating Pill on Banner */}
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-lg">
              <Flame className="w-3 h-3 text-amber-400 fill-current animate-pulse" />
              <span>Sivakasi Factory Direct · Flat 80% Off</span>
            </span>
          </div>

          {/* The Hero Banner Artwork (Clean 16:9 Aspect Ratio) */}
          <img
            src="/images/pradhika-banner.jpg"
            alt="Pradhika Crackers - Light Up Happiness This Diwali"
            className="w-full h-auto aspect-[16/9] object-cover sm:max-h-[620px] transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            loading="eager"
          />

          {/* Bottom Desktop Overlay */}
          <div className="hidden sm:flex absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent items-center justify-between gap-4 border-t border-white/10 z-10">
            <div className="space-y-0.5">
              <div className="text-white font-extrabold text-base lg:text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                <span>Pradhika Crackers Diwali 2026 Collection</span>
              </div>
              <p className="text-xs text-amber-200/80">
                Celebration Packs · Flower Pots · Ground Chakkars · Color Shots · Sparklers
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                to="/quick-order"
                className="btn-gold px-5 py-2.5 text-xs font-black rounded-xl shadow-lg shadow-amber-950/30 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Quick Order Rate Sheet</span>
              </Link>
              <Link
                to="/products"
                className="btn-ghost px-4 py-2.5 text-xs font-bold rounded-xl border border-white/15 hover:border-amber-400/40"
              >
                Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Quick Action Buttons (Immediately Below Banner for Instant Touch Access) */}
        <div className="mt-3.5 sm:hidden space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/quick-order"
              className="btn-gold btn-ripple py-3.5 px-3 text-xs font-black rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5 text-center"
            >
              <Zap className="w-4 h-4 fill-current flex-shrink-0" />
              <span>Quick Order (80% Off)</span>
            </Link>

            <Link
              to="/products"
              className="btn-ghost py-3.5 px-3 text-xs font-bold rounded-xl border border-white/15 bg-white/[0.04] flex items-center justify-center gap-1.5 text-center text-slate-200"
            >
              <LayoutGrid className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Browse Catalog</span>
            </Link>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${shopName}, I would like to place an order for Diwali!`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all text-center"
          >
            <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
            <span>Order or Inquire on WhatsApp</span>
          </a>
        </div>

        {/* Trust Stats Bar (2x2 on Mobile, 4-Cols on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 mt-3.5 sm:mt-6">
          {TRUST_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`glow-card rounded-xl p-3 sm:p-4 border ${stat.border} flex items-start gap-2.5 sm:gap-3 transition-all`}
              >
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-white truncate leading-snug">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-amber-300/90 truncate mt-0.5">{stat.title}</div>
                  <div className="text-[9px] sm:text-[11px] text-slate-400 leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5">{stat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. APP-STYLE CATEGORY REEL (Tap to Browse)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-amber-400 inline-block" />
            <h2 className="text-sm sm:text-lg font-extrabold text-white uppercase tracking-wider">
              Browse Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Scroll on Mobile, Grid on Tablet/Desktop */}
        <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {CATEGORY_ITEMS.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="flex-shrink-0 w-24 sm:w-auto p-2.5 sm:p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 hover:border-amber-400/40 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 group-hover:bg-amber-400/20 group-hover:scale-105 transition-all flex items-center justify-center text-amber-400 font-black text-lg mb-2">
                {cat.icon}
              </div>
              <span className="text-[11px] font-bold text-white group-hover:text-amber-400 transition-colors leading-tight truncate w-full">
                {cat.label}
              </span>
              <span className="text-[9px] text-amber-300/80 font-medium mt-0.5 truncate w-full">
                {cat.badge}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. SIGNATURE FESTIVE COMBOS & PACKS (High Conversion Visual Cards)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="section-label">Diwali Specials</div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
              Signature Celebration Packs
            </h2>
          </div>
          <Link
            to="/quick-order"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Rate Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {SIGNATURE_PACKS.map((pack) => (
            <div
              key={pack.title}
              className="glow-card rounded-2xl p-4 sm:p-5 border border-amber-500/25 bg-gradient-to-b from-[#0e1627] via-[#09101d] to-[#060b15] flex flex-col justify-between group hover:border-amber-400/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    {pack.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{pack.category}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                  {pack.title}
                </h3>
                <p className="text-xs text-slate-400 mb-2.5 leading-snug">{pack.subtitle}</p>
                <p className="text-[11px] text-amber-200/90 bg-white/[0.03] p-2 rounded-lg border border-white/5 mb-3 leading-relaxed">
                  {pack.highlight}
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between pt-2 border-t border-white/10 mb-3">
                  <div>
                    <span className="text-[11px] text-slate-500 line-through mr-1.5">₹{pack.mrp}</span>
                    <span className="text-lg font-black text-white">₹{pack.price}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Save ₹{pack.mrp - pack.price}
                  </span>
                </div>

                <Link
                  to="/quick-order"
                  className="btn-gold w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-center"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Book in Quick Order Sheet</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. 1-MINUTE QUICK ORDER CALLOUT (Mobile-Friendly Interactive Rate Card)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="glow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-500/35 bg-gradient-to-b sm:bg-gradient-to-r from-[#0c1424] via-[#09101d] to-[#0c1424] shadow-2xl relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-8">
            <div className="max-w-xl space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-current flex-shrink-0" />
                <span>Super Fast 1-Minute Booking</span>
              </div>

              <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                Order All Crackers in <span className="text-gradient-gold">One Unified Rate Sheet</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Skip browsing one item at a time! View the entire Sivakasi wholesale price list on a single screen, enter required quantities row-by-row, and see your live 80% discount and total bill calculated in real-time.
              </p>

              {/* 3 Mobile Step Chips */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                <div className="flex flex-col xs:flex-row items-center xs:items-start gap-1 xs:gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] sm:text-[11px] font-semibold text-slate-300 text-center xs:text-left">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">1</span>
                  <span>Row-by-Row Entry</span>
                </div>
                <div className="flex flex-col xs:flex-row items-center xs:items-start gap-1 xs:gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] sm:text-[11px] font-semibold text-slate-300 text-center xs:text-left">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">2</span>
                  <span>Live Bill Total</span>
                </div>
                <div className="flex flex-col xs:flex-row items-center xs:items-start gap-1 xs:gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] sm:text-[11px] font-semibold text-slate-300 text-center xs:text-left">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">3</span>
                  <span>Safe Dispatch</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
              <Link
                to="/quick-order"
                className="btn-gold btn-ripple w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 min-h-[48px] active:scale-[0.98] transition-transform text-center"
              >
                <Zap className="w-4 h-4 fill-current flex-shrink-0" />
                <span>Launch Quick Order Sheet</span>
              </Link>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${shopName}, I would like to place an order via WhatsApp!`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 min-h-[48px] active:scale-[0.98] transition-all text-center"
              >
                <WhatsAppIcon className="w-4 h-4 fill-emerald-400 flex-shrink-0" />
                <span>Order via WhatsApp</span>
              </a>

              <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Sivakasi Direct Factory Pricing · 80% Off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. ABOUT PRADHIKA CRACKERS (Modern Company Storytelling & Metrics)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="glow-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-500/25 bg-slate-900/60 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About Pradhika Crackers</span>
              </div>

              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Authentic Sivakasi Manufacturing, <br />
                <span className="text-gradient-gold">Direct to Your Doorstep</span>
              </h2>

              <p className="text-slate-300 text-xs xs:text-sm leading-relaxed">
                Founded in the fireworks manufacturing capital Sivakasi, <strong>Pradhika Crackers</strong> brings authentic, vibrant, and certified safe fireworks directly from manufacturing sheds to Indian households.
              </p>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                By eliminating seasonal brokers and retail markups, we pass on genuine wholesale factory savings of <strong>up to 80%</strong> directly to you.
              </p>

              {/* 4 Metric Counter Tiles */}
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 pt-2">
                {[
                  { val: '80%', lbl: 'Factory Discount' },
                  { val: '100%', lbl: 'Green Certified' },
                  { val: '2026', lbl: 'Fresh Season Batch' },
                  { val: '2400+', lbl: 'Happy Families' },
                ].map((item) => (
                  <div key={item.lbl} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <div className="text-base sm:text-lg font-black text-amber-400 leading-none">{item.val}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{item.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>CSIR-NEERI Approved Green Crackers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Zero Duds & Moisture-Proof Testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Reinforced 5-Ply Transit Cartons</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Transparent Itemized Billing</span>
                </div>
              </div>
            </div>

            {/* Right Factory Card */}
            <div className="lg:col-span-5 bg-[#0b101d] rounded-2xl p-4 sm:p-5 border border-amber-500/20 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sivakasi Manufacturing Hub</h4>
                  <p className="text-[11px] text-slate-400">Direct From Tamil Nadu Factory Sheds</p>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug text-slate-400">{storeSettings?.address || 'Sivakasi Main By-Pass Road, Sivakasi, Tamil Nadu – 626123'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug text-slate-400">Barium-free formulations, emitting 30–40% less smoke.</span>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  to="/products"
                  className="btn-ghost w-full py-2.5 text-xs font-semibold rounded-xl border border-white/15 flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Explore Entire Sivakasi Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. DIWALI BEST SELLERS (Live Product Grid)
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="section-label">Popular Picks</div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
              Diwali Best Sellers
            </h2>
          </div>
          <Link
            to="/quick-order"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Price List</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
          7. SAFETY ADVISORY GUIDELINES
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="glow-card rounded-2xl p-4 sm:p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Pradhika Safety First Guidelines</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Celebrate safely with your family and children</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
            {SAFETY_TIPS.map((tip) => (
              <div key={tip.step} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-black">{tip.step}</span>
                  <span>{tip.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          8. CUSTOMER REVIEWS & RATINGS
      ───────────────────────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center max-w-xl mx-auto mb-5 sm:mb-6 px-2">
          <div className="section-label">Customer Feedback</div>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
            Loved by Thousands of Families
          </h2>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-xs font-bold text-white ml-1.5">4.9 / 5.0</span>
            <span className="text-[10px] text-slate-400 ml-1">(2,400+ Verified Orders)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {REVIEWS.map((rev) => (
            <div key={rev.name} className="glow-card rounded-xl p-3.5 sm:p-4 border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">{rev.tag}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic mb-3">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{rev.name}</span>
                <span className="text-slate-400 text-[11px]">{rev.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;