


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  plainPassword: { // <-- ADD THIS for eye view
    type: String,
  },
  role: { 
    type: String, 
    enum: ['admin', 'sales_rep'], 
    default: 'sales_rep' 
  },
  name: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);