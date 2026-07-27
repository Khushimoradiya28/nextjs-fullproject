"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { contactOwner } from "../services/api";
import MobileInput from "./MobileInput";
import styles from "./EnquiryModal.module.css";

export default function EnquiryModal({ property, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.mobile || "",
    message: `Hi, I am interested in "${property.title}". Please share more details.`,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      ownerId: property.ownerId || "owner",
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });
    setLoading(false);
    if (res.success) {
      setSuccess("Enquiry sent successfully!");
      setTimeout(onClose, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Enquire About This Property</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p className={styles.propertyName}>{property.title}</p>

        {success ? (
          <div className={styles.successMsg}>{success}</div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMsg}>{error}</div>}
            <input className={styles.input} placeholder="Your Name *" value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} />
            <input className={styles.input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} />
            <MobileInput className={styles.input} placeholder="Phone *" value={form.phone} onChange={(val) => setForm(p => ({...p, phone: val}))} />
            <textarea className={styles.textarea} placeholder="Message *" value={form.message} onChange={(e) => setForm(p => ({...p, message: e.target.value}))} />
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Sending..." : "Send Enquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
