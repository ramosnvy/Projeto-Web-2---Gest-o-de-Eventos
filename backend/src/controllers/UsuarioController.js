const Usuario = require('../models/Usuario');

/**
 * Controller de Usuários
 * Gerencia todas as operações relacionadas aos usuários
 */
class UsuarioController {
    /**
     * Lista todos os usuários (com paginação)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Buscar usuários
            const usuarios = await Usuario.buscarTodos(limit, offset);
            const total = await Usuario.contar();

            res.json({
                sucesso: true,
                dados: {
                    usuarios,
                    paginacao: {
                        pagina: page,
                        limite: limit,
                        total: total,
                        total_paginas: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca um usuário por ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.buscarPorId(id);

            if (!usuario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado'
                });
            }

            res.json({
                sucesso: true,
                dados: usuario
            });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cria um novo usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async criar(req, res) {
        try {
            const { nome, email, senha, tipo_usuario = 'participante' } = req.body;

            // Verificar se o email já existe
            const emailExiste = await Usuario.emailExiste(email);
            if (emailExiste) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Email já está em uso'
                });
            }

            // Criar usuário
            const usuario = await Usuario.criar({
                nome,
                email,
                senha,
                tipo_usuario
            });

            res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário criado com sucesso',
                dados: usuario
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza um usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, tipo_usuario } = req.body;

            // Verificar se o usuário existe
            const usuarioExistente = await Usuario.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado'
                });
            }

            // Verificar se o email já existe (exceto para o usuário atual)
            if (email) {
                const emailExiste = await Usuario.emailExiste(email, id);
                if (emailExiste) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: 'Email já está em uso'
                    });
                }
            }

            // Atualizar usuário
            const usuarioAtualizado = await Usuario.atualizar(id, {
                nome,
                email,
                tipo_usuario
            });

            res.json({
                sucesso: true,
                mensagem: 'Usuário atualizado com sucesso',
                dados: usuarioAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remove um usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async remover(req, res) {
        try {
            const { id } = req.params;

            // Verificar se o usuário existe
            const usuario = await Usuario.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado'
                });
            }

            // Verificar se não está tentando remover a si mesmo
            if (parseInt(id) === req.usuario.id) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Não é possível remover seu próprio usuário'
                });
            }

            // Remover usuário
            await Usuario.remover(id);

            res.json({
                sucesso: true,
                mensagem: 'Usuário removido com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca usuários por tipo
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorTipo(req, res) {
        try {
            const { tipo } = req.params;
            
            // Validar tipo de usuário
            const tiposValidos = ['administrador', 'organizador', 'participante'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Tipo de usuário inválido'
                });
            }

            const usuarios = await Usuario.buscarPorTipo(tipo);

            res.json({
                sucesso: true,
                dados: {
                    tipo,
                    usuarios,
                    total: usuarios.length
                }
            });
        } catch (error) {
            console.error('Erro ao buscar usuários por tipo:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca usuários por termo de busca
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscar(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Termo de busca deve ter pelo menos 2 caracteres'
                });
            }

            // Implementar busca por nome ou email
            // Por simplicidade, vamos buscar todos e filtrar
            const todosUsuarios = await Usuario.buscarTodos(100, 0);
            const usuariosFiltrados = todosUsuarios.filter(usuario => 
                usuario.nome.toLowerCase().includes(q.toLowerCase()) ||
                usuario.email.toLowerCase().includes(q.toLowerCase())
            );

            res.json({
                sucesso: true,
                dados: {
                    termo: q,
                    usuarios: usuariosFiltrados,
                    total: usuariosFiltrados.length
                }
            });
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Obtém estatísticas dos usuários
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async estatisticas(req, res) {
        try {
            const totalUsuarios = await Usuario.contar();
            const administradores = await Usuario.buscarPorTipo('administrador');
            const organizadores = await Usuario.buscarPorTipo('organizador');
            const participantes = await Usuario.buscarPorTipo('participante');

            res.json({
                sucesso: true,
                dados: {
                    total_usuarios: totalUsuarios,
                    por_tipo: {
                        administradores: administradores.length,
                        organizadores: organizadores.length,
                        participantes: participantes.length
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza o tipo de usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async atualizarTipo(req, res) {
        try {
            const { id } = req.params;
            const { tipo_usuario } = req.body;

            // Validar tipo de usuário
            const tiposValidos = ['administrador', 'organizador', 'participante'];
            if (!tiposValidos.includes(tipo_usuario)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Tipo de usuário inválido'
                });
            }

            // Verificar se o usuário existe
            const usuarioExistente = await Usuario.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado'
                });
            }

            // Verificar se não está tentando alterar a si mesmo
            if (parseInt(id) === req.usuario.id) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Não é possível alterar seu próprio tipo de usuário'
                });
            }

            // Atualizar tipo de usuário
            const usuarioAtualizado = await Usuario.atualizar(id, { tipo_usuario });

            res.json({
                sucesso: true,
                mensagem: 'Tipo de usuário atualizado com sucesso',
                dados: usuarioAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar tipo de usuário:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = UsuarioController; 