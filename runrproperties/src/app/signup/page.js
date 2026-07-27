"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import MobileInput from "../components/MobileInput";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../login/auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirmPassword: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.mobile || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    const result = await signup({
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      role: form.role,
    });
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
            <h1 className={styles.authTitle}>Create Account</h1>
            <p className={styles.authSubtitle}>Join Runr Properties to find your dream property</p>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit}>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-name">Full Name</label>
              <input id="signup-name" name="name" className={styles.formInput} value={form.name} onChange={handleChange} placeholder="Your full name" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-email">Email</label>
              <input id="signup-email" name="email" type="email" className={styles.formInput} value={form.email} onChange={handleChange} placeholder="you@email.com" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-mobile">Mobile Number</label>
              <MobileInput id="signup-mobile" name="mobile" className={styles.formInput} value={form.mobile} onChange={(val) => { setForm((p) => ({ ...p, mobile: val })); setError(""); }} placeholder="10-digit number" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="signup-password">Password</label>
                <PasswordInput id="signup-password" name="password" className={styles.formInput} value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="signup-confirm">Confirm Password</label>
                <PasswordInput id="signup-confirm" name="confirmPassword" className={styles.formInput} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
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
