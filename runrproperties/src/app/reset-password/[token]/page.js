"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../../services/api";
import PasswordInput from "../../components/PasswordInput";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../login/auth.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token || "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); router.push("/login"); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [success, router]);

  const validate = () => {
    const e = {};
    if (!form.newPassword) e.newPassword = "Password is required";
    else if (form.newPassword.length < 6) e.newPassword = "Minimum 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    if (!token) { setApiError("Invalid or missing reset token"); return; }

    setLoading(true);
    const result = await resetPassword({ token, newPassword: form.newPassword });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setApiError(result.message || "Reset failed. Token may be expired.");
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.authCard}>
          {!success ? (
            <>
              <div className={styles.authHeader}>
                <h1 className={styles.authTitle}>Reset Password</h1>
                <p className={styles.authSubtitle}>Create a new password for your account</p>
              </div>

              <form className={styles.authForm} onSubmit={handleSubmit}>
                {apiError && <div className={styles.errorMsg}>{apiError}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="reset-password">New Password</label>
                  <PasswordInput id="reset-password" className={styles.formInput} value={form.newPassword} onChange={(e) => { setForm((p) => ({ ...p, newPassword: e.target.value })); setErrors((p) => ({ ...p, newPassword: "" })); }} placeholder="Min 6 characters" />
                  {errors.newPassword && <span style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "4px" }}>{errors.newPassword}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="reset-confirm">Confirm Password</label>
                  <PasswordInput id="reset-confirm" className={styles.formInput} value={form.confirmPassword} onChange={(e) => { setForm((p) => ({ ...p, confirmPassword: e.target.value })); setErrors((p) => ({ ...p, confirmPassword: "" })); }} placeholder="Re-enter password" />
                  {errors.confirmPassword && <span style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "4px" }}>{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  <span>{loading ? "Resetting..." : "Reset Password"}</span>
                </button>
              </form>

              <p className={styles.switchText}>
                Remember your password? <Link href="/login" className={styles.switchLink}>Sign In</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "grid", placeItems: "center", margin: "0 auto 20px", animation: "pulse 1.5s infinite" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: "1.3rem", color: "#10203b" }}>Password Updated!</h2>
              <p style={{ margin: "0 0 20px", color: "#475569", fontSize: "0.9rem", lineHeight: "1.6" }}>
                Your password has been reset successfully.<br />
                Redirecting to Login in <strong style={{ color: "#3fa66b" }}>{countdown}s</strong>...
              </p>
              <Link href="/login" style={{ color: "#3fa66b", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}>
                Go to Login now →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
