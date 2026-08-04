"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import MobileInput from "../components/MobileInput";
import { validateName, validateEmail, validateMobile, validatePassword, validateConfirmPassword } from "../utils/validation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../login/auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirmPassword: "", role: "buyer" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    setSuccessMsg("");
    if (touched[name]) validateField(name, value);
  };

  const validateField = (name, value) => {
    let result = { valid: true, message: "" };
    switch (name) {
      case "name": result = validateName(value); break;
      case "email": result = validateEmail(value); break;
      case "mobile": result = validateMobile(value); break;
      case "password": result = validatePassword(value); break;
      case "confirmPassword": result = validateConfirmPassword(form.password, value); break;
    }
    setErrors(prev => ({ ...prev, [name]: result.valid ? "" : result.message }));
    return result.valid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateAll = () => {
    const r = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      mobile: validateMobile(form.mobile),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    const newErrors = {};
    let allValid = true;
    Object.entries(r).forEach(([key, val]) => {
      if (!val.valid) { newErrors[key] = val.message; allValid = false; }
    });
    setErrors(newErrors);
    setTouched({ name: true, email: true, mobile: true, password: true, confirmPassword: true });
    return allValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    if (!validateAll()) return;

    setLoading(true);

    if (form.role === "bank_partner") {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${API_BASE}/bank-partners/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, bankName: form.name, email: form.email, mobile: form.mobile, password: form.password }),
        });
        const data = await res.json();
        if (data.success || res.ok) {
          setSuccessMsg("🎉 Registration Successful!\n\nYour bank partner account has been submitted for review. Our team will verify your details and approve your account within 24-48 hours.\n\nOnce approved, you can login at Bank Partner Login and start receiving home loan leads from our platform.");
        } else {
          const msg = data.message || "Registration failed. Please try again.";
          const msgLower = msg.toLowerCase();
          if (msgLower.includes("name")) { setErrors(prev => ({...prev, name: msg})); }
          else if (msgLower.includes("email")) { setErrors(prev => ({...prev, email: msg})); }
          else if (msgLower.includes("mobile") || msgLower.includes("phone")) { setErrors(prev => ({...prev, mobile: msg})); }
          else if (msgLower.includes("password")) { setErrors(prev => ({...prev, password: msg})); }
          else { setApiError(msg); }
        }
      } catch (err) {
        setApiError("Something went wrong. Please try again.");
      }
    } else {
      const result = await signup({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role: form.role,
      });
      if (result.success) {
        router.push("/profile");
      } else {
        const msg = result.message || "Registration failed.";
        const msgLower = msg.toLowerCase();
        if (msgLower.includes("name")) { setErrors(prev => ({...prev, name: msg})); }
        else if (msgLower.includes("email")) { setErrors(prev => ({...prev, email: msg})); }
        else if (msgLower.includes("mobile") || msgLower.includes("phone")) { setErrors(prev => ({...prev, mobile: msg})); }
        else if (msgLower.includes("password")) { setErrors(prev => ({...prev, password: msg})); }
        else { setApiError(msg); }
      }
    }

    setLoading(false);
  };

  const fieldStyle = (name) => errors[name] ? `${styles.formInput} ${styles.inputError}` : styles.formInput;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.authCard}>
          <div className={styles.cardLogo}>
            <img src="/logo/runr-logo-new.svg" alt="Runr Properties" />
          </div>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Create Account</h1>
            <p className={styles.authSubtitle}>Join Runr Properties to find your dream property</p>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            {apiError && <div className={styles.errorMsg}>{apiError}</div>}
            {successMsg && <div style={{padding:"12px 16px",borderRadius:"8px",background:"#eff6ff",border:"1px solid #bfdbfe",color:"#1d4ed8",fontSize:"13px",lineHeight:"1.5",marginBottom:"16px"}}>{successMsg}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-name">{form.role === "bank_partner" ? "Bank Name" : "Full Name"} <span style={{color:"#dc2626"}}>*</span></label>
              <input id="signup-name" name="name" className={fieldStyle("name")} value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder={form.role === "bank_partner" ? "Your bank/company name" : "Your full name"} />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-email">Email <span style={{color:"#dc2626"}}>*</span></label>
              <input id="signup-email" name="email" type="email" className={fieldStyle("email")} value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@email.com" />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-mobile">Mobile Number <span style={{color:"#dc2626"}}>*</span></label>
              <MobileInput id="signup-mobile" name="mobile" className={fieldStyle("mobile")} value={form.mobile} onChange={(val) => { setForm((p) => ({ ...p, mobile: val })); setApiError(""); if (touched.mobile) { const r = validateMobile(val); setErrors(prev => ({...prev, mobile: r.valid ? "" : r.message})); } }} placeholder="10-digit number" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="signup-password">Password <span style={{color:"#dc2626"}}>*</span></label>
                <PasswordInput id="signup-password" name="password" className={fieldStyle("password")} value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Min 8 characters" />
                {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="signup-confirm">Confirm Password <span style={{color:"#dc2626"}}>*</span></label>
                <PasswordInput id="signup-confirm" name="confirmPassword" className={fieldStyle("confirmPassword")} value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Re-enter password" />
                {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>I am a</label>
              <div className={styles.roleSelect}>
                <button type="button" className={`${styles.roleBtn} ${form.role === "buyer" ? styles.roleBtnActive : ""}`} onClick={() => setForm((p) => ({ ...p, role: "buyer" }))}>
                  <span className={styles.roleIcon}>🏠</span>
                  <span className={styles.roleText}>Buyer</span>
                  <span className={styles.roleDesc}>Looking to buy/rent</span>
                </button>
                <button type="button" className={`${styles.roleBtn} ${form.role === "owner" ? styles.roleBtnActive : ""}`} onClick={() => setForm((p) => ({ ...p, role: "owner" }))}>
                  <span className={styles.roleIcon}>🔑</span>
                  <span className={styles.roleText}>Owner</span>
                  <span className={styles.roleDesc}>List my properties</span>
                </button>
                <button type="button" className={`${styles.roleBtn} ${form.role === "bank_partner" ? styles.roleBtnActive : ""}`} onClick={() => router.push("/bank-partner/register")}>
                  <span className={styles.roleIcon}>🏦</span>
                  <span className={styles.roleText}>Bank Partner</span>
                  <span className={styles.roleDesc}>Offer home loans</span>
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link href="/login" className={styles.switchLink}>Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
