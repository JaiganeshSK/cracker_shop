import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquare, AlertCircle, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart, isCartOpen, setIsCartOpen,
    updateQuantity, removeFromCart, clearCart,
    totalItems, subtotal, mrpTotal, totalSavings,
    savingsPercent, deliveryFee, grandTotal,
    minOrderValue, isMinOrderMet, minOrderRemaining,
    generateWhatsAppMessage, storeSettings,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleWhatsAppClick = () => {
    const msg = generateWhatsAppMessage();
    const url = `https://wa.me/${storeSettings.whatsapp}?text=${msg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-surface-base/80 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-card border-l border-white/[0.06] shadow-2xl flex flex-col animate-drawer-in">

          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Cart</h2>
                <p className="text-xs text-slate-500">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-500 hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/8 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {cart.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-white/[0.06] flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Cart is empty</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Explore our catalog or open the Quick Order sheet to add fireworks.
                  </p>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); navigate('/quick-order'); }}
                  className="btn-gold px-6 py-2.5 text-xs"
                >
                  Open Quick Order Sheet
                </button>
              </div>
            ) : (
              <>
                {/* Min Order Alert */}
                {!isMinOrderMet ? (
                  <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-300">
                      <div className="font-semibold mb-0.5">Min. Order: ₹{minOrderValue}</div>
                      <p className="text-rose-300/70">Add ₹{minOrderRemaining} more to proceed.</p>
                      <div className="w-full bg-surface-elevated rounded-full h-1 mt-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round((subtotal / minOrderValue) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">Min. order threshold met</span>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="bg-surface-elevated border border-white/[0.06] rounded-xl p-3 flex gap-3 items-center"
                    >
                      <img
                        src={item.product.imageUrl || '/uploads/products/placeholder.webp'}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg bg-surface-card border border-white/[0.06] flex-shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/0d1420/d4a017?text=FW'; }}
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate mb-0.5">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 mb-2">
                          {item.product.piecePerBox} ·{' '}
                          <span className="line-through">₹{item.product.mrp}</span>{' '}
                          <span className="text-gold-400 font-semibold">₹{item.product.price}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-surface-card border border-white/[0.06] rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-white ml-auto">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/8 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer — Price Summary + Actions */}
          {cart.length > 0 && (
            <div className="px-5 py-4 border-t border-white/[0.06] bg-surface-base/60 space-y-4 flex-shrink-0">
              {/* Price Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>MRP Total</span>
                  <span className="line-through">₹{mrpTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Festival Discount ({savingsPercent}%)</span>
                  <span>- ₹{totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Item Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Total Payable</span>
                  <span className="text-lg font-extrabold text-gold-400">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  disabled={!isMinOrderMet}
                  className="w-full py-3 rounded-lg font-bold text-sm bg-gold-400 hover:bg-gold-300 text-surface-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold-400/20"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  disabled={!isMinOrderMet}
                  className="w-full py-2.5 rounded-lg font-semibold text-xs bg-emerald-600/12 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Order via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
