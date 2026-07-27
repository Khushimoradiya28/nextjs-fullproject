"use client";

import PropertyCard from "./PropertyCard";
import styles from "./PropertyGrid.module.css";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "area", label: "Largest Area" },
];

export default function PropertyGrid({
  properties,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  currentPage,
  setCurrentPage,
  totalPages,
  totalResults,
}) {
  const goToPage = (page) => {
    const newPage = typeof page === "function" ? page(currentPage) : page;
    setCurrentPage(newPage);
    // Use requestAnimationFrame to ensure DOM has updated before scrolling
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => goToPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ←
        </button>

        {start > 1 && (
          <>
            <button className={styles.pageBtn} onClick={() => goToPage(1)}>1</button>
            {start > 2 && <span className={styles.pageEllipsis}>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}
            <button className={styles.pageBtn} onClick={() => goToPage(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        <button
          className={styles.pageBtn}
          onClick={() => goToPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className={styles.gridSection}>
      {/* Sort bar */}
      <div className={styles.sortBar}>
        <div className={styles.sortLeft}>
          <span className={styles.resultCount}>
            <strong>{totalResults}</strong> Properties Found
          </span>
        </div>

        <div className={styles.sortRight}>
          {/* Sort dropdown */}
          <div className={styles.sortGroup}>
            <label className={styles.sortLabel} htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              title="Grid view"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              title="List view"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                <rect x="3" y="10" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                <rect x="3" y="16" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Properties grid/list */}
      {properties.length > 0 ? (
        <div className={`${styles.propertiesContainer} ${viewMode === "list" ? styles.listLayout : styles.gridLayout}`}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="2" />
              <path d="M22 26h20M22 34h14M22 42h8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="44" cy="44" r="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M42 44h4M44 42v4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No properties found</h3>
          <p className={styles.emptyText}>Try adjusting your filters to see more results</p>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
