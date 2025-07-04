const database = require('../config/database');

/**
 * Modelo de Inscrição
 * Gerencia todas as operações relacionadas às inscrições no banco de dados
 */
class Inscricao {
    /**
     * Cria uma nova inscrição
     * @param {Object} inscricaoData - Dados da inscrição
     * @returns {Promise} Inscrição criada
     */
    static async criar(inscricaoData) {
        try {
            const { usuario_id, evento_id, status = 'pendente' } = inscricaoData;
            
            const query = `
                INSERT INTO inscricoes (usuario_id, evento_id, status)
                VALUES ($1, $2, $3)
                RETURNING id, usuario_id, evento_id, data_inscricao, status
            `;
            
            const result = await database.query(query, [usuario_id, evento_id, status]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar inscrição:', error);
            throw error;
        }
    }

    /**
     * Busca todas as inscrições
     * @param {number} limit - Limite de resultados
     * @param {number} offset - Offset para paginação
     * @returns {Promise} Lista de inscrições
     */
    static async buscarTodas(limit = 10, offset = 0) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao, i.status,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                ORDER BY i.data_inscricao DESC
                LIMIT $1 OFFSET $2
            `;
            
            const result = await database.query(query, [limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições:', error);
            throw error;
        }
    }

    /**
     * Busca uma inscrição por ID
     * @param {number} id - ID da inscrição
     * @returns {Promise} Inscrição encontrada
     */
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao, i.status,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.id = $1
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar inscrição por ID:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições por usuário
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise} Lista de inscrições do usuário
     */
    static async buscarPorUsuario(usuarioId) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao, i.status,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento, e.organizador_id
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.usuario_id = $1
                ORDER BY e.data_evento DESC
            `;
            
            const result = await database.query(query, [usuarioId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições por usuário:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições por evento
     * @param {number} eventoId - ID do evento
     * @returns {Promise} Lista de inscrições do evento
     */
    static async buscarPorEvento(eventoId) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao, i.status,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.evento_id = $1
                ORDER BY i.data_inscricao ASC
            `;
            
            const result = await database.query(query, [eventoId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições por evento:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições dos eventos de um organizador
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise} Lista de inscrições dos eventos do organizador
     */
    static async buscarPorOrganizador(organizadorId) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao, i.status,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento, e.organizador_id,
                       c.id as certificado_id, c.data_emissao
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                LEFT JOIN certificados c ON i.id = c.inscricao_id
                WHERE e.organizador_id = $1
                ORDER BY e.data_evento DESC, i.data_inscricao ASC
            `;
            
            const result = await database.query(query, [organizadorId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições por organizador:', error);
            throw error;
        }
    }

    /**
     * Verifica se um usuário está inscrito em um evento
     * @param {number} usuarioId - ID do usuário
     * @param {number} eventoId - ID do evento
     * @returns {Promise<boolean>} True se o usuário está inscrito
     */
    static async verificarInscricao(usuarioId, eventoId) {
        try {
            const query = `
                SELECT id FROM inscricoes
                WHERE usuario_id = $1 AND evento_id = $2
            `;
            
            const result = await database.query(query, [usuarioId, eventoId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar inscrição:', error);
            throw error;
        }
    }

    /**
     * Remove uma inscrição
     * @param {number} id - ID da inscrição
     * @returns {Promise} Resultado da remoção
     */
    static async remover(id) {
        try {
            const query = `
                DELETE FROM inscricoes
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover inscrição:', error);
            throw error;
        }
    }

    /**
     * Remove inscrição por usuário e evento
     * @param {number} usuarioId - ID do usuário
     * @param {number} eventoId - ID do evento
     * @returns {Promise} Resultado da remoção
     */
    static async removerPorUsuarioEvento(usuarioId, eventoId) {
        try {
            const query = `
                DELETE FROM inscricoes
                WHERE usuario_id = $1 AND evento_id = $2
                RETURNING id
            `;
            
            const result = await database.query(query, [usuarioId, eventoId]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover inscrição por usuário e evento:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições com informações de certificados
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise} Lista de inscrições com certificados
     */
    static async buscarComCertificados(usuarioId) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento,
                       c.id as certificado_id, c.data_emissao
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                LEFT JOIN certificados c ON i.id = c.inscricao_id
                WHERE i.usuario_id = $1
                ORDER BY e.data_evento DESC
            `;
            
            const result = await database.query(query, [usuarioId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições com certificados:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições por período
     * @param {Date} dataInicio - Data de início
     * @param {Date} dataFim - Data de fim
     * @returns {Promise} Lista de inscrições no período
     */
    static async buscarPorPeriodo(dataInicio, dataFim) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.data_inscricao BETWEEN $1 AND $2
                ORDER BY i.data_inscricao DESC
            `;
            
            const result = await database.query(query, [dataInicio, dataFim]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições por período:', error);
            throw error;
        }
    }

    /**
     * Conta o total de inscrições
     * @returns {Promise<number>} Total de inscrições
     */
    static async contar() {
        try {
            const query = 'SELECT COUNT(*) as total FROM inscricoes';
            const result = await database.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar inscrições:', error);
            throw error;
        }
    }

    /**
     * Conta inscrições por evento
     * @param {number} eventoId - ID do evento
     * @returns {Promise<number>} Total de inscrições do evento
     */
    static async contarPorEvento(eventoId) {
        try {
            const query = 'SELECT COUNT(*) as total FROM inscricoes WHERE evento_id = $1';
            const result = await database.query(query, [eventoId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar inscrições por evento:', error);
            throw error;
        }
    }

    /**
     * Conta inscrições por usuário
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<number>} Total de inscrições do usuário
     */
    static async contarPorUsuario(usuarioId) {
        try {
            const query = 'SELECT COUNT(*) as total FROM inscricoes WHERE usuario_id = $1';
            const result = await database.query(query, [usuarioId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar inscrições por usuário:', error);
            throw error;
        }
    }

    /**
     * Conta inscrições por organizador
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise<number>} Total de inscrições dos eventos do organizador
     */
    static async contarPorOrganizador(organizadorId) {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM inscricoes i
                JOIN eventos e ON i.evento_id = e.id
                WHERE e.organizador_id = $1
            `;
            const result = await database.query(query, [organizadorId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar inscrições por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições recentes
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de inscrições recentes
     */
    static async buscarRecentes(limit = 5) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                ORDER BY i.data_inscricao DESC
                LIMIT $1
            `;
            
            const result = await database.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições recentes:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições recentes por organizador
     * @param {number} organizadorId - ID do organizador
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de inscrições recentes do organizador
     */
    static async buscarRecentesPorOrganizador(organizadorId, limit = 5) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE e.organizador_id = $1
                ORDER BY i.data_inscricao DESC
                LIMIT $2
            `;
            
            const result = await database.query(query, [organizadorId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições recentes por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições recentes por usuário
     * @param {number} usuarioId - ID do usuário
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de inscrições recentes do usuário
     */
    static async buscarRecentesPorUsuario(usuarioId, limit = 5) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.usuario_id = $1
                ORDER BY i.data_inscricao DESC
                LIMIT $2
            `;
            
            const result = await database.query(query, [usuarioId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições recentes por usuário:', error);
            throw error;
        }
    }

    /**
     * Aprova uma inscrição
     * @param {number} id - ID da inscrição
     * @returns {Promise} Resultado da aprovação
     */
    static async aprovar(id) {
        try {
            const query = `
                UPDATE inscricoes
                SET status = 'aprovada'
                WHERE id = $1
                RETURNING id, usuario_id, evento_id, data_inscricao, status
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao aprovar inscrição:', error);
            throw error;
        }
    }

    /**
     * Rejeita uma inscrição
     * @param {number} id - ID da inscrição
     * @returns {Promise} Resultado da rejeição
     */
    static async rejeitar(id) {
        try {
            const query = `
                UPDATE inscricoes
                SET status = 'rejeitada'
                WHERE id = $1
                RETURNING id, usuario_id, evento_id, data_inscricao, status
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao rejeitar inscrição:', error);
            throw error;
        }
    }

    /**
     * Busca inscrições pendentes de um evento
     * @param {number} eventoId - ID do evento
     * @returns {Promise} Lista de inscrições pendentes
     */
    static async buscarPendentesPorEvento(eventoId) {
        try {
            const query = `
                SELECT i.id, i.usuario_id, i.evento_id, i.data_inscricao, i.status,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM inscricoes i
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.evento_id = $1 AND i.status = 'pendente'
                ORDER BY i.data_inscricao ASC
            `;
            
            const result = await database.query(query, [eventoId]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar inscrições pendentes:', error);
            throw error;
        }
    }
}

module.exports = Inscricao; 