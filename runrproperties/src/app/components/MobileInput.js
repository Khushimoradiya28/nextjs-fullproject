"use client";

import { sanitizeMobile, validateMobile } from "../utils/validation";

/**
 * Reusable mobile number input component.
 * Props:
 *  - value: current mobile value
 *  - onChange: callback with sanitized value
 *  - error: external error message (optional, from form validation)
 *  - className: CSS class for the input (preserves existing styling)
 *  - placeholder: input placeholder text
 *  - id: input id attribute
 *  - name: input name attribute
 */
export default function MobileInput({ value, onChange, error, className, placeholder, id, name }) {
  const handleChange = (e) => {
    const sanitized = sanitizeMobile(e.target.value);
    onChange(sanitized);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const sanitized = sanitizeMobile(pasted);
    onChange(sanitized);
  };

  const { message } = validateMobile(value);
  const showError = error || (value.length > 0 && value.length < 10 ? message : "");

  return (
    <>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        maxLength={10}
        id={id}
        name={name}
        className={className}
        placeholder={placeholder || "10-digit mobile number"}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
      />
      {showError && (
        <span style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: 4, display: "block" }}>
          {showError}
        </span>
      )}
    </>
  );
}
