const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  images: [{ type: String, required: true }], // Mudado de 'image' para 'images'
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Mudado de 'user' para 'agent'
  // ... outros campos ...
}, {
  timestamps: true
});

// Adicione isso antes de criar o modelo
propertySchema.index({ featured: 1, price: 1, bedrooms: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;