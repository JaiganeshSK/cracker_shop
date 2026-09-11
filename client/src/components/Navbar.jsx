import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, ShoppingBag, Menu, X, ShieldAlert, PhoneCall, ListOrdered, LayoutGrid, FileText, Download, Lock } from 'lucide-react';
import { WhatsAppIcon } from './icons/BrandIcons';
import { useCart } from '../context/CartContext';

const Navbar = ({ onOpenSafetyModal }) => {
  const { totalItems, subtotal, setIsCartOpen, storeSettings, setIsPriceListModalOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/',          label: 'Quick Order', icon: ListOrdered, match: ['/', '/quick-order'] },
    { to: '/products',  label: 'Catalog',     icon: LayoutGrid,  match: ['/products', '/catalog'] },
  ];

  const isLinkActive = (paths) => paths.includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav" style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 4px 24px -4px rgba(0,0,0,0.4)' }}>
      {/* Announcement Bar */}
      {storeSettings.isAnnouncementActive && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#b8860b] via-[#d4a017] to-[#b8860b] text-[#060b15] text-xs py-2 flex font-bold">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 pr-12">
            <span className="flex items-center gap-2 tracking-wide font-extrabold">
              <Flame className="w-3.5 h-3.5 inline-block fill-current" />
              {storeSettings.announcementText}
              <span className="bg-[#060b15] text-[#d4a017] px-2 py-0.5 rounded font-black text-[11px] shadow-sm">
                Min ₹{storeSettings.minOrderValue}
              </span>
            </span>
            <span className="flex items-center gap-2 tracking-wide font-extrabold">
              <Flame className="w-3.5 h-3.5 inline-block fill-current" />
              {storeSettings.announcementText}
              <span className="bg-[#060b15] text-[#d4a017] px-2 py-0.5 rounded font-black text-[11px] shadow-sm">
                Min ₹{storeSettings.minOrderValue}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              {storeSettings.logoUrl ? (
                <div className="h-9 sm:h-10 max-w-[130px] flex items-center flex-shrink-0">
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.shopName || 'Store Logo'}
                    className="max-h-full max-w-full object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center flex-shrink-0 group-hover:from-gold-200 group-hover:to-gold-400 transition-all shadow-lg shadow-gold-500/20">
                  <Flame className="w-4 h-4 text-surface-base" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-[15px] tracking-tight text-white leading-tight">
                  {storeSettings.shopName || 'Public Store'}
                </div>
                <div className="text-[10px] text-gold-400/90 font-semibold tracking-wider uppercase leading-tight truncate max-w-[160px] sm:max-w-[220px]">
                  {storeSettings.tagline ? storeSettings.tagline.slice(0, 32) : 'Sivakasi Direct'}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = isLinkActive(link.match);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      active
                        ? 'text-gold-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{link.label}</span>
                    {active && <span className="nav-active-line" />}
                  </Link>
                );
              })}
              {onOpenSafetyModal && (
                <button
                  onClick={onOpenSafetyModal}
                  className="relative px-4 py-2 rounded-lg text-sm font-semibold text-emerald-400/80 hover:text-emerald-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Safety</span>
                </button>
              )}

            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* WhatsApp — desktop only */}
              <a
                href={`https://wa.me/${String(storeSettings?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${storeSettings?.shopName || 'Store'}, I want to place an order`)}`}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/35 transition-all"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                <span>WhatsApp</span>
              </a>

              {/* Admin Portal */}
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-white border border-slate-800 hover:border-slate-700 hover:bg-white/5 transition-all"
                title="Admin Portal Login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>


              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="btn-ripple relative flex items-center gap-2 btn-gold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                <span className="hidden sm:inline font-bold">Cart</span>
                {totalItems > 0 && (
                  <span className="badge-bounce relative flex items-center justify-center bg-surface-base text-gold-400 text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
                {subtotal > 0 && (
                  <span className="hidden md:inline text-xs font-bold bg-surface-base/20 px-1.5 py-0.5 rounded">
                    ₹{subtotal.toLocaleString()}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#060b15]/95 backdrop-blur-2xl px-4 pt-3 pb-4 space-y-1 animate-fade-up">

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm text-surface-base bg-gold-400 hover:bg-gold-300 transition-colors"
            >
              <ListOrdered className="w-4 h-4 flex-shrink-0" />
              <div>
                <div>Quick Order Sheet</div>
                <div className="text-[11px] font-medium opacity-70">Wholesale Price List</div>
              </div>
            </Link>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Products Catalog</span>
            </Link>

            {onOpenSafetyModal && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenSafetyModal(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-400 hover:bg-white/5 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Fireworks Safety & Legal Notice</span>
              </button>
            )}

            {/* WhatsApp CTA */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${String(storeSettings?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${storeSettings?.shopName || 'Store'}, I want to place an order`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-950/40"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp · {storeSettings.phone}</span>
              </a>
            </div>

            {/* Admin Portal Login — Mobile Drawer */}
            <div className="pt-2 border-t border-white/[0.08]">
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Admin Portal Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
