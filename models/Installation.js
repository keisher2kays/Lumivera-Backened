const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  maxSlots: { type: Number, default: 2 }, // e.g. Max 2 installations per day
  bookedSlots: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  clients: [
    {
      leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
      clientName: String,
      phone: String,
      packageName: String,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Installation', installationSchema);