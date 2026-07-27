"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useWishlist } from "../../context/WishlistContext";
import EnquiryModal from "../../components/EnquiryModal";
import { searchProperties } from "../../services/api";
import styles from "./city.module.css";

const ITEMS_PER_PAGE = 6;

const cityInfo = {
  ahmedabad: { name: "Ahmedabad", description: "Explore premium residential and commercial listings in Ahmedabad." },
  surat: { name: "Surat", description: "Discover curated homes and investment opportunities in Surat." },
  vadodara: { name: "Vadodara", description: "Browse luxury apartments and family homes in Vadodara." },
  rajkot: { name: "Rajkot", description: "Find the finest properties available in Rajkot." },
  gandhinagar: { name: "Gandhinagar", description: "See premium plots and ready-to-move homes in Gandhinagar." },
  bhavnagar: { name: "Bhavnagar", description: "Explore curated options for homes and plots in Bhavnagar." },
};

function formatPrice(price) {
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`;
  return `₹ ${price.toLocaleString("en-IN")}`;
}

function PropertyCard({ property }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const liked = isInWishlist(property.id);

  return (
    <article className={styles.card}>
      <div className={styles.cardImageWrap}>
        <img src={property.image || "/img/buy-properties/1.jpg"} alt={property.title} className={styles.cardImg} loading="lazy" />
        <span className={styles.badge}>{property.type}</span>
        <button className={`${styles.likeBtn} ${liked ? styles.liked : ""}`} onClick={() => toggleWishlist(property)} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={liked ? "#e0245e" : "transparent"} stroke={liked ? "none" : "#ffffff"} strokeWidth="1.6" />
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{property.title}</h3>
        <p className={styles.cardLocation}>{property.location}{property.city ? `, ${property.city}` : ""}</p>
        <div className={styles.cardDetails}>
          {property.bhk > 0 && <span>{property.bhk} BHK</span>}
          {property.area > 0 && <span>{property.area.toLocaleString("en-IN")} Sq.Ft.</span>}
        </div>
        <p className={styles.cardPrice}>{formatPrice(property.price)}</p>
        <button className={styles.enquiryBtn} onClick={() => setShowEnquiry(true)}>Enquiry</button>
      </div>
      {showEnquiry && <EnquiryModal property={property} onClose={() => setShowEnquiry(false)} />}
    </article>
  );
}

export default function CityPage() {
  const params = useParams();
  const slug = params.slug;
  const city = cityInfo[slug] || { name: slug.charAt(0).toUpperCase() + slug.slice(1), description: `Browse properties in ${slug.charAt(0).toUpperCase() + slug.slice(1)}.` };

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      const res = await searchProperties({ city: city.name, status: "active", limit: "100" });
      if (res.success && res.properties) {
        setProperties(res.properties);
      } else {
        setProperties([]);
      }
      setLoading(false);
    }
    loadProperties();
  }, [city.name]);

  // Pagination
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return properties.slice(start, start + ITEMS_PER_PAGE);
  }, [properties, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>← Back to Home</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{city.name}</span>
          </div>
          <h1 className={styles.heroTitle}>Properties in {city.name}</h1>
          <p className={styles.heroText}>{city.description}</p>
        </section>

        {loading ? (
          <div className={styles.cardsGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.card} style={{ opacity: 0.5, minHeight: 320 }}>
                <div className={styles.cardImageWrap} style={{ background: "#e2e8f0" }} />
                <div className={styles.cardBody}>
                  <div style={{ height: 16, background: "#e2e8f0", borderRadius: 6, marginBottom: 10, width: "70%" }} />
                  <div style={{ height: 12, background: "#e2e8f0", borderRadius: 6, width: "50%" }} />
                </div>
              </div>
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
            <h3>No properties available in {city.name}</h3>
            <p>Check back soon for new listings.</p>
            <Link href="/" className={styles.browseCta}>Back to Home</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
