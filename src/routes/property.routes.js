const express = require('express');
const multer = require('multer');
const path = require('path');
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

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Não é uma imagem! Por favor, envie apenas imagens.'), false);
        }
    }
});

// Aplica o middleware protect a todas as rotas abaixo
router.use(protect);

// Rotas públicas
router.route('/')
  .get(propertyController.getProperties)
  .post(protect, authorize('corretor', 'administrador'), upload.array('images', 10), propertyController.createProperty);

router.route('/:id')
  .get(propertyController.getProperty)
  .patch(protect, upload.array('images', 30), propertyController.updateProperty)
  .delete(protect, propertyController.deleteProperty);

// Rotas adicionais
router.post('/:id/favorite', protect, propertyController.toggleFavorite);
router.post('/:id/visit', protect, propertyController.requestVisit);

// Rotas para paginação e contagem (se ainda necessárias)
router.get('/paginated', propertyController.getPropertiesPaginated);
router.get('/count', propertyController.getTotalPropertiesCount);

// Featured properties
router.get('/', propertyController.getProperties);

// Nova rota para o dashboard do corretor
router.get('/agent/dashboard', protect, propertyController.getAgentDashboard);

// rota para similar properties 
router.get('/:id/similar', propertyController.getSimilarProperties);
// rota para atualizar propriedade
//router.put('/properties/:id', protect, propertyController.updateProperty);

router.delete('/:id/images/:index', protect, propertyController.removeImage);

module.exports = router;