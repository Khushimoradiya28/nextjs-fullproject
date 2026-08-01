const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');

const createEnquiry = async (buyerId, data) => {
  const property = await Property.findById(data.property);
  if (!property) {
    const error = new Error('Property not found');
    error.statusCode = 404;
    throw error;
  }

  // Buyer cannot enquire on own property
  if (property.owner.toString() === buyerId.toString()) {
    const error = new Error('You cannot enquire on your own property');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate
  const existing = await Enquiry.findOne({ buyer: buyerId, property: data.property });
  if (existing) {
    const error = new Error('You have already enquired about this property');
    error.statusCode = 400;
    throw error;
  }

  const enquiryData = {
    ...data,
    buyer: buyerId,
    owner: property.owner,
  };

  const enquiry = await Enquiry.create(enquiryData);
  return enquiry;
};

const getBuyerEnquiries = async (buyerId) => {
  const enquiries = await Enquiry.find({ buyer: buyerId })
    .populate('property')
    .populate('owner', 'name email mobile avatarColor profilePhoto')
    .populate('buyer', 'name email mobile avatarColor profilePhoto')
    .sort({ createdAt: -1 });
  return enquiries;
};

const getOwnerEnquiries = async (ownerId) => {
  const enquiries = await Enquiry.find({ owner: ownerId })
    .populate('property')
    .populate('buyer', 'name email mobile avatarColor profilePhoto')
    .populate('owner', 'name email mobile avatarColor profilePhoto')
    .sort({ createdAt: -1 });
  return enquiries;
};

const updateEnquiryStatus = async (enquiryId, ownerId, status) => {
  const enquiry = await Enquiry.findById(enquiryId);
  if (!enquiry) {
    const error = new Error('Enquiry not found');
    error.statusCode = 404;
    throw error;
  }

  if (enquiry.owner.toString() !== ownerId.toString()) {
    const error = new Error('Not authorized to update this enquiry');
    error.statusCode = 403;
    throw error;
  }

  enquiry.status = status;
  await enquiry.save();
  return enquiry;
};

const deleteEnquiry = async (enquiryId, userId) => {
  const enquiry = await Enquiry.findById(enquiryId);
  if (!enquiry) {
    const error = new Error('Enquiry not found');
    error.statusCode = 404;
    throw error;
  }

  // Allow either buyer or owner to delete it
  if (enquiry.buyer.toString() !== userId.toString() && enquiry.owner.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this enquiry');
    error.statusCode = 403;
    throw error;
  }

  await Enquiry.findByIdAndDelete(enquiryId);
  return { message: 'Enquiry deleted successfully' };
};

module.exports = {
  createEnquiry,
  getBuyerEnquiries,
  getOwnerEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
};
