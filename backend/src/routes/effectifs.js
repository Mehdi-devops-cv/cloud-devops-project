const express = require('express');
const { Effectif } = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { city, building, task, floor, apartment, company, nombrePersonnes, selectedDate } = req.body;
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(12, 0, 0, 0);

    const effectif = new Effectif({
      city, building, task, floor, apartment, company, nombrePersonnes,
      selectedDate: normalizedDate,
      userId: req.user._id
    });
    await effectif.save();
    res.json({ success: true, effectif });
  } catch (err) {
    console.error('Error creating effectif:', err.message);
    res.status(500).json({ success: false, message: 'Error creating effectif', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { city, building, floor, apartment, company, selectedDate } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (building) filter.building = building;
    if (floor) filter.floor = floor;
    if (apartment) filter.apartment = apartment;
    if (company) filter.company = company;
    if (selectedDate) filter.selectedDate = selectedDate;
    const effectifs = await Effectif.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json({ success: true, effectifs });
  } catch (err) {
    console.error('Error fetching effectif:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching effectif', error: err.message });
  }
});

router.get('/list', auth, async (req, res) => {
  try {
    const { city, building, task, floor, apartment, company, selectedDate } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (building) filter.building = building;
    if (task) filter.task = task;
    if (floor) filter.floor = floor;
    if (apartment) filter.apartment = apartment;
    if (company) filter.company = company;
    if (selectedDate) {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      filter.selectedDate = { $gte: startDate, $lte: endDate };
    }
    const effectifs = await Effectif.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json({ success: true, effectifs });
  } catch (err) {
    console.error('Error fetching effectifs:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching effectifs', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const effectif = await Effectif.findById(id);
    if (!effectif) return res.status(404).json({ success: false, message: 'Effectif not found' });
    if (effectif.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this effectif' });
    }
    await Effectif.findByIdAndDelete(id);
    res.json({ success: true, message: 'Effectif deleted successfully' });
  } catch (err) {
    console.error('Error deleting effectif:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting effectif', error: err.message });
  }
});

module.exports = router;
