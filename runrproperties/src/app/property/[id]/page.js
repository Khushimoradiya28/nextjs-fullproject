"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EnquiryModal from "../../components/EnquiryModal";
import { getPropertyById, searchProperties } from "../../services/api";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import styles from "./propertydetail.module.css";
function formatPrice(price) { if (!price) return "₹ 0"; if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`; if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`; return `₹ ${price.toLocaleString("en-IN")}`; }
function formatDate(d) { if (!d) return ""; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getPropertyById(id);
      if (res.success && (res.property || res.data)) {
        const p = res.property || res.data;
        setProperty(p);
        const sim = await searchProperties({ city: p.city, propertyType: p.type, limit: 4 });
        if (sim.success && sim.properties) setSimilarProperties(sim.properties.filter(x => x.id !== p.id).slice(0, 3));
      } else setError(res.message || "Property not found");
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  useEffect(() => { const h = () => setStickyVisible(window.scrollY > 500); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { if (!lightboxOpen) return; const h = (e) => { if (e.key === "Escape") setLightboxOpen(false); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [lightboxOpen]);

  const handleShare = (type) => {
    const url = window.location.href;
    const text = property ? `${property.title} - ${formatPrice(property.price)}` : "";
    if (type === "copy") navigator.clipboard.writeText(url);
    else if (type === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
    else if (type === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    setShowShare(false);
  };

  // SKELETON LOADING
  if (loading) return (
    <div className={styles.page}><Header /><main className={styles.main}>
      <div className={`${styles.skeleton} ${styles.skeletonGallery}`} />
      <div className={styles.contentGrid}>
        <div className={styles.leftCol}>
          <div className={`${styles.skeleton} ${styles.skeletonHeader}`} />
          <div className={styles.skeletonInfoGrid}>{[1,2,3,4,5,6].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonInfoCard}`} />)}</div>
          <div className={`${styles.skeleton} ${styles.skeletonBlock}`} />
        </div>
        <div className={styles.rightCol}>
          <div className={`${styles.skeleton} ${styles.skeletonSidebar}`} />
          <div className={`${styles.skeleton} ${styles.skeletonSidebar}`} />
        </div>
      </div>
    </main><Footer /></div>
  );

  // ERROR STATE
  if (error || !property) return (
    <div className={styles.page}><Header /><main className={styles.main}>
      <div className={styles.errorState}>
        <div className={styles.errorIcon}><svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
        <h2>Property Not Found</h2>
        <p>{error || "The property you are looking for does not exist."}</p>
        <Link href="/buy" className={styles.backBtn}>Browse Properties</Link>
      </div>
    </main><Footer /></div>
  );

  const liked = isInWishlist(property.id);
  const images = property.images?.length > 0 ? property.images : [property.image || "/img/featured-properties/1.jpg"];
  const owner = property.owner || {};
  const statusClass = property.status === "active" ? styles.statusActive : property.status === "sold" ? styles.statusSold : styles.statusInactive;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href={property.listingType === "rent" ? "/rent" : "/buy"} className={styles.breadcrumbLink}>{property.listingType === "rent" ? "Rent" : "Buy"}</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{property.title}</span>
        </div>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.galleryMain} onClick={() => setLightboxOpen(true)}>
            <img src={images[activeImg]} alt={property.title} />
            <span className={styles.galleryCounter}>{activeImg + 1} / {images.length}</span>
            <div className={styles.galleryActions}>
              <button className={`${styles.galleryActionBtn} ${liked ? styles.liked : ""}`} onClick={(e) => { e.stopPropagation(); toggleWishlist(property); }} aria-label="Wishlist">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={liked ? "#e0245e" : "transparent"} stroke={liked ? "#e0245e" : "#fff"} strokeWidth="1.6" /></svg>
              </button>
              <div className={styles.shareWrap}>
                <button className={styles.galleryActionBtn} onClick={(e) => { e.stopPropagation(); setShowShare(!showShare); }} aria-label="Share">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {showShare && <div className={styles.shareDropdown} onClick={e => e.stopPropagation()}>
                  <button className={styles.shareItem} onClick={() => handleShare("copy")}>Copy Link</button>
                  <button className={styles.shareItem} onClick={() => handleShare("whatsapp")}>WhatsApp</button>
                  <button className={styles.shareItem} onClick={() => handleShare("facebook")}>Facebook</button>
                </div>}
              </div>
            </div>
          </div>
          {images.length > 1 && <>
            <button className={`${styles.galleryNav} ${styles.galleryPrev}`} onClick={() => setActiveImg(p => (p - 1 + images.length) % images.length)}><svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <button className={`${styles.galleryNav} ${styles.galleryNext}`} onClick={() => setActiveImg(p => (p + 1) % images.length)}><svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </>}
        </div>
        {images.length > 1 && <div className={styles.thumbStrip}>{images.map((img, i) => <div key={i} className={`${styles.thumb} ${i === activeImg ? styles.active : ""}`} onClick={() => setActiveImg(i)}><img src={img} alt={`View ${i + 1}`} /></div>)}</div>}

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          <div className={styles.leftCol}>
            {/* Header */}
            <div className={styles.propertyHeader}>
              <div className={styles.headerTop}>
                <div>
                  <div className={styles.headerMeta}>
                    <span className={`${styles.statusBadge} ${statusClass}`}>{property.status || "Active"}</span>
                    <span className={styles.listingBadge}>{property.listingType === "rent" ? "For Rent" : "For Sale"}</span>
                    <span className={styles.postedDate}>Posted {formatDate(property.postedDate)}</span>
                  </div>
                  <h1 className={styles.propertyTitle}>{property.title}</h1>
                  <p className={styles.propertyLocation}>
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-5-8.4-9.1A5.6 5.6 0 0112 4.6a5.6 5.6 0 018.4 7.3C18 16 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.4" /></svg>
                    {property.location}{property.city ? `, ${property.city}` : ""}
                  </p>
                  <span className={styles.propertyId}>ID: {property.id?.slice(-8)?.toUpperCase()}</span>
                </div>
                <div className={styles.priceBox}>
                  <span className={styles.priceValue}>{formatPrice(property.price)}</span>
                  {property.listingType === "rent" && <span className={styles.priceLabel}>/month</span>}
                  {property.listingType === "rent" && property.deposit > 0 && <span className={styles.priceDeposit}>Deposit: {formatPrice(property.deposit)}</span>}
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className={styles.quickInfoGrid}>
              {property.bhk > 0 && <div className={styles.quickInfoCard}><div className={styles.quickInfoIcon}><svg viewBox="0 0 24 24" fill="none"><path d="M3 21V7l9-4 9 4v14M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.5" /></svg></div><span className={styles.quickInfoValue}>{property.bhk} BHK</span><span className={styles.quickInfoLabel}>Bedrooms</span></div>}
              {property.bathrooms > 0 && <div className={styles.quickInfoCard}><div className={styles.quickInfoIcon}><svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16v5a3 3 0 01-3 3H7a3 3 0 01-3-3v-5zM6 12V5a2 2 0 012-2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></div><span className={styles.quickInfoValue}>{property.bathrooms}</span><span className={styles.quickInfoLabel}>Bathrooms</span></div>}
              {property.area > 0 && <div className={styles.quickInfoCard}><div className={styles.quickInfoIcon}><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /></svg></div><span className={styles.quickInfoValue}>{property.area.toLocaleString("en-IN")}</span><span className={styles.quickInfoLabel}>Sq. Ft.</span></div>}
              {property.type && <div className={styles.quickInfoCard}><div className={styles.quickInfoIcon}><svg viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V7l7-4 7 4v14" stroke="currentColor" strokeWidth="1.5" /></svg></div><span className={styles.quickInfoValue}>{property.type}</span><span className={styles.quickInfoLabel}>Type</span></div>}
              {property.furnishing && <div className={styles.quickInfoCard}><div className={styles.quickInfoIcon}><svg viewBox="0 0 24 24" fill="none"><path d="M20 10V7a2 2 0 00-2-2H6a2 2 0 00-2 2v3M4 10v7h16v-7M2 17h20v2H2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></div><span className={styles.quickInfoValue}>{property.furnishing}</span><span className={styles.quickInfoLabel}>Furnishing</span></div>}
              {property.parking && <div className={styles.quickInfoCard}><div className={styles.quickInfoIcon}><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M9 16V8h4a3 3 0 010 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><span className={styles.quickInfoValue}>{property.parking}</span><span className={styles.quickInfoLabel}>Parking</span></div>}
            </div>

            {/* Description */}
            {property.description && <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}><svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Description</h3>
              <p className={styles.descText}>{property.description}</p>
            </div>}

            {/* Amenities */}
            {property.amenities?.length > 0 && <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}><svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Amenities</h3>
              <div className={styles.amenitiesGrid}>{property.amenities.map(a => <div key={a} className={styles.amenityItem}><span className={styles.amenityDot} />{a}</div>)}</div>
            </div>}

            {/* Features */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}><svg viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Property Features</h3>
              <div className={styles.featuresGrid}>
                {property.bhk > 0 && <div className={styles.featureRow}><span className={styles.featureLabel}>Bedrooms</span><span className={styles.featureValue}>{property.bhk}</span></div>}
                {property.bathrooms > 0 && <div className={styles.featureRow}><span className={styles.featureLabel}>Bathrooms</span><span className={styles.featureValue}>{property.bathrooms}</span></div>}
                {property.area > 0 && <div className={styles.featureRow}><span className={styles.featureLabel}>Area</span><span className={styles.featureValue}>{property.area.toLocaleString("en-IN")} Sq.Ft.</span></div>}
                {property.type && <div className={styles.featureRow}><span className={styles.featureLabel}>Type</span><span className={styles.featureValue}>{property.type}</span></div>}
                {property.category && <div className={styles.featureRow}><span className={styles.featureLabel}>Category</span><span className={styles.featureValue}>{property.category}</span></div>}
                {property.listingType && <div className={styles.featureRow}><span className={styles.featureLabel}>Listing</span><span className={styles.featureValue}>{property.listingType === "rent" ? "For Rent" : "For Sale"}</span></div>}
                {property.furnishing && <div className={styles.featureRow}><span className={styles.featureLabel}>Furnishing</span><span className={styles.featureValue}>{property.furnishing}</span></div>}
                {property.parking && <div className={styles.featureRow}><span className={styles.featureLabel}>Parking</span><span className={styles.featureValue}>{property.parking}</span></div>}
                {property.featured && <div className={styles.featureRow}><span className={styles.featureLabel}>Featured</span><span className={styles.featureValue}>Yes</span></div>}
                {property.postedBy && <div className={styles.featureRow}><span className={styles.featureLabel}>Posted By</span><span className={styles.featureValue} style={{textTransform:"capitalize"}}>{property.postedBy}</span></div>}
                {property.availableFrom && <div className={styles.featureRow}><span className={styles.featureLabel}>Available From</span><span className={styles.featureValue}>{formatDate(property.availableFrom)}</span></div>}
              </div>
            </div>

            {/* Location */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}><svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-5-8.4-9.1A5.6 5.6 0 0112 4.6a5.6 5.6 0 018.4 7.3C18 16 12 21 12 21Z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2" /></svg>Location</h3>
              <div className={styles.locationDetails}>
                {property.location && <div className={styles.locationRow}><svg viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V7l7-4 7 4v14" stroke="currentColor" strokeWidth="1.5" /></svg><span>Locality: {property.location}</span></div>}
                {property.city && <div className={styles.locationRow}><svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-5-8.4-9.1A5.6 5.6 0 0112 4.6a5.6 5.6 0 018.4 7.3C18 16 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" /></svg><span>City: {property.city}</span></div>}
                {property.address && <div className={styles.locationRow}><svg viewBox="0 0 24 24" fill="none"><path d="M9 20l-5.4-2.7A1 1 0 013 16.4V5.6a1 1 0 011.4-.9L9 7m0 13l6-3m-6 3V7m6 10l5.6 2.8A1 1 0 0021 18.4V7.6a1 1 0 00-.6-.9L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Address: {property.address}</span></div>}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {owner && owner.name && <div className={styles.ownerCard}>
              <h4 className={styles.ownerCardTitle}>Property Owner</h4>
              <div className={styles.ownerProfile}>
                <div className={styles.ownerAvatar}>{owner.name?.charAt(0)?.toUpperCase()}</div>
                <div className={styles.ownerInfo}><span className={styles.ownerName}>{owner.name}</span><span className={styles.ownerRole}>Owner</span></div>
              </div>
              <div className={styles.ownerDetails}>
                {owner.email && <div className={styles.ownerDetailRow}><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" /><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>{owner.email}</div>}
                {owner.mobile && <div className={styles.ownerDetailRow}><svg viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.9.6 2.8.7a2 2 0 011.7 2z" stroke="currentColor" strokeWidth="1.5" /></svg>{owner.mobile}</div>}
              </div>
              <button className={styles.ownerContactBtn} onClick={() => setShowEnquiry(true)}>Contact Owner</button>
            </div>}
            <div className={styles.enquiryCard}>
              <h4 className={styles.enquiryCardTitle}>Interested in this property?</h4>
              <p className={styles.enquiryCardSub}>Send an enquiry to get more details.</p>
              <button className={styles.enquirySubmitBtn} onClick={() => setShowEnquiry(true)}>Send Enquiry</button>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && <div className={styles.similarSection}>
          <h2 className={styles.similarTitle}>Similar Properties</h2>
          <div className={styles.similarGrid}>{similarProperties.map(p => <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(30,58,95,0.06)", boxShadow: "0 2px 12px rgba(30,58,95,0.04)" }}>
              <div style={{ height: 160 }}><img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" /></div>
              <div style={{ padding: "14px 16px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</h4>
                <p style={{ margin: "0 0 6px", fontSize: "0.8rem", color: "#64748b" }}>{p.location}{p.city ? `, ${p.city}` : ""}</p>
                <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e3a5f" }}>{formatPrice(p.price)}</span>
              </div>
            </div>
          </Link>)}</div>
        </div>}
      </main>

      {/* Sticky Bar */}
      {stickyVisible && <div className={styles.stickyContact}><div className={styles.stickyContactInner}>
        <div><span className={styles.stickyPrice}>{formatPrice(property.price)}</span><span className={styles.stickyTitle}>{property.title}</span></div>
        <div className={styles.stickyActions}>
          <button className={`${styles.stickyBtn} ${styles.stickyBtnSecondary}`} onClick={() => toggleWishlist(property)}>{liked ? "♥ Saved" : "♡ Save"}</button>
          <button className={`${styles.stickyBtn} ${styles.stickyBtnPrimary}`} onClick={() => setShowEnquiry(true)}>Send Enquiry</button>
        </div>
      </div></div>}

      {/* Lightbox */}
      {lightboxOpen && <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
        <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>✕</button>
        <img className={styles.lightboxImage} src={images[activeImg]} alt={property.title} onClick={e => e.stopPropagation()} />
        <span className={styles.lightboxCounter}>{activeImg + 1} / {images.length}</span>
        {images.length > 1 && <>
          <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={e => { e.stopPropagation(); setActiveImg(p => (p - 1 + images.length) % images.length); }}><svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={e => { e.stopPropagation(); setActiveImg(p => (p + 1) % images.length); }}><svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </>}
      </div>}

      {showEnquiry && <EnquiryModal property={property} onClose={() => setShowEnquiry(false)} />}
      <Footer />
    </div>
  );
}
