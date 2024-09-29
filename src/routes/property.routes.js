const express = require('express');
const multer = require('multer');
const path = require('path');
const { createProperty } = require('../controllers/property.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const propertyController = require('../controllers/property.controller');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rotas públicas
router.route('/')
  .get(propertyController.getProperties)
  .post(protect, authorize('corretor', 'administrador'), upload.array('images', 5), propertyController.createProperty);

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

// Nova rota para o dashboard do corretor
router.get('/agent/dashboard', protect, propertyController.getAgentDashboard);

// Adicione esta linha junto com as outras rotas
router.get('/:id/similar', propertyController.getSimilarProperties);

module.exports = router;