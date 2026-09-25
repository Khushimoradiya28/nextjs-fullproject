"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./register.module.css";

function PasswordField({ label, placeholder, value, onChange, error, name, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.passWrap}>
        <input
          type={show ? "text" : "password"}
          name={name || "register_password"}
          id={id || "register_password"}
          autoComplete="new-password"
          data-lpignore="true"
          data-form-type="other"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? styles.inputError : ""}
        />
        <button type="button" className={styles.eyeBtn} onClick={() => setShow(!show)} tabIndex={-1}>
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
          )}
        </button>
      </div>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  );
}

export default function BankPartnerRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", bankName: "", email: "", mobile: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        return "";
      case "bankName":
        if (!value.trim()) return "Bank name is required";
        if (value.trim().length < 2) return "Bank name too short";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Please enter a valid email";
        return "";
      case "mobile":
        if (!value.trim()) return "Mobile number is required";
        if (!/^[6-9]\d{9}$/.test(value)) return "Enter a valid 10-digit mobile number starting with 6-9";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter";
        if (!/[0-9]/.test(value)) return "Include at least one number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== form.password) return "Passwords do not match";
        return "";
      default: return "";
    }
  };

  const handleChange = (name, value) => {
    let sanitizedValue = value;
    if (name === "mobile") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    setForm(prev => ({ ...prev, [name]: sanitizedValue }));
    setError("");
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, sanitizedValue) }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, form[name]) }));
  };

  const validateAll = () => {
    const newErrors = {};
    let valid = true;
    ["name", "bankName", "email", "mobile", "password", "confirmPassword"].forEach(f => {
      const err = validateField(f, form[f]);
      if (err) {
        newErrors[f] = err;
        valid = false;
      }
    });
    setErrors(newErrors);
    setTouched({
      name: true, bankName: true, email: true, mobile: true, password: true, confirmPassword: true,
    });
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/bank-partners/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bankName: form.bankName,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        }),
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
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <img src="/logo/runr-logo-new.svg" alt="runr properties" className={styles.logo} />
            <h1 className={styles.title}>Bank Partner Registration</h1>
            <p className={styles.subtitle}>Join runr properties as a banking partner</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="partner_contact_person_name"
                  autoComplete="off"
                  data-lpignore="true"
                  placeholder="Contact person name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={errors.name ? styles.inputError : ""}
                />
                {errors.name && <span className={styles.err}>{errors.name}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Bank Name *</label>
                <input
                  type="text"
                  name="partner_institution_name"
                  autoComplete="off"
                  data-lpignore="true"
                  placeholder="e.g. SBI Bank"
                  value={form.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  onBlur={() => handleBlur("bankName")}
                  className={errors.bankName ? styles.inputError : ""}
                />
                {errors.bankName && <span className={styles.err}>{errors.bankName}</span>}
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="partner_registration_email"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="your@bank.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={errors.email ? styles.inputError : ""}
                />
                {errors.email && <span className={styles.err}>{errors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Mobile *</label>
                <input
                  type="tel"
                  name="partner_contact_mobile"
                  autoComplete="off"
                  data-lpignore="true"
                  placeholder="10-digit number"
                  value={form.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  onBlur={() => handleBlur("mobile")}
                  className={errors.mobile ? styles.inputError : ""}
                  maxLength={10}
                />
                {errors.mobile && <span className={styles.err}>{errors.mobile}</span>}
              </div>
            </div>
            <div className={styles.formRow}>
              <PasswordField
                label="Password *"
                placeholder="Min 6 characters"
                name="partner_reg_password"
                id="partner_reg_password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={errors.password}
              />
              <PasswordField
                label="Confirm Password *"
                placeholder="Re-enter password"
                name="partner_reg_confirm_password"
                id="partner_reg_confirm_password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </form>

          <div className={styles.pendingNote}>
            After registration, your account will be reviewed and approved by our team within 24-48 hours before you can login.
          </div>

          <p className={styles.loginLink}>
            Already have an account? <Link href="/bank-partner/login">Login here</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
