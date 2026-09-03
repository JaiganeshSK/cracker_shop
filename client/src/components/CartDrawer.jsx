import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    mrpTotal,
    totalSavings,
    savingsPercent,
    deliveryFee,
    grandTotal,
    minOrderValue,
    isMinOrderMet,
    minOrderRemaining,
    freeDeliveryAbove,
    generateWhatsAppMessage,
    storeSettings,
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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Cracker Cart</h2>
                <p className="text-xs text-slate-400">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body: Item List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500">
                  <Sparkles className="w-10 h-10 text-amber-500/40 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Explore our Sivakasi direct catalog or open the Quick Order sheet to fill your cart!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/quick-order');
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
                >
                  Open Quick Order Sheet
                </button>
              </div>
            ) : (
              <>
                {/* Minimum Order Alert / Progress Bar */}
                {!isMinOrderMet ? (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Minimum Order Required: ₹{minOrderValue}</span>
                      <p className="text-[11px] text-rose-300/80 mt-0.5">
                        Please add items worth ₹{minOrderRemaining} more to proceed with checkout.
                      </p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round((subtotal / minOrderValue) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold">Minimum order threshold met!</span>
                    </div>
                    {subtotal < freeDeliveryAbove && (
                      <span className="text-[11px] text-emerald-400/80">
                        Add ₹{freeDeliveryAbove - subtotal} for Free Delivery!
                      </span>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex gap-3 items-center"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.imageUrl || '/uploads/products/placeholder.webp'}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100/1e293b/f59e0b?text=Cracker';
                        }}
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate mb-0.5">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-slate-400 mb-1">
                          {item.product.piecePerBox} • <span className="line-through text-slate-400">₹{item.product.mrp}</span>{' '}
                          <span className="text-amber-400 font-bold">₹{item.product.price}</span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-white ml-auto">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer: Price Summary & Checkout Buttons */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/90 space-y-4">
              {/* Calculations */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Total MRP Value</span>
                  <span className="line-through">₹{mrpTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Festival Discount Saved ({savingsPercent}%)</span>
                  <span>- ₹{totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm sm:text-base font-extrabold text-white">
                  <span>Net Payable Amount</span>
                  <span className="text-amber-400 text-lg">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  disabled={!isMinOrderMet}
                  className="w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Online Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  disabled={!isMinOrderMet}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>1-Click WhatsApp Order Summary</span>
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
