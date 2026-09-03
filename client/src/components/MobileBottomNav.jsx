import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Zap, PackageSearch, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 items-center text-center">
        {/* Quick Order (Default Home) */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
            isActive('/') || isActive('/quick-order') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5 fill-current" />
          <span className="text-[10px]">Quick Order</span>
        </Link>

        {/* Catalog */}
        <Link
          to="/products"
          className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
            isActive('/products') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Catalog</span>
        </Link>

        {/* Showcase */}
        <Link
          to="/showcase"
          className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
            isActive('/showcase') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Showcase</span>
        </Link>

        {/* Track Order */}
        <Link
          to="/track-order"
          className={`flex flex-col items-center py-1 rounded-lg transition-colors ${
            isActive('/track-order') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PackageSearch className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Track</span>
        </Link>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center py-1 text-slate-400 hover:text-amber-400"
          aria-label="Open Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-amber-400" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-950">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-amber-400">
            {subtotal > 0 ? `₹${subtotal}` : 'Cart'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
