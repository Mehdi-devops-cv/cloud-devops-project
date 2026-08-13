const express = require('express');
const { City, Building } = require('../models');

const router = express.Router();

router.get('/cities', async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching cities', error: err.message });
  }
});

router.get('/buildings', async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching buildings', error: err.message });
  }
});

module.exports = router;
