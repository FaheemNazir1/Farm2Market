import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever cartItems change
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (crop, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.crop._id === crop._id);
      
      if (existingItem) {
        // Check if adding more would exceed available quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > crop.quantity.value) {
          toast.error(`Only ${crop.quantity.value} ${crop.quantity.unit} available`);
          return prevItems;
        }
        
        toast.success('Cart updated!');
        return prevItems.map(item =>
          item.crop._id === crop._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Check if quantity doesn't exceed available
        if (quantity > crop.quantity.value) {
          toast.error(`Only ${crop.quantity.value} ${crop.quantity.unit} available`);
          return prevItems;
        }
        
        toast.success('Added to cart!');
        return [...prevItems, { crop, quantity }];
      }
    });
  };

  const removeFromCart = (cropId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.crop._id !== cropId);
      toast.success('Removed from cart!');
      return updatedItems;
    });
  };

  const updateQuantity = (cropId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cropId);
      return;
    }

    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.crop._id === cropId) {
          // Check if new quantity exceeds available
          if (quantity > item.crop.quantity.value) {
            toast.error(`Only ${item.crop.quantity.value} ${item.crop.quantity.unit} available`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared!');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.crop.price.perUnit * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItemsByFarmer = () => {
    const farmersMap = new Map();
    
    cartItems.forEach(item => {
      const farmerId = item.crop.farmer._id || item.crop.farmer;
      if (!farmersMap.has(farmerId)) {
        farmersMap.set(farmerId, {
          farmer: item.crop.farmer,
          items: []
        });
      }
      farmersMap.get(farmerId).items.push(item);
    });
    
    return Array.from(farmersMap.values());
  };

  const canAddToCart = (crop) => {
    const existingItem = cartItems.find(item => item.crop._id === crop._id);
    if (existingItem) {
      return existingItem.quantity < crop.quantity.value;
    }
    return crop.quantity.value > 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartItemsByFarmer,
    canAddToCart,
    isCartEmpty: cartItems.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
