"use client";

import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ title, message, confirmText, cancelText, onConfirm, onCancel, loading }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>{cancelText || "Cancel"}</button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : (confirmText || "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
