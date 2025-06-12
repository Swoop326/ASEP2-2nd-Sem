const express = require('express');
const router = express.Router();

const Item = require('../models/item');           // Lost items schema
const FoundItem = require('../models/founditem'); // Found items schema

// GET /items
router.get('/items', async (req, res) => {
  try {
    const {
      category,
      location,
      search,
      dateFrom,
      dateTo
    } = req.query;

    // Build filter for lost items
    const lostFilter = { type: 'lost' };

    if (category) {
      // Case-insensitive regex for category matching
      lostFilter.category = { $regex: category, $options: 'i' };
    }
    if (location) {
      // Partial and case-insensitive match for location
      lostFilter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      lostFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      lostFilter.date = {};
      if (dateFrom) lostFilter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        lostFilter.date.$lte = toDate;
      }
    }

    // Build filter for found items
    const foundFilter = {};

    if (category) {
      foundFilter.category = { $regex: category, $options: 'i' };
    }
    if (location) {
      foundFilter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      foundFilter.$or = [
        { item: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      foundFilter.date = {};
      if (dateFrom) foundFilter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        foundFilter.date.$lte = toDate;
      }
    }
   
    console.log('Lost Filter:', lostFilter);
    console.log('Found Filter:', foundFilter);

    // Query lost items
    const lostItems = await Item.find(lostFilter).sort({ date: -1 }).lean();

    // Query found items
    const foundItems = await FoundItem.find(foundFilter).sort({ date: -1 }).lean();

// Add 'type' field to each item for frontend to distinguish lost vs found
const lostItemsWithType = lostItems.map(item => ({ ...item, type: 'lost' }));
const foundItemsWithType = foundItems.map(item => ({ ...item, type: 'found' }));

res.json({ lostItems: lostItemsWithType, foundItems: foundItemsWithType });
  } catch (err) {
    console.error('Browse items error:', err);
    res.status(500).json({ error: 'Server error while fetching items' });
  }
});

module.exports = router;
