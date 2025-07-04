const express = require('express');
const router = express.Router();
const InscricaoController = require('../controllers/InscricaoController');
const { autenticar, autorizarParticipante, autorizarOrganizador } = require('../middleware/auth');
const { validarInscricao, validarId, validarPaginacao, validarFiltroData } = require('../middleware/validacao');

// Listar inscrições (admin/organizador)
router.get('/', autenticar, autorizarOrganizador, validarPaginacao, InscricaoController.listar);
// Listar minhas inscrições (participante)
router.get('/minhas', autenticar, autorizarParticipante, InscricaoController.listarMinhasInscricoes);
// Listar inscrições com certificados (participante)
router.get('/minhas/certificados', autenticar, autorizarParticipante, InscricaoController.listarComCertificados);
// Listar inscrições dos eventos do organizador
router.get('/meus-eventos', autenticar, autorizarOrganizador, InscricaoController.listarInscricoesMeusEventos);
// Listar inscrições de um evento (organizador ou admin)
router.get('/evento/:evento_id', autenticar, autorizarOrganizador, InscricaoController.listarPorEvento);
// Verificar se está inscrito em um evento (participante)
router.get('/verificar/:evento_id', autenticar, autorizarParticipante, InscricaoController.verificarInscricao);
// Buscar inscrições por período
router.get('/periodo', autenticar, autorizarOrganizador, validarFiltroData, InscricaoController.buscarPorPeriodo);
// Estatísticas gerais
router.get('/estatisticas/total', autenticar, autorizarOrganizador, InscricaoController.estatisticas);
// Estatísticas de um evento
router.get('/estatisticas/evento/:evento_id', autenticar, autorizarOrganizador, InscricaoController.estatisticasEvento);

// Criar inscrição (participante)
router.post('/', autenticar, autorizarParticipante, validarInscricao.criar, InscricaoController.criar);

// Aprovar inscrição (admin/organizador)
router.put('/:id/aprovar', autenticar, autorizarOrganizador, validarId, InscricaoController.aprovar);
// Rejeitar inscrição (admin/organizador)
router.put('/:id/rejeitar', autenticar, autorizarOrganizador, validarId, InscricaoController.rejeitar);
// Listar inscrições pendentes de um evento (admin/organizador)
router.get('/evento/:evento_id/pendentes', autenticar, autorizarOrganizador, InscricaoController.listarPendentesPorEvento);

// Buscar inscrição por ID (deve vir depois das rotas específicas)
router.get('/:id', autenticar, validarId, InscricaoController.buscarPorId);
// Remover inscrição (participante ou admin)
router.delete('/:id', autenticar, validarId, InscricaoController.remover);
// Cancelar inscrição em evento (participante)
router.delete('/cancelar/:evento_id', autenticar, autorizarParticipante, InscricaoController.cancelarInscricao);

module.exports = router; 