import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const activeUserIdRef = useRef(null);

  // Compute active storage key based on currently logged in user identity
  const currentUserId = user?.id || user?._id || null;
  const storageKey = currentUserId ? `cart_${currentUserId}` : 'cart_guest';

  // Load / Switch cart whenever authenticated user changes
  useEffect(() => {
    activeUserIdRef.current = currentUserId;
    setIsInitialized(false);

    // 1. Load local cache for this specific user
    const savedCart = localStorage.getItem(storageKey);
    let initialItems = [];
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          initialItems = parsed.filter(item => item && item.crop && (item.crop._id || item.crop.id) && item.quantity > 0);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(storageKey);
      }
    }

    setCartItems(initialItems);
    setIsInitialized(true);

    // 2. If authenticated, attempt to fetch / sync server cart
    if (isAuthenticated && currentUserId) {
      cartAPI.getCart()
        .then(response => {
          // Verify user hasn't switched during async network request
          if (activeUserIdRef.current === currentUserId && response?.items && Array.isArray(response.items)) {
            const serverItems = response.items.filter(item => item && item.crop && (item.crop._id || item.crop.id) && item.quantity > 0);
            if (serverItems.length > 0) {
              setCartItems(serverItems);
              localStorage.setItem(storageKey, JSON.stringify(serverItems));
            } else if (initialItems.length > 0) {
              // Sync local items to server
              cartAPI.syncCart(initialItems).catch(() => {});
            }
          }
        })
        .catch(() => {
          // Network errors are gracefully handled using local storage cache
        });
    }
  }, [currentUserId, isAuthenticated, storageKey]);

  // Persist cart to localStorage & backend whenever cartItems change
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem(storageKey, JSON.stringify(cartItems));

    if (isAuthenticated && currentUserId) {
      const timer = setTimeout(() => {
        cartAPI.syncCart(cartItems).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, isInitialized, storageKey, isAuthenticated, currentUserId]);

  const addToCart = (crop, quantity = 1) => {
    if (!crop || (!crop._id && !crop.id)) return;
    const cropId = crop._id || crop.id;
    const addQty = Math.max(1, Number(quantity) || 1);

    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => (item.crop?._id || item.crop?.id) === cropId);
      
      if (existingIndex > -1) {
        const newQuantity = prevItems[existingIndex].quantity + addQty;
        const maxVal = crop.quantity?.value;
        if (maxVal && newQuantity > maxVal) {
          toast.error(`Only ${maxVal} ${crop.quantity?.unit || 'units'} available`);
          return prevItems;
        }
        
        toast.success('Cart updated!');
        const updated = [...prevItems];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQuantity };
        return updated;
      } else {
        const maxVal = crop.quantity?.value;
        if (maxVal && addQty > maxVal) {
          toast.error(`Only ${maxVal} ${crop.quantity?.unit || 'units'} available`);
          return prevItems;
        }
        
        toast.success('Added to cart!');
        return [...prevItems, { crop, quantity: addQty }];
      }
    });
  };

  const removeFromCart = (cropId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => (item.crop?._id || item.crop?.id) !== cropId);
      toast.success('Removed from cart!');
      return updatedItems;
    });
  };

  const updateQuantity = (cropId, quantity) => {
    const numQty = Number(quantity);
    if (numQty <= 0) {
      removeFromCart(cropId);
      return;
    }

    setCartItems(prevItems => {
      return prevItems.map(item => {
        const id = item.crop?._id || item.crop?.id;
        if (id === cropId) {
          const maxVal = item.crop.quantity?.value;
          if (maxVal && numQty > maxVal) {
            toast.error(`Only ${maxVal} ${item.crop.quantity?.unit || 'units'} available`);
            return item;
          }
          return { ...item, quantity: numQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(storageKey);
    if (isAuthenticated) {
      cartAPI.clearCart().catch(() => {});
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item?.crop?.price?.perUnit) || 0;
      const qty = Number(item?.quantity) || 0;
      return total + (price * qty);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
  };

  /**
   * Group cart items by farmer
   * Returns: Array of { farmerId, farmer, farmerName, items: [ { crop, quantity } ] }
   */
  const getCartItemsByFarmer = () => {
    const farmersMap = new Map();
    
    cartItems.forEach(item => {
      if (!item || !item.crop) return;
      const farmerObj = typeof item.crop.farmer === 'object' && item.crop.farmer !== null ? item.crop.farmer : null;
      const farmerId = farmerObj?._id || farmerObj?.id || (typeof item.crop.farmer === 'string' ? item.crop.farmer : 'unknown');
      const farmerName = farmerObj?.name || 'Verified Farmer';

      if (!farmersMap.has(farmerId)) {
        farmersMap.set(farmerId, {
          farmerId,
          farmer: farmerObj || { id: farmerId, _id: farmerId, name: farmerName },
          farmerName,
          items: []
        });
      }
      farmersMap.get(farmerId).items.push(item);
    });
    
    return Array.from(farmersMap.values());
  };

  const canAddToCart = (crop) => {
    if (!crop || !crop.quantity) return false;
    const cropId = crop._id || crop.id;
    const existingItem = cartItems.find(item => (item.crop?._id || item.crop?.id) === cropId);
    if (existingItem) {
      return existingItem.quantity < (Number(crop.quantity.value) || 0);
    }
    return (Number(crop.quantity.value) || 0) > 0;
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
