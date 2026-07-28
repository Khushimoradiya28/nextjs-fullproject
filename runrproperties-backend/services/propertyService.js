const Property = require("../models/Property");

/**
 * Create a new property
 */
const createProperty = async (ownerId, data) => {
  const property = await Property.create({ ...data, owner: ownerId });
  return property;
};

/**
 * Get all properties (public, only active)
 */
const getAllProperties = async (query = {}) => {
  const {
    page = 1,
    limit = 12,
    city,
    locality,
    listingType,
    propertyType,
    category,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnishing,
    featured,
    sortBy = "newest",
  } = query;

  const filter = { status: "active" };

  // if (city) filter.city = new RegExp(city, 'i');
  // if (propertyType) filter.propertyType = propertyType;
  // if (bedrooms) filter.bedrooms = Number(bedrooms);
  // if (furnishing) filter.furnishing = furnishing;

  const parseMulti = (val) => {
    if (!val) return null;
    return val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  };

  // City
  const cities = parseMulti(city);
  if (cities) {
    filter.city =
      cities.length === 1
        ? new RegExp(cities[0], "i")
        : { $in: cities.map((c) => new RegExp(c, "i")) };
  }

  // Property Type
  const types = parseMulti(propertyType);
  if (types) {
    filter.propertyType = types.length === 1 ? types[0] : { $in: types };
  }

  // Bedrooms
  const beds = parseMulti(bedrooms);
  if (beds) {
    const nums = beds.map(Number);
    filter.bedrooms = nums.length === 1 ? nums[0] : { $in: nums };
  }

  // Furnishing
  const furnishings = parseMulti(furnishing);
  if (furnishings) {
    filter.furnishing =
      furnishings.length === 1 ? furnishings[0] : { $in: furnishings };
  }

  if (locality) filter.locality = new RegExp(locality, "i");
  if (listingType) filter.listingType = listingType;
  if (category) filter.category = category;
  if (bathrooms) filter.bathrooms = Number(bathrooms);
  if (featured === "true" || featured === true) filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Sort options
  let sort;
  switch (sortBy) {
    case "price":
      sort = { price: 1 };
      break;
    case "price_desc":
      sort = { price: -1 };
      break;
    case "oldest":
      sort = { createdAt: 1 };
      break;
    case "newest":
    default:
      sort = { createdAt: -1 };
      break;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  return {
    count: properties.length,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: properties,
  };
};

/**
 * Search properties by keyword (title, city, locality, address, description)
 */
const searchProperties = async (query = {}) => {
  const { q = "", page = 1, limit = 12 } = query;

  if (!q.trim()) {
    return getAllProperties(query);
  }

  const regex = new RegExp(q, "i");
  const filter = {
    status: "active",
    $or: [
      { title: regex },
      { city: regex },
      { locality: regex },
      { address: regex },
      { description: regex },
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner", "name email mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  return {
    count: properties.length,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: properties,
  };
};

/**
 * Get featured properties
 */
const getFeaturedProperties = async (query = {}) => {
  const { limit = 8 } = query;

  const properties = await Property.find({ featured: true, status: "active" })
    .populate("owner", "name email mobile")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  return properties;
};

/**
 * Get single property by ID
 * - Increments view count
 * - Blocks inactive/sold for non-owners
 * - Returns similar properties
 */
const getPropertyById = async (id, requestingUserId = null) => {
  const property = await Property.findById(id).populate(
    "owner",
    "name email mobile",
  );
  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  // Access control: inactive/sold properties only visible to their owner
  if (property.status !== "active") {
    const isOwner =
      requestingUserId &&
      property.owner._id.toString() === requestingUserId.toString();
    if (!isOwner) {
      const error = new Error("Property not found");
      error.statusCode = 404;
      throw error;
    }
  }

  // Increment views (fire-and-forget, don't block response)
  Property.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

  // Fetch similar properties (same city + propertyType + listingType, active, exclude current)
  const similarProperties = await Property.find({
    _id: { $ne: property._id },
    city: property.city,
    propertyType: property.propertyType,
    listingType: property.listingType,
    status: "active",
  })
    .populate("owner", "name email mobile")
    .sort({ createdAt: -1 })
    .limit(4);

  return { property, similarProperties };
};

/**
 * Get all properties by owner
 */
const getMyProperties = async (ownerId, query = {}) => {
  const { page = 1, limit = 12, status } = query;

  const filter = { owner: ownerId };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Property.countDocuments(filter),
  ]);

  return {
    properties,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Update property (only by owner)
 */
const updateProperty = async (propertyId, ownerId, data) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (property.owner.toString() !== ownerId.toString()) {
    const error = new Error("Not authorized to update this property");
    error.statusCode = 403;
    throw error;
  }

  // Prevent changing the owner field
  delete data.owner;

  Object.assign(property, data);
  await property.save();

  return property;
};

/**
 * Delete property (only by owner)
 */
const deleteProperty = async (propertyId, ownerId) => {
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (property.owner.toString() !== ownerId.toString()) {
    const error = new Error("Not authorized to delete this property");
    error.statusCode = 403;
    throw error;
  }

  await Property.findByIdAndDelete(propertyId);
  return { message: "Property deleted successfully" };
};

module.exports = {
  createProperty,
  getAllProperties,
  searchProperties,
  getFeaturedProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
