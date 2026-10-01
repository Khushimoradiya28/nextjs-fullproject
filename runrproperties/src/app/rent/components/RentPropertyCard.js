"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "../../context/WishlistContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import PremiumEnquiryModal from "../../components/PremiumEnquiryModal";
import styles from "./RentPropertyCard.module.css";

function formatRent(rent) {
  if (!rent) return "₹ 0";
  return `₹ ${rent.toLocaleString("en-IN")}`;
}

export default function RentPropertyCard({ property, viewMode }) {
  const router = useRouter();

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { requireAuth } = useAuthGuard();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const liked = isInWishlist(property.id);
  const isListView = viewMode === "list";

  const images = useMemo(() => {
    let list = [];
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      list = property.images;
    } else if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
      list = property.photos;
    } else if (property.image) {
      list = [property.image];
    } else {
      list = ["/img/rent-properties/1.jpg"];
    }
    const clean = list.filter(Boolean);
    return clean.length > 0 ? clean : ["/img/rent-properties/1.jpg"];
  }, [property]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  return (
    <article
      className={`${styles.card} ${isListView ? styles.cardList : ""}`}
      onClick={() => router.push(`/property/${property.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div
        className={styles.cardImageWrap}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.badgeRow}>
          {property.featured && (
            <span className={styles.featuredBadge}>Featured</span>
          )}
          <span className={`${styles.listingBadge} ${styles.rentBadge}`}>
            Rent
          </span>
        </div>
        <div className={styles.cardImage}>
          <img
            key={activeImgIndex}
            src={images[activeImgIndex]}
            alt={property.title}
            className={styles.cardImg}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/img/rent-properties/1.jpg";
            }}
          />
        </div>

        {images.length > 1 && (
          <div className={styles.cardSliderDots}>
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.cardSliderDot} ${idx === activeImgIndex ? styles.cardSliderDotActive : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImgIndex(idx);
                }}
              />
            ))}
          </div>
        )}

        {!isListView && (
          <div className={styles.imagePriceBadge}>
            <span className={styles.imagePriceValue}>
              {formatRent(property.rent || property.price)}
            </span>
            <span className={styles.imagePriceLabel}>/month</span>
          </div>
        )}

        <button
          className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            requireAuth(() => toggleWishlist(property));
          }}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
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
            {property.city ? `, ${property.city}` : ""}
          </p>

          {/* List View Price */}
          {isListView && (
            <div className={styles.listPrice}>
              <span className={styles.listPriceValue}>
                {formatRent(property.rent || property.price)}
              </span>
              <span className={styles.listPriceLabel}>/month</span>
            </div>
          )}

          {(() => {
            const specs = [];
            if (property.bhk > 0) {
              specs.push({
                key: "bhk",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                ),
                label: `${property.bhk} BHK`,
              });
            }
            if (property.bathrooms > 0) {
              specs.push({
                key: "bath",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12h16M4 12V7a2 2 0 012-2h3M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
                label: `${property.bathrooms} Bath`,
              });
            }
            if (property.area > 0) {
              specs.push({
                key: "area",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                ),
                label: `${property.area.toLocaleString("en-IN")} Sq.Ft.`,
              });
            }
            if (property.furnishing && property.furnishing.trim() !== "") {
              specs.push({
                key: "furnishing",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                ),
                label: property.furnishing,
              });
            }

            const visibleSpecs = isListView || specs.length <= 3 ? specs : specs.slice(0, 2);
            const remainingCount = specs.length - visibleSpecs.length;

            return (
              <div className={styles.listMeta}>
                {visibleSpecs.map((item) => (
                  <span key={item.key} className={styles.metaItem}>
                    {item.icon}
                    {item.label}
                  </span>
                ))}
                {!isListView && remainingCount > 0 && (
                  <span
                    className={styles.moreMetaItem}
                    title={specs.slice(2).map((s) => s.label).join(", ")}
                  >
                    +{remainingCount} more...
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        <div className={styles.cardFooter}>
          {isListView ? (
            <>
              <div className={styles.ownerPanel}>
                <div
                  className={styles.ownerAvatar}
                  style={{
                    background: property.owner?.profilePhoto
                      ? "transparent"
                      : property.owner?.avatarColor || "#007bbd",
                  }}
                >
                  {property.owner?.profilePhoto ? (
                    <img
                      src={property.owner.profilePhoto}
                      alt={property.owner?.name || "Owner"}
                      className={styles.ownerAvatarImg}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className={styles.ownerInitial}>
                      {(property.owner?.name || "Verified Owner")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.ownerInfo}>
                  <span className={styles.ownerName}>
                    <span className={styles.gridOwnerLabel}>Owner: </span>
                    {property.owner?.name || "Verified Direct Owner"}
                  </span>
                  <span className={styles.ownerLabel}>Direct Listing</span>
                </div>
              </div>
              <button
                className={styles.callBtn}
                onClick={(e) => {
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
          ) : (
            /* GRID VIEW FOOTER: Full width Owner info + Contact call button */
            property.owner ? (
              <div className={styles.gridOwnerBar}>
                <div
                  className={styles.gridOwnerLeft}
                  onClick={(e) => {
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className={styles.ownerInitialSmall}>
                        {property.owner.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className={styles.gridOwnerName} title={property.owner.name}>
                    <span className={styles.gridOwnerLabel}>Owner: </span>{property.owner.name}
                  </span>
                </div>
                <button
                  className={styles.gridCallBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    requireAuth(() => setShowEnquiry(true));
                  }}
                  aria-label="Contact Owner"
                  title="Contact Owner"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.gridOwnerBar}>
                <span className={styles.gridOwnerName}>
                  <span className={styles.gridOwnerLabel}>Owner: </span>Verified Owner
                </span>
                <button
                  className={styles.gridCallBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    requireAuth(() => setShowEnquiry(true));
                  }}
                  aria-label="Contact Owner"
                  title="Contact Owner"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                  </svg>
                </button>
              </div>
            )
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
  );
}