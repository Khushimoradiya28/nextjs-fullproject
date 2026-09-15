"use client";

import { useState } from "react";
import Link from "next/link";
import { useWishlist } from "../../context/WishlistContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import PremiumEnquiryModal from "../../components/PremiumEnquiryModal";
import styles from "./PropertyCard.module.css";

function formatPrice(price) {
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`;
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function PropertyCard({ property, viewMode }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { requireAuth } = useAuthGuard();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const liked = isInWishlist(property.id);
  const isListView = viewMode === "list";

  return (
    <Link href={`/property/${property.id}`} className={styles.cardLink}>
      <article
        className={`${styles.card} ${isListView ? styles.cardList : ""}`}
      >
        <div className={styles.cardImageWrap}>
          {property.featured && (
            <span className={styles.featuredBadge}>Featured</span>
          )}
          <div className={styles.cardImage}>
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
          </div>
          <button
            className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              requireAuth(() => toggleWishlist(property));
            }}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={liked ? "#e0245e" : "transparent"}
                stroke={liked ? "none" : "#ffffff"}
                strokeWidth="1.6"
              />
            </svg>
          </button>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>{property.title}</h3>
            <p className={styles.cardLocation}>
              <svg viewBox="0 0 24 24" fill="none">
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
              {property.city ? `, ${property.city}` : ""}
            </p>

            {isListView && (
              <div className={styles.listPrice}>
                <span className={styles.listPriceValue}>
                  {formatPrice(property.price)}
                </span>
                <span className={styles.listPriceLabel}>
                  {property.listingType === "rent" ? "/month" : "onwards"}
                </span>
              </div>
            )}

            <div className={styles.listMeta}>
              {property.bhk > 0 && (
                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  {property.bhk} BHK
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 12h16M4 12V7a2 2 0 012-2h3M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  {property.bathrooms} Bath
                </span>
              )}
              {property.area > 0 && (
                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M3 9h18M9 3v18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  {property.area.toLocaleString("en-IN")} Sq.Ft.
                </span>
              )}
              {property.furnishing && property.furnishing !== "" && (
                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="7"
                      width="20"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  {property.furnishing}
                </span>
              )}
            </div>
          </div>

          <div className={styles.cardFooter}>
            {isListView ? (
              property.owner ? (
                <>
                  <div className={styles.ownerPanel}>
                    <div
                      className={styles.ownerAvatar}
                      style={{
                        background: property.owner.profilePhoto
                          ? "transparent"
                          : property.owner.avatarColor || "#2980b9",
                      }}
                    >
                      {property.owner.profilePhoto ? (
                        <img
                          src={property.owner.profilePhoto}
                          alt={property.owner.name}
                          className={styles.ownerAvatarImg}
                        />
                      ) : (
                        <span className={styles.ownerInitial}>
                          {property.owner.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.ownerInfo}>
                      <span className={styles.ownerName}>
                        {property.owner.name}
                      </span>
                      <span className={styles.ownerLabel}>Property Owner</span>
                    </div>
                  </div>
                  <button
                    className={styles.callBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requireAuth(() => setShowEnquiry(true));
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                    </svg>
                    Contact Agent
                  </button>
                </>
              ) : null
            ) : (
              /* GRID VIEW FOOTER */
              <>
                <div className={styles.priceBlock}>
                  <span className={styles.priceValue}>
                    {formatPrice(property.price)}
                  </span>
                  <span className={styles.priceLabel}>
                    {property.listingType === "rent" ? "/month" : "onwards"}
                  </span>
                </div>

                {property.owner ? (
                  /* Floating Owner Chip for Grid View */
                  <div
                    className={styles.gridOwnerChip}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requireAuth(() => setShowEnquiry(true));
                    }}
                  >
                    <div
                      className={styles.gridOwnerAvatar}
                      style={{
                        background: property.owner.profilePhoto
                          ? "transparent"
                          : property.owner.avatarColor || "#007bbd",
                      }}
                    >
                      {property.owner.profilePhoto ? (
                        <img
                          src={property.owner.profilePhoto}
                          alt={property.owner.name}
                          className={styles.ownerAvatarImg}
                        />
                      ) : (
                        <span className={styles.ownerInitialSmall}>
                          {property.owner.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={styles.gridOwnerName}>
                      {property.owner.name}
                    </span>
                    <div className={styles.gridCallBadge}>
                      <svg viewBox="0 0 24 24">
                        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  /* Fallback Contact Button if Owner info is missing */
                  <button
                    className={styles.contactIconBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requireAuth(() => setShowEnquiry(true));
                    }}
                    aria-label="Contact Owner"
                    title="Contact Owner"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {showEnquiry && (
          <PremiumEnquiryModal
            property={property}
            onClose={() => setShowEnquiry(false)}
          />
        )}
      </article>
    </Link>
  );
}