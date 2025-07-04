const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const Certificado = require('../models/Certificado');
const Usuario = require('../models/Usuario');

/**
 * Controller do Dashboard
 * Gerencia as estatísticas e dados do dashboard
 */
class DashboardController {
    /**
     * Obtém estatísticas gerais do sistema
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async getStats(req, res) {
        try {
            const user = req.usuario;
            
            // Estatísticas baseadas no tipo de usuário
            let stats = {};
            
            if (user.tipo_usuario === 'administrador') {
                // Estatísticas para administrador
                stats = await DashboardController.getAdminStats();
            } else if (user.tipo_usuario === 'organizador') {
                // Estatísticas para organizador
                stats = await DashboardController.getOrganizadorStats(user.id);
            } else {
                // Estatísticas para participante
                stats = await DashboardController.getParticipanteStats(user.id);
            }

            res.json({
                sucesso: true,
                dados: stats
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Estatísticas para administrador
     * @returns {Promise<Object>} Estatísticas do administrador
     */
    static async getAdminStats() {
        try {
            const [
                totalUsuarios,
                totalEventos,
                totalInscricoes,
                totalCertificados,
                eventosRecentes,
                inscricoesRecentes
            ] = await Promise.all([
                Usuario.contar(),
                Evento.contar(),
                Inscricao.contar(),
                Certificado.contar(),
                Evento.buscarRecentes(5),
                Inscricao.buscarRecentes(5)
            ]);

            return {
                total_usuarios: totalUsuarios,
                total_eventos: totalEventos,
                total_inscricoes: totalInscricoes,
                total_certificados: totalCertificados,
                eventos_recentes: eventosRecentes,
                inscricoes_recentes: inscricoesRecentes,
                tipo_usuario: 'administrador'
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do administrador:', error);
            throw error;
        }
    }

    /**
     * Estatísticas para organizador
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise<Object>} Estatísticas do organizador
     */
    static async getOrganizadorStats(organizadorId) {
        try {
            const [
                totalEventos,
                totalInscricoes,
                totalCertificados,
                eventosRecentes,
                inscricoesRecentes
            ] = await Promise.all([
                Evento.contarPorOrganizador(organizadorId),
                Inscricao.contarPorOrganizador(organizadorId),
                Certificado.contarPorOrganizador(organizadorId),
                Evento.buscarRecentesPorOrganizador(organizadorId, 5),
                Inscricao.buscarRecentesPorOrganizador(organizadorId, 5)
            ]);

            return {
                total_eventos: totalEventos,
                total_inscricoes: totalInscricoes,
                total_certificados: totalCertificados,
                eventos_recentes: eventosRecentes,
                inscricoes_recentes: inscricoesRecentes,
                tipo_usuario: 'organizador'
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do organizador:', error);
            throw error;
        }
    }

    /**
     * Estatísticas para participante
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<Object>} Estatísticas do participante
     */
    static async getParticipanteStats(usuarioId) {
        try {
            const [
                totalInscricoes,
                totalCertificados,
                inscricoesRecentes,
                certificadosRecentes
            ] = await Promise.all([
                Inscricao.contarPorUsuario(usuarioId),
                Certificado.contarPorUsuario(usuarioId),
                Inscricao.buscarRecentesPorUsuario(usuarioId, 5),
                Certificado.buscarRecentesPorUsuario(usuarioId, 5)
            ]);

            return {
                total_inscricoes: totalInscricoes,
                total_certificados: totalCertificados,
                inscricoes_recentes: inscricoesRecentes,
                certificados_recentes: certificadosRecentes,
                tipo_usuario: 'participante'
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do participante:', error);
            throw error;
        }
    }
}

module.exports = DashboardController; 