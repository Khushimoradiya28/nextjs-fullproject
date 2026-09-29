const express = require('express');
const router = express.Router();
const Faq = require('../models/Faq');
const { protect } = require('../middleware/auth');

// Middleware to restrict access strictly to admins
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
  next();
};

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

// @route   GET /api/faqs/public
// @desc    Get all active FAQs
// @access  Public
router.get('/public', async (req, res, next) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// ADMIN ENDPOINTS (Protected)
// -------------------------------------------------------------

// @route   GET /api/faqs
// @desc    Get all FAQs (for admin management) with pagination & filter
// @access  Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search && search.trim()) {
      query.$or = [
        { question: { $regex: search.trim(), $options: 'i' } },
        { answer: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [faqs, total, totalActive, totalInactive] = await Promise.all([
      Faq.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limitNum),
      Faq.countDocuments(query),
      Faq.countDocuments({ isActive: true }),
      Faq.countDocuments({ isActive: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: faqs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      counts: {
        total: totalActive + totalInactive,
        active: totalActive,
        inactive: totalInactive,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/faqs
// @desc    Create a new FAQ
// @access  Admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { question, answer, order = 0, isActive = true } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }
    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }

    const faq = await Faq.create({
      question: question.trim(),
      answer: answer.trim(),
      order: Number(order) || 0,
      isActive: Boolean(isActive),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/faqs/:id
// @desc    Update an existing FAQ
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { question, answer, order, isActive } = req.body;
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();
    if (order !== undefined) faq.order = Number(order);
    if (isActive !== undefined) faq.isActive = Boolean(isActive);

    await faq.save();

    return res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/faqs/:id/status
// @desc    Toggle or update FAQ active status
// @access  Admin
router.patch('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    faq.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !faq.isActive;
    await faq.save();

    return res.status(200).json({
      success: true,
      message: `FAQ status updated to ${faq.isActive ? 'Active' : 'Inactive'}`,
      data: faq,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/faqs/:id
// @desc    Delete an FAQ
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
