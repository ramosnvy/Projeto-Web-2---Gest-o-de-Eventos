const database = require('../config/database');

/**
 * Modelo de Evento
 * Gerencia todas as operações relacionadas aos eventos no banco de dados
 */
class Evento {
    /**
     * Cria um novo evento
     * @param {Object} eventoData - Dados do evento
     * @returns {Promise} Evento criado
     */
    static async criar(eventoData) {
        try {
            const { titulo, descricao, data_evento, organizador_id } = eventoData;
            
            const query = `
                INSERT INTO eventos (titulo, descricao, data_evento, organizador_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id, titulo, descricao, data_evento, organizador_id
            `;
            
            const result = await database.query(query, [titulo, descricao, data_evento, organizador_id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            throw error;
        }
    }

    /**
     * Busca todos os eventos
     * @param {number} limit - Limite de resultados
     * @param {number} offset - Offset para paginação
     * @returns {Promise} Lista de eventos
     */
    static async buscarTodos(limit = 10, offset = 0) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id, e.categoria_id,
                       u.nome as organizador_nome,
                       c.nome as categoria_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                LEFT JOIN categorias c ON e.categoria_id = c.id
                ORDER BY e.data_evento DESC
                LIMIT $1 OFFSET $2
            `;
            
            const result = await database.query(query, [limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            throw error;
        }
    }

    /**
     * Busca um evento por ID
     * @param {number} id - ID do evento
     * @returns {Promise} Evento encontrado
     */
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                WHERE e.id = $1
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar evento por ID:', error);
            throw error;
        }
    }

    /**
     * Busca eventos por organizador
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise} Lista de eventos do organizador
     */
    static async buscarPorOrganizador(organizadorId) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                WHERE e.organizador_id = $1
                ORDER BY e.data_evento DESC
            `;
            
            const result = await database.query(query, [organizadorId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca eventos futuros
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de eventos futuros
     */
    static async buscarFuturos(limit = 10) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                WHERE e.data_evento > NOW()
                ORDER BY e.data_evento ASC
                LIMIT $1
            `;
            
            const result = await database.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos futuros:', error);
            throw error;
        }
    }

    /**
     * Atualiza um evento
     * @param {number} id - ID do evento
     * @param {Object} eventoData - Dados para atualização
     * @returns {Promise} Evento atualizado
     */
    static async atualizar(id, eventoData) {
        try {
            const { titulo, descricao, data_evento } = eventoData;
            
            const query = `
                UPDATE eventos
                SET titulo = COALESCE($1, titulo),
                    descricao = COALESCE($2, descricao),
                    data_evento = COALESCE($3, data_evento)
                WHERE id = $4
                RETURNING id, titulo, descricao, data_evento, organizador_id
            `;
            
            const result = await database.query(query, [titulo, descricao, data_evento, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            throw error;
        }
    }

    /**
     * Remove um evento
     * @param {number} id - ID do evento
     * @returns {Promise} Resultado da remoção
     */
    static async remover(id) {
        try {
            const query = `
                DELETE FROM eventos
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover evento:', error);
            throw error;
        }
    }

    /**
     * Verifica se um usuário é organizador do evento
     * @param {number} eventoId - ID do evento
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<boolean>} True se o usuário é organizador
     */
    static async verificarOrganizador(eventoId, usuarioId) {
        try {
            const query = `
                SELECT id FROM eventos
                WHERE id = $1 AND organizador_id = $2
            `;
            
            const result = await database.query(query, [eventoId, usuarioId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar organizador:', error);
            throw error;
        }
    }

    /**
     * Busca eventos com contagem de inscrições
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de eventos com contagem de inscrições
     */
    static async buscarComInscricoes(limit = 10) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id, e.categoria_id,
                       u.nome as organizador_nome,
                       c.nome as categoria_nome,
                       COUNT(i.id) as total_inscricoes
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                LEFT JOIN categorias c ON e.categoria_id = c.id
                LEFT JOIN inscricoes i ON e.id = i.evento_id
                GROUP BY e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id, e.categoria_id, u.nome, c.nome
                ORDER BY e.data_evento DESC
                LIMIT $1
            `;
            
            const result = await database.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos com inscrições:', error);
            throw error;
        }
    }

    /**
     * Busca eventos por período
     * @param {Date} dataInicio - Data de início
     * @param {Date} dataFim - Data de fim
     * @returns {Promise} Lista de eventos no período
     */
    static async buscarPorPeriodo(dataInicio, dataFim) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                WHERE e.data_evento BETWEEN $1 AND $2
                ORDER BY e.data_evento ASC
            `;
            
            const result = await database.query(query, [dataInicio, dataFim]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos por período:', error);
            throw error;
        }
    }

    /**
     * Conta o total de eventos
     * @returns {Promise<number>} Total de eventos
     */
    static async contar() {
        try {
            const query = 'SELECT COUNT(*) as total FROM eventos';
            const result = await database.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar eventos:', error);
            throw error;
        }
    }

    /**
     * Conta eventos por organizador
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise<number>} Total de eventos do organizador
     */
    static async contarPorOrganizador(organizadorId) {
        try {
            const query = 'SELECT COUNT(*) as total FROM eventos WHERE organizador_id = $1';
            const result = await database.query(query, [organizadorId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar eventos por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca eventos recentes
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de eventos recentes
     */
    static async buscarRecentes(limit = 5) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                ORDER BY e.data_evento DESC
                LIMIT $1
            `;
            
            const result = await database.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos recentes:', error);
            throw error;
        }
    }

    /**
     * Busca eventos recentes por organizador
     * @param {number} organizadorId - ID do organizador
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de eventos recentes do organizador
     */
    static async buscarRecentesPorOrganizador(organizadorId, limit = 5) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                WHERE e.organizador_id = $1
                ORDER BY e.data_evento DESC
                LIMIT $2
            `;
            
            const result = await database.query(query, [organizadorId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos recentes por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca eventos por organizador com contagem de inscrições
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise} Lista de eventos do organizador com contagem de inscrições
     */
    static async buscarComInscricoesPorOrganizador(organizadorId) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome,
                       COUNT(i.id) as total_inscricoes
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                LEFT JOIN inscricoes i ON e.id = i.evento_id
                WHERE e.organizador_id = $1
                GROUP BY e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id, u.nome
                ORDER BY e.data_evento DESC
            `;
            
            const result = await database.query(query, [organizadorId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos com inscrições por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca eventos futuros com contagem de inscrições
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de eventos futuros com contagem de inscrições
     */
    static async buscarFuturosComInscricoes(limit = 10) {
        try {
            const query = `
                SELECT e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id,
                       u.nome as organizador_nome,
                       COUNT(i.id) as total_inscricoes
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                LEFT JOIN inscricoes i ON e.id = i.evento_id
                WHERE e.data_evento > NOW()
                GROUP BY e.id, e.titulo, e.descricao, e.data_evento, e.organizador_id, u.nome
                ORDER BY e.data_evento ASC
                LIMIT $1
            `;
            
            const result = await database.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar eventos futuros com inscrições:', error);
            throw error;
        }
    }
}

module.exports = Evento; 