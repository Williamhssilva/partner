const express = require('express');
const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStage // Adicionamos esta nova função
} = require('../controllers/lead.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

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

module.exports = router;
