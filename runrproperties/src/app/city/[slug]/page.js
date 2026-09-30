"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PropertyCard from "../../buy/components/PropertyCard";
import { searchProperties } from "../../services/api";
import styles from "./city.module.css";

const ITEMS_PER_PAGE = 20;

const cityInfo = {
  ahmedabad: { name: "Ahmedabad", description: "Explore premium residential and commercial listings in Ahmedabad." },
  surat: { name: "Surat", description: "Discover curated homes and investment opportunities in Surat." },
  vadodara: { name: "Vadodara", description: "Browse luxury apartments and family homes in Vadodara." },
  rajkot: { name: "Rajkot", description: "Find the finest properties available in Rajkot." },
  gandhinagar: { name: "Gandhinagar", description: "See premium plots and ready-to-move homes in Gandhinagar." },
  bhavnagar: { name: "Bhavnagar", description: "Explore curated options for homes and plots in Bhavnagar." },
};

export default function CityPage() {
  const params = useParams();
  const slug = params.slug;
  const city = cityInfo[slug] || { name: slug.charAt(0).toUpperCase() + slug.slice(1), description: `Browse properties in ${slug.charAt(0).toUpperCase() + slug.slice(1)}.` };

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadProperties() {
      setLoading(true);
      const res = await searchProperties({ city: city.name, status: "active", limit: "100" });
      if (isCurrent) {
        if (res.success && res.properties) {
          setProperties(res.properties);
        } else {
          setProperties([]);
        }
        setLoading(false);
      }
    }
    loadProperties();
    return () => {
      isCurrent = false;
    };
  }, [city.name]);

  // Filter by search
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {/* Header Banner */}
        <section className={styles.heroBanner}>
          <div className={styles.heroLeft}>
            <div className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>← Back to Home</Link>
              <span className={styles.breadcrumbSep}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span className={styles.breadcrumbCurrent}>{city.name}</span>
            </div>
            <h1 className={styles.heroTitle}>Properties in <span className={styles.cityHighlight}>{city.name}</span></h1>
            <p className={styles.heroText}>{city.description}</p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.countBadge}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="#007bbd" strokeWidth="1.8" fill="#e6f4fb"/><path d="M9 21V12h6v9" stroke="#007bbd" strokeWidth="1.8" strokeLinecap="round"/></svg><span className={styles.countNumber}>{filteredProperties.length}</span><span className={styles.countText}>Properties Available</span></div>
          </div>
        </section>

        {/* Search bar */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#007bbd" strokeWidth="2"/>
            <path d="M16.5 16.5L21 21" stroke="#007bbd" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, locality, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.searchClear} onClick={() => setSearchQuery("")} aria-label="Clear search">✕</button>
          )}
        </div>

        {loading ? (
          <div className={styles.cardsGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className={styles.cardSkeleton} />
            ))}
          </div>
        ) : paginatedProperties.length > 0 ? (
          <>
            <div className={styles.cardsGrid}>
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
                <div className={styles.pageNumbers}>
                  {getPageNumbers().map(num => (
                    <button key={num} className={`${styles.pageNum} ${num === currentPage ? styles.pageNumActive : ""}`} onClick={() => setCurrentPage(num)}>{num}</button>
                  ))}
                </div>
                <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            {searchQuery ? (
              <>
                <h3>No properties found for &ldquo;{searchQuery}&rdquo; in {city.name}</h3>
                <p>Try a different search term.</p>
                <button className={styles.clearBtn} onClick={() => setSearchQuery("")}>Clear Search</button>
              </>
            ) : (
              <>
                <h3>No properties available in {city.name}</h3>
                <p>Check back soon for new listings.</p>
                <Link href="/" className={styles.browseCta}>Back to Home</Link>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}









