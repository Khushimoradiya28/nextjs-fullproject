export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://nextjs-fullproject.onrender.com/api");

export const getBackendOrigin = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return "https://nextjs-fullproject.onrender.com";
};

export function getMediaUrl(url, fallback = "") {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const backendOrigin = getBackendOrigin();
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (
    cleanPath.startsWith("/uploads") ||
    cleanPath.startsWith("/images") ||
    cleanPath.startsWith("/banks") ||
    cleanPath.startsWith("/avatars") ||
    cleanPath.startsWith("/properties")
  ) {
    return `${backendOrigin}${cleanPath}`;
  }
  return cleanPath;
}

export function mapUser(u) {
  if (!u) return null;
  return {
    ...u,
    profilePhoto: getMediaUrl(u.profilePhoto, ""),
  };
}

import { normalizeCity } from "./cityAliases";

function saveToken(token) {
  if (typeof window !== "undefined") localStorage.setItem("runr_token", token);
}
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("runr_token");
}
function removeToken() {
  if (typeof window !== "undefined") localStorage.removeItem("runr_token");
}
function getHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: "Network error. Please try again." };
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTH (Connected to backend)
// ═══════════════════════════════════════════════════════════════

export async function signupUser(payload) {
  const data = await request(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (data.success) {
    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user;

    if (token) saveToken(token);

    return {
      success: true,
      user,
      token,
      message: data.message,
    };
  }

  return data;
}

export async function loginUser({ email, password }) {
  const data = await request(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (data.success) {
    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user;

    if (token) saveToken(token);

    return {
      success: true,
      user,
      token,
      message: data.message,
    };
  }

  return data;
}

export function logoutUser() {
  removeToken();
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return { success: false, user: null };
  const data = await request(`${API_BASE}/auth/me`, { headers: getHeaders() });
  if (data.success && data.data)
    return { success: true, user: data.data.user || data.data };
  return data;
}

export async function updateProfile({ name, mobile }) {
  return await request(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name, mobile }),
  });
}

export async function changePassword({ currentPassword, newPassword }) {
  return await request(`${API_BASE}/auth/change-password`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function uploadProfilePhoto(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("profilePhoto", file);
  return await request(`${API_BASE}/auth/profile/photo`, {
    method: "PUT",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
}

export async function forgotPassword({ email }) {
  return await request(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, newPassword }) {
  return await request(`${API_BASE}/auth/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });
}

// ═══════════════════════════════════════════════════════════════
// WISHLIST (Connected to backend)
// ═══════════════════════════════════════════════════════════════

export async function getWishlist() {
  const data = await request(`${API_BASE}/wishlist`, { headers: getHeaders() });
  if (data.success) {
    const raw = data.data || data.wishlist || [];
    const mapped = raw.map((item) => {
      const prop = item.property || item;
      return mapProperty(prop);
    });
    return { success: true, wishlist: mapped };
  }
  return { success: true, wishlist: [] };
}

export async function addToWishlistAPI(property) {
  return await request(`${API_BASE}/wishlist/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      propertyId: property.id,
    }),
  });
}

export async function removeFromWishlistAPI(propertyId) {
  return await request(`${API_BASE}/wishlist/${propertyId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}

export async function clearWishlistAPI() {
  return await request(`${API_BASE}/wishlist`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}

// ═══════════════════════════════════════════════════════════════
// PROPERTIES - Owner (Connected to backend)
// ═══════════════════════════════════════════════════════════════

export async function getMyProperties() {
  const data = await request(`${API_BASE}/properties/my`, {
    headers: getHeaders(),
  });
  if (data.success) {
    const raw = data.data || data.properties || [];
    return { success: true, properties: raw.map(mapProperty) };
  }
  return { success: false, properties: [] };
}

export async function addProperty(propertyData) {
  const furnishingMap = {
    unfurnished: "Unfurnished",
    "semi-furnished": "Semi Furnished",
    furnished: "Fully Furnished",
    Unfurnished: "Unfurnished",
    "Semi Furnished": "Semi Furnished",
    "Fully Furnished": "Fully Furnished",
  };

  const typeMap = {
    apartment: "Apartment",
    villa: "Villa",
    plot: "Plot",
    commercial: "Office",
    office: "Office",
    shop: "Shop",
    studio: "Studio",
    penthouse: "Penthouse",
    farmhouse: "Farmhouse",
    other: "Other",
    Apartment: "Apartment",
    Villa: "Villa",
    Plot: "Plot",
    Office: "Office",
    Shop: "Shop",
    Studio: "Studio",
    Penthouse: "Penthouse",
    Farmhouse: "Farmhouse",
    Other: "Other",
  };

  const rawType = propertyData.type || propertyData.propertyType || "Apartment";
  const rawFurnishing = propertyData.furnishing || "";

  const formData = new FormData();
  formData.append("title", propertyData.title || "");
  formData.append("propertyType", typeMap[rawType] || "Apartment");
  formData.append("category", propertyData.category || "Residential");
  formData.append("listingType", propertyData.listingType || "buy");
  formData.append("city", propertyData.city || "");
  formData.append(
    "locality",
    propertyData.location || propertyData.locality || "",
  );
  formData.append(
    "address",
    propertyData.address || propertyData.location || "",
  );
  formData.append(
    "bedrooms",
    parseInt(propertyData.bhk || propertyData.bedrooms || 0),
  );
  formData.append("bathrooms", parseInt(propertyData.bathrooms || 0));
  formData.append("area", parseInt(propertyData.area || 0));
  formData.append("furnishing", furnishingMap[rawFurnishing] || "");
  formData.append("parking", propertyData.parking || "");
  formData.append("description", propertyData.description || "");
  formData.append("price", parseInt(propertyData.price || 0));
  formData.append("featured", propertyData.featured || false);

  if (propertyData.amenities) {
    formData.append("amenities", JSON.stringify(propertyData.amenities));
  }

  if (propertyData.imageFiles && propertyData.imageFiles.length > 0) {
    propertyData.imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  } else if (propertyData.imageFile) {
    formData.append("images", propertyData.imageFile);
  }

  if (propertyData.existingImages && propertyData.existingImages.length > 0) {
    const backendUrl = API_BASE.replace(/\/api\/?$/, "");
    const relativeImages = propertyData.existingImages.map((img) =>
      typeof img === "string" ? img.replace(backendUrl, "") : img
    );
    formData.append("images", JSON.stringify(relativeImages));
  } else if (propertyData.image && !propertyData.image.startsWith("blob:")) {
    const backendUrl = API_BASE.replace(/\/api\/?$/, "");
    const relativeImage = propertyData.image.replace(backendUrl, "");
    formData.append("images", JSON.stringify([relativeImage]));
  }

  const headers = getHeaders();
  delete headers["Content-Type"];

  return await request(`${API_BASE}/properties`, {
    method: "POST",
    headers,
    body: formData,
  });
}

export async function updateProperty(propertyId, updates) {
  const furnishingMap = {
    unfurnished: "Unfurnished",
    "semi-furnished": "Semi Furnished",
    furnished: "Fully Furnished",
    Unfurnished: "Unfurnished",
    "Semi Furnished": "Semi Furnished",
    "Fully Furnished": "Fully Furnished",
  };
  const typeMap = {
    apartment: "Apartment",
    villa: "Villa",
    plot: "Plot",
    commercial: "Office",
    Apartment: "Apartment",
    Villa: "Villa",
    Plot: "Plot",
    Office: "Office",
    Shop: "Shop",
    Studio: "Studio",
    Penthouse: "Penthouse",
    Farmhouse: "Farmhouse",
    Other: "Other",
  };

  const formData = new FormData();
  if (updates.title) formData.append("title", updates.title);
  if (updates.type || updates.propertyType)
    formData.append(
      "propertyType",
      typeMap[updates.type || updates.propertyType] || updates.type,
    );
  if (updates.category) formData.append("category", updates.category);
  if (updates.listingType) formData.append("listingType", updates.listingType);
  if (updates.city) formData.append("city", updates.city);
  if (updates.location || updates.locality)
    formData.append("locality", updates.location || updates.locality);
  if (updates.address || updates.location)
    formData.append("address", updates.address || updates.location);
  if (updates.bhk !== undefined || updates.bedrooms !== undefined)
    formData.append("bedrooms", parseInt(updates.bhk || updates.bedrooms || 0));
  if (updates.bathrooms !== undefined)
    formData.append("bathrooms", parseInt(updates.bathrooms || 0));
  if (updates.area) formData.append("area", parseInt(updates.area));
  if (updates.furnishing !== undefined)
    formData.append(
      "furnishing",
      furnishingMap[updates.furnishing] || updates.furnishing,
    );
  if (updates.parking !== undefined)
    formData.append("parking", updates.parking);
  if (updates.description !== undefined)
    formData.append("description", updates.description);
  if (updates.price) formData.append("price", parseInt(updates.price));
  if (updates.featured !== undefined)
    formData.append("featured", updates.featured);
  if (updates.status !== undefined) {
    formData.append("status", updates.status);
  }

  if (updates.amenities) {
    formData.append("amenities", JSON.stringify(updates.amenities));
  }

  if (updates.imageFiles && updates.imageFiles.length > 0) {
    updates.imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  } else if (updates.imageFile) {
    formData.append("images", updates.imageFile);
  }

  if (updates.existingImages) {
    const backendUrl = API_BASE.replace(/\/api\/?$/, "");
    const relativeImages = updates.existingImages.map((img) =>
      typeof img === "string" ? img.replace(backendUrl, "") : img
    );
    formData.append("images", JSON.stringify(relativeImages));
  } else if (updates.image && !updates.image.startsWith("blob:")) {
    const backendUrl = API_BASE.replace(/\/api\/?$/, "");
    const relativeImage = updates.image.replace(backendUrl, "");
    formData.append("images", JSON.stringify([relativeImage]));
  }

  const headers = getHeaders();
  delete headers["Content-Type"];

  return await request(`${API_BASE}/properties/${propertyId}`, {
    method: "PUT",
    headers,
    body: formData,
  });
}

export async function deleteProperty(propertyId) {
  return await request(`${API_BASE}/properties/${propertyId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC PROPERTIES (Connected to backend)
// ═══════════════════════════════════════════════════════════════

export async function searchProperties(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== "" && val !== undefined && val !== null) {
      // Normalize city
      if (key === "city") {
        params.set(key, normalizeCity(val));
      }

      // Normalize furnishing
      else if (key === "furnishing") {
        const furnishMap = {
          furnished: "Fully Furnished",
          "semi-furnished": "Semi Furnished",
          unfurnished: "Unfurnished",
        };

        const mapped = val
          .split(",")
          .map((v) => furnishMap[v.trim().toLowerCase()] || v.trim())
          .join(",");

        params.set(key, mapped);
      }

      // ALL OTHER FILTERS
      else {
        params.set(key, val);
      }
    }
  });
  // Use search endpoint if keyword present
  const endpoint = filters.q
    ? `${API_BASE}/properties/search`
    : `${API_BASE}/properties`;
  const data = await request(`${endpoint}?${params.toString()}`);
  if (data.success) {
    const properties = data.data || [];
    return {
      success: true,
      properties: properties.map(mapProperty),
      total: data.pagination?.total || properties.length,
      pagination: data.pagination,
    };
  }
  return data;
}

export async function getPropertyById(propertyId) {
  const data = await request(`${API_BASE}/properties/${propertyId}`, {
    headers: getHeaders(),
  });
  if (data.success) {
    const raw = data.data || data.property;
    if (raw) return { success: true, property: mapProperty(raw) };
  }
  return data;
}

export async function getFeaturedProperties() {
  const properties = data.data || [];

  return {
    success: true,
    properties: properties.map(mapProperty),
  };
}

// Maps backend property shape to frontend expected shape
function mapProperty(p) {
  // Handle both array (images) and singular (image) from backend
  let images = p.images || [];
  if (typeof images === "string") {
    try {
      images = JSON.parse(images);
    } catch {
      images = [images];
    }
  }
  // If images array is empty, check for singular image field
  if (images.length === 0 && p.image) {
    images = [p.image];
  }
  const imageUrls = images.map((u) => getMediaUrl(u, "/img/buy-properties/1.jpg"));

  const ownerData = p.owner && typeof p.owner === "object" ? p.owner : null;

  return {
    id: p._id || p.id,
    slug: p.slug || "",
    ownerId: ownerData ? ownerData._id || ownerData.id || "" : p.owner || "",
    owner: ownerData
      ? {
          name: ownerData.name || "",
          email: ownerData.email || "",
          mobile: ownerData.mobile || "",
          avatarColor: ownerData.avatarColor || "",
          profilePhoto: getMediaUrl(ownerData.profilePhoto, ""),
        }
      : null,
    title: p.title || "",
    type: p.propertyType || p.category || "apartment",
    category: p.category || "Residential",
    listingType: p.listingType || "buy",
    price: p.price || 0,
    rent: p.listingType === "rent" ? p.price : 0,
    deposit: p.deposit || 0,
    city: p.city || "",
    location: p.locality || p.address || "",
    address: p.address || "",
    bhk: p.bedrooms || 0,
    bathrooms: p.bathrooms || 0,
    area: p.area || 0,
    furnishing: p.furnishing || "unfurnished",
    parking: p.parking || "",
    description: p.description || "",
    amenities: p.amenities || [],
    image: imageUrls.length > 0 ? imageUrls[0] : "/img/buy-properties/1.jpg",
    images: imageUrls,
    featured: p.featured || false,
    status: p.status || "active",
    postedBy: p.postedBy || "owner",
    postedDate: p.createdAt || new Date().toISOString(),
    availableFrom: p.availableFrom || p.createdAt || new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// TODO: Not yet implemented on backend - keeping mock/placeholder
// ═══════════════════════════════════════════════════════════════

// TODO: Implement /api/home endpoint
export async function getHomeData() {
  return { success: true, banner: null, featured: [], cities: [], blogs: [] };
}

// TODO: Implement /api/cities endpoint
export async function getCities() {
  return { success: true, cities: [] };
}

// TODO: Implement /api/filters endpoint
export async function getFilterOptions() {
  return {
    success: true,
    cities: [],
    types: [],
    bhkOptions: [],
    furnishingOptions: [],
  };
}

// ═══════════════════════════════════════════════════════════════
// ENQUIRIES (Connected to backend)
// ═══════════════════════════════════════════════════════════════

export async function contactOwner({
  propertyId,
  name,
  email,
  phone,
  message,
}) {
  return await request(`${API_BASE}/enquiries`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      property: propertyId,
      name,
      email,
      mobile: phone,
      message,
    }),
  });
}

export async function getMyEnquiries() {
  const data = await request(`${API_BASE}/enquiries/my`, {
    headers: getHeaders(),
  });
  if (data.success) {
    return { success: true, enquiries: data.data || [] };
  }
  return { success: false, enquiries: [] };
}

export async function getReceivedEnquiries() {
  const data = await request(`${API_BASE}/enquiries/received`, {
    headers: getHeaders(),
  });
  if (data.success) {
    return { success: true, enquiries: data.data || [] };
  }
  return { success: false, enquiries: [] };
}

export async function updateEnquiryStatus(enquiryId, status) {
  return await request(`${API_BASE}/enquiries/${enquiryId}/status`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function deleteEnquiry(enquiryId) {
  return await request(`${API_BASE}/enquiries/${enquiryId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
}

// TODO: Implement /api/reviews endpoints
export async function getReviews(propertyId) {
  return { success: true, reviews: [] };
}

export async function addReview({ propertyId, rating, comment }) {
  return {
    success: true,
    message: "Review submitted",
    review: {
      propertyId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    },
  };
}
