const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const AcessoCertificado = require('../models/AcessoCertificado');

/**
 * Controller de Autenticação
 * Gerencia login, registro e operações relacionadas à autenticação
 */
class AuthController {
    /**
     * Registra um novo usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async registrar(req, res) {
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

            // Criar o usuário
            const usuario = await Usuario.criar({
                nome,
                email,
                senha,
                tipo_usuario
            });

            // Gerar token JWT
            const token = jwt.sign(
                { usuarioId: usuario.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remover senha do objeto de resposta
            delete usuario.senha;

            res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário registrado com sucesso',
                dados: {
                    usuario,
                    token
                }
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Realiza login do usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Buscar usuário por email
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Email ou senha inválidos'
                });
            }

            // Verificar senha
            const senhaValida = await Usuario.verificarSenha(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Email ou senha inválidos'
                });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { usuarioId: usuario.id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Registrar acesso no MongoDB
            try {
                await AcessoCertificado.registrarAcessoInscricao(
                    usuario.id,
                    0, // evento_id 0 para login
                    req.ip,
                    req.headers['user-agent'] || 'N/A'
                );
            } catch (mongoError) {
                console.error('Erro ao registrar acesso no MongoDB:', mongoError);
                // Não falha o login se o MongoDB estiver indisponível
            }

            // Remover senha do objeto de resposta
            delete usuario.senha;

            res.json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                dados: {
                    usuario,
                    token
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Obtém informações do usuário logado
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async perfil(req, res) {
        try {
            const usuario = await Usuario.buscarPorId(req.usuario.id);
            
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
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza o perfil do usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async atualizarPerfil(req, res) {
        try {
            const { nome, email, tipo_usuario } = req.body;
            const usuarioId = req.usuario.id;

            // Verificar se o email já existe (exceto para o usuário atual)
            if (email) {
                const emailExiste = await Usuario.emailExiste(email, usuarioId);
                if (emailExiste) {
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: 'Email já está em uso'
                    });
                }
            }

            // Atualizar usuário
            const usuarioAtualizado = await Usuario.atualizar(usuarioId, {
                nome,
                email,
                tipo_usuario
            });

            res.json({
                sucesso: true,
                mensagem: 'Perfil atualizado com sucesso',
                dados: usuarioAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Altera a senha do usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async alterarSenha(req, res) {
        try {
            const { senha_atual, nova_senha } = req.body;
            const usuarioId = req.usuario.id;

            // Buscar usuário com senha
            const usuario = await Usuario.buscarPorEmail(req.usuario.email);
            
            // Verificar senha atual
            const senhaValida = await Usuario.verificarSenha(senha_atual, usuario.senha);
            if (!senhaValida) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Senha atual incorreta'
                });
            }

            // Atualizar senha
            await Usuario.atualizarSenha(usuarioId, nova_senha);

            res.json({
                sucesso: true,
                mensagem: 'Senha alterada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Renova o token JWT
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async renovarToken(req, res) {
        try {
            const usuarioId = req.usuario.id;

            // Gerar novo token
            const novoToken = jwt.sign(
                { usuarioId },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                sucesso: true,
                mensagem: 'Token renovado com sucesso',
                dados: {
                    token: novoToken
                }
            });
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Realiza logout (registra no MongoDB)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async logout(req, res) {
        try {
            // Registrar logout no MongoDB
            try {
                await AcessoCertificado.registrarAcessoInscricao(
                    req.usuario.id,
                    0, // evento_id 0 para logout
                    req.ip,
                    req.headers['user-agent'] || 'N/A'
                );
            } catch (mongoError) {
                console.error('Erro ao registrar logout no MongoDB:', mongoError);
                // Não falha o logout se o MongoDB estiver indisponível
            }

            res.json({
                sucesso: true,
                mensagem: 'Logout realizado com sucesso'
            });
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Verifica se o token é válido
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async verificarToken(req, res) {
        try {
            res.json({
                sucesso: true,
                mensagem: 'Token válido',
                dados: {
                    usuario: req.usuario
                }
            });
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = AuthController; 