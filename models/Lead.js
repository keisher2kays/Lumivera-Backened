// backend-lumivera/models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Guest' },
  phoneOrEmail: { type: String },
  contact: { type: String }, // kept for backward compatibility with Stripe checkout code
  notes: { type: String },
  status: {
    type: String,
    enum: ['bot_chatting', 'needs_human', 'agent_connected', 'closed', 'New', 'Pending Payment', 'Paid'],
    default: 'bot_chatting'
  },
  interestedPackage: { type: String },
  installmentPlanActive: { type: Boolean, default: false },
  installmentsPaid: { type: Number, default: 0 },
  scheduledInstallDate: { type: Date },
  messages: [
    {
      sender: { type: String, enum: ['bot', 'user', 'agent'] },
      text: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
