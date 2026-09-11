"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { getPropertyById, updateProperty } from "../../../services/api";
import { showWishlistToast } from "../../../components/WishlistToast";
import PropertyForm from "../../components/PropertyForm";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import DashboardSidebar from "../../../components/DashboardSidebar";
import profileStyles from "../../../profile/profile.module.css";
import styles from "../../add-property/addproperty.module.css";

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = useParams();
  const { loading: authLoading, isAuthenticated, isOwner } = useAuth();
  const [property, setProperty] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOwner)) router.push("/login");
  }, [authLoading, isAuthenticated, isOwner, router]);

  const [isSoldOrInactive, setIsSoldOrInactive] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getPropertyById(id);
      if (res.success && res.property) {
        const p = res.property;
        if (p.status === "sold" || p.status === "inactive") {
          setIsSoldOrInactive(true);
          setError("This property is currently marked as Sold/Inactive. Please Reactivate it first from My Properties to edit.");
        }
        setProperty({
          title: p.title || "",
          type: p.type || "Apartment",
          listingType: p.listingType || "buy",
          category: p.category || "Residential",
          city: p.city || "",
          location: p.location || "",
          bhk: String(p.bhk || 0),
          bathrooms: String(p.bathrooms || 0),
          price: String(p.price || ""),
          area: String(p.area || ""),
          furnishing: p.furnishing || "",
          parking: p.parking || "",
          description: p.description || "",
          amenities: p.amenities || [],
          image: p.image || "",
          images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
          featured: p.featured || false,
          status: p.status || "active",
        });
      } else {
        setError("Property not found");
      }
      setFetching(false);
    }
    if (id) load();
  }, [id]);

  const handleSubmit = async (formData) => {
    setError("");
    setSubmitting(true);
    const res = await updateProperty(id, formData);
    setSubmitting(false);
    if (res.success) {
      showWishlistToast("Property updated successfully.", "added");
      setTimeout(() => router.push("/dashboard/my-properties"), 1000);
    } else {
      setError(res.message || "Failed to update property.");
      showWishlistToast("Failed to update property.", "removed");
    }
  };

  if (authLoading || fetching) return null;

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
          <Link href="/dashboard/my-properties" className={profileStyles.breadcrumbLink}>My Properties</Link>
          <span className={profileStyles.breadcrumbSep}>/</span>
          <span className={profileStyles.breadcrumbCurrent}>Edit Property</span>
        </div>

        <main className={profileStyles.main}>
          <DashboardSidebar activeOverride="/dashboard/my-properties" />

          <div className={profileStyles.content}>
            <div className={styles.pageHeader}>
              <div className={styles.pageTitleWrapper}>
                <div>
                  <h1 className={styles.pageTitle}>Edit Property</h1>
                  <p className={styles.pageSubtitle}>Update listing details, pricing, photos or features</p>
                </div>
                <span className={styles.titleBadge}>Listing Editor</span>
              </div>
            </div>
            {error && <div className={styles.errorMsg}><span>✕</span> {error}</div>}
            {isSoldOrInactive ? (
              <div style={{
                background: "#ffffff",
                border: "1px solid #fed7aa",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                marginTop: "20px"
              }}>
                <h3 style={{ color: "#9a3412", marginBottom: "10px" }}>Property is Sold / Inactive</h3>
                <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "0.95rem" }}>
                  To edit the details of this property, please reactivate it first.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={async () => {
                      setSubmitting(true);
                      const res = await updateProperty(id, { status: "active" });
                      setSubmitting(false);
                      if (res.success) {
                        setIsSoldOrInactive(false);
                        setError("");
                        showWishlistToast("Property reactivated successfully!", "added");
                      } else {
                        showWishlistToast("Failed to reactivate.", "removed");
                      }
                    }}
                    disabled={submitting}
                    style={{
                      background: "#007bbd",
                      color: "#fff",
                      border: "none",
                      padding: "10px 22px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {submitting ? "Reactivating..." : "Reactivate Property"}
                  </button>
                  <Link
                    href="/dashboard/my-properties"
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      textDecoration: "none",
                      padding: "10px 22px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center"
                    }}
                  >
                    Back to My Properties
                  </Link>
                </div>
              </div>
            ) : (
              property && <PropertyForm initialData={property} onSubmit={handleSubmit} submitLabel="Update Property" loading={submitting} />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
