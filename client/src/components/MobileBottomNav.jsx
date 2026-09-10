import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListOrdered, LayoutGrid, ShoppingBag, FileText, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems, subtotal, setIsCartOpen, storeSettings, setIsPriceListModalOpen } = useCart();

  const hasRatePdf = Boolean(storeSettings?.priceListUrl && storeSettings?.showPriceListNotice !== false);

  const isActive = (paths) =>
    Array.isArray(paths) ? paths.includes(location.pathname) : location.pathname === paths;

  const navItems = [
    { to: '/',         paths: ['/', '/quick-order'], icon: ListOrdered, label: 'Order'   },
    { to: '/products', paths: ['/products'],         icon: LayoutGrid,  label: 'Catalog' },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-bottom-nav"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className={`grid ${hasRatePdf ? 'grid-cols-4' : 'grid-cols-3'} items-stretch h-[58px]`}>
        {navItems.map((item) => {
          const active = isActive(item.paths);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center h-full gap-1 transition-all relative ${
                active ? 'text-gold-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {/* Top indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #e8b830, #d4a017)' }} />
              )}
              <Icon
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  active ? 'drop-shadow-[0_0_6px_rgba(212,160,23,0.7)]' : ''
                }`}
              />
              <span className="text-[10px] font-semibold leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Rate Card PDF button on mobile */}
        {hasRatePdf && (
          <button
            type="button"
            onClick={() => setIsPriceListModalOpen(true)}
            className="flex flex-col items-center justify-center h-full gap-1 transition-colors relative text-slate-400 hover:text-amber-400"
            aria-label="Wholesale Price List PDF"
          >
            <div className="relative">
              <FileText className="w-[18px] h-[18px]" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500" />
            </div>
            <span className="text-[10px] font-semibold leading-none">
              Price List
            </span>
          </button>
        )}

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center h-full gap-1 relative transition-all ${
            totalItems > 0 ? 'text-gold-400' : 'text-slate-600 hover:text-slate-400'
          }`}
          aria-label="Open Cart"
        >
          {totalItems > 0 && (
            <span className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, #e8b830, #d4a017)' }} />
          )}
          <div className="relative">
            <ShoppingBag className={`w-[18px] h-[18px] transition-all ${
              totalItems > 0 ? 'drop-shadow-[0_0_6px_rgba(212,160,23,0.65)]' : ''
            }`} />
            {totalItems > 0 && (
              <span className="badge-bounce absolute -top-2 -right-2.5 bg-rose-600 text-white text-[9px] font-black min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-surface-base px-0.5 shadow-sm shadow-rose-600/30">
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

