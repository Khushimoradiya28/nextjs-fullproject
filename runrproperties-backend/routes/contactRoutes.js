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

// Public route to subscribe to Property Alerts & Newsletter
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email format (e.g. name@example.com).',
      });
    }

    // Check if lead with this email already exists
    const existing = await ContactLead.findOne({
      email: emailClean,
      subject: 'Property Alerts Subscription',
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: '🎉 You are already subscribed to exclusive property alerts!',
        data: existing,
      });
    }

    const newSubscriber = await ContactLead.create({
      name: emailClean.split('@')[0],
      email: emailClean,
      phone: '',
      subject: 'Property Alerts Subscription',
      message: 'Subscribed via website footer for exclusive alerts on new apartments, villas, & commercial hubs.',
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: '🎉 Successfully subscribed! You will now receive exclusive property alerts.',
      data: newSubscriber,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
