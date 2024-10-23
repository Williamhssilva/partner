const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Por favor, forneça um nome para o lead']
    },
    capturedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    capturedByName: {
        type: String
    },
    email: { 
        type: String, 
        required: [true, 'Por favor, forneça um email para o lead'], 
        lowercase: true,
        trim: true
    },
    phone: String,
    interest: {
        type: String,
        enum: ['compra', 'venda', 'aluguel', 'investimento'],
        required: [true, 'Por favor, especifique o interesse do lead']
    },
    status: {
        type: String,
        enum: ['novo', 'em_andamento', 'qualificado', 'perdido', 'convertido'],
        default: 'novo'
    },
    stage: {
        type: String,
        enum: ['novo', 'qualificacao', 'apresentacao', 'visita', 'negociacao', 'contrato', 'concluido', 'posvenda'],
        default: 'novo'
    },
    position: {
        type: Number,
        default: 0
    },
    notes: String,
    lastContact: Date,
    nextAction: String,
    nextActionDate: Date,
    assignedAgent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    interestedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    createdAt: { 
        type: Date, 
        default: Date.now
    },
    linkedProperty: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property'
    }
}, {
    timestamps: true
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
