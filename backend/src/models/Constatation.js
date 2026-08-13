const mongoose = require('mongoose');

const constatationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  building: { type: String, required: true },
  task: { type: String, required: true },
  selectedDate: { type: Date, required: true },
  endDate: { type: Date, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportNumber: { type: Number, required: false },
  chantierName: { type: String, required: false },
  company: { type: String, required: false },
  imageAvant: { type: String, required: false },
  imageApres: { type: String, required: false },
  floor: { type: String, required: false },
  apartment: { type: String, required: false },
  description: { type: String, required: false },
  image: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Constatation', constatationSchema);
