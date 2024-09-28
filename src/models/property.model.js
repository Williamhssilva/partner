const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['casa', 'apartamento', 'terreno'] },
  price: { type: Number, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  features: [String],
  images: [String], // URLs das imagens
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['disponível', 'vendido', 'alugado'], default: 'disponível' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visitRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date, default: Date.now }
  }],
  featured: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true }
}, {
  timestamps: true
});

// Adicione isso antes de criar o modelo
propertySchema.index({ featured: 1, price: 1, bedrooms: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;