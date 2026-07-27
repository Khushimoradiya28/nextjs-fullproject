"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { showWishlistToast } from "../components/WishlistToast";
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI, clearWishlistAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Reload wishlist whenever the logged-in user changes
  useEffect(() => {
    // If no user, clear wishlist state
    if (!user) {
      setWishlist([]);
      setLoaded(true);
      return;
    }

    // Fetch this user's wishlist from backend
    let cancelled = false;
    async function loadWishlist() {
      setLoaded(false);
      const res = await getWishlist();
      if (cancelled) return;

      let items = [];
      if (res.success && res.wishlist) {
        items = res.wishlist;
      } else if (res.success && res.data) {
        items = res.data;
      }
      // Remove duplicates by id
      const seen = new Set();
      setWishlist(items.filter((item) => {
        if (!item.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }));
      setLoaded(true);
    }
    loadWishlist();

    return () => { cancelled = true; };
  }, [user?._id]);

  const addToWishlist = useCallback(async (property) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === property.id)) return prev;
      return [...prev, property];
    });
    await addToWishlistAPI(property);
    setTimeout(() => showWishlistToast("Added to Wishlist", "added"), 0);
  }, []);

  const removeFromWishlist = useCallback(async (propertyId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== propertyId));
    await removeFromWishlistAPI(propertyId);
    setTimeout(() => showWishlistToast("Removed from Wishlist", "removed"), 0);
  }, []);

  const isInWishlist = useCallback(
    (propertyId) => wishlist.some((item) => item.id === propertyId),
    [wishlist]
  );

  const toggleWishlist = useCallback(async (property) => {
    const exists = wishlist.some((item) => item.id === property.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== property.id));
      await removeFromWishlistAPI(property.id);
      setTimeout(() => showWishlistToast("Removed from Wishlist", "removed"), 0);
    } else {
      setWishlist((prev) => {
        if (prev.some((item) => item.id === property.id)) return prev;
        return [...prev, property];
      });
      await addToWishlistAPI(property);
      setTimeout(() => showWishlistToast("Added to Wishlist", "added"), 0);
    }
  }, [wishlist]);

  const clearWishlist = useCallback(async () => {
    setWishlist([]);
    await clearWishlistAPI();
    setTimeout(() => showWishlistToast("Wishlist cleared", "removed"), 0);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loaded,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
