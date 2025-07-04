const express = require('express');
const router = express.Router();
const AcessoCertificado = require('../models/AcessoCertificado');
const { autenticar, autorizarAdmin } = require('../middleware/auth');
const { validarAcessoCertificado, validarId, validarPaginacao, validarFiltroData } = require('../middleware/validacao');

// Listar acessos (admin)
router.get('/', autenticar, autorizarAdmin, validarPaginacao, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const acessos = await AcessoCertificado.buscarTodosEnriquecido(limit, skip);
        res.json({ sucesso: true, dados: acessos });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Buscar acessos por período
router.get('/periodo', autenticar, autorizarAdmin, validarFiltroData, async (req, res) => {
    try {
        const { data_inicio, data_fim } = req.query;
        const dataInicio = new Date(data_inicio);
        const dataFim = new Date(data_fim);
        const acessos = await AcessoCertificado.buscarPorPeriodo(dataInicio, dataFim);
        res.json({ sucesso: true, dados: acessos });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Buscar acessos recentes
router.get('/recentes', autenticar, autorizarAdmin, async (req, res) => {
    try {
        const acessos = await AcessoCertificado.buscarRecentes(5);
        res.json({ sucesso: true, dados: acessos });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Estatísticas de acessos
router.get('/estatisticas/total', autenticar, autorizarAdmin, async (req, res) => {
    try {
        const estatisticas = await AcessoCertificado.buscarEstatisticas();
        res.json({ sucesso: true, dados: estatisticas });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Criar acesso manualmente (admin)
router.post('/', autenticar, autorizarAdmin, validarAcessoCertificado.criar, async (req, res) => {
    try {
        const acesso = await AcessoCertificado.criar(req.body);
        res.status(201).json({ sucesso: true, mensagem: 'Acesso registrado com sucesso', dados: acesso });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Buscar acesso por ID (deve vir depois das rotas específicas)
router.get('/:id', autenticar, autorizarAdmin, async (req, res) => {
    try {
        const acesso = await AcessoCertificado.buscarPorId(req.params.id);
        if (!acesso) {
            return res.status(404).json({ sucesso: false, mensagem: 'Acesso não encontrado' });
        }
        res.json({ sucesso: true, dados: acesso });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Atualizar acesso (admin)
router.put('/:id', autenticar, autorizarAdmin, async (req, res) => {
    try {
        const resultado = await AcessoCertificado.atualizar(req.params.id, req.body);
        res.json({ sucesso: true, mensagem: 'Acesso atualizado com sucesso', dados: resultado });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Remover acesso (admin)
router.delete('/:id', autenticar, autorizarAdmin, async (req, res) => {
    try {
        await AcessoCertificado.remover(req.params.id);
        res.json({ sucesso: true, mensagem: 'Acesso removido com sucesso' });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

module.exports = router; 