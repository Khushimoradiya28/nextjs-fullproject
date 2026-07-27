"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await login(form);
    setLoading(false);

    if (result.success) {
      router.push("/profile");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSubtitle}>Sign in to your Runr Properties account</p>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit}>
            
            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="login-email">Email</label>
              <input id="login-email" name="email" type="email" className={styles.formInput} value={form.email} onChange={handleChange} placeholder="you@email.com" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="login-password">Password</label>
              <PasswordInput id="login-password" name="password" className={styles.formInput} value={form.password} onChange={handleChange} placeholder="Enter password" />
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
