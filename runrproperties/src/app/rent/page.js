"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RentFilters from "./components/RentFilters";
import RentGrid from "./components/RentGrid";
import { searchProperties } from "../services/api";
import styles from "./rent.module.css";

const ITEMS_PER_PAGE = 12;
const EMPTY_FILTERS = {
  city: [],
  type: [],
  bhk: [],
  rentMin: "",
  rentMax: "",
  furnishing: [],
  availableFrom: "",
  keyword: "",
};

function mapSort(val) {
  if (val === "rent-low") return "price";
  if (val === "rent-high") return "price_desc";
  return val || "newest";
}

function readInitialParams() {
  if (typeof window === "undefined")
    return { filters: EMPTY_FILTERS, sortBy: "newest", page: 1 };
  const sp = new URLSearchParams(window.location.search);
  return {
    filters: {
      city: sp.getAll("city"),
      type: sp.getAll("type"),
      bhk: sp.getAll("bhk"),
      rentMin: sp.get("minPrice") || "",
      rentMax: sp.get("maxPrice") || "",
      furnishing: sp.getAll("furnishing"),
      availableFrom: sp.get("availableFrom") || "",
      keyword: sp.get("q") || "",
    },
    sortBy: sp.get("sortBy") || "newest",
    page: Number(sp.get("page")) || 1,
  };
}

export default function RentPage() {
  // const initial = useRef(readInitialParams());
  const initialized = useRef(false);

  // const [pending, setPending] = useState(initial.current.filters);
  // const [applied, setApplied] = useState(initial.current.filters);
  // const [sortBy, setSortBy] = useState(initial.current.sortBy);
  // const [currentPage, setCurrentPage] = useState(initial.current.page);
  const [pending, setPending] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [viewMode, setViewMode] = useState("grid");

  const [properties, setProperties] = useState([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async (f, sort, page) => {
    setGridLoading(true);
    const q = {
      listingType: "rent",
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
      sortBy: mapSort(sort),
    };
    if (f.city.length > 0) q.city = f.city.join(",");
    if (f.type.length > 0) q.propertyType = f.type.join(",");
    if (f.bhk.length > 0) q.bedrooms = f.bhk.join(",");
    if (f.rentMin) q.minPrice = f.rentMin;
    if (f.rentMax) q.maxPrice = f.rentMax;
    if (f.furnishing.length > 0) q.furnishing = f.furnishing.join(",");
    if (f.keyword) q.q = f.keyword;

    const res = await searchProperties(q);
    if (res.success) {
      setProperties(res.properties || []);
      setTotalResults(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 0);
    } else {
      setProperties([]);
      setTotalResults(0);
      setTotalPages(0);
    }
    setGridLoading(false);

    const p = new URLSearchParams();
    f.city.forEach((v) => p.append("city", v));
    f.type.forEach((v) => p.append("type", v));
    f.bhk.forEach((v) => p.append("bhk", v));
    f.furnishing.forEach((v) => p.append("furnishing", v));
    if (f.rentMin) p.set("minPrice", f.rentMin);
    if (f.rentMax) p.set("maxPrice", f.rentMax);
    if (f.availableFrom) p.set("availableFrom", f.availableFrom);
    if (f.keyword) p.set("q", f.keyword);
    if (sort !== "newest") p.set("sortBy", sort);
    if (page > 1) p.set("page", String(page));
    window.history.replaceState(
      null,
      "",
      `/rent${p.toString() ? "?" + p.toString() : ""}`,
    );
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    fetchData(applied, sortBy, currentPage);
  }, [applied, sortBy, currentPage, fetchData]);

  // Initialize filters from URL on mount, then trigger first fetch
  useEffect(() => {
    const params = readInitialParams();
    const hasUrlFilters = Object.values(params.filters).some((v) =>
      Array.isArray(v) ? v.length > 0 : v !== "",
    );
    if (hasUrlFilters || params.sortBy !== "newest" || params.page !== 1) {
      setPending(params.filters);
      setApplied(params.filters);
      setSortBy(params.sortBy);
      setCurrentPage(params.page);
    } else {
      fetchData(params.filters, params.sortBy, params.page);
    }
    initialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handlePop = () => {
      const params = readInitialParams();
      setPending(params.filters);
      setApplied(params.filters);
      setSortBy(params.sortBy);
      setCurrentPage(params.page);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const handleFilterChange = (key, value) => {
    setPending((prev) => ({ ...prev, [key]: value }));
  };
  const handleApplyFilters = () => {
    setApplied(pending);
    setCurrentPage(1);
  };
  const handleClearFilters = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  if (!mounted) return null;

  return (
    <div className={styles.rentPage}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <a href="/" className={styles.breadcrumbLink}>
              Home
            </a>
            <span className={styles.breadcrumbSep}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className={styles.breadcrumbCurrent}>Rent Properties</span>
          </div>
          <div className={styles.pageHeaderInner}>
            <div>
              <div className={styles.heroBadge}>
                <span className={styles.badgeDot} />
                <span>Verified Rental Homes</span>
              </div>
              <h1 className={styles.pageTitle}>
                Rental <span className={styles.highlight}>Properties</span> in Gujarat
              </h1>
              <p className={styles.pageSubtitle}>
                Discover fully furnished flats, spacious villas, and affordable rentals across prime neighborhoods.
              </p>
            </div>
            <div className={styles.headerMetaBox}>
              <div className={styles.metaCountBadge}>
                {gridLoading ? "Searching..." : `✦ ${totalResults} Rentals Found`}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentLayout}>
          <RentFilters
            filters={pending}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            resultCount={totalResults}
          />
          <RentGrid
            properties={properties}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={(v) => {
              setSortBy(v);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalResults={totalResults}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
