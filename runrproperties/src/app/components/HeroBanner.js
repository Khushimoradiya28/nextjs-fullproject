"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchProperties } from "../services/api";
import { PROPERTY_TYPES, CITIES } from "../constants/propertyOptions";
import styles from "./HeroBanner.module.css";

const marketTabs = ["Buy", "Rent"];

const buyBudgetRanges = [
  { label: "₹ 25L - 50L", min: "2500000", max: "5000000" },
  { label: "₹ 50L - 1Cr", min: "5000000", max: "10000000" },
  { label: "₹ 1Cr - 2Cr", min: "10000000", max: "20000000" },
  { label: "₹ 2Cr - 5Cr", min: "20000000", max: "50000000" },
  { label: "₹ 5Cr+", min: "50000000", max: "" },
];

const rentBudgetRanges = [
  { label: "₹ 5K - 15K", min: "5000", max: "15000" },
  { label: "₹ 15K - 25K", min: "15000", max: "25000" },
  { label: "₹ 25K - 50K", min: "25000", max: "50000" },
  { label: "₹ 50K - 1L", min: "50000", max: "100000" },
  { label: "₹ 1L+", min: "100000", max: "" },
];

const bhkOptions = ["1", "2", "3", "4", "5"];

export default function HeroBanner() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const router = useRouter();

  // Lock body scroll when search modal is open + ESC to close
  useEffect(() => {
    if (searchModalOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => { if (e.key === "Escape") setSearchModalOpen(false); };
      document.addEventListener("keydown", handleEsc);
      return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", handleEsc); };
    } else {
      document.body.style.overflow = "";
    }
  }, [searchModalOpen]);

  // Fetch available cities from existing properties
  useEffect(() => {
    async function loadCities() {
      const res = await searchProperties({ limit: "100" });
      if (res.success && res.properties) {
        const uniqueCities = [...new Set(res.properties.map(p => p.city).filter(Boolean))].sort();
        setCities(uniqueCities);
      }
    }
    loadCities();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(location.toLowerCase().trim())
  );

  const handleSearch = (e) => {
    e.preventDefault();

    const page = activeTab === "Rent" ? "/rent" : "/buy";
    const params = new URLSearchParams();

    const cityValue = location.trim();
    const typeValue = type;
    const bhkValue = bhk;
    const budgetValue = budget;

    if (cityValue) params.set("city", cityValue);
    if (typeValue) params.set("type", typeValue);
    if (bhkValue) params.set("bhk", bhkValue);

    // Parse budget range into minPrice/maxPrice
    if (budgetValue) {
      const ranges = activeTab === "Rent" ? rentBudgetRanges : buyBudgetRanges;
      const selected = ranges.find(r => r.label === budgetValue);
      if (selected) {
        if (selected.min) params.set("minPrice", selected.min);
        if (selected.max) params.set("maxPrice", selected.max);
      }
    }

    const queryString = params.toString();
    const url = queryString ? `${page}?${queryString}` : page;
    router.push(url);
  };

  const currentBudgetRanges = activeTab === "Rent" ? rentBudgetRanges : buyBudgetRanges;

  // Banner image source — replace with API response URL when backend is ready
  const bannerImage = "/img/home-banner.png";

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerInner}>
        <img src={bannerImage} alt="Runr Properties banner" className={styles.bannerImg} />
        <div className={styles.bannerTop}>
          <div className={styles.bannerCopy}>
            <h1 className={styles.bannerTitle}>
              Find Your Perfect Property,
              <span className={styles.bannerHighlight}> Your Way.</span>
            </h1>
            <p className={styles.bannerText}>
              Buy, Rent or Invest in verified properties across top cities.
            </p>
          </div>
        </div>

        

        <div className={styles.bannerBottom}>
          <div className={styles.searchShell}>
            <div className={styles.marketTabs} role="tablist" aria-label="Market tabs">
              {marketTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={activeTab === tab ? styles.tabActive : styles.tabLabel}
                  onClick={() => { setActiveTab(tab); setBudget(""); }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form className={styles.bannerSearchCard} onSubmit={handleSearch}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="hero-location">
                  Location
                </label>
                <div className={styles.inputWithIcon}>
                  <svg className={styles.fieldIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 21s-6.2-5.2-8.4-9.1A5.6 5.6 0 0 1 12 4.6a5.6 5.6 0 0 1 8.4 7.3C18.2 15.8 12 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                    />
                    <circle cx="12" cy="11.2" r="2.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  </svg>
                  <div className={styles.selectWrap}>
                    <select
                      id="hero-location"
                      className={styles.select}
                      aria-label="Select city"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">Select City</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <svg className={styles.selectIcon} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="hero-property-type">
                  Property Type
                </label>
                <div className={styles.inputWithIcon}>
                  <svg className={styles.fieldIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 10.5 12 5l8 5.5V19a1 1 0 0 1-1 1h-5v-5.5h-4V20H5a1 1 0 0 1-1-1v-8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className={styles.selectWrap}>
                    <select
                      id="hero-property-type"
                      className={styles.select}
                      aria-label="Select property type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Select type</option>
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <svg className={styles.selectIcon} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="hero-budget">
                  {activeTab === "Rent" ? "Monthly Rent" : "Budget"}
                </label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.rupeeIcon} aria-hidden="true">
                    ₹
                  </span>
                  <div className={styles.selectWrap}>
                    <select
                      id="hero-budget"
                      className={styles.select}
                      aria-label={activeTab === "Rent" ? "Select rent range" : "Select budget"}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      <option value="">Min - Max</option>
                      {currentBudgetRanges.map((r) => (
                        <option key={r.label} value={r.label}>{r.label}</option>
                      ))}
                    </select>
                    <svg className={styles.selectIcon} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="hero-bhk">
                  BHK
                </label>
                <div className={styles.inputWithIcon}>
                  <svg className={styles.fieldIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M6 8h12v10H6z" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <div className={styles.selectWrap}>
                    <select
                      id="hero-bhk"
                      className={styles.select}
                      aria-label="Select BHK"
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                    >
                      <option value="">Any</option>
                      {bhkOptions.map((b) => (
                        <option key={b} value={b}>{b} BHK</option>
                      ))}
                    </select>
                    <svg className={styles.selectIcon} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <button className={styles.bannerCTA} type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile floating search icon — fixed bottom-right, visible only ≤700px */}
      <button className={styles.mobileSearchCTA} type="button" onClick={() => setSearchModalOpen(true)} aria-label="Search Properties">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>

      {/* Mobile search bottom-sheet modal */}
      {searchModalOpen && (
        <div className={styles.searchModal} onClick={() => setSearchModalOpen(false)}>
          <div className={styles.searchModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchModalHeader}>
              <h3 className={styles.searchModalTitle}>Search Properties</h3>
              <button type="button" className={styles.searchModalClose} onClick={() => setSearchModalOpen(false)}>✕</button>
            </div>
            <div className={styles.modalTabs}>
              {marketTabs.map((tab) => (
                <button key={tab} type="button" className={activeTab === tab ? styles.modalTabActive : styles.modalTab} onClick={() => { setActiveTab(tab); setBudget(""); }}>{tab}</button>
              ))}
            </div>
            <form className={styles.modalForm} onSubmit={(e) => { handleSearch(e); setSearchModalOpen(false); }}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Location</label>
                <select className={styles.modalSelect} value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select City</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Property Type</label>
                <select className={styles.modalSelect} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>{activeTab === "Rent" ? "Monthly Rent" : "Budget"}</label>
                <select className={styles.modalSelect} value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="">Any</option>
                  {currentBudgetRanges.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>BHK</label>
                <select className={styles.modalSelect} value={bhk} onChange={(e) => setBhk(e.target.value)}>
                  <option value="">Any</option>
                  {bhkOptions.map((b) => <option key={b} value={b}>{b} BHK</option>)}
                </select>
              </div>
              <button type="submit" className={styles.modalSubmit}>Search</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
