const express = require('express');
const { Constatation } = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const {
      reportNumber, chantierName, company, imageAvant, imageApres,
      floor, apartment, description, image,
      city, building, task, selectedDate, endDate
    } = req.body;

    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(12, 0, 0, 0);

    const constatationData = {
      city, building, task,
      selectedDate: normalizedDate,
      endDate: endDate ? new Date(endDate) : undefined,
      userId: req.user._id
    };
    if (reportNumber !== undefined) constatationData.reportNumber = reportNumber;
    if (chantierName) constatationData.chantierName = chantierName;
    if (company) constatationData.company = company;
    if (imageAvant) constatationData.imageAvant = imageAvant;
    if (imageApres) constatationData.imageApres = imageApres;
    if (floor) constatationData.floor = floor;
    if (apartment) constatationData.apartment = apartment;
    if (description) constatationData.description = description;
    if (image) constatationData.image = image;

    const constatation = new Constatation(constatationData);
    await constatation.save();
    res.json({ success: true, constatation });
  } catch (err) {
    console.error('Error creating constatation:', err.message);
    res.status(500).json({ success: false, message: 'Error creating constatation', error: err.message });
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
    const constatations = await Constatation.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json({ success: true, constatations });
  } catch (err) {
    console.error('Error fetching constatations:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching constatations', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const constatationId = req.params.id;
    const updateData = req.body;
    const updateFields = {};
    if (updateData.intituleMission !== undefined) updateFields.intituleMission = updateData.intituleMission;
    if (updateData.chantierName !== undefined) updateFields.chantierName = updateData.chantierName;
    if (updateData.company !== undefined) updateFields.company = updateData.company;
    if (updateData.city !== undefined) updateFields.city = updateData.city;
    if (updateData.building !== undefined) updateFields.building = updateData.building;
    if (updateData.task !== undefined) updateFields.task = updateData.task;
    if (updateData.selectedDate !== undefined) updateFields.selectedDate = updateData.selectedDate;
    if (updateData.endDate !== undefined) updateFields.endDate = updateData.endDate;
    if (updateData.floor !== undefined) updateFields.floor = updateData.floor;
    if (updateData.apartment !== undefined) updateFields.apartment = updateData.apartment;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.image !== undefined) updateFields.image = updateData.image;

    const updatedConstatation = await Constatation.findByIdAndUpdate(
      constatationId,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedConstatation) return res.status(404).json({ success: false, message: 'Constatation not found' });
    res.json({ success: true, constatation: updatedConstatation });
  } catch (err) {
    console.error('Error updating constatation:', err.message);
    res.status(500).json({ success: false, message: 'Error updating constatation', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const constatationId = req.params.id;
    const constatation = await Constatation.findById(constatationId);
    if (!constatation) return res.status(404).json({ success: false, message: 'Constatation not found' });
    if (constatation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this constatation' });
    }
    await Constatation.findByIdAndDelete(constatationId);
    res.json({ success: true, message: 'Constatation deleted successfully' });
  } catch (err) {
    console.error('Error deleting constatation:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting constatation', error: err.message });
  }
});

// Rapports Photos (alias - same model as Constatation)
router.post('/rapportsPhotos', auth, async (req, res) => {
  try {
    const { reportNumber, chantierName, city, building, task, company, imageAvant, imageApres, selectedDate, endDate } = req.body;
    const rapportPhoto = new Constatation({
      reportNumber, chantierName, city, building, task, company,
      imageAvant, imageApres,
      selectedDate: new Date(selectedDate),
      endDate: endDate ? new Date(endDate) : undefined,
      userId: req.user._id
    });
    await rapportPhoto.save();
    res.json({ success: true, rapportPhoto });
  } catch (err) {
    console.error('Error creating rapport photo:', err.message);
    res.status(500).json({ success: false, message: 'Error creating rapport photo', error: err.message });
  }
});

router.get('/rapportsPhotos', auth, async (req, res) => {
  try {
    const { city, building, task, selectedDate } = req.query;
    const filter = { userId: req.user._id };
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
    const rapportsPhotos = await Constatation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, rapportsPhotos });
  } catch (err) {
    console.error('Error fetching rapports photos:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching rapports photos', error: err.message });
  }
});

router.put('/rapportsPhotos/:id', auth, async (req, res) => {
  try {
    const rapportPhotoId = req.params.id;
    const updateData = req.body;
    const updatedRapportPhoto = await Constatation.findByIdAndUpdate(
      rapportPhotoId,
      { $set: { intituleMission: updateData.intituleMission, chantierName: updateData.chantierName, company: updateData.company, city: updateData.city, building: updateData.building, task: updateData.task, selectedDate: updateData.selectedDate, endDate: updateData.endDate } },
      { new: true }
    );
    if (!updatedRapportPhoto) return res.status(404).json({ success: false, message: 'Rapport photo not found' });
    res.json({ success: true, rapportPhoto: updatedRapportPhoto });
  } catch (err) {
    console.error('Error updating rapport photo:', err.message);
    res.status(500).json({ success: false, message: 'Error updating rapport photo', error: err.message });
  }
});

router.delete('/rapportsPhotos/:id', auth, async (req, res) => {
  try {
    const rapportPhotoId = req.params.id;
    const rapportPhoto = await Constatation.findById(rapportPhotoId);
    if (!rapportPhoto) return res.status(404).json({ success: false, message: 'Rapport photo not found' });
    if (rapportPhoto.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this rapport photo' });
    }
    await Constatation.findByIdAndDelete(rapportPhotoId);
    res.json({ success: true, message: 'Rapport photo deleted successfully' });
  } catch (err) {
    console.error('Error deleting rapport photo:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting rapport photo', error: err.message });
  }
});

module.exports = router;
