const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');
const { autenticar, autorizarAdmin } = require('../middleware/auth');
const { validarCategoria, validarId, validarBusca } = require('../middleware/validacao');

// Listar categorias
router.get('/', autenticar, async (req, res) => {
    try {
        const categorias = await Categoria.buscarTodas();
        res.json({
            sucesso: true,
            dados: {
                categorias
            }
        });
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});

// Buscar categorias por termo
router.get('/buscar', autenticar, validarBusca, async (req, res) => {
    try {
        const { q } = req.query;
        const categorias = await Categoria.buscarPorTermo(q);
        res.json({ sucesso: true, dados: categorias });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Listar categorias com contagem de eventos
router.get('/com-eventos', autenticar, autorizarAdmin, async (req, res) => {
    try {
        const categorias = await Categoria.buscarComContagemEventos();
        res.json({ sucesso: true, dados: categorias });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Buscar categoria por ID
router.get('/:id', autenticar, validarId, async (req, res) => {
    try {
        const categoria = await Categoria.buscarPorId(req.params.id);
        if (!categoria) {
            return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada' });
        }
        res.json({ sucesso: true, dados: categoria });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Criar categoria (admin)
router.post('/', autenticar, autorizarAdmin, validarCategoria.criar, async (req, res) => {
    try {
        const { nome } = req.body;
        const existe = await Categoria.categoriaExiste(nome);
        if (existe) {
            return res.status(400).json({ sucesso: false, mensagem: 'Categoria já existe' });
        }
        const categoria = await Categoria.criar({ nome });
        res.status(201).json({ sucesso: true, mensagem: 'Categoria criada com sucesso', dados: categoria });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Atualizar categoria (admin)
router.put('/:id', autenticar, autorizarAdmin, validarId, validarCategoria.atualizar, async (req, res) => {
    try {
        const { nome } = req.body;
        const existe = await Categoria.categoriaExiste(nome, req.params.id);
        if (existe) {
            return res.status(400).json({ sucesso: false, mensagem: 'Categoria já existe' });
        }
        const categoria = await Categoria.atualizar(req.params.id, { nome });
        res.json({ sucesso: true, mensagem: 'Categoria atualizada com sucesso', dados: categoria });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

// Remover categoria (admin)
router.delete('/:id', autenticar, autorizarAdmin, validarId, async (req, res) => {
    try {
        await Categoria.remover(req.params.id);
        res.json({ sucesso: true, mensagem: 'Categoria removida com sucesso' });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
});

module.exports = router; 