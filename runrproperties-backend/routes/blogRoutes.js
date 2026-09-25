const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// 1. Get all published blogs with search, category filter, and pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 9, featured } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 9);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      isDeleted: { $ne: true },
      status: 'published',
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, blogs] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-content'), // omit full content in listing for speed
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get featured/latest blogs for Homepage (limit 3)
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 3);
    const blogs = await Blog.find({
      isDeleted: { $ne: true },
      status: 'published',
    })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .select('title slug excerpt category coverImage author readTime createdAt isFeatured');

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get Single Blog by Slug (Increments view count)
router.get('/:slug', async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isDeleted: { $ne: true }, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found or unpublished',
      });
    }

    // Also get 3 related blogs
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      status: 'published',
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title slug excerpt category coverImage author readTime createdAt');

    res.status(200).json({
      success: true,
      data: blog,
      related: relatedBlogs,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
