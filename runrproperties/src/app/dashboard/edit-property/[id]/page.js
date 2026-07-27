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

  useEffect(() => {
    async function load() {
      const res = await getPropertyById(id);
      if (res.success && res.property) {
        const p = res.property;
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
          featured: p.featured || false,
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
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard/my-properties" className={styles.breadcrumbLink}>← Back to My Properties</Link>
          </div>
          <h1 className={styles.pageTitle}>Edit Property</h1>
        </div>
        {error && <div className={styles.errorMsg}>{error}</div>}
        {property && <PropertyForm initialData={property} onSubmit={handleSubmit} submitLabel="Update Property" loading={submitting} />}
      </main>
      <Footer />
    </div>
  );
}
