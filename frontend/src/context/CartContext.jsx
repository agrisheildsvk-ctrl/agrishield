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

  const [flyingItems, setFlyingItems] = useState([]);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [cartToast, setCartToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('agrishield_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1, sourceElement = null) => {
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

    // Handle flying particle animation towards cart icon
    try {
      let startRect = null;
      if (sourceElement?.currentTarget) {
        startRect = sourceElement.currentTarget.getBoundingClientRect();
      } else if (sourceElement?.target) {
        startRect = sourceElement.target.getBoundingClientRect();
      } else if (sourceElement?.getBoundingClientRect) {
        startRect = sourceElement.getBoundingClientRect();
      } else if (sourceElement?.clientX && sourceElement?.clientY) {
        startRect = {
          left: sourceElement.clientX - 24,
          top: sourceElement.clientY - 24,
          width: 48,
          height: 48
        };
      }

      const cartBtn = document.getElementById('navbar-cart-btn') || document.querySelector('a[href="/cart"]');
      const targetRect = cartBtn ? cartBtn.getBoundingClientRect() : {
        left: window.innerWidth - 60,
        top: 20,
        width: 40,
        height: 40
      };

      if (startRect) {
        const flyId = Date.now() + Math.random();
        const newFlyItem = {
          id: flyId,
          startX: startRect.left + startRect.width / 2,
          startY: startRect.top + startRect.height / 2,
          targetX: targetRect.left + targetRect.width / 2,
          targetY: targetRect.top + targetRect.height / 2,
          image: product.image || '/agrishield-wild-boar-repellent.webp',
          name: product.name
        };

        setFlyingItems(prev => [...prev, newFlyItem]);

        // Trigger bump and toast right when particle arrives at cart icon (~1250ms)
        setTimeout(() => {
          setIsCartBumping(true);
          setTimeout(() => setIsCartBumping(false), 600);

          // Show toast right as item enters cart
          setCartToast({
            id: flyId,
            name: product.name,
            size: product.packageSize,
            price: product.price,
            image: product.image
          });
        }, 1250);

        // Remove particle after full flight
        setTimeout(() => {
          setFlyingItems(prev => prev.filter(f => f.id !== flyId));
        }, 1400);
      } else {
        setIsCartBumping(true);
        setTimeout(() => setIsCartBumping(false), 500);

        setCartToast({
          id: Date.now(),
          name: product.name,
          size: product.packageSize,
          price: product.price,
          image: product.image
        });
      }
    } catch (err) {
      console.warn('Flying cart animation notice:', err);
    }
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
    cartTotal,
    flyingItems,
    isCartBumping,
    cartToast,
    setCartToast
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
