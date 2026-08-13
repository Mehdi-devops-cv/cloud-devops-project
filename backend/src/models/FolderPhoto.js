const mongoose = require('mongoose');

const folderPhotoSchema = new mongoose.Schema({
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  imageAvant: { type: String, required: true },
  imageApres: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FolderPhoto', folderPhotoSchema);
