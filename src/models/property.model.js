const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    // Informações de Captação
    capturedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    capturedByName: {
        type: String,
        required: true
    },
    captureDate: {
        type: Date,
        default: Date.now
    },
    captureCity: {
        type: String,
    },
    captureCEP: {
        type: String,
    },

    // Localização do Imóvel
    address: {
        type: String,
    },
    neighborhood: {
        type: String,
    },
    isCondominium: {
        type: Boolean,
        default: false
    },
    block: String,
    apartmentNumber: String,

    // Características do Imóvel
    propertyType: {
        type: String,
        required: true,
        enum: ['Casa', 'Apartamento', 'Lote', 'Comercial']
    },
    secondaryType: {
        type: String,
        enum: ['Individual', 'Geminada', 'Sobrado', 'Condomínio']
    },
    totalArea: {
        type: Number,
    },
    builtArea: {
        type: Number,
    },
    garages: {
        type: Number,
    },

    // Tipologia do Imóvel
    bedrooms: {
        type: Number,
    },
    suites: {
        type: Number,
    },
    socialBathrooms: {
        type: Number,
    },
    hasBackyard: {
        type: Boolean,
        default: false
    },
    hasBalcony: {
        type: Boolean,
        default: false
    },
    hasElevator: {
        type: Boolean,
        default: false
    },
    floors: { type: Number, default: null },
  floor: { type: Number, default: null },

    // Informações de Visita
    occupancyStatus: {
        type: String,
        required: true,
        enum: ['Ocupado', 'Desocupado', 'Inquilino']
    },
    keyLocation: String,
    ownerName: {
        type: String,
    },
    ownerContact: {
        type: String,
    },

    // Informações Financeiras
    salePrice: {
        type: Number,
    },
    desiredNetPrice: Number,

    // Contrato de Exclusividade
    exclusivityContract: {
        startDate: Date,
        endDate: Date,
        hasPromotion: Boolean
    },

    // Detalhes Adicionais
    differentials: String,
    landmarks: String,
    generalObservations: String,

    // Campos existentes que podem ser mantidos
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [String],
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'disponível',
        enum: ['disponível', 'vendido', 'alugado']
    },
    views: {
        type: Number,
        default: 0
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visitRequests: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;