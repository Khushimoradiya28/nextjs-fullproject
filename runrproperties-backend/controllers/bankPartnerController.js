const bankPartnerService = require('../services/bankPartnerService');

const register = async (req, res, next) => {
  try {
    const result = await bankPartnerService.registerBankPartner(req.body);
    res.status(201).json({ success: true, message: 'Registration successful. Awaiting admin approval.', data: result });
  } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await bankPartnerService.getBankPartnerProfile(req.user._id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await bankPartnerService.updateBankPartnerProfile(req.user._id, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const logoPath = '/uploads/images/' + req.file.filename;
    const profile = await bankPartnerService.updateBankLogo(req.user._id, logoPath);
    res.status(200).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

const addOffer = async (req, res, next) => {
  try {
    const profile = await bankPartnerService.addOffer(req.user._id, req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

const deleteOffer = async (req, res, next) => {
  try {
    const profile = await bankPartnerService.deleteOffer(req.user._id, req.params.offerId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

const updateOffer = async (req, res, next) => {
  try {
    const profile = await bankPartnerService.updateOffer(req.user._id, req.params.offerId, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) { next(error); }
};

const getLeads = async (req, res, next) => {
  try {
    const result = await bankPartnerService.getBankLeads(req.user._id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await bankPartnerService.updateLeadStatus(req.user._id, req.params.leadId, req.body);
    res.status(200).json({ success: true, data: lead });
  } catch (error) { next(error); }
};

const submitLead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const lead = await bankPartnerService.submitLead(req.body, userId);
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: lead });
  } catch (error) { next(error); }
};

const getApprovedBanks = async (req, res, next) => {
  try {
    const banks = await bankPartnerService.getApprovedBanks();
    res.status(200).json({ success: true, data: banks });
  } catch (error) { next(error); }
};

module.exports = { register, getProfile, updateProfile, uploadLogo, addOffer, deleteOffer, updateOffer, getLeads, updateLead, submitLead, getApprovedBanks };
