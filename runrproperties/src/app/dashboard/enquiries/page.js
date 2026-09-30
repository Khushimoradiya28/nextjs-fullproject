"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getReceivedEnquiries, updateEnquiryStatus, deleteEnquiry } from "../../services/api";
import { showWishlistToast } from "../../components/WishlistToast";
import ConfirmModal from "../../components/ConfirmModal";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DashboardSidebar from "../../components/DashboardSidebar";
import profileStyles from "../../profile/profile.module.css";
import styles from "./enquiries.module.css";
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineTrash,
  HiOutlineChatAlt2,
} from "react-icons/hi";

const ITEMS_PER_PAGE = 10;

const LEAD_STATUS_OPTIONS = [
  { value: "Pending", label: "🟡 New / Pending" },
  { value: "Called - No Answer", label: "📞 Call Kiya (No Answer)" },
  { value: "In Discussion", label: "💬 In Discussion" },
  { value: "Site Visit Scheduled", label: "🏡 Site Visit Scheduled" },
  { value: "Deal Won", label: "🎉 Deal Won (Success)" },
  { value: "Not Interested", label: "❌ Not Interested (Failed)" },
];

function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dateStr}, ${timeStr}`;
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

function getImage(prop) {
  if (!prop) return "/img/buy-properties/1.jpg";
  if (prop.images && prop.images.length > 0) {
    return prop.images[0];
  }
  if (prop.image) return prop.image;
  return "/img/buy-properties/1.jpg";
}

export default function EnquiriesPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isOwner } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (user?.role === "bank_partner") {
        router.replace("/bank-partner/dashboard");
      } else if (!isOwner) {
        router.replace("/profile");
      }
    }
  }, [loading, isAuthenticated, user, isOwner, router]);

  const fetchEnquiries = async () => {
    setFetching(true);
    setError("");
    const res = await getReceivedEnquiries();
    if (res.success) {
      setEnquiries(res.enquiries || []);
    } else {
      setError(res.message || "Failed to load enquiries.");
    }
    setFetching(false);
  };

  useEffect(() => {
    if (isAuthenticated && isOwner) fetchEnquiries();
  }, [isAuthenticated, isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (enquiryId, status) => {
    setUpdatingId(enquiryId);
    const res = await updateEnquiryStatus(enquiryId, status);
    setUpdatingId(null);
    if (res.success) {
      setEnquiries((p) => p.map((e) => e._id === enquiryId ? { ...e, status } : e));
      showWishlistToast("Lead status updated.", "added");
    } else {
      showWishlistToast(res.message || "Failed to update.", "removed");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteEnquiry(deleteId);
    setDeleting(false);
    if (res.success) {
      setEnquiries((p) => p.filter((e) => e._id !== deleteId));
      showWishlistToast("Enquiry deleted.", "removed");
    } else {
      showWishlistToast(res.message || "Failed to delete.", "removed");
    }
    setDeleteId(null);
  };

  // Filtered enquiries by status
  const filteredEnquiries = useMemo(() => {
    if (statusFilter === "all") return enquiries;
    return enquiries.filter((e) => {
      const s = (e.status || "Pending").toLowerCase();
      const f = statusFilter.toLowerCase();
      if (f === "pending") return s === "pending";
      if (f === "called") return s.includes("called");
      if (f === "discussion") return s.includes("discussion") || s === "contacted";
      if (f === "sitevisit") return s.includes("site visit");
      if (f === "dealwon") return s.includes("deal won") || s === "won";
      if (f === "notinterested") return s.includes("not interested") || s === "closed";
      return s === f;
    });
  }, [enquiries, statusFilter]);

  // Counts for tabs
  const counts = useMemo(() => {
    const all = enquiries.length;
    const pending = enquiries.filter(e => (e.status || "Pending") === "Pending").length;
    const called = enquiries.filter(e => (e.status || "").toLowerCase().includes("called")).length;
    const discussion = enquiries.filter(e => {
      const s = (e.status || "").toLowerCase();
      return s.includes("discussion") || s === "contacted";
    }).length;
    const sitevisit = enquiries.filter(e => (e.status || "").toLowerCase().includes("site visit")).length;
    const dealwon = enquiries.filter(e => {
      const s = (e.status || "").toLowerCase();
      return s.includes("deal won") || s === "won";
    }).length;
    const notinterested = enquiries.filter(e => {
      const s = (e.status || "").toLowerCase();
      return s.includes("not interested") || s === "closed";
    }).length;

    return { all, pending, called, discussion, sitevisit, dealwon, notinterested };
  }, [enquiries]);

  // Pagination
  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE);
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnquiries, currentPage]);

  const handleTabChange = (tab) => {
    setStatusFilter(tab);
    setCurrentPage(1);
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
    <div className={profileStyles.page}>
      <Header />
      <div className={profileStyles.pageContainer}>
        {/* Breadcrumb Header */}
        <div className={profileStyles.breadcrumbBar}>
          <Link href="/" className={profileStyles.breadcrumbLink}>Home</Link>
          <span className={profileStyles.breadcrumbSep}>/</span>
          <Link href="/dashboard" className={profileStyles.breadcrumbLink}>Dashboard</Link>
          <span className={profileStyles.breadcrumbSep}>/</span>
          <span className={profileStyles.breadcrumbCurrent}>Received Enquiries</span>
        </div>

        <main className={profileStyles.main}>
          <DashboardSidebar />

          <div className={profileStyles.content}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>Received Enquiries & Leads</h1>
                <p className={styles.pageSubtitle}>{enquiries.length} total lead enquiries from prospective buyers</p>
              </div>
            </div>

            {/* Status Pipeline Filter Tabs */}
            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "all" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("all")}
              >
                All <span className={styles.tabBadge}>{counts.all}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "pending" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("pending")}
              >
                🟡 New / Pending <span className={styles.tabBadge}>{counts.pending}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "called" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("called")}
              >
                📞 Called <span className={styles.tabBadge}>{counts.called}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "discussion" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("discussion")}
              >
                💬 In Discussion <span className={styles.tabBadge}>{counts.discussion}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "sitevisit" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("sitevisit")}
              >
                🏡 Site Visit <span className={styles.tabBadge}>{counts.sitevisit}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "dealwon" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("dealwon")}
              >
                🎉 Deal Won <span className={styles.tabBadge}>{counts.dealwon}</span>
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${statusFilter === "notinterested" ? styles.filterTabActive : ""}`}
                onClick={() => handleTabChange("notinterested")}
              >
                ❌ Not Interested <span className={styles.tabBadge}>{counts.notinterested}</span>
              </button>
            </div>

            {/* Loading State */}
            {fetching && (
              <div className={styles.skeletonWrap}>
                {[1, 2, 3, 4].map(i => <div key={i} className={styles.skeletonCard} />)}
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
                <button className={styles.retryBtn} onClick={fetchEnquiries}>Retry</button>
              </div>
            )}

            {/* Content */}
            {!fetching && !error && (
              <>
                {paginatedEnquiries.length > 0 ? (
                  <>
                    <div className={styles.enquiryList}>
                      {paginatedEnquiries.map((enq) => {
                        const prop = enq.property || {};
                        const buyer = enq.buyer || {};
                        const buyerName = buyer.name || enq.name || "Interested Buyer";
                        const buyerInitial = buyerName.charAt(0).toUpperCase();
                        const propId = prop._id || prop.id;
                        const propDetailLink = propId ? `/property/${propId}` : "#";
                        const currentStatus = enq.status || "Pending";
                        const statusClass = getStatusClass(currentStatus, styles);
                        const roleInfo = getRoleDetails(buyer, styles);

                        return (
                          <div key={enq._id} className={styles.enquiryCard}>
                            {/* Card Top: Property Context & Lead Status */}
                            <div className={styles.cardHeader}>
                              <div className={styles.propSummary}>
                                <Link href={propDetailLink} className={styles.propThumb}>
                                  <img src={getImage(prop)} alt={prop.title || "Property"} loading="lazy" />
                                </Link>
                                <div className={styles.propDetails}>
                                  <div className={styles.propTitleRow}>
                                    <Link href={propDetailLink} className={styles.propTitle}>
                                      {prop.title || "Property"}
                                    </Link>
                                    {propId && (
                                      <span className={styles.propIdBadge}>
                                        #{propId.slice(-8).toUpperCase()}
                                      </span>
                                    )}
                                    {prop.price > 0 && (
                                      <span className={styles.propPrice}>{formatPrice(prop.price)}</span>
                                    )}
                                  </div>
                                  {(prop.locality || prop.location || prop.city) && (
                                    <span className={styles.propLocation}>
                                      <HiOutlineLocationMarker /> {prop.locality || prop.location}{prop.city ? `, ${prop.city}` : ""}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right Actions: Status Dropdown, Date/Time, Delete */}
                              <div className={styles.cardActions}>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                                  disabled={updatingId === enq._id}
                                  className={`${styles.statusSelect} ${statusClass}`}
                                  title="Update Lead Pipeline Status"
                                >
                                  {LEAD_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                  {!LEAD_STATUS_OPTIONS.some(o => o.value === currentStatus) && (
                                    <option value={currentStatus}>{currentStatus}</option>
                                  )}
                                </select>

                                <span className={styles.dateBadge} title={formatDateTime(enq.createdAt)}>
                                  <HiOutlineCalendar /> {formatDateTime(enq.createdAt)}
                                </span>

                                <button
                                  type="button"
                                  className={styles.deleteBtn}
                                  onClick={() => setDeleteId(enq._id)}
                                  title="Delete Enquiry"
                                >
                                  <HiOutlineTrash />
                                </button>
                              </div>
                            </div>

                            {/* Divider Line */}
                            <div className={styles.cardDivider} />

                            {/* Card Bottom: Buyer Info & Message Quote */}
                            <div className={styles.cardFooter}>
                              <div className={styles.buyerSection}>
                                <span className={styles.buyerAvatar}>{buyerInitial}</span>
                                <div className={styles.buyerInfo}>
                                  <div className={styles.buyerNameRow}>
                                    <strong className={styles.buyerName}>{buyerName}</strong>
                                    <span className={`${styles.buyerBadge} ${roleInfo.className}`}>
                                      {roleInfo.label}
                                    </span>
                                  </div>
                                  <div className={styles.buyerContacts}>
                                    {(enq.mobile || enq.phone || buyer.phone) && (
                                      <a
                                        href={`tel:${enq.mobile || enq.phone || buyer.phone}`}
                                        className={styles.contactItem}
                                        title="Click to Call"
                                      >
                                        <HiOutlinePhone /> {enq.mobile || enq.phone || buyer.phone}
                                      </a>
                                    )}
                                    {(enq.email || buyer.email) && (
                                      <a
                                        href={`mailto:${enq.email || buyer.email}`}
                                        className={styles.contactItem}
                                        title="Click to Email"
                                      >
                                        <HiOutlineMail /> {enq.email || buyer.email}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Message Quote */}
                              {enq.message && (
                                <div className={styles.messageBox} title={enq.message}>
                                  <HiOutlineChatAlt2 className={styles.msgIcon} />
                                  <span className={styles.msgText}>"{enq.message}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className={styles.paginationWrap}>
                        <div className={styles.paginationInfo}>
                          Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEnquiries.length)}</strong> of <strong>{filteredEnquiries.length}</strong> enquiries
                        </div>
                        <div className={styles.paginationControls}>
                          <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={currentPage === 1}
                            onClick={() => {
                              setCurrentPage(p => p - 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            ← Previous
                          </button>
                          <div className={styles.pageNumbers}>
                            {getPageNumbers().map(num => (
                              <button
                                key={num}
                                type="button"
                                className={`${styles.pageNum} ${num === currentPage ? styles.pageNumActive : ""}`}
                                onClick={() => {
                                  setCurrentPage(num);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={currentPage === totalPages}
                            onClick={() => {
                              setCurrentPage(p => p + 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.empty}>
                    <h3>No enquiries found</h3>
                    <p>
                      {statusFilter === "all"
                        ? "When buyers enquire about your properties, they will appear here."
                        : `No enquiries found under "${statusFilter}".`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
      {deleteId && (
        <ConfirmModal
          title="Delete Enquiry"
          message="Are you sure you want to delete this enquiry?"
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
