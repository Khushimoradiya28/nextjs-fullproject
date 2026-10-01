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
  HiOutlineCalendar,
  HiOutlineClock,
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
  availableFrom: "",
  possessionStatus: "Ready to Move",
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

  const [priceUnit, setPriceUnit] = useState(() => {
    const rawPrice = initialData?.price;
    const lType = initialData?.listingType || "buy";
    if (lType === "rent") return "rupees";
    if (!rawPrice) return "lac";
    const num = Number(rawPrice);
    if (num >= 10000000) return "cr";
    if (num >= 100000) return "lac";
    if (num > 0 && num <= 500) return "lac";
    return "rupees";
  });

  const [priceDisplay, setPriceDisplay] = useState(() => {
    const rawPrice = initialData?.price;
    const lType = initialData?.listingType || "buy";
    if (!rawPrice && rawPrice !== 0) return "";
    const num = Number(rawPrice);
    if (isNaN(num) || num <= 0) return "";
    if (lType === "rent") {
      if (num >= 100000 && num % 100000 === 0) return String(num / 100000);
      return String(num);
    }
    if (num >= 10000000) {
      const cr = num / 10000000;
      return String(cr % 1 === 0 ? cr : parseFloat(cr.toFixed(2)));
    }
    if (num >= 100000) {
      const lac = num / 100000;
      return String(lac % 1 === 0 ? lac : parseFloat(lac.toFixed(2)));
    }
    return String(num);
  });

  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");

  const calculateFinalRupees = (val, unit) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return 0;
    if (unit === "cr") return Math.round(num * 10000000);
    if (unit === "lac") return Math.round(num * 100000);
    if (unit === "thousand") return Math.round(num * 1000);
    return Math.round(num);
  };

  const handlePriceValueChange = (e) => {
    const val = e.target.value;
    setPriceDisplay(val);
    const finalVal = calculateFinalRupees(val, priceUnit);
    setForm((p) => ({ ...p, price: finalVal ? String(finalVal) : "" }));
    setErrors((p) => ({ ...p, price: "" }));
  };

  const handlePriceUnitChange = (e) => {
    const newUnit = e.target.value;
    setPriceUnit(newUnit);
    const finalVal = calculateFinalRupees(priceDisplay, newUnit);
    setForm((p) => ({ ...p, price: finalVal ? String(finalVal) : "" }));
    setErrors((p) => ({ ...p, price: "" }));
  };

  const [isCustomCity, setIsCustomCity] = useState(() => {
    if (!initialData?.city) return false;
    return !CITIES.includes(initialData.city);
  });

  const formatCityTitleCase = (str) => {
    return str
      .replace(/[^a-zA-Z\s-]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");
  };

  const handleCustomCityChange = (e) => {
    const formatted = formatCityTitleCase(e.target.value);
    setForm((p) => ({ ...p, city: formatted }));
    setErrors((p) => ({ ...p, city: "" }));
  };

  const handleCitySelectChange = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomCity(true);
      setForm((p) => ({ ...p, city: "" }));
      setErrors((p) => ({ ...p, city: "" }));
    } else {
      setIsCustomCity(false);
      setForm((p) => ({ ...p, city: val }));
      setErrors((p) => ({ ...p, city: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "possessionStatus") {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (value === "Ready to Move" || value === "Immediate") {
        setForm((p) => ({
          ...p,
          possessionStatus: value,
          availableFrom: p.availableFrom && p.availableFrom > todayStr ? todayStr : (p.availableFrom || todayStr),
        }));
      } else if (value === "Under Construction") {
        let nextDate = form.availableFrom;
        if (!nextDate || nextDate <= todayStr) {
          const future = new Date();
          future.setMonth(future.getMonth() + 6);
          nextDate = future.toISOString().slice(0, 10);
        }
        setForm((p) => ({
          ...p,
          possessionStatus: value,
          availableFrom: nextDate,
        }));
      } else {
        setForm((p) => ({ ...p, [name]: value }));
      }
      setErrors((p) => ({ ...p, possessionStatus: "" }));
      return;
    }

    if (name === "availableFrom") {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (value) {
        if (value > todayStr) {
          setForm((p) => ({
            ...p,
            availableFrom: value,
            possessionStatus: "Under Construction",
          }));
        } else {
          setForm((p) => ({
            ...p,
            availableFrom: value,
            possessionStatus: p.possessionStatus === "Immediate" ? "Immediate" : "Ready to Move",
          }));
        }
      } else {
        setForm((p) => ({ ...p, availableFrom: value }));
      }
      setErrors((p) => ({ ...p, availableFrom: "" }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleListingTypeChange = (type) => {
    setForm((p) => ({ ...p, listingType: type }));
    if (type === "rent" && priceUnit === "cr") {
      setPriceUnit("rupees");
      const finalVal = calculateFinalRupees(priceDisplay, "rupees");
      setForm((p) => ({ ...p, price: finalVal ? String(finalVal) : "" }));
    } else if (type === "buy" && priceUnit === "rupees" && priceDisplay && parseFloat(priceDisplay) <= 500) {
      setPriceUnit("lac");
      const finalVal = calculateFinalRupees(priceDisplay, "lac");
      setForm((p) => ({ ...p, price: finalVal ? String(finalVal) : "" }));
    }
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
    if (!form.city.trim()) {
      e.city = isCustomCity ? "Please enter your city name" : "Please select a city";
    } else if (isCustomCity && form.city.trim().length < 2) {
      e.city = "City name must be at least 2 characters";
    }
    if (!form.location.trim()) e.location = "Locality is required";
    if (!priceDisplay || parseFloat(priceDisplay) <= 0) e.price = "Enter a valid price/amount";
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
    const finalPrice = calculateFinalRupees(priceDisplay, priceUnit);
    const cleanedCity = formatCityTitleCase(form.city.trim());
    onSubmit({
      ...form,
      city: cleanedCity,
      price: finalPrice,
    });
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
                  <option value="Both Covered & Open">Both Covered & Open</option>
                  <option value="None">None</option>
                </select>
              </div>

              {/* Possession Status */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <HiOutlineClock style={{ color: "#007bbd", fontSize: "0.88rem" }} /> Possession Status
                </label>
                <select name="possessionStatus" className={styles.formSelect} value={form.possessionStatus || "Ready to Move"} onChange={handleChange}>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Immediate">Immediate Possession</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
                <div style={{ fontSize: "0.74rem", color: form.possessionStatus === "Under Construction" ? "#b45309" : "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  {form.possessionStatus === "Under Construction" ? "⏳ Property in progress (Future Date)" : "✓ Ready to Occupy (Immediate)"}
                </div>
              </div>

              {/* Available From Date */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <HiOutlineCalendar style={{ color: "#007bbd", fontSize: "0.88rem" }} /> {form.possessionStatus === "Under Construction" ? "Expected Possession Date" : "Available From (Date)"}
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="date"
                    name="availableFrom"
                    className={styles.formInput}
                    value={form.availableFrom ? String(form.availableFrom).slice(0, 10) : ""}
                    onChange={handleChange}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch (_) {}
                    }}
                    onFocus={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch (_) {}
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 500 }}>
                  {form.possessionStatus === "Under Construction"
                    ? "Future date marks project as Under Construction"
                    : "Current/Past date marks as Ready to Move"}
                </div>
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
                <div className={styles.cityHeaderRow}>
                  <label className={styles.formLabel} style={{ marginBottom: 0 }}>
                    City <span className={styles.requiredStar}>*</span>
                  </label>
                  <button
                    type="button"
                    className={styles.cityToggleBtn}
                    onClick={() => {
                      setIsCustomCity((prev) => !prev);
                      setForm((p) => ({ ...p, city: "" }));
                      setErrors((p) => ({ ...p, city: "" }));
                    }}
                  >
                    {isCustomCity ? "← Choose from list" : "+ Add Other City"}
                  </button>
                </div>
                {isCustomCity ? (
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="customCity"
                      className={styles.formInput}
                      value={form.city}
                      onChange={handleCustomCityChange}
                      placeholder="Enter City Name (e.g. Anand, Vapi)"
                      autoFocus
                    />
                  </div>
                ) : (
                  <select
                    name="city"
                    className={styles.formSelect}
                    value={form.city}
                    onChange={handleCitySelectChange}
                  >
                    <option value="">Select City</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Other (Enter New City)</option>
                  </select>
                )}
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
                  {form.listingType === "rent" ? "Monthly Rent" : "Property Price"}{" "}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.priceInputGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>₹</span>
                    <input
                      name="priceDisplay"
                      type="number"
                      step="any"
                      min="0"
                      className={`${styles.formInput} ${styles.formInputWithIcon}`}
                      value={priceDisplay}
                      onChange={handlePriceValueChange}
                      placeholder={
                        priceUnit === "lac"
                          ? "e.g. 85"
                          : priceUnit === "cr"
                          ? "e.g. 2.5"
                          : form.listingType === "rent"
                          ? "e.g. 25000"
                          : "e.g. 8500000"
                      }
                    />
                  </div>
                  <select
                    className={styles.priceUnitSelect}
                    value={priceUnit}
                    onChange={handlePriceUnitChange}
                    aria-label="Select Price Unit"
                  >
                    {form.listingType === "rent" ? (
                      <>
                        <option value="rupees">₹ / Month</option>
                        <option value="thousand">Thousand / Mo</option>
                        <option value="lac">Lac / Month</option>
                      </>
                    ) : (
                      <>
                        <option value="lac">Lac</option>
                        <option value="cr">Cr</option>
                        <option value="rupees">₹ Total</option>
                      </>
                    )}
                  </select>
                </div>
                {errors.price && <span className={styles.fieldError}>✕ {errors.price}</span>}
                {priceDisplay && parseFloat(priceDisplay) > 0 && (
                  <div className={styles.pricePreviewBadge}>
                    <span>Preview:</span>
                    <strong>
                      {priceUnit === "cr"
                        ? `₹ ${priceDisplay} Cr (₹ ${(parseFloat(priceDisplay) * 10000000).toLocaleString("en-IN")})`
                        : priceUnit === "lac"
                        ? `₹ ${priceDisplay} Lac (₹ ${(parseFloat(priceDisplay) * 100000).toLocaleString("en-IN")})`
                        : priceUnit === "thousand"
                        ? `₹ ${priceDisplay} K (₹ ${(parseFloat(priceDisplay) * 1000).toLocaleString("en-IN")})`
                        : form.listingType === "rent"
                        ? `₹ ${parseFloat(priceDisplay).toLocaleString("en-IN")} / month`
                        : `₹ ${parseFloat(priceDisplay).toLocaleString("en-IN")}`}
                    </strong>
                  </div>
                )}
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

