import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { trackAddToCart } from '../utils/analytics';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('agrishield_cart');
    const parsed = savedCart ? JSON.parse(savedCart) : [];
    // Preserve all catalog items and cart items
    return parsed.filter(item => item && item.id);
  });

  useEffect(() => {
    localStorage.setItem('agrishield_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    trackAddToCart(product, qty);
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.packageSize === product.packageSize
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += qty;
        return newItems;
      } else {
        return [...prevItems, { ...product, quantity: qty }];
      }
    });
  };

  const removeFromCart = (productId, packageSize) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === productId && item.packageSize === packageSize))
    );
  };

  const updateQuantity = (productId, packageSize, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.id === productId && item.packageSize === packageSize)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const parsePrice = (priceStr) => {
    if (priceStr === undefined || priceStr === null) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const numericStr = String(priceStr).replace(/[^0-9.]/g, '');
    return parseFloat(numericStr) || 0;
  };

  const cartSubtotal = cartItems.reduce((total, item) => {
    return total + (parsePrice(item.price) * (item.quantity || 1));
  }, 0);

  const cartTotal = cartSubtotal;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
