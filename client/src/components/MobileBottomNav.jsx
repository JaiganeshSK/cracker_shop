import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListOrdered, LayoutGrid, PackageSearch, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  const isActive = (paths) =>
    Array.isArray(paths) ? paths.includes(location.pathname) : location.pathname === paths;

  const navItems = [
    { to: '/',           paths: ['/', '/quick-order'], icon: ListOrdered,  label: 'Order'    },
    { to: '/products',   paths: ['/products'],         icon: LayoutGrid,   label: 'Catalog'  },
    { to: '/track-order',paths: ['/track-order'],      icon: PackageSearch,label: 'Track'    },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c14] border-t border-white/10 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-4 items-stretch h-[58px]">
        {navItems.map((item) => {
          const active = isActive(item.paths);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center h-full gap-1 transition-colors relative ${
                active ? 'text-gold-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {/* Top indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gold-400 rounded-full" />
              )}
              <Icon className={`w-[18px] h-[18px] ${active ? '' : ''}`} />
              <span className={`text-[10px] font-semibold leading-none`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center h-full gap-1 relative transition-colors ${
            totalItems > 0 ? 'text-gold-400' : 'text-slate-600 hover:text-slate-400'
          }`}
          aria-label="Open Cart"
        >
          {totalItems > 0 && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gold-400 rounded-full" />
          )}
          <div className="relative">
            <ShoppingBag className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-rose-600 text-white text-[9px] font-black min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-surface-base px-0.5">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold leading-none">
            {subtotal > 0
              ? `₹${subtotal >= 1000 ? (subtotal / 1000).toFixed(1) + 'k' : subtotal}`
              : 'Cart'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
