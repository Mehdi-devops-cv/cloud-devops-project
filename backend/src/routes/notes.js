const express = require('express');
const { Note } = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { city, building, task, floor, apartment, company, openTime, closedTime, selectedDate } = req.body;
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(12, 0, 0, 0);

    const note = new Note({
      city, building, task, floor, apartment, company,
      openTime: openTime || '',
      closedTime: closedTime || '',
      selectedDate: normalizedDate,
      userId: req.user._id
    });
    await note.save();
    res.json({ success: true, note });
  } catch (err) {
    console.error('Error creating note:', err.message);
    res.status(500).json({ success: false, message: 'Error creating note', error: err.message });
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
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.selectedDate = { $gte: startOfDay, $lte: endOfDay };
    }
    const notes = await Note.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json({ success: true, notes });
  } catch (err) {
    console.error('Error fetching notes:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching notes', error: err.message });
  }
});

router.get('/dates', auth, async (req, res) => {
  try {
    const { city, building, task } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (building) filter.building = building;
    if (task) filter.task = task;

    const notes = await Note.find(filter).select('selectedDate').lean();
    const set = new Set();
    for (const n of notes) {
      if (n.selectedDate) {
        const d = new Date(n.selectedDate);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        set.add(`${y}-${m}-${day}`);
      }
    }
    return res.json({ success: true, dates: Array.from(set) });
  } catch (err) {
    console.error('Error fetching note dates:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching note dates', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { closedTime } = req.body;

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this note' });
    }

    note.closedTime = closedTime;
    await note.save();
    res.json({ success: true, note });
  } catch (err) {
    console.error('Error updating note:', err.message);
    res.status(500).json({ success: false, message: 'Error updating note', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }
    await Note.findByIdAndDelete(id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting note', error: err.message });
  }
});

module.exports = router;
