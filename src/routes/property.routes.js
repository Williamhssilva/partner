const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { protect } = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const properties = await propertyController.getPropertiesPaginated(skip, limit);
        const total = await propertyController.getTotalPropertiesCount();

        res.json({
            success: true,
            data: properties,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', propertyController.getProperty);

// Rotas protegidas
router.use(protect);
router.post('/', propertyController.createProperty);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

// Rotas adicionais
router.post('/:id/favorite', propertyController.toggleFavorite);
router.post('/:id/visit', propertyController.requestVisit);

module.exports = router;