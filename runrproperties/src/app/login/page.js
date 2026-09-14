"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import { validateEmail, validateRequired } from "../utils/validation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./auth.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    if (touched[name]) validateField(name, value);
  };

  const validateField = (name, value) => {
    let result;
    if (name === "email") result = validateEmail(value);
    else result = validateRequired(value, "Password");
    setErrors(prev => ({ ...prev, [name]: result.valid ? "" : result.message }));
    return result.valid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const emailResult = validateEmail(form.email);
    const passResult = validateRequired(form.password, "Password");
    const newErrors = {};
    if (!emailResult.valid) newErrors.email = emailResult.message;
    if (!passResult.valid) newErrors.password = passResult.message;
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const result = await login(form);
    setLoading(false);

    if (result.success) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        const role = result.user?.role || result.role;
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "bank_partner") {
          router.push("/bank-partner/dashboard");
        } else {
          router.push("/profile");
        }
      }
    } else {
      setApiError(result.message?.toLowerCase().includes("pending") 
        ? "⏳ Your account is under review. Our team will verify and approve your bank partner account within 24-48 hours. You'll receive access once approved."
        : result.message);
    }
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
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSubtitle}>Sign in to your Runr Properties account</p>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            {apiError && <div className={styles.errorMsg}>{apiError}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="login-email">Email <span style={{color:"#dc2626"}}>*</span></label>
              <input id="login-email" name="email" type="email" className={fieldStyle("email")} value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@email.com" />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="login-password">Password <span style={{color:"#dc2626"}}>*</span></label>
              <PasswordInput id="login-password" name="password" className={fieldStyle("password")} value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Enter password" />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>

            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          <p className={styles.switchText}>
            Don&apos;t have an account? <Link href="/signup" className={styles.switchLink}>Create Account</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
