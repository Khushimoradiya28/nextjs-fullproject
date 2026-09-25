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
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "email") {
      if (!value.trim()) {
        errorMsg = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errorMsg = "Please enter a valid email address";
      }
    } else if (name === "password") {
      if (!value) {
        errorMsg = "Password is required";
      } else if (value.length < 6) {
        errorMsg = "Password must be at least 6 characters long";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateField("email", form.email);
    const pwdErr = validateField("password", form.password);
    if (emailErr || pwdErr) {
      return;
    }
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

      {error && !(registered && error.toLowerCase().includes('pending')) && (
        <div
          className={
            error.toLowerCase().includes('pending')
              ? styles.pendingAlert
              : styles.errorAlert
          }
        >
          {error.toLowerCase().includes('pending') && '⏳ '}
          {error.toLowerCase().includes('rejected') && '❌ '}
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            placeholder="your@bank.com"
            value={form.email}
            onChange={(e) => {
              setForm({...form, email: e.target.value});
              if (errors.email) validateField("email", e.target.value);
            }}
            onBlur={(e) => validateField("email", e.target.value)}
            className={errors.email ? styles.inputError : ""}
            required
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Password</label>
          <div style={{position:"relative"}}>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => {
                setForm({...form, password: e.target.value});
                if (errors.password) validateField("password", e.target.value);
              }}
              onBlur={(e) => validateField("password", e.target.value)}
              className={errors.password ? styles.inputError : ""}
              required
              style={{paddingRight:"40px"}}
            />
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex",alignItems:"center",padding:"4px"}} tabIndex={-1}>
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
              )}
            </button>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
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
        <img src="/logo/runr-logo-new.svg" alt="runr properties" className={styles.logo} />
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
