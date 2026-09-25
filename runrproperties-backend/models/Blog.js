const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt/short description is required'],
      trim: true,
      maxlength: [400, 'Excerpt cannot exceed 400 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Market Trends',
        'Buying Guide',
        'Investment',
        'Finance',
        'Lifestyle',
        'Legal',
        'Rental',
        'Interior',
        'General',
      ],
      default: 'Market Trends',
    },
    coverImage: {
      type: String,
      default: '/img/blog/1.jpg',
    },
    author: {
      type: String,
      trim: true,
      default: 'runr team',
    },
    readTime: {
      type: String,
      trim: true,
      default: '5 min',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique slug from title before saving
blogSchema.pre('save', async function () {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slugCandidate = baseSlug;
    const existing = await mongoose.model('Blog').findOne({ slug: slugCandidate, _id: { $ne: this._id } });
    if (existing) {
      slugCandidate = `${baseSlug}-${Date.now().toString(36)}`;
    }
    this.slug = slugCandidate;
  }
});

blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', category: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
