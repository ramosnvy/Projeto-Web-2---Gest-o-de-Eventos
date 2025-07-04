const Evento = require('../models/Evento');
const AcessoCertificado = require('../models/AcessoCertificado');

/**
 * Controller de Eventos
 * Gerencia todas as operações relacionadas aos eventos
 */
class EventoController {
    /**
     * Lista todos os eventos (com paginação)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listar(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Buscar eventos com contagem de inscrições
            const eventos = await Evento.buscarComInscricoes(limit);
            const total = await Evento.contar();

            res.json({
                sucesso: true,
                dados: {
                    eventos,
                    paginacao: {
                        pagina: page,
                        limite: limit,
                        total: total,
                        total_paginas: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca um evento por ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const evento = await Evento.buscarPorId(id);

            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            res.json({
                sucesso: true,
                dados: evento
            });
        } catch (error) {
            console.error('Erro ao buscar evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cria um novo evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async criar(req, res) {
        try {
            const { titulo, descricao, data_evento } = req.body;
            const organizador_id = req.usuario.id;

            // Criar evento
            const evento = await Evento.criar({
                titulo,
                descricao,
                data_evento,
                organizador_id
            });

            res.status(201).json({
                sucesso: true,
                mensagem: 'Evento criado com sucesso',
                dados: evento
            });
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { titulo, descricao, data_evento } = req.body;

            // Verificar se o evento existe
            const eventoExistente = await Evento.buscarPorId(id);
            if (!eventoExistente) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário é organizador do evento
            const isOrganizador = await Evento.verificarOrganizador(id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para editar este evento'
                });
            }

            // Atualizar evento
            const eventoAtualizado = await Evento.atualizar(id, {
                titulo,
                descricao,
                data_evento
            });

            res.json({
                sucesso: true,
                mensagem: 'Evento atualizado com sucesso',
                dados: eventoAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remove um evento
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async remover(req, res) {
        try {
            const { id } = req.params;

            // Verificar se o evento existe
            const evento = await Evento.buscarPorId(id);
            if (!evento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Evento não encontrado'
                });
            }

            // Verificar se o usuário é organizador do evento
            const isOrganizador = await Evento.verificarOrganizador(id, req.usuario.id);
            if (!isOrganizador && req.usuario.tipo_usuario !== 'administrador') {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não tem permissão para remover este evento'
                });
            }

            // Remover evento
            await Evento.remover(id);

            res.json({
                sucesso: true,
                mensagem: 'Evento removido com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover evento:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista eventos por organizador
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarPorOrganizador(req, res) {
        try {
            const organizadorId = req.usuario.id;
            
            // Buscar eventos do organizador com contagem de inscrições
            const eventos = await Evento.buscarComInscricoesPorOrganizador(organizadorId);

            res.json({
                sucesso: true,
                dados: {
                    eventos,
                    total: eventos.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar eventos do organizador:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista eventos futuros
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarFuturos(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const eventos = await Evento.buscarFuturosComInscricoes(limit);

            res.json({
                sucesso: true,
                dados: {
                    eventos,
                    total: eventos.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar eventos futuros:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista eventos com contagem de inscrições
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async listarComInscricoes(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const eventos = await Evento.buscarComInscricoes(limit);

            res.json({
                sucesso: true,
                dados: {
                    eventos,
                    total: eventos.length
                }
            });
        } catch (error) {
            console.error('Erro ao listar eventos com inscrições:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca eventos por período
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

            const eventos = await Evento.buscarPorPeriodo(dataInicio, dataFim);

            res.json({
                sucesso: true,
                dados: {
                    eventos,
                    total: eventos.length,
                    periodo: {
                        inicio: data_inicio,
                        fim: data_fim
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao buscar eventos por período:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca eventos por termo
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

            // Buscar todos os eventos e filtrar
            const todosEventos = await Evento.buscarTodos(100, 0);
            const eventosFiltrados = todosEventos.filter(evento => 
                evento.titulo.toLowerCase().includes(q.toLowerCase()) ||
                (evento.descricao && evento.descricao.toLowerCase().includes(q.toLowerCase()))
            );

            res.json({
                sucesso: true,
                dados: {
                    termo: q,
                    eventos: eventosFiltrados,
                    total: eventosFiltrados.length
                }
            });
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Obtém estatísticas dos eventos
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async estatisticas(req, res) {
        try {
            const totalEventos = await Evento.contar();
            const eventosFuturos = await Evento.buscarFuturos(1000);
            const eventosComInscricoes = await Evento.buscarComInscricoes(1000);

            // Calcular estatísticas
            const eventosPassados = totalEventos - eventosFuturos.length;
            const totalInscricoes = eventosComInscricoes.reduce((total, evento) => 
                total + parseInt(evento.total_inscricoes || 0), 0
            );

            res.json({
                sucesso: true,
                dados: {
                    total_eventos: totalEventos,
                    eventos_futuros: eventosFuturos.length,
                    eventos_passados: eventosPassados,
                    total_inscricoes: totalInscricoes,
                    media_inscricoes: totalEventos > 0 ? (totalInscricoes / totalEventos).toFixed(2) : 0
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
     * Obtém estatísticas dos eventos do organizador
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    static async estatisticasOrganizador(req, res) {
        try {
            const organizadorId = req.usuario.id;
            const totalEventos = await Evento.contarPorOrganizador(organizadorId);
            const eventos = await Evento.buscarPorOrganizador(organizadorId);
            const eventosComInscricoes = await Evento.buscarComInscricoes(1000);

            // Filtrar eventos do organizador
            const eventosOrganizador = eventosComInscricoes.filter(evento => 
                evento.organizador_id === organizadorId
            );

            const totalInscricoes = eventosOrganizador.reduce((total, evento) => 
                total + parseInt(evento.total_inscricoes || 0), 0
            );

            res.json({
                sucesso: true,
                dados: {
                    total_eventos: totalEventos,
                    total_inscricoes: totalInscricoes,
                    media_inscricoes: totalEventos > 0 ? (totalInscricoes / totalEventos).toFixed(2) : 0
                }
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas do organizador:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = EventoController; 