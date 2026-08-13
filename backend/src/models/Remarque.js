const mongoose = require('mongoose');

const remarqueSchema = new mongoose.Schema({
  city: { type: String, required: true },
  building: { type: String, required: true },
  task: { type: String, required: true },
  floor: { type: String, required: true },
  apartment: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: true },
  selectedDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Remarque', remarqueSchema);
