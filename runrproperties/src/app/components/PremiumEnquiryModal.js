"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { contactOwner } from "../services/api";
import MobileInput from "./MobileInput";
import styles from "./PremiumEnquiryModal.module.css";

function maskPhone(phone) {
  if (!phone || phone.length < 4) return "•••••••••••";
  return "•".repeat(phone.length - 2) + phone.slice(-2);
}

export default function PremiumEnquiryModal({ property, onClose }) {
  const { user } = useAuth();
  const owner = property.owner || {};
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.mobile || "",
    message: `Hi, I am interested in "${property.title}". Please share more details.`,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.message) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    const res = await contactOwner({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location || "",
      propertyCity: property.city || "",
      propertyType: property.type || "",
      ownerId: property.ownerId || owner?.id || "owner",
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });
    setLoading(false);
    if (res.success) {
      setSuccess("Enquiry sent successfully! The owner will contact you soon.");
      setTimeout(onClose, 2000);
    } else {
      setError(res.message || "Something went wrong. Please try again.");
    }
  };

  if (!mounted) return null;

  const ownerInitial = owner.name ? owner.name.charAt(0).toUpperCase() : "O";

  return createPortal(
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Left Panel — Owner Details */}
        <div className={styles.leftPanel}>
          <div className={styles.ownerAvatar} style={{ background: owner.profilePhoto ? "transparent" : (owner.avatarColor || "#2980b9") }}>
            {owner.profilePhoto ? (
              <img src={owner.profilePhoto} alt={owner.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              ownerInitial
            )}
          </div>
          <h3 className={styles.ownerName}>{owner.name || "Property Owner"}</h3>
          <span className={styles.ownerLabel}>Property Owner</span>

          <div className={styles.ownerContact}>
            {owner.email && (
              <div className={styles.contactItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
                <span>{owner.email}</span>
              </div>
            )}
            <div className={styles.contactItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <span>{maskPhone(owner.mobile || owner.phone || "")}</span>
            </div>

            <div className={styles.revealHint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>Pay ₹100 to reveal full number</span>
            </div>
          </div>

          <div className={styles.propertyInfo}>
            <p className={styles.propertyTitle}>{property.title}</p>
            <p className={styles.propertyCity}>
              {property.location}{property.city ? `, ${property.city}` : ""}
            </p>
          </div>
        </div>

        {/* Right Panel — Enquiry Form */}
        <div className={styles.rightPanel}>
          <h3 className={styles.formTitle}>Send Enquiry</h3>
          <p className={styles.formSubtitle}>Fill in your details and the owner will get back to you</p>

          {success ? (
            <div className={styles.successMsg}>{success}</div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              {error && <div className={styles.errorMsg}>{error}</div>}

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Your Name *</label>
                <input
                  className={styles.input}
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone *</label>
                <MobileInput
                  className={styles.input}
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={(val) => setForm((p) => ({ ...p, phone: val }))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Message *</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
