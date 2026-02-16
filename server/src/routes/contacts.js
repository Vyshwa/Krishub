const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const doc = await Contact.create({ name, email, message });
    return res.status(201).json({ id: doc._id });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (_err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
