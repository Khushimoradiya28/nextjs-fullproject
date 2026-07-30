"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "../../context/WishlistContext";
import PremiumEnquiryModal from "../../components/PremiumEnquiryModal";
import styles from "./RentPropertyCard.module.css";

function formatRent(rent) {
  if (!rent) return "₹ 0";
  return `₹ ${rent.toLocaleString("en-IN")}`;
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function RentPropertyCard({ property, viewMode }) {
  const router = useRouter();
  
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const liked = isInWishlist(property.id);
  const isListView = viewMode === "list";

  return (
    <article className={`${styles.card} ${isListView ? styles.cardList : ""}`} onClick={() => router.push(`/property/${property.id}`)} style={{ cursor: "pointer" }}>
      <div className={styles.cardImageWrap}>
        {property.featured && <span className={styles.featuredBadge}>Featured</span>}
        <div className={styles.cardImage}>
          <img src={property.image} alt={property.title} className={styles.cardImg} loading="lazy" />
        </div>
        <button
          className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(property); }}
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
              <path d="M12 21s-6.2-5.2-8.4-9.1A5.6 5.6 0 0 1 12 4.6a5.6 5.6 0 0 1 8.4 7.3C18.2 15.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <circle cx="12" cy="11.2" r="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
            {property.location}{property.city ? `, ${property.city}` : ""}
          </p>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.priceBlock}>
            <span className={styles.rentValue}>{formatRent(property.rent || property.price)}</span>
            <span className={styles.rentLabel}>/month</span>
          </div>
          <button className={styles.contactIconBtn} onClick={(e) => { e.stopPropagation(); setShowEnquiry(true); }} aria-label="Contact Owner" title="Contact Owner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
          </button>
        </div>
      </div>

      {showEnquiry && <PremiumEnquiryModal property={property} onClose={() => setShowEnquiry(false)} />}
    </article>
  );
}
