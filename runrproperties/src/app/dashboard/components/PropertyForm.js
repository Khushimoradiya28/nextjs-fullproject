"use client";

import { useState } from "react";
import { PROPERTY_TYPES, CITIES } from "../../constants/propertyOptions";
import styles from "./PropertyForm.module.css";

const amenitiesList = ["Parking", "Gym", "Swimming Pool", "Garden", "Lift", "AC", "Club House", "Security", "Power Backup", "Water Supply"];

const defaultForm = {
  title: "", location: "", city: "", type: "Apartment", bhk: "2", bathrooms: "1",
  price: "", area: "", furnishing: "", parking: "", description: "",
  image: "", amenities: [], listingType: "buy", category: "Residential", featured: false,
};

export default function PropertyForm({ initialData, onSubmit, submitLabel, loading }) {
  const [form, setForm] = useState({ ...defaultForm, ...initialData });
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const toggleAmenity = (a) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a],
    }));
    setErrors((p) => ({ ...p, amenities: "" }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImageError("");
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setImageError("Only JPG, PNG or WEBP images are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setImageError("Image size must be less than 5 MB."); return; }
    setForm((p) => ({ ...p, image: URL.createObjectURL(file), imageFile: file }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.location.trim()) e.location = "Locality is required";
    if (!form.price || parseInt(form.price) <= 0) e.price = "Please enter a valid amount";
    if (!form.area || parseInt(form.area) <= 0) e.area = "Area is required";
    if (!form.type) e.type = "Select Property Type";
    if (!form.description || form.description.trim().length < 20) e.description = "Description must be at least 20 characters";
    if (form.amenities.length === 0) e.amenities = "At least one amenity is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Basic Details</h3>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.formLabel}>Property Title *</label>
              <input name="title" className={styles.formInput} value={form.title} onChange={handleChange} placeholder="e.g. 3 BHK Luxury Apartment" />
              {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Listing Type *</label>
              <select name="listingType" className={styles.formSelect} value={form.listingType} onChange={handleChange}>
                <option value="buy">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Property Type *</label>
              <select name="type" className={styles.formSelect} value={form.type} onChange={handleChange}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <span className={styles.fieldError}>{errors.type}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category *</label>
              <select name="category" className={styles.formSelect} value={form.category} onChange={handleChange}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Bedrooms</label>
              <select name="bhk" className={styles.formSelect} value={form.bhk} onChange={handleChange}>
                <option value="0">N/A</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Bathrooms</label>
              <select name="bathrooms" className={styles.formSelect} value={form.bathrooms} onChange={handleChange}>
                <option value="0">N/A</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Furnishing</label>
              <select name="furnishing" className={styles.formSelect} value={form.furnishing} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Parking</label>
              <select name="parking" className={styles.formSelect} value={form.parking} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Covered">Covered</option>
                <option value="Open">Open</option>
                <option value="Both">Both</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Location</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>City *</label>
              <select name="city" className={styles.formSelect} value={form.city} onChange={handleChange}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Locality *</label>
              <input name="location" className={styles.formInput} value={form.location} onChange={handleChange} placeholder="e.g. SG Highway" />
              {errors.location && <span className={styles.fieldError}>{errors.location}</span>}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Pricing & Area</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{form.listingType === "rent" ? "Monthly Rent (₹) *" : "Price (₹) *"}</label>
              <input name="price" type="number" className={styles.formInput} value={form.price} onChange={handleChange} placeholder="e.g. 8500000" />
              {errors.price && <span className={styles.fieldError}>{errors.price}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Area (Sq.Ft.) *</label>
              <input name="area" type="number" className={styles.formInput} value={form.area} onChange={handleChange} placeholder="e.g. 1200" />
              {errors.area && <span className={styles.fieldError}>{errors.area}</span>}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Amenities *</h3>
          <div className={styles.amenitiesGrid}>
            {amenitiesList.map((a) => (
              <button key={a} type="button" className={`${styles.amenityChip} ${form.amenities.includes(a) ? styles.amenityChipActive : ""}`} onClick={() => toggleAmenity(a)}>{a}</button>
            ))}
          </div>
          {errors.amenities && <span className={styles.fieldError}>{errors.amenities}</span>}
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Property Image</h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Upload (JPG/PNG/WEBP, max 5MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" className={styles.formInput} onChange={handleImage} />
            {imageError && <span className={styles.fieldError}>{imageError}</span>}
            {form.image && !form.image.startsWith("blob:") && (
              <div className={styles.imagePreview}><img src={form.image} alt="Preview" /></div>
            )}
            {form.image && form.image.startsWith("blob:") && (
              <div className={styles.imagePreview}><img src={form.image} alt="Preview" /></div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Description *</h3>
          <div className={styles.formGroup}>
            <textarea name="description" className={styles.formTextarea} value={form.description} onChange={handleChange} placeholder="Describe your property (min 20 chars)..." />
            {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm(p => ({...p, featured: e.target.checked}))} />
              <span className={styles.formLabel} style={{margin:0}}>Mark as Featured Property</span>
            </label>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          <span>{loading ? "Processing..." : submitLabel}</span>
        </button>
      </form>
    </div>
  );
}
