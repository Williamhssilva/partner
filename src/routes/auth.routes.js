const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// Rota de registro
router.post('/register', authController.signup);

// Rota de login
router.post('/login', authController.login);

// Rota para obter o perfil do usuário atual
router.get('/me', authController.protect, authController.getMe);

// Rota para aprovar um agente (corretor)
router.patch('/approve-agent/:id', authController.approveAgentNoAuth);

// Rota para obter corretores pendentes
router.get('/pending-agents', authController.getPendingAgents);

module.exports = router;