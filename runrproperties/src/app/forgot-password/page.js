"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../login/auth.module.css";

export default function ForgotPasswordPage() {
  const { forgotPass } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const result = await forgotPass({ email });
    setLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.message || "Something went wrong");
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.authCard}>
          {!sent ? (
            <>
              <div className={styles.authHeader}>
                <h1 className={styles.authTitle}>Forgot Password</h1>
                <p className={styles.authSubtitle}>Enter your email to receive a password reset link</p>
              </div>

              <form className={styles.authForm} onSubmit={handleSubmit}>
                {error && <div className={styles.errorMsg}>{error}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="forgot-email">Email</label>
                  <input id="forgot-email" type="email" className={styles.formInput} value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@email.com" />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                </button>
              </form>

              <p className={styles.switchText}>
                Remember your password? <Link href="/login" className={styles.switchLink}>Sign In</Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: "1.3rem", color: "#10203b" }}>Check Your Email</h2>
              <p style={{ margin: "0 0 8px", color: "#475569", fontSize: "0.92rem", lineHeight: "1.6" }}>
                A password reset link has been sent to
              </p>
              <p style={{ margin: "0 0 20px", color: "#1e3a5f", fontWeight: 700, fontSize: "0.95rem" }}>
                {email}
              </p>
              <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.82rem", lineHeight: "1.5" }}>
                Please check your inbox (and Spam folder if needed). The link expires in 10 minutes.
              </p>
              <Link href="/login" className={styles.submitBtn} style={{ display: "inline-block", padding: "12px 32px", textDecoration: "none" }}>
                <span>Back to Login</span>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
