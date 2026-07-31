"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyFilters from "./components/PropertyFilters";
import PropertyGrid from "./components/PropertyGrid";
import { searchProperties } from "../services/api";
import styles from "./buy.module.css";

const ITEMS_PER_PAGE = 12;
const EMPTY_FILTERS = {
  city: [],
  type: [],
  bhk: [],
  budgetMin: "",
  budgetMax: "",
  areaMin: "",
  areaMax: "",
  furnishing: [],
  keyword: "",
};

function mapSort(val) {
  if (val === "price-low") return "price";
  if (val === "price-high") return "price_desc";
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
      budgetMin: sp.get("minPrice") || "",
      budgetMax: sp.get("maxPrice") || "",
      areaMin: sp.get("areaMin") || "",
      areaMax: sp.get("areaMax") || "",
      furnishing: sp.getAll("furnishing"),
      keyword: sp.get("q") || "",
    },
    sortBy: sp.get("sortBy") || "newest",
    page: Number(sp.get("page")) || 1,
  };
}

export default function BuyPage() {
  const initial = useRef(readInitialParams());
  const initialized = useRef(false);

  // Pending = what user sees in sidebar (not yet applied)
  const [pending, setPending] = useState(initial.current.filters);
  // Applied = what triggered the last API call
  const [applied, setApplied] = useState(initial.current.filters);
  const [sortBy, setSortBy] = useState(initial.current.sortBy);
  const [currentPage, setCurrentPage] = useState(initial.current.page);
  const [viewMode, setViewMode] = useState("grid");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [properties, setProperties] = useState([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async (f, sort, page) => {
    setGridLoading(true);
    const q = {
      listingType: "buy",
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
      sortBy: mapSort(sort),
    };
    if (f.city.length > 0) q.city = f.city.join(",");
    if (f.type.length > 0) q.propertyType = f.type.join(",");
    if (f.bhk.length > 0) q.bedrooms = f.bhk.join(",");
    if (f.budgetMin) q.minPrice = f.budgetMin;
    if (f.budgetMax) q.maxPrice = f.budgetMax;
    // if (f.furnishing.length > 0) q.furnishing = f.furnishing.join(",");
    if (f.furnishing.length > 0) {
      q.furnishing = f.furnishing
        .map((v) => {
          switch (v) {
            case "furnished":
              return "Fully Furnished";
            case "semi-furnished":
              return "Semi Furnished";
            case "unfurnished":
              return "Unfurnished";
            default:
              return v;
          }
        })
        .join(",");
    }
    // console.log(q.furnishing);
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

    // Sync URL
    const p = new URLSearchParams();
    f.city.forEach((v) => p.append("city", v));
    f.type.forEach((v) => p.append("type", v));
    f.bhk.forEach((v) => p.append("bhk", v));
    f.furnishing.forEach((v) => p.append("furnishing", v));
    if (f.budgetMin) p.set("minPrice", f.budgetMin);
    if (f.budgetMax) p.set("maxPrice", f.budgetMax);
    if (f.areaMin) p.set("areaMin", f.areaMin);
    if (f.areaMax) p.set("areaMax", f.areaMax);
    if (f.keyword) p.set("q", f.keyword);
    if (sort !== "newest") p.set("sortBy", sort);
    if (page > 1) p.set("page", String(page));
    window.history.replaceState(
      null,
      "",
      `/buy${p.toString() ? "?" + p.toString() : ""}`,
    );
  }, []);

  // Only fetch when APPLIED filters, sort, or page change
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

  // Browser back/forward
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

  // Called by filter sidebar checkboxes — only updates pending (no API)
  const handleFilterChange = (key, value) => {
    setPending((prev) => ({ ...prev, [key]: value }));
  };

  // Called by "Apply Filters" button — commits pending → applied
  const handleApplyFilters = () => {
    setApplied(pending);
    setCurrentPage(1);
  };

  // Called by "Clear All"
  const handleClearFilters = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  if (!mounted) return null;

  return (
    <div className={styles.buyPage}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <a href="/" className={styles.breadcrumbLink}>
              Home
            </a>
            <span className={styles.breadcrumbSep}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className={styles.breadcrumbCurrent}>Buy Properties</span>
          </div>
          <div className={styles.pageHeaderInner}>
            <div>
              <h1 className={styles.pageTitle}>Buy Properties</h1>
              <p className={styles.pageSubtitle}>
                {gridLoading
                  ? "Searching..."
                  : `${totalResults} properties found`}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.contentLayout}>
          <PropertyFilters
            filters={pending}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            resultCount={totalResults}
          />
          <PropertyGrid
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
