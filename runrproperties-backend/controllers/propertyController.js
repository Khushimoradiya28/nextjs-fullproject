const propertyService = require('../services/propertyService');

/**
 * @desc    Create a new property
 * @route   POST /api/properties
 * @access  Private (owner only)
 */
const createProperty = async (req, res, next) => {
  try {
    const { title, propertyType, listingType, category, price, city } = req.body;

    // Validate required fields
    const missing = [];
    if (!title) missing.push('title');
    if (!propertyType) missing.push('propertyType');
    if (!listingType) missing.push('listingType');
    if (!category) missing.push('category');
    if (!price && price !== 0) missing.push('price');
    if (!city) missing.push('city');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    if (req.body.amenities && typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = [req.body.amenities];
      }
    }

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(f => '/uploads/images/' + f.filename);
    } else if (req.file) {
      uploadedImages = ['/uploads/images/' + req.file.filename];
    }

    let existingImages = [];
    if (req.body.images) {
      if (typeof req.body.images === 'string') {
        try {
          existingImages = JSON.parse(req.body.images);
        } catch (e) {
          existingImages = [req.body.images];
        }
      } else if (Array.isArray(req.body.images)) {
        existingImages = req.body.images;
      }
    }

    req.body.images = [...existingImages, ...uploadedImages];

    const property = await propertyService.createProperty(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active properties (public)
 * @route   GET /api/properties
 * @access  Public
 */
const getAllProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getAllProperties(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search properties
 * @route   GET /api/properties/search
 * @access  Public
 */
const searchProperties = async (req, res, next) => {
  try {
    const result = await propertyService.searchProperties(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured properties
 * @route   GET /api/properties/featured
 * @access  Public
 */
const getFeaturedProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getFeaturedProperties(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single property by ID
 * @route   GET /api/properties/:id
 * @access  Public (optionalAuth for owner check)
 */
const getPropertyById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const result = await propertyService.getPropertyById(req.params.id, userId);

    res.status(200).json({
      success: true,
      data: result.property,
      similarProperties: result.similarProperties,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in owner's properties
 * @route   GET /api/properties/my
 * @access  Private (owner only)
 */
const getMyProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getMyProperties(req.user._id, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a property
 * @route   PUT /api/properties/:id
 * @access  Private (owner only)
 */
const updateProperty = async (req, res, next) => {
  try {
    console.log('[UPDATE] Property ID:', req.params.id);
    console.log('[UPDATE] Content-Type:', req.headers['content-type']);
    console.log('[UPDATE] req.body:', JSON.stringify(req.body));
    console.log('[UPDATE] req.body.status:', req.body.status);
    console.log('[UPDATE] req.file:', req.file ? req.file.filename : 'none');

    if (req.body.amenities && typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = [req.body.amenities];
      }
    }

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(f => '/uploads/images/' + f.filename);
    } else if (req.file) {
      uploadedImages = ['/uploads/images/' + req.file.filename];
    }

    let existingImages = [];
    if (req.body.images) {
      if (typeof req.body.images === 'string') {
        try {
          existingImages = JSON.parse(req.body.images);
        } catch (e) {
          existingImages = [req.body.images];
        }
      } else if (Array.isArray(req.body.images)) {
        existingImages = req.body.images;
      }
    }

    if (uploadedImages.length > 0 || existingImages.length > 0 || req.body.images !== undefined) {
      req.body.images = [...existingImages, ...uploadedImages];
    }

    const property = await propertyService.updateProperty(req.params.id, req.user._id, req.body);

    console.log('[UPDATE] Saved status:', property.status);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a property
 * @route   DELETE /api/properties/:id
 * @access  Private (owner only)
 */
const deleteProperty = async (req, res, next) => {
  try {
    const result = await propertyService.deleteProperty(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark property as sold
 * @route   PATCH /api/properties/:id/sold
 * @access  Private (owner only)
 */
const markAsSold = async (req, res, next) => {
  try {
    const property = await propertyService.markAsSold(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Property marked as sold',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get property statistics & city counts
 * @route   GET /api/properties/stats
 * @access  Public
 */
const getPropertyStats = async (req, res, next) => {
  try {
    const stats = await propertyService.getPropertyStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
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
  markAsSold,
  getPropertyStats,
};
