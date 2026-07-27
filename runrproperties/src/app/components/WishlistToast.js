"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./WishlistToast.module.css";

let toastListener = null;

export function showWishlistToast(message, type) {
  if (toastListener) {
    toastListener({ message, type });
  }
}

export default function WishlistToast() {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  const handleToast = useCallback(({ message, type }) => {
    setToast({ message, type });
    setVisible(true);
  }, []);

  useEffect(() => {
    toastListener = handleToast;
    return () => {
      toastListener = null;
    };
  }, [handleToast]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, toast]);

  if (!toast || !visible) return null;

  return (
    <div className={`${styles.toast} ${toast.type === "added" ? styles.toastAdded : styles.toastRemoved}`}>
      <span className={styles.toastIcon}>
        {toast.type === "added" ? (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e0245e" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={styles.toastText}>{toast.message}</span>
    </div>
  );
}
