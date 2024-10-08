const Property = require('../models/property.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// No início do arquivo, adicione esta função auxiliar
function parseNumberOrNull(value) {
    if (value === '' || value === undefined) return null;
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
}

// @desc    Get all properties (with pagination)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
    try {
        
        const { page = 1, limit = 10, maxPrice, minPrice, bedrooms, propertyType, neighborhood, captureCity } = req.query;

        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado'
            });
        }

        const query = {};

        // Filtrar por agente apenas se o usuário for um corretor
        console.log("rota de usuário", req.user.role);
        if (req.user.role === 'corretor') {
            query.capturedBy = req.user._id;
        }

        if (maxPrice) {
            query.salePrice = { ...query.salePrice, $lte: parseFloat(maxPrice) };
        }
        if (minPrice) {
            query.salePrice = { ...query.salePrice, $gte: parseFloat(minPrice) };
        }
        if (bedrooms) {
            query.bedrooms = { $gte: parseInt(bedrooms) };
        }
        if (propertyType) {
            query.propertyType = propertyType;
        }
        if (neighborhood) {
            query.neighborhood = neighborhood;
        }
        if (captureCity) {
            query.captureCity = captureCity;
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

    res.status(200).json({
        status: 'success',
        data: {
            property
        }
    });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = asyncHandler(async (req, res) => {
    console.log('Iniciando criação de propriedade');
    console.log('Dados recebidos:', req.body);
    console.log('Arquivos recebidos:', req.files);

    const propertyData = {
        ...req.body,
        capturedBy: req.user._id,
        capturedByName: req.user.name,
        isCondominium: req.body.isCondominium === 'true',
        hasBackyard: req.body.hasBackyard === 'true',
        hasBalcony: req.body.hasBalcony === 'true',
        hasElevator: req.body.hasElevator === 'true',
        totalArea: parseNumberOrNull(req.body.totalArea),
        builtArea: parseNumberOrNull(req.body.builtArea),
        garages: parseNumberOrNull(req.body.garages),
        bedrooms: parseNumberOrNull(req.body.bedrooms),
        suites: parseNumberOrNull(req.body.suites),
        socialBathrooms: parseNumberOrNull(req.body.socialBathrooms),
        floors: parseNumberOrNull(req.body.floors),
        floor: parseNumberOrNull(req.body.floor),
        salePrice: parseNumberOrNull(req.body.salePrice) || 0,
        desiredNetPrice: parseNumberOrNull(req.body.desiredNetPrice),
        exclusivityContract: {
            startDate: req.body.exclusivityStartDate,
            endDate: req.body.exclusivityEndDate,
            hasPromotion: req.body.hasPromotion === 'true'
        },
        title: req.body.title || `Propriedade em ${req.body.neighborhood || 'localização desconhecida'}`,
        description: req.body.description || `${req.body.propertyType || 'Propriedade'} em ${req.body.neighborhood || 'localização desconhecida'}`
    };

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
        propertyData.images = req.files.map(file => `/uploads/${file.filename}`);
        console.log('Imagens processadas:', propertyData.images);
    }

    try {
        console.log('Tentando criar propriedade no banco de dados');
        const property = await Property.create(propertyData);
        console.log('Propriedade criada com sucesso:', property);

        res.status(201).json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Erro ao criar propriedade:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            details: error.errors ? Object.values(error.errors).map(err => err.message) : []
        });
    }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = asyncHandler(async (req, res, next) => {
    console.log('Iniciando atualização da propriedade');
    console.log('ID da propriedade:', req.params.id);
    console.log('Dados recebidos:', req.body);
    console.log('Arquivos recebidos:', req.files);

    let property = await Property.findById(req.params.id);

    if (!property) {
        return next(new ErrorResponse(`Property not found with id of ${req.params.id}`, 404));
    }

    // Verificar se o usuário tem permissão para atualizar esta propriedade
    if (property.capturedBy.toString() !== req.user.id && req.user.role !== 'administrador') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this property`, 401));
    }

    const updateData = { ...req.body };

    // No método de atualização da propriedade
    console.log('Dados recebidos:', req.body);

    let updatedImages = [];
    if (req.body.existingImages) {
        try {
            updatedImages = JSON.parse(req.body.existingImages);
            console.log('Imagens existentes recebidas:', updatedImages);
        } catch (error) {
            console.error('Erro ao analisar imagens existentes:', error);
        }
    }

    // Se não houver imagens existentes e nenhuma nova imagem, mantenha as imagens atuais
    if (updatedImages.length === 0 && (!req.files || req.files.length === 0)) {
        updatedImages = property.images;
    }

    // Adicionar novas imagens, se houver
    if (req.files && req.files.length > 0) {
        const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
        updatedImages = [...updatedImages, ...newImagePaths];
        console.log('Ordem das imagens antes de salvar:', updatedImages.images);
    }

    console.log('Imagens após processamento:', updatedImages);

    // Atualizar o campo images no updateData com a nova ordem
    updateData.images = updatedImages;

    // Atualizar campos booleanos
    ['isCondominium', 'hasBackyard', 'hasBalcony', 'hasElevator', 'hasPromotion'].forEach(field => {
        updateData[field] = updateData[field] === 'true';
    });

    // Lidar com o campo hasPromotion separadamente
    if ('exclusivityContract.hasPromotion' in updateData) {
        updateData.exclusivityContract = {
            ...property.exclusivityContract,
            hasPromotion: updateData['exclusivityContract.hasPromotion'] === 'true'
        };
        delete updateData['exclusivityContract.hasPromotion'];
    }

    // Atualizar campos numéricos
    ['totalArea', 'builtArea', 'garages', 'bedrooms', 'suites', 'socialBathrooms', 'floors', 'floor', 'salePrice', 'desiredNetPrice'].forEach(field => {
        if (field in updateData) {
            updateData[field] = parseNumberOrNull(updateData[field]);
        }
    });

    console.log('Dados de atualização final:', updateData);

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    console.log('Propriedade atualizada:', property);

    res.status(200).json({
        status: 'success',
        data: {
            property
        }
    });
});

exports.removeImage = asyncHandler(async (req, res, next) => {
    console.log('Iniciando remoção de imagem');
    const { id, index } = req.params;
    console.log(`ID da propriedade: ${id}, Índice da imagem: ${index}`);

    let property = await Property.findById(id);

    if (!property) {
        return next(new ErrorResponse(`Property not found with id of ${id}`, 404));
    }

    // Verificar se o usuário tem permissão para atualizar esta propriedade
    if (property.capturedBy.toString() !== req.user.id && req.user.role !== 'administrador') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this property`, 401));
    }

    if (index < 0 || index >= property.images.length) {
        return next(new ErrorResponse(`Invalid image index`, 400));
    }

    const imageToRemove = property.images[index];
    console.log('Imagem a ser removida:', imageToRemove);

    // Remover a imagem do array
    property.images.splice(index, 1);

    // Salvar a propriedade atualizada
    await property.save();
    console.log('Propriedade atualizada no banco de dados');

    // Remover o arquivo físico
    const filePath = path.join(__dirname, '..', '..', imageToRemove);
    console.log('Caminho do arquivo a ser removido:', filePath);
    try {
        await fs.unlink(filePath);
        console.log('Arquivo físico removido com sucesso');
    } catch (error) {
        console.error('Erro ao remover arquivo físico:', error);
        // Não retornamos erro aqui para não impedir a atualização do banco de dados
    }

    console.log('Propriedade após remoção da imagem:', property);

    res.status(200).json({
        status: 'success',
        data: {
            property
        }
    });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = asyncHandler(async (req, res, next) => {
    console.log('Iniciando deleteProperty');
    console.log('ID da propriedade:', req.params.id);
    console.log('Usuário atual:', req.user);

    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            console.log('Propriedade não encontrada');
            return next(new ErrorResponse(`Propriedade não encontrada com id ${req.params.id}`, 404));
        }

        console.log('Propriedade encontrada:', property);

        // Verificar se o usuário tem permissão para excluir a propriedade
        if (property.capturedBy.toString() !== req.user.id && req.user.role !== 'administrador') {
            console.log('Usuário não tem permissão para excluir esta propriedade');
            return next(new ErrorResponse(`Usuário não tem permissão para excluir esta propriedade`, 403));
        }

        // Usar deleteOne() em vez de remove()
        const result = await Property.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            console.log('Propriedade não foi excluída');
            return next(new ErrorResponse(`Falha ao excluir a propriedade`, 500));
        }

        console.log('Propriedade excluída com sucesso');

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Erro ao excluir propriedade:', error);
        next(error);
    }
});

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

exports.getAgentDashboard = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou ID inválido'
            });
        }

        const agentId = req.user._id;

        // Estatísticas básicas
        const totalProperties = await Property.countDocuments({ agent: agentId });
        const activeProperties = await Property.countDocuments({ agent: agentId, status: 'disponível' });
        const soldProperties = await Property.countDocuments({ agent: agentId, status: 'vendido' });

        // Propriedades recentes
        const recentProperties = await Property.find({ agent: agentId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Total de visualizações de todas as propriedades do corretor
        const totalViews = await Property.aggregate([
            { $match: { agent: agentId } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);

        // Média de preço das propriedades ativas
        const averagePrice = await Property.aggregate([
            { $match: { agent: agentId, status: 'disponível' } },
            { $group: { _id: null, avgPrice: { $avg: "$price" } } }
        ]);

        // Contagem de propriedades por tipo
        const propertiesByType = await Property.aggregate([
            { $match: { agent: agentId } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // Dados para gráfico de tendência de preços (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const priceTrend = await Property.aggregate([
            { $match: { agent: agentId, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    avgPrice: { $avg: "$price" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalProperties,
                activeProperties,
                soldProperties,
                recentProperties,
                totalViews: totalViews[0]?.totalViews || 0,
                averagePrice: averagePrice[0]?.avgPrice || 0,
                propertiesByType,
                priceTrend
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

// Adicione esta função no final do arquivo
exports.getSimilarProperties = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({
                status: 'fail',
                message: 'Propriedade não encontrada'
            });
        }

        const similarProperties = await Property.find({
            _id: { $ne: property._id },
            type: property.type,
            price: { $gte: property.price * 0.8, $lte: property.price * 1.2 },
            bedrooms: { $gte: property.bedrooms - 1, $lte: property.bedrooms + 1 }
        })
            .limit(4);

        res.status(200).json({
            status: 'success',
            data: {
                similarProperties
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};