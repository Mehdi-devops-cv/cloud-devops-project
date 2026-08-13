const mongoose = require('mongoose');

const effectifSchema = new mongoose.Schema({
  city: { type: String, required: true },
  building: { type: String, required: true },
  task: { type: String, required: true },
  floor: { type: String, required: true },
  apartment: { type: String, required: true },
  company: { type: String, required: true },
  nombrePersonnes: { type: Number, required: true },
  selectedDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Effectif', effectifSchema);
