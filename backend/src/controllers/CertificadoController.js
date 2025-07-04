const Certificado = require('../models/Certificado');
const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');
const AcessoCertificado = require('../models/AcessoCertificado');

/**
 * Controller de Certificados
 * Gerencia todas as operações relacionadas aos certificados
 */
class CertificadoController {
    /**
     * Lista todos os certificados (com paginação)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Buscar certificados
            const certificados = await Certificado.buscarTodos(limit, offset);
            const total = await Certificado.contar();

            res.json({
                sucesso: true,
                dados: {
                    certificados,
                    paginacao: {
                        pagina: page,
                        limite: limit,
                        total: total,
                        total_paginas: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao listar certificados:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca um certificado por ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const certificado = await Certificado.buscarPorId(id);

            if (!certificado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Certificado não encontrado'
                });
            }

            res.json({
                sucesso: true,
                dados: certificado
            });
        } catch (error) {
            console.error('Erro ao buscar certificado:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cria um novo certificado
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async criar(req, res) {
        try {
            const { inscricao_id } = req.body;

            // Verificar se a inscrição existe
            const inscricao = await Inscricao.buscarPorId(inscricao_id);
            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            // Verificar se já existe certificado para esta inscrição
            const certificadoExistente = await Certificado.verificarCertificado(inscricao_id);
            if (certificadoExistente) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Certificado já foi emitido para esta inscrição'
                });
            }

            // Verificar se o usuário tem permissão para emitir o certificado
            const evento = await Evento.buscarPorId(inscricao.evento_id);
            const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para emitir este certificado'
                });
            }

            // Criar certificado
            const certificado = await Certificado.criar({ inscricao_id });

            res.status(201).json({
                sucesso: true,
                mensagem: 'Certificado emitido com sucesso',
                dados: certificado
            });
        } catch (error) {
            console.error('Erro ao criar certificado:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remove um certificado
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async remover(req, res) {
        try {
            const { id } = req.params;

            // Verificar se o certificado existe
            const certificado = await Certificado.buscarPorId(id);
            if (!certificado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Certificado não encontrado'
                });
            }

            // Verificar se o usuário tem permissão para remover o certificado
            const evento = await Evento.buscarPorId(certificado.evento_id);
            const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para remover este certificado'
                });
            }

            // Remover certificado
            await Certificado.remover(id);

            res.json({
                sucesso: true,
                mensagem: 'Certificado removido com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover certificado:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista certificados do usuário logado
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarMeusCertificados(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const certificados = await Certificado.buscarPorUsuario(usuarioId);

            res.json({
                sucesso: true,
                dados: {
                    certificados,
                    total: certificados.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar meus certificados:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista certificados de um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarPorEvento(req, res) {
        try {
            const { evento_id } = req.params;

            // Verificar se o evento existe
            const evento = await Evento.buscarPorId(evento_id);
            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário é organizador do evento ou administrador
            const isOrganizador = await Evento.verificarOrganizador(evento_id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para ver os certificados deste evento'
                });
            }

            const certificados = await Certificado.buscarPorEvento(evento_id);

            res.json({
                sucesso: true,
                dados: {
                    evento: {
                        id: evento.id,
                        titulo: evento.titulo
                    },
                    certificados,
                    total: certificados.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar certificados por evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca certificado por inscrição
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorInscricao(req, res) {
        try {
            const { inscricao_id } = req.params;

            // Verificar se a inscrição existe
            const inscricao = await Inscricao.buscarPorId(inscricao_id);
            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            // Verificar se o usuário tem permissão para ver o certificado
            if (inscricao.usuario_id !== req.usuario.id && req.usuario.tipo_usuario !== 'administrador') {
                const evento = await Evento.buscarPorId(inscricao.evento_id);
                const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
                if (!isOrganizador) {
                    return res.status(403).json({
                        sucesso: false,
                        mensagem: 'Você não tem permissão para ver este certificado'
                    });
                }
            }

            const certificado = await Certificado.buscarPorInscricao(inscricao_id);

            if (!certificado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Certificado não encontrado para esta inscrição'
                });
            }

            res.json({
                sucesso: true,
                dados: certificado
            });
        } catch (error) {
            console.error('Erro ao buscar certificado por inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Emite certificado automaticamente para uma inscrição
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async emitirCertificado(req, res) {
        try {
            const { inscricao_id } = req.params;

            // Verificar se a inscrição existe
            const inscricao = await Inscricao.buscarPorId(inscricao_id);
            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            // Verificar se o usuário tem permissão para emitir o certificado
            const evento = await Evento.buscarPorId(inscricao.evento_id);
            const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para emitir este certificado'
                });
            }

            // Emitir certificado
            const certificado = await Certificado.emitirCertificado(inscricao_id);

            // Registrar acesso no MongoDB
            try {
                await AcessoCertificado.registrarAcessoCertificado(
                    inscricao.usuario_id,
                    inscricao.evento_id,
                    req.ip,
                    req.headers['user-agent'] || 'N/A'
                );
            } catch (mongoError) {
                console.error('Erro ao registrar acesso no MongoDB:', mongoError);
                // Não falha a emissão se o MongoDB estiver indisponível
            }

            res.status(201).json({
                sucesso: true,
                mensagem: 'Certificado emitido com sucesso',
                dados: certificado
            });
        } catch (error) {
            console.error('Erro ao emitir certificado:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca certificados por período
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorPeriodo(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;

            if (!data_inicio || !data_fim) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de início e data de fim são obrigatórias'
                });
            }

            const dataInicio = new Date(data_inicio);
            const dataFim = new Date(data_fim);

            if (dataFim <= dataInicio) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de fim deve ser posterior à data de início'
                });
            }

            const certificados = await Certificado.buscarPorPeriodo(dataInicio, dataFim);

            res.json({
                sucesso: true,
                dados: {
                    certificados,
                    total: certificados.length,
                    periodo: {
                        inicio: data_inicio,
                        fim: data_fim
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao buscar certificados por período:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Obtém estatísticas dos certificados
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async estatisticas(req, res) {
        try {
            const totalCertificados = await Certificado.contar();
            const certificadosUsuario = await Certificado.contarPorUsuario(req.usuario.id);

            res.json({
                sucesso: true,
                dados: {
                    total_certificados: totalCertificados,
                    meus_certificados: certificadosUsuario
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
     * Obtém estatísticas dos certificados de um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async estatisticasEvento(req, res) {
        try {
            const { evento_id } = req.params;

            // Verificar se o evento existe
            const evento = await Evento.buscarPorId(evento_id);
            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário é organizador do evento ou administrador
            const isOrganizador = await Evento.verificarOrganizador(evento_id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para ver as estatísticas deste evento'
                });
            }

            const totalCertificados = await Certificado.contarPorEvento(evento_id);
            const certificados = await Certificado.buscarPorEvento(evento_id);

            res.json({
                sucesso: true,
                dados: {
                    evento: {
                        id: evento.id,
                        titulo: evento.titulo
                    },
                    total_certificados: totalCertificados,
                    certificados: certificados
                }
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas do evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Visualiza certificado (registra acesso)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async visualizarCertificado(req, res) {
        try {
            const { id } = req.params;

            // Verificar se o certificado existe
            const certificado = await Certificado.buscarPorId(id);
            if (!certificado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Certificado não encontrado'
                });
            }

            // Verificar se o usuário tem permissão para visualizar o certificado
            if (certificado.usuario_id !== req.usuario.id && req.usuario.tipo_usuario !== 'administrador') {
                const evento = await Evento.buscarPorId(certificado.evento_id);
                const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
                if (!isOrganizador) {
                    return res.status(403).json({
                        sucesso: false,
                        mensagem: 'Você não tem permissão para visualizar este certificado'
                    });
                }
            }

            // Registrar acesso no MongoDB
            try {
                await AcessoCertificado.registrarAcessoCertificado(
                    certificado.usuario_id,
                    certificado.evento_id,
                    req.ip,
                    req.headers['user-agent'] || 'N/A'
                );
            } catch (mongoError) {
                console.error('Erro ao registrar acesso no MongoDB:', mongoError);
                // Não falha a visualização se o MongoDB estiver indisponível
            }

            res.json({
                sucesso: true,
                mensagem: 'Certificado visualizado com sucesso',
                dados: certificado
            });
        } catch (error) {
            console.error('Erro ao visualizar certificado:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = CertificadoController; 