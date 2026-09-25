"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConfirmDialog from "../components/ConfirmDialog";
import DashboardSidebar from "../components/DashboardSidebar";
import profileStyles from "../profile/profile.module.css";
import Link from "next/link";
import styles from "./wishlist.module.css";

function formatPrice(price) {
  if (!price) return "₹ N/A";
  if (price >= 10000000) {
    return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹ ${(price / 100000).toFixed(1)} Lakh`;
  }
  return `₹ ${price.toLocaleString("en-IN")}`;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function WishlistPage() {
  const { wishlist, loaded, removeFromWishlist, clearWishlist } = useWishlist();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [confirmId, setConfirmId] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/wishlist");
    }
    if (!loading && user?.role === "bank_partner") {
      router.push("/bank-partner/dashboard");
    }
  }, [user, loading, router]);

  const totalPages = Math.ceil(wishlist.length / ITEMS_PER_PAGE);
  const paginatedWishlist = wishlist.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!user) return null;

  return (
    <div className={profileStyles.page}>
      <Header />

      <div className={profileStyles.pageContainer}>
        {/* Breadcrumb Header */}
        <div className={profileStyles.breadcrumbBar}>
          <Link href="/" className={profileStyles.breadcrumbLink}>Home</Link>
          <span className={profileStyles.breadcrumbSep}>/</span>
          <Link href="/dashboard" className={profileStyles.breadcrumbLink}>Dashboard</Link>
          <span className={profileStyles.breadcrumbSep}>/</span>
          <span className={profileStyles.breadcrumbCurrent}>My Wishlist</span>
        </div>

        <main className={profileStyles.main}>
          <DashboardSidebar />

          <div className={profileStyles.content}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
              <div className={styles.pageHeaderInner}>
                <div>
                  <div className={styles.heroBadge}>
                    <span className={styles.badgeDot} />
                    <span>Saved Favourites</span>
                  </div>
                  <h1 className={styles.pageTitle}>
                    My <span className={styles.highlight}>Wishlist</span>
                  </h1>
                  <p className={styles.pageSubtitle}>
                    {!loaded
                      ? "Loading your saved properties..."
                      : wishlist.length > 0
                        ? `You have ${wishlist.length} saved ${wishlist.length === 1 ? "property" : "properties"} ready to compare`
                        : "Your wishlist is empty. Save properties you like to compare them easily."}
                  </p>
                </div>
                {wishlist.length > 0 && (
                  <button className={styles.clearAllBtn} onClick={() => setConfirmAll(true)}>
                    Clear All
                  </button>
                )}
              </div>
            </div>

        {/* Wishlist Items */}
        {!loaded ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : wishlist.length > 0 ? (
          <>
          <div className={styles.wishlistGrid}>
            {paginatedWishlist.map((property) => (
              <article key={property.id} className={styles.wishlistCard}>
                <Link
                  href={`/property/${property.id}`}
                  className={styles.cardLink}
                >
                  <div className={styles.cardImageWrap}>
                    <img
                      src={property.image || "/img/buy-properties/1.jpg"}
                      alt={property.title}
                      className={styles.cardImg}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/img/buy-properties/1.jpg";
                      }}
                    />
                    <div className={styles.badgeRow}>
                      <span className={styles.badgeType}>
                        {capitalizeFirst(property.type)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardTitle}>{property.title}</h3>
                      <p className={styles.cardLocation}>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M12 21s-6.2-5.2-8.4-9.1A5.6 5.6 0 0 1 12 4.6a5.6 5.6 0 0 1 8.4 7.3C18.2 15.8 12 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                          />
                          <circle
                            cx="12"
                            cy="11.2"
                            r="2"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                          />
                        </svg>
                        {property.location}
                      </p>
                    </div>

                    <div className={styles.cardDetails}>
                      {property.bhk > 0 && (
                        <span className={styles.detailItem}>
                          {property.bhk} BHK
                        </span>
                      )}
                      <span className={styles.detailItem}>
                        {property.area?.toLocaleString("en-IN")} Sq.Ft.
                      </span>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.priceValue}>
                        {formatPrice(property.price)}
                      </span>
                      <div className={styles.cardFooterActions}>
                        <button
                          className={styles.removeBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setConfirmId(property.id);
                          }}
                          aria-label={`Remove ${property.title} from wishlist`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
              <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />
                <path
                  d="M40 55s-10.5-7-13.2-11.6A8.4 8.4 0 0 1 34 30.8c2.4 0 4.2 1.1 6 2.9 1.8-1.8 3.6-2.9 6-2.9a8.4 8.4 0 0 1 7.2 12.6C50.5 48 40 55 40 55z"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No saved properties yet</h3>
            <p className={styles.emptyText}>
              Browse properties and tap the heart icon to save them here
            </p>
            <Link href="/buy" className={styles.browseCta}>
              Browse Properties
            </Link>
          </div>
        )}
          </div>
        </main>
      </div>

      <Footer />

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Remove Property?"
        message="This property will be removed from your wishlist."
        confirmText="Yes, Remove"
        cancelText="Keep It"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          removeFromWishlist(confirmId);
          setConfirmId(null);
        }}
      />

      <ConfirmDialog
        isOpen={confirmAll}
        title="Clear Entire Wishlist?"
        message="All saved properties will be removed. This cannot be undone."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        onCancel={() => setConfirmAll(false)}
        onConfirm={() => {
          clearWishlist();
          setConfirmAll(false);
        }}
      />
    </div>
  );
}
