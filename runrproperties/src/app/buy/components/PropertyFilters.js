"use client";

import { useState } from "react";
import MultiSelectDropdown from "../../components/MultiSelectDropdown";
import { PROPERTY_TYPES, CITIES } from "../../constants/propertyOptions";
import styles from "./PropertyFilters.module.css";

const cityOptions = CITIES.map(c => ({ value: c, label: c }));

const typeOptions = PROPERTY_TYPES.map(t => ({ value: t, label: t }));

const bhkOptions = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5+ BHK" },
];

const budgetOptions = [
  { value: "2500000", label: "₹ 25 Lakh" },
  { value: "5000000", label: "₹ 50 Lakh" },
  { value: "7500000", label: "₹ 75 Lakh" },
  { value: "10000000", label: "₹ 1 Crore" },
  { value: "15000000", label: "₹ 1.5 Crore" },
  { value: "20000000", label: "₹ 2 Crore" },
  { value: "50000000", label: "₹ 5 Crore" },
];

const furnishingOptions = [
  { value: "furnished", label: "Furnished" },
  { value: "semi-furnished", label: "Semi-Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

const postedByOptions = [
  { value: "", label: "Anyone" },
  { value: "owner", label: "Owner" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
];

export default function PropertyFilters({ filters, onFilterChange, onApplyFilters, onClearFilters, resultCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some((v) => Array.isArray(v) ? v.length > 0 : v !== "");

  return (
    <>
      {/* Mobile filter toggle button */}
      <button
        className={styles.mobileFilterBtn}
        onClick={() => setMobileOpen(true)}
        aria-label="Open filters"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 4h18M7 9h10M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Filters
        {hasActiveFilters && <span className={styles.filterBadge} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Filter sidebar */}
      <aside className={`${styles.filterSidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.filterHeader}>
          <div className={styles.filterHeaderLeft}>
            <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 4h18M7 9h10M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <h3 className={styles.filterTitle}>Filters</h3>
          </div>
          <div className={styles.filterHeaderRight}>
            {hasActiveFilters && (
              <button className={styles.clearBtn} onClick={onClearFilters}>
                Clear All
              </button>
            )}
            <button
              className={styles.mobileCloseBtn}
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.filterBody}>
          {/* City */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>City</label>
            <MultiSelectDropdown
              options={cityOptions}
              selected={filters.city || []}
              onChange={(val) => onFilterChange("city", val)}
              placeholder="All Cities"
            />
          </div>

          {/* Property Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Property Type</label>
            <MultiSelectDropdown
              options={typeOptions}
              selected={filters.type || []}
              onChange={(val) => onFilterChange("type", val)}
              placeholder="All Types"
            />
          </div>

          {/* BHK */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>BHK</label>
            <MultiSelectDropdown
              options={bhkOptions}
              selected={filters.bhk || []}
              onChange={(val) => onFilterChange("bhk", val)}
              placeholder="Any BHK"
            />
          </div>

          {/* Budget Range */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Budget</label>
            <div className={styles.rangeRow}>
              <select
                className={styles.filterSelect}
                value={filters.budgetMin}
                onChange={(e) => onFilterChange("budgetMin", e.target.value)}
              >
                <option value="">Min</option>
                {budgetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className={styles.rangeSep}>to</span>
              <select
                className={styles.filterSelect}
                value={filters.budgetMax}
                onChange={(e) => onFilterChange("budgetMax", e.target.value)}
              >
                <option value="">Max</option>
                {budgetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Area Range */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Area (Sq.Ft.)</label>
            <div className={styles.rangeRow}>
              <input
                type="number"
                className={styles.filterInput}
                placeholder="Min"
                value={filters.areaMin}
                onChange={(e) => onFilterChange("areaMin", e.target.value)}
              />
              <span className={styles.rangeSep}>to</span>
              <input
                type="number"
                className={styles.filterInput}
                placeholder="Max"
                value={filters.areaMax}
                onChange={(e) => onFilterChange("areaMax", e.target.value)}
              />
            </div>
          </div>

          {/* Furnishing */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Furnishing</label>
            <MultiSelectDropdown
              options={furnishingOptions}
              selected={filters.furnishing || []}
              onChange={(val) => onFilterChange("furnishing", val)}
              placeholder="Any"
            />
          </div>

        </div>

        {/* Sticky action bar */}
        <div className={styles.mobileApplyBar}>
          <button className={styles.clearAllBtn} onClick={onClearFilters}>Clear All</button>
          <button className={styles.applyBtn} onClick={() => { onApplyFilters(); setMobileOpen(false); }}>Apply Filters</button>
        </div>
      </aside>
    </>
  );
}
