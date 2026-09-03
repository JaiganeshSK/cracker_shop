import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cracker_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    minOrderValue: 3000,
    freeDeliveryAbove: 12000,
    defaultDeliveryFee: 250,
    whatsapp: '919443123456',
    shopName: 'Sri Krishna Fireworks',
  });

  // Fetch store settings for min order & delivery fees
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.setting) {
          setStoreSettings(res.data.setting);
        }
      } catch (err) {
        console.error('Failed to load store settings in cart:', err);
      }
    };
    fetchSettings();
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('cracker_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) return;
    const qty = Math.max(1, parseInt(quantity) || 1);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [...prev, { product, quantity: qty }];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const setItemExactQuantity = (product, quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) {
      removeFromCart(product._id);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = qty;
        return updated;
      } else {
        return [...prev, { product, quantity: qty }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const mrpTotal = cart.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, mrpTotal - subtotal);
  const savingsPercent = mrpTotal > 0 ? Math.round((totalSavings / mrpTotal) * 100) : 0;

  const minOrderValue = storeSettings.minOrderValue || 3000;
  const freeDeliveryAbove = storeSettings.freeDeliveryAbove || 12000;
  const defaultDeliveryFee = storeSettings.defaultDeliveryFee || 250;

  const isMinOrderMet = subtotal >= minOrderValue;
  const minOrderRemaining = Math.max(0, minOrderValue - subtotal);

  const deliveryFee = subtotal >= freeDeliveryAbove ? 0 : defaultDeliveryFee;
  const grandTotal = subtotal + (subtotal > 0 ? deliveryFee : 0);

  // Helper to format WhatsApp order message text
  const generateWhatsAppMessage = (customerInfo = {}) => {
    const lines = [
      `🧨 *NEW CRACKER ORDER - ${storeSettings.shopName || 'Sri Krishna Fireworks'}* 🧨`,
      `━━━━━━━━━━━━━━━━━━━━━`,
    ];

    if (customerInfo.name) {
      lines.push(`👤 *Customer:* ${customerInfo.name}`);
      lines.push(`📞 *Phone:* ${customerInfo.phone || ''}`);
      lines.push(`📍 *Delivery Address:* ${customerInfo.address || ''}, ${customerInfo.city || ''} - ${customerInfo.pincode || ''}`);
      if (customerInfo.preferredDeliveryDate) {
        lines.push(`📅 *Preferred Date:* ${customerInfo.preferredDeliveryDate}`);
      }
      lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    }

    lines.push(`📦 *ORDERED ITEMS (${totalItems} Pcs/Boxes):*`);
    cart.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. ${item.product.name} (${item.product.piecePerBox})` +
        `\n   ↳ ${item.quantity} x ₹${item.product.price} = *₹${item.quantity * item.product.price}* (MRP ₹${item.product.mrp * item.quantity})`
      );
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🏷️ *MRP Total:* ₹${mrpTotal}`);
    lines.push(`🎉 *Festival Discount Saved:* ₹${totalSavings} (${savingsPercent}% OFF)`);
    lines.push(`💵 *Item Subtotal:* ₹${subtotal}`);
    lines.push(`🚚 *Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}`);
    lines.push(`✨ *NET PAYABLE:* *₹${grandTotal}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Please confirm my order and share payment instructions. Thank you!`);

    return encodeURIComponent(lines.join('\n'));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        setItemExactQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        mrpTotal,
        totalSavings,
        savingsPercent,
        minOrderValue,
        freeDeliveryAbove,
        deliveryFee,
        grandTotal,
        isMinOrderMet,
        minOrderRemaining,
        storeSettings,
        generateWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
