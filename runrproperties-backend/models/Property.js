const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Apartment', 'Villa', 'Plot', 'Office', 'Shop', 'Studio', 'Penthouse', 'Farmhouse', 'Other'],
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: ['buy', 'rent'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Residential', 'Commercial'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    locality: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    area: {
      type: Number,
      default: 0,
      min: 0,
    },
    furnishing: {
      type: String,
      enum: ['Unfurnished', 'Semi Furnished', 'Fully Furnished', ''],
      default: '',
    },
    parking: {
      type: String,
      enum: ['Covered', 'Open', 'Both', 'None', ''],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
propertySchema.pre('save', async function () {
  if (this.isModified('title')) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure unique slug by appending a short suffix if needed
    const existing = await mongoose.model('Property').findOne({ slug, _id: { $ne: this._id } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    this.slug = slug;
  }
});

// Index for common queries
propertySchema.index({ city: 1, listingType: 1, status: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ featured: 1, status: 1 });
propertySchema.index({ propertyType: 1, category: 1, status: 1 });
propertySchema.index({ price: 1, status: 1 });
propertySchema.index({ locality: 1, status: 1 });
propertySchema.index({ title: 'text', city: 'text', locality: 'text', address: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
