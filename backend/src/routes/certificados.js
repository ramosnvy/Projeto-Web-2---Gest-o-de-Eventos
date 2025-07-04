const express = require('express');
const router = express.Router();
const CertificadoController = require('../controllers/CertificadoController');
const { autenticar, autorizarOrganizador, autorizarParticipante } = require('../middleware/auth');
const { validarCertificado, validarId, validarPaginacao, validarFiltroData } = require('../middleware/validacao');

// Listar certificados (admin/organizador)
router.get('/', autenticar, autorizarOrganizador, validarPaginacao, CertificadoController.listar);
// Listar meus certificados (participante)
router.get('/meus', autenticar, autorizarParticipante, CertificadoController.listarMeusCertificados);
// Listar certificados de um evento (organizador ou admin)
router.get('/evento/:evento_id', autenticar, autorizarOrganizador, CertificadoController.listarPorEvento);
// Buscar certificado por inscrição
router.get('/inscricao/:inscricao_id', autenticar, CertificadoController.buscarPorInscricao);
// Buscar certificados por período
router.get('/periodo', autenticar, autorizarOrganizador, validarFiltroData, CertificadoController.buscarPorPeriodo);
// Estatísticas gerais
router.get('/estatisticas/total', autenticar, autorizarOrganizador, CertificadoController.estatisticas);
// Estatísticas de um evento
router.get('/estatisticas/evento/:evento_id', autenticar, autorizarOrganizador, CertificadoController.estatisticasEvento);

// Criar certificado (organizador ou admin)
router.post('/', autenticar, autorizarOrganizador, validarCertificado.criar, CertificadoController.criar);
// Emitir certificado automaticamente
router.post('/emitir/:inscricao_id', autenticar, autorizarOrganizador, CertificadoController.emitirCertificado);

// Buscar certificado por ID (deve vir depois das rotas específicas)
router.get('/:id', autenticar, validarId, CertificadoController.buscarPorId);
// Visualizar certificado (registra acesso)
router.get('/visualizar/:id', autenticar, CertificadoController.visualizarCertificado);
// Remover certificado (organizador ou admin)
router.delete('/:id', autenticar, autorizarOrganizador, validarId, CertificadoController.remover);

module.exports = router; 