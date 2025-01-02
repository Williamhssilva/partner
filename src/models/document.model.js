const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['RG', 'CPF', 'Comprovante_Residencia', 'Contrato', 'Outros']
    },
    path: {
        type: String,
        required: true
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema); 