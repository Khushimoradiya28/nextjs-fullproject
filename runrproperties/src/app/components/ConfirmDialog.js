"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmText = "Yes, Remove", cancelText = "Keep It" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onCancel} />
      <div className={styles.dialog}>
        <div className={styles.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#fff0f0" stroke="#ef4444" strokeWidth="1.5"/>
            <path d="M12 7v5M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className={styles.title}>{title || "Remove Property?"}</h3>
        <p className={styles.message}>{message || "Are you sure you want to remove this property from your wishlist?"}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>{cancelText}</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </>,
    document.body
  );
}
