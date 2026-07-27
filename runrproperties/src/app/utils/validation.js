/**
 * Mobile number validation utility.
 * Reusable across all forms in the application.
 */

/**
 * Validates a mobile number string.
 * @param {string} value - The mobile number to validate.
 * @returns {{ valid: boolean, message: string }} Validation result.
 */
export function validateMobile(value) {
  if (!value) return { valid: false, message: "" };
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return { valid: false, message: "" };
  if (cleaned.length < 10) return { valid: false, message: "Please enter a valid 10-digit mobile number." };
  if (cleaned.length > 10) return { valid: false, message: "Please enter a valid 10-digit mobile number." };
  return { valid: true, message: "" };
}

/**
 * Sanitizes mobile input — strips non-digits and limits to 10 characters.
 * Use this in onChange handlers.
 * @param {string} value - Raw input value.
 * @returns {string} Sanitized value (digits only, max 10).
 */
export function sanitizeMobile(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

/**
 * Checks if a mobile number is complete and valid (exactly 10 digits).
 * @param {string} value - The mobile number.
 * @returns {boolean}
 */
export function isValidMobile(value) {
  return /^\d{10}$/.test(value);
}
