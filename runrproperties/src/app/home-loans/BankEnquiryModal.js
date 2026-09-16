"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCurrencyRupee,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineCheck,
} from "react-icons/hi";
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
    loanAmount: bank?.loanAmount || "",
    employmentType: "Salaried",
    monthlyIncome: "",
    message: bank?.message || "",
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
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email address is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.mobile.trim()) errs.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) errs.mobile = "Enter valid 10-digit mobile number";
    if (!form.employmentType) errs.employmentType = "Employment type is required";
    if (!form.monthlyIncome.trim()) errs.monthlyIncome = "Monthly net income is required";
    if (!form.loanAmount.trim()) errs.loanAmount = "Please enter loan amount";
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
          employmentType: form.employmentType,
          monthlyIncome: form.monthlyIncome,
          propertyTitle: bank?.propertyTitle || "",
          propertyId: bank?.propertyId || "",
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
      <div className={styles.modalCard}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <HiOutlineX />
        </button>

        {submitted ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <HiOutlineCheck />
            </div>
            <h3>Enquiry Submitted!</h3>
            <p>Our loan advisor will get in touch with you shortly regarding your {bank?.name} loan.</p>
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {/* Header with Bank Badge and Gradient Accent */}
            <div className={styles.modalHeader}>
              <div className={styles.bankBrandBadge}>
                {bank?.image ? (
                  <img
                    src={bank.image}
                    alt={bank.name}
                    className={styles.bankModalLogo}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className={styles.bankAvatarInitials}>
                    {(bank?.name || "BK").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={styles.headerTextGroup}>
                  <h2 className={styles.modalMainTitle}>Apply for Home Loan</h2>
                  <div className={styles.bankTagRow}>
                    <span className={styles.bankNameLabel}>{bank?.name}</span>
                    <span className={styles.rateHighlight}>From {bank?.rate || "Competitive"}% p.a.</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label>
                  <HiOutlineUser className={styles.inputIcon} />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g. John Doe"
                  className={errors.name ? styles.error : ""}
                />
                {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
              </div>

              {/* Email & Mobile */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    <HiOutlineMail className={styles.inputIcon} />
                    <span>Email *</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="name@email.com"
                    className={errors.email ? styles.error : ""}
                  />
                  {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <HiOutlinePhone className={styles.inputIcon} />
                    <span>Mobile *</span>
                  </label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => {
                      setForm({ ...form, mobile: e.target.value });
                      if (errors.mobile) setErrors({ ...errors, mobile: "" });
                    }}
                    placeholder="10-digit number"
                    className={errors.mobile ? styles.error : ""}
                  />
                  {errors.mobile && <span className={styles.errorMsg}>{errors.mobile}</span>}
                </div>
              </div>

              {/* Employment Type & Monthly Income */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    <HiOutlineBriefcase className={styles.inputIcon} />
                    <span>Employment *</span>
                  </label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => {
                      setForm({ ...form, employmentType: e.target.value });
                      if (errors.employmentType) setErrors({ ...errors, employmentType: "" });
                    }}
                    className={errors.employmentType ? styles.error : ""}
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business Owner</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.employmentType && <span className={styles.errorMsg}>{errors.employmentType}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <HiOutlineCurrencyRupee className={styles.inputIcon} />
                    <span>Monthly Income *</span>
                  </label>
                  <input
                    type="text"
                    value={form.monthlyIncome}
                    onChange={(e) => {
                      setForm({ ...form, monthlyIncome: e.target.value });
                      if (errors.monthlyIncome) setErrors({ ...errors, monthlyIncome: "" });
                    }}
                    placeholder="e.g. ₹ 75,000"
                    className={errors.monthlyIncome ? styles.error : ""}
                  />
                  {errors.monthlyIncome && <span className={styles.errorMsg}>{errors.monthlyIncome}</span>}
                </div>
              </div>

              {/* Loan Amount Required */}
              <div className={styles.formGroup}>
                <label>
                  <HiOutlineCurrencyRupee className={styles.inputIcon} />
                  <span>Loan Amount Required *</span>
                </label>
                <input
                  type="text"
                  value={form.loanAmount}
                  onChange={(e) => {
                    setForm({ ...form, loanAmount: e.target.value });
                    if (errors.loanAmount) setErrors({ ...errors, loanAmount: "" });
                  }}
                  placeholder="e.g. ₹ 50,00,000"
                  className={errors.loanAmount ? styles.error : ""}
                />
                {errors.loanAmount && <span className={styles.errorMsg}>{errors.loanAmount}</span>}
              </div>

              {/* Message */}
              <div className={styles.formGroup}>
                <label>
                  <HiOutlineDocumentText className={styles.inputIcon} />
                  <span>Message (Optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Any specific preferences or questions..."
                  rows={2}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Submitting Application..." : "Submit Loan Enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
