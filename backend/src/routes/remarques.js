const express = require('express');
const { Remarque } = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pilote' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only pilote and admin can create remarques' });
    }
    const { city, building, task, floor, apartment, description, image, selectedDate } = req.body;
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(12, 0, 0, 0);

    const remarque = new Remarque({
      city, building, task, floor, apartment, description, image,
      selectedDate: normalizedDate,
      userId: req.user._id
    });
    await remarque.save();
    res.json({ success: true, remarque });
  } catch (err) {
    console.error('Error creating remarque:', err.message);
    res.status(500).json({ success: false, message: 'Error creating remarque', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { city, building, task, selectedDate } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (building) filter.building = building;
    if (task) filter.task = task;
    if (selectedDate) {
      const date = new Date(selectedDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      filter.selectedDate = { $gte: date, $lt: nextDate };
    }
    const remarques = await Remarque.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json({ success: true, remarques });
  } catch (err) {
    console.error('Error fetching remarques:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching remarques', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pilote' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only pilote and admin can delete remarques' });
    }
    const remarqueId = req.params.id;
    const remarque = await Remarque.findById(remarqueId);
    if (!remarque) return res.status(404).json({ success: false, message: 'Remarque not found' });
    if (remarque.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this remarque' });
    }
    await Remarque.findByIdAndDelete(remarqueId);
    res.json({ success: true, message: 'Remarque deleted successfully' });
  } catch (err) {
    console.error('Error deleting remarque:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting remarque', error: err.message });
  }
});

module.exports = router;
