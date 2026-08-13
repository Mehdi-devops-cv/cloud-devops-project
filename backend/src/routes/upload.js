const express = require('express');
const auth = require('../middlewares/auth');
const { upload, uploadToCloudinary } = require('../utils/avatar');
const { photoUploadSuccessTotal, photoUploadFailedTotal } = require('../metrics');

const router = express.Router();

router.get('/upload-test', (req, res) => {
  res.json({ message: 'Upload endpoint is loaded and accessible' });
});

router.post('/uploadRemarquePhoto', auth, upload.single('photo'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      photoUploadFailedTotal.inc();
      return res.status(400).json({ success: false, error: 'Photo requise.' });
    }
    const avatarUrl = await uploadToCloudinary(file.buffer, 'appbtp/remarques');
    photoUploadSuccessTotal.inc();
    return res.json({ success: true, avatarUrl });
  } catch (err) {
    console.error('Error uploading photo:', err);
    photoUploadFailedTotal.inc();
    return res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
});

const uploadFields = upload.fields([
  { name: 'imageAvant', maxCount: 1 },
  { name: 'imageApres', maxCount: 1 }
]);

router.post('/uploadConstatationPhoto', auth, uploadFields, async (req, res) => {
  try {
    const fileAvant = req.files['imageAvant'] ? req.files['imageAvant'][0] : null;
    const fileApres = req.files['imageApres'] ? req.files['imageApres'][0] : null;
    if (!fileAvant && !fileApres) {
      photoUploadFailedTotal.inc();
      return res.status(400).json({ error: 'Au moins une image est requise.' });
    }
    const result = { success: true };
    if (fileAvant) result.imageAvant = await uploadToCloudinary(fileAvant.buffer, 'appbtp/constatations');
    if (fileApres) result.imageApres = await uploadToCloudinary(fileApres.buffer, 'appbtp/constatations');
    photoUploadSuccessTotal.inc();
    return res.json(result);
  } catch (err) {
    console.error('Error processing upload:', err);
    photoUploadFailedTotal.inc();
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
