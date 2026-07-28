/**
 * Shared form validation utilities.
 * Reusable across all forms in the application.
 */

// ─── Mobile ───────────────────────────────────────────────────
export function validateMobile(value) {
  if (!value || value.trim() === "") return { valid: false, message: "Mobile number is required." };
  const cleaned = value.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(cleaned)) return { valid: false, message: "Please enter a valid 10-digit Indian mobile number." };
  return { valid: true, message: "" };
}

export function sanitizeMobile(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  // First digit must be 6, 7, 8, or 9
  if (digits.length > 0 && !/^[6-9]/.test(digits)) return "";
  return digits;
}

export function isValidMobile(value) {
  return /^[6-9]\d{9}$/.test(value);
}

// ─── Email ────────────────────────────────────────────────────
export function validateEmail(value) {
  if (!value || value.trim() === "") return { valid: false, message: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return { valid: false, message: "Please enter a valid email address." };
  return { valid: true, message: "" };
}

// ─── Password ─────────────────────────────────────────────────
export function validatePassword(value) {
  if (!value) return { valid: false, message: "Password is required." };
  if (value.length < 8) return { valid: false, message: "Password must be at least 8 characters." };
  if (!/[A-Z]/.test(value)) return { valid: false, message: "Password must include an uppercase letter." };
  if (!/[a-z]/.test(value)) return { valid: false, message: "Password must include a lowercase letter." };
  if (!/[0-9]/.test(value)) return { valid: false, message: "Password must include a number." };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return { valid: false, message: "Password must include a special character." };
  return { valid: true, message: "" };
}

// ─── Confirm Password ─────────────────────────────────────────
export function validateConfirmPassword(password, confirm) {
  if (!confirm) return { valid: false, message: "Please confirm your password." };
  if (password !== confirm) return { valid: false, message: "Passwords do not match." };
  return { valid: true, message: "" };
}

// ─── Required ─────────────────────────────────────────────────
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: "" };
}

// ─── Name ─────────────────────────────────────────────────────
export function validateName(value) {
  if (!value || value.trim() === "") return { valid: false, message: "Name is required." };
  if (value.trim().length < 2) return { valid: false, message: "Name must be at least 2 characters." };
  return { valid: true, message: "" };
}

// ─── Select/Dropdown ──────────────────────────────────────────
export function validateSelect(value, fieldName) {
  if (!value || value === "") return { valid: false, message: `Please select ${fieldName}.` };
  return { valid: true, message: "" };
}

// ─── Min Length ───────────────────────────────────────────────
export function validateMinLength(value, min, fieldName) {
  if (!value || value.trim().length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters.` };
  }
  return { valid: true, message: "" };
}

// ─── Number ───────────────────────────────────────────────────
export function validatePositiveNumber(value, fieldName) {
  if (!value || isNaN(value) || Number(value) <= 0) {
    return { valid: false, message: `Please enter a valid ${fieldName}.` };
  }
  return { valid: true, message: "" };
}
