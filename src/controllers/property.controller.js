const Property = require('../models/property.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all properties (with pagination)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, maxPrice, bedrooms, featured } = req.query;
        
        const query = {};
        
        if (maxPrice) {
            query.price = { $lte: parseFloat(maxPrice) };
        }
        
        if (bedrooms) {
            query.bedrooms = { $gte: parseInt(bedrooms) };
        }
        
        if (featured === 'true') {
            query.featured = true;
        }

        console.log('Query final:', query);

        const properties = await Property.find(query)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Property.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: properties.length,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: {
                properties
            }
        });

    } catch (error) {
        console.error('Erro ao buscar propriedades:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Erro interno do servidor ao buscar propriedades' 
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: property });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = async (req, res) => {
    try {
        const newProperty = await Property.create({
            ...req.body,
            agent: req.user._id // Assumindo que o usuário autenticado é o agente
        });

        res.status(201).json({
            status: 'success',
            data: {
                property: newProperty
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!property) {
            return res.status(404).json({
                status: 'fail',
                message: 'Propriedade não encontrada'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                property
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);

        if (!property) {
            return res.status(404).json({
                status: 'fail',
                message: 'Propriedade não encontrada'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// @desc    Toggle favorite property
// @route   POST /api/properties/:id/favorite
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
    }

    // Check if the property is already favorited by the user
    const index = property.favorites.indexOf(req.user.id);
    if (index === -1) {
        property.favorites.push(req.user.id);
    } else {
        property.favorites.splice(index, 1);
    }

    await property.save();

    res.status(200).json({ success: true, data: property });
});

// @desc    Request a visit
// @route   POST /api/properties/:id/visit
// @access  Private
exports.requestVisit = asyncHandler(async (req, res, next) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
    }

    // Check if user has already requested a visit today
    const today = new Date().setHours(0, 0, 0, 0);
    const visitRequests = property.visitRequests.filter(
        request => request.user.toString() === req.user.id && new Date(request.requestedAt).setHours(0, 0, 0, 0) === today
    );

    if (visitRequests.length >= 5) {
        return next(new ErrorResponse(`You have reached the maximum number of visit requests for today`, 400));
    }

    property.visitRequests.push({ user: req.user.id, requestedAt: Date.now() });
    await property.save();

    res.status(200).json({ success: true, data: property });
});

// Funções auxiliares para paginação
exports.getPropertiesPaginated = async (skip, limit, query = {}) => {
    return await Property.find(query)
        .skip(skip)
        .limit(limit);
};

exports.getTotalPropertiesCount = async (query = {}) => {
    return await Property.countDocuments(query);
};

// Não é necessário exportar novamente, pois já estamos usando exports.

// Adicione qualquer função que esteja faltando
exports.someFunction = async (req, res) => {
    res.status(501).json({
        status: 'error',
        message: 'Esta função ainda não foi implementada'
    });
};

// Adicione a função getFeaturedProperties
exports.getFeaturedProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const properties = await Property.find({ featured: true })
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments({ featured: true });

        res.status(200).json({
            status: 'success',
            results: properties.length,
            total,
            data: {
                properties
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Adicione a função getAgentDashboard
exports.getAgentDashboard = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou ID inválido'
            });
        }

        // Busca as 5 propriedades mais recentes de toda a plataforma
        const recentProperties = await Property.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('agent', 'name'); // Popula o nome do agente para exibição

        // Estatísticas específicas do corretor logado
        const totalProperties = await Property.countDocuments({ agent: req.user._id });
        const activeProperties = await Property.countDocuments({ agent: req.user._id, status: 'disponível' });
        const soldProperties = await Property.countDocuments({ agent: req.user._id, status: 'vendido' });

        console.log('Dados do dashboard:', { 
            totalProperties, 
            activeProperties, 
            soldProperties, 
            recentProperties 
        });

        res.status(200).json({
            status: 'success',
            data: {
                totalProperties,
                activeProperties,
                soldProperties,
                recentProperties
            }
        });
    } catch (error) {
        console.error('Erro ao carregar o dashboard do corretor:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao carregar o dashboard do corretor'
        });
    }
};