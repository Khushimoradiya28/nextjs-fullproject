"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./MultiSelectDropdown.module.css";

export default function MultiSelectDropdown({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder || "Select";
    if (selected.length === 1) {
      const found = options.find((o) => o.value === selected[0]);
      return found ? found.label : selected[0];
    }
    return `${selected.length} selected`;
  };

  return (
    <div className={styles.wrapper} ref={wrapRef}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.triggerText}>{getDisplayText()}</span>
        <svg className={`${styles.triggerIcon} ${open ? styles.triggerIconOpen : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {options.map((opt) => (
            <label key={opt.value} className={styles.option}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              <span className={styles.optionLabel}>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
