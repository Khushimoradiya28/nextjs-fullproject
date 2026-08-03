"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";

export default function BankPartnerRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", mobile: "",
    bankName: "", interestRate: "", tagline: "", description: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Contact person name required";
    if (!form.email.trim()) errs.email = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.password || form.password.length < 6) errs.password = "Min 6 characters";
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) errs.mobile = "Valid 10-digit number required";
    if (!form.bankName.trim()) errs.bankName = "Bank name required";
    if (!form.interestRate.trim()) errs.interestRate = "Interest rate required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/bank-partners/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok && res.status === 404) {
        setError("API endpoint not found. Please check backend configuration.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        router.push("/bank-partner/login?registered=true");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img src="/logo/runr-logo-new.svg" alt="Runr" className={styles.logo} />
          <h1 className={styles.title}>Bank Partner Registration</h1>
          <p className={styles.subtitle}>Join Runr Properties as a banking partner</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.sectionLabel}>Contact Person Details</div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input type="text" placeholder="Contact person name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              {errors.name && <span className={styles.err}>{errors.name}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Mobile *</label>
              <input type="tel" placeholder="10-digit number" value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} />
              {errors.mobile && <span className={styles.err}>{errors.mobile}</span>}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input type="email" placeholder="your@bank.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              {errors.email && <span className={styles.err}>{errors.email}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Password *</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              {errors.password && <span className={styles.err}>{errors.password}</span>}
            </div>
          </div>

          <div className={styles.sectionLabel}>Bank Details</div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Bank Name *</label>
              <input type="text" placeholder="e.g. HDFC Bank" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} />
              {errors.bankName && <span className={styles.err}>{errors.bankName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Interest Rate *</label>
              <input type="text" placeholder="e.g. 8.50%" value={form.interestRate} onChange={(e) => setForm({...form, interestRate: e.target.value})} />
              {errors.interestRate && <span className={styles.err}>{errors.interestRate}</span>}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Tagline</label>
            <input type="text" placeholder="e.g. We understand your world" value={form.tagline} onChange={(e) => setForm({...form, tagline: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea placeholder="Brief description about your bank's home loan offerings..." rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        <div className={styles.pendingNote}>
          After registration, your account will be reviewed and approved by our team before you can login.
        </div>

        <p className={styles.loginLink}>
          Already have an account? <Link href="/bank-partner/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
