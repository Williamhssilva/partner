const express = require('express');
const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStage  // Adicione esta linha
} = require('../controllers/lead.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const leadController = require('../controllers/lead.controller'); // Adicione esta linha

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

// Atualizar o estágio do lead
//router.put('/:id/stage', updateLeadStage);

// Linkar propriedade ao lead
router.post('/:id/link-property', protect, leadController.linkPropertyToLead);

router.delete('/:id/unlink-property', protect, leadController.unlinkPropertyFromLead);

module.exports = router;
