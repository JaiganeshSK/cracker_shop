import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Volume2, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Check if product is already in cart
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

  const getSoundBadgeClass = (level) => {
    switch (level) {
      case 'Silent / Visual':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Mild Sound':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Musical / Whistling':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Loud Sound':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col group border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 relative">
      {/* Discount Tag */}
      {product.discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-md shadow-rose-600/30 flex items-center gap-1">
          <span>🔥</span>
          <span>{product.discountPercentage}% OFF</span>
        </div>
      )}

      {/* Out of Stock Overlay */}
      {!product.inStock && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <span className="bg-rose-600/90 text-white font-black text-sm px-4 py-2 rounded-xl uppercase tracking-wider shadow-lg">
            Sold Out / Out of Stock
          </span>
        </div>
      )}

      {/* Product Image (WebP) */}
      <div className="relative w-full aspect-square bg-slate-900/60 overflow-hidden flex items-center justify-center">
        <img
          src={product.imageUrl || '/uploads/products/placeholder.webp'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x600/1e293b/f59e0b?text=Festive+Cracker';
          }}
        />
        {/* Category Pill Overlaid at bottom right of image */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-300 border border-slate-800">
          {product.category}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Packaging & Sound Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {product.piecePerBox || '1 Box'}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${getSoundBadgeClass(product.soundLevel)}`}>
              <Volume2 className="w-3 h-3" />
              <span>{product.soundLevel}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-slate-400 line-through mr-2">
                MRP ₹{product.mrp}
              </span>
              <span className="text-xl font-extrabold text-amber-400">
                ₹{product.price}
              </span>
            </div>
            {cartQty > 0 && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                In Cart: {cartQty}
              </span>
            )}
          </div>

          {/* Quantity Stepper & Add Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!product.inStock || qty <= 1}
                className="w-8 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-white">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={!product.inStock}
                className="w-8 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-md ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
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
