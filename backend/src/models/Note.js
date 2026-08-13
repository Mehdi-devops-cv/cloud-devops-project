const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  city: { type: String, required: true },
  building: { type: String, required: true },
  task: { type: String, required: true },
  floor: { type: String, required: true },
  apartment: { type: String, required: true },
  company: { type: String, required: true },
  openTime: { type: String, default: '' },
  closedTime: { type: String, default: '' },
  selectedDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
