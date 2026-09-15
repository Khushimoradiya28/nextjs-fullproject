"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWishlist } from "../context/WishlistContext";
import { searchProperties } from "../services/api";
import styles from "./FeaturedProperties.module.css";

function formatPrice(price) {
  if (price >= 10000000) {
    return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹ ${(price / 100000).toFixed(0)} Lakh`;
  }
  return `₹ ${price.toLocaleString("en-IN")}`;
}

function PropertyCard({ item }) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const liked = isInWishlist(item.id);

  const toggleLike = (e) => {
    e.stopPropagation();
    toggleWishlist(item);
  };

  return (
    <article className={styles.propertyCard} onClick={() => router.push(`/property/${item.id}`)} style={{ cursor: "pointer" }}>
      <div className={styles.cardImage}>
        <img
          src={item.image || "/img/featured-properties/1.jpg"}
          alt={item.title}
          className={styles.cardImg}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/img/featured-properties/1.jpg";
          }}
        />
        <button
          className={liked ? `${styles.cardActionOverlay} ${styles.liked}` : styles.cardActionOverlay}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          onClick={toggleLike}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={liked ? '#e0245e' : 'transparent'}
              stroke={liked ? 'none' : '#ffffff'}
              strokeWidth={1.6}
            />
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <h3 className={styles.cardTitle}>{item.title}</h3>
        </div>
        <p className={styles.cardLocation}>{item.location}{item.city ? `, ${item.city}` : ""}</p>
        <div className={styles.cardMeta}>
          <span className={styles.cardBadge}>{item.listingType === "rent" ? "Rent" : "Sale"}</span>
          {item.bhk > 0 && <span className={styles.cardBhk}>{item.bhk} BHK</span>}
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>{formatPrice(item.price)}</span>
          {item.area > 0 && <span className={styles.cardSize}>{item.area.toLocaleString("en-IN")} Sq.Ft.</span>}
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  const needsSlider = properties.length > 3;

  // Fetch featured properties from backend
  useEffect(() => {
    async function loadFeatured() {
      const res = await searchProperties({ featured: "true", status: "active", limit: "12" });
      if (res.success && res.properties && res.properties.length > 0) {
        setProperties(res.properties);
      }
      setLoading(false);
    }
    loadFeatured();
  }, []);

  // Smooth auto-scroll using requestAnimationFrame
  useEffect(() => {
    if (!needsSlider) return;
    const track = trackRef.current;
    if (!track) return;

    const speed = 1.5;

    const animate = () => {
      if (!isPausedRef.current) {
        positionRef.current += speed;
        if (positionRef.current >= track.scrollWidth / 2) {
          positionRef.current = 0;
        }
        track.style.transform = `translateX(-${positionRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [properties, needsSlider]);

  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => { isPausedRef.current = false; };

  const handlePrev = () => {
    isPausedRef.current = true;
    const cardWidth = 320;
    const targetPosition = Math.max(0, positionRef.current - cardWidth);

    const startPosition = positionRef.current;
    const distance = startPosition - targetPosition;
    const duration = 400;
    const startTime = performance.now();

    const smoothScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      positionRef.current = startPosition - (distance * ease);
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${positionRef.current}px)`;
      }

      if (progress < 1) {
        requestAnimationFrame(smoothScroll);
      } else {
        positionRef.current = targetPosition;
        setTimeout(() => { isPausedRef.current = false; }, 2500);
      }
    };
    requestAnimationFrame(smoothScroll);
  };

  const handleNext = () => {
    isPausedRef.current = true;
    const cardWidth = 320;
    const targetPosition = positionRef.current + cardWidth;

    const startPosition = positionRef.current;
    const distance = targetPosition - startPosition;
    const duration = 400;
    const startTime = performance.now();

    const smoothScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      positionRef.current = startPosition + (distance * ease);
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${positionRef.current}px)`;
      }

      if (progress < 1) {
        requestAnimationFrame(smoothScroll);
      } else {
        positionRef.current = targetPosition;
        setTimeout(() => { isPausedRef.current = false; }, 2500);
      }
    };
    requestAnimationFrame(smoothScroll);
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.featuredHeader}>
        <div className={styles.sectionTitleBlock}>
          <span className={styles.sectionTag}>✦ Hand-Picked</span>
          <h2 className={styles.sectionTitle}>Featured Properties</h2>
          <div className={styles.titleUnderline} />
        </div>
        <a href="/buy" className={styles.viewAllLink}>View All <span>→</span></a>
      </div>

      {needsSlider && (
        <div className={styles.sliderControls}>
          <button
            type="button"
            className={styles.sliderButton}
            onClick={handlePrev}
            aria-label="Show previous featured properties"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.sliderButton}
            onClick={handleNext}
            aria-label="Show next featured properties"
          >
            →
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.featuredGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.propertyCard} style={{ opacity: 0.5 }}>
              <div className={styles.cardImage} style={{ background: "#e2e8f0" }} />
              <div className={styles.cardBody}>
                <div style={{ height: 16, background: "#e2e8f0", borderRadius: 6, marginBottom: 8, width: "70%" }} />
                <div style={{ height: 12, background: "#e2e8f0", borderRadius: 6, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className={styles.carouselWrapper}>
          <div
            ref={trackRef}
            className={styles.carouselTrack}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {properties.map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
            {properties.map((item) => (
              <PropertyCard key={`clone-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No Featured Properties Available</p>
        </div>
      )}
    </section>
  );
}
