const express = require('express');
const router = express.Router();
const ContactLead = require('../models/ContactLead');

// Public route to submit Contact Us lead
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and subject.',
      });
    }

    const newLead = await ContactLead.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message ? message.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully.',
      data: newLead,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
