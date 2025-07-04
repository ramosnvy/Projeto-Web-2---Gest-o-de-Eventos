const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');
const Certificado = require('../models/Certificado');
const AcessoCertificado = require('../models/AcessoCertificado');

/**
 * Controller de Inscrições
 * Gerencia todas as operações relacionadas às inscrições
 */
class InscricaoController {
    /**
     * Lista todas as inscrições (com paginação)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Buscar inscrições
            const inscricoes = await Inscricao.buscarTodas(limit, offset);
            const total = await Inscricao.contar();

            res.json({
                sucesso: true,
                dados: {
                    inscricoes,
                    paginacao: {
                        pagina: page,
                        limite: limit,
                        total: total,
                        total_paginas: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao listar inscrições:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca uma inscrição por ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const inscricao = await Inscricao.buscarPorId(id);

            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            res.json({
                sucesso: true,
                dados: inscricao
            });
        } catch (error) {
            console.error('Erro ao buscar inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cria uma nova inscrição
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async criar(req, res) {
        try {
            const { evento_id, usuario_id } = req.body;
            const usuarioLogadoId = req.usuario.id;

            // Verificar se o evento existe
            const evento = await Evento.buscarPorId(evento_id);
            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário está tentando se inscrever ou se é admin/organizador
            const idParaInscricao = usuario_id || usuarioLogadoId;
            
            // Verificar se o usuário tem permissão para inscrever este usuário
            if (usuario_id && usuario_id !== usuarioLogadoId && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para inscrever outro usuário'
                });
            }

            // Verificar se o usuário já está inscrito
            const jaInscrito = await Inscricao.verificarInscricao(idParaInscricao, evento_id);
            if (jaInscrito) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Você já está inscrito neste evento'
                });
            }

            // Verificar se o evento é futuro
            const dataEvento = new Date(evento.data_evento);
            const agora = new Date();
            if (dataEvento <= agora) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Não é possível se inscrever em eventos passados'
                });
            }

            // Criar inscrição
            const inscricao = await Inscricao.criar({
                usuario_id: idParaInscricao,
                evento_id
            });

            // Registrar acesso no MongoDB
            try {
                await AcessoCertificado.registrarAcessoInscricao(
                    idParaInscricao,
                    evento_id,
                    req.ip,
                    req.headers['user-agent'] || 'N/A'
                );
            } catch (mongoError) {
                console.error('Erro ao registrar acesso no MongoDB:', mongoError);
                // Não falha a inscrição se o MongoDB estiver indisponível
            }

            res.status(201).json({
                sucesso: true,
                mensagem: 'Inscrição realizada com sucesso',
                dados: inscricao
            });
        } catch (error) {
            console.error('Erro ao criar inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remove uma inscrição
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async remover(req, res) {
        try {
            const { id } = req.params;

            // Verificar se a inscrição existe
            const inscricao = await Inscricao.buscarPorId(id);
            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            // Verificar se o usuário é o proprietário da inscrição ou administrador
            if (inscricao.usuario_id !== req.usuario.id && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para remover esta inscrição'
                });
            }

            // Remover inscrição
            await Inscricao.remover(id);

            res.json({
                sucesso: true,
                mensagem: 'Inscrição removida com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista inscrições do usuário logado
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarMinhasInscricoes(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const inscricoes = await Inscricao.buscarPorUsuario(usuarioId);

            res.json({
                sucesso: true,
                dados: {
                    inscricoes,
                    total: inscricoes.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar minhas inscrições:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista inscrições dos eventos do organizador
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarInscricoesMeusEventos(req, res) {
        try {
            const organizadorId = req.usuario.id;
            const inscricoes = await Inscricao.buscarPorOrganizador(organizadorId);

            res.json({
                sucesso: true,
                dados: {
                    inscricoes,
                    total: inscricoes.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar inscrições dos meus eventos:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista inscrições de um evento
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
                    mensagem: 'Você não tem permissão para ver as inscrições deste evento'
                });
            }

            const inscricoes = await Inscricao.buscarPorEvento(evento_id);

            res.json({
                sucesso: true,
                dados: {
                    evento: {
                        id: evento.id,
                        titulo: evento.titulo
                    },
                    inscricoes,
                    total: inscricoes.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar inscrições por evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista inscrições com certificados do usuário
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarComCertificados(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const inscricoes = await Inscricao.buscarComCertificados(usuarioId);

            res.json({
                sucesso: true,
                dados: {
                    inscricoes,
                    total: inscricoes.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar inscrições com certificados:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cancela inscrição em um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async cancelarInscricao(req, res) {
        try {
            const { evento_id } = req.params;
            const usuario_id = req.usuario.id;

            // Verificar se o evento existe
            const evento = await Evento.buscarPorId(evento_id);
            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário está inscrito
            const jaInscrito = await Inscricao.verificarInscricao(usuario_id, evento_id);
            if (!jaInscrito) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Você não está inscrito neste evento'
                });
            }

            // Verificar se o evento é futuro
            const dataEvento = new Date(evento.data_evento);
            const agora = new Date();
            if (dataEvento <= agora) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Não é possível cancelar inscrição em eventos passados'
                });
            }

            // Remover inscrição
            await Inscricao.removerPorUsuarioEvento(usuario_id, evento_id);

            res.json({
                sucesso: true,
                mensagem: 'Inscrição cancelada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao cancelar inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca inscrições por período
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

            const inscricoes = await Inscricao.buscarPorPeriodo(dataInicio, dataFim);

            res.json({
                sucesso: true,
                dados: {
                    inscricoes,
                    total: inscricoes.length,
                    periodo: {
                        inicio: data_inicio,
                        fim: data_fim
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao buscar inscrições por período:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Obtém estatísticas das inscrições
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async estatisticas(req, res) {
        try {
            const totalInscricoes = await Inscricao.contar();
            const inscricoesUsuario = await Inscricao.contarPorUsuario(req.usuario.id);

            res.json({
                sucesso: true,
                dados: {
                    total_inscricoes: totalInscricoes,
                    minhas_inscricoes: inscricoesUsuario
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
     * Obtém estatísticas das inscrições de um evento
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

            const totalInscricoes = await Inscricao.contarPorEvento(evento_id);
            const inscricoes = await Inscricao.buscarPorEvento(evento_id);

            res.json({
                sucesso: true,
                dados: {
                    evento: {
                        id: evento.id,
                        titulo: evento.titulo
                    },
                    total_inscricoes: totalInscricoes,
                    inscricoes: inscricoes
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
     * Verifica se o usuário está inscrito em um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async verificarInscricao(req, res) {
        try {
            const { evento_id } = req.params;
            const usuario_id = req.usuario.id;

            // Verificar se o evento existe
            const evento = await Evento.buscarPorId(evento_id);
            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário está inscrito
            const inscrito = await Inscricao.verificarInscricao(usuario_id, evento_id);

            res.json({
                sucesso: true,
                dados: {
                    inscrito: inscrito,
                    evento: {
                        id: evento.id,
                        titulo: evento.titulo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao verificar inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Aprova uma inscrição
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async aprovar(req, res) {
        try {
            const { id } = req.params;

            // Verificar se a inscrição existe
            const inscricao = await Inscricao.buscarPorId(id);
            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            // Verificar se o usuário tem permissão para aprovar a inscrição
            const evento = await Evento.buscarPorId(inscricao.evento_id);
            const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para aprovar esta inscrição'
                });
            }

            // Aprovar inscrição
            const inscricaoAprovada = await Inscricao.aprovar(id);

            res.json({
                sucesso: true,
                mensagem: 'Inscrição aprovada com sucesso',
                dados: inscricaoAprovada
            });
        } catch (error) {
            console.error('Erro ao aprovar inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Rejeita uma inscrição
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async rejeitar(req, res) {
        try {
            const { id } = req.params;

            // Verificar se a inscrição existe
            const inscricao = await Inscricao.buscarPorId(id);
            if (!inscricao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Inscrição não encontrada'
                });
            }

            // Verificar se o usuário tem permissão para rejeitar a inscrição
            const evento = await Evento.buscarPorId(inscricao.evento_id);
            const isOrganizador = await Evento.verificarOrganizador(evento.id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para rejeitar esta inscrição'
                });
            }

            // Rejeitar inscrição
            const inscricaoRejeitada = await Inscricao.rejeitar(id);

            res.json({
                sucesso: true,
                mensagem: 'Inscrição rejeitada com sucesso',
                dados: inscricaoRejeitada
            });
        } catch (error) {
            console.error('Erro ao rejeitar inscrição:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista inscrições pendentes de um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarPendentesPorEvento(req, res) {
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
                    mensagem: 'Você não tem permissão para ver as inscrições deste evento'
                });
            }

            const inscricoes = await Inscricao.buscarPendentesPorEvento(evento_id);

            res.json({
                sucesso: true,
                dados: {
                    evento: {
                        id: evento.id,
                        titulo: evento.titulo
                    },
                    inscricoes,
                    total: inscricoes.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar inscrições pendentes:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = InscricaoController; 