const Lead = require('../models/lead.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all leads
// @route   GET /api/v1/leads
// @access  Private
exports.getLeads = asyncHandler(async (req, res, next) => {
    console.log('Requisição recebida para buscar leads');
    console.log('Usuário autenticado:', req.user);

    const leads = await Lead.find();
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
exports.updateLeadStage = asyncHandler(async (req, res, next) => {
    const { stage } = req.body;

    if (!stage) {
        return next(new ErrorResponse('Por favor, forneça um estágio válido', 400));
    }

    const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { stage },
        { new: true, runValidators: true }
    );

    if (!lead) {
        return next(new ErrorResponse(`Lead não encontrado com id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: lead
    });
});