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

const gujaratTopDestinations = [
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    tagline: "Mega City & Commercial Capital",
    icon: "🏙️",
    bgPhoto: "/img/home-banner.png",
    avgPrice: "₹ 5,450 / sq.ft",
    growth: "+14.8% YoY",
    rentalYield: "4.2% Yield",
    hotspots: ["SG Highway", "Bopal", "Science City", "Sindhu Bhavan"],
    properties: "1,450+ Verified",
    directOwners: "980+ Direct Owners",
    highlightTag: "Highest Demand",
    activity: "3 new direct villas listed in SG Highway",
  },
  {
    id: "surat",
    name: "Surat",
    tagline: "Diamond & Textile Hub",
    icon: "💎",
    bgPhoto: "/img/home-banner-villa.jpg",
    avgPrice: "₹ 4,850 / sq.ft",
    growth: "+15.2% YoY",
    rentalYield: "4.6% Yield",
    hotspots: ["Vesu", "VIP Road", "Pal", "Dumas Road"],
    properties: "920+ Verified",
    directOwners: "640+ Direct Owners",
    highlightTag: "Top Rental Yield",
    activity: "Luxury penthouse verified in Vesu",
  },
  {
    id: "gandhinagar",
    name: "Gandhinagar",
    tagline: "GIFT City & Smart FinTech Hub",
    icon: "⚡",
    bgPhoto: "/img/home-banner-estate.jpg",
    avgPrice: "₹ 6,200 / sq.ft",
    growth: "+16.5% YoY",
    rentalYield: "5.1% Yield",
    hotspots: ["GIFT City", "Kudasan", "Infocity", "Randesan"],
    properties: "740+ Verified",
    directOwners: "510+ Direct Owners",
    highlightTag: "Global FinTech Hub",
    activity: "Commercial smart floor available in GIFT City",
  },
  {
    id: "vadodara",
    name: "Vadodara",
    tagline: "Cultural Heritage & Industrial Hub",
    icon: "🏛️",
    bgPhoto: "/img/home-banner-glass-pavilion.jpg",
    avgPrice: "₹ 3,950 / sq.ft",
    growth: "+12.6% YoY",
    rentalYield: "3.9% Yield",
    hotspots: ["Alkapuri", "Vasna Road", "Gotri", "Bhayli"],
    properties: "580+ Verified",
    directOwners: "420+ Direct Owners",
    highlightTag: "Peaceful Living",
    activity: "Direct owner bungalow in Alkapuri",
  },
  {
    id: "rajkot",
    name: "Rajkot",
    tagline: "Saurashtra's Rapidly Growing Corridor",
    icon: "🌆",
    bgPhoto: "/img/home-banner-cantilever.jpg",
    avgPrice: "₹ 4,100 / sq.ft",
    growth: "+13.4% YoY",
    rentalYield: "4.0% Yield",
    hotspots: ["Kalawad Road", "150ft Ring Rd", "University Rd"],
    properties: "430+ Verified",
    directOwners: "310+ Direct Owners",
    highlightTag: "Fastest Growing",
    activity: "3BHK high-rise apartment verified direct",
  },
];

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
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [isCityAutoPaused, setIsCityAutoPaused] = useState(false);
  const suggestionsRef = useRef(null);
  const router = useRouter();

  // Auto-cycle through top Gujarat cities every 5s (pauses on hover)
  useEffect(() => {
    if (isCityAutoPaused) return;
    const timer = setInterval(() => {
      setActiveCityIdx((prev) => (prev + 1) % gujaratTopDestinations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isCityAutoPaused]);

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

  // Quick select trending city
  const handleQuickCity = (city) => {
    setLocation(city);
    const matchedIdx = gujaratTopDestinations.findIndex(
      (d) => d.name.toLowerCase() === city.toLowerCase()
    );
    if (matchedIdx !== -1) setActiveCityIdx(matchedIdx);
  };

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerInner}>
        {/* Full-Screen Architectural Background Carousel with Smooth Cross-Fade */}
        <div className={styles.bannerBgCarousel}>
          {gujaratTopDestinations.map((dest, idx) => (
            <div
              key={dest.id}
              className={`${styles.bgSlide} ${activeCityIdx === idx ? styles.bgSlideActive : ""}`}
            >
              <img
                src={dest.bgPhoto}
                alt={`${dest.name.toLowerCase()} luxury architecture`}
                className={styles.bgSlideImg}
              />
            </div>
          ))}
          <div className={styles.bannerMasterOverlay} />
        </div>

        <div className={styles.ambientGlowOrb1}></div>
        <div className={styles.ambientGlowOrb2}></div>

        <div className={styles.bannerContainer}>
          {/* Left Column: Hero Content & Search */}
          <div className={styles.bannerLeftCol}>
            {/* Live Gujarat Platform Badge */}
            <div className={styles.livePlatformBadge}>
              <span className={styles.livePulseDot}></span>
              <span className={styles.liveBadgeMain}>runr properties</span>
              <span className={styles.liveBadgeDivider}>•</span>
              <span className={styles.liveBadgeSub}>Gujarat's #1 Direct-Owner Real Estate Portal</span>
            </div>

            {/* Clean, Elegant Headline */}
            <div className={styles.bannerCopy}>
              <h1 className={styles.bannerTitle}>
                Find Direct Verified Properties on{" "}
                <span className={styles.bannerHighlight}>runr properties</span>
              </h1>
              <p className={styles.bannerText}>
                Buy or rent 100% verified direct-owner homes & luxury properties across Gujarat with zero brokerage.
              </p>
            </div>

            {/* Search Widget */}
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
                <div className={`${styles.fieldGroup} ${styles.fieldWithDivider}`}>
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
                        onChange={(e) => {
                          setLocation(e.target.value);
                          const mIdx = gujaratTopDestinations.findIndex(
                            (d) => d.name.toLowerCase() === e.target.value.toLowerCase()
                          );
                          if (mIdx !== -1) setActiveCityIdx(mIdx);
                        }}
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

            {/* Trending Gujarat Cities Quick Select */}
            <div className={styles.trendingCitiesRow}>
              <span className={styles.trendingLabel}>🔥 Trending:</span>
              <div className={styles.trendingPills}>
                {["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Gandhinagar"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`${styles.trendingCityBtn} ${location === city ? styles.trendingCityActive : ""}`}
                    onClick={() => handleQuickCity(city)}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Clean & Sleek Gujarat Cities Hub */}
          <div
            className={styles.bannerRightCol}
            onMouseEnter={() => setIsCityAutoPaused(true)}
            onMouseLeave={() => setIsCityAutoPaused(false)}
          >
            {/* Gujarat Real Estate Index & City Insights Hub Card */}
            <div className={styles.marketHubCard}>
              {/* Card Header with Live Pulse */}
              <div className={styles.marketHubHeader}>
                <div className={styles.marketHubBadge}>
                  <span className={styles.livePulseDot}></span>
                  <span>gujarat real estate index</span>
                </div>
                <span className={styles.marketHubCounter}>
                  {activeCityIdx + 1} / {gujaratTopDestinations.length}
                </span>
              </div>

              {/* Active City Headline & Highlight */}
              <div className={styles.marketCityHeader}>
                <div className={styles.marketCityTopRow}>
                  <div className={styles.marketCityTitleGroup}>
                    <span className={styles.marketCityIcon}>
                      {gujaratTopDestinations[activeCityIdx].icon}
                    </span>
                    <div>
                      <h3 className={styles.marketCityName}>
                        {gujaratTopDestinations[activeCityIdx].name.toLowerCase()}
                      </h3>
                      <p className={styles.marketCityTagline}>
                        {gujaratTopDestinations[activeCityIdx].tagline}
                      </p>
                    </div>
                  </div>
                  <span className={styles.marketHighlightBadge}>
                    {gujaratTopDestinations[activeCityIdx].highlightTag}
                  </span>
                </div>
              </div>

              {/* Market Intelligence 2-Metric Clean Grid */}
              <div className={styles.marketMetricsGrid}>
                <div className={styles.marketMetricBox}>
                  <div className={styles.metricBoxHeader}>
                    <span className={styles.metricLabel}>Avg Property Rate</span>
                    <span className={styles.metricTrend}>
                      {gujaratTopDestinations[activeCityIdx].growth}
                    </span>
                  </div>
                  <span className={styles.metricValue}>
                    {gujaratTopDestinations[activeCityIdx].avgPrice}
                  </span>
                </div>

                <div className={styles.marketMetricBox}>
                  <div className={styles.metricBoxHeader}>
                    <span className={styles.metricLabel}>Verified Listings</span>
                    <span className={styles.metricZeroFee}>Zero Brokerage</span>
                  </div>
                  <span className={styles.metricValue}>
                    {gujaratTopDestinations[activeCityIdx].properties}
                  </span>
                </div>
              </div>

              {/* Hot Localities Interactive Chips */}
              <div className={styles.hotspotsSection}>
                <span className={styles.hotspotsTitle}>📍 Prime Localities:</span>
                <div className={styles.hotspotsList}>
                  {gujaratTopDestinations[activeCityIdx].hotspots.map((spot) => (
                    <button
                      key={spot}
                      type="button"
                      className={styles.hotspotChip}
                      onClick={() => {
                        setLocation(gujaratTopDestinations[activeCityIdx].name);
                        router.push(
                          `/buy?city=${encodeURIComponent(gujaratTopDestinations[activeCityIdx].name)}`
                        );
                      }}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive City Switcher Bar */}
              <div className={styles.citySwitcherBar}>
                {gujaratTopDestinations.map((dest, idx) => (
                  <button
                    key={dest.id}
                    type="button"
                    className={`${styles.citySwitchBtn} ${activeCityIdx === idx ? styles.citySwitchBtnActive : ""}`}
                    onClick={() => {
                      setActiveCityIdx(idx);
                      setLocation(dest.name);
                    }}
                  >
                    <span className={styles.switchIcon}>{dest.icon}</span>
                    <span className={styles.switchName}>{dest.name.toLowerCase()}</span>
                    {activeCityIdx === idx && <span className={styles.switchProgressBar} />}
                  </button>
                ))}
              </div>

              {/* Explore City CTA */}
              <button
                type="button"
                className={styles.cityExploreBtn}
                onClick={() => {
                  const c = gujaratTopDestinations[activeCityIdx].name;
                  setLocation(c);
                  router.push(`/buy?city=${encodeURIComponent(c)}`);
                }}
              >
                <span>Browse Properties in {gujaratTopDestinations[activeCityIdx].name.toLowerCase()}</span>
                <span className={styles.exploreArrow}>→</span>
              </button>
            </div>

            {/* Live Trust Floating Pill under Market Hub */}
            <div className={styles.floatingLiveTrustPill}>
              <div className={styles.trustPillLeft}>
                <span className={styles.trustPillStat}>₹ 4.8+ Cr</span>
                <span className={styles.trustPillLabel}>Brokerage Saved in Gujarat</span>
              </div>
              <div className={styles.trustPillDivider} />
              <div className={styles.trustPillRight}>
                <span className={styles.trustPillTag}>⚡ 100% Direct Owners</span>
              </div>
            </div>
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
