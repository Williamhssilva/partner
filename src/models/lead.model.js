const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, adicione um nome']
    },
    email: {
        type: String,
        required: [true, 'Por favor, adicione um email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, adicione um email válido'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Por favor, adicione um número de telefone']
    },
    interest: {
        type: String,
        required: [true, 'Por favor, especifique o interesse']
    },
    status: {
        type: String,
        required: [true, 'Por favor, especifique o status']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lead', LeadSchema);
