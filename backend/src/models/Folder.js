const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  reportNumber: { type: Number, required: true },
  chantierName: { type: String, required: true },
  company: { type: String, required: true },
  city: { type: String, required: true },
  building: { type: String, required: true },
  task: { type: String, required: true },
  mission: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Folder', folderSchema);
