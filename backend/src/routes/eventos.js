const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/EventoController');
const { autenticar, autorizarOrganizador, autorizarParticipante } = require('../middleware/auth');
const { validarEvento, validarId, validarBusca, validarPaginacao, validarFiltroData } = require('../middleware/validacao');

// Listar eventos (todos)
router.get('/', autenticar, validarPaginacao, EventoController.listar);
// Listar eventos futuros
router.get('/futuros', autenticar, EventoController.listarFuturos);
// Listar eventos do organizador
router.get('/meus', autenticar, autorizarOrganizador, EventoController.listarPorOrganizador);
// Listar eventos com inscrições
router.get('/com-inscricoes', autenticar, autorizarOrganizador, EventoController.listarComInscricoes);
// Buscar eventos por período
router.get('/periodo', autenticar, validarFiltroData, EventoController.buscarPorPeriodo);
// Buscar eventos por termo
router.get('/buscar', autenticar, validarBusca, EventoController.buscar);
// Estatísticas gerais
router.get('/estatisticas/total', autenticar, autorizarOrganizador, EventoController.estatisticas);
// Estatísticas do organizador
router.get('/estatisticas/meus', autenticar, autorizarOrganizador, EventoController.estatisticasOrganizador);

// Criar evento (organizador ou admin)
router.post('/', autenticar, autorizarOrganizador, validarEvento.criar, EventoController.criar);

// Buscar evento por ID (deve vir depois das rotas específicas)
router.get('/:id', autenticar, validarId, EventoController.buscarPorId);
// Atualizar evento (organizador ou admin)
router.put('/:id', autenticar, autorizarOrganizador, validarId, validarEvento.atualizar, EventoController.atualizar);
// Remover evento (organizador ou admin)
router.delete('/:id', autenticar, autorizarOrganizador, validarId, EventoController.remover);

module.exports = router; 