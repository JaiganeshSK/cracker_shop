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
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('cracker_store_settings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to parse cached store settings:', e);
    }
    return {
      minOrderValue: 3000,
      freeDeliveryAbove: 12000,
      defaultDeliveryFee: 250,
      whatsapp: '919443123456',
      shopName: 'Sri Krishna Fireworks',
      logoUrl: '',
      announcementText: '',
      isAnnouncementActive: true,
    };
  });

  const updateStoreSettings = (newSettings) => {
    if (!newSettings) return;
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      localStorage.setItem('cracker_store_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to cache store settings:', e);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.setting) {
        updateStoreSettings(res.data.setting);
      }
    } catch (err) {
      console.error('Failed to load store settings in cart:', err);
    }
  };

  // Fetch store settings for min order & delivery fees
  useEffect(() => {
    refreshSettings();
  }, []);

  // Dynamically update browser tab title and favicon based on shop settings
  useEffect(() => {
    if (storeSettings?.shopName) {
      document.title = storeSettings.tagline
        ? `${storeSettings.shopName} | ${storeSettings.tagline}`
        : `${storeSettings.shopName} | Factory Direct Cracker Store`;
    }
    if (storeSettings?.logoUrl) {
      const faviconLink = document.querySelector("link[rel*='icon']");
      if (faviconLink) {
        faviconLink.href = storeSettings.logoUrl;
      }
    }
  }, [storeSettings?.shopName, storeSettings?.tagline, storeSettings?.logoUrl]);

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

  // Helper to format WhatsApp order message text with professional monospaced receipt block
  const generateWhatsAppMessage = (customerInfo = {}, orderId = null) => {
    const shopName = storeSettings.shopName || 'Sri Krishna Fireworks Sivakasi';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const lines = [
      `*NEW WHATSAPP ORDER*`,
      `*${shopName}*`,
      `----------------------------------------`,
    ];

    if (orderId) {
      lines.push(`*WhatsApp Order No:* *#${orderId}*`);
    }

    if (customerInfo.name) {
      const phone = customerInfo.whatsapp || customerInfo.phone || '';
      lines.push(`*Customer:* ${customerInfo.name}${phone ? ` (${phone})` : ''}`);
      const dest = [
        customerInfo.address,
        customerInfo.landmark ? `Near ${customerInfo.landmark}` : null,
        customerInfo.city,
        customerInfo.state || 'Tamil Nadu',
        customerInfo.pincode,
      ]
        .filter(Boolean)
        .join(', ');
      lines.push(`*Delivery Destination:* ${dest}`);
      if (customerInfo.preferredDeliveryDate) {
        lines.push(`*Preferred Delivery Date:* ${customerInfo.preferredDeliveryDate}`);
      }
      lines.push(`----------------------------------------`);
    }

    // WhatsApp monospaced receipt block using triple backticks
    const receiptLines = [
      '```',
      'QTY  ITEM DESCRIPTION          AMOUNT',
      '--------------------------------------',
    ];

    cart.forEach((item) => {
      const qtyStr = `${item.quantity}x`.padEnd(5, ' ');
      // Truncate item name to 20 chars if needed
      const rawName = item.product.name.replace(/[^\x20-\x7E]/g, '');
      const nameStr = (rawName.length > 20 ? rawName.slice(0, 19) + '.' : rawName).padEnd(21, ' ');
      const totalStr = `Rs.${(item.quantity * item.product.price).toLocaleString()}`.padStart(12, ' ');
      receiptLines.push(`${qtyStr}${nameStr}${totalStr}`);
    });

    receiptLines.push('--------------------------------------');
    receiptLines.push(`Subtotal:             ${('Rs.' + subtotal.toLocaleString()).padStart(16, ' ')}`);
    if (totalSavings > 0) {
      receiptLines.push(`Festival Save (${savingsPercent}%): ${('-Rs.' + totalSavings.toLocaleString()).padStart(15, ' ')}`);
    }
    receiptLines.push(`Delivery / Freight:   ${(deliveryFee === 0 ? 'FREE' : 'Rs.' + deliveryFee).padStart(16, ' ')}`);
    receiptLines.push('--------------------------------------');
    receiptLines.push(`NET TOTAL PAYABLE:    ${('Rs.' + grandTotal.toLocaleString()).padStart(16, ' ')}`);
    receiptLines.push('======================================');
    receiptLines.push('```');

    lines.push(...receiptLines);

    if (orderId && origin) {
      lines.push('');
      lines.push(`*Order Details & Tax Invoice:*`);
      lines.push(`${origin}/order-success/${orderId}`);
      lines.push(`*Track Order Live:*`);
      lines.push(`${origin}/track-order?q=${orderId}`);
    }

    lines.push('');
    lines.push(`Please confirm this order to begin factory packing. Thank you!`);

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
        updateStoreSettings,
        refreshSettings,
        generateWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
