const enquiryService = require('../services/enquiryService');

const createEnquiry = async (req, res, next) => {
  try {
    const { property, name, email, mobile, message } = req.body;
    const missing = [];
    if (!property) missing.push('property');
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!mobile) missing.push('mobile');
    if (!message) missing.push('message');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const enquiry = await enquiryService.createEnquiry(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

const getBuyerEnquiries = async (req, res, next) => {
  try {
    const enquiries = await enquiryService.getBuyerEnquiries(req.user._id);
    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerEnquiries = async (req, res, next) => {
  try {
    const enquiries = await enquiryService.getOwnerEnquiries(req.user._id);
    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const enquiry = await enquiryService.updateEnquiryStatus(req.params.id, req.user._id, status);
    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEnquiry = async (req, res, next) => {
  try {
    const result = await enquiryService.deleteEnquiry(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getBuyerEnquiries,
  getOwnerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
};
