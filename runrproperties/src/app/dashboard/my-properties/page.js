"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getMyProperties, deleteProperty } from "../../services/api";
import { PROPERTY_TYPES, CITIES } from "../../constants/propertyOptions";
import { showWishlistToast } from "../../components/WishlistToast";
import ConfirmModal from "../../components/ConfirmModal";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./myproperties.module.css";

const ITEMS_PER_PAGE = 8;

function formatPrice(price) {
  if (!price) return "N/A";
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`;
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const { loading, isAuthenticated, isOwner } = useAuth();
  const [properties, setProperties] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isOwner)) router.push("/login");
  }, [loading, isAuthenticated, isOwner, router]);

  const fetchProperties = async () => {
    setFetching(true);
    setError("");
    const res = await getMyProperties();
    if (res.success) {
      setProperties(res.properties || []);
    } else {
      setError(res.message || "Failed to load properties. Please try again.");
    }
    setFetching(false);
  };

  useEffect(() => {
    if (isAuthenticated && isOwner) fetchProperties();
  }, [isAuthenticated, isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive unique cities for filter options
  const cities = CITIES;
  const types = PROPERTY_TYPES;

  // Filtered + searched properties
  const filteredProperties = useMemo(() => {
    let result = properties;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(p => (p.status || "active") === statusFilter);
    }

    // Listing type filter
    if (listingFilter !== "all") {
      result = result.filter(p => p.listingType === listingFilter);
    }

    // Property type filter
    if (typeFilter !== "all") {
      result = result.filter(p => p.type === typeFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      result = result.filter(p => p.city === cityFilter);
    }

    return result;
  }, [properties, search, statusFilter, listingFilter, typeFilter, cityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  // Reset page when filters/search change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, listingFilter, typeFilter, cityFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteProperty(deleteId);
    setDeleting(false);
    if (res.success) {
      setProperties((p) => p.filter((prop) => prop.id !== deleteId));
      showWishlistToast("Property deleted successfully.", "removed");
    } else {
      showWishlistToast("Failed to delete property.", "removed");
    }
    setDeleteId(null);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading) return null;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard" className={styles.breadcrumbLink}>← Back to Dashboard</Link>
        </div>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Properties</h1>
            <p className={styles.pageSubtitle}>
              {properties.length === 0 ? "No properties listed yet" : `Manage your ${properties.length} listed ${properties.length === 1 ? "property" : "properties"}`}
            </p>
          </div>
          <Link href="/dashboard/add-property" className={styles.addBtn}>+ Add New</Link>
        </div>

        {/* Loading State */}
        {fetching && (
          <div className={styles.skeletonWrap}>
            <div className={styles.skeletonFilters} />
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        )}

        {/* Error State */}
        {!fetching && error && (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={fetchProperties}>Retry</button>
          </div>
        )}

        {/* Content */}
        {!fetching && !error && (
          <>
            <div className={styles.statsRow}>
              <div className={styles.statCard}><span className={styles.statValue}>{properties.length}</span><span className={styles.statLabel}>Total</span></div>
              <div className={styles.statCard}><span className={styles.statValue}>{properties.filter(p => p.listingType === "buy").length}</span><span className={styles.statLabel}>For Sale</span></div>
              <div className={styles.statCard}><span className={styles.statValue}>{properties.filter(p => p.listingType === "rent").length}</span><span className={styles.statLabel}>For Rent</span></div>
            </div>

            {/* Search & Filters */}
            {properties.length > 0 && (
              <div className={styles.filtersSection}>
                <div className={styles.searchBox}>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.searchIcon}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by title, city, or locality..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && <button className={styles.clearSearch} onClick={() => setSearch("")}>✕</button>}
                </div>
                <div className={styles.filterRow}>
                  <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                  </select>
                  <select className={styles.filterSelect} value={listingFilter} onChange={(e) => setListingFilter(e.target.value)}>
                    <option value="all">All Listing</option>
                    <option value="buy">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                  <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select className={styles.filterSelect} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                    <option value="all">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {(search || statusFilter !== "all" || listingFilter !== "all" || typeFilter !== "all" || cityFilter !== "all") && (
                  <div className={styles.activeFilters}>
                    <span className={styles.resultCount}>{filteredProperties.length} result{filteredProperties.length !== 1 ? "s" : ""}</span>
                    <button className={styles.clearFilters} onClick={() => { setSearch(""); setStatusFilter("all"); setListingFilter("all"); setTypeFilter("all"); setCityFilter("all"); }}>Clear All</button>
                  </div>
                )}
              </div>
            )}

            {/* Property List */}
            {paginatedProperties.length > 0 ? (
              <>
                <div className={styles.propList}>
                  {paginatedProperties.map((prop) => (
                    <div key={prop.id} className={styles.propCard}>
                      <div className={styles.propImage}>
                        <img src={prop.image && !prop.image.startsWith("blob:") ? prop.image : "/img/buy-properties/1.jpg"} alt={prop.title} loading="lazy" />
                        <span className={styles.propBadge}>{prop.listingType === "rent" ? "Rent" : "Sale"}</span>
                      </div>
                      <div className={styles.propInfo}>
                        <h3 className={styles.propTitle}>{prop.title}</h3>
                        <p className={styles.propLocation}>{prop.location}{prop.city ? `, ${prop.city}` : ""}</p>
                        <div className={styles.propMeta}>
                          {prop.bhk > 0 && <span>{prop.bhk} BHK</span>}
                          {prop.area > 0 && <span>{prop.area} Sq.Ft.</span>}
                          <span className={styles.propPrice}>{formatPrice(prop.price)}</span>
                        </div>
                      </div>
                      <div className={styles.propActions}>
                        <Link href={`/property/${prop.id}`} className={styles.viewBtn}>View</Link>
                        <Link href={`/dashboard/edit-property/${prop.id}`} className={styles.editBtn}>Edit</Link>
                        <button className={styles.deleteBtn} onClick={() => setDeleteId(prop.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      ← Previous
                    </button>
                    <div className={styles.pageNumbers}>
                      {getPageNumbers().map(num => (
                        <button
                          key={num}
                          className={`${styles.pageNum} ${num === currentPage ? styles.pageNumActive : ""}`}
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <button
                      className={styles.pageBtn}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : properties.length > 0 ? (
              <div className={styles.empty}>
                <h3>No matching properties</h3>
                <p>Try adjusting your search or filters.</p>
                <button className={styles.retryBtn} onClick={() => { setSearch(""); setStatusFilter("all"); setListingFilter("all"); setTypeFilter("all"); setCityFilter("all"); }}>Clear Filters</button>
              </div>
            ) : (
              <div className={styles.empty}>
                <h3>No properties listed yet</h3>
                <p>Start by adding your first property listing.</p>
                <Link href="/dashboard/add-property" className={styles.addBtn}>+ Add Property</Link>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />

      {deleteId && (
        <ConfirmModal
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
