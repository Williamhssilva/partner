const express = require('express');
const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStage
} = require('../controllers/lead.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const leadController = require('../controllers/lead.controller');
const documentController = require('../controllers/document.controller');

const router = express.Router();

router.use(protect); // Todas as rotas de lead requerem autenticação

router.route('/')
    .get(authorize('corretor', 'administrador'), getLeads)
    .post(authorize('corretor', 'administrador'), createLead);

router.route('/:id')
    .get(authorize('corretor', 'administrador'), getLead)
    .put(authorize('corretor', 'administrador'), updateLead)
    .delete(authorize('corretor', 'administrador'), deleteLead);

// Nova rota para atualizar o estágio do lead
router.route('/:id/stage')
    .put(authorize('corretor', 'administrador'), updateLeadStage);

// Linkar propriedade ao lead
router.post('/:id/link-property', leadController.linkPropertyToLead);
router.delete('/:id/unlink-property', leadController.unlinkPropertyFromLead);

// Rotas de documentos
router.post('/:id/documents', documentController.uploadDocument);
router.get('/:id/documents', documentController.getDocuments);
router.get('/:id/documents/:documentId/download', documentController.downloadDocument);
router.delete('/:id/documents/:documentId', protect, documentController.deleteDocument);

module.exports = router;
