const express = require('express');
const { Folder, FolderPhoto } = require('../models');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { chantierName, company, city, building, task, mission, startDate, endDate } = req.body;
    const lastFolder = await Folder.findOne().sort({ reportNumber: -1 });
    const reportNumber = lastFolder ? lastFolder.reportNumber + 1 : 1;

    const folder = new Folder({
      reportNumber, chantierName, company, city, building, task, mission,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      userId: req.user._id
    });
    await folder.save();
    res.json({ success: true, folder });
  } catch (err) {
    console.error('Error creating folder:', err.message);
    res.status(500).json({ success: false, message: 'Error creating folder', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { city, building, task, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };
    if (city) filter.city = city;
    if (building) filter.building = building;
    if (task) filter.task = task;
    if (startDate) {
      const date = new Date(startDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      filter.startDate = { $gte: date, $lt: nextDate };
    }
    const folders = await Folder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, folders });
  } catch (err) {
    console.error('Error fetching folders:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching folders', error: err.message });
  }
});

router.get('/dates', auth, async (req, res) => {
  try {
    const { city, building, task } = req.query;
    const filter = { userId: req.user._id };
    if (city) filter.city = city;
    if (building) filter.building = building;
    if (task) filter.task = task;

    const folders = await Folder.find(filter).select('startDate').lean();
    const set = new Set();
    for (const folder of folders) {
      if (folder.startDate) {
        const d = new Date(folder.startDate);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        set.add(`${y}-${m}-${day}`);
      }
    }
    return res.json({ success: true, dates: Array.from(set) });
  } catch (err) {
    console.error('Error fetching folder dates:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching folder dates', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const folderId = req.params.id;
    const { chantierName, company, mission, startDate, endDate } = req.body;
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ success: false, message: 'Dossier non trouvé' });
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Non autorisé à modifier ce dossier' });
    }
    if (chantierName) folder.chantierName = chantierName;
    if (company) folder.company = company;
    if (mission) folder.mission = mission;
    if (startDate) folder.startDate = new Date(startDate);
    if (endDate) folder.endDate = new Date(endDate);
    await folder.save();
    res.json({ success: true, folder });
  } catch (err) {
    console.error('Error updating folder:', err.message);
    res.status(500).json({ success: false, message: 'Error updating folder', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const folderId = req.params.id;
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this folder' });
    }
    await FolderPhoto.deleteMany({ folderId });
    await Folder.findByIdAndDelete(folderId);
    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (err) {
    console.error('Error deleting folder:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting folder', error: err.message });
  }
});

// Photos within folders
router.post('/:folderId/photos', auth, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { imageAvant, imageApres } = req.body;
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to add photos to this folder' });
    }
    const photo = new FolderPhoto({ folderId, imageAvant, imageApres, userId: req.user._id });
    await photo.save();
    res.json({ success: true, photo });
  } catch (err) {
    console.error('Error adding photo to folder:', err.message);
    res.status(500).json({ success: false, message: 'Error adding photo', error: err.message });
  }
});

router.get('/:folderId/photos', auth, async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this folder' });
    }
    const photos = await FolderPhoto.find({ folderId }).sort({ createdAt: -1 });
    res.json({ success: true, photos });
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching photos', error: err.message });
  }
});

// Standalone photo operations
router.put('/photos/:id', auth, async (req, res) => {
  try {
    const photoId = req.params.id;
    const { imageApres } = req.body;
    if (!imageApres) return res.status(400).json({ success: false, message: 'imageApres is required' });
    const photo = await FolderPhoto.findById(photoId);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    if (photo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this photo' });
    }
    photo.imageApres = imageApres;
    await photo.save();
    res.json({ success: true, photo });
  } catch (err) {
    console.error('Error updating photo:', err.message);
    res.status(500).json({ success: false, message: 'Error updating photo', error: err.message });
  }
});

router.delete('/photos/:id', auth, async (req, res) => {
  try {
    const photoId = req.params.id;
    const photo = await FolderPhoto.findById(photoId);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    if (photo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this photo' });
    }
    await FolderPhoto.findByIdAndDelete(photoId);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (err) {
    console.error('Error deleting photo:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting photo', error: err.message });
  }
});

module.exports = router;
