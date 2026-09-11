"use client";

import { useState } from "react";
import {
  HiOutlineHome,
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlineTag,
} from "react-icons/hi";
import {
  FaBed,
  FaBath,
  FaCouch,
  FaCar,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";
import { PROPERTY_TYPES, CITIES } from "../../constants/propertyOptions";
import styles from "./PropertyForm.module.css";

const amenitiesList = [
  "Parking",
  "Gym",
  "Swimming Pool",
  "Garden",
  "Lift",
  "AC",
  "Club House",
  "Security",
  "Power Backup",
  "Water Supply",
];

const defaultForm = {
  title: "",
  location: "",
  city: "",
  type: "Apartment",
  bhk: "2",
  bathrooms: "1",
  price: "",
  area: "",
  furnishing: "",
  parking: "",
  description: "",
  image: "",
  images: [],
  imageFiles: [],
  existingImages: [],
  amenities: [],
  listingType: "buy",
  category: "Residential",
  featured: false,
  status: "active",
};

export default function PropertyForm({ initialData, onSubmit, submitLabel = "List Property", loading }) {
  const [form, setForm] = useState(() => {
    const init = { ...defaultForm, ...initialData };
    const imgs = [];
    if (init.images && Array.isArray(init.images) && init.images.length > 0) {
      imgs.push(...init.images);
    } else if (init.image) {
      imgs.push(init.image);
    }
    return {
      ...init,
      existingImages: imgs,
      imageFiles: [],
      previewUrls: imgs,
    };
  });
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleListingTypeChange = (type) => {
    setForm((p) => ({ ...p, listingType: type }));
  };

  const toggleAmenity = (a) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a],
    }));
    setErrors((p) => ({ ...p, amenities: "" }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImageError("");
    if (!files.length) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const validFiles = [];
    for (const file of files) {
      if (!allowed.includes(file.type)) {
        setImageError("Only JPG, PNG or WEBP images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Each image must be less than 5 MB.");
        return;
      }
      validFiles.push(file);
    }

    const newPreviewUrls = validFiles.map((f) => URL.createObjectURL(f));

    setForm((p) => {
      const updatedFiles = [...(p.imageFiles || []), ...validFiles];
      const updatedPreviews = [...(p.previewUrls || []), ...newPreviewUrls];
      return {
        ...p,
        imageFiles: updatedFiles,
        previewUrls: updatedPreviews,
        image: updatedPreviews[0] || "",
      };
    });
  };

  const removeImageAt = (index) => {
    setForm((p) => {
      const existingCount = (p.existingImages || []).length;
      let newExisting = [...(p.existingImages || [])];
      let newFiles = [...(p.imageFiles || [])];
      let newPreviews = [...(p.previewUrls || [])];

      if (index < existingCount) {
        newExisting.splice(index, 1);
      } else {
        const fileIndex = index - existingCount;
        newFiles.splice(fileIndex, 1);
      }
      newPreviews.splice(index, 1);

      return {
        ...p,
        existingImages: newExisting,
        imageFiles: newFiles,
        previewUrls: newPreviews,
        image: newPreviews[0] || "",
      };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Property title is required";
    if (!form.city.trim()) e.city = "Please select a city";
    if (!form.location.trim()) e.location = "Locality is required";
    if (!form.price || parseInt(form.price) <= 0) e.price = "Enter a valid amount";
    if (!form.area || parseInt(form.area) <= 0) e.area = "Area (Sq.Ft.) is required";
    if (!form.type) e.type = "Select Property Type";
    if (!form.description || form.description.trim().length < 20) {
      e.description = "Description must be at least 20 characters";
    }
    if (form.amenities.length === 0) {
      e.amenities = "Select at least one amenity";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.formPartitionLayout}>
        {/* Left Column: Core Specs, Location & Pricing */}
        <div className={styles.leftCol}>
          {/* Card 1: Basic Details */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionIconBadge}>
                <HiOutlineHome />
              </div>
              <div className={styles.sectionHeaderText}>
                <h3 className={styles.formSectionTitle}>Basic Details</h3>
                <p className={styles.formSectionSubtitle}>Core information about your listing</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              {/* Property Title */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>
                  Property Title <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    name="title"
                    className={styles.formInput}
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Luxurious 3 BHK Garden Facing Apartment"
                  />
                </div>
                {errors.title && <span className={styles.fieldError}>✕ {errors.title}</span>}
              </div>

              {/* Listing Type Segmented Switch */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Listing Type <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.segmentedGroup}>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${form.listingType === "buy" ? styles.segmentedBtnActive : ""}`}
                    onClick={() => handleListingTypeChange("buy")}
                  >
                    <HiOutlineTag /> Buy
                  </button>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${form.listingType === "rent" ? styles.segmentedBtnActive : ""}`}
                    onClick={() => handleListingTypeChange("rent")}
                  >
                    <FaBuilding /> Rent
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Property Type <span className={styles.requiredStar}>*</span>
                </label>
                <select name="type" className={styles.formSelect} value={form.type} onChange={handleChange}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.type && <span className={styles.fieldError}>✕ {errors.type}</span>}
              </div>

              {/* Category */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Category <span className={styles.requiredStar}>*</span>
                </label>
                <select name="category" className={styles.formSelect} value={form.category} onChange={handleChange}>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaBed style={{ color: "#007bbd", fontSize: "0.82rem" }} /> Bedrooms (BHK)
                </label>
                <select name="bhk" className={styles.formSelect} value={form.bhk} onChange={handleChange}>
                  <option value="0">Studio / 0 BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaBath style={{ color: "#007bbd", fontSize: "0.82rem" }} /> Bathrooms
                </label>
                <select name="bathrooms" className={styles.formSelect} value={form.bathrooms} onChange={handleChange}>
                  <option value="0">None</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              {/* Furnishing */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaCouch style={{ color: "#007bbd", fontSize: "0.82rem" }} /> Furnishing
                </label>
                <select name="furnishing" className={styles.formSelect} value={form.furnishing} onChange={handleChange}>
                  <option value="">Select Furnishing</option>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi Furnished">Semi Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
              </div>

              {/* Parking */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaCar style={{ color: "#007bbd", fontSize: "0.82rem" }} /> Parking
                </label>
                <select name="parking" className={styles.formSelect} value={form.parking} onChange={handleChange}>
                  <option value="">Select Parking</option>
                  <option value="Covered">Covered</option>
                  <option value="Open">Open</option>
                  <option value="Both">Both Covered & Open</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Location & Pricing Grid */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionIconBadge}>
                <HiOutlineLocationMarker />
              </div>
              <div className={styles.sectionHeaderText}>
                <h3 className={styles.formSectionTitle}>Location & Pricing</h3>
                <p className={styles.formSectionSubtitle}>Address, cost, and area dimensions</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  City <span className={styles.requiredStar}>*</span>
                </label>
                <select name="city" className={styles.formSelect} value={form.city} onChange={handleChange}>
                  <option value="">Select City</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && <span className={styles.fieldError}>✕ {errors.city}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Locality / Area <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    name="location"
                    className={styles.formInput}
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. SG Highway"
                  />
                </div>
                {errors.location && <span className={styles.fieldError}>✕ {errors.location}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {form.listingType === "rent" ? "Monthly Rent (₹)" : "Price (₹)"}{" "}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>₹</span>
                  <input
                    name="price"
                    type="number"
                    className={`${styles.formInput} ${styles.formInputWithIcon}`}
                    value={form.price}
                    onChange={handleChange}
                    placeholder={form.listingType === "rent" ? "25000" : "8500000"}
                  />
                </div>
                {errors.price && <span className={styles.fieldError}>✕ {errors.price}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Area (Sq.Ft.) <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    name="area"
                    type="number"
                    className={styles.formInput}
                    value={form.area}
                    onChange={handleChange}
                    placeholder="1450"
                  />
                </div>
                {errors.area && <span className={styles.fieldError}>✕ {errors.area}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media, Amenities, Description, and Publish */}
        <div className={styles.rightCol}>
          {/* Card 3: Photo Upload */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionIconBadge}>
                <HiOutlinePhotograph />
              </div>
              <div className={styles.sectionHeaderText}>
                <h3 className={styles.formSectionTitle}>Property Photos</h3>
                <p className={styles.formSectionSubtitle}>Upload multiple photos (JPG/PNG/WEBP, Max 5MB each)</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.uploadDropzone}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className={styles.hiddenFileInput}
                  onChange={handleImages}
                />
                <div className={styles.dropzoneIconWrapper}>
                  <HiOutlineUpload />
                </div>
                <p className={styles.dropzoneMainText}>
                  Drop images or <span className={styles.dropzoneBrowse}>Browse files</span>
                </p>
                <p className={styles.dropzoneSubText}>Select single or multiple photos (Max: 5MB per file)</p>
              </div>

              {imageError && <span className={styles.fieldError}>✕ {imageError}</span>}

              {form.previewUrls && form.previewUrls.length > 0 && (
                <div className={styles.multiImagePreviewGrid}>
                  {form.previewUrls.map((url, idx) => (
                    <div key={idx} className={styles.multiImagePreviewCard}>
                      <img src={url} alt={`Upload preview ${idx + 1}`} />
                      {idx === 0 && <span className={styles.coverBadge}>Cover Photo</span>}
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => removeImageAt(idx)}
                        title="Remove Image"
                        aria-label="Remove Image"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Amenities */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionIconBadge}>
                <HiOutlineSparkles />
              </div>
              <div className={styles.sectionHeaderText}>
                <h3 className={styles.formSectionTitle}>Amenities</h3>
                <p className={styles.formSectionSubtitle}>Facilities included with property</p>
              </div>
            </div>

            <div className={styles.amenitiesGrid}>
              {amenitiesList.map((a) => {
                const active = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.amenityChip} ${active ? styles.amenityChipActive : ""}`}
                    onClick={() => toggleAmenity(a)}
                  >
                    {active ? (
                      <FaCheckCircle className={styles.amenityCheck} />
                    ) : (
                      <HiOutlineCheck className={styles.amenityUncheck} />
                    )}
                    <span>{a}</span>
                  </button>
                );
              })}
            </div>
            {errors.amenities && <span className={styles.fieldError} style={{ marginTop: 8 }}>✕ {errors.amenities}</span>}
          </div>

          {/* Card 5: Description & Publish Status */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeaderWrapper}>
              <div className={styles.sectionIconBadge}>
                <HiOutlineDocumentText />
              </div>
              <div className={styles.sectionHeaderText}>
                <h3 className={styles.formSectionTitle}>Description & Status</h3>
                <p className={styles.formSectionSubtitle}>Overview and listing visibility</p>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 14 }}>
              <label className={styles.formLabel}>
                Overview <span className={styles.requiredStar}>*</span>
              </label>
              <textarea
                name="description"
                className={styles.formTextarea}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe property features, landmarks, nearby transit..."
              />
              {errors.description && <span className={styles.fieldError}>✕ {errors.description}</span>}
            </div>

            <div
              className={`${styles.featureToggleBox} ${form.featured ? styles.featureToggleActive : ""}`}
              onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
              style={{ marginBottom: 14 }}
            >
              <div className={styles.featureInfo}>
                <span className={styles.featureTitle}>🌟 Feature Listing</span>
                <span className={styles.featureDesc}>Highlight unit on homepage</span>
              </div>
              <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 20 }}>
              <label className={styles.formLabel}>Listing Visibility</label>
              <select name="status" className={styles.formSelect} value={form.status || "active"} onChange={handleChange}>
                <option value="active">Active (Visible)</option>
                <option value="inactive">Draft (Hidden)</option>
                <option value="sold">Sold / Off Market</option>
              </select>
            </div>

            {/* Submit Action */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{submitLabel}</span>
                  <HiOutlineHome style={{ fontSize: "1.1rem" }} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

