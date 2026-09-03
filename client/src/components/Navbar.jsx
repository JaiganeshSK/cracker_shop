import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ShoppingBag, Search, Menu, X, ShieldAlert, PhoneCall, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = ({ onOpenSafetyModal }) => {
  const { totalItems, subtotal, setIsCartOpen, storeSettings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Announcement Marquee */}
      {storeSettings.isAnnouncementActive && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2 overflow-hidden">
          <span className="inline-block animate-pulse">🔥</span>
          <span className="truncate">{storeSettings.announcementText}</span>
          <span className="hidden sm:inline-block font-semibold bg-white/20 px-2 py-0.5 rounded text-[11px]">
            Min Order: ₹{storeSettings.minOrderValue}
          </span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              </div>
              <div>
                <div className="font-extrabold text-base sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  <span>Sri Krishna</span>
                  <span className="text-amber-400">Fireworks</span>
                </div>
                <div className="text-[10px] sm:text-xs text-amber-300/80 font-medium tracking-wider uppercase">
                  Sivakasi Direct Factory
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links - Quick Order as Default */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/') || isActive('/quick-order')
                    ? 'text-white bg-gradient-to-r from-amber-500 to-rose-600 shadow-md shadow-amber-500/20'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Quick Order Sheet</span>
              </Link>
              <Link
                to="/products"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/products') || isActive('/catalog') ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Visual Catalog
              </Link>
              <Link
                to="/showcase"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/showcase') ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Festive Showcase
              </Link>
              <Link
                to="/track-order"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/track-order') ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Track Order
              </Link>
              {onOpenSafetyModal && (
                <button
                  onClick={onOpenSafetyModal}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Safety Tips</span>
                </button>
              )}
            </nav>

            {/* Right Actions: Cart & Contact */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp Quick Link */}
              <a
                href={`https://wa.me/${storeSettings.whatsapp}?text=Hello%20Sri%20Krishna%20Fireworks,%20I%20have%20an%20inquiry%20about%20crackers`}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp Enquiry</span>
              </a>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-95"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-5 h-5 text-slate-950" />
                <span className="hidden sm:inline text-sm">Cart</span>
                {totalItems > 0 && (
                  <span className="flex items-center justify-center bg-rose-600 text-white text-xs font-black min-w-[20px] h-5 px-1 rounded-full border border-slate-950 animate-bounce">
                    {totalItems}
                  </span>
                )}
                {subtotal > 0 && (
                  <span className="hidden md:inline text-xs font-black bg-slate-950/20 px-1.5 py-0.5 rounded">
                    ₹{subtotal.toLocaleString()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20"
            >
              ⚡ Quick Order / Price List Sheet
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              🎆 Visual Products Catalog
            </Link>
            <Link
              to="/showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              ✨ Festive Deals Showcase
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              📦 Track My Order
            </Link>
            {onOpenSafetyModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSafetyModal();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-base font-medium text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Fireworks Safety & Legal Notice</span>
              </button>
            )}
            <div className="pt-2 border-t border-slate-800/80">
              <a
                href={`https://wa.me/${storeSettings.whatsapp}?text=Hello%20Sri%20Krishna%20Fireworks,%20I%20have%20an%20inquiry`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Chat on WhatsApp ({storeSettings.phone})</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
