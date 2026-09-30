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
  HiOutlineCalendar,
  HiOutlineChevronRight,
} from "react-icons/hi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DashboardSidebar from "../components/DashboardSidebar";
import profileStyles from "../profile/profile.module.css";
import styles from "./dashboard.module.css";

function formatPrice(price, listingType = "buy") {
  if (price === undefined || price === null || price === "" || price === 0) return "";
  const num = Number(price);
  if (isNaN(num) || num <= 0) return "";
  if (num >= 10000000) {
    const cr = num / 10000000;
    const formatted = parseFloat(cr.toFixed(2));
    return `₹ ${formatted} Cr`;
  }
  if (num >= 100000) {
    const lac = num / 100000;
    const formatted = parseFloat(lac.toFixed(2));
    return `₹ ${formatted} Lac`;
  }
  if (num > 0 && num <= 500 && listingType === "buy") {
    const formatted = parseFloat(num.toFixed(2));
    return `₹ ${formatted} Lac`;
  }
  return `₹ ${num.toLocaleString("en-IN")}`;
}

function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dateStr}, ${timeStr}`;
}

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getRoleDetails(buyer, s) {
  const role = (buyer?.role || "buyer").toLowerCase();
  if (role === "owner") {
    return { label: "Owner", className: s.roleowner || "" };
  }
  if (role === "agent") {
    return { label: "Agent", className: s.roleagent || "" };
  }
  if (role === "admin") {
    return { label: "Admin", className: s.roleadmin || "" };
  }
  if (role === "bank_partner") {
    return { label: "Bank Partner", className: s.rolebank_partner || "" };
  }
  return { label: "Buyer", className: s.rolebuyer || "" };
}

function getStatusClass(status, s) {
  if (!status) return s.statusPending;
  if (status.includes("Called")) return s.statusCalled;
  if (status.includes("Discussion") || status === "Contacted") return s.statusDiscussion;
  if (status.includes("Site Visit")) return s.statusSiteVisit;
  if (status.includes("Deal Won") || status.includes("Won")) return s.statusDealWon;
  if (status.includes("Not Interested") || status === "Closed") return s.statusNotInterested;
  return s[`status${status}`] || s.statusPending;
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
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (user?.role === "bank_partner") {
        router.replace("/bank-partner/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, router]);

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

  if (loading || !user || user.role === "admin" || user.role === "bank_partner") {
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
        <Link href="/dashboard/my-properties?status=all" className={styles.statCard}>
          <div className={styles.statIconBadge}>
            <HiOutlineHome />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{properties.length}</span>
            <span className={styles.statLabel}>Total Properties</span>
          </div>
        </Link>
        <Link href="/dashboard/my-properties?status=active" className={styles.statCard}>
          <div className={styles.statIconBadge} style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#059669" }}>
            <HiOutlineCheckCircle />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{active.length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
        </Link>
        <Link href="/dashboard/my-properties?status=sold" className={styles.statCard}>
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

      <div className={styles.dashboard2ColGrid}>
        {/* Left Column: Recent Properties (Top 3) */}
        <div className={styles.recentSection} style={{ marginBottom: 0 }}>
          <div className={styles.recentHeader}>
            <h3>Recent Properties</h3>
            <Link href="/dashboard/my-properties" className={styles.viewAll}>
              View All <HiOutlineExternalLink />
            </Link>
          </div>
          {properties.length > 0 ? (
            <div className={styles.recentList}>
              {properties.slice(0, 3).map((p) => {
                const propId = p._id || p.id;
                return (
                  <Link
                    key={propId}
                    href="/dashboard/my-properties"
                    className={styles.compactRowCard}
                    title="Click to view and manage in My Properties"
                  >
                    {/* Left: Property Image Thumbnail */}
                    <div className={styles.rowThumbWrap}>
                      <img src={getImage(p)} alt={p.title} className={styles.rowThumbImg} />
                    </div>

                    {/* Right: Details beside image */}
                    <div className={styles.rowContent}>
                      <div className={styles.rowLine1}>
                        <div className={styles.rowTitleWrap}>
                          <strong className={styles.rowTitle}>{p.title}</strong>
                          {propId && (
                            <span className={styles.propIdBadge}>
                              #{propId?.slice(-8)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className={styles.rowMetaRight}>
                          <span className={`${styles.statusBadge} ${styles[`status${p.status || "active"}`]}`}>
                            {p.status || "active"}
                          </span>
                          <span className={styles.dateBadge}>
                            <HiOutlineCalendar /> {formatDate(p.createdAt)}
                          </span>
                          <span className={styles.rowArrow}>
                            <HiOutlineChevronRight />
                          </span>
                        </div>
                      </div>

                      <div className={styles.rowLine2}>
                        {(p.locality || p.location || p.city) && (
                          <span className={styles.rowSubtitle}>
                            <HiOutlineLocationMarker /> {p.locality || p.location}{p.city ? `, ${p.city}` : ""}
                          </span>
                        )}
                        {p.price > 0 && (
                          <span className={styles.rowPrice}>
                            • {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>No properties added yet.</p>
          )}
        </div>

        {/* Right Column: Recent Enquiries (Top 3) */}
        <div className={styles.recentSection} style={{ marginBottom: 0 }}>
          <div className={styles.recentHeader}>
            <h3>Recent Enquiries</h3>
            <Link href="/dashboard/enquiries" className={styles.viewAll}>
              View All <HiOutlineExternalLink />
            </Link>
          </div>
          {enquiries.length > 0 ? (
            <div className={styles.recentList}>
              {enquiries.slice(0, 3).map((e) => {
                const prop = e.property || {};
                const buyer = e.buyer || {};
                const buyerInitial = (e.name || "B").charAt(0).toUpperCase();
                const roleInfo = getRoleDetails(buyer, styles);
                return (
                  <Link
                    key={e._id}
                    href="/dashboard/enquiries"
                    className={styles.compactRowCard}
                    title="Click to view full lead details in Enquiries"
                  >
                    {/* Left: Avatar spanning row */}
                    <div className={styles.rowAvatarWrap}>
                      <span>{buyerInitial}</span>
                    </div>

                    {/* Right: Info */}
                    <div className={styles.rowContent}>
                      <div className={styles.rowLine1}>
                        <div className={styles.rowTitleWrap}>
                          <strong className={styles.rowTitle}>{e.name}</strong>
                          <span className={`${styles.buyerBadge} ${roleInfo.className}`}>
                            {roleInfo.label}
                          </span>
                        </div>
                        <div className={styles.rowMetaRight}>
                          <span className={`${styles.statusBadge} ${getStatusClass(e.status, styles)}`}>
                            {e.status || "Pending"}
                          </span>
                          <span className={styles.dateBadge} title={formatDateTime(e.createdAt)}>
                            <HiOutlineCalendar /> {formatDate(e.createdAt)}
                          </span>
                          <span className={styles.rowArrow}>
                            <HiOutlineChevronRight />
                          </span>
                        </div>
                      </div>

                      {/* Line 2: Property context & message snippet */}
                      <div className={styles.rowLine2}>
                        <span className={styles.rowForTag}>
                          For: <strong>{prop.title || "Property"}</strong>
                          {(prop.id || prop._id) && (
                            <span className={styles.propIdBadge}>
                              #{(prop.id || prop._id)?.slice(-8)?.toUpperCase()}
                            </span>
                          )}
                        </span>
                        {e.message && (
                          <span className={styles.rowMsgSnippet}>
                            • "{e.message}"
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>No enquiries received yet.</p>
          )}
        </div>
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

      <div className={styles.dashboard2ColGrid}>
        <div className={styles.recentSection} style={{ marginBottom: 0 }}>
          <div className={styles.recentHeader}>
            <h3>Recent Saved</h3>
            <Link href="/wishlist" className={styles.viewAll}>
              View All <HiOutlineExternalLink />
            </Link>
          </div>
          {wishlist.length > 0 ? (
            <div className={styles.recentList}>
              {wishlist.slice(0, 3).map((p) => {
                const propId = p.id || p._id;
                const propDetailLink = `/property/${propId}`;
                return (
                  <Link
                    key={propId}
                    href={propDetailLink}
                    className={styles.compactRowCard}
                    title="Click to view property"
                  >
                    <div className={styles.rowThumbWrap}>
                      <img src={p.image || "/img/buy-properties/1.jpg"} alt={p.title} className={styles.rowThumbImg} />
                    </div>
                    <div className={styles.rowContent}>
                      <div className={styles.rowLine1}>
                        <div className={styles.rowTitleWrap}>
                          <strong className={styles.rowTitle}>{p.title}</strong>
                        </div>
                        <div className={styles.rowMetaRight}>
                          {p.category && <span className={styles.categoryTag}>{p.category}</span>}
                          <span className={styles.rowArrow}>
                            <HiOutlineChevronRight />
                          </span>
                        </div>
                      </div>
                      <div className={styles.rowLine2}>
                        <span className={styles.rowSubtitle}>
                          <HiOutlineLocationMarker /> {p.location}{p.city ? `, ${p.city}` : ""}
                        </span>
                        {p.price > 0 && (
                          <span className={styles.rowPrice}>
                            • {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>No saved properties.</p>
          )}
        </div>

        <div className={styles.recentSection} style={{ marginBottom: 0 }}>
          <div className={styles.recentHeader}>
            <h3>Recent Enquiries</h3>
            <Link href="/dashboard/my-enquiries" className={styles.viewAll}>
              View All <HiOutlineExternalLink />
            </Link>
          </div>
          {enquiries.length > 0 ? (
            <div className={styles.recentList}>
              {enquiries.slice(0, 3).map((e) => {
                const prop = e.property || {};
                return (
                  <Link
                    key={e._id}
                    href="/dashboard/my-enquiries"
                    className={styles.compactRowCard}
                    title="Click to view enquiry in My Enquiries"
                  >
                    {/* Left: Thumbnail */}
                    <div className={styles.rowThumbWrap}>
                      <img src={getImage(prop)} alt={prop.title || ""} className={styles.rowThumbImg} />
                    </div>

                    {/* Right: Details beside image */}
                    <div className={styles.rowContent}>
                      <div className={styles.rowLine1}>
                        <div className={styles.rowTitleWrap}>
                          <strong className={styles.rowTitle}>{prop.title || "Property Enquiry"}</strong>
                          {(prop.id || prop._id) && (
                            <span className={styles.propIdBadge}>
                              #{(prop.id || prop._id)?.slice(-8)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className={styles.rowMetaRight}>
                          <span className={`${styles.statusBadge} ${getStatusClass(e.status, styles)}`}>
                            {e.status || "Pending"}
                          </span>
                          <span className={styles.dateBadge}>
                            <HiOutlineCalendar /> {formatDate(e.createdAt)}
                          </span>
                          <span className={styles.rowArrow}>
                            <HiOutlineChevronRight />
                          </span>
                        </div>
                      </div>

                      {e.message && (
                        <div className={styles.rowLine2}>
                          <span className={styles.rowMsgSnippet}>
                            "{e.message}"
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>No enquiries sent.</p>
          )}
        </div>
      </div>
    </>
  );
}
