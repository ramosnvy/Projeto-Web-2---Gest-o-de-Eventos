const mongodb = require('../config/mongodb');
const database = require('../config/database');

/**
 * Modelo de AcessoCertificado (MongoDB)
 * Gerencia todas as operações relacionadas aos acessos de certificados no MongoDB
 */
class AcessoCertificado {
    /**
     * Cria um novo registro de acesso
     * @param {Object} acessoData - Dados do acesso
     * @returns {Promise} Acesso criado
     */
    static async criar(acessoData) {
        try {
            const {
                usuario_id,
                evento_id,
                tipo_acesso,
                ip_acesso,
                dispositivo,
                status = 'ativo'
            } = acessoData;

            const documento = {
                usuario_id: usuario_id.toString(),
                evento_id: evento_id.toString(),
                data_acesso: new Date(),
                tipo_acesso,
                detalhes: {
                    ip_acesso: ip_acesso || 'N/A',
                    dispositivo: dispositivo || 'N/A',
                    status
                }
            };

            const result = await mongodb.insertOne('acessos_certificados', documento);
            return { ...documento, _id: result.insertedId };
        } catch (error) {
            console.error('Erro ao criar acesso de certificado:', error);
            throw error;
        }
    }

    /**
     * Busca todos os acessos
     * @param {number} limit - Limite de resultados
     * @param {number} skip - Quantidade a pular
     * @returns {Promise} Lista de acessos
     */
    static async buscarTodos(limit = 10, skip = 0) {
        try {
            const options = {
                sort: { data_acesso: -1 },
                limit: limit,
                skip: skip
            };

            const acessos = await mongodb.find('acessos_certificados', {}, options);
            return acessos;
        } catch (error) {
            console.error('Erro ao buscar acessos:', error);
            throw error;
        }
    }

    /**
     * Busca um acesso por ID
     * @param {string} id - ID do acesso
     * @returns {Promise} Acesso encontrado
     */
    static async buscarPorId(id) {
        try {
            const { ObjectId } = require('mongodb');
            const acesso = await mongodb.findOne('acessos_certificados', { _id: new ObjectId(id) });
            return acesso;
        } catch (error) {
            console.error('Erro ao buscar acesso por ID:', error);
            throw error;
        }
    }

    /**
     * Busca acessos por usuário
     * @param {number} usuarioId - ID do usuário
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de acessos do usuário
     */
    static async buscarPorUsuario(usuarioId, limit = 10) {
        try {
            const options = {
                sort: { data_acesso: -1 },
                limit: limit
            };

            const acessos = await mongodb.find(
                'acessos_certificados',
                { usuario_id: usuarioId.toString() },
                options
            );
            return acessos;
        } catch (error) {
            console.error('Erro ao buscar acessos por usuário:', error);
            throw error;
        }
    }

    /**
     * Busca acessos por evento
     * @param {number} eventoId - ID do evento
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de acessos do evento
     */
    static async buscarPorEvento(eventoId, limit = 10) {
        try {
            const options = {
                sort: { data_acesso: -1 },
                limit: limit
            };

            const acessos = await mongodb.find(
                'acessos_certificados',
                { evento_id: eventoId.toString() },
                options
            );
            return acessos;
        } catch (error) {
            console.error('Erro ao buscar acessos por evento:', error);
            throw error;
        }
    }

    /**
     * Busca acessos por tipo
     * @param {string} tipoAcesso - Tipo de acesso (inscricao|certificado)
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de acessos do tipo especificado
     */
    static async buscarPorTipo(tipoAcesso, limit = 10) {
        try {
            const options = {
                sort: { data_acesso: -1 },
                limit: limit
            };

            const acessos = await mongodb.find(
                'acessos_certificados',
                { tipo_acesso: tipoAcesso },
                options
            );
            return acessos;
        } catch (error) {
            console.error('Erro ao buscar acessos por tipo:', error);
            throw error;
        }
    }

    /**
     * Busca acessos por período
     * @param {Date} dataInicio - Data de início
     * @param {Date} dataFim - Data de fim
     * @returns {Promise} Lista de acessos no período
     */
    static async buscarPorPeriodo(dataInicio, dataFim) {
        try {
            const filtro = {
                data_acesso: {
                    $gte: dataInicio,
                    $lte: dataFim
                }
            };

            const options = {
                sort: { data_acesso: -1 }
            };

            const acessos = await mongodb.find('acessos_certificados', filtro, options);
            return acessos;
        } catch (error) {
            console.error('Erro ao buscar acessos por período:', error);
            throw error;
        }
    }

    /**
     * Atualiza um acesso
     * @param {string} id - ID do acesso
     * @param {Object} dadosAtualizacao - Dados para atualização
     * @returns {Promise} Resultado da atualização
     */
    static async atualizar(id, dadosAtualizacao) {
        try {
            const { ObjectId } = require('mongodb');
            const filtro = { _id: new ObjectId(id) };
            
            const resultado = await mongodb.updateOne('acessos_certificados', filtro, dadosAtualizacao);
            return resultado;
        } catch (error) {
            console.error('Erro ao atualizar acesso:', error);
            throw error;
        }
    }

    /**
     * Remove um acesso
     * @param {string} id - ID do acesso
     * @returns {Promise} Resultado da remoção
     */
    static async remover(id) {
        try {
            const { ObjectId } = require('mongodb');
            const filtro = { _id: new ObjectId(id) };
            
            const resultado = await mongodb.deleteOne('acessos_certificados', filtro);
            return resultado;
        } catch (error) {
            console.error('Erro ao remover acesso:', error);
            throw error;
        }
    }

    /**
     * Remove acessos por usuário
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise} Resultado da remoção
     */
    static async removerPorUsuario(usuarioId) {
        try {
            const filtro = { usuario_id: usuarioId.toString() };
            const resultado = await mongodb.deleteOne('acessos_certificados', filtro);
            return resultado;
        } catch (error) {
            console.error('Erro ao remover acessos por usuário:', error);
            throw error;
        }
    }

    /**
     * Remove acessos por evento
     * @param {number} eventoId - ID do evento
     * @returns {Promise} Resultado da remoção
     */
    static async removerPorEvento(eventoId) {
        try {
            const filtro = { evento_id: eventoId.toString() };
            const resultado = await mongodb.deleteOne('acessos_certificados', filtro);
            return resultado;
        } catch (error) {
            console.error('Erro ao remover acessos por evento:', error);
            throw error;
        }
    }

    /**
     * Registra acesso a inscrição
     * @param {number} usuarioId - ID do usuário
     * @param {number} eventoId - ID do evento
     * @param {string} ipAcesso - IP do acesso
     * @param {string} dispositivo - Dispositivo usado
     * @returns {Promise} Acesso registrado
     */
    static async registrarAcessoInscricao(usuarioId, eventoId, ipAcesso, dispositivo) {
        try {
            return await this.criar({
                usuario_id: usuarioId,
                evento_id: eventoId,
                tipo_acesso: 'inscricao',
                ip_acesso: ipAcesso,
                dispositivo: dispositivo
            });
        } catch (error) {
            console.error('Erro ao registrar acesso de inscrição:', error);
            throw error;
        }
    }

    /**
     * Registra acesso a certificado
     * @param {number} usuarioId - ID do usuário
     * @param {number} eventoId - ID do evento
     * @param {string} ipAcesso - IP do acesso
     * @param {string} dispositivo - Dispositivo usado
     * @returns {Promise} Acesso registrado
     */
    static async registrarAcessoCertificado(usuarioId, eventoId, ipAcesso, dispositivo) {
        try {
            return await this.criar({
                usuario_id: usuarioId,
                evento_id: eventoId,
                tipo_acesso: 'certificado',
                ip_acesso: ipAcesso,
                dispositivo: dispositivo
            });
        } catch (error) {
            console.error('Erro ao registrar acesso de certificado:', error);
            throw error;
        }
    }

    /**
     * Busca estatísticas de acessos
     * @returns {Promise} Estatísticas dos acessos
     */
    static async buscarEstatisticas() {
        try {
            const collection = mongodb.getCollection('acessos_certificados');
            
            // Total de acessos
            const totalAcessos = await collection.countDocuments();
            
            // Acessos por tipo
            const acessosInscricao = await collection.countDocuments({ tipo_acesso: 'inscricao' });
            const acessosCertificado = await collection.countDocuments({ tipo_acesso: 'certificado' });
            
            // Acessos hoje
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const acessosHoje = await collection.countDocuments({
                data_acesso: { $gte: hoje }
            });
            
            // Acessos na última semana
            const umaSemanaAtras = new Date();
            umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
            const acessosUltimaSemana = await collection.countDocuments({
                data_acesso: { $gte: umaSemanaAtras }
            });

            return {
                total_acessos: totalAcessos,
                acessos_inscricao: acessosInscricao,
                acessos_certificado: acessosCertificado,
                acessos_hoje: acessosHoje,
                acessos_ultima_semana: acessosUltimaSemana
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de acessos:', error);
            throw error;
        }
    }

    /**
     * Busca acessos mais recentes
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista dos acessos mais recentes
     */
    static async buscarRecentes(limit = 5) {
        try {
            const options = {
                sort: { data_acesso: -1 },
                limit: limit
            };

            const acessos = await mongodb.find('acessos_certificados', {}, options);
            return acessos;
        } catch (error) {
            console.error('Erro ao buscar acessos recentes:', error);
            throw error;
        }
    }

    /**
     * Busca todos os acessos enriquecidos com nome do usuário e título do evento
     * @param {number} limit - Limite de resultados
     * @param {number} skip - Quantidade a pular
     * @returns {Promise} Lista de acessos enriquecidos
     */
    static async buscarTodosEnriquecido(limit = 10, skip = 0) {
        try {
            // Buscar acessos do MongoDB
            const acessos = await this.buscarTodos(limit, skip);
            if (!acessos.length) return acessos;

            // Buscar usuários e eventos do PostgreSQL
            const usuarioIds = [...new Set(acessos.map(a => parseInt(a.usuario_id)))];
            const eventoIds = [...new Set(acessos.map(a => parseInt(a.evento_id)))];

            let usuarios = [];
            let eventos = [];
            if (usuarioIds.length) {
                const query = `SELECT id, nome FROM usuarios WHERE id = ANY($1)`;
                const result = await database.query(query, [usuarioIds]);
                usuarios = result.rows;
            }
            if (eventoIds.length) {
                const query = `SELECT id, titulo FROM eventos WHERE id = ANY($1)`;
                const result = await database.query(query, [eventoIds]);
                eventos = result.rows;
            }

            // Mapear para cada acesso o nome do usuário e título do evento
            return acessos.map(a => ({
                ...a,
                usuario: usuarios.find(u => u.id === parseInt(a.usuario_id)) || null,
                evento: eventos.find(e => e.id === parseInt(a.evento_id)) || null
            }));
        } catch (error) {
            console.error('Erro ao buscar acessos enriquecidos:', error);
            throw error;
        }
    }
}

module.exports = AcessoCertificado; 