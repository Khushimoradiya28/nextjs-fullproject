"use client";

import RentPropertyCard from "./RentPropertyCard";
import styles from "./RentGrid.module.css";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "rent-low", label: "Rent: Low to High" },
  { value: "rent-high", label: "Rent: High to Low" },
  { value: "area", label: "Largest Area" },
];

export default function RentGrid({ properties, viewMode, setViewMode, sortBy, setSortBy, currentPage, setCurrentPage, totalPages, totalResults }) {
  const goToPage = (page) => {
    const newPage = typeof page === "function" ? page(currentPage) : page;
    setCurrentPage(newPage);
    requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: "smooth" }); });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className={styles.pagination}>
        <button className={styles.pageBtn} onClick={() => goToPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label="Previous page">←</button>
        {start > 1 && (<><button className={styles.pageBtn} onClick={() => goToPage(1)}>1</button>{start > 2 && <span className={styles.pageEllipsis}>...</span>}</>)}
        {pages.map((page) => (<button key={page} className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`} onClick={() => goToPage(page)}>{page}</button>))}
        {end < totalPages && (<>{end < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}<button className={styles.pageBtn} onClick={() => goToPage(totalPages)}>{totalPages}</button></>)}
        <button className={styles.pageBtn} onClick={() => goToPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label="Next page">→</button>
      </div>
    );
  };

  return (
    <div className={styles.gridSection}>
      <div className={styles.sortBar}>
        <div className={styles.sortLeft}>
          <span className={styles.resultCount}><strong>{totalResults}</strong> Rentals Found</span>
        </div>
        <div className={styles.sortRight}>
          <div className={styles.sortGroup}>
            <label className={styles.sortLabel} htmlFor="rent-sort">Sort:</label>
            <select id="rent-sort" className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`} onClick={() => setViewMode("grid")} aria-label="Grid view">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" /><rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
            <button className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`} onClick={() => setViewMode("list")} aria-label="List view">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="10" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="16" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {properties.length > 0 ? (
        <div className={`${styles.propertiesContainer} ${viewMode === "list" ? styles.listLayout : styles.gridLayout}`}>
          {properties.map((property) => (<RentPropertyCard key={property.id} property={property} viewMode={viewMode} />))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No rental properties found</h3>
          <p className={styles.emptyText}>Try adjusting your filters to see more results</p>
        </div>
      )}

      {renderPagination()}
    </div>
  );
}
