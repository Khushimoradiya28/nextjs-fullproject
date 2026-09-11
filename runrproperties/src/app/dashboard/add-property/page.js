"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { addProperty } from "../../services/api";
import { showWishlistToast } from "../../components/WishlistToast";
import PropertyForm from "../components/PropertyForm";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DashboardSidebar from "../../components/DashboardSidebar";
import profileStyles from "../../profile/profile.module.css";
import styles from "./addproperty.module.css";

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isOwner } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isOwner)) router.push("/login");
  }, [loading, isAuthenticated, isOwner, router]);

  const handleSubmit = async (formData) => {
    setError("");
    setSubmitting(true);
    const result = await addProperty({
      ...formData,
      price: parseInt(formData.price),
      area: parseInt(formData.area),
      bhk: parseInt(formData.bhk),
      bathrooms: parseInt(formData.bathrooms),
    });
    setSubmitting(false);

    if (result.success) {
      showWishlistToast("Property added successfully.", "added");
      setTimeout(() => router.push("/dashboard/my-properties"), 1000);
    } else {
      setError(result.message || "Failed to save property.");
      showWishlistToast("Failed to save property.", "removed");
    }
  };

  if (loading || !user) return null;

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
          <span className={profileStyles.breadcrumbCurrent}>Add Property</span>
        </div>

        <main className={profileStyles.main}>
          <DashboardSidebar />

          <div className={profileStyles.content}>
            <div className={styles.pageHeader}>
              <div className={styles.pageTitleWrapper}>
                <div>
                  <h1 className={styles.pageTitle}>Add New Property</h1>
                  <p className={styles.pageSubtitle}>Fill in the details below to publish your residential or commercial listing</p>
                </div>
                <span className={styles.titleBadge}>Owner Portal</span>
              </div>
            </div>
            {error && <div className={styles.errorMsg}><span>✕</span> {error}</div>}
            <PropertyForm onSubmit={handleSubmit} submitLabel="List Property" loading={submitting} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
