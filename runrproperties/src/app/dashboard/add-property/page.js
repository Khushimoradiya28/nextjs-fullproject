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
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <Link href="/profile" className={styles.breadcrumbLink}>Profile</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>Add Property</span>
          </div>
          <h1 className={styles.pageTitle}>Add New Property</h1>
        </div>
        {error && <div className={styles.errorMsg}>{error}</div>}
        <PropertyForm onSubmit={handleSubmit} submitLabel="List Property" loading={submitting} />
      </main>
      <Footer />
    </div>
  );
}
