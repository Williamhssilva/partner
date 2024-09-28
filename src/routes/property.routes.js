const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { protect } = require('../middleware/auth.middleware');

// Rotas públicas
router.get('/', propertyController.getProperties);
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