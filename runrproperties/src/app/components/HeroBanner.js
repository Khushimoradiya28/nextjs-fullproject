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
    tagline: "Sabarmati Riverfront & Commercial Megacity",
    icon: "🏙️",
    bgPhoto: "/img/hero-3d-ahmedabad.jpg",
    avgPrice: "₹ 5,450",
    unit: "/ sq.ft",
    growth: "+14.8% YoY",
    growthPositive: true,
    rentalYield: "4.2% Yield",
    hotspots: [
      { name: "SG Highway", count: "320+ verified" },
      { name: "Riverfront", count: "190+ verified" },
      { name: "Sindhu Bhavan", count: "210+ verified" },
      { name: "Science City", count: "140+ verified" },
    ],
    properties: "1,450+",
    directOwners: "980+ Direct Owners",
    highlightTag: "Highest Demand 🔥",
    liveActivity: "3 new direct villas listed on SG Highway • 2m ago",
    beaconLoc: { top: "35px", right: "42%" },
    beaconTitle: "Sabarmati Riverfront & SG Highway Hub",
    sparklineData: "M 0 35 Q 25 32, 45 22 T 85 14 T 120 4",
    sparklineArea: "M 0 35 Q 25 32, 45 22 T 85 14 T 120 4 L 120 40 L 0 40 Z",
    accentColor: "#38bdf8",
  },
  {
    id: "surat",
    name: "Surat",
    tagline: "Diamond Bourse & Tapi Riverfront Capital",
    icon: "💎",
    bgPhoto: "/img/hero-3d-surat.jpg",
    avgPrice: "₹ 4,850",
    unit: "/ sq.ft",
    growth: "+15.2% YoY",
    growthPositive: true,
    rentalYield: "4.6% Yield",
    hotspots: [
      { name: "Diamond Bourse", count: "310+ verified" },
      { name: "Vesu", count: "240+ verified" },
      { name: "VIP Road", count: "160+ verified" },
      { name: "Dumas Road", count: "190+ verified" },
    ],
    properties: "920+",
    directOwners: "640+ Direct Owners",
    highlightTag: "Top Rental Yield 💎",
    liveActivity: "Luxury penthouse near Diamond Bourse verified • 5m ago",
    beaconLoc: { top: "35px", right: "42%" },
    beaconTitle: "Surat Diamond Bourse & Tapi Waterfront",
    sparklineData: "M 0 38 Q 30 30, 55 26 T 90 12 T 120 2",
    sparklineArea: "M 0 38 Q 30 30, 55 26 T 90 12 T 120 2 L 120 40 L 0 40 Z",
    accentColor: "#06b6d4",
  },
  {
    id: "gandhinagar",
    name: "Gandhinagar",
    tagline: "GIFT City Global FinTech & IT Towers",
    icon: "⚡",
    bgPhoto: "/img/hero-3d-gandhinagar.jpg",
    avgPrice: "₹ 6,200",
    unit: "/ sq.ft",
    growth: "+16.5% YoY",
    growthPositive: true,
    rentalYield: "5.1% Yield",
    hotspots: [
      { name: "GIFT City", count: "290+ verified" },
      { name: "Kudasan", count: "150+ verified" },
      { name: "Infocity", count: "120+ verified" },
      { name: "Randesan", count: "110+ verified" },
    ],
    properties: "740+",
    directOwners: "510+ Direct Owners",
    highlightTag: "Global FinTech Hub ⚡",
    liveActivity: "Direct commercial floor in GIFT Diamond Tower • Just now",
    beaconLoc: { top: "35px", right: "42%" },
    beaconTitle: "GIFT City Diamond Tower & FinTech Corridor",
    sparklineData: "M 0 36 Q 20 34, 40 20 T 80 8 T 120 0",
    sparklineArea: "M 0 36 Q 20 34, 40 20 T 80 8 T 120 0 L 120 40 L 0 40 Z",
    accentColor: "#60a5fa",
  },
  {
    id: "vadodara",
    name: "Vadodara",
    tagline: "Royal Heritage & Alkapuri Luxury Estates",
    icon: "🏛️",
    bgPhoto: "/img/hero-3d-vadodara.jpg",
    avgPrice: "₹ 3,950",
    unit: "/ sq.ft",
    growth: "+12.6% YoY",
    growthPositive: true,
    rentalYield: "3.9% Yield",
    hotspots: [
      { name: "Alkapuri", count: "170+ verified" },
      { name: "Palace Road", count: "140+ verified" },
      { name: "Gotri", count: "120+ verified" },
      { name: "Bhayli", count: "150+ verified" },
    ],
    properties: "580+",
    directOwners: "420+ Direct Owners",
    highlightTag: "Peaceful Living 🌿",
    liveActivity: "4BHK luxury estate verified near Alkapuri • 12m ago",
    beaconLoc: { top: "35px", right: "42%" },
    beaconTitle: "Laxmi Vilas Palace & Alkapuri Estates",
    sparklineData: "M 0 34 Q 30 32, 60 22 T 95 16 T 120 8",
    sparklineArea: "M 0 34 Q 30 32, 60 22 T 95 16 T 120 8 L 120 40 L 0 40 Z",
    accentColor: "#10b981",
  },
  {
    id: "rajkot",
    name: "Rajkot",
    tagline: "150ft Ring Road Flyovers & Smart Metropolis",
    icon: "🌆",
    bgPhoto: "/img/hero-3d-rajkot.jpg",
    avgPrice: "₹ 4,100",
    unit: "/ sq.ft",
    growth: "+13.4% YoY",
    growthPositive: true,
    rentalYield: "4.0% Yield",
    hotspots: [
      { name: "150ft Ring Rd", count: "180+ verified" },
      { name: "Kalawad Road", count: "150+ verified" },
      { name: "University Rd", count: "90+ verified" },
      { name: "Nana Mava", count: "60+ verified" },
    ],
    properties: "430+",
    directOwners: "310+ Direct Owners",
    highlightTag: "Fastest Growing 🚀",
    liveActivity: "3BHK apartment verified on 150ft Ring Road • 8m ago",
    beaconLoc: { top: "35px", right: "42%" },
    beaconTitle: "150ft Ring Road Flyovers & Kalawad Hub",
    sparklineData: "M 0 36 Q 25 30, 50 24 T 85 14 T 120 6",
    sparklineArea: "M 0 36 Q 25 30, 50 24 T 85 14 T 120 6 L 120 40 L 0 40 Z",
    accentColor: "#f59e0b",
  },
  {
    id: "bhavnagar",
    name: "Bhavnagar",
    tagline: "Waghawadi Luxury Corridor & Coastal Port Hub",
    icon: "🌊",
    bgPhoto: "/img/hero-3d-bhavnagar.jpg",
    avgPrice: "₹ 3,450",
    unit: "/ sq.ft",
    growth: "+11.8% YoY",
    growthPositive: true,
    rentalYield: "3.8% Yield",
    hotspots: [
      { name: "Waghawadi Rd", count: "140+ verified" },
      { name: "Hill Drive", count: "90+ verified" },
      { name: "Kaliyabid", count: "110+ verified" },
      { name: "Ghogha Road", count: "80+ verified" },
    ],
    properties: "360+",
    directOwners: "280+ Direct Owners",
    highlightTag: "Coastal Living 🌊",
    liveActivity: "Direct owner 3BHK bungalow verified in Waghawadi Rd • 15m ago",
    beaconLoc: { top: "35px", right: "42%" },
    beaconTitle: "Waghawadi Luxury Corridor & Takhteshwar Vista",
    sparklineData: "M 0 36 Q 25 32, 50 26 T 85 16 T 120 8",
    sparklineArea: "M 0 36 Q 25 32, 50 26 T 85 16 T 120 8 L 120 40 L 0 40 Z",
    accentColor: "#0ea5e9",
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
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const cardRef = useRef(null);
  const suggestionsRef = useRef(null);
  const router = useRouter();

  // 3D Parallax Tilt Effect on Mouse Move
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

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
  const currentDest = gujaratTopDestinations[activeCityIdx];

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
                alt={`${dest.name} 3D architectural masterplan`}
                className={styles.bgSlideImg}
              />
            </div>
          ))}
          <div className={styles.bannerMasterOverlay} />
        </div>

        <div className={styles.ambientGlowOrb1}></div>
        <div className={styles.ambientGlowOrb2}></div>
        <div className={styles.ambientCyberGrid}></div>

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

            {/* Clean, Elegant Dynamic Headline with Fixed 2-Line Layout */}
            <div className={styles.bannerCopy}>
              <h1 className={styles.bannerTitle}>
                <span className={styles.bannerTitlePrefix}>Find Direct Verified Properties in</span>
                <span key={currentDest.name} className={styles.bannerHighlight}>
                  {currentDest.name}
                </span>
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
                        d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                      />
                      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.6" fill="none" />
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

          {/* Right Column: 3D Holographic Gujarat PropTech Command Center */}
          <div
            className={styles.bannerRightCol}
            onMouseEnter={() => setIsCityAutoPaused(true)}
            onMouseLeave={() => setIsCityAutoPaused(false)}
          >
            {/* Gujarat Real Estate Index & City Insights Hub Card */}
            <div
              ref={cardRef}
              className={styles.marketHubCard}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                '--glare-x': `${tilt.glareX}%`,
                '--glare-y': `${tilt.glareY}%`,
              }}
            >
              {/* Dynamic Glare Reflection Overlay */}
              <div className={styles.cardGlare}></div>

              {/* Card Header with Live Radar & Status */}
              <div className={styles.marketHubHeader}>
                <div className={styles.marketHubBadge}>
                  <div className={styles.radarScanner}>
                    <span className={styles.radarSweep}></span>
                    <span className={styles.radarDot}></span>
                  </div>
                  <span className={styles.radarText}>GUJARAT REAL ESTATE INDEX</span>
                </div>
                <div className={styles.marketHubCounter}>
                  <span className={styles.counterDot}></span>
                  <span>{activeCityIdx + 1} / {gujaratTopDestinations.length}</span>
                </div>
              </div>

              {/* Active City Headline & Highlight */}
              <div className={styles.marketCityHeader}>
                <div className={styles.marketCityTopRow}>
                  <div className={styles.marketCityTitleGroup}>
                    <span className={styles.marketCityIcon}>
                      {currentDest.icon}
                    </span>
                    <div>
                      <h3 className={styles.marketCityName}>
                        {currentDest.name}
                      </h3>
                      <p className={styles.marketCityTagline}>
                        {currentDest.tagline}
                      </p>
                    </div>
                  </div>
                  <span className={styles.marketHighlightBadge}>
                    {currentDest.highlightTag}
                  </span>
                </div>
              </div>

              {/* Live Intelligence 2-Metric Grid with Live Sparkline Growth */}
              <div className={styles.marketMetricsGrid}>
                <div className={styles.marketMetricBox}>
                  <div className={styles.metricBoxHeader}>
                    <span className={styles.metricLabel}>Avg Property Rate</span>
                    <span className={styles.metricTrend}>
                      <span className={styles.trendArrow}>↗</span> {currentDest.growth}
                    </span>
                  </div>
                  <div className={styles.metricRateRow}>
                    <span className={styles.metricValue}>{currentDest.avgPrice}</span>
                    <span className={styles.metricUnit}>{currentDest.unit}</span>
                  </div>
                  {/* Live Animated SVG Sparkline */}
                  <div className={styles.metricSparklineWrap}>
                    <svg className={styles.sparklineSvg} viewBox="0 0 120 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`sparkGrad-${activeCityIdx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={currentDest.accentColor} stopOpacity="0.4" />
                          <stop offset="100%" stopColor={currentDest.accentColor} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={currentDest.sparklineArea} fill={`url(#sparkGrad-${activeCityIdx})`} />
                      <path d={currentDest.sparklineData} fill="none" stroke={currentDest.accentColor} strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="120" cy="4" r="3.5" fill={currentDest.accentColor} className={styles.sparklineDot} />
                    </svg>
                    <span className={styles.sparklineCaption}>Real-time Q3 Growth</span>
                  </div>
                </div>

                <div className={styles.marketMetricBox}>
                  <div className={styles.metricBoxHeader}>
                    <span className={styles.metricLabel}>Verified Listings</span>
                    <span className={styles.metricZeroFee}>Zero Brokerage</span>
                  </div>
                  <div className={styles.metricRateRow}>
                    <span className={styles.metricValue}>{currentDest.properties}</span>
                    <span className={styles.metricDirectTag}>Verified</span>
                  </div>
                  <div className={styles.verifiedOwnersBar}>
                    <div className={styles.verifiedOwnersProgress}>
                      <div className={styles.verifiedOwnersFill} style={{ width: "88%", background: currentDest.accentColor }}></div>
                    </div>
                    <span className={styles.verifiedOwnersText}>⚡ {currentDest.directOwners}</span>
                  </div>
                </div>
              </div>

              {/* Live Real-Time Activity Feed Broadcast */}
              <div className={styles.liveActivityTicker}>
                <div className={styles.liveActivityDotWrap}>
                  <span className={styles.liveActivityRing}></span>
                  <span className={styles.liveActivityDot}></span>
                </div>
                <span className={styles.liveActivityText}>
                  <strong>LIVE:</strong> {currentDest.liveActivity}
                </span>
              </div>

              {/* Hot Localities Interactive Chips */}
              <div className={styles.hotspotsSection}>
                <div className={styles.hotspotsHeader}>
                  <span className={styles.hotspotsTitle}>📍 High-Demand Prime Localities:</span>
                  <span className={styles.hotspotsSub}>Instant Connect</span>
                </div>
                <div className={styles.hotspotsList}>
                  {currentDest.hotspots.map((spot) => (
                    <button
                      key={typeof spot === "string" ? spot : spot.name}
                      type="button"
                      className={styles.hotspotChip}
                      onClick={() => {
                        const spotName = typeof spot === "string" ? spot : spot.name;
                        setLocation(currentDest.name);
                        router.push(
                          `/buy?city=${encodeURIComponent(currentDest.name)}`
                        );
                      }}
                    >
                      <span className={styles.chipName}>{typeof spot === "string" ? spot : spot.name}</span>
                      {spot.count && <span className={styles.chipCount}>{spot.count}</span>}
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
                    <span className={styles.switchName}>{dest.name}</span>
                    {activeCityIdx === idx && <span className={styles.switchProgressBar} />}
                  </button>
                ))}
              </div>

              {/* Explore City CTA */}
              <button
                type="button"
                className={styles.cityExploreBtn}
                onClick={() => {
                  const c = currentDest.name;
                  setLocation(c);
                  router.push(`/buy?city=${encodeURIComponent(c)}`);
                }}
              >
                <span className={styles.exploreBtnIcon}>🚀</span>
                <span>Browse Verified Properties in {currentDest.name}</span>
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
                <span className={styles.trustPillInquiry}>● 240+ Enquiries Today</span>
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
