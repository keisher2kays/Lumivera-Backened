

// backend-lumivera/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Solar Panels', 'Inverters', 'Batteries', 'Drones', 'Accessories', 'Borehole'],
    required: true,
  },
  priceZimUSD: { type: Number, required: true },
  priceUKGBP: { type: Number },
  stockQuantity: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true }, // auto-derived from stockQuantity
  specs: [{ type: String }],
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);