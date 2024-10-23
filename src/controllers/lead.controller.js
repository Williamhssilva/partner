const Lead = require('../models/lead.model');
const Property = require('../models/property.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all leads
// @route   GET /api/v1/leads
// @access  Private
exports.getLeads = asyncHandler(async (req, res, next) => {
    console.log('Requisição recebida para buscar leads');
    console.log('Usuário autenticado:', req.user);

    const query = {};

    // Filtrar leads apenas se o usuário for um corretor
    if (req.user.role === 'corretor') {
        query.capturedBy = req.user._id; // Filtra leads atribuídos ao corretor
    }

    const leads = await Lead.find(query); // Busca os leads com base na consulta
    console.log('Leads encontrados:', leads);

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
    });
});

// @desc    Get single lead
// @route   GET /api/v1/leads/:id
// @access  Private
exports.getLead = asyncHandler(async (req, res, next) => {
    console.log('Requisição recebida para buscar lead específico');
    console.log('ID do lead:', req.params.id);

    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            console.log('Lead não encontrado');
            return res.status(404).json({
                success: false,
                error: 'Lead não encontrado'
            });
        }

        console.log('Lead encontrado:', lead);
        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Erro ao buscar lead:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar lead'
        });
    }
});

// @desc    Create new lead
// @route   POST /api/v1/leads
// @access  Private
exports.createLead = asyncHandler(async (req, res, next) => {
    console.log('Iniciando criação de lead');
    console.log('Dados recebidos:', req.body);

    try {
        // Adiciona o ID do corretor e o nome do corretor ao corpo da requisição
        req.body.capturedBy = req.user._id; // ID do corretor
        req.body.capturedByName = req.user.name; // Nome do corretor

        const lead = await Lead.create(req.body);
        res.status(201).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Erro detalhado ao criar lead:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Este email já está em uso por outro lead'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erro ao criar lead'
        });
    }
});

// @desc    Update lead
// @route   PUT /api/v1/leads/:id
// @access  Private
exports.updateLead = asyncHandler(async (req, res, next) => {
    console.log('Dados recebidos para atualização:', req.body);

    try {
        let lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead não encontrado'
            });
        }

        lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @desc    Delete lead
// @route   DELETE /api/v1/leads/:id
// @access  Private
exports.deleteLead = asyncHandler(async (req, res, next) => {
    console.log('Iniciando exclusão de lead');
    console.log('ID do lead:', req.params.id);

    try {
        const lead = await Lead.findById(req.params.id);
        console.log('Lead encontrado:', lead);

        if (!lead) {
            console.log('Lead não encontrado');
            return res.status(404).json({
                success: false,
                error: 'Lead não encontrado'
            });
        }

        console.log('Tentando excluir o lead');
        const result = await Lead.deleteOne({ _id: req.params.id });
        console.log('Resultado da exclusão:', result);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Erro detalhado ao excluir lead:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir lead: ' + error.message
        });
    }
});

// @desc    Update lead stage
// @route   PUT /api/v1/leads/:id/stage
// @access  Private
exports.updateLeadStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage, position, oldStage, oldPosition } = req.body;

        // Encontra o lead atual
        const lead = await Lead.findById(id);

        if (!lead) {
            return res.status(404).json({ message: 'Lead não encontrado' });
        }

        // Atualiza o estágio e a posição do lead
        lead.stage = stage;
        lead.position = position;

        // Atualiza as posições dos outros leads
        if (oldStage === stage) {
            // Movendo dentro do mesmo estágio
            if (position < oldPosition) {
                // Movendo para cima
                await Lead.updateMany(
                    { stage, position: { $gte: position, $lt: oldPosition }, _id: { $ne: id } },
                    { $inc: { position: 1 } }
                );
            } else {
                // Movendo para baixo
                await Lead.updateMany(
                    { stage, position: { $gt: oldPosition, $lte: position }, _id: { $ne: id } },
                    { $inc: { position: -1 } }
                );
            }
        } else {
            // Movendo para um novo estágio
            await Lead.updateMany(
                { stage: oldStage, position: { $gt: oldPosition } },
                { $inc: { position: -1 } }
            );
            await Lead.updateMany(
                { stage, position: { $gte: position }, _id: { $ne: id } },
                { $inc: { position: 1 } }
            );
        }

        // Salva as alterações
        await lead.save();

        // Busca todos os leads do estágio para garantir a ordem correta
        const stageLeads = await Lead.find({ stage }).sort('position');

        // Atualiza as posições para garantir que sejam sequenciais
        for (let i = 0; i < stageLeads.length; i++) {
            stageLeads[i].position = i;
            await stageLeads[i].save();
        }

        res.json({ success: true, data: lead });
    } catch (error) {
        console.error('Erro ao atualizar estágio do lead:', error);
        res.status(400).json({ message: 'Erro ao atualizar estágio do lead', error: error.message });
    }
};

exports.linkPropertyToLead = asyncHandler(async (req, res, next) => {
    console.log('Iniciando linkPropertyToLead');
    console.log('Params:', req.params);
    console.log('Body:', req.body);

    const { id } = req.params;
    const { propertyId } = req.body;

    console.log(`Tentando vincular propriedade ${propertyId} ao lead ${id}`);

    const lead = await Lead.findById(id);
    if (!lead) {
        console.log(`Lead não encontrado com id ${id}`);
        return next(new ErrorResponse(`Lead não encontrado com id ${id}`, 404));
    }

    console.log('Lead encontrado:', lead);

    const property = await Property.findById(propertyId);
    if (!property) {
        console.log(`Propriedade não encontrada com id ${propertyId}`);
        return next(new ErrorResponse(`Propriedade não encontrada com id ${propertyId}`, 404));
    }

    console.log('Propriedade encontrada:', property);

    lead.linkedProperty = propertyId;
    await lead.save();

    console.log(`Propriedade ${propertyId} vinculada com sucesso ao lead ${id}`);

    res.status(200).json({
        success: true,
        data: lead
    });
});
