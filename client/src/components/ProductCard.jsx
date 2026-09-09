import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SOUND_CONFIG = {
  'Silent / Visual':     { cls: 'text-emerald-400 bg-emerald-400/8 border-emerald-400/15', label: 'Silent' },
  'Mild Sound':          { cls: 'text-blue-400 bg-blue-400/8 border-blue-400/15',           label: 'Mild'   },
  'Musical / Whistling': { cls: 'text-violet-400 bg-violet-400/8 border-violet-400/15',     label: 'Music'  },
  'Loud Sound':          { cls: 'text-rose-400 bg-rose-400/8 border-rose-400/15',           label: 'Loud'   },
};

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = cart.find((item) => item.product._id === product._id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => setQty((prev) => prev + 1);
  const handleDecrement = () => setQty((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const soundConfig = SOUND_CONFIG[product.soundLevel] || SOUND_CONFIG['Loud Sound'];
  const savings = product.mrp - product.price;
  const savingsPct = product.mrp > 0 ? Math.round((savings / product.mrp) * 100) : 0;

  return (
    <div className="premium-card rounded-xl overflow-hidden flex flex-col group relative">
      {/* Discount Badge */}
      {product.discountPercentage > 0 && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-surface-base/90 backdrop-blur-sm text-gold-400 font-bold text-[11px] px-2 py-0.5 rounded-md border border-gold-400/20 shadow-sm">
          -{product.discountPercentage}%
        </div>
      )}

      {/* Out of Stock Overlay */}
      {!product.inStock && (
        <div className="absolute inset-0 bg-surface-base/85 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
          <span className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-lg border border-white/10 uppercase tracking-widest">
            Sold Out
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] bg-surface-elevated overflow-hidden">
        <img
          src={product.imageUrl || '/uploads/products/placeholder.webp'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x450/0d1420/d4a017?text=Fireworks';
          }}
        />
        {/* Category pill */}
        <div className="absolute bottom-2 left-2 bg-surface-base/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-400 border border-white/[0.06]">
          {product.category}
        </div>
        {/* Cart in-cart badge */}
        {cartQty > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-surface-base">
            {cartQty}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          {/* Pack & Sound row */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-semibold text-gold-400/80 bg-gold-400/8 px-1.5 py-0.5 rounded border border-gold-400/15">
              {product.piecePerBox || '1 Box'}
            </span>
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${soundConfig.cls}`}>
              {soundConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Pricing + Action */}
        <div className="space-y-2.5">
          {/* Price row */}
          <div className="flex items-end justify-between gap-1">
            <div>
              {product.mrp > product.price && (
                <div className="text-[11px] text-slate-600 line-through leading-none mb-0.5">
                  ₹{product.mrp}
                </div>
              )}
              <div className="text-[17px] font-extrabold text-white leading-none">
                ₹{product.price}
              </div>
            </div>
            {savingsPct > 0 && (
              <div className="text-[11px] font-semibold text-emerald-400">
                Save {savingsPct}%
              </div>
            )}
          </div>

          {/* Stepper + Add Button — unified row */}
          <div className="flex items-center gap-2">
            {/* Qty Stepper */}
            <div className="flex items-center bg-surface-elevated border border-white/[0.07] rounded-lg overflow-hidden flex-shrink-0">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!product.inStock || qty <= 1}
                className="w-8 h-9 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center text-sm font-bold text-white select-none">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={!product.inStock}
                className="w-8 h-9 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 h-9 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gold-400 hover:bg-gold-300 text-surface-base shadow-md shadow-gold-400/20'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
