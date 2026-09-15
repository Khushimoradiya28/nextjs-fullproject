"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./BankEnquiryModal.module.css";

export default function BankEnquiryModal({ bank, onClose, onSuccess }) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    loanAmount: "",
    message: "",
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!user) {
      onClose();
      router.push("/login?redirect=/home-loans");
    }
  }, [user]);

  if (!mounted) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.mobile.trim()) errs.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(form.mobile)) errs.mobile = "Enter valid 10-digit number";
    if (!form.loanAmount.trim()) errs.loanAmount = "Loan amount is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const token = typeof window !== "undefined" ? localStorage.getItem("runr_token") : null;
      await fetch(`${API_BASE}/bank-partners/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bankId: bank?._id,
          name: form.name,
          email: form.email,
          phone: form.mobile,
          loanAmount: form.loanAmount,
          message: form.message,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(bank);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {submitted ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h3>Enquiry Submitted!</h3>
            <p>Our team will contact you shortly regarding your home loan with {bank?.name}.</p>
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.bankInfo}>
                {bank?.image && (
                  <img
                    src={getMediaUrl(bank.image)}
                    alt={bank.name}
                    className={styles.bankLogo}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <h3 className={styles.modalTitle}>Apply for Home Loan</h3>
                  <p className={styles.bankRate}>{bank?.name} • From {bank?.rate}%</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className={errors.name ? styles.error : ""}
                />
                {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className={errors.email ? styles.error : ""}
                  />
                  {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Mobile *</label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="10-digit number"
                    className={errors.mobile ? styles.error : ""}
                  />
                  {errors.mobile && <span className={styles.errorMsg}>{errors.mobile}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Loan Amount Required *</label>
                <input
                  type="text"
                  value={form.loanAmount}
                  onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
                  placeholder="e.g. ₹ 50,00,000"
                  className={errors.loanAmount ? styles.error : ""}
                />
                {errors.loanAmount && <span className={styles.errorMsg}>{errors.loanAmount}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Message (Optional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Any specific requirements..."
                  rows={3}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Submitting..." : "Submit Enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
