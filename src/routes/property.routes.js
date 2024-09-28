const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const { protect } = require('../middleware/auth.middleware');

// Verifique se todas as funções do controlador estão definidas
console.log('Funções do controlador:', Object.keys(propertyController));

// Rotas públicas
router.route('/')
  .get(propertyController.getProperties)
  .post(protect, propertyController.createProperty);

router.route('/:id')
  .get(propertyController.getProperty)
  .patch(protect, propertyController.updateProperty)
  .delete(protect, propertyController.deleteProperty);

// Rotas adicionais
router.post('/:id/favorite', protect, propertyController.toggleFavorite);
router.post('/:id/visit', protect, propertyController.requestVisit);

// Paginação e contagem de propriedades
router.get('/paginated', propertyController.getPropertiesPaginated);
router.get('/count', propertyController.getTotalPropertiesCount);

// Featured properties
router.get('/', propertyController.getProperties);

module.exports = router;