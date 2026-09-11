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

const ITEMS_PER_PAGE = 5;

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatPrice(price) {
  if (!price) return "";
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`;
  return `₹ ${price.toLocaleString("en-IN")}`;
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
  const { loading, isAuthenticated, isOwner } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isOwner)) router.push("/login");
  }, [loading, isAuthenticated, isOwner, router]);

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
      showWishlistToast("Status updated.", "added");
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

  // Pagination
  const totalPages = Math.ceil(enquiries.length / ITEMS_PER_PAGE);
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return enquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [enquiries, currentPage]);

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
              <h1 className={styles.pageTitle}>Received Enquiries</h1>
              <p className={styles.pageSubtitle}>{enquiries.length} enquiries from buyers</p>
            </div>

            {/* Loading State */}
            {fetching && (
              <div className={styles.skeletonWrap}>
                {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
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
                    return (
                      <div key={enq._id} className={styles.enquiryCard}>
                        <div className={styles.cardImage}>
                          <img src={getImage(prop)} alt={prop.title || "Property"} loading="lazy" />
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.cardTop}>
                            <h3 className={styles.propTitle}>{prop.title || "Property"}</h3>
                            {(prop.locality || prop.city) && (
                              <p className={styles.propLocation}>{prop.locality}{prop.city ? `, ${prop.city}` : ""}</p>
                            )}
                            {prop.price > 0 && <span className={styles.propPrice}>{formatPrice(prop.price)}</span>}
                          </div>
                          <p className={styles.messageText}>
                            <strong>{buyer.name || enq.name}:</strong> {enq.message}
                          </p>
                          <p className={styles.propLocation} style={{margin: "2px 0 0"}}>
                            {enq.mobile && <span>📞 {enq.mobile}</span>}
                            {enq.email && <span> &nbsp; ✉️ {enq.email}</span>}
                          </p>
                          <div className={styles.cardMeta}>
                            <select
                              value={enq.status || "Pending"}
                              onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                              disabled={updatingId === enq._id}
                              className={styles.statusSelect}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <span className={styles.dateText}>{formatDate(enq.createdAt)}</span>
                          </div>
                        </div>
                        <div className={styles.cardActions}>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(enq._id)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
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
                <h3>No enquiries yet</h3>
                <p>When buyers enquire about your properties, they will appear here.</p>
              </div>
            )}
          </>
        )}
          </div>
        </main>
      </div>
      <Footer />
      {deleteId && <ConfirmModal title="Delete Enquiry" message="Are you sure you want to delete this enquiry?" confirmText="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />}
    </div>
  );
}
