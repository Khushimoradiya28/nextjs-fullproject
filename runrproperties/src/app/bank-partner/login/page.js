"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        const userData = data.data?.user || data.user;
        if (userData?.role !== "bank_partner") {
          setError("This login is only for bank partners.");
          setLoading(false);
          return;
        }
        if (data.token || data.data?.token) {
          localStorage.setItem("runr_token", data.token || data.data.token);
        }
        router.push("/bank-partner/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <>
      {registered && (
        <div className={styles.successAlert}>
          Registration successful! Your account is under review. Our team will verify and approve it within 24-48 hours. You'll be able to login once approved.
        </div>
      )}

      {error && (
        <div className={`text-sm px-3 py-2 rounded-md ${
          error.toLowerCase().includes('pending')
            ? 'bg-orange-50 text-orange-700 border border-orange-200'
            : error.toLowerCase().includes('rejected')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {error.toLowerCase().includes('pending') && '\u23F3 '}
          {error.toLowerCase().includes('rejected') && '\u274C '}
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input type="email" placeholder="your@bank.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Password</label>
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}

export default function BankPartnerLogin() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src="/logo/runr-logo-new.svg" alt="Runr" className={styles.logo} />
        <h1 className={styles.title}>Bank Partner Login</h1>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className={styles.registerLink}>
          New partner? <Link href="/bank-partner/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
