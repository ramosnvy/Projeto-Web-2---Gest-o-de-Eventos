const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona o usuário ao request
 */
const autenticar = async (req, res, next) => {
    try {
        // Obter o token do header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token de autenticação não fornecido'
            });
        }

        // Extrair o token (remove "Bearer " do início)
        const token = authHeader.substring(7);

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar o usuário no banco de dados
        const usuario = await Usuario.buscarPorId(decoded.usuarioId);
        
        if (!usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        // Adicionar o usuário ao request
        req.usuario = usuario;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token expirado'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};

/**
 * Middleware opcional de autenticação
 * Não falha se não houver token, apenas adiciona o usuário se existir
 */
const autenticarOpcional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.buscarPorId(decoded.usuarioId);
        
        if (usuario) {
            req.usuario = usuario;
        }
        
        next();
    } catch (error) {
        // Se houver erro, apenas continua sem autenticação
        next();
    }
};

/**
 * Middleware de autorização por tipo de usuário
 * @param {string[]} tiposPermitidos - Array com os tipos de usuário permitidos
 */
const autorizar = (tiposPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Autenticação necessária'
            });
        }

        if (!tiposPermitidos.includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Permissão insuficiente.'
            });
        }

        next();
    };
};

/**
 * Middleware para verificar se é administrador
 */
const autorizarAdmin = autorizar(['administrador']);

/**
 * Middleware para verificar se é organizador
 */
const autorizarOrganizador = autorizar(['organizador', 'administrador']);

/**
 * Middleware para verificar se é participante
 */
const autorizarParticipante = autorizar(['participante', 'organizador', 'administrador']);

/**
 * Middleware para verificar se o usuário é o proprietário do recurso
 * @param {Function} getResourceUserId - Função que retorna o ID do usuário do recurso
 */
const autorizarProprietario = (getResourceUserId) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Autenticação necessária'
            });
        }

        const resourceUserId = getResourceUserId(req);
        
        // Administradores podem acessar qualquer recurso
        if (req.usuario.tipo_usuario === 'administrador') {
            return next();
        }

        // Verificar se o usuário é o proprietário do recurso
        if (req.usuario.id !== resourceUserId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Você não é o proprietário deste recurso.'
            });
        }

        next();
    };
};

/**
 * Middleware para verificar se o usuário é organizador do evento
 */
const autorizarOrganizadorEvento = async (req, res, next) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Autenticação necessária'
            });
        }

        const eventoId = parseInt(req.params.id || req.body.evento_id);
        
        if (!eventoId) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do evento não fornecido'
            });
        }

        // Administradores podem acessar qualquer evento
        if (req.usuario.tipo_usuario === 'administrador') {
            return next();
        }

        // Verificar se o usuário é organizador do evento
        const Evento = require('../models/Evento');
        const isOrganizador = await Evento.verificarOrganizador(eventoId, req.usuario.id);
        
        if (!isOrganizador) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Você não é o organizador deste evento.'
            });
        }

        next();
    } catch (error) {
        console.error('Erro na verificação de organizador:', error);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    autenticar,
    autenticarOpcional,
    autorizar,
    autorizarAdmin,
    autorizarOrganizador,
    autorizarParticipante,
    autorizarProprietario,
    autorizarOrganizadorEvento
}; 