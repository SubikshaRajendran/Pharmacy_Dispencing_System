import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('mediheal_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [attachedPrescription, setAttachedPrescription] = useState(null);

  useEffect(() => {
    localStorage.setItem('mediheal_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item._id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAttachedPrescription(null);
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemCount,
        subtotal,
        attachedPrescription,
        setAttachedPrescription
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
