"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getMyProperties, getReceivedEnquiries, getMyEnquiries, getWishlist } from "../services/api";
import {
  HiOutlineHome,
  HiOutlineCheckCircle,
  HiOutlineArchive,
  HiOutlineMail,
  HiOutlineHeart,
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineExternalLink,
  HiOutlineLocationMarker,
  HiOutlinePencilAlt,
  HiOutlineEye,
} from "react-icons/hi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DashboardSidebar from "../components/DashboardSidebar";
import profileStyles from "../profile/profile.module.css";
import styles from "./dashboard.module.css";

function formatPrice(price) {
  if (!price) return "";
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`;
  return `₹ ${price.toLocaleString("en-IN")}`;
}

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getImage(prop) {
  if (!prop) return "/img/buy-properties/1.jpg";
  if (prop.images && prop.images.length > 0) {
    return prop.images[0];
  }
  if (prop.image) return prop.image;
  return "/img/buy-properties/1.jpg";
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, isOwner, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      if (isOwner) {
        const [propsRes, enqRes] = await Promise.all([getMyProperties(), getReceivedEnquiries()]);
        if (!propsRes.success && !enqRes.success) {
          setError("Failed to load dashboard data. Please try again.");
        } else {
          setStats({
            properties: propsRes.success ? (propsRes.properties || []) : [],
            enquiries: enqRes.success ? (enqRes.enquiries || []) : [],
          });
        }
      } else {
        const [wishRes, enqRes] = await Promise.all([getWishlist(), getMyEnquiries()]);
        if (!wishRes.success && !enqRes.success) {
          setError("Failed to load dashboard data. Please try again.");
        } else {
          setStats({
            wishlist: wishRes.success ? (wishRes.wishlist || []) : [],
            enquiries: enqRes.success ? (enqRes.enquiries || []) : [],
          });
        }
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setFetching(false);
  }, [isOwner]);

  useEffect(() => {
    if (isAuthenticated && pathname === "/dashboard") fetchData();
  }, [isAuthenticated, pathname, fetchData]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && pathname === "/dashboard") {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [pathname, fetchData]);

  const handleLogout = () => { logout(); router.push("/"); };

  if (loading || !user) {
    return (
      <div className={profileStyles.page}>
        <Header />
        <div className={profileStyles.pageContainer}>
          <main className={profileStyles.main}>
            <aside className={profileStyles.sidebar}>
              <div className={styles.skelAvatar} />
              <div className={styles.skelLine} />
              <div className={styles.skelLineShort} />
            </aside>
            <div className={profileStyles.content}>
              <div className={styles.skeleton}><div className={styles.skelRow}><div className={styles.skelCard} /><div className={styles.skelCard} /><div className={styles.skelCard} /></div><div className={styles.skelBlock} /></div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={profileStyles.page}>
      <Header />
      <div className={profileStyles.pageContainer}>
        {/* Breadcrumb Header */}
        <div className={profileStyles.breadcrumbBar}>
          <Link href="/" className={profileStyles.breadcrumbLink}>Home</Link>
          <span className={profileStyles.breadcrumbSep}>/</span>
          <span className={profileStyles.breadcrumbCurrent}>Dashboard</span>
        </div>

        <main className={profileStyles.main}>
          <DashboardSidebar />

          <div className={profileStyles.content}>
            {fetching ? (
              <div className={styles.skeleton}><div className={styles.skelRow}><div className={styles.skelCard} /><div className={styles.skelCard} /><div className={styles.skelCard} /><div className={styles.skelCard} /></div><div className={styles.skelBlock} /><div className={styles.skelBlock} /></div>
            ) : error ? (
              <div className={styles.errorState}>
                <div className={styles.errorIcon}><svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className={styles.retryBtn} onClick={fetchData}>Retry</button>
              </div>
            ) : isOwner ? (
              <OwnerDashboard stats={stats} />
            ) : (
              <BuyerDashboard stats={stats} />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function OwnerDashboard({ stats }) {
  const { properties, enquiries } = stats;
  const active = properties.filter(p => p.status === "active");
  const inactive = properties.filter(p => p.status !== "active");

  return (
    <>
      <div className={styles.statsGrid}>
        <Link href="/dashboard/my-properties" className={styles.statCard}>
          <div className={styles.statIconBadge}>
            <HiOutlineHome />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{properties.length}</span>
            <span className={styles.statLabel}>Total Properties</span>
          </div>
        </Link>
        <Link href="/dashboard/my-properties" className={styles.statCard}>
          <div className={styles.statIconBadge} style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#059669" }}>
            <HiOutlineCheckCircle />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{active.length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </Link>
        <Link href="/dashboard/my-properties" className={styles.statCard}>
          <div className={styles.statIconBadge} style={{ background: "#fef3c7", borderColor: "#fde68a", color: "#d97706" }}>
            <HiOutlineArchive />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{inactive.length}</span>
            <span className={styles.statLabel}>Sold/Inactive</span>
          </div>
        </Link>
        <Link href="/dashboard/enquiries" className={styles.statCard}>
          <div className={styles.statIconBadge} style={{ background: "#fdf2f8", borderColor: "#fbcfe8", color: "#db2777" }}>
            <HiOutlineMail />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{enquiries.length}</span>
            <span className={styles.statLabel}>Enquiries</span>
          </div>
        </Link>
      </div>

      <div className={styles.actionsRow}>
        <Link href="/dashboard/add-property" className={styles.actionBtn}>
          <HiOutlinePlusCircle style={{ fontSize: "1.1rem" }} /> Add Property
        </Link>
        <Link href="/dashboard/my-properties" className={styles.actionBtnOutline}>
          <HiOutlineHome /> My Properties
        </Link>
        <Link href="/dashboard/enquiries" className={styles.actionBtnOutline}>
          <HiOutlineMail /> Enquiries
        </Link>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h3>Recent Properties</h3>
          <Link href="/dashboard/my-properties" className={styles.viewAll}>
            View All <HiOutlineExternalLink />
          </Link>
        </div>
        {properties.length > 0 ? (
          <div className={styles.recentList}>
            {properties.slice(0, 5).map((p) => {
              const propId = p._id || p.id;
              const propDetailLink = `/property/${propId}`;
              return (
                <div key={propId} className={styles.recentCard}>
                  <Link href={propDetailLink} className={styles.recentImg}>
                    <img src={getImage(p)} alt={p.title} />
                  </Link>
                  <div className={styles.recentBody}>
                    <div className={styles.recentTopMeta}>
                      <span className={`${styles.statusBadge} ${styles[`status${p.status || "active"}`]}`}>
                        {p.status || "active"}
                      </span>
                      {p.category && <span className={styles.categoryTag}>{p.category}</span>}
                      {p.purpose && <span className={styles.categoryTag}>For {p.purpose}</span>}
                    </div>

                    <Link href={propDetailLink} style={{ textDecoration: "none" }}>
                      <h4 className={styles.recentTitle}>{p.title}</h4>
                    </Link>
                    
                    <p className={styles.recentMeta}>
                      <HiOutlineLocationMarker />
                      {p.locality || p.location}{p.city ? `, ${p.city}` : ""}
                    </p>

                    <div className={styles.recentSpecs}>
                      {p.bedrooms ? <span className={styles.specChip}>{p.bedrooms} BHK</span> : null}
                      {p.bathrooms ? <span className={styles.specChip}>{p.bathrooms} Bath</span> : null}
                      {p.area ? <span className={styles.specChip}>{p.area} sq.ft</span> : null}
                    </div>

                    <div className={styles.recentRow}>
                      <span className={styles.recentPrice}>{formatPrice(p.price)}</span>
                      {p.createdAt && <span className={styles.dateText}>Added {formatDate(p.createdAt)}</span>}
                    </div>
                  </div>

                  <div className={styles.recentActions}>
                    <Link href={`/dashboard/edit-property/${propId}`} className={styles.miniBtnPrimary}>
                      <HiOutlinePencilAlt /> Edit
                    </Link>
                    <Link href={propDetailLink} className={styles.miniBtn}>
                      <HiOutlineEye /> View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyText}>No properties added yet.</p>
        )}
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h3>Recent Enquiries</h3>
          <Link href="/dashboard/enquiries" className={styles.viewAll}>
            View All <HiOutlineExternalLink />
          </Link>
        </div>
        {enquiries.length > 0 ? (
          <div className={styles.recentList}>
            {enquiries.slice(0, 5).map((e) => {
              const prop = e.property || {};
              return (
                <div key={e._id} className={styles.recentCard}>
                  <div className={styles.recentImg}>
                    <img src={getImage(prop)} alt={prop.title || ""} />
                  </div>
                  <div className={styles.recentBody}>
                    <div className={styles.recentTopMeta}>
                      <span className={`${styles.statusBadge} ${styles[`status${e.status || "Pending"}`]}`}>
                        {e.status || "Pending"}
                      </span>
                      <span className={styles.dateText}>{formatDate(e.createdAt)}</span>
                    </div>

                    <h4 className={styles.recentTitle}>{prop.title || "Property Enquiry"}</h4>
                    
                    <p className={styles.recentMeta}>
                      <strong>{e.name}</strong> &bull; {e.email || e.phone || ""}
                    </p>

                    <p className={styles.recentMeta} style={{ color: "#334155" }}>
                      "{e.message?.substring(0, 90)}{e.message?.length > 90 ? "..." : ""}"
                    </p>
                  </div>

                  <div className={styles.recentActions}>
                    <Link href="/dashboard/enquiries" className={styles.miniBtn}>
                      View Enquiry
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyText}>No enquiries received yet.</p>
        )}
      </div>
    </>
  );
}

function BuyerDashboard({ stats }) {
  const { wishlist, enquiries } = stats;

  return (
    <>
      <div className={styles.statsGrid}>
        <Link href="/wishlist" className={styles.statCard}>
          <div className={styles.statIconBadge} style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#ef4444" }}>
            <HiOutlineHeart />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{wishlist.length}</span>
            <span className={styles.statLabel}>Saved Properties</span>
          </div>
        </Link>
        <Link href="/dashboard/my-enquiries" className={styles.statCard}>
          <div className={styles.statIconBadge}>
            <HiOutlineClipboardList />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{enquiries.length}</span>
            <span className={styles.statLabel}>Enquiries Sent</span>
          </div>
        </Link>
      </div>

      <div className={styles.actionsRow}>
        <Link href="/buy" className={styles.actionBtn}>Browse Buy</Link>
        <Link href="/rent" className={styles.actionBtnOutline}>Browse Rent</Link>
        <Link href="/wishlist" className={styles.actionBtnOutline}>Wishlist</Link>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h3>Recent Saved</h3>
          <Link href="/wishlist" className={styles.viewAll}>
            View All <HiOutlineExternalLink />
          </Link>
        </div>
        {wishlist.length > 0 ? (
          <div className={styles.recentList}>
            {wishlist.slice(0, 5).map((p) => {
              const propId = p.id || p._id;
              const propDetailLink = `/property/${propId}`;
              return (
                <div key={propId} className={styles.recentCard}>
                  <Link href={propDetailLink} className={styles.recentImg}>
                    <img src={p.image || "/img/buy-properties/1.jpg"} alt={p.title} />
                  </Link>
                  <div className={styles.recentBody}>
                    <div className={styles.recentTopMeta}>
                      {p.category && <span className={styles.categoryTag}>{p.category}</span>}
                      {p.purpose && <span className={styles.categoryTag}>For {p.purpose}</span>}
                    </div>
                    <Link href={propDetailLink} style={{ textDecoration: "none" }}>
                      <h4 className={styles.recentTitle}>{p.title}</h4>
                    </Link>
                    <p className={styles.recentMeta}>
                      <HiOutlineLocationMarker />
                      {p.location}{p.city ? `, ${p.city}` : ""}
                    </p>
                    <div className={styles.recentRow}>
                      <span className={styles.recentPrice}>{formatPrice(p.price)}</span>
                    </div>
                  </div>
                  <div className={styles.recentActions}>
                    <Link href={propDetailLink} className={styles.miniBtnPrimary}>
                      <HiOutlineEye /> View Property
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyText}>No saved properties.</p>
        )}
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h3>Recent Enquiries</h3>
          <Link href="/dashboard/my-enquiries" className={styles.viewAll}>
            View All <HiOutlineExternalLink />
          </Link>
        </div>
        {enquiries.length > 0 ? (
          <div className={styles.recentList}>
            {enquiries.slice(0, 5).map((e) => {
              const prop = e.property || {};
              return (
                <div key={e._id} className={styles.recentCard}>
                  <div className={styles.recentImg}>
                    <img src={getImage(prop)} alt={prop.title || ""} />
                  </div>
                  <div className={styles.recentBody}>
                    <div className={styles.recentTopMeta}>
                      <span className={`${styles.statusBadge} ${styles[`status${e.status || "Pending"}`]}`}>
                        {e.status || "Pending"}
                      </span>
                      <span className={styles.dateText}>{formatDate(e.createdAt)}</span>
                    </div>
                    <h4 className={styles.recentTitle}>{prop.title || "Property Enquiry"}</h4>
                    <p className={styles.recentMeta}>
                      "{e.message?.substring(0, 80)}{e.message?.length > 80 ? "..." : ""}"
                    </p>
                  </div>
                  <div className={styles.recentActions}>
                    <Link href="/dashboard/my-enquiries" className={styles.miniBtn}>
                      View Status
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyText}>No enquiries sent.</p>
        )}
      </div>
    </>
  );
}
