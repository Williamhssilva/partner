const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    // Informações de Captação
    capturedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    captureDate: {
        type: Date,
        default: Date.now
    },
    captureCity: {
        type: String,
        required: true
    },
    captureCEP: {
        type: String,
        required: true
    },

    // Localização do Imóvel
    address: {
        type: String,
        required: true
    },
    neighborhood: {
        type: String,
        required: true
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
        required: true
    },
    builtArea: {
        type: Number,
        required: true
    },

    // Tipologia do Imóvel
    bedrooms: {
        type: Number,
        required: true
    },
    suites: {
        type: Number,
        required: true
    },
    socialBathrooms: {
        type: Number,
        required: true
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
    floors: Number,
    floor: Number,

    // Informações de Visita
    occupancyStatus: {
        type: String,
        required: true,
        enum: ['Ocupado', 'Desocupado', 'Inquilino']
    },
    keyLocation: String,
    ownerName: {
        type: String,
        required: true
    },
    ownerContact: {
        type: String,
        required: true
    },

    // Informações Financeiras
    salePrice: {
        type: Number,
        required: true
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