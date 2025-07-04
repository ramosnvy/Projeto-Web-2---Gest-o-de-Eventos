const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { autenticar } = require('../middleware/auth');

// Estatísticas do dashboard
router.get('/stats', autenticar, DashboardController.getStats);

module.exports = router; 