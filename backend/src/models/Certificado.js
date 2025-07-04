const database = require('../config/database');

/**
 * Modelo de Certificado
 * Gerencia todas as operações relacionadas aos certificados no banco de dados
 */
class Certificado {
    /**
     * Cria um novo certificado
     * @param {Object} certificadoData - Dados do certificado
     * @returns {Promise} Certificado criado
     */
    static async criar(certificadoData) {
        try {
            const { inscricao_id } = certificadoData;
            
            const query = `
                INSERT INTO certificados (inscricao_id)
                VALUES ($1)
                RETURNING id, inscricao_id, data_emissao
            `;
            
            const result = await database.query(query, [inscricao_id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar certificado:', error);
            throw error;
        }
    }

    static _addStatus(certificado) {
        if (!certificado) return certificado;
        return { ...certificado, status: 'valido' };
    }

    static _addStatusArray(certificados) {
        return (certificados || []).map(this._addStatus);
    }

    /**
     * Busca todos os certificados
     * @param {number} limit - Limite de resultados
     * @param {number} offset - Offset para paginação
     * @returns {Promise} Lista de certificados
     */
    static async buscarTodos(limit = 10, offset = 0) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                ORDER BY c.data_emissao DESC
                LIMIT $1 OFFSET $2
            `;
            
            const result = await database.query(query, [limit, offset]);
            return this._addStatusArray(result.rows);
        } catch (error) {
            console.error('Erro ao buscar certificados:', error);
            throw error;
        }
    }

    /**
     * Busca um certificado por ID
     * @param {number} id - ID do certificado
     * @returns {Promise} Certificado encontrado
     */
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE c.id = $1
            `;
            
            const result = await database.query(query, [id]);
            return this._addStatus(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar certificado por ID:', error);
            throw error;
        }
    }

    /**
     * Busca certificados por usuário
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise} Lista de certificados do usuário
     */
    static async buscarPorUsuario(usuarioId) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.usuario_id = $1
                ORDER BY c.data_emissao DESC
            `;
            
            const result = await database.query(query, [usuarioId]);
            return this._addStatusArray(result.rows);
        } catch (error) {
            console.error('Erro ao buscar certificados por usuário:', error);
            throw error;
        }
    }

    /**
     * Busca certificados por evento
     * @param {number} eventoId - ID do evento
     * @returns {Promise} Lista de certificados do evento
     */
    static async buscarPorEvento(eventoId) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.evento_id = $1
                ORDER BY c.data_emissao DESC
            `;
            
            const result = await database.query(query, [eventoId]);
            return this._addStatusArray(result.rows);
        } catch (error) {
            console.error('Erro ao buscar certificados por evento:', error);
            throw error;
        }
    }

    /**
     * Busca certificado por inscrição
     * @param {number} inscricaoId - ID da inscrição
     * @returns {Promise} Certificado da inscrição
     */
    static async buscarPorInscricao(inscricaoId) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE c.inscricao_id = $1
            `;
            
            const result = await database.query(query, [inscricaoId]);
            return this._addStatus(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar certificado por inscrição:', error);
            throw error;
        }
    }

    /**
     * Verifica se existe certificado para uma inscrição
     * @param {number} inscricaoId - ID da inscrição
     * @returns {Promise<boolean>} True se existe certificado
     */
    static async verificarCertificado(inscricaoId) {
        try {
            const query = `
                SELECT id FROM certificados
                WHERE inscricao_id = $1
            `;
            
            const result = await database.query(query, [inscricaoId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar certificado:', error);
            throw error;
        }
    }

    /**
     * Remove um certificado
     * @param {number} id - ID do certificado
     * @returns {Promise} Resultado da remoção
     */
    static async remover(id) {
        try {
            const query = `
                DELETE FROM certificados
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover certificado:', error);
            throw error;
        }
    }

    /**
     * Remove certificado por inscrição
     * @param {number} inscricaoId - ID da inscrição
     * @returns {Promise} Resultado da remoção
     */
    static async removerPorInscricao(inscricaoId) {
        try {
            const query = `
                DELETE FROM certificados
                WHERE inscricao_id = $1
                RETURNING id
            `;
            
            const result = await database.query(query, [inscricaoId]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover certificado por inscrição:', error);
            throw error;
        }
    }

    /**
     * Busca certificados por período
     * @param {Date} dataInicio - Data de início
     * @param {Date} dataFim - Data de fim
     * @returns {Promise} Lista de certificados no período
     */
    static async buscarPorPeriodo(dataInicio, dataFim) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE c.data_emissao BETWEEN $1 AND $2
                ORDER BY c.data_emissao DESC
            `;
            
            const result = await database.query(query, [dataInicio, dataFim]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar certificados por período:', error);
            throw error;
        }
    }

    /**
     * Conta o total de certificados
     * @returns {Promise<number>} Total de certificados
     */
    static async contar() {
        try {
            const query = 'SELECT COUNT(*) as total FROM certificados';
            const result = await database.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar certificados:', error);
            throw error;
        }
    }

    /**
     * Conta certificados por usuário
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<number>} Total de certificados do usuário
     */
    static async contarPorUsuario(usuarioId) {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                WHERE i.usuario_id = $1
            `;
            const result = await database.query(query, [usuarioId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar certificados por usuário:', error);
            throw error;
        }
    }

    /**
     * Conta certificados por evento
     * @param {number} eventoId - ID do evento
     * @returns {Promise<number>} Total de certificados do evento
     */
    static async contarPorEvento(eventoId) {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                WHERE i.evento_id = $1
            `;
            const result = await database.query(query, [eventoId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar certificados por evento:', error);
            throw error;
        }
    }

    /**
     * Emite certificado automaticamente para uma inscrição
     * @param {number} inscricaoId - ID da inscrição
     * @returns {Promise} Certificado emitido
     */
    static async emitirCertificado(inscricaoId) {
        try {
            // Verifica se já existe certificado
            const certificadoExistente = await this.verificarCertificado(inscricaoId);
            if (certificadoExistente) {
                throw new Error('Certificado já foi emitido para esta inscrição');
            }

            // Cria o certificado
            return await this.criar({ inscricao_id: inscricaoId });
        } catch (error) {
            console.error('Erro ao emitir certificado:', error);
            throw error;
        }
    }

    /**
     * Conta certificados por organizador
     * @param {number} organizadorId - ID do organizador
     * @returns {Promise<number>} Total de certificados dos eventos do organizador
     */
    static async contarPorOrganizador(organizadorId) {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE e.organizador_id = $1
            `;
            const result = await database.query(query, [organizadorId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar certificados por organizador:', error);
            throw error;
        }
    }

    /**
     * Busca certificados recentes
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de certificados recentes
     */
    static async buscarRecentes(limit = 5) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                ORDER BY c.data_emissao DESC
                LIMIT $1
            `;
            
            const result = await database.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar certificados recentes:', error);
            throw error;
        }
    }

    /**
     * Busca certificados recentes por usuário
     * @param {number} usuarioId - ID do usuário
     * @param {number} limit - Limite de resultados
     * @returns {Promise} Lista de certificados recentes do usuário
     */
    static async buscarRecentesPorUsuario(usuarioId, limit = 5) {
        try {
            const query = `
                SELECT c.id, c.inscricao_id, c.data_emissao,
                       i.usuario_id, i.evento_id,
                       u.nome as usuario_nome, u.email as usuario_email,
                       e.titulo as evento_titulo, e.data_evento
                FROM certificados c
                JOIN inscricoes i ON c.inscricao_id = i.id
                JOIN usuarios u ON i.usuario_id = u.id
                JOIN eventos e ON i.evento_id = e.id
                WHERE i.usuario_id = $1
                ORDER BY c.data_emissao DESC
                LIMIT $2
            `;
            
            const result = await database.query(query, [usuarioId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar certificados recentes por usuário:', error);
            throw error;
        }
    }
}

module.exports = Certificado; 